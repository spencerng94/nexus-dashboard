
import React, { useState, useEffect } from 'react';
import { Plus, Loader2, Sparkles, RefreshCw, Target, Dumbbell, Pencil, Smile, Type, Check, X, Settings } from 'lucide-react';
import { Goal, Habit, HabitLog, CalendarEvent, User, ImportantDate } from './types';
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
import { DashboardView } from './components/DashboardComponents';
import { ProgressCard, GoalFormModal, GoalSuggestionCard, SuggestionControl as GoalSuggestionControl } from './components/GoalComponents';
import { HabitCard, HabitFormModal, HabitHistoryModal, HabitSuggestionCard, SuggestionControl as HabitSuggestionControl } from './components/HabitComponents';

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
      <div className="bg-white rounded-[2rem] p-8 w-full max-w-sm shadow-2xl border border-white/50 animate-in fade-in zoom-in duration-300">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-900">Customize Profile</h3>
          <button onClick={onClose} className="p-2 lg:hover:bg-slate-100 rounded-full transition-colors text-slate-400 lg:hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
            <button 
                onClick={() => setActiveTab('initials')}
                className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'initials' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
            >
                <Type size={16} /> Initials
            </button>
            <button 
                onClick={() => setActiveTab('emoji')}
                className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'emoji' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
            >
                <Smile size={16} /> Emoji
            </button>
        </div>

        {/* Content */}
        <div className="mb-8">
            {activeTab === 'initials' ? (
                <div className="space-y-4">
                    <div className="flex justify-center mb-6">
                        <div className={`w-24 h-24 rounded-full bg-${selectedColor}-500 flex items-center justify-center text-4xl font-bold text-white shadow-xl ring-4 ring-${selectedColor}-100 transition-colors`}>
                            {currentUser.displayName?.charAt(0).toUpperCase() || 'U'}
                        </div>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                        {colors.map(c => (
                            <button
                                key={c}
                                onClick={() => setSelectedColor(c)}
                                className={`w-10 h-10 rounded-full bg-${c}-500 flex items-center justify-center transition-transform hover:scale-110 ${selectedColor === c ? 'ring-2 ring-offset-2 ring-slate-300 scale-110' : ''}`}
                            >
                                {selectedColor === c && <Check size={16} className="text-white" strokeWidth={3} />}
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="flex justify-center mb-6">
                        <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center text-5xl shadow-inner">
                            {selectedEmoji}
                        </div>
                    </div>
                    <div className="grid grid-cols-4 gap-3 h-40 overflow-y-auto custom-scrollbar p-1">
                        {emojis.map(e => (
                            <button
                                key={e}
                                onClick={() => setSelectedEmoji(e)}
                                className={`w-12 h-12 rounded-xl text-2xl flex items-center justify-center transition-all hover:bg-slate-50 ${selectedEmoji === e ? 'bg-white shadow-md ring-2 ring-emerald-500/20' : 'grayscale opacity-70 hover:grayscale-0 hover:opacity-100'}`}
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
            className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-lg"
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

  // Load User on Mount
  useEffect(() => {
    try {
      const loadedUser = storageService.getUser();
      if (loadedUser) {
        setUser(loadedUser);
      }
    } catch (e) {
      console.error("Initialization error:", e);
    } finally {
      // Wrap in try-finally in case something throws, ensuring we don't get stuck on loader
      try {
        setIsLoadingAuth(false);
      } catch (e) {}
    }
  }, []);

  // Event Sync Logic - extracted for re-use
  const syncEvents = async () => {
    if (!user) return;
    let currentEvents: CalendarEvent[] = [];
    
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
        const localEvents = storageService.getEvents();
        currentEvents = localEvents;
        setEvents(localEvents);
    }

    // Refresh briefing if it hasn't been generated yet
    if (!briefing && goals.length > 0) {
        generateBriefingHelper(goals, currentEvents, habits);
    }
  };

  // Load Data when User loads
  useEffect(() => {
    if (!user) return;
    
    // Load local data synchronously to ensure we have it for the briefing
    const localGoals = storageService.getGoals();
    const localHabits = storageService.getHabits();
    const localLogs = storageService.getHabitLogs();
    const localDates = storageService.getImportantDates();

    setGoals(localGoals);
    setHabits(localHabits);
    setHabitLogs(localLogs);
    setImportantDates(localDates);

    // Fetch Weather
    weatherService.getCurrentWeather().then(data => {
      if (data) setWeather(data);
    });

    syncEvents();

  }, [user]);

  const generateBriefingHelper = async (
      currentGoals = goals, 
      currentEvents = events, 
      currentHabits = habits
    ) => {
    setIsGeneratingBriefing(true);
    const newBriefing = await generateDailyBriefing(currentGoals, currentEvents, currentHabits);
    setBriefing(newBriefing);
    setIsGeneratingBriefing(false);
  };

  const handleLogin = async (clientId: string) => {
    setLoginError("");
    try {
        let finalClientId = clientId;
        // Fallback to env var if missing
        if (!finalClientId) {
          try {
             // @ts-ignore
             if (typeof process !== 'undefined' && process.env) {
               // @ts-ignore
               finalClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
             }
          } catch(e) {}
        }
        
        if (!finalClientId) throw new Error("Please configure a Client ID first.");
        
        googleService.init(finalClientId);
        const loggedInUser = await googleService.login();
        storageService.saveUser(loggedInUser);
        setUser(loggedInUser);
    } catch (e: any) {
        console.error(e);
        const errMsg = e.message || (e.error ? `Google Error: ${e.error}` : "Login Failed");
        setLoginError(errMsg);
        throw e; // Re-throw so button knows to stop loading
    }
  };

  const handleGuestLogin = () => {
    const newUser: User = { uid: 'guest', displayName: 'Guest', photoURL: null, isGuest: true };
    storageService.saveUser(newUser);
    setUser(newUser);
  };

  const handleSignOut = () => {
    storageService.clearUser();
    setUser(null);
    setEvents([]);
    setBriefing("");
    setCalendarError(null);
  };

  const handleUpdateProfile = (customAvatar: User['customAvatar']) => {
    if (!user) return;
    const updatedUser = { ...user, customAvatar };
    setUser(updatedUser);
    storageService.saveUser(updatedUser);
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
        // Check backwards from today
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
        // Iterate through all linked goals
        // If Habit is marked completed -> Increment Goal Progress
        // If Habit is un-marked -> Decrement Goal Progress
        // Note: We use the existing increment/decrement handlers which update state and storage.
        // We need to call them in a way that respects the latest state. 
        // Since setState is async, we shouldn't rely on 'goals' state inside loop immediately if multiple updates occur.
        // However, handleGoalIncrement does full immutable update based on 'goals'.
        
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

        // Batch update to prevent multiple re-renders
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
         
         // Note: Deleting a log via history modal (past date) ideally should decrement the linked goal too.
         // Re-using the toggle logic or replicating it:
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
    // Optimistic Update
    const tempId = Date.now().toString();
    const tempEvent = { ...newEventData, id: tempId };
    const optimisticEvents = [...events, tempEvent].sort((a, b) => 
       new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
    setEvents(optimisticEvents);

    if (user?.accessToken && !user.isGuest) {
        try {
            const createdEvent = await googleService.createEvent(user.accessToken, newEventData);
            if (createdEvent) {
                // Replace temp event with real one
                setEvents(prev => prev.map(e => e.id === tempId ? createdEvent : e));
            }
        } catch (e: any) {
            console.error("Failed to save to Google Calendar", e);
            alert("Failed to save to Google Calendar: " + e.message);
            storageService.saveEvents(optimisticEvents); 
        }
    } else {
        storageService.saveEvents(optimisticEvents);
    }
  };

  // Batch Add Events (For Planner)
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

  if (isLoadingAuth) return <div className="h-screen flex items-center justify-center bg-[#F5F5F7]"><Loader2 className="animate-spin text-slate-400" size={32} /></div>;

  if (!user) return <LoginScreen onLogin={handleLogin} onGuestLogin={handleGuestLogin} loginError={loginError} />;

  const dashboardState = { goals, events, habits };

  return (
    <div className="bg-[#F5F5F7] min-h-screen font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user} 
        onSignOut={handleSignOut} 
        onProfileClick={() => setActiveTab('settings')}
      />
      
      {/* Increased padding-left to separate sidebar from content */}
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
                    <h1 className="text-2xl md:text-4xl font-bold text-slate-900 tracking-tight">Goals & Focus</h1>
                    <p className="text-emerald-500 font-bold text-xs md:text-sm mt-1 uppercase tracking-wider">Set targets and visualize your progress</p>
                 </div>
               </div>
               <button 
                onClick={() => { setEditingGoal(null); setGoalDefaultValues(undefined); setIsGoalModalOpen(true); }}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 md:px-6 md:py-3 rounded-2xl font-bold shadow-lg shadow-emerald-500/30 lg:hover:scale-105 transition-all flex items-center gap-2 shrink-0 text-sm md:text-base"
               >
                 <Plus size={20} /> <span className="hidden md:inline">New Goal</span><span className="md:hidden">New</span>
               </button>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {goals.map(goal => (
                <ProgressCard 
                  key={goal.id} 
                  goal={goal} 
                  linkedHabits={habits.filter(h => h.linkedGoalIds?.includes(goal.id))}
                  onIncrement={handleGoalIncrement} 
                  onDecrement={handleGoalDecrement}
                  onDelete={handleDeleteGoal}
                  onEdit={(goal) => { setEditingGoal(goal); setIsGoalModalOpen(true); }}
                />
              ))}
              <button 
                onClick={() => { setEditingGoal(null); setGoalDefaultValues(undefined); setIsGoalModalOpen(true); }}
                className="border-2 border-dashed border-slate-200/60 rounded-[2rem] p-6 flex flex-col items-center justify-center text-slate-400 lg:hover:border-emerald-400/50 lg:hover:bg-emerald-50/30 transition-all duration-300 group min-h-[140px] md:min-h-[200px]"
              >
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-slate-50 lg:group-hover:bg-emerald-100 flex items-center justify-center mb-3 transition-colors">
                  <Plus size={24} className="lg:group-hover:text-emerald-500 md:w-7 md:h-7" />
                </div>
                <span className="font-bold text-sm">Create New Goal</span>
              </button>
             </div>

             {/* Goal Suggestions Section */}
             <div className="mt-12">
               <div className="flex items-center gap-3 mb-6">
                 <div className="p-2 bg-emerald-50 rounded-xl text-emerald-500">
                   <Sparkles size={20} />
                 </div>
                 <h2 className="text-2xl font-bold text-slate-900">Suggested for you</h2>
               </div>

               <GoalSuggestionControl 
                 onGenerate={loadGoalSuggestions} 
                 isLoading={isLoadingSuggestions}
                 categories={['Health', 'Career', 'Learning', 'Finance', 'Mindfulness', 'Fitness']}
               />
               
               {isLoadingSuggestions ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
                   {[1,2,3,4].map(i => (
                     <div key={i} className="h-32 bg-slate-100 rounded-[1.5rem]" />
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
                 <div className="bg-white/50 border border-slate-100 rounded-[1.5rem] p-8 text-center">
                   <p className="text-slate-500 font-medium">Select a topic or type your own to get personalized goal suggestions.</p>
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
                   <h1 className="text-2xl md:text-4xl font-bold text-slate-900 tracking-tight">Habit Tracker</h1>
                   <p className="text-emerald-500 font-bold text-xs md:text-sm mt-1 uppercase tracking-wider">Build consistency one day at a time</p>
                 </div>
               </div>
               <button 
                onClick={() => { setEditingHabit(null); setHabitDefaultValues(undefined); setIsHabitModalOpen(true); }}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 md:px-6 md:py-3 rounded-2xl font-bold shadow-lg shadow-emerald-500/30 lg:hover:scale-105 transition-all flex items-center gap-2 shrink-0 text-sm md:text-base"
               >
                 <Plus size={20} /> <span className="hidden md:inline">New Habit</span><span className="md:hidden">New</span>
               </button>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {habits.map(habit => {
                return (
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
                );
              })}
              <button 
                onClick={() => { setEditingHabit(null); setHabitDefaultValues(undefined); setIsHabitModalOpen(true); }}
                className="border-2 border-dashed border-slate-200/60 rounded-[2rem] p-6 flex flex-col items-center justify-center text-slate-400 lg:hover:border-emerald-400/50 lg:hover:bg-emerald-50/30 transition-all duration-300 group min-h-[140px] md:min-h-[200px]"
              >
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-slate-50 lg:group-hover:bg-emerald-100 flex items-center justify-center mb-3 transition-colors">
                  <Plus size={24} className="lg:group-hover:text-emerald-500 md:w-7 md:h-7" />
                </div>
                <span className="font-bold text-sm">Create New Habit</span>
              </button>
             </div>

             {/* Habit Suggestions Section */}
             <div className="mt-12">
               <div className="flex items-center gap-3 mb-6">
                 <div className="p-2 bg-emerald-50 rounded-xl text-emerald-500">
                   <Sparkles size={20} />
                 </div>
                 <h2 className="text-2xl font-bold text-slate-900">Suggested for you</h2>
               </div>
               
               <HabitSuggestionControl 
                  onGenerate={loadHabitSuggestions}
                  isLoading={isLoadingHabitSuggestions}
                  categories={['Morning Routine', 'Health', 'Mental Wellness', 'Productivity', 'Learning', 'Night Routine']}
               />

               {isLoadingHabitSuggestions ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
                   {[1,2,3,4].map(i => (
                     <div key={i} className="h-32 bg-slate-100 rounded-[1.5rem]" />
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
                 <div className="bg-white/50 border border-slate-100 rounded-[1.5rem] p-8 text-center">
                   <p className="text-slate-500 font-medium">Select a topic or type your own to get personalized habit suggestions.</p>
                 </div>
               )}
             </div>
          </div>
        )}
        {activeTab === 'about' && (
           <AboutView />
        )}
        {activeTab === 'settings' && (
          <div className="max-w-[1600px] mx-auto">
             <div className="flex items-center gap-4 mb-8">
                 <div className="w-10 h-10 md:w-14 md:h-14 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
                    <Settings className="text-white w-5 h-5 md:w-8 md:h-8" />
                 </div>
                 <div>
                    <h1 className="text-2xl md:text-4xl font-bold text-slate-900 tracking-tight">Profile & Settings</h1>
                    <p className="text-emerald-500 font-bold text-xs md:text-sm mt-1 uppercase tracking-wider">Manage your account and preferences</p>
                 </div>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Col: Profile Identity */}
                <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100 flex flex-col items-center text-center relative overflow-hidden group h-full">
                    <div className="absolute top-0 w-full h-32 bg-gradient-to-r from-emerald-100 to-teal-100 opacity-50"></div>
                    
                    <div className="relative z-10 mb-6 mt-4">
                        <div className={`w-32 h-32 rounded-[2rem] flex items-center justify-center text-5xl font-bold text-white shadow-xl p-1 border-4 border-white lg:group-hover:scale-105 transition-transform duration-300 ${user.customAvatar?.type === 'emoji' ? 'bg-slate-100' : 'bg-gradient-to-tr from-emerald-400 to-teal-500'}`}>
                            {user.customAvatar ? (
                                user.customAvatar.type === 'emoji' ? (
                                    <span className="text-7xl">{user.customAvatar.value}</span>
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
                            className="absolute -bottom-2 -right-2 bg-white text-slate-600 p-2.5 rounded-full shadow-lg border border-slate-200 lg:hover:bg-slate-50 lg:hover:text-emerald-500 transition-colors"
                            title="Edit Profile Picture"
                        >
                            <Pencil size={18} />
                        </button>
                    </div>
                    
                    <h2 className="text-2xl font-bold text-slate-900 mb-1">{user.displayName}</h2>
                    <p className="text-slate-500 font-medium bg-slate-50 px-4 py-1.5 rounded-full text-sm inline-block border border-slate-100">{user.email || 'Guest User'}</p>
                </div>

                {/* Right Col: Stats & Actions */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-lg flex flex-col items-center justify-center gap-2 lg:hover:shadow-xl transition-shadow">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center mb-2">
                                <Target size={24} />
                            </div>
                            <div className="text-4xl font-bold text-slate-900">{goals.length}</div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Goals</div>
                        </div>
                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-lg flex flex-col items-center justify-center gap-2 lg:hover:shadow-xl transition-shadow">
                            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-500 flex items-center justify-center mb-2">
                                <Dumbbell size={24} />
                            </div>
                            <div className="text-4xl font-bold text-slate-900">{habits.length}</div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tracked Habits</div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-lg flex-1 flex flex-col justify-center items-center gap-6">
                        <div className="text-center max-w-md">
                            <h3 className="font-bold text-slate-900 text-lg mb-2">Account Management</h3>
                            <p className="text-slate-500 text-sm">Sign out to switch accounts or clear your local session.</p>
                        </div>
                        <button 
                            onClick={handleSignOut}
                            className="w-full max-w-sm py-4 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-2xl font-bold lg:hover:from-red-600 lg:hover:to-rose-700 transition-all shadow-lg shadow-red-500/20 lg:hover:shadow-xl lg:hover:shadow-red-500/30 flex items-center justify-center gap-2"
                        >
                            Sign Out
                        </button>
                        <p className="text-xs text-slate-300 font-mono">v1.2.0 • Nexus Dashboard</p>
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
      />

      <HabitFormModal
        isOpen={isHabitModalOpen}
        onClose={() => setIsHabitModalOpen(false)}
        onSave={handleSaveHabit}
        editingHabit={editingHabit}
        defaultValues={habitDefaultValues}
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
