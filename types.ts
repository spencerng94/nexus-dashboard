

export interface Subgoal {
  id: string;
  title: string;
  completed: boolean;
}

export interface Goal {
  id: string;
  title: string;
  category: string;
  progress: number;
  target: number;
  unit: string;
  color: string;
  icon: string;
  subgoals?: Subgoal[];
}

export interface Habit {
  id: string;
  title: string;
  category: string;
  icon: string;
  color: string;
  streak: number;
  linkedGoalIds?: string[];
  dailyTarget?: number;
  unit?: string;
}

export interface HabitLog {
  habitId: string;
  date: string;
  completed: boolean;
  note?: string;
}

export interface CalendarEvent {
  id: string | number;
  title: string;
  time: string;
  startTime: number | Date;
  type: string;
  duration: string;
}

export interface ProposedEvent {
  id: string;
  title: string;
  startTime: string; // HH:MM format (24h)
  duration: string;
  type: 'work' | 'personal';
  description?: string;
}

export interface ImportantDate {
  id: string;
  title: string;
  date: string; // ISO string YYYY-MM-DD
  type: string; // e.g. "Urgent", "Personal", "Birthday"
}

export interface BriefingHistoryEntry {
  id: string;
  date: string; // YYYY-MM-DD
  content: string;
  style: BriefingStyle;
  timestamp: number;
}

// --- DASHBOARD CONFIGURATION TYPES ---

export type DashboardSectionType = 'briefing' | 'goals' | 'habits' | 'schedule' | 'dates';

export type BriefingStyle = 'standard' | 'concise' | 'fun' | 'motivating' | 'thorough';

export interface DashboardSectionConfig {
  id: DashboardSectionType;
  label: string;
  visible: boolean;
  order: number;
}

export interface DashboardConfig {
  sections: DashboardSectionConfig[];
  briefingStyle: BriefingStyle;
}

export type Theme = 'light' | 'dark' | 'auto';

export interface User {
  uid: string;
  displayName: string | null;
  photoURL: string | null;
  email?: string | null;
  accessToken?: string;
  isGuest?: boolean;
  customAvatar?: {
    type: 'emoji' | 'initials';
    value: string; // The emoji char OR the initial char
    color?: string; // Tailwind color name (e.g. 'emerald', 'blue') for initials background
  };
  dashboardConfig?: DashboardConfig;
  theme?: Theme;
}

export interface DashboardState {
  goals: Goal[];
  habits: Habit[];
  events: CalendarEvent[];
}