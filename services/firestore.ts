import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  getDoc,
  query
} from 'firebase/firestore';
import { db } from './firebase';
import { Goal, Habit, HabitLog, CalendarEvent, ImportantDate, User } from '../types';

// Helper to get typed references
const getUserRef = (uid: string) => doc(db, 'users', uid);
const getCollectionRef = (uid: string, colName: string) => collection(db, 'users', uid, colName);

// Helper to remove undefined fields which Firestore dislikes
const clean = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

export const firestoreService = {

  // --- USER PROFILE ---

  async getUserProfile(uid: string): Promise<Partial<User> | null> {
    const snap = await getDoc(getUserRef(uid));
    return snap.exists() ? (snap.data() as Partial<User>) : null;
  },

  async saveUserProfile(user: Partial<User>): Promise<void> {
    if (!user.uid) return;
    await setDoc(getUserRef(user.uid), clean(user), { merge: true });
  },

  // --- GOALS ---

  async getGoals(uid: string): Promise<Goal[]> {
    const q = query(getCollectionRef(uid, 'goals'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Goal);
  },

  async saveGoal(uid: string, goal: Goal): Promise<void> {
    const ref = doc(db, 'users', uid, 'goals', goal.id);
    await setDoc(ref, clean(goal));
  },

  async deleteGoal(uid: string, goalId: string): Promise<void> {
    await deleteDoc(doc(db, 'users', uid, 'goals', goalId));
  },

  // --- HABITS ---

  async getHabits(uid: string): Promise<Habit[]> {
    const q = query(getCollectionRef(uid, 'habits'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Habit);
  },

  async saveHabit(uid: string, habit: Habit): Promise<void> {
    const ref = doc(db, 'users', uid, 'habits', habit.id);
    await setDoc(ref, clean(habit));
  },

  async deleteHabit(uid: string, habitId: string): Promise<void> {
    await deleteDoc(doc(db, 'users', uid, 'habits', habitId));
  },

  // --- HABIT LOGS ---
  
  async getHabitLogs(uid: string): Promise<Record<string, HabitLog>> {
    const q = query(getCollectionRef(uid, 'habitLogs'));
    const snapshot = await getDocs(q);
    
    const logs: Record<string, HabitLog> = {};
    snapshot.docs.forEach(doc => {
      // The doc ID is constructed as `${habitId}_${date}`
      logs[doc.id] = doc.data() as HabitLog;
    });
    return logs;
  },

  async saveHabitLog(uid: string, log: HabitLog): Promise<void> {
    const id = `${log.habitId}_${log.date}`;
    const ref = doc(db, 'users', uid, 'habitLogs', id);
    await setDoc(ref, clean(log));
  },

  async deleteHabitLog(uid: string, habitId: string, date: string): Promise<void> {
    const id = `${habitId}_${date}`;
    await deleteDoc(doc(db, 'users', uid, 'habitLogs', id));
  },

  // --- EVENTS ---

  async getEvents(uid: string): Promise<CalendarEvent[]> {
    const q = query(getCollectionRef(uid, 'events'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as CalendarEvent);
  },

  async saveEvent(uid: string, event: CalendarEvent): Promise<void> {
    const ref = doc(db, 'users', uid, 'events', event.id.toString());
    await setDoc(ref, clean(event));
  },

  async deleteEvent(uid: string, eventId: string): Promise<void> {
    await deleteDoc(doc(db, 'users', uid, 'events', eventId));
  },

  // --- IMPORTANT DATES ---

  async getImportantDates(uid: string): Promise<ImportantDate[]> {
    const q = query(getCollectionRef(uid, 'dates'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as ImportantDate);
  },

  async saveImportantDate(uid: string, date: ImportantDate): Promise<void> {
    const ref = doc(db, 'users', uid, 'dates', date.id);
    await setDoc(ref, clean(date));
  },

  async deleteImportantDate(uid: string, dateId: string): Promise<void> {
    await deleteDoc(doc(db, 'users', uid, 'dates', dateId));
  }
};