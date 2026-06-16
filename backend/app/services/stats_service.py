"""Service module for calculating wellness statistics and compiling weekly reports."""

from datetime import datetime, timedelta, timezone
from typing import List, Tuple, Dict
from app.models import WellnessEntry

def calculate_total_minutes(entries: List[WellnessEntry]) -> int:
    """Calculate the total practice duration in minutes."""
    return sum(e.duration_minutes for e in entries)

def calculate_session_counts(entries: List[WellnessEntry]) -> Dict[str, int]:
    """Calculate total session count grouped by practice type."""
    counts = {"Yoga": 0, "Meditation": 0, "Breathing": 0}
    for e in entries:
        if e.practice_type in counts:
            counts[e.practice_type] += 1
        else:
            # Fallback for dynamic/other types if any
            counts[e.practice_type] = 1
    return counts

def calculate_average_stress_reduction(entries: List[WellnessEntry]) -> Tuple[float, float, float]:
    """Calculate average stress level before, after, and average reduction percentage.
    
    Percent formula: ((average_stress_before - average_stress_after) / average_stress_before) * 100
    Only considers entries where stress_before > 0.
    
    Returns:
        Tuple of (avg_stress_before, avg_stress_after, avg_reduction_percent)
    """
    valid_entries = [e for e in entries if e.stress_before > 0]
    if not valid_entries:
        return 0.0, 0.0, 0.0

    sum_before = sum(e.stress_before for e in valid_entries)
    sum_after = sum(e.stress_after for e in valid_entries)
    count = len(valid_entries)

    avg_before = sum_before / count
    avg_after = sum_after / count

    if avg_before > 0:
        reduction_pct = ((avg_before - avg_after) / avg_before) * 100
    else:
        reduction_pct = 0.0

    return round(avg_before, 1), round(avg_after, 1), round(reduction_pct, 1)

def calculate_yoga_impact_score(entries: List[WellnessEntry]) -> int:
    """Calculate a simple wellness product score between 0 and 100.
    
    Based on consistency streak, total practice minutes, stress reduction, and yoga frequency.
    """
    if not entries:
        return 0

    streak = calculate_consistency_streak(entries)
    total_minutes = calculate_total_minutes(entries)
    _, _, reduction_pct = calculate_average_stress_reduction(entries)
    counts = calculate_session_counts(entries)
    yoga_count = counts.get("Yoga", 0)

    # Weights: Consistency (30%), Minutes (30%), Stress (30%), Yoga count (10%)
    streak_points = min(streak * 10, 30)
    minutes_points = min(total_minutes * 0.5, 30)
    stress_points = min(reduction_pct * 0.3, 30)
    yoga_points = min(yoga_count * 5, 10)

    total_score = int(streak_points + minutes_points + stress_points + yoga_points)
    return max(0, min(total_score, 100))

def calculate_consistency_streak(entries: List[WellnessEntry]) -> int:
    """Calculate the consecutive days count with at least one entry logged.
    
    Converts timestamps to host local time to properly assess user days.
    """
    if not entries:
        return 0

    # Extract unique dates in system local time
    dates = sorted({e.created_at.astimezone().date() for e in entries}, reverse=True)
    if not dates:
        return 0

    today = datetime.now().date()
    yesterday = today - timedelta(days=1)

    # Streak is active only if most recent entry is today or yesterday
    if dates[0] != today and dates[0] != yesterday:
        return 0

    streak = 1
    for i in range(len(dates) - 1):
        if (dates[i] - dates[i + 1]).days == 1:
            streak += 1
        elif (dates[i] - dates[i + 1]).days > 1:
            break  # Streak broken
            
    return streak

def calculate_weekly_minutes(entries: List[WellnessEntry]) -> Dict[str, int]:
    """Group total practice minutes by weekday in local time."""
    days_map = {0: 'Mon', 1: 'Tue', 2: 'Wed', 3: 'Thu', 4: 'Fri', 5: 'Sat', 6: 'Sun'}
    weekly_minutes = {day: 0 for day in days_map.values()}

    for e in entries:
        local_dt = e.created_at.astimezone()
        weekday_name = days_map[local_dt.weekday()]
        weekly_minutes[weekday_name] += e.duration_minutes
        
    return weekly_minutes

