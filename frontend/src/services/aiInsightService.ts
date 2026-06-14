import type { WellnessEntry } from '../types/wellness';

export interface InsightItem {
  badge: string;
  content: string;
}

export interface ReflectionInsightItem extends InsightItem {
  prompt: string;
}

export interface AIInsightResult {
  pattern: InsightItem;
  recommendation: InsightItem;
  stress: InsightItem;
  sleep: InsightItem;
  reflection: ReflectionInsightItem;
  focus: InsightItem;
}

const THEMES_LIST = ['calm', 'tired', 'stress', 'sleep', 'focus', 'energy', 'gratitude', 'tension', 'balance'];

const THEME_DISPLAY_NAMES: Record<string, string> = {
  calm: 'Calm',
  tired: 'Tired',
  stress: 'Stress',
  sleep: 'Sleep',
  focus: 'Focus',
  energy: 'Energy',
  gratitude: 'Gratitude',
  tension: 'Tension',
  balance: 'Balance'
};

/**
 * Generates the weekly practice pattern summary.
 */
export function generateWeeklyInsight(entries: WellnessEntry[]): InsightItem {
  if (entries.length === 0) {
    return { badge: "Early Pattern", content: "" };
  }

  const totalMinutes = entries.reduce((sum, item) => sum + item.duration, 0);
  const sessionWord = entries.length === 1 ? "session" : "sessions";
  const content = `This week you completed ${totalMinutes} minutes across ${entries.length} ${sessionWord}. Your consistency suggests a healthy mindfulness routine and a growing wellness habit.`;

  if (entries.length >= 1 && entries.length <= 2) {
    return { badge: "Early Pattern", content };
  }

  let badge = "Weekly Pattern";
  if (entries.length >= 5) {
    badge = "Strong Signal";
  }

  return { badge, content };
}

/**
 * Generates recommendation based on the user's most consistent practice types.
 */
export function generateRecommendation(entries: WellnessEntry[]): InsightItem {
  if (entries.length === 0) {
    return { badge: "Gentle Suggestion", content: "" };
  }

  if (entries.length >= 1 && entries.length <= 2) {
    return {
      badge: "Gentle Suggestion",
      content: "A gentle goal could be logging 2–3 sessions this week. This supports your emerging self-care habit."
    };
  }

  const yogaCount = entries.filter(e => e.type === 'Yoga').length;
  const medCount = entries.filter(e => e.type === 'Meditation').length;
  const breathCount = entries.filter(e => e.type === 'Breathing').length;

  let favoriteType = 'Yoga';
  let maxCount = yogaCount;
  let recContent = "Yoga appears to be your most consistent practice type this week. Continuing with gentle flows may support your daily balance.";

  if (medCount > maxCount) {
    favoriteType = 'Meditation';
    maxCount = medCount;
    recContent = "Meditation sequences appear to be your most consistent practice type this week. Continuing with seated pauses may support mental clarity.";
  }
  if (breathCount > maxCount) {
    favoriteType = 'Breathing';
    maxCount = breathCount;
    recContent = "Breathing resets appear to be your most consistent practice type this week. Continuing with rhythmic breathing may support natural recovery.";
  }

  if (breathCount > 0 && favoriteType !== 'Breathing') {
    recContent += " Additionally, incorporating short breathing resets during afternoon dips may support daily focus.";
  }

  return { badge: "Gentle Suggestion", content: recContent };
}

/**
 * Extracts and formats common reflection themes from the logs.
 */
export function analyzeReflectionThemes(entries: WellnessEntry[]): ReflectionInsightItem {
  if (entries.length === 0) {
    return { badge: "Reflection Theme", content: "", prompt: "" };
  }

  const prompt = entries.length <= 2 
    ? "How did you feel right after your last session compared to before?"
    : "What does 'finding quiet' mean to you in the context of your daily routine?";

  const matchedThemes: string[] = [];
  entries.forEach(e => {
    if (e.reflection) {
      const text = e.reflection.toLowerCase();
      THEMES_LIST.forEach(theme => {
        if (text.includes(theme) && !matchedThemes.includes(theme)) {
          matchedThemes.push(theme);
        }
      });
    }
  });

  let content = "Continue logging reflections to discover recurring wellness themes.";
  let badge = "Early Pattern";

  if (matchedThemes.length > 0) {
    const capitalized = matchedThemes.map(t => THEME_DISPLAY_NAMES[t] || t);
    if (capitalized.length === 1) {
      content = `Common theme observed this week:\n• ${capitalized[0]}`;
    } else {
      content = `Common themes observed this week:\n${capitalized.map(t => `• ${t}`).join('\n')}`;
    }
    badge = "Reflection Theme";
  }

  return { badge, content, prompt };
}

