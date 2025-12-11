import React, { useState, useEffect } from 'react';
import { Plus, Loader2, Sparkles, Target, Dumbbell, Pencil, Smile, Type, Check, X, Settings, ArrowUp, ArrowDown, Eye, EyeOff, LayoutDashboard, Moon, Sun, Clock, Grid2x2 } from 'lucide-react';
import { Goal, Habit, HabitLog, CalendarEvent, User, ImportantDate, DashboardConfig, BriefingStyle, Theme } from './types';
import { storageService } from './services/storage';
import { googleService } from './services/google';
import { weatherService } from './services/weather';
import { generateDailyBriefing, generateSuggestions } from './services/gemini';
import { authService } from './services/auth';
import { firestoreService } from './services/firestore';

// Components
import Sidebar from './components/Sidebar';
import LoginScreen from './components/LoginScreen';
import ChatWidget from './components/ChatWidget';
import CalendarView, { EventFormModal } from './components/CalendarView';
import AboutView from './components/AboutView'; 
import PlannerView from './components/PlannerView';
import { DashboardView, CategoryFilter } from './components/DashboardComponents';
import { ProgressCard, GoalFormModal, GoalSuggestionCard, SuggestionControl as GoalSuggestionControl } from './components/GoalComponents';
import { HabitCard, HabitFormModal, HabitHistoryModal, HabitSuggestionCard, SuggestionControl as HabitSuggestionControl } from './components/HabitComponents';
import { PriorityMatrixView } from './components/PriorityMatrixView';

// Default Dashboard Config
const DEFAULT_DASHBOARD_CONFIG: DashboardConfig = {
  sections: [
    { id: 'briefing', label: 'Daily Briefing', visible: true, order: 0 },
    { id: 'goals', label: 'Goals', visible: true, order: 1 },
    { id: 'schedule', label: 'Today\'s Schedule', visible: true, order: 2 },
    { id: 'dates', label: 'Important Dates', visible: true, order: 3 },
    { id: 'habits', label: 'Habits', visible: false, order: 4 },
  ],
  briefingStyle: 'standard'
};

// --- PROFILE EDIT MODAL ---
interface ProfileAvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (avatarConfig: User['customAvatar']) => void;
  currentUser: User;
}

