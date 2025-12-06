
import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, Sun, Cloud, CloudRain, Snowflake, CloudLightning, Plus, Clock, ChevronRight, MoreHorizontal, CalendarDays, AlertTriangle, Trash2, X, Save, MapPin, LayoutDashboard, Pencil, Check, History } from 'lucide-react';
import { Goal, CalendarEvent, ImportantDate, Habit, DashboardConfig, DashboardSectionConfig, HabitLog, BriefingStyle, BriefingHistoryEntry } from '../types';
import { ProgressCard } from './GoalComponents';
import { HabitCard } from './HabitComponents';

export const DailyBriefingWidget: React.FC<{ 
  briefing: string; 
  isGenerating: boolean; 
  onRefresh: () => void;
  currentStyle: BriefingStyle;
  onSetStyle: (s: BriefingStyle) => void;
  onSave: (content: string) => boolean; 
  savedBriefingEntry?: BriefingHistoryEntry;
}> = ({ briefing, isGenerating, onRefresh, currentStyle, onSetStyle, onSave, savedBriefingEntry }) => {
  const [showSuccess, setShowSuccess] = useState(false);

  // Robustly compare current briefing vs saved entry to determine if "Saved" or "Updated"
  const isContentSaved = savedBriefingEntry 
    ? (savedBriefingEntry.content || "").trim() === (briefing || "").trim() 
    : false;
    
  const hasEntryForToday = !!savedBriefingEntry;

  const handleSaveClick = () => {
    if (!briefing) return;
    const success = onSave(briefing);
    if (success) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2500);
    }
  };

  const styles: {id: BriefingStyle, label: string}[] = [
    { id: 'standard', label: 'Standard' },
    { id: 'concise', label: 'Concise' },
    { id: 'thorough', label: 'Thorough' },
    { id: 'motivating', label: 'Motivating' },
    { id: 'fun', label: 'Fun' },
  ];

  return (
    <div className="w-full bg-white/70 dark:bg-stone-900/70 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/60 dark:border-stone-800/50 shadow-xl shadow-emerald-100/40 dark:shadow-none relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-emerald-100/40 to-teal-100/40 dark:from-emerald-900/10 dark:to-teal-900/10 rounded-full blur-3xl opacity-50 -mr-20 -mt-20 lg:group-hover:scale-110 transition-transform duration-1000" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gradient-to-tr from-stone-100/40 to-green-100/40 dark:from-stone-800/20 dark:to-emerald-900/10 rounded-full blur-3xl opacity-50 -ml-20 -mb-20" />
      
      <div className="relative z-10 w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl text-emerald-500 dark:text-emerald-400">
              <Sparkles size={20} />
            </div>
            <span className="text-sm font-bold text-emerald-900 dark:text-emerald-400 tracking-wider uppercase opacity-60">Plan for Today</span>
          </div>
          
          <div className="flex items-center gap-1.5 bg-white/40 dark:bg-stone-800/50 p-1 rounded-xl border border-white/40 dark:border-stone-700/50 shadow-sm self-end md:self-auto flex-wrap justify-end">
             {styles.map(s => (
               <button
                 key={s.id}
                 onClick={() => onSetStyle(s.id)}
                 className={`px-3 py-1.5 rounded-lg text-[10px] md:text-xs font-bold transition-all ${
                   currentStyle === s.id 
                     ? 'bg-emerald-500 text-white shadow-md' 
                     : 'text-slate-500 dark:text-stone-400 hover:bg-white/50 dark:hover:bg-stone-700/50'
                 }`}
               >
                 {s.label}
               </button>
             ))}
             <div className="w-px h-4 bg-slate-300 dark:bg-stone-600 mx-1 hidden md:block"></div>
             
             <div className="relative flex items-center">
                 <button 
                   type="button"
                   onClick={handleSaveClick}
                   disabled={!briefing || isGenerating || isContentSaved}
                   className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-[10px] md:text-xs font-bold ${
                     isContentSaved
                       ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 cursor-default opacity-80' 
                       : hasEntryForToday
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 lg:hover:bg-amber-200 ring-2 ring-amber-500/20'
                          : 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 lg:hover:bg-emerald-600'
                   } disabled:opacity-50 disabled:shadow-none`}
                   title={isContentSaved ? "Already saved to history" : hasEntryForToday ? "Overwrite existing plan for today" : "Save this plan to history"}
                 >
                   {isContentSaved ? (
                     <>
                        <Check size={12} strokeWidth={3} />
                        <span>Saved</span>
                     </>
                   ) : hasEntryForToday ? (
                     <>
                        <RefreshCw size={12} strokeWidth={3} />
                        <span>Update Plan</span>
                     </>
                   ) : (
                     <>
                        <Save size={12} />
                        <span>Save Plan</span>
                     </>
                   )}
                 </button>
                 
                 {/* Success Toast Animation */}
                 {showSuccess && (
                     <div className="absolute top-full mt-2 right-0 bg-emerald-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-xl animate-in fade-in slide-in-from-top-1 whitespace-nowrap z-50 flex items-center gap-1.5 pointer-events-none">
                         <Check size={10} strokeWidth={4} /> Saved to History
                     </div>
                 )}
             </div>

             <button 
               onClick={onRefresh}
               disabled={isGenerating}
               className="p-1.5 ml-1 text-emerald-600 dark:text-emerald-400 lg:hover:bg-white/50 dark:lg:hover:bg-stone-700/50 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
               title="Regenerate Plan"
             >
               <RefreshCw size={14} className={isGenerating ? "animate-spin" : ""} />
             </button>
          </div>
        </div>
        
        {isGenerating ? (
          <div className="flex items-center gap-4 py-8">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-emerald-100 dark:border-emerald-900/30 rounded-full" />
              <div className="w-12 h-12 border-4 border-emerald-400 rounded-full border-t-transparent animate-spin absolute top-0 left-0" />
            </div>
            <div>
              <p className="text-slate-900 dark:text-white font-semibold">Generating plan...</p>
              <p className="text-slate-400 dark:text-stone-500 text-sm">Analyzing schedule & priorities</p>
            </div>
          </div>
        ) : (
          <div 
            className="briefing-content"
            dangerouslySetInnerHTML={{ __html: briefing }} 
          />
        )}
      </div>
    </div>
  );
};

const EventRow: React.FC<{ event: CalendarEvent }> = ({ event }) => {
  // Robustly handle time strings that might not have a space (e.g. "14:00" vs "2:00 PM")
  const timeParts = event.time ? event.time.split(' ') : ['--:--', ''];
  const mainTime = timeParts[0];
  const period = timeParts.length > 1 ? timeParts[1] : '';

  return (
    <div className="flex items-center py-4 px-2 lg:hover:bg-white/10 rounded-2xl transition-all duration-300 cursor-pointer group -mx-2 border border-transparent lg:hover:border-white/5">
      <div className="w-20 flex flex-col items-center justify-center shrink-0">
        <span className="text-sm font-bold text-blue-200">{mainTime}</span>
        {period && <span className="text-xs font-bold text-stone-400 uppercase tracking-wide">{period}</span>}
      </div>
      <div className="w-px h-8 bg-white/10 mx-2" />
      <div className="flex-1 px-4 min-w-0">
        <h4 className="font-bold text-stone-100 text-sm md:text-[15px] truncate">{event.title}</h4>
        <div className="flex items-center gap-3 text-xs font-medium text-stone-400 mt-1">
          <span className="flex items-center gap-1"><Clock size={12} /> {event.duration}</span>
          {event.type === 'work' && <span className="text-blue-200 bg-blue-500/20 px-2 py-0.5 rounded-full border border-blue-500/30 whitespace-nowrap">Work</span>}
          {event.type === 'personal' && <span className="text-rose-200 bg-rose-500/20 px-2 py-0.5 rounded-full border border-rose-500/30 whitespace-nowrap">Personal</span>}
        </div>
      </div>
      <div className="opacity-0 lg:group-hover:opacity-100 transition-opacity px-2">
        <ChevronRight size={18} className="text-stone-400" />
      </div>
    </div>
  );
};

// --- MODAL FOR ADDING IMPORTANT DATES ---

interface DateFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<ImportantDate, 'id'>) => void;
  editingDate?: ImportantDate | null;
}

const DateFormModal: React.FC<DateFormModalProps> = ({ isOpen, onClose, onSave, editingDate }) => {
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    type: 'Personal'
  });

  useEffect(() => {
    if (editingDate) {
      setFormData({
        title: editingDate.title,
        date: editingDate.date,
        type: editingDate.type
      });
    } else {
      setFormData({
        title: '',
        date: new Date().toISOString().split('T')[0],
        type: 'Personal'
      });
    }
  }, [editingDate, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setFormData({ title: '', date: new Date().toISOString().split('T')[0], type: 'Personal' });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-md transition-all">
      <div className="bg-white dark:bg-stone-900 rounded-[2rem] p-8 w-full max-w-sm shadow-2xl border border-white/50 dark:border-stone-800 animate-in fade-in zoom-in duration-300">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">{editingDate ? 'Edit Date' : 'Add Date'}</h3>
          <button onClick={onClose} className="p-2 lg:hover:bg-slate-100 dark:lg:hover:bg-stone-800 rounded-full transition-colors text-slate-400 dark:text-stone-500 lg:hover:text-slate-600 dark:lg:hover:text-stone-300">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-stone-400 mb-1 uppercase tracking-wide">Event Name</label>
            <input
              required
              type="text"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              className="w-full bg-slate-50 dark:bg-stone-800 border-0 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 dark:text-stone-100 focus:ring-2 focus:ring-emerald-500/20"
              placeholder="e.g. Mom's Birthday"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-stone-400 mb-1 uppercase tracking-wide">Date</label>
            <input
              required
              type="date"
              value={formData.date}
              onChange={e => setFormData({...formData, date: e.target.value})}
              className="w-full bg-slate-50 dark:bg-stone-800 border-0 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 dark:text-stone-100"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-stone-400 mb-1 uppercase tracking-wide">Category</label>
            <select
              value={formData.type}
              onChange={e => setFormData({...formData, type: e.target.value})}
              className="w-full bg-slate-50 dark:bg-stone-800 border-0 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 dark:text-stone-100"
            >
              <option value="Personal">Personal</option>
              <option value="Work">Work</option>
              <option value="Urgent">Urgent</option>
              <option value="Billing">Billing</option>
              <option value="Holiday">Holiday</option>
            </select>
          </div>
          <button type="submit" className="w-full bg-slate-900 dark:bg-emerald-600 text-white font-bold py-3 rounded-xl mt-2 flex items-center justify-center gap-2">
            <Save size={18} /> {editingDate ? 'Update Date' : 'Save Date'}
          </button>
        </form>
      </div>
    </div>
  );
};

// --- CATEGORY FILTER COMPONENT ---
export const CategoryFilter: React.FC<{
  categories: string[];
  selected: string;
  onSelect: (c: string) => void;
}> = ({ categories, selected, onSelect }) => {
  const all = ['All', ...categories.sort()];
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar mb-6">
      {all.map(c => (
        <button
          key={c}
          onClick={() => onSelect(c)}
          className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
             selected === c 
               ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' 
               : 'bg-white dark:bg-stone-900 text-slate-500 dark:text-stone-400 hover:bg-slate-50 dark:hover:bg-stone-800 border border-slate-200 dark:border-stone-800 hover:border-emerald-200 hover:text-emerald-500 dark:hover:text-emerald-400'
          }`}
        >
          {c}
        </button>
      ))}
    </div>
  )
}