/**
 * Generates focus area suggestion for the upcoming week.
 */
export function generateNextWeekFocus(entries: WellnessEntry[]): InsightItem {
  if (entries.length === 0) {
    return { badge: "Gentle Suggestion", content: "" };
  }

  if (entries.length >= 1 && entries.length <= 2) {
    return {
      badge: "Gentle Suggestion",
      content: "Try 2 short sessions this week. Select beginner yoga flows or quick breathing resets in the library."
    };
  }

  const avgStressBefore = entries.reduce((sum, item) => sum + item.stressBefore, 0) / entries.length;
  const avgStressAfter = entries.reduce((sum, item) => sum + item.stressAfter, 0) / entries.length;
  const avgSleep = entries.reduce((sum, item) => sum + item.sleepQuality, 0) / entries.length;
  const yogaCount = entries.filter(e => e.type === 'Yoga').length;

  let focusContent = "A gentle goal could be incorporating 2 short sessions this week to establish your wellness rhythm.";
  if (avgSleep < 6.0) {
    focusContent = "Try an evening stretch or sleep meditation. Focus on quiet breathing before rest to support recovery.";
  } else if (avgStressBefore >= 5.0 || avgStressAfter >= 5.0) {
    focusContent = "Try one 5-minute breathing reset after a stressful day. Focus on slow, regular cycles to soothe physical tension.";
  } else if (yogaCount >= 2) {
    focusContent = "Continue with 3 gentle yoga sessions. Consistent movement supports posture alignment and mobility.";
  }

  return { badge: "Gentle Suggestion", content: focusContent };
}

/**
 * Generates stress trend insight.
 */
export function generateStressTrendInsight(entries: WellnessEntry[]): InsightItem {
  if (entries.length === 0) {
    return { badge: "Early Pattern", content: "" };
  }

  if (entries.length >= 1 && entries.length <= 2) {
    return {
      badge: "Early Pattern",
      content: "Notice how your stress changes before and after each practice. Paying attention to these shifts supports body tension release."
    };
  }

  const avgStressBefore = entries.reduce((sum, item) => sum + item.stressBefore, 0) / entries.length;
  const avgStressAfter = entries.reduce((sum, item) => sum + item.stressAfter, 0) / entries.length;

  let content = "Observe how your stress changes before and after sessions. Paying attention to these shifts may support body tension awareness.";
  let badge = "Early Pattern";

  if (avgStressAfter < avgStressBefore) {
    const stressReductionPercent = Math.round(((avgStressBefore - avgStressAfter) / avgStressBefore) * 100);
    content = `Your data suggests your sessions may be connected with lower stress after practice. On average, your logged tension decreases by ${stressReductionPercent}%.`;
    badge = "Strong Signal";
  }

  return { badge, content };
}

/**
 * Generates sleep quality & energy levels connection insight.
 */
export function generateSleepEnergyInsight(entries: WellnessEntry[]): InsightItem {
  if (entries.length === 0) {
    return { badge: "Early Pattern", content: "" };
  }

  if (entries.length >= 1 && entries.length <= 2) {
    return {
      badge: "Early Pattern",
      content: "Notice how your daily energy changes after resting. Connecting sleep quality with daytime energy helps map your recovery rhythm."
    };
  }

  const avgSleep = entries.reduce((sum, item) => sum + item.sleepQuality, 0) / entries.length;

  let content = "";
  let badge = "Early Pattern";

  if (avgSleep >= 7.0) {
    content = "Your sleep logs suggest a steady recovery rhythm this week. You may notice higher energy levels on days following deep rest.";
    badge = "Strong Signal";
  } else {
    content = "Your sleep logs suggest your recovery rhythm has room to settle. Try aligning evening stretches or breathing resets to support quiet rest.";
  }

  return { badge, content };
}

/**
 * Aggregates all insights into a single AIInsightResult structure.
 */
export function getAIInsights(entries: WellnessEntry[]): AIInsightResult {
  return {
    pattern: generateWeeklyInsight(entries),
    recommendation: generateRecommendation(entries),
    stress: generateStressTrendInsight(entries),
    sleep: generateSleepEnergyInsight(entries),
    reflection: analyzeReflectionThemes(entries),
    focus: generateNextWeekFocus(entries)
  };
}
