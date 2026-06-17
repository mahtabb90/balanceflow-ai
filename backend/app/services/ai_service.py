"""Service module for invoking Gemini AI to get insights, with a safe rule-based fallback."""

import json
from typing import List, Dict, Any
from google import genai
from google.genai import types

from app.core import config
from app.models import WellnessEntry
from app.services import stats_service, prompt_service

def extract_json_object(s: str) -> str:
    """Extract a JSON object from text by finding the first '{' and last '}'."""
    start = s.find('{')
    end = s.rfind('}')
    if start != -1 and end != -1 and end > start:
        return s[start:end+1]
    return s

def generate_fallback_insights(entries: List[WellnessEntry], stats: Dict[str, Any], report: Dict[str, Any]) -> Dict[str, Any]:
    """Generate safe, sample-size-aware, rule-based fallback wellness insights."""
    count = len(entries)
    best_practice = report.get("best_practice_type", "None")
    total_sessions = report.get("total_sessions", 0)
    yoga_sessions = report.get("yoga_sessions", 0)
    meditation_sessions = report.get("meditation_sessions", 0)
    breathing_sessions = report.get("breathing_sessions", 0)
    
    # 1. Pattern Summary
    if count == 0:
        pattern_summary = "Your insights will grow with your practice."
    elif count == 1:
        pattern_summary = "You have logged your first practice session. This is the beginning of your BalanceFlow pattern."
    elif count == 2:
        pattern_summary = f"You have logged two sessions, focusing on {best_practice}. This is an early pattern starting to emerge in your wellness logs."
    elif count < 7:
        if best_practice == "Yoga":
            pattern_summary = f"Your logs suggest a growing focus on Yoga. You have completed {yoga_sessions} Yoga sessions, helping build your practice routine."
        elif best_practice == "Meditation":
            pattern_summary = f"Your logs suggest a focus on Meditation. You have completed {meditation_sessions} Meditation sessions, supporting quiet presence."
        elif best_practice == "Breathing":
            pattern_summary = f"Your logs suggest a focus on breathing exercises. You have completed {breathing_sessions} Breathing sessions, assisting in conscious pauses."
        else:
            pattern_summary = f"Your logs suggest you are exploring different wellness practices. You have completed {total_sessions} sessions in total, building your routine."
    else:  # count >= 7
        if best_practice == "Yoga":
            pattern_summary = f"Your weekly pattern shows a consistent dedication to Yoga. With {yoga_sessions} Yoga sessions, you are building a steady mindful routine."
        elif best_practice == "Meditation":
            pattern_summary = f"Your weekly pattern indicates a regular dedication to Meditation. With {meditation_sessions} Meditation sessions, you support mental clarity and presence."
        elif best_practice == "Breathing":
            pattern_summary = f"Your weekly pattern indicates a commitment to breathing exercises. With {breathing_sessions} Breathing sessions, you are supporting conscious physical resets."
        else:
            pattern_summary = f"Your weekly pattern suggests a diverse and consistent wellness routine. You have completed {total_sessions} sessions across different practices."

    # 2. Gentle Recommendation
    streak = stats.get("consistency_streak", 0)
    reduction_pct = stats.get("average_stress_reduction_percent", 0.0)
    
    if count <= 2:
        gentle_recommendation = "A gentle goal could be to practice consistently for just 5-10 minutes. Small daily logs can support your early wellness routine."
    elif streak >= 3:
        gentle_recommendation = f"A gentle goal could be to maintain your active {streak}-day practice streak. Logging even a 5-minute session keeps your momentum going."
    elif reduction_pct >= 20.0:
        gentle_recommendation = f"You may notice a stress reduction of {reduction_pct}% after your practices. A gentle goal could be to schedule a brief session on days when you anticipate higher stress."
    else:
        gentle_recommendation = "A gentle goal could be to try adding one small practice to your week. Finding steady moments support a steady habit."

    # 3. Stress Trend Insight
    avg_stress_before = stats.get("average_stress_before", 0.0)
    avg_stress_after = stats.get("average_stress_after", 0.0)
    
    if count == 0:
        stress_trend_insight = "Stress trends will appear after you log practice sessions."
    elif count <= 2:
        stress_trend_insight = f"Your early logs show stress changed from {avg_stress_before} to {avg_stress_after} after practice. Continue logging to see if this becomes a pattern."
    else:
        if avg_stress_before > 0:
            stress_trend_insight = f"Your data suggests your sessions may be connected with lower stress after practice. Stress typically drops by {reduction_pct}% post-session."
        else:
            stress_trend_insight = "Stress trends are currently stable. Continuing to track your stress will build a clearer view over time."

    # 4. Sleep and Energy Connection
    avg_sleep = stats.get("average_sleep_quality", 0.0)
    energy_change = stats.get("average_energy_change", 0.0)
    
    if count == 0:
        sleep_energy_connection = "Sleep and energy patterns will appear as you continue tracking."
    elif count < 5:
        sleep_energy_connection = "Sleep and energy patterns will become clearer as you log more sessions."
    else:
        if avg_sleep > 0:
            sleep_energy_connection = f"Your data suggests that days following sleep quality ratings near {avg_sleep}/10 correlate with steady energy. Practices show an average energy change of {energy_change:+g} points, indicating a gentle lift in vitality."
        else:
            sleep_energy_connection = "Sleep and energy patterns will become clearer as you continue tracking."

    # 5. Reflection Summary
    # Check non-empty reflections
    reflections = [e.reflection.strip() for e in entries if e.reflection and e.reflection.strip()]
    if not reflections:
        reflection_summary = "Add short reflections when logging to discover recurring themes and mindfulness thoughts."
    elif len(reflections) == 1:
        ref_text = reflections[0]
        snippet = ref_text[:50] + "..." if len(ref_text) > 50 else ref_text
        reflection_summary = f"Your reflection mentions: \"{snippet}\". Reflecting on single sessions is a great start to self-observation."
    else:
        reflection_summary = "Your reflections show a dedication to self-observation. You may notice recurring themes in your notes, pointing to a growing awareness of your mental and physical state."

    # 6. Next Week Focus
    next_week_focus = report.get("gentle_next_week_goal", "Try one short mindful session to begin building your BalanceFlow pattern.")

    return {
        "source": "fallback",
        "pattern_summary": pattern_summary,
        "gentle_recommendation": gentle_recommendation,
        "stress_trend_insight": stress_trend_insight,
        "sleep_energy_connection": sleep_energy_connection,
        "reflection_summary": reflection_summary,
        "next_week_focus": next_week_focus,
        "disclaimer": "These insights are for personal awareness and are not medical advice."
    }


