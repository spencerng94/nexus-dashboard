
import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  getDoc,
  query,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';
import { Goal, Habit, HabitLog, CalendarEvent, ImportantDate, User } from '../types';

// Helper to clean objects for Firestore (removes undefined values)
const cleanForFirestore = (obj: any) => JSON.parse(JSON.stringify(obj));

export const firestoreService = {

  // --- USER PROFILE ---

  async getUserProfile(uid: string): Promise<Partial<User> | null> {
    const snap = await getDoc(doc(db, 'users', uid));
    return snap.exists() ? (snap.data() as Partial<User>) : null;
  },

  async saveUserProfile(user: Partial<User>): Promise<void> {
    if (!user.uid) return;
    await setDoc(doc(db, 'users', user.uid), cleanForFirestore(user), { merge: true });
  },

  // --- GOALS ---

  async getGoals(uid: string): Promise<Goal[]> {
    const snap = await getDocs(collection(db, 'users', uid, 'goals'));
    return snap.docs.map(doc => doc.data() as Goal);
  },

  async saveGoal(uid: string, goal: Goal): Promise<void> {
    await setDoc(doc(db, 'users', uid, 'goals', goal.id), cleanForFirestore(goal));
  },

  async deleteGoal(uid: string, goalId: string): Promise<void> {
    await deleteDoc(doc(db, 'users', uid, 'goals', goalId));
  },

  // --- HABITS ---

  async getHabits(uid: string): Promise<Habit[]> {
    const snap = await getDocs(collection(db, 'users', uid, 'habits'));
    return snap.docs.map(doc => doc.data() as Habit);
  },

  async saveHabit(uid: string, habit: Habit): Promise<void> {
    await setDoc(doc(db, 'users', uid, 'habits', habit.id), cleanForFirestore(habit));
  },

  async deleteHabit(uid: string, habitId: string): Promise<void> {
    await deleteDoc(doc(db, 'users', uid, 'habits', habitId));
  },

  // --- HABIT LOGS ---
  
  // Returns a Record map to match existing app state structure
  async getHabitLogs(uid: string): Promise<Record<string, HabitLog>> {
    const snap = await getDocs(collection(db, 'users', uid, 'habitLogs'));
    const logs: Record<string, HabitLog> = {};
    snap.docs.forEach(doc => {
      logs[doc.id] = doc.data() as HabitLog;
    });
    return logs;
  },

  // Log ID is constructed as `${habitId}_${date}`
  async saveHabitLog(uid: string, log: HabitLog): Promise<void> {
    const id = `${log.habitId}_${log.date}`;
    await setDoc(doc(db, 'users', uid, 'habitLogs', id), cleanForFirestore(log));
  },

  async deleteHabitLog(uid: string, habitId: string, date: string): Promise<void> {
    const id = `${habitId}_${date}`;
    await deleteDoc(doc(db, 'users', uid, 'habitLogs', id));
  },

  // --- EVENTS ---

  async getEvents(uid: string): Promise<CalendarEvent[]> {
    const snap = await getDocs(collection(db, 'users', uid, 'events'));
    return snap.docs.map(doc => doc.data() as CalendarEvent);
  },

  async saveEvent(uid: string, event: CalendarEvent): Promise<void> {
    // Ensure ID is a string for Firestore document path
    const id = event.id.toString();
    await setDoc(doc(db, 'users', uid, 'events', id), cleanForFirestore(event));
  },

  async deleteEvent(uid: string, eventId: string): Promise<void> {
    await deleteDoc(doc(db, 'users', uid, 'events', eventId));
  },

  // --- IMPORTANT DATES ---

  async getImportantDates(uid: string): Promise<ImportantDate[]> {
    const snap = await getDocs(collection(db, 'users', uid, 'importantDates'));
    return snap.docs.map(doc => doc.data() as ImportantDate);
  },

  async saveImportantDate(uid: string, date: ImportantDate): Promise<void> {
    await setDoc(doc(db, 'users', uid, 'importantDates', date.id), cleanForFirestore(date));
  },

  async deleteImportantDate(uid: string, dateId: string): Promise<void> {
    await deleteDoc(doc(db, 'users', uid, 'importantDates', dateId));
  }
};
