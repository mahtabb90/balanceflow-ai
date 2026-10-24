"""Small in-memory abuse protection for the public stateless endpoint.

State is per process. With several workers each keeps its own counters, so the
limits are a safeguard rather than a precise quota.
"""

import threading
import time
from collections import OrderedDict, deque
from datetime import datetime, timezone
from typing import Deque, Optional


class SlidingWindowLimiter:
    """Allow at most `limit` hits per `window_seconds` for each key."""

    def __init__(self, limit: int, window_seconds: int = 60, max_keys: int = 10_000):
        self.limit = limit
        self.window = window_seconds
        self.max_keys = max_keys
        self._hits: "OrderedDict[str, Deque[float]]" = OrderedDict()
        self._lock = threading.Lock()

    def allow(self, key: str, now: Optional[float] = None) -> bool:
        now = time.monotonic() if now is None else now
        with self._lock:
            hits = self._hits.get(key)
            if hits is None:
                hits = self._hits[key] = deque()
                while len(self._hits) > self.max_keys:
                    self._hits.popitem(last=False)
            else:
                self._hits.move_to_end(key)
            while hits and now - hits[0] >= self.window:
                hits.popleft()
            if len(hits) >= self.limit:
                return False
            hits.append(now)
            return True

    def reset(self) -> None:
        with self._lock:
            self._hits.clear()


class DailyBudget:
    """Global per-UTC-day counter that caps paid Gemini calls."""

    def __init__(self, limit: int):
        self.limit = limit
        self._day: Optional[str] = None
        self._used = 0
        self._lock = threading.Lock()

    def try_consume(self) -> bool:
        today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        with self._lock:
            if self._day != today:
                self._day, self._used = today, 0
            if self._used >= self.limit:
                return False
            self._used += 1
            return True

    def reset(self) -> None:
        with self._lock:
            self._day, self._used = None, 0
