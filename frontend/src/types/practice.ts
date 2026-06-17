export interface PracticeStep {
  pose_name: string;
  duration_minutes: number;
  instruction: string;
  breath_cue: string;
  intention: string;
}

export interface Practice {
  id: string;
  title: string;
  type: 'Yoga' | 'Meditation' | 'Breathing';
  duration: number; // in minutes
  level: 'Beginner' | 'Intermediate' | 'All Levels';
  description: string;
  goal: string;
  gradientClass: string;
  benefits?: string[];
  imageUrl?: string;
  sequence?: PracticeStep[];
}
