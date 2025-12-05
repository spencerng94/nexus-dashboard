import { Goal, Habit, HabitLog, CalendarEvent, ImportantDate } from '../types';

// Keys for LocalStorage
const KEYS = {
  GOALS: 'nexus_goals',
  HABITS: 'nexus_habits',
  HABIT_LOGS: 'nexus_habit_logs',
  EVENTS: 'nexus_events',
  IMPORTANT_DATES: 'nexus_dates',
  USER: 'nexus_user'
};

// Initial Mock Data
export const INITIAL_GOALS: Goal[] = [
  { id: '1', title: "Learn React Patterns", category: "Dev", progress: 75, target: 100, unit: 'pts', color: "text-blue-500 bg-blue-500", icon: "💻" },
  { id: '2', title: "Morning Jogging", category: "Health", progress: 2, target: 5, unit: "days", color: "text-emerald-500 bg-emerald-500", icon: "🏃" },
  { id: '3', title: "Read 'Dune'", category: "Personal", progress: 40, target: 100, unit: 'pg', color: "text-violet-500 bg-violet-500", icon: "📚" },
];

export const INITIAL_HABITS: Habit[] = [
  { id: '1', title: "Workout", category: "Health", icon: "💪", color: "text-rose-500 bg-rose-500", streak: 5 },
  { id: '2', title: "Drink Water", category: "Health", icon: "💧", color: "text-blue-500 bg-blue-500", streak: 12 },
  { id: '3', title: "Code", category: "Dev", icon: "👨‍💻", color: "text-violet-500 bg-violet-500", streak: 3 },
];

export const INITIAL_EVENTS: CalendarEvent[] = [
  { id: 1, title: "Team Standup", time: "10:00 AM", startTime: new Date().setHours(10,0,0,0), type: "work", duration: "30m" },
  { id: 2, title: "Lunch with Sarah", time: "12:30 PM", startTime: new Date().setHours(12,30,0,0), type: "personal", duration: "1h" },
  { id: 3, title: "Project Review", time: "03:00 PM", startTime: new Date().setHours(15,0,0,0), type: "work", duration: "1h" },
];

export const INITIAL_IMPORTANT_DATES: ImportantDate[] = [
  { id: '1', title: "Project Deadline", date: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0], type: "Work" },
  { id: '2', title: "Mom's Birthday", date: new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0], type: "Personal" },
];

// Helpers
const get = <T>(key: string, defaultVal: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultVal;
  } catch (e) {
    console.error(`Error parsing key ${key}:`, e);
    return defaultVal;
  }
};

const set = <T>(key: string, val: T) => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.error(`Error saving key ${key}:`, e);
  }
};

export const storageService = {
  getGoals: () => get<Goal[]>(KEYS.GOALS, INITIAL_GOALS),
  saveGoals: (goals: Goal[]) => set(KEYS.GOALS, goals),
  
  getHabits: () => get<Habit[]>(KEYS.HABITS, INITIAL_HABITS),
  saveHabits: (habits: Habit[]) => set(KEYS.HABITS, habits),
  
  getHabitLogs: () => get<Record<string, HabitLog>>(KEYS.HABIT_LOGS, {}),
  saveHabitLogs: (logs: Record<string, HabitLog>) => set(KEYS.HABIT_LOGS, logs),
  
  getEvents: () => get<CalendarEvent[]>(KEYS.EVENTS, INITIAL_EVENTS),
  saveEvents: (events: CalendarEvent[]) => set(KEYS.EVENTS, events),

  getImportantDates: () => get<ImportantDate[]>(KEYS.IMPORTANT_DATES, INITIAL_IMPORTANT_DATES),
  saveImportantDates: (dates: ImportantDate[]) => set(KEYS.IMPORTANT_DATES, dates),
  
  getUser: () => {
    try {
      const userStr = localStorage.getItem(KEYS.USER);
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      console.error("Failed to parse user from storage", e);
      return null;
    }
  },
  
  saveUser: (user: any) => set(KEYS.USER, user),
  clearUser: () => localStorage.removeItem(KEYS.USER)
};