// --- MAIN DASHBOARD VIEW ---

interface DashboardViewProps {
  goals: Goal[];
  habits: Habit[];
  events: CalendarEvent[];
  briefing: string;
  isGeneratingBriefing: boolean;
  onRefreshBriefing: () => void;
  onSaveBriefing: (content: string) => boolean;
  openAddModal: () => void;
  onViewCalendar: () => void;
  onGoalIncrement: (id: string) => void;
  onGoalDecrement: (id: string) => void;
  onDeleteGoal: (id: string) => void;
  onEditGoal: (goal: Goal) => void;
  displayName: string;
  syncError?: string | null;
  // New Props
  importantDates: ImportantDate[];
  onAddImportantDate: (d: Omit<ImportantDate, 'id'>) => void;
  onEditImportantDate: (d: ImportantDate) => void;
  onDeleteImportantDate: (id: string) => void;
  weather: { temp: number, condition: string } | null;
  // Config & Habit handlers
  userConfig: DashboardConfig;
  onUpdateConfig: (config: DashboardConfig) => void; // Added for styling
  habitLogs: Record<string, HabitLog>;
  onToggleHabit: (id: string, completed: boolean, date?: string) => void;
  onUpdateHabitNote: (id: string, note: string, date?: string) => void;
  onDeleteHabit: (id: string) => void;
  onEditHabit: (habit: Habit) => void;
  onViewHabitHistory: (habit: Habit, view: 'calendar' | 'list') => void;
  // New: Subgoals
  onToggleSubgoal: (goalId: string, subgoalId: string) => void;
  todaysBriefingEntry?: BriefingHistoryEntry;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ 
  goals, habits, events, briefing, isGeneratingBriefing, onRefreshBriefing, onSaveBriefing, openAddModal, onViewCalendar,
  onGoalIncrement, onGoalDecrement, onDeleteGoal, onEditGoal, displayName, syncError,
  importantDates, onAddImportantDate, onEditImportantDate, onDeleteImportantDate, weather,
  userConfig, onUpdateConfig, habitLogs, onToggleHabit, onUpdateHabitNote, onDeleteHabit, onEditHabit, onViewHabitHistory,
  onToggleSubgoal, todaysBriefingEntry
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [is24Hour, setIs24Hour] = useState(false);

