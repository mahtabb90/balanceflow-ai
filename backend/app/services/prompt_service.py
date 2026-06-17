"""Service for constructing Gemini AI prompts with safety rules and structured output formats."""

from typing import List, Dict, Any
from app.models import WellnessEntry

def build_insights_prompt(
    entries: List[WellnessEntry],
    stats: Dict[str, Any],
    report: Dict[str, Any]
) -> str:
    """Build a structured and safe prompt for the Gemini model."""
    entry_count = len(entries)
    
    # Serialize the recent entries (up to last 10 entries) to prevent prompt bloat while providing enough context
    recent_entries_str = []
    for i, e in enumerate(entries[:10], start=1):
        reflection_clean = e.reflection.replace("\n", " ").strip() if e.reflection else "None"
        recent_entries_str.append(
            f"- Entry {i}: Practice: {e.practice_type} ({e.practice_title}), "
            f"Duration: {e.duration_minutes}m, Intensity: {e.intensity}, "
            f"Mood: {e.mood_before} -> {e.mood_after}, "
            f"Energy: {e.energy_before}/10 -> {e.energy_after}/10, "
            f"Stress: {e.stress_before}/10 -> {e.stress_after}/10, "
            f"Sleep Quality: {e.sleep_quality}/10. "
            f"Reflection: \"{reflection_clean}\""
        )
    
    recent_entries_text = "\n".join(recent_entries_str) if recent_entries_str else "No recent entries."
    
    # Select sample-size aware rules to inject into the prompt
    sample_size_instructions = ""
    if entry_count == 1:
        first_entry = entries[0] if entries else None
        stress_b = first_entry.stress_before if first_entry else 0
        stress_a = first_entry.stress_after if first_entry else 0
        sample_size_instructions = f"""
SAMPLE-SIZE AWARE RULES (Exactly 1 entry is logged):
- The user has only logged their first practice session. This is an early starting point.
- Use early-start language: e.g., "You have logged your first practice session...", "This is an early starting point...", "Continue logging to see whether this becomes a pattern."
- Do NOT use terms: "strong", "significant", "consistent", "correlation", "correlate", "recurring", "weekly pattern", "trends".
- Avoid overly emotional or enthusiastic words like "wonderful", "lovely", "amazing", "great", "excellent". Keep the tone professional, supportive, calm, and human-centered.
- For `stress_trend_insight`, write EXACTLY: "Your early log shows stress changed from {stress_b} to {stress_a} after practice. More logs are needed to understand the pattern."
- For `sleep_energy_connection`, write EXACTLY: "Sleep and energy patterns will become clearer as you continue logging."
- For `reflection_summary`, describe their single reflection calmly: "Your reflection mentions themes such as [theme from entry]." Do not use the term "recurring themes".
"""
    elif entry_count == 2:
        stress_b = stats.get('average_stress_before', 0.0)
        stress_a = stats.get('average_stress_after', 0.0)
        sample_size_instructions = f"""
SAMPLE-SIZE AWARE RULES (Exactly 2 entries are logged):
- The user has logged exactly two sessions. This is an early or initial starting point.
- Use early pattern language: e.g., "early pattern" or "initial pattern".
- Avoid strong conclusions or definitive statements about habits or regular behavior.
- Do NOT use terms: "strong", "significant", "consistent", "correlation", "correlate", "recurring", "weekly pattern", "trends".
- Avoid overly emotional or enthusiastic words like "wonderful", "lovely", "amazing". Keep the tone professional, supportive, calm, and human-centered.
- For `stress_trend_insight`, write EXACTLY: "Your early log shows stress changed from {stress_b} to {stress_a} after practice. More logs are needed to understand the pattern."
- For `sleep_energy_connection`, write EXACTLY: "Sleep and energy patterns will become clearer as you continue logging."
"""
    elif 3 <= entry_count <= 4:
        sample_size_instructions = """
SAMPLE-SIZE AWARE RULES (3 to 4 entries are logged):
- Use cautious trend language: e.g., "Your data suggests...", "A pattern may be forming...", "You may notice...".
- Do NOT use terms: "significant reduction", "correlation", "correlate", "weekly pattern".
- For `sleep_energy_connection`, write EXACTLY: "Sleep and energy patterns will become clearer as you continue logging."
"""
    elif 5 <= entry_count <= 6:
        sample_size_instructions = """
SAMPLE-SIZE AWARE RULES (5 to 6 entries are logged):
- Use cautious trend language: e.g., "Your data suggests...", "A pattern may be forming...", "You may notice...".
- You may explain how sleep quality and energy changes correlate with practices using gentle phrasing.
- Do NOT use "weekly pattern" language.
"""
    else: # entry_count >= 7
        sample_size_instructions = """
SAMPLE-SIZE AWARE RULES (7+ entries are logged):
- You may use "weekly pattern" or "consistent" language.
- You may highlight correlations and stress reduction trends.
"""

    prompt = f"""You are a professional, supportive, and calm wellness reflection assistant for BalanceFlow, a Mindful Wellness Companion.
Your task is to analyze the user's recent wellness entries, dashboard statistics, and weekly report to generate personalized, mindful insights.

IMPORTANT SAFETY & TONE RULES:
1. Tone must be professional, calm, supportive, and human-centered. Do not use overly emotional, enthusiastic, or flowery words (e.g., avoid "wonderful", "lovely", "amazing", "celebrate").
2. You must not provide medical advice.
3. You must not diagnose, treat, or cure any mental or physical conditions.
4. You must not use medical, clinical, or formal therapy language (e.g., avoid terms like "clinical depression", "therapy", "clinical anxiety", "treatment", "diagnose", "symptom").
5. You must not mention spiritual or alternative healing concepts such as "chakras", "spiritual healing", "auras", or "energy blocks".
6. Focus your language on yoga, meditation, paced breathing, stress management, sleep, energy level reflection, and consistency.
7. Use gentle, non-authoritative phrasing like:
   - "Your data suggests..."
   - "You may notice..."
   - "A gentle goal could be..."
   - "This pattern may indicate..."

{sample_size_instructions}

DATA TO ANALYZE:

--- RECENT WELLNESS ENTRIES ---
{recent_entries_text}

--- DASHBOARD STATS ---
- Total Practice Minutes: {stats.get('total_minutes', 0)}
- Total Sessions: {stats.get('total_sessions', 0)}
- Current Consistency Streak: {stats.get('consistency_streak', 0)} days
- Yoga Impact Score: {stats.get('yoga_impact_score', 0)}/100
- Average Stress Before: {stats.get('average_stress_before', 0.0)}/10
- Average Stress After: {stats.get('average_stress_after', 0.0)}/10
- Average Stress Reduction: {stats.get('average_stress_reduction_percent', 0.0)}%
- Average Sleep Quality: {stats.get('average_sleep_quality', 0.0)}/10
- Average Energy Change: {stats.get('average_energy_change', 0.0):+g}

--- WEEKLY REPORT ---
- Best Practice Type: {report.get('best_practice_type', 'None')}
- Yoga Sessions: {report.get('yoga_sessions', 0)}
- Meditation Sessions: {report.get('meditation_sessions', 0)}
- Breathing Sessions: {report.get('breathing_sessions', 0)}
- Gentle Next Week Goal (Rule-based suggestion): {report.get('gentle_next_week_goal', '')}

OUTPUT FORMAT:
You must respond ONLY with a valid JSON object. Do not include any normal chat text. The JSON object must match this schema exactly:
{{
  "pattern_summary": "...",
  "gentle_recommendation": "...",
  "stress_trend_insight": "...",
  "sleep_energy_connection": "...",
  "reflection_summary": "...",
  "next_week_focus": "...",
  "disclaimer": "These insights are for personal awareness and are not medical advice."
}}
"""
    return prompt

