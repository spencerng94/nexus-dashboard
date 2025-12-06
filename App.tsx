
import React, { useState, useEffect } from 'react';
import { Plus, Loader2, Sparkles, RefreshCw, Target, Dumbbell, Pencil, Smile, Type, Check, X, Settings, ArrowUp, ArrowDown, Eye, EyeOff, LayoutDashboard, Moon, Sun, Clock } from 'lucide-react';
import { Goal, Habit, HabitLog, CalendarEvent, User, ImportantDate, DashboardConfig, BriefingStyle, Theme } from './types';
import { storageService } from './services/storage';
import { googleService } from './services/google';
import { weatherService } from './services/weather';
import { generateDailyBriefing, generateSuggestions } from './services/gemini';

// Components
import Sidebar from './components/Sidebar';
import LoginScreen from './components/LoginScreen';
import ChatWidget from './components/ChatWidget';
import CalendarView from './components/CalendarView';
import AboutView from './components/AboutView'; 
import PlannerView from './components/PlannerView';
import { DashboardView, CategoryFilter } from './components/DashboardComponents';
import { ProgressCard, GoalFormModal, GoalSuggestionCard, SuggestionControl as GoalSuggestionControl } from './components/GoalComponents';
import { HabitCard, HabitFormModal, HabitHistoryModal, HabitSuggestionCard, SuggestionControl as HabitSuggestionControl } from './components/HabitComponents';

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
  // Use lazy initializer for user to avoid flash of login screen if user exists
  const [user, setUser] = useState<User | null>(() => {
    try {
        return storageService.getUser();
    } catch {
        return null;
    }
  });

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
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false); // Used for Habit History Modal
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [goalDefaultValues, setGoalDefaultValues] = useState<{title?: string, category?: string, icon?: string} | undefined>(undefined);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [habitDefaultValues, setHabitDefaultValues] = useState<{title?: string, category?: string, icon?: string} | undefined>(undefined);
  const [viewingHabitHistory, setViewingHabitHistory] = useState<Habit | null>(null);
  const [historyViewMode, setHistoryViewMode] = useState<'calendar' | 'list'>('calendar');

  // Profile Modal State
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Suggestions State
  const [suggestedGoals, setSuggestedGoals] = useState<Array<{title: string, category: string, icon: string}>>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  // Habit Suggestions State
  const [suggestedHabits, setSuggestedHabits] = useState<Array<{title: string, category: string, icon: string}>>([]);
  const [isLoadingHabitSuggestions, setIsLoadingHabitSuggestions] = useState(false);

  // Category Filtering State
  const [selectedGoalCategory, setSelectedGoalCategory] = useState<string>('All');
  const [selectedHabitCategory, setSelectedHabitCategory] = useState<string>('All');

  // Sync Theme with User Preference
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
    // Check every minute for auto update
    const interval = setInterval(applyTheme, 60000);
    return () => clearInterval(interval);
  }, [user?.theme]);

  // Load User on Mount (Logic primarily for side effects like weather fetching now)
  useEffect(() => {
    try {
      if (user) {
        // Fetch Weather
        weatherService.getCurrentWeather().then(data => {
            if (data) setWeather(data);
        });

        // Load local data synchronously to ensure we have it for the briefing
        const localGoals = storageService.getGoals();
        const localHabits = storageService.getHabits();
        const localLogs = storageService.getHabitLogs();
        const localDates = storageService.getImportantDates();

        setGoals(localGoals);
        setHabits(localHabits);
        setHabitLogs(localLogs);
        setImportantDates(localDates);

        syncEvents();
      }
    } catch (e) {
      console.error("Initialization error:", e);
    } finally {
      setIsLoadingAuth(false);
    }
  }, [user]); // user is now stable from state, but logic only needs to run when user context becomes valid

  // Event Sync Logic - extracted for re-use
  const syncEvents = async () => {
    if (!user) return;
    let currentEvents: CalendarEvent[] = [];
    
    // Only attempt sync if we have a real access token AND we are not a guest
    if (user.accessToken && !user.isGuest) {
        try {
            setCalendarError(null);
            const googleEvents = await googleService.listEvents(user.accessToken);
            currentEvents = googleEvents;
            setEvents(googleEvents);
        } catch (e: any) {
            console.error("Failed to sync Google Calendar", e);
            setCalendarError(e.message || "Failed to sync Calendar");
            // Fallback to local
            const localEvents = storageService.getEvents();
            currentEvents = localEvents;
            setEvents(localEvents);
        }
    } else {
        // Guest mode or no token: use local events only
        const localEvents = storageService.getEvents();
        currentEvents = localEvents;
        setEvents(localEvents);
    }

    // Refresh briefing if it hasn't been generated yet
    if (!briefing && goals.length > 0) {
        generateBriefingHelper(goals, currentEvents, habits);
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

  const handleLogin = async () => {
    setLoginError("");

    // Retrieve Client ID from environment variables (Support standard Create React App or Vite patterns)
    // @ts-ignore
    const envClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!envClientId) {
      const msg = "Configuration Error: Google Client ID is missing. Please set REACT_APP_GOOGLE_CLIENT_ID or VITE_GOOGLE_CLIENT_ID in your environment variables.";
      setLoginError(msg);
      return;
    }

    try {
        googleService.init(envClientId);
        const loggedInUser = await googleService.login();
        
        // Auto-detect theme preference if new user
        if (!loggedInUser.theme) loggedInUser.theme = 'auto';
        
        storageService.saveUser(loggedInUser);
        setUser(loggedInUser);
        // Note: useEffect[user] will trigger syncEvents
        
    } catch (e: any) {
        console.error("Login Error:", e);
        const errMsg = e.message || (e.error ? `Google Error: ${e.error}` : "Login Failed");
        setLoginError(errMsg);
    }
  };

  const handleGuestLogin = () => {
    const guestUser: User = {
        uid: 'guest-' + Date.now(),
        displayName: 'Guest User',
        photoURL: null,
        email: null,
        isGuest: true,
        theme: 'auto',
        dashboardConfig: DEFAULT_DASHBOARD_CONFIG
    };
    storageService.saveUser(guestUser);
    setUser(guestUser);
    // Note: useEffect[user] will trigger syncEvents which handles guest mode
  };

  const handleSignOut = () => {
    storageService.clearUser();
    setUser(null);
    setEvents([]);
    setBriefing("");
    setCalendarError(null);
    document.documentElement.classList.remove('dark'); // Reset theme
  };

  const handleUpdateProfile = (customAvatar: User['customAvatar']) => {
    if (!user) return;
    const updatedUser = { ...user, customAvatar };
    setUser(updatedUser);
    storageService.saveUser(updatedUser);
  };

  const handleToggleTheme = (theme: Theme) => {
    if (!user) return;
    const updatedUser = { ...user, theme };
    setUser(updatedUser);
    storageService.saveUser(updatedUser);
  };

  // Wrapper for sidebar toggle - switches between light/dark manually overriding auto if active
  const toggleTheme = () => {
    if (!user) return;
    let currentTheme = user.theme;
    
    // Resolve auto to actual current state for toggling purposes
    if (currentTheme === 'auto' || !currentTheme) {
        const hour = new Date().getHours();
        const effective = (hour >= 6 && hour < 18) ? 'light' : 'dark';
        handleToggleTheme(effective === 'light' ? 'dark' : 'light');
    } else {
        // Standard toggle
        handleToggleTheme(currentTheme === 'dark' ? 'light' : 'dark');
    }
  };

  // --- DASHBOARD CONFIG UPDATES ---
  const handleUpdateDashboardConfig = (newConfig: DashboardConfig) => {
      if (!user) return;
      const oldStyle = user.dashboardConfig?.briefingStyle;
      const updatedUser = { ...user, dashboardConfig: newConfig };
      setUser(updatedUser);
      storageService.saveUser(updatedUser);

      // If briefing style changed, refresh immediately
      if (oldStyle !== newConfig.briefingStyle) {
          generateBriefingHelper(goals, events, habits, newConfig.briefingStyle);
      }
  };

  const toggleSectionVisibility = (id: string) => {
      if (!user) return;
      const config = user.dashboardConfig || DEFAULT_DASHBOARD_CONFIG;
      const newSections = config.sections.map(s => 
          s.id === id ? { ...s, visible: !s.visible } : s
      );
      handleUpdateDashboardConfig({ ...config, sections: newSections });
  };

  const moveSection = (id: string, direction: 'up' | 'down') => {
      if (!user) return;
      const config = user.dashboardConfig || DEFAULT_DASHBOARD_CONFIG;
      const sections = [...config.sections].sort((a,b) => a.order - b.order);
      const index = sections.findIndex(s => s.id === id);
      
      if (index === -1) return;
      if (direction === 'up' && index === 0) return;
      if (direction === 'down' && index === sections.length - 1) return;

      const swapIndex = direction === 'up' ? index - 1 : index + 1;
      
      // Swap orders
      const tempOrder = sections[index].order;
      sections[index].order = sections[swapIndex].order;
      sections[swapIndex].order = tempOrder;

      handleUpdateDashboardConfig({ ...config, sections });
  };

  // --- GOAL HANDLERS ---
  const handleSaveGoal = (goalData: Omit<Goal, 'id' | 'progress'>) => {
    let updatedGoals = [...goals];
    if (editingGoal) {
      updatedGoals = updatedGoals.map(g => g.id === editingGoal.id ? { ...g, ...goalData } : g);
    } else {
      updatedGoals.push({ ...goalData, id: Date.now().toString(), progress: 0 });
    }
    setGoals(updatedGoals);
    storageService.saveGoals(updatedGoals);
  };

  const handleDeleteGoal = (id: string) => {
    const updatedGoals = goals.filter(g => g.id !== id);
    setGoals(updatedGoals);
    storageService.saveGoals(updatedGoals);
  };

  const handleGoalIncrement = (id: string) => {
    const updatedGoals = goals.map(g => {
      if (g.id === id) {
        return { ...g, progress: Math.min(g.progress + 1, g.target) };
      }
      return g;
    });
    setGoals(updatedGoals);
    storageService.saveGoals(updatedGoals);
  };

  const handleGoalDecrement = (id: string) => {
    const updatedGoals = goals.map(g => {
      if (g.id === id) {
        return { ...g, progress: Math.max(g.progress - 1, 0) };
      }
      return g;
    });
    setGoals(updatedGoals);
    storageService.saveGoals(updatedGoals);
  };

  const handleToggleSubgoal = (goalId: string, subgoalId: string) => {
      const updatedGoals = goals.map(g => {
          if (g.id === goalId && g.subgoals) {
              const updatedSubgoals = g.subgoals.map(s => 
                  s.id === subgoalId ? { ...s, completed: !s.completed } : s
              );
              const newProgress = updatedSubgoals.filter(s => s.completed).length;
              return { ...g, subgoals: updatedSubgoals, progress: newProgress };
          }
          return g;
      });
      setGoals(updatedGoals);
      storageService.saveGoals(updatedGoals);
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

  // --- HABIT HANDLERS ---
  const handleSaveHabit = (habitData: Omit<Habit, 'id' | 'streak'>) => {
    let updatedHabits = [...habits];
    if (editingHabit) {
      updatedHabits = updatedHabits.map(h => h.id === editingHabit.id ? { ...h, ...habitData } : h);
    } else {
      updatedHabits.push({ ...habitData, id: Date.now().toString(), streak: 0 });
    }
    setHabits(updatedHabits);
    storageService.saveHabits(updatedHabits);
  };

  const handleDeleteHabit = (id: string) => {
    const updatedHabits = habits.filter(h => h.id !== id);
    setHabits(updatedHabits);
    storageService.saveHabits(updatedHabits);
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

  const formatLocalYMD = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const updateStreaks = (currentHabits: Habit[], currentLogs: Record<string, HabitLog>) => {
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
    storageService.saveHabits(updatedHabits);
  };

  const handleToggleHabit = (habitId: string, isCompleted: boolean, dateKey?: string) => {
     const date = dateKey || formatLocalYMD(new Date());
     const logId = `${habitId}_${date}`;
     
     const updatedLogs = { ...habitLogs };
     
     if (isCompleted) {
       updatedLogs[logId] = {
         habitId,
         date: date,
         completed: true,
         note: ""
       };
     } else {
       delete updatedLogs[logId];
     }
     
     setHabitLogs(updatedLogs);
     storageService.saveHabitLogs(updatedLogs);
     updateStreaks(habits, updatedLogs);

     // --- LINKED GOALS LOGIC ---
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
                currentGoalsSnapshot[goalIndex] = { ...g, progress: newProgress };
            }
        });
        setGoals(currentGoalsSnapshot);
        storageService.saveGoals(currentGoalsSnapshot);
     }
  };

  const handleDeleteHabitLog = (habitId: string, dateKey: string) => {
     const logId = `${habitId}_${dateKey}`;
     if (habitLogs[logId]) {
         const updatedLogs = { ...habitLogs };
         delete updatedLogs[logId];
         setHabitLogs(updatedLogs);
         storageService.saveHabitLogs(updatedLogs);
         updateStreaks(habits, updatedLogs);
         
         const habit = habits.find(h => h.id === habitId);
         if (habit && habit.linkedGoalIds && habit.linkedGoalIds.length > 0) {
             let currentGoalsSnapshot = [...goals];
             habit.linkedGoalIds.forEach(goalId => {
                 const goalIndex = currentGoalsSnapshot.findIndex(g => g.id === goalId);
                 if (goalIndex !== -1) {
                     const g = currentGoalsSnapshot[goalIndex];
                     const newProgress = Math.max(g.progress - 1, 0);
                     currentGoalsSnapshot[goalIndex] = { ...g, progress: newProgress };
                 }
             });
             setGoals(currentGoalsSnapshot);
             storageService.saveGoals(currentGoalsSnapshot);
         }
     }
  };

  const handleUpdateHabitNote = (habitId: string, note: string, dateKey?: string) => {
    const date = dateKey || formatLocalYMD(new Date());
    const logId = `${habitId}_${date}`;
    
    if (habitLogs[logId]) {
        const updatedLogs = {
            ...habitLogs,
            [logId]: { ...habitLogs[logId], note }
        };
        setHabitLogs(updatedLogs);
        storageService.saveHabitLogs(updatedLogs);
    }
  };

  // --- EVENT HANDLERS ---
  const handleAddEvent = async (newEventData: Omit<CalendarEvent, 'id'>) => {
    const tempId = Date.now().toString();
    const tempEvent = { ...newEventData, id: tempId };
    const optimisticEvents = [...events, tempEvent].sort((a, b) => 
       new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
    setEvents(optimisticEvents);

    // Only sync to Google if real user and not guest
    if (user?.accessToken && !user.isGuest) {
        try {
            const createdEvent = await googleService.createEvent(user.accessToken, newEventData);
            if (createdEvent) {
                setEvents(prev => prev.map(e => e.id === tempId ? createdEvent : e));
            }
        } catch (e: any) {
            console.error("Failed to save to Google Calendar", e);
            alert("Failed to save to Google Calendar: " + e.message);
            // Fallback to local is already done via optimistic set, but ensure persistence
            storageService.saveEvents(optimisticEvents); 
        }
    } else {
        // Guest: save to local storage
        storageService.saveEvents(optimisticEvents);
    }
  };

  const handleBatchAddEvents = async (newEvents: Omit<CalendarEvent, 'id'>[]) => {
     for (const evt of newEvents) {
         await handleAddEvent(evt);
     }
  };

  // --- IMPORTANT DATES HANDLERS ---
  const handleAddImportantDate = (newDate: Omit<ImportantDate, 'id'>) => {
    const updated = [...importantDates, { ...newDate, id: Date.now().toString() }];
    setImportantDates(updated);
    storageService.saveImportantDates(updated);
  };

  const handleEditImportantDate = (date: ImportantDate) => {
    const updated = importantDates.map(d => d.id === date.id ? date : d);
    setImportantDates(updated);
    storageService.saveImportantDates(updated);
  };

  const handleDeleteImportantDate = (id: string) => {
    const updated = importantDates.filter(d => d.id !== id);
    setImportantDates(updated);
    storageService.saveImportantDates(updated);
  };

  const openHabitHistory = (habit: Habit, view: 'calendar' | 'list') => {
    setViewingHabitHistory(habit);
    setHistoryViewMode(view);
    setIsHistoryModalOpen(true);
  };

  const getCategories = (items: { category?: string }[]) => {
    const cats = new Set(items.map(i => i.category || 'Uncategorized'));
    return Array.from(cats).sort();
  };

  const renderGoalsGrid = () => {
    const goalCategories = getCategories(goals);
    const visibleCategories = selectedGoalCategory === 'All' ? goalCategories : [selectedGoalCategory];

    return (
      <div className="space-y-12">
        {visibleCategories.map(cat => {
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
    );
  };

  const renderHabitsGrid = () => {
    const habitCategories = getCategories(habits);
    const visibleCategories = selectedHabitCategory === 'All' ? habitCategories : [selectedHabitCategory];

    return (
      <div className="space-y-12">
        {visibleCategories.map(cat => {
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
                        onViewHistory={openHabitHistory}
                      />
                    ))}
                 </div>
              </div>
           );
        })}
      </div>
    );
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
      
      <main className="md:pl-[120px] lg:pl-[360px] p-6 pb-32 md:pb-10 min-h-screen transition-all duration-300">
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
            onViewHabitHistory={openHabitHistory}
            onToggleSubgoal={handleToggleSubgoal}
          />
        )}
        {activeTab === 'planner' && (
            <PlannerView 
                existingEvents={events} 
                onAddEvents={handleBatchAddEvents} 
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
                categories={getCategories(goals)} 
                selected={selectedGoalCategory}
                onSelect={setSelectedGoalCategory}
             />

             {goals.length > 0 ? (
               renderGoalsGrid()
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
        {activeTab === 'calendar' && (
          <CalendarView 
            events={events} 
            importantDates={importantDates} 
            onAddEvent={handleAddEvent}
            habits={habits}
            habitLogs={habitLogs}
          />
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
                categories={getCategories(habits)} 
                selected={selectedHabitCategory}
                onSelect={setSelectedHabitCategory}
             />
             
             {habits.length > 0 ? (
               renderHabitsGrid()
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
                                        onClick={() => moveSection(section.id, 'up')}
                                        disabled={index === 0}
                                        className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-stone-600 text-slate-400 disabled:opacity-30 disabled:hover:bg-transparent"
                                    >
                                        <ArrowUp size={14} />
                                    </button>
                                    <button 
                                        onClick={() => moveSection(section.id, 'down')}
                                        disabled={index === arr.length - 1}
                                        className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-stone-600 text-slate-400 disabled:opacity-30 disabled:hover:bg-transparent"
                                    >
                                        <ArrowDown size={14} />
                                    </button>
                                </div>

                                <div className="w-px h-6 bg-slate-200 dark:bg-stone-600 mx-1"></div>

                                <button 
                                    onClick={() => toggleSectionVisibility(section.id)}
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
        onEventChange={syncEvents}
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