  useEffect(() => {
    // Update time every second for smooth clock
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };
  const dateString = currentTime.toLocaleDateString('en-US', options);
  
  // Calculate Dynamic Greeting
  const hour = currentTime.getHours();
  let greeting = "Good Morning";
  if (hour >= 12 && hour < 17) greeting = "Good Afternoon";
  if (hour >= 17) greeting = "Good Evening";

  const todaysEvents = events.filter(e => {
    const eDate = new Date(e.startTime);
    const today = new Date();
    return eDate.getDate() === today.getDate() && eDate.getMonth() === today.getMonth();
  }).slice(0, 4); 

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [editingDate, setEditingDate] = useState<ImportantDate | null>(null);

  // Sort dates: closest upcoming first
  const sortedDates = [...importantDates].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Weather Icon Logic
  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'Clear': return <Sun size={14} fill="currentColor" />;
      case 'Cloudy': return <Cloud size={14} fill="currentColor" />;
      case 'Rain': return <CloudRain size={14} />;
      case 'Snow': return <Snowflake size={14} />;
      case 'Storm': return <CloudLightning size={14} />;
      default: return <Sun size={14} />;
    }
  };

  const getWeatherColor = (condition: string) => {
    switch (condition) {
      case 'Clear': return 'text-amber-500';
      case 'Cloudy': return 'text-slate-500 dark:text-stone-400';
      case 'Rain': return 'text-blue-500';
      case 'Snow': return 'text-cyan-500';
      case 'Storm': return 'text-purple-500';
      default: return 'text-slate-500 dark:text-stone-400';
    }
  };

  const calculateDaysLeft = (dateStr: string) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const [y, m, d] = dateStr.split('-').map(Number);
    const target = new Date(y, m - 1, d);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return { label: 'Today', color: 'text-emerald-400 bg-emerald-400/10' };
    if (diffDays === 1) return { label: 'Tomorrow', color: 'text-amber-400 bg-amber-400/10' };
    if (diffDays < 0) return { label: `${Math.abs(diffDays)}d ago`, color: 'text-slate-500 bg-slate-500/10' };
    return { label: `In ${diffDays} days`, color: 'text-blue-300 bg-blue-500/10' };
  };

  const handleSaveDate = (data: Omit<ImportantDate, 'id'>) => {
    if (editingDate) {
      onEditImportantDate({ ...data, id: editingDate.id });
    } else {
      onAddImportantDate(data);
    }
    setIsDateModalOpen(false);
    setEditingDate(null);
  };

  // --- COMPONENT RENDERERS ---

  const renderBriefing = () => (
    <DailyBriefingWidget 
      briefing={briefing} 
      isGenerating={isGeneratingBriefing} 
      onRefresh={onRefreshBriefing} 
      currentStyle={userConfig.briefingStyle}
      onSetStyle={(s) => onUpdateConfig({...userConfig, briefingStyle: s})}
      onSave={onSaveBriefing}
      savedBriefingEntry={todaysBriefingEntry}
    />
  );

  const renderGoals = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-end px-2">
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Goals</h3>
        <button onClick={openAddModal} className="text-emerald-500 dark:text-emerald-400 text-sm font-bold lg:hover:bg-emerald-50 dark:lg:hover:bg-emerald-900/20 px-3 py-1.5 rounded-lg transition-colors">Add New</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map(goal => (
          <ProgressCard 
            key={goal.id} 
            goal={goal} 
            linkedHabits={habits.filter(h => h.linkedGoalIds?.includes(goal.id))}
            onIncrement={onGoalIncrement} 
            onDecrement={onGoalDecrement}
            onDelete={onDeleteGoal}
            onEdit={onEditGoal}
            onToggleSubgoal={onToggleSubgoal}
          />
        ))}
        <button 
          onClick={openAddModal}
          className="border-2 border-dashed border-slate-200/60 dark:border-stone-700/60 rounded-[2rem] p-6 flex flex-col items-center justify-center text-slate-400 dark:text-stone-500 lg:hover:border-emerald-400/50 lg:hover:bg-emerald-50/30 dark:lg:hover:bg-emerald-900/10 transition-all duration-300 group min-h-[140px] md:min-h-[200px]"
        >
          <div className="w-14 h-14 rounded-full bg-slate-50 dark:bg-stone-800 lg:group-hover:bg-emerald-100 dark:lg:group-hover:bg-emerald-900/30 flex items-center justify-center mb-3 transition-colors">
            <Plus size={24} className="lg:group-hover:text-emerald-500 dark:lg:group-hover:text-emerald-400" />
          </div>
          <span className="font-bold text-sm">New Goal</span>
        </button>
      </div>
    </div>
  );

  const renderHabits = () => (
      <div className="space-y-6">
          <div className="flex justify-between items-end px-2">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Habits</h3>
          </div>
          {habits.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {habits.map(habit => (
                      <HabitCard 
                          key={habit.id} 
                          habit={habit} 
                          habitLogs={habitLogs}
                          onToggle={onToggleHabit} 
                          onUpdateNote={onUpdateHabitNote}
                          onDelete={onDeleteHabit}
                          onEdit={onEditHabit}
                          onViewHistory={onViewHabitHistory}
                      />
                  ))}
              </div>
          ) : (
              <div className="bg-white/40 dark:bg-stone-800/40 border border-dashed border-slate-200 dark:border-stone-700 rounded-[2rem] p-8 text-center text-slate-400 dark:text-stone-500">
                  No habits added yet. Go to the Habits tab to create one.
              </div>
          )}
      </div>
  );

  const renderSchedule = () => (
    <div className="bg-gradient-to-br from-stone-900 to-stone-800 rounded-[2.5rem] p-8 text-white shadow-xl shadow-stone-900/20 dark:shadow-none relative overflow-hidden flex flex-col h-full min-h-[400px]">
        {/* Decorative background elements to match Upcoming Dates */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-400 opacity-20 rounded-full blur-xl -ml-5 -mb-5" />

        <div className="relative z-10 flex flex-col h-full">
            <div className="flex justify-between items-center mb-8">
            <div>
                <h3 className="text-xl font-bold text-white tracking-tight">Today's Schedule</h3>
                <p className="text-stone-400 text-sm font-medium">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white font-bold text-xs border border-white/5">
                {todaysEvents.length}
            </div>
            </div>
            <div className="space-y-1 flex-1">
            {todaysEvents.length > 0 ? (
                todaysEvents.map(event => <EventRow key={event.id} event={event} />)
            ) : (
                <div className="text-center py-12 text-stone-500 italic text-sm">No events scheduled today.</div>
            )}
            </div>
            <button 
            onClick={onViewCalendar}
            className="w-full mt-6 py-4 rounded-2xl bg-white/10 lg:hover:bg-white/20 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 border border-white/5"
            >
            Full Calendar
            </button>
        </div>
    </div>
  );

  const renderDates = () => (
    <div className="bg-gradient-to-br from-stone-900 to-stone-800 rounded-[2.5rem] p-8 text-white shadow-xl shadow-stone-900/20 dark:shadow-none relative overflow-hidden flex flex-col min-h-[400px]">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-400 opacity-20 rounded-full blur-xl -ml-5 -mb-5" />
        
        <div className="relative z-10 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-6 relative">
            <div>
            <h3 className="font-bold text-lg leading-tight">Upcoming Important Dates</h3>
            <p className="text-stone-400 text-sm font-medium mt-1">{sortedDates.length} important events scheduled</p>
            </div>
            <div className="flex gap-2 items-center">
            <button 
                onClick={() => { setEditingDate(null); setIsDateModalOpen(true); }}
                className="text-stone-400 lg:hover:text-white transition-colors p-1.5 rounded-full lg:hover:bg-white/10"
                title="Add Date"
            >
                <Plus size={18} />
            </button>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-stone-400 lg:hover:text-white transition-colors p-1.5 rounded-full lg:hover:bg-white/10">
                <MoreHorizontal size={18} />
            </button>
            </div>
            
            {isMenuOpen && (
            <div className="absolute right-0 top-10 bg-white dark:bg-stone-800 text-slate-900 dark:text-stone-100 rounded-xl shadow-xl py-1 w-40 z-20 animate-in fade-in zoom-in-95 duration-200">
                <button 
                onClick={() => { setIsMenuOpen(false); onViewCalendar(); }}
                className="w-full text-left px-4 py-2 text-sm font-medium lg:hover:bg-slate-50 dark:lg:hover:bg-stone-700 flex items-center gap-2"
                >
                <CalendarDays size={16} />
                View Calendar
                </button>
            </div>
            )}
        </div>

        <div className="space-y-4 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar flex-1">
            {sortedDates.length > 0 ? (
            sortedDates.map((d) => {
                // Create date object from YYYY-MM-DD using local time constructor to avoid UTC offset issues
                const [y, m, dNum] = d.date.split('-').map(Number);
                const dateObj = new Date(y, m - 1, dNum);
                
                const month = dateObj.toLocaleString('default', { month: 'short' }).toUpperCase();
                const day = dateObj.getDate();
                const timeLeft = calculateDaysLeft(d.date);
                
                return (
                <div key={d.id} className="flex flex-col gap-2 group cursor-pointer relative">
                    <div className="flex flex-row items-center gap-4">
                    <div className="bg-white/10 w-14 h-14 rounded-2xl flex flex-col items-center justify-center backdrop-blur-md border border-white/5 lg:group-hover:bg-white/20 transition-colors shrink-0">
                        <span className="text-[10px] font-bold text-emerald-300">{month}</span>
                        <span className="text-lg font-bold text-white">{day}</span>
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <div className="flex flex-row items-center justify-between">
                            <p className="font-bold text-stone-100 truncate pr-2">{d.title}</p>
                            <div className="flex flex-row items-center gap-2 shrink-0">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap ${timeLeft.color}`}>
                                    {timeLeft.label}
                                </span>
                                
                                {/* Action Buttons: Visible on mobile, hover only on desktop */}
                                <div className="flex items-center opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity gap-1">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setEditingDate(d); setIsDateModalOpen(true); }}
                                    className="p-1.5 text-stone-400 lg:hover:text-emerald-400 transition-all bg-stone-800/80 rounded-full"
                                    title="Edit"
                                >
                                    <Pencil size={12} />
                                </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); onDeleteImportantDate(d.id); }}
                                    className="p-1.5 text-stone-400 lg:hover:text-rose-400 transition-all bg-stone-800/80 rounded-full"
                                    title="Delete"
                                >
                                    <Trash2 size={12} />
                                </button>
                                </div>
                            </div>
                        </div>
                        <p className="text-xs text-stone-400 font-medium uppercase tracking-wide">{d.type}</p>
                    </div>
                    </div>
                </div>
                );
            })
            ) : (
            <div className="text-center py-12 text-stone-500 italic text-sm">
                No important dates added. <br/>Tap + to add one.
            </div>
            )}
        </div>
        </div>
    </div>
  );

  // Default sections if none provided
  const sections: DashboardSectionConfig[] = userConfig?.sections || [
      { id: 'briefing', label: 'Briefing', visible: true, order: 0 },
      { id: 'goals', label: 'Goals', visible: true, order: 1 },
      { id: 'schedule', label: 'Today\'s Schedule', visible: true, order: 2 },
      { id: 'dates', label: 'Important Dates', visible: true, order: 3 },
      { id: 'habits', label: 'Habits', visible: false, order: 4 },
  ];

  const sortedSections = [...sections].sort((a, b) => a.order - b.order).filter(s => s.visible);

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-12">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-start gap-6 px-2">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
             <LayoutDashboard className="text-white w-6 h-6 md:w-8 md:h-8" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">{greeting}, {displayName}</h1>
            <p className="text-emerald-500 dark:text-emerald-400 font-bold text-sm mt-2 uppercase tracking-wider">Focus on what matters most</p>
          </div>
        </div>
        
        {/* Right Header Controls: Clock, Weather */}
        <div className="flex items-start gap-4 self-end md:self-auto">
           <div className="flex flex-col items-end">
              {/* Clock Widget */}
              <div className="flex flex-col items-end select-none cursor-pointer group mb-1" onClick={() => setIs24Hour(!is24Hour)} title="Toggle 12h/24h">
                  <div className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-stone-200 tracking-tight leading-none lg:group-hover:text-emerald-500 dark:lg:group-hover:text-emerald-400 transition-colors">
                     {currentTime.toLocaleTimeString([], { hour12: !is24Hour, hour: '2-digit', minute: '2-digit' })}
                  </div>
              </div>

              {/* Date below Time */}
              <p className="text-slate-400 dark:text-stone-500 font-bold uppercase tracking-widest text-xs mb-2">{dateString}</p>
              
              {/* Weather Below Date */}
              <div className="flex items-center gap-2 text-slate-600 dark:text-stone-400">
                {weather ? (
                  <>
                    <div className={`${getWeatherColor(weather.condition)}`}>
                      {getWeatherIcon(weather.condition)}
                    </div>
                    <span className="font-bold text-lg leading-none">{weather.temp}°F</span>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-stone-500 uppercase tracking-wide leading-none">{weather.condition}</span>
                  </>
                ) : (
                   <div className="flex items-center gap-1.5">
                     <MapPin size={14} className="text-slate-400 animate-pulse" />
                     <span className="text-xs font-bold text-slate-400">Locating...</span>
                   </div>
                )}
              </div>
           </div>
        </div>
      </div>

      {syncError && (
         <div className="bg-rose-50 dark:bg-rose-900/10 border-l-4 border-rose-500 p-4 rounded-r-2xl flex items-start gap-3 shadow-sm animate-in fade-in slide-in-from-top-4">
            <AlertTriangle className="text-rose-500 shrink-0 mt-0.5" size={20} />
            <div>
               <h4 className="font-bold text-rose-800 dark:text-rose-400 text-sm">Calendar Sync Issue</h4>
               <p className="text-rose-700 dark:text-rose-500 text-sm mt-1">{syncError}</p>
               {syncError.toLowerCase().includes('enabled') && (
                 <p className="text-xs font-bold text-rose-800 dark:text-rose-400 mt-2 bg-rose-100/50 dark:bg-rose-900/20 p-2 rounded-lg">
                   Action: Enable 'Google Calendar API' in your Google Cloud Console project.
                 </p>
               )}
            </div>
         </div>
      )}

      {/* DYNAMIC GRID LAYOUT */}
      <div className="flex flex-col gap-8">
          {sortedSections.map(section => {
              switch(section.id) {
                  case 'briefing':
                      return <div key="briefing" className="animate-in fade-in slide-in-from-bottom-2">{renderBriefing()}</div>;
                  case 'goals':
                      return <div key="goals" className="animate-in fade-in slide-in-from-bottom-2">{renderGoals()}</div>;
                  case 'habits':
                      return <div key="habits" className="animate-in fade-in slide-in-from-bottom-2">{renderHabits()}</div>;
                  case 'schedule':
                      return (
                          <div key="schedule" className="animate-in fade-in slide-in-from-bottom-2">
                             {renderSchedule()}
                          </div>
                      );
                  case 'dates':
                      return (
                          <div key="dates" className="animate-in fade-in slide-in-from-bottom-2">
                             {renderDates()}
                          </div>
                      );
                  default:
                      return null;
              }
          })}
      </div>
      
      <DateFormModal 
        isOpen={isDateModalOpen} 
        onClose={() => { setIsDateModalOpen(false); setEditingDate(null); }} 
        onSave={handleSaveDate} 
        editingDate={editingDate}
      />
    </div>
  );
};