def calculate_best_practice_type(entries: List[WellnessEntry]) -> str:
    """Choose the practice type with the highest count.
    
    If there is a tie, chooses the one with the highest average stress reduction.
    """
    if not entries:
        return "None"

    counts = {}
    for e in entries:
        counts[e.practice_type] = counts.get(e.practice_type, 0) + 1

    if not counts:
        return "None"

    max_count = max(counts.values())
    candidates = [ptype for ptype, count in counts.items() if count == max_count]

    if len(candidates) == 1:
        return candidates[0]

    # Handle tie-breaker by looking at stress reduction
    best_candidate = candidates[0]
    best_reduction = -999.0

    for c in candidates:
        c_entries = [e for e in entries if e.practice_type == c]
        _, _, reduction_pct = calculate_average_stress_reduction(c_entries)
        if reduction_pct > best_reduction:
            best_reduction = reduction_pct
            best_candidate = c

    return best_candidate

def calculate_average_sleep_quality(entries: List[WellnessEntry]) -> float:
    """Calculate the average sleep quality rating."""
    if not entries:
        return 0.0
    return round(sum(e.sleep_quality for e in entries) / len(entries), 1)

def calculate_average_energy_change(entries: List[WellnessEntry]) -> float:
    """Calculate average energy level change (average after - average before)."""
    if not entries:
        return 0.0
    avg_before = sum(e.energy_before for e in entries) / len(entries)
    avg_after = sum(e.energy_after for e in entries) / len(entries)
    return round(avg_after - avg_before, 1)

def build_dashboard_stats(entries: List[WellnessEntry]) -> dict:
    """Build the final dictionary structure for the Dashboard stats endpoint."""
    total_minutes = calculate_total_minutes(entries)
    total_sessions = len(entries)
    consistency_streak = calculate_consistency_streak(entries)
    yoga_impact_score = calculate_yoga_impact_score(entries)
    
    avg_stress_before, avg_stress_after, reduction_pct = calculate_average_stress_reduction(entries)
    
    valid_entries = [e for e in entries if e.energy_before > 0] # Keep safety checks
    avg_energy_before = round(sum(e.energy_before for e in entries) / len(entries), 1) if entries else 0.0
    avg_energy_after = round(sum(e.energy_after for e in entries) / len(entries), 1) if entries else 0.0
    energy_change = calculate_average_energy_change(entries)
    
    avg_sleep = calculate_average_sleep_quality(entries)
    
    weekly_minutes = calculate_weekly_minutes(entries)
    session_counts = calculate_session_counts(entries)

    return {
        "total_minutes": total_minutes,
        "total_sessions": total_sessions,
        "consistency_streak": consistency_streak,
        "yoga_impact_score": yoga_impact_score,
        "average_stress_before": avg_stress_before,
        "average_stress_after": avg_stress_after,
        "average_stress_reduction_percent": reduction_pct,
        "average_energy_before": avg_energy_before,
        "average_energy_after": avg_energy_after,
        "average_energy_change": energy_change,
        "average_sleep_quality": avg_sleep,
        "weekly_minutes_by_day": weekly_minutes,
        "session_counts_by_type": session_counts
    }

def build_weekly_report(entries: List[WellnessEntry]) -> dict:
    """Build the final dictionary structure for the Weekly Report endpoint."""
    total_minutes = calculate_total_minutes(entries)
    total_sessions = len(entries)
    
    counts = calculate_session_counts(entries)
    yoga_sessions = counts.get("Yoga", 0)
    meditation_sessions = counts.get("Meditation", 0)
    breathing_sessions = counts.get("Breathing", 0)
    
    _, _, reduction_pct = calculate_average_stress_reduction(entries)
    best_practice = calculate_best_practice_type(entries)
    avg_sleep = calculate_average_sleep_quality(entries)
    energy_change = calculate_average_energy_change(entries)

    # Compile adaptive goal based on rules (with safe wellness language)
    if total_sessions < 3:
        goal = "Try 2–3 short mindful sessions next week. Small practices can support your regular daily baseline."
    elif reduction_pct < 15:
        goal = "Try one 5-minute breathing reset after a busy day. Paced breathing may support physical ease."
    elif avg_sleep < 6:
        goal = "Try an evening stretch or sleep meditation before bedtime. Gentle transitions may support resting rhythms."
    elif yoga_sessions >= 3:
        goal = "Continue with gentle yoga and add one short reflection. Pausing to log how you feel may support awareness."
    else:
        goal = "Your data suggests maintaining your current balance flow practice. Mindful practices support steady balance."

    return {
        "total_practice_minutes": total_minutes,
        "total_sessions": total_sessions,
        "yoga_sessions": yoga_sessions,
        "meditation_sessions": meditation_sessions,
        "breathing_sessions": breathing_sessions,
        "average_stress_reduction_percent": reduction_pct,
        "best_practice_type": best_practice,
        "average_sleep_quality": avg_sleep,
        "average_energy_change": energy_change,
        "gentle_next_week_goal": goal
    }