const ProfileAvatarModal: React.FC<ProfileAvatarModalProps> = ({ isOpen, onClose, onSave, currentUser }) => {
  const [activeTab, setActiveTab] = useState<'initials' | 'emoji'>('initials');
  const [selectedColor, setSelectedColor] = useState('emerald');
  const [selectedEmoji, setSelectedEmoji] = useState('😎');
  
  const colors = ['emerald', 'teal', 'blue', 'indigo', 'violet', 'rose', 'amber', 'slate'];
  const emojis = ['😎', '🤓', '🤠', '🤖', '👽', '👻', '🐱', '🦁', '🦄', '🐸', '🌟', '🔥', '⚡', '💻', '🎨', '🚀'];

  // Init state from current user if exists
  useEffect(() => {
    if (currentUser.customAvatar) {
        setActiveTab(currentUser.customAvatar.type);
        if (currentUser.customAvatar.type === 'emoji') {
            setSelectedEmoji(currentUser.customAvatar.value);
        } else {
            setSelectedColor(currentUser.customAvatar.color || 'emerald');
        }
    }
  }, [currentUser, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (activeTab === 'initials') {
        onSave({ 
            type: 'initials', 
            value: currentUser.displayName?.charAt(0).toUpperCase() || 'U', 
            color: selectedColor 
        });
    } else {
        onSave({ 
            type: 'emoji', 
            value: selectedEmoji 
        });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-md transition-all">
      <div className="bg-white dark:bg-stone-900 rounded-[2rem] p-8 w-full max-w-sm shadow-2xl border border-white/50 dark:border-stone-800 animate-in fade-in zoom-in duration-300">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Customize Profile</h3>
          <button onClick={onClose} className="p-2 lg:hover:bg-slate-100 dark:lg:hover:bg-stone-800 rounded-full transition-colors text-slate-400 dark:text-stone-500 lg:hover:text-slate-600 dark:lg:hover:text-stone-300">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex bg-slate-100 dark:bg-stone-800 p-1 rounded-xl mb-6">
            <button 
                onClick={() => setActiveTab('initials')}
                className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'initials' ? 'bg-white dark:bg-stone-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400 dark:text-stone-500'}`}
            >
                <Type size={16} /> Initials
            </button>
            <button 
                onClick={() => setActiveTab('emoji')}
                className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'emoji' ? 'bg-white dark:bg-stone-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400 dark:text-stone-500'}`}
            >
                <Smile size={16} /> Emoji
            </button>
        </div>

        {/* Content */}
        <div className="mb-8">
            {activeTab === 'initials' ? (
                <div className="space-y-4">
                    <div className="flex justify-center mb-6">
                        <div className={`w-24 h-24 rounded-full bg-${selectedColor}-500 flex items-center justify-center text-4xl font-bold text-white shadow-xl ring-4 ring-${selectedColor}-100 dark:ring-${selectedColor}-900 transition-colors`}>
                            {currentUser.displayName?.charAt(0).toUpperCase() || 'U'}
                        </div>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                        {colors.map(c => (
                            <button
                                key={c}
                                onClick={() => setSelectedColor(c)}
                                className={`w-10 h-10 rounded-full bg-${c}-500 flex items-center justify-center transition-transform hover:scale-110 ${selectedColor === c ? 'ring-2 ring-offset-2 ring-slate-300 dark:ring-stone-600 scale-110' : ''}`}
                            >
                                {selectedColor === c && <Check size={16} className="text-white" strokeWidth={3} />}
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="flex justify-center mb-6">
                        <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-stone-800 flex items-center justify-center text-5xl shadow-inner">
                            {selectedEmoji}
                        </div>
                    </div>
                    <div className="grid grid-cols-4 gap-3 h-40 overflow-y-auto custom-scrollbar p-1">
                        {emojis.map(e => (
                            <button
                                key={e}
                                onClick={() => setSelectedEmoji(e)}
                                className={`w-12 h-12 rounded-xl text-2xl flex items-center justify-center transition-all hover:bg-slate-50 dark:hover:bg-stone-700 ${selectedEmoji === e ? 'bg-white dark:bg-stone-700 shadow-md ring-2 ring-emerald-500/20' : 'grayscale opacity-70 hover:grayscale-0 hover:opacity-100'}`}
                            >
                                {e}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>

        <button 
            onClick={handleSave}
            className="w-full py-3 bg-slate-900 dark:bg-emerald-600 text-white rounded-xl font-bold hover:bg-black dark:hover:bg-emerald-700 transition-all shadow-lg"
        >
            Save Changes
        </button>
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [goals, setGoals] = useState<Goal[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitLogs, setHabitLogs] = useState<Record<string, HabitLog>>({}); 
  const [events, setEvents] = useState<CalendarEvent[]>([]); 
  const [importantDates, setImportantDates] = useState<ImportantDate[]>([]);
  const [weather, setWeather] = useState<{ temp: number, condition: string } | null>(null);

  const [briefing, setBriefing] = useState("");
  const [isGeneratingBriefing, setIsGeneratingBriefing] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [loginError, setLoginError] = useState("");
  const [calendarError, setCalendarError] = useState<string | null>(null);
  
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [goalDefaultValues, setGoalDefaultValues] = useState<{title?: string, category?: string, icon?: string, priorityQuadrant?: 'q1' | 'q2' | 'q3' | 'q4'} | undefined>(undefined);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [habitDefaultValues, setHabitDefaultValues] = useState<{title?: string, category?: string, icon?: string} | undefined>(undefined);
  const [viewingHabitHistory, setViewingHabitHistory] = useState<Habit | null>(null);
  const [historyViewMode, setHistoryViewMode] = useState<'calendar' | 'list'>('calendar');
  
  const [dashboardEvent, setDashboardEvent] = useState<CalendarEvent | null>(null);
  const [isDashboardEventModalOpen, setIsDashboardEventModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const [suggestedGoals, setSuggestedGoals] = useState<Array<{title: string, category: string, icon: string}>>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [suggestedHabits, setSuggestedHabits] = useState<Array<{title: string, category: string, icon: string}>>([]);
  const [isLoadingHabitSuggestions, setIsLoadingHabitSuggestions] = useState(false);

  const [selectedGoalCategory, setSelectedGoalCategory] = useState<string>('All');
  const [selectedHabitCategory, setSelectedHabitCategory] = useState<string>('All');

  // Auth Listener
  useEffect(() => {
    // Safety timeout to prevent infinite loading if Firebase hangs
    const safetyTimeout = setTimeout(() => {
        setIsLoadingAuth(prev => {
            if (prev) {
                console.warn("Auth check timed out. Defaulting to logged out.");
                return false;
            }
            return prev;
        });
    }, 4000);

    const unsubscribe = authService.onUserChanged((authUser) => {
        setUser(authUser);
        setIsLoadingAuth(false);
        clearTimeout(safetyTimeout);
    });
    
    return () => {
        unsubscribe();
        clearTimeout(safetyTimeout);
    };
  }, []);

  // Theme Sync
  useEffect(() => {
    const applyTheme = () => {
      let effectiveTheme = user?.theme;
      if (!effectiveTheme || effectiveTheme === 'auto') {
        const hour = new Date().getHours();
        effectiveTheme = (hour >= 6 && hour < 18) ? 'light' : 'dark';
      }
      if (effectiveTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };
    applyTheme();
    const interval = setInterval(applyTheme, 60000);
    return () => clearInterval(interval);
  }, [user?.theme]);

  // Data Loading
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      // 1. Load Weather
      weatherService.getCurrentWeather().then(data => {
          if (data) setWeather(data);
      });

      // 2. Load Core Data (Firestore vs LocalStorage)
      if (!user.isGuest) {
          // CLOUD MODE
          try {
              const [cGoals, cHabits, cLogs, cDates] = await Promise.all([
                  firestoreService.getGoals(user.uid),
                  firestoreService.getHabits(user.uid),
                  firestoreService.getHabitLogs(user.uid),
                  firestoreService.getImportantDates(user.uid)
              ]);
              setGoals(cGoals);
              setHabits(cHabits);
              setHabitLogs(cLogs);
              setImportantDates(cDates);
          } catch (error) {
              console.error("Failed to load cloud data", error);
          }
      } else {
          // GUEST MODE
          setGoals(storageService.getGoals());
          setHabits(storageService.getHabits());
          setHabitLogs(storageService.getHabitLogs());
          setImportantDates(storageService.getImportantDates());
      }

      // 3. Sync Calendar Events (Google vs Local)
      syncEvents(user);
    };

    if (user) loadData();
  }, [user]);

  // Sync Events
  const syncEvents = async (currentUser: User) => {
    let currentEvents: CalendarEvent[] = [];
    
    if (currentUser.accessToken && !currentUser.isGuest) {
        try {
            setCalendarError(null);
            const googleEvents = await googleService.listEvents(currentUser.accessToken);
            currentEvents = googleEvents;
            setEvents(googleEvents);
        } catch (e: any) {
            console.error("Failed to sync Google Calendar", e);
            setCalendarError(e.message || "Failed to sync Calendar");
            // Fallback to local
            if (!currentUser.isGuest) {
                // If cloud user but google fails, try loading from firestore events
                const fsEvents = await firestoreService.getEvents(currentUser.uid);
                currentEvents = fsEvents;
                setEvents(fsEvents);
            } else {
                const localEvents = storageService.getEvents();
                currentEvents = localEvents;
                setEvents(localEvents);
            }
        }
    } else if (!currentUser.isGuest) {
        // Authenticated but no token (e.g. refreshed page). Load from Firestore.
        const fsEvents = await firestoreService.getEvents(currentUser.uid);
        currentEvents = fsEvents;
        setEvents(fsEvents);
    } else {
        // Guest
        const localEvents = storageService.getEvents();
        currentEvents = localEvents;
        setEvents(localEvents);
    }

    // Refresh briefing if needed
    if (!briefing && currentEvents.length >= 0) {
        // We pass the latest state to generator
        // Note: goals/habits state might be stale in this closure if just loaded, 
        // but typically this runs after setting state. 
        // For safer briefing generation, we could depend on a separate effect.
        // For now, we'll try to use the variables we have or just wait for user refresh.
    }
  };

  const generateBriefingHelper = async (
      currentGoals = goals, 
      currentEvents = events, 
      currentHabits = habits,
      overrideStyle?: BriefingStyle
    ) => {
    setIsGeneratingBriefing(true);
    const style = overrideStyle || user?.dashboardConfig?.briefingStyle || 'standard';
    const newBriefing = await generateDailyBriefing(currentGoals, currentEvents, currentHabits, style);
    setBriefing(newBriefing);
    setIsGeneratingBriefing(false);
  };

  // --- AUTH HANDLERS ---
  const handleLogin = async () => {
    setLoginError("");
    try {
        const loggedInUser = await authService.login();
        setUser(loggedInUser);
    } catch (e: any) {
        console.error("Login Error:", e);
        setLoginError(e.message || "Login Failed");
    }
  };

  const handleGuestLogin = () => {
    const guestUser = authService.loginGuest();
    storageService.saveUser(guestUser); // Keep saving guest to LS for persistence
    setUser(guestUser);
  };

  const handleSignOut = async () => {
    await authService.logout();
    storageService.clearUser();
    setUser(null);
    setEvents([]);
    setBriefing("");
    setCalendarError(null);
  };

  const handleUpdateProfile = async (customAvatar: User['customAvatar']) => {
    if (!user) return;
    const updatedUser = { ...user, customAvatar };
    setUser(updatedUser);
    
    if (!user.isGuest) {
        await firestoreService.saveUserProfile(updatedUser);
    } else {
        storageService.saveUser(updatedUser);
    }
  };

  const handleToggleTheme = async (theme: Theme) => {
    if (!user) return;
    const updatedUser = { ...user, theme };
    setUser(updatedUser);

    if (!user.isGuest) {
        await firestoreService.saveUserProfile(updatedUser);
    } else {
        storageService.saveUser(updatedUser);
    }
  };

  // Wrapper for sidebar toggle
  const toggleTheme = () => {
    if (!user) return;
    let currentTheme = user.theme;
    if (currentTheme === 'auto' || !currentTheme) {
        const hour = new Date().getHours();
        const effective = (hour >= 6 && hour < 18) ? 'light' : 'dark';
        handleToggleTheme(effective === 'light' ? 'dark' : 'light');
    } else {
        handleToggleTheme(currentTheme === 'dark' ? 'light' : 'dark');
    }
  };

  const handleUpdateDashboardConfig = async (newConfig: DashboardConfig) => {
      if (!user) return;
      const oldStyle = user.dashboardConfig?.briefingStyle;
      const updatedUser = { ...user, dashboardConfig: newConfig };
      setUser(updatedUser);

      if (!user.isGuest) {
          await firestoreService.saveUserProfile(updatedUser);
      } else {
          storageService.saveUser(updatedUser);
      }

      if (oldStyle !== newConfig.briefingStyle) {
          generateBriefingHelper(goals, events, habits, newConfig.briefingStyle);
      }
  };

  // --- DATA HANDLERS ---

  // Goals
  const handleSaveGoal = async (goalData: Omit<Goal, 'id' | 'progress'>) => {
    let newGoal: Goal;
    let updatedGoals = [...goals];

    if (editingGoal) {
      newGoal = { ...editingGoal, ...goalData };
      updatedGoals = updatedGoals.map(g => g.id === editingGoal.id ? newGoal : g);
    } else {
      newGoal = { ...goalData, id: Date.now().toString(), progress: 0 };
      updatedGoals.push(newGoal);
    }
    
    setGoals(updatedGoals); // Optimistic

    if (user && !user.isGuest) {
        await firestoreService.saveGoal(user.uid, newGoal);
    } else {
        storageService.saveGoals(updatedGoals);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    const updatedGoals = goals.filter(g => g.id !== id);
    setGoals(updatedGoals);

    if (user && !user.isGuest) {
        await firestoreService.deleteGoal(user.uid, id);
    } else {
        storageService.saveGoals(updatedGoals);
    }
  };

  const handleGoalIncrement = async (id: string) => {
    const goalToUpdate = goals.find(g => g.id === id);
    if (!goalToUpdate) return;
    
    const updatedGoal = { ...goalToUpdate, progress: Math.min(goalToUpdate.progress + 1, goalToUpdate.target) };
    const updatedGoals = goals.map(g => g.id === id ? updatedGoal : g);
    setGoals(updatedGoals);

    if (user && !user.isGuest) {
        await firestoreService.saveGoal(user.uid, updatedGoal);
    } else {
        storageService.saveGoals(updatedGoals);
    }
  };

  const handleGoalDecrement = async (id: string) => {
    const goalToUpdate = goals.find(g => g.id === id);
    if (!goalToUpdate) return;

    const updatedGoal = { ...goalToUpdate, progress: Math.max(goalToUpdate.progress - 1, 0) };
    const updatedGoals = goals.map(g => g.id === id ? updatedGoal : g);
    setGoals(updatedGoals);

    if (user && !user.isGuest) {
        await firestoreService.saveGoal(user.uid, updatedGoal);
    } else {
        storageService.saveGoals(updatedGoals);
    }
  };

  const handleToggleSubgoal = async (goalId: string, subgoalId: string) => {
      const goalToUpdate = goals.find(g => g.id === goalId);
      if (!goalToUpdate || !goalToUpdate.subgoals) return;

      const updatedSubgoals = goalToUpdate.subgoals.map(s => 
          s.id === subgoalId ? { ...s, completed: !s.completed } : s
      );
      // Optional: Auto update progress based on subgoals
      // const newProgress = updatedSubgoals.filter(s => s.completed).length;
      
      const updatedGoal = { ...goalToUpdate, subgoals: updatedSubgoals }; // , progress: newProgress 
      const updatedGoals = goals.map(g => g.id === goalId ? updatedGoal : g);
      setGoals(updatedGoals);

      if (user && !user.isGuest) {
          await firestoreService.saveGoal(user.uid, updatedGoal);
      } else {
          storageService.saveGoals(updatedGoals);
      }
  };

  const handleUpdateGoalQuadrant = async (goalId: string, quadrant: 'q1' | 'q2' | 'q3' | 'q4' | undefined) => {
      const goalToUpdate = goals.find(g => g.id === goalId);
      if (!goalToUpdate) return;

      const updatedGoal = { ...goalToUpdate, priorityQuadrant: quadrant };
      const updatedGoals = goals.map(g => g.id === goalId ? updatedGoal : g);
      setGoals(updatedGoals);

      if (user && !user.isGuest) {
          await firestoreService.saveGoal(user.uid, updatedGoal);
      } else {
          storageService.saveGoals(updatedGoals);
      }
  };

  const loadGoalSuggestions = async (topic?: string) => {
    setIsLoadingSuggestions(true);
    const existingTitles = goals.map(g => g.title);
    const suggestions = await generateSuggestions('goal', existingTitles, topic);
    setSuggestedGoals(suggestions);
    setIsLoadingSuggestions(false);
  };

  const handleAcceptSuggestion = (suggestion: {title: string, category: string, icon: string}) => {
    setGoalDefaultValues(suggestion);
    setEditingGoal(null);
    setIsGoalModalOpen(true);
  };

  // Habits
  const handleSaveHabit = async (habitData: Omit<Habit, 'id' | 'streak'>) => {
    let newHabit: Habit;
    let updatedHabits = [...habits];

    if (editingHabit) {
      newHabit = { ...editingHabit, ...habitData };
      updatedHabits = updatedHabits.map(h => h.id === editingHabit.id ? newHabit : h);
    } else {
      newHabit = { ...habitData, id: Date.now().toString(), streak: 0 };
      updatedHabits.push(newHabit);
    }
    
    setHabits(updatedHabits);

    if (user && !user.isGuest) {
        await firestoreService.saveHabit(user.uid, newHabit);
    } else {
        storageService.saveHabits(updatedHabits);
    }
  };

  const handleDeleteHabit = async (id: string) => {
    const updatedHabits = habits.filter(h => h.id !== id);
    setHabits(updatedHabits);

    if (user && !user.isGuest) {
        await firestoreService.deleteHabit(user.uid, id);
    } else {
        storageService.saveHabits(updatedHabits);
    }
  };

  const loadHabitSuggestions = async (topic?: string) => {
    setIsLoadingHabitSuggestions(true);
    const existingTitles = habits.map(h => h.title);
    const suggestions = await generateSuggestions('habit', existingTitles, topic);
    setSuggestedHabits(suggestions);
    setIsLoadingHabitSuggestions(false);
  };

  const handleAcceptHabitSuggestion = (suggestion: {title: string, category: string, icon: string}) => {
    setHabitDefaultValues(suggestion);
    setEditingHabit(null);
    setIsHabitModalOpen(true);
  };

  // Habit Logging & Logic
  const formatLocalYMD = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const updateStreaks = async (currentHabits: Habit[], currentLogs: Record<string, HabitLog>) => {
    const updatedHabits = currentHabits.map(h => {
        let streak = 0;
        const d = new Date();
        while (true) {
            const k = formatLocalYMD(d);
            if (currentLogs[`${h.id}_${k}`]) {
                streak++;
                d.setDate(d.getDate() - 1);
            } else {
                break;
            }
        }
        return { ...h, streak };
    });
    setHabits(updatedHabits);

    if (user && !user.isGuest) {
        // In cloud, we'd iterate and save each updated habit. 
        // This could be heavy if many habits, but it's okay for now.
        for (const h of updatedHabits) {
            await firestoreService.saveHabit(user.uid, h);
        }
    } else {
        storageService.saveHabits(updatedHabits);
    }
  };

  const handleToggleHabit = async (habitId: string, isCompleted: boolean, dateKey?: string) => {
     const date = dateKey || formatLocalYMD(new Date());
     const logId = `${habitId}_${date}`;
     
     const updatedLogs = { ...habitLogs };
     const newLog: HabitLog = {
         habitId,
         date: date,
         completed: true,
         note: ""
     };

     if (isCompleted) {
       updatedLogs[logId] = newLog;
     } else {
       delete updatedLogs[logId];
     }
     
     setHabitLogs(updatedLogs);

     if (user && !user.isGuest) {
         if (isCompleted) {
             await firestoreService.saveHabitLog(user.uid, newLog);
         } else {
             await firestoreService.deleteHabitLog(user.uid, habitId, date);
         }
     } else {
         storageService.saveHabitLogs(updatedLogs);
     }
     
     await updateStreaks(habits, updatedLogs);

     // Linked Goals Logic (Optimistic update on goals)
     const habit = habits.find(h => h.id === habitId);
     if (habit && habit.linkedGoalIds && habit.linkedGoalIds.length > 0) {
        let currentGoalsSnapshot = [...goals];

        habit.linkedGoalIds.forEach(goalId => {
            const goalIndex = currentGoalsSnapshot.findIndex(g => g.id === goalId);
            if (goalIndex !== -1) {
                const g = currentGoalsSnapshot[goalIndex];
                let newProgress = g.progress;
                if (isCompleted) {
                    newProgress = Math.min(g.progress + 1, g.target);
                } else {
                    newProgress = Math.max(g.progress - 1, 0);
                }
                const updatedGoal = { ...g, progress: newProgress };
                currentGoalsSnapshot[goalIndex] = updatedGoal;
                
                // Save specific goal
                if(user && !user.isGuest) {
                    firestoreService.saveGoal(user.uid, updatedGoal);
                }
            }
        });
        setGoals(currentGoalsSnapshot);
        if(!user || user.isGuest) {
            storageService.saveGoals(currentGoalsSnapshot);
        }
     }
  };

  const handleDeleteHabitLog = async (habitId: string, dateKey: string) => {
     const logId = `${habitId}_${dateKey}`;
     if (habitLogs[logId]) {
         const updatedLogs = { ...habitLogs };
         delete updatedLogs[logId];
         setHabitLogs(updatedLogs);

         if (user && !user.isGuest) {
             await firestoreService.deleteHabitLog(user.uid, habitId, dateKey);
         } else {
             storageService.saveHabitLogs(updatedLogs);
         }

         await updateStreaks(habits, updatedLogs);
     }
  };

  const handleUpdateHabitNote = async (habitId: string, note: string, dateKey?: string) => {
    const date = dateKey || formatLocalYMD(new Date());
    const logId = `${habitId}_${date}`;
    
    if (habitLogs[logId]) {
        const updatedLog = { ...habitLogs[logId], note };
        const updatedLogs = {
            ...habitLogs,
            [logId]: updatedLog
        };
        setHabitLogs(updatedLogs);

        if (user && !user.isGuest) {
            await firestoreService.saveHabitLog(user.uid, updatedLog);
        } else {
            storageService.saveHabitLogs(updatedLogs);
        }
    }
  };

  // Events
  const handleAddEvent = async (newEventData: Omit<CalendarEvent, 'id'>) => {
    const tempId = Date.now().toString();
    const tempEvent = { ...newEventData, id: tempId };
    const optimisticEvents = [...events, tempEvent].sort((a, b) => 
       new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
    setEvents(optimisticEvents);

    // Save to Persistent Store (Firestore or Local)
    if (user && !user.isGuest) {
         // If cloud user, saving to Firestore events collection as fallback/primary
         await firestoreService.saveEvent(user.uid, tempEvent);
    } else {
         storageService.saveEvents(optimisticEvents);
    }

    // Sync to Google Calendar if authorized
    if (user?.accessToken && !user.isGuest) {
        try {
            const createdEvent = await googleService.createEvent(user.accessToken, newEventData);
            if (createdEvent) {
                // Update the temp ID with real ID
                const finalEvents = optimisticEvents.map(e => e.id === tempId ? createdEvent : e);
                setEvents(finalEvents);
                // Update Firestore with real Google ID
                // Note: We might want to delete the temp one and save the new one, but for simplicity:
                await firestoreService.deleteEvent(user.uid, tempId);
                await firestoreService.saveEvent(user.uid, createdEvent);
            }
        } catch (e: any) {
            console.error("Failed to save to Google Calendar", e);
            // We already saved locally/firestore, so UI is fine.
        }
    }
  };

  const handleEditEvent = async (updatedEvent: CalendarEvent) => {
    const newEvents = events.map(e => e.id === updatedEvent.id ? updatedEvent : e);
    setEvents(newEvents);
    
    if (user && !user.isGuest) {
        await firestoreService.saveEvent(user.uid, updatedEvent);
    } else {
        storageService.saveEvents(newEvents);
    }
    
    if (user?.accessToken && !user.isGuest) {
      try {
        const dStr = updatedEvent.duration;
        let durationMinutes = 60;
        if (dStr === 'All Day') {
            durationMinutes = 1440;
        } else {
            const hMatch = dStr.match(/(\d+)h/);
            const mMatch = dStr.match(/(\d+)m/);
            let mins = 0;
            if (hMatch) mins += parseInt(hMatch[1]) * 60;
            if (mMatch) mins += parseInt(mMatch[1]);
            if (mins > 0) durationMinutes = mins;
        }
        
        const startTime = new Date(updatedEvent.startTime);
        const endTime = new Date(startTime.getTime() + durationMinutes * 60000);
        
        const updates: any = {
           summary: updatedEvent.title,
           start: { dateTime: startTime.toISOString() },
           end: { dateTime: endTime.toISOString() },
           location: updatedEvent.location
        };

        await googleService.updateEvent(user.accessToken, updatedEvent.id as string, updates);
      } catch (e) {
        console.error("Failed to update Google Event", e);
      }
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    const newEvents = events.filter(e => e.id !== eventId);
    setEvents(newEvents);
    
    if (user && !user.isGuest) {
        await firestoreService.deleteEvent(user.uid, eventId);
    } else {
        storageService.saveEvents(newEvents);
    }

    if (user?.accessToken && !user.isGuest) {
       try {
         await googleService.deleteEvent(user.accessToken, eventId);
       } catch (e) {
         console.error("Failed to delete Google Event", e);
       }
    }
  };

  const handleBatchAddEvents = async (newEventsData: Omit<CalendarEvent, 'id'>[]) => {
     // Similar to handleAddEvent but for multiple
     const tempEvents = newEventsData.map(evt => ({
         ...evt,
         id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
     }));

     setEvents(prev => {
         const updated = [...prev, ...tempEvents].sort((a, b) => 
            new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
         );
         if (!user || user.isGuest) storageService.saveEvents(updated);
         return updated;
     });

     if (user && !user.isGuest) {
         for(const t of tempEvents) {
             await firestoreService.saveEvent(user.uid, t);
         }
     }

     if (user?.accessToken && !user.isGuest) {
         for (const tempEvent of tempEvents) {
             try {
                 // eslint-disable-next-line @typescript-eslint/no-unused-vars
                 const { id, ...eventBody } = tempEvent; 
                 const createdEvent = await googleService.createEvent(user.accessToken, eventBody);
                 if (createdEvent) {
                     setEvents(prev => prev.map(e => e.id === tempEvent.id ? createdEvent : e));
                     await firestoreService.deleteEvent(user.uid, tempEvent.id as string);
                     await firestoreService.saveEvent(user.uid, createdEvent);
                 }
             } catch (e) {
                 console.error("Failed to batch save event", e);
             }
         }
     }
  };

  // Important Dates
  const handleAddImportantDate = async (newDate: Omit<ImportantDate, 'id'>) => {
    const dateObj = { ...newDate, id: Date.now().toString() };
    const updated = [...importantDates, dateObj];
    setImportantDates(updated);

    if (user && !user.isGuest) {
        await firestoreService.saveImportantDate(user.uid, dateObj);
    } else {
        storageService.saveImportantDates(updated);
    }
  };

  const handleEditImportantDate = async (date: ImportantDate) => {
    const updated = importantDates.map(d => d.id === date.id ? date : d);
    setImportantDates(updated);

    if (user && !user.isGuest) {
        await firestoreService.saveImportantDate(user.uid, date);
    } else {
        storageService.saveImportantDates(updated);
    }
  };

  const handleDeleteImportantDate = async (id: string) => {
    const updated = importantDates.filter(d => d.id !== id);
    setImportantDates(updated);

    if (user && !user.isGuest) {
        await firestoreService.deleteImportantDate(user.uid, id);
    } else {
        storageService.saveImportantDates(updated);
    }
  };

  if (isLoadingAuth) return <div className="h-screen flex items-center justify-center bg-[#F5F5F7] dark:bg-stone-950"><Loader2 className="animate-spin text-slate-400" size={32} /></div>;

  if (!user) return <LoginScreen onLogin={handleLogin} onGuestLogin={handleGuestLogin} loginError={loginError} />;

  const dashboardState = { goals, events, habits };

  return (
    <div className="bg-[#F5F5F7] dark:bg-stone-950 min-h-screen font-sans text-slate-900 dark:text-stone-100 selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden transition-colors duration-300">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user} 
        onSignOut={handleSignOut} 
        onProfileClick={() => setActiveTab('settings')}
        onThemeToggle={toggleTheme}
      />
      
      <main className="md:pl-[80px] lg:pl-[240px] p-6 pb-32 md:pb-10 min-h-screen transition-all duration-300">
        {activeTab === 'dashboard' && (
          <DashboardView 
            goals={goals} 
            habits={habits}
            events={events}
            briefing={briefing}
            isGeneratingBriefing={isGeneratingBriefing}
            onRefreshBriefing={() => generateBriefingHelper(goals, events, habits)}
            openAddModal={() => { setEditingGoal(null); setGoalDefaultValues(undefined); setIsGoalModalOpen(true); }}
            onViewCalendar={() => setActiveTab('calendar')}
            onGoalIncrement={handleGoalIncrement} 
            onGoalDecrement={handleGoalDecrement}
            onDeleteGoal={handleDeleteGoal}
            onEditGoal={(goal) => { setEditingGoal(goal); setIsGoalModalOpen(true); }}
            displayName={user.displayName || 'User'}
            syncError={calendarError}
            importantDates={importantDates}
            onAddImportantDate={handleAddImportantDate}
            onEditImportantDate={handleEditImportantDate}
            onDeleteImportantDate={handleDeleteImportantDate}
            weather={weather}
            userConfig={user.dashboardConfig || DEFAULT_DASHBOARD_CONFIG}
            onUpdateConfig={handleUpdateDashboardConfig}
            habitLogs={habitLogs}
            onToggleHabit={handleToggleHabit}
            onUpdateHabitNote={handleUpdateHabitNote}
            onDeleteHabit={handleDeleteHabit}
            onEditHabit={(habit) => { setEditingHabit(habit); setIsHabitModalOpen(true); }}
            onViewHabitHistory={(habit, view) => { setViewingHabitHistory(habit); setHistoryViewMode(view); setIsHistoryModalOpen(true); }}
            onToggleSubgoal={handleToggleSubgoal}
            onEventClick={(event) => {
                setDashboardEvent(event);
                setIsDashboardEventModalOpen(true);
            }}
          />
        )}
        {activeTab === 'planner' && (
            <PlannerView 
                existingEvents={events} 
                onAddEvents={handleBatchAddEvents} 
            />
        )}
        {activeTab === 'matrix' && (
           <PriorityMatrixView 
              goals={goals}
              onUpdateGoalQuadrant={handleUpdateGoalQuadrant}
              onAddGoal={(quadrant) => {
                  setGoalDefaultValues({ priorityQuadrant: quadrant });
                  setEditingGoal(null);
                  setIsGoalModalOpen(true);
              }}
              onEditGoal={(goal) => {
                  setEditingGoal(goal);
                  setIsGoalModalOpen(true);
              }}
           />
        )}
        {activeTab === 'calendar' && (
           <CalendarView 
              events={events}
              importantDates={importantDates}
              onAddEvent={handleAddEvent}
              onEditEvent={handleEditEvent}
              onDeleteEvent={handleDeleteEvent}
              habits={habits}
              habitLogs={habitLogs}
           />
        )}
        {activeTab === 'goals' && (
          <div className="max-w-[1600px] mx-auto">
             <div className="flex justify-between items-center mb-8">
               <div className="flex items-center gap-4">
                 <div className="w-10 h-10 md:w-14 md:h-14 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
                    <Target className="text-white w-5 h-5 md:w-8 md:h-8" />
                 </div>
                 <div>
                    <h1 className="text-2xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">Goals & Focus</h1>
                    <p className="text-emerald-500 dark:text-emerald-400 font-bold text-xs md:text-sm mt-1 uppercase tracking-wider">Set targets and visualize your progress</p>
                 </div>
               </div>
               <button 
                onClick={() => { setEditingGoal(null); setGoalDefaultValues(undefined); setIsGoalModalOpen(true); }}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 md:px-6 md:py-3 rounded-2xl font-bold shadow-lg shadow-emerald-500/30 lg:hover:scale-105 transition-all flex items-center gap-2 shrink-0 text-sm md:text-base"
               >
                 <Plus size={20} /> <span className="hidden md:inline">New Goal</span><span className="md:hidden">New</span>
               </button>
             </div>
             
             <CategoryFilter 
                categories={Array.from(new Set(goals.map(g => g.category || 'Uncategorized'))).sort()} 
                selected={selectedGoalCategory}
                onSelect={setSelectedGoalCategory}
             />

             {goals.length > 0 ? (
               <div className="space-y-12">
                {[selectedGoalCategory === 'All' ? Array.from(new Set(goals.map(g => g.category || 'Uncategorized'))).sort() : [selectedGoalCategory]].flat().map(cat => {
                   const catGoals = goals.filter(g => (g.category || 'Uncategorized') === cat);
                   if (catGoals.length === 0) return null;
                   
                   return (
                      <div key={cat} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                         {selectedGoalCategory === 'All' && (
                            <h3 className="text-xl font-bold text-slate-800 dark:text-stone-100 mb-6 flex items-center gap-2 border-b border-slate-200 dark:border-stone-800 pb-2">
                              {cat} <span className="text-xs font-bold bg-slate-100 dark:bg-stone-800 text-slate-500 dark:text-stone-400 px-2 py-0.5 rounded-full">{catGoals.length}</span>
                            </h3>
                         )}
                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {catGoals.map(goal => (
                              <ProgressCard 
                                key={goal.id} 
                                goal={goal} 
                                linkedHabits={habits.filter(h => h.linkedGoalIds?.includes(goal.id))}
                                onIncrement={handleGoalIncrement} 
                                onDecrement={handleGoalDecrement}
                                onDelete={handleDeleteGoal}
                                onEdit={(goal) => { setEditingGoal(goal); setIsGoalModalOpen(true); }}
                                onToggleSubgoal={handleToggleSubgoal}
                              />
                            ))}
                         </div>
                      </div>
                   );
                })}
               </div>
             ) : (
                <div className="text-center py-20 bg-white/50 dark:bg-stone-800/50 rounded-[2rem] border border-dashed border-slate-200 dark:border-stone-700">
                    <p className="text-slate-400 dark:text-stone-500 font-medium">No goals yet. Create one to get started!</p>
                </div>
             )}

             <div className="mt-20 border-t border-slate-200 dark:border-stone-800 pt-12">
               <div className="flex items-center gap-3 mb-6">
                 <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-emerald-500 dark:text-emerald-400">
                   <Sparkles size={20} />
                 </div>
                 <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Suggested for you</h2>
               </div>

               <GoalSuggestionControl 
                 onGenerate={loadGoalSuggestions} 
                 isLoading={isLoadingSuggestions}
                 categories={['Health', 'Career', 'Learning', 'Finance', 'Mindfulness', 'Fitness']}
               />
               
               {isLoadingSuggestions ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
                   {[1,2,3,4].map(i => (
                     <div key={i} className="h-32 bg-slate-100 dark:bg-stone-800 rounded-[1.5rem]" />
                   ))}
                 </div>
               ) : suggestedGoals.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4">
                   {suggestedGoals.map((s, idx) => (
                     <GoalSuggestionCard 
                       key={idx} 
                       suggestion={s} 
                       onAdd={() => handleAcceptSuggestion(s)} 
                     />
                   ))}
                 </div>
               ) : (
                 <div className="bg-white/50 dark:bg-stone-800/50 border border-slate-100 dark:border-stone-800 rounded-[1.5rem] p-8 text-center">
                   <p className="text-slate-500 dark:text-stone-500 font-medium">Select a topic or type your own to get personalized goal suggestions.</p>
                 </div>
               )}
             </div>
          </div>
        )}
        {activeTab === 'habits' && (
          <div className="max-w-[1600px] mx-auto">
             <div className="flex justify-between items-center mb-8">
               <div className="flex items-center gap-4">
                 <div className="w-10 h-10 md:w-14 md:h-14 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
                    <Dumbbell className="text-white w-5 h-5 md:w-8 md:h-8" />
                 </div>
                 <div>
                   <h1 className="text-2xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">Habit Tracker</h1>
                   <p className="text-emerald-500 dark:text-emerald-400 font-bold text-xs md:text-sm mt-1 uppercase tracking-wider">Build consistency one day at a time</p>
                 </div>
               </div>
               <button 
                onClick={() => { setEditingHabit(null); setHabitDefaultValues(undefined); setIsHabitModalOpen(true); }}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 md:px-6 md:py-3 rounded-2xl font-bold shadow-lg shadow-emerald-500/30 lg:hover:scale-105 transition-all flex items-center gap-2 shrink-0 text-sm md:text-base"
               >
                 <Plus size={20} /> <span className="hidden md:inline">New Habit</span><span className="md:hidden">New</span>
               </button>
             </div>

             <CategoryFilter 
                categories={Array.from(new Set(habits.map(h => h.category || 'Uncategorized'))).sort()} 
                selected={selectedHabitCategory}
                onSelect={setSelectedHabitCategory}
             />
             
             {habits.length > 0 ? (
               <div className="space-y-12">
                {[selectedHabitCategory === 'All' ? Array.from(new Set(habits.map(h => h.category || 'Uncategorized'))).sort() : [selectedHabitCategory]].flat().map(cat => {
                   const catHabits = habits.filter(h => (h.category || 'Uncategorized') === cat);
                   if (catHabits.length === 0) return null;
                   
                   return (
                      <div key={cat} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                         {selectedHabitCategory === 'All' && (
                            <h3 className="text-xl font-bold text-slate-800 dark:text-stone-100 mb-6 flex items-center gap-2 border-b border-slate-200 dark:border-stone-800 pb-2">
                              {cat} <span className="text-xs font-bold bg-slate-100 dark:bg-stone-800 text-slate-500 dark:text-stone-400 px-2 py-0.5 rounded-full">{catHabits.length}</span>
                            </h3>
                         )}
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {catHabits.map(habit => (
                              <HabitCard 
                                key={habit.id} 
                                habit={habit} 
                                habitLogs={habitLogs}
                                onToggle={handleToggleHabit} 
                                onUpdateNote={handleUpdateHabitNote}
                                onDelete={handleDeleteHabit}
                                onEdit={(habit) => { setEditingHabit(habit); setIsHabitModalOpen(true); }}
                                onViewHistory={(habit, view) => { setViewingHabitHistory(habit); setHistoryViewMode(view); setIsHistoryModalOpen(true); }}
                              />
                            ))}
                         </div>
                      </div>
                   );
                })}
               </div>
             ) : (
                <div className="text-center py-20 bg-white/50 dark:bg-stone-800/50 rounded-[2rem] border border-dashed border-slate-200 dark:border-stone-700">
                    <p className="text-slate-400 dark:text-stone-500 font-medium">No habits yet. Start a new routine!</p>
                </div>
             )}

             <div className="mt-20 border-t border-slate-200 dark:border-stone-800 pt-12">
               <div className="flex items-center gap-3 mb-6">
                 <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-emerald-500 dark:text-emerald-400">
                   <Sparkles size={20} />
                 </div>
                 <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Suggested for you</h2>
               </div>
               
               <HabitSuggestionControl 
                  onGenerate={loadHabitSuggestions}
                  isLoading={isLoadingHabitSuggestions}
                  categories={['Morning Routine', 'Health', 'Mental Wellness', 'Productivity', 'Learning', 'Night Routine']}
               />

               {isLoadingHabitSuggestions ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
                   {[1,2,3,4].map(i => (
                     <div key={i} className="h-32 bg-slate-100 dark:bg-stone-800 rounded-[1.5rem]" />
                   ))}
                 </div>
               ) : suggestedHabits.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4">
                   {suggestedHabits.map((s, idx) => (
                     <HabitSuggestionCard 
                       key={idx} 
                       suggestion={s} 
                       onAdd={() => handleAcceptHabitSuggestion(s)} 
                     />
                   ))}
                 </div>
               ) : (
                 <div className="bg-white/50 dark:bg-stone-800/50 border border-slate-100 dark:border-stone-800 rounded-[1.5rem] p-8 text-center">
                   <p className="text-slate-500 dark:text-stone-500 font-medium">Select a topic or type your own to get personalized habit suggestions.</p>
                 </div>
               )}
             </div>
          </div>
        )}
        {activeTab === 'about' && (
           <AboutView />
        )}
        {activeTab === 'settings' && (
          <div className="max-w-[1200px] mx-auto pb-20">
             <div className="flex items-center gap-4 mb-8">
                 <div className="w-10 h-10 md:w-14 md:h-14 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
                    <Settings className="text-white w-5 h-5 md:w-8 md:h-8" />
                 </div>
                 <div>
                    <h1 className="text-2xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">Profile & Settings</h1>
                    <p className="text-emerald-500 dark:text-emerald-400 font-bold text-xs md:text-sm mt-1 uppercase tracking-wider">Manage your account and preferences</p>
                 </div>
             </div>

             <div className="space-y-6">
                {/* Profile Card - Horizontal Row */}
                <div className="bg-white dark:bg-stone-900 rounded-[2.5rem] p-6 md:p-8 shadow-xl border border-slate-100 dark:border-stone-800 flex flex-col md:flex-row items-center gap-6 md:gap-8 relative overflow-hidden group">
                    <div className="absolute top-0 w-full h-full bg-gradient-to-r from-emerald-50/50 to-teal-50/50 dark:from-emerald-900/10 dark:to-teal-900/10 opacity-50 pointer-events-none"></div>
                    
                    <div className="relative z-10 shrink-0">
                        <div className={`w-24 h-24 md:w-28 md:h-28 rounded-[2rem] flex items-center justify-center text-4xl md:text-5xl font-bold text-white shadow-xl p-1 border-4 border-white dark:border-stone-800 ${user.customAvatar?.type === 'emoji' ? 'bg-slate-100 dark:bg-stone-800' : 'bg-gradient-to-tr from-emerald-400 to-teal-500'}`}>
                            {user.customAvatar ? (
                                user.customAvatar.type === 'emoji' ? (
                                    <span>{user.customAvatar.value}</span>
                                ) : (
                                    <div className={`w-full h-full rounded-[1.8rem] bg-${user.customAvatar.color || 'emerald'}-500 flex items-center justify-center`}>
                                        {user.customAvatar.value}
                                    </div>
                                )
                            ) : user.photoURL ? (
                                <img src={user.photoURL} alt="Profile" className="w-full h-full rounded-[1.8rem] object-cover" />
                            ) : (
                                <span>{user.displayName?.charAt(0) || 'U'}</span>
                            )}
                        </div>
                        <button 
                            onClick={() => setIsProfileModalOpen(true)}
                            className="absolute -bottom-2 -right-2 bg-white dark:bg-stone-800 text-slate-600 dark:text-stone-300 p-2 rounded-full shadow-lg border border-slate-200 dark:border-stone-700 hover:text-emerald-500 transition-colors"
                        >
                            <Pencil size={16} />
                        </button>
                    </div>

                    <div className="relative z-10 flex-1 text-center md:text-left min-w-0">
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-1 truncate">{user.displayName}</h2>
                        <p className="text-slate-500 dark:text-stone-400 font-medium bg-white/50 dark:bg-stone-800 px-4 py-1.5 rounded-full text-sm inline-block border border-slate-200 dark:border-stone-700">{user.email || 'Guest User'}</p>
                    </div>

                    <div className="relative z-10 w-full md:w-auto">
                        <button 
                            onClick={handleSignOut}
                            className="w-full md:w-auto px-6 py-3 bg-white dark:bg-stone-800 text-rose-500 border border-rose-100 dark:border-rose-900/30 rounded-xl font-bold hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-all flex items-center justify-center gap-2 shadow-sm"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>

                {/* Second Row: Appearance & Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Theme Settings */}
                    <div className="bg-white dark:bg-stone-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-stone-800 shadow-lg flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-slate-100 dark:bg-stone-800 text-slate-600 dark:text-stone-400 rounded-xl">
                            <Settings size={20} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">Appearance</h3>
                        </div>

                        <div className="bg-slate-50 dark:bg-stone-800 p-1 rounded-2xl border border-slate-100 dark:border-stone-700 flex">
                            <button
                                onClick={() => handleToggleTheme('auto')}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${(!user.theme || user.theme === 'auto') ? 'bg-white dark:bg-stone-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-stone-500'}`}
                            >
                                <Clock size={18} /> Auto
                            </button>
                            <button
                                onClick={() => handleToggleTheme('light')}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${(user.theme === 'light') ? 'bg-white dark:bg-stone-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-stone-500'}`}
                            >
                                <Sun size={18} /> Light
                            </button>
                            <button
                                onClick={() => handleToggleTheme('dark')}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${user.theme === 'dark' ? 'bg-white dark:bg-stone-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-stone-500'}`}
                            >
                                <Moon size={18} /> Dark
                            </button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 h-full">
                        <div className="bg-white dark:bg-stone-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-stone-800 shadow-lg flex flex-col items-center justify-center gap-2">
                            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 dark:text-emerald-400 flex items-center justify-center mb-1">
                                <Target size={20} />
                            </div>
                            <div className="text-3xl font-bold text-slate-900 dark:text-white">{goals.length}</div>
                            <div className="text-[10px] font-bold text-slate-400 dark:text-stone-500 uppercase tracking-widest text-center">Active Goals</div>
                        </div>
                        <div className="bg-white dark:bg-stone-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-stone-800 shadow-lg flex flex-col items-center justify-center gap-2">
                            <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-900/20 text-teal-500 dark:text-teal-400 flex items-center justify-center mb-1">
                                <Dumbbell size={20} />
                            </div>
                            <div className="text-3xl font-bold text-slate-900 dark:text-white">{habits.length}</div>
                            <div className="text-[10px] font-bold text-slate-400 dark:text-stone-500 uppercase tracking-widest text-center">Habits</div>
                        </div>
                    </div>
                </div>

                {/* Third Row: Dashboard Config */}
                <div className="bg-white dark:bg-stone-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-stone-800 shadow-lg">
                    <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-slate-100 dark:bg-stone-800 text-slate-600 dark:text-stone-400 rounded-xl">
                        <LayoutDashboard size={20} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">Dashboard Layout</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Style Selector */}
                    <div>
                        <label className="text-xs font-bold text-slate-400 dark:text-stone-500 uppercase tracking-wide block mb-3">Daily Briefing Style</label>
                        <div className="flex gap-2 flex-wrap">
                            {['standard', 'concise', 'thorough', 'motivating', 'fun'].map(style => (
                                <button
                                key={style}
                                onClick={() => handleUpdateDashboardConfig({ ...(user.dashboardConfig || DEFAULT_DASHBOARD_CONFIG), briefingStyle: style as any })}
                                className={`px-3 py-2 rounded-xl text-sm font-bold capitalize transition-all ${
                                    (user.dashboardConfig?.briefingStyle || 'standard') === style
                                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                                    : 'bg-white dark:bg-stone-800 text-slate-500 dark:text-stone-400 border border-slate-200 dark:border-stone-700 hover:border-emerald-200 dark:hover:border-emerald-700'
                                }`}
                                >
                                    {style}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Section Ordering */}
                    <div>
                        <label className="text-xs font-bold text-slate-400 dark:text-stone-500 uppercase tracking-wide block mb-2 px-1">Overview Sections</label>
                        <div className="space-y-2">
                        {[...(user.dashboardConfig?.sections || DEFAULT_DASHBOARD_CONFIG.sections)]
                            .sort((a,b) => a.order - b.order)
                            .map((section, index, arr) => (
                            <div key={section.id} className="flex items-center gap-3 bg-slate-50 dark:bg-stone-800/50 p-3 rounded-2xl border border-slate-100 dark:border-stone-700 shadow-sm hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors group">
                                <div className="flex-1 font-bold text-slate-700 dark:text-stone-300 ml-2 text-sm">{section.label}</div>
                                
                                <div className="flex items-center gap-1">
                                    <button 
                                        onClick={() => {
                                            const newSections = [...(user.dashboardConfig?.sections || [])];
                                            // Move up logic...
                                            // Ideally we use a helper, but inline here for brevity
                                        }}
                                        disabled={index === 0}
                                        className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-stone-600 text-slate-400 disabled:opacity-30 disabled:hover:bg-transparent"
                                    >
                                        <ArrowUp size={14} />
                                    </button>
                                    <button 
                                        disabled={index === arr.length - 1}
                                        className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-stone-600 text-slate-400 disabled:opacity-30 disabled:hover:bg-transparent"
                                    >
                                        <ArrowDown size={14} />
                                    </button>
                                </div>

                                <div className="w-px h-6 bg-slate-200 dark:bg-stone-600 mx-1"></div>

                                <button 
                                    onClick={() => {
                                        // toggle visibility logic
                                    }}
                                    className={`p-1.5 rounded-xl transition-all ${
                                        section.visible 
                                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' 
                                        : 'bg-slate-200 dark:bg-stone-700 text-slate-400 grayscale'
                                    }`}
                                    title={section.visible ? "Hide Section" : "Show Section"}
                                >
                                    {section.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                                </button>
                            </div>
                        ))}
                        </div>
                    </div>
                    </div>
                </div>
            </div>
          </div>
        )}
      </main>

      <ChatWidget 
        dashboardState={dashboardState} 
        user={user} 
        onEventChange={() => user && syncEvents(user)}
      />
      
      <GoalFormModal 
        isOpen={isGoalModalOpen} 
        onClose={() => setIsGoalModalOpen(false)} 
        onSave={handleSaveGoal}
        editingGoal={editingGoal}
        defaultValues={goalDefaultValues}
        existingGoals={goals}
      />

      <HabitFormModal
        isOpen={isHabitModalOpen}
        onClose={() => setIsHabitModalOpen(false)}
        onSave={handleSaveHabit}
        editingHabit={editingHabit}
        defaultValues={habitDefaultValues}
        existingHabits={habits}
        existingGoals={goals}
      />

      <HabitHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        habit={viewingHabitHistory}
        habitLogs={habitLogs}
        onToggleHabit={handleToggleHabit}
        initialView={historyViewMode}
        onUpdateNote={handleUpdateHabitNote}
        onDeleteLog={handleDeleteHabitLog}
      />

      <EventFormModal
        isOpen={isDashboardEventModalOpen}
        onClose={() => setIsDashboardEventModalOpen(false)}
        onSave={handleAddEvent}
        onUpdate={handleEditEvent}
        onDelete={handleDeleteEvent}
        editingEvent={dashboardEvent}
      />

      {user && (
        <ProfileAvatarModal
            isOpen={isProfileModalOpen}
            onClose={() => setIsProfileModalOpen(false)}
            onSave={handleUpdateProfile}
            currentUser={user}
        />
      )}
    </div>
  );
}