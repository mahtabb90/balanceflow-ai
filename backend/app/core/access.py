"""Access control for routes that touch the shared database.

BalanceFlow has no user accounts or record ownership yet, so every record in the
shared database is effectively public. These routes therefore stay closed.

Feature flags are deliberately NOT sufficient to open them. Access requires all of:
  1. a non-production environment (APP_ENV=development),
  2. ENABLE_SHARED_DATA_API=true,
  3. an authenticated principal.

Step 3 can never be satisfied today because get_authenticated_principal always
returns None. When real authentication is added, implement it there and add
ownership filtering to the queries before relaxing anything else.
"""

from typing import Optional

from fastapi import Depends, HTTPException, status

from app.core import config


def get_authenticated_principal() -> Optional[str]:
    """Return the authenticated user id, or None. Authentication is not implemented yet."""
    return None


def require_shared_data_access(principal: Optional[str] = Depends(get_authenticated_principal)) -> str:
    """Deny access to shared database records unless every condition is met."""
    if config.is_production() or not config.ENABLE_SHARED_DATA_API or principal is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Shared data access is disabled.",
        )
    return principal


def require_destructive_access(principal: str = Depends(require_shared_data_access)) -> str:
    """Additionally gate bulk-destructive routes (never available in production)."""
    if config.is_production() or not config.ENABLE_DESTRUCTIVE_ENDPOINTS:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This operation is disabled.",
        )
    return principal