def generate_ai_insights(entries: List[WellnessEntry]) -> Dict[str, Any]:
    """Generate wellness insights. Calls Gemini if key is present; falls back to rule-based logic if missing or errors occur."""
    stats = stats_service.build_dashboard_stats(entries)
    report = stats_service.build_weekly_report(entries)
    
    if not config.GEMINI_API_KEY:
        print("Using fallback AI insights")
        return generate_fallback_insights(entries, stats, report)
        
    try:
        # Build prompt using prompt_service
        prompt = prompt_service.build_insights_prompt(entries, stats, report)
        
        # Initialize Gemini Client and call
        client = genai.Client(api_key=config.GEMINI_API_KEY)
        
        response = client.models.generate_content(
            model=config.GEMINI_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
            )
        )
        
        # Parse output robustly
        text = response.text
        if not text:
            raise ValueError("Empty response received from Gemini.")
            
        cleaned_text = extract_json_object(text)
        data = json.loads(cleaned_text)
        
        # Ensure all required keys are present
        required_keys = [
            "pattern_summary",
            "gentle_recommendation",
            "stress_trend_insight",
            "sleep_energy_connection",
            "reflection_summary",
            "next_week_focus",
            "disclaimer"
        ]
        
        for key in required_keys:
            if key not in data:
                data[key] = "Insight unavailable."
                
        # Set source to gemini
        data["source"] = "gemini"
        
        print("Using Gemini AI insights")
        return data
        
    except Exception as e:
        print(f"Error calling Gemini or parsing response: {e}")
        print("Using fallback AI insights")
        return generate_fallback_insights(entries, stats, report)
