import React, { useState, useEffect } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { Goal, Habit, HabitLog, CalendarEvent, User } from './types';
import { storageService } from './services/storage';
import { googleService } from './services/google';
import { generateDailyBriefing } from './services/gemini';

// Components
import Sidebar from './components/Sidebar';
import LoginScreen from './components/LoginScreen';
import ChatWidget from './components/ChatWidget';
import CalendarView from './components/CalendarView';
import { DashboardView } from './components/DashboardComponents';
import { ProgressCard, GoalFormModal } from './components/GoalComponents';
import { HabitCard, HabitFormModal, HabitHistoryModal } from './components/HabitComponents';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [goals, setGoals] = useState<Goal[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitLogs, setHabitLogs] = useState<Record<string, HabitLog>>({}); 
  const [events, setEvents] = useState<CalendarEvent[]>([]); 
  const [briefing, setBriefing] = useState("");
  const [isGeneratingBriefing, setIsGeneratingBriefing] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [loginError, setLoginError] = useState("");
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [viewingHabitHistory, setViewingHabitHistory] = useState<Habit | null>(null);
  const [historyViewMode, setHistoryViewMode] = useState<'calendar' | 'list'>('calendar');

  // Load User on Mount
  useEffect(() => {
    const loadedUser = storageService.getUser();
    if (loadedUser) {
      setUser(loadedUser);
    }
    setIsLoadingAuth(false);
  }, []);

  // Load Data when User loads
  useEffect(() => {
    if (!user) return;
    setGoals(storageService.getGoals());
    setHabits(storageService.getHabits());
    setHabitLogs(storageService.getHabitLogs());

    // Event Sync Logic
    const syncEvents = async () => {
        if (user.accessToken && !user.isGuest) {
            try {
                const googleEvents = await googleService.listEvents(user.accessToken);
                setEvents(googleEvents);
                if (!briefing && googleEvents.length > 0) {
                     // small delay to ensure state is ready
                     setTimeout(() => generateBriefingHelper(goals, googleEvents, habits), 500);
                }
            } catch (e) {
                console.error("Failed to sync Google Calendar", e);
                // Fallback to local
                const localEvents = storageService.getEvents();
                setEvents(localEvents);
            }
        } else {
            const localEvents = storageService.getEvents();
            setEvents(localEvents);
            if (!briefing && localEvents.length > 0) {
                 generateBriefingHelper(goals, localEvents, habits);
            }
        }
    };

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
             finalClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
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
  };

  // --- DATA HANDLERS ---
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

  // Helper for date formatting
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
        } catch (e) {
            console.error("Failed to save to Google Calendar", e);
            // Revert on failure (or keep local) - keeping local for now as fallback
            storageService.saveEvents(optimisticEvents); 
        }
    } else {
        storageService.saveEvents(optimisticEvents);
    }
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
    <div className="bg-[#F5F5F7] min-h-screen font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} user={user} onSignOut={handleSignOut} />
      
      <main className="lg:pl-[340px] p-6 lg:p-10 min-h-screen transition-all duration-300">
        {activeTab === 'dashboard' && (
          <DashboardView 
            goals={goals} 
            events={events}
            briefing={briefing}
            isGeneratingBriefing={isGeneratingBriefing}
            onRefreshBriefing={() => generateBriefingHelper(goals, events, habits)}
            openAddModal={() => { setEditingGoal(null); setIsGoalModalOpen(true); }}
            onViewCalendar={() => setActiveTab('calendar')}
            onGoalIncrement={handleGoalIncrement} 
            onGoalDecrement={handleGoalDecrement}
            onDeleteGoal={handleDeleteGoal}
            onEditGoal={(goal) => { setEditingGoal(goal); setIsGoalModalOpen(true); }}
            displayName={user.displayName || 'User'}
          />
        )}
        {activeTab === 'goals' && (
          <div className="max-w-[1600px] mx-auto">
             <div className="flex justify-between items-center mb-8">
               <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Focus Areas</h1>
               <button 
                onClick={() => { setEditingGoal(null); setIsGoalModalOpen(true); }}
                className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:scale-105 transition-all flex items-center gap-2"
               >
                 <Plus size={20} /> New Goal
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
             </div>
          </div>
        )}
        {activeTab === 'calendar' && (
          <CalendarView events={events} onAddEvent={handleAddEvent} />
        )}
        {activeTab === 'habits' && (
          <div className="max-w-[1600px] mx-auto">
             <div className="flex justify-between items-center mb-8">
               <div>
                 <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Habit Tracker</h1>
                 <p className="text-slate-500 font-medium mt-1">Build consistency one day at a time</p>
               </div>
               <button 
                onClick={() => { setEditingHabit(null); setIsHabitModalOpen(true); }}
                className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:scale-105 transition-all flex items-center gap-2"
               >
                 <Plus size={20} /> New Habit
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
      </main>

      <ChatWidget dashboardState={dashboardState} />
      
      <GoalFormModal 
        isOpen={isGoalModalOpen} 
        onClose={() => setIsGoalModalOpen(false)} 
        onSave={handleSaveGoal}
        editingGoal={editingGoal}
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