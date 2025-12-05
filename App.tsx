
import React, { useState, useEffect } from 'react';
import { Plus, Loader2, Sparkles, RefreshCw, Target, Dumbbell } from 'lucide-react';
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
import { ProgressCard, GoalFormModal, GoalSuggestionCard } from './components/GoalComponents';
import { HabitCard, HabitFormModal, HabitHistoryModal } from './components/HabitComponents';

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
  const [viewingHabitHistory, setViewingHabitHistory] = useState<Habit | null>(null);
  const [historyViewMode, setHistoryViewMode] = useState<'calendar' | 'list'>('calendar');

  // Suggestions State
  const [suggestedGoals, setSuggestedGoals] = useState<Array<{title: string, category: string, icon: string}>>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

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

  const loadGoalSuggestions = async () => {
    setIsLoadingSuggestions(true);
    const existingTitles = goals.map(g => g.title);
    const suggestions = await generateSuggestions('goal', existingTitles);
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

  const formatLocalYMD = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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

     // Update streak roughly (consecutive days ending today)
     const updatedHabits = habits.map(h => {
        if (h.id === habitId) {
            // Recalculate streak
            let streak = 0;
            const d = new Date();
            while (true) {
                const k = formatLocalYMD(d);
                if (updatedLogs[`${h.id}_${k}`]) {
                    streak++;
                    d.setDate(d.getDate() - 1);
                } else {
                    break;
                }
            }
            return { ...h, streak };
        }
        return h;
     });
     setHabits(updatedHabits);
     storageService.saveHabits(updatedHabits);
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
     // Loop through and create each one. 
     // We do this sequentially to ensure order and avoid rate limits on local/google APIs if necessary, though parallel is often fine.
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
            // New Props
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
               <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center gap-3">
                   <div className="p-2 bg-emerald-50 rounded-xl text-emerald-500">
                     <Sparkles size={20} />
                   </div>
                   <h2 className="text-2xl font-bold text-slate-900">Suggested for you</h2>
                 </div>
                 <button 
                   onClick={loadGoalSuggestions}
                   disabled={isLoadingSuggestions}
                   className="text-emerald-600 font-bold text-sm lg:hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2"
                 >
                   <RefreshCw size={14} className={isLoadingSuggestions ? "animate-spin" : ""} />
                   Refresh Ideas
                 </button>
               </div>
               
               {isLoadingSuggestions ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
                   {[1,2,3,4].map(i => (
                     <div key={i} className="h-32 bg-slate-100 rounded-[1.5rem]" />
                   ))}
                 </div>
               ) : suggestedGoals.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                   <p className="text-slate-500 font-medium">Click "Refresh Ideas" to get personalized goal suggestions based on your current focus.</p>
                 </div>
               )}
             </div>
          </div>
        )}
        {activeTab === 'calendar' && (
          <CalendarView events={events} importantDates={importantDates} onAddEvent={handleAddEvent} />
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
                onClick={() => { setEditingHabit(null); setIsHabitModalOpen(true); }}
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
             </div>
          </div>
        )}
        {activeTab === 'about' && (
           <AboutView />
        )}
        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto pt-12">
             <h1 className="text-4xl font-bold text-slate-900 mb-8 text-center">Profile & Settings</h1>
             <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100 flex flex-col items-center text-center relative overflow-hidden group">
                <div className="absolute top-0 w-full h-32 bg-gradient-to-r from-emerald-100 to-teal-100 opacity-50"></div>
                
                <div className="w-28 h-28 bg-gradient-to-tr from-emerald-400 to-teal-500 rounded-[2rem] flex items-center justify-center text-4xl font-bold text-white mb-6 shadow-xl shadow-emerald-500/20 relative z-10 p-1 border-4 border-white lg:group-hover:scale-105 transition-transform duration-300">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="w-full h-full rounded-[1.8rem] object-cover" />
                  ) : (
                    <span>{user.displayName?.charAt(0) || 'U'}</span>
                  )}
                </div>
                
                <h2 className="text-2xl font-bold text-slate-900">{user.displayName}</h2>
                <p className="text-slate-500 mb-8 font-medium bg-slate-100 px-4 py-1 rounded-full text-sm mt-2">{user.email || 'Guest User'}</p>
                
                <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                   <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex flex-col items-center lg:hover:bg-white lg:hover:shadow-lg transition-all duration-300">
                      <div className="text-3xl font-bold text-emerald-500 mb-1">{goals.length}</div>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Goals</div>
                   </div>
                   <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex flex-col items-center lg:hover:bg-white lg:hover:shadow-lg transition-all duration-300">
                      <div className="text-3xl font-bold text-teal-500 mb-1">{habits.length}</div>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Habits</div>
                   </div>
                </div>

                <div className="mt-12 w-full max-w-md">
                   <button 
                     onClick={handleSignOut}
                     className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold lg:hover:bg-black transition-all shadow-lg lg:hover:shadow-xl"
                   >
                     Sign Out
                   </button>
                   <p className="text-xs text-slate-400 mt-4 font-mono">Version 1.2.0 • Nexus Dashboard</p>
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
      />

      <HabitHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        habit={viewingHabitHistory}
        habitLogs={habitLogs}
        onToggleHabit={handleToggleHabit}
        initialView={historyViewMode}
        onUpdateNote={handleUpdateHabitNote}
      />
    </div>
  );
}
