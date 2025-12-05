
import React, { useState, useEffect, useRef } from 'react';
import { Pencil, Trash2, Check, AlignLeft, List, CalendarDays, X, Save, CornerDownLeft, Sparkles, Loader2, ChevronLeft, ChevronRight, Plus, MoreHorizontal, History, Flame, MessageSquarePlus, Link as LinkIcon, Search } from 'lucide-react';
import { Habit, HabitLog, Goal } from '../types';
import { generateSuggestions } from '../services/gemini';

// Helper for date formatting in this module
const formatLocalYMD = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper to get past N days (including today)
const getPastDays = (days: number) => {
  const dates = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    dates.push(d);
  }
  return dates;
};

// --- HABIT CARD ---

interface HabitCardProps {
  habit: Habit;
  habitLogs: Record<string, HabitLog>;
  onToggle: (habitId: string, completed: boolean, dateKey: string) => void;
  onUpdateNote: (habitId: string, note: string, dateKey?: string) => void;
  onDelete: (id: string) => void;
  onEdit: (habit: Habit) => void;
  onViewHistory: (habit: Habit, view: 'calendar' | 'list') => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({ habit, habitLogs, onToggle, onUpdateNote, onDelete, onEdit, onViewHistory }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const todaysDateKey = formatLocalYMD(new Date());
  const todayLog = habitLogs[`${habit.id}_${todaysDateKey}`];
  
  const [noteText, setNoteText] = useState(todayLog?.note || "");
  const [showNoteInput, setShowNoteInput] = useState(!!todayLog?.note);
  const [showSuccess, setShowSuccess] = useState(false);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setNoteText(todayLog?.note || "");
    if (todayLog?.note) setShowNoteInput(true);
  }, [todayLog]);

  const handleSaveNote = () => {
    if (todayLog) {
        onUpdateNote(habit.id, noteText);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveNote();
    }
  };

  // Get last 7 days for the mini-calendar row
  const weekDates = getPastDays(7);

  // Dynamic Color Classes
  const getColorClasses = (colorClass: string) => {
      const match = colorClass.match(/text-(\w+)-500/);
      const color = match ? match[1] : 'emerald';
      return {
          bg: `bg-${color}-50`,
          bgActive: `bg-${color}-500`,
          text: `text-${color}-600`,
          textDark: `text-${color}-800`,
          border: `border-${color}-200`,
          ring: `focus:ring-${color}-500`,
          shadow: `shadow-${color}-500/30`
      };
  };
  const theme = getColorClasses(habit.color);

  return (
    <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group flex flex-col relative border border-slate-100">
      
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
         <div className="flex items-center gap-4">
             <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 shadow-lg shadow-slate-100 ${theme.bg} ${theme.text}`}>
                 {habit.icon}
             </div>
             <div>
                 <h3 className="font-bold text-slate-800 text-xl leading-tight mb-1">{habit.title}</h3>
                 <span className={`text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded-md bg-slate-50 text-slate-400`}>{habit.category}</span>
             </div>
         </div>
         
         <div className="flex items-start gap-1">
             <div className="flex flex-col items-end mr-2 bg-slate-50 px-2 py-1 rounded-xl border border-slate-100">
                 <div className="flex items-center gap-1.5 font-black text-lg">
                     <Flame size={18} fill="currentColor" className={habit.streak > 0 ? "text-amber-500 animate-pulse" : "text-slate-300"} />
                     <span className={habit.streak > 0 ? "text-amber-500" : "text-slate-300"}>{habit.streak}</span>
                 </div>
                 <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider leading-none">Streak</span>
             </div>

             <div className="relative" ref={menuRef}>
                 <button 
                   onClick={() => setShowMenu(!showMenu)}
                   className={`p-2 rounded-xl transition-colors ${showMenu ? 'bg-slate-100 text-slate-600' : 'text-slate-300 hover:text-slate-600 hover:bg-slate-50'}`}
                 >
                     <MoreHorizontal size={20} />
                 </button>
                 
                 {showMenu && (
                     <div className="absolute right-0 top-full mt-2 w-36 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                         <button 
                           onClick={() => { setShowMenu(false); onViewHistory(habit, 'calendar'); }}
                           className="w-full text-left px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                         >
                            <History size={14} /> History
                         </button>
                         <button 
                           onClick={() => { setShowMenu(false); onEdit(habit); }}
                           className="w-full text-left px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                         >
                            <Pencil size={14} /> Edit
                         </button>
                         <button 
                           onClick={() => { setShowMenu(false); onDelete(habit.id); }}
                           className="w-full text-left px-4 py-3 text-sm font-medium text-rose-500 hover:bg-rose-50 flex items-center gap-2"
                         >
                            <Trash2 size={14} /> Delete
                         </button>
                     </div>
                 )}
             </div>
         </div>
      </div>

      {/* Weekly Progress - Modern Circles */}
      <div className="flex justify-between items-end gap-1 mb-6 bg-slate-50/50 p-3 rounded-2xl border border-slate-100/50">
          {weekDates.map((date, index) => {
              const dateKey = formatLocalYMD(date);
              const isCompleted = !!habitLogs[`${habit.id}_${dateKey}`];
              const isToday = index === 6; // Last item is today
              
              const dayLabel = date.toLocaleDateString('en-US', { weekday: 'narrow' }); 
              
              return (
                  <div key={dateKey} className="flex flex-col items-center gap-2 flex-1 group/day">
                      <span className={`text-[10px] font-bold uppercase ${isToday ? theme.textDark : 'text-slate-300'}`}>
                          {dayLabel}
                      </span>
                      
                      <button
                          onClick={() => onToggle(habit.id, !isCompleted, dateKey)}
                          className={`
                              relative flex items-center justify-center rounded-full transition-all duration-300
                              ${isToday ? 'w-10 h-10 shadow-lg scale-110' : 'w-8 h-8 hover:scale-110'}
                              ${isCompleted 
                                  ? `${theme.bgActive} text-white shadow-emerald-500/20` 
                                  : `bg-white border-2 ${isToday ? theme.border : 'border-slate-100'} hover:border-emerald-200 text-transparent`}
                          `}
                          title={isToday ? "Today" : date.toLocaleDateString()}
                      >
                          {isCompleted && <Check size={isToday ? 18 : 14} strokeWidth={3} />}
                      </button>
                  </div>
              );
          })}
      </div>

      {/* Note Section */}
      <div className="mt-auto">
          {todayLog ? (
               <div className="relative animate-in fade-in slide-in-from-top-2">
                   <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                       <AlignLeft size={14} className="text-slate-400" />
                   </div>
                   <input 
                       type="text" 
                       value={noteText}
                       onChange={(e) => setNoteText(e.target.value)}
                       onBlur={handleSaveNote}
                       onKeyDown={handleKeyDown}
                       placeholder="Add a note for today..."
                       className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-transparent focus:border-emerald-200 rounded-xl py-2.5 pl-9 pr-8 text-sm text-slate-600 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all shadow-inner"
                   />
                   {noteText !== (todayLog.note || "") && (
                       <button 
                           onClick={handleSaveNote}
                           className="absolute inset-y-1 right-1 p-1.5 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"
                       >
                           {showSuccess ? <Check size={14} /> : <CornerDownLeft size={14} />}
                       </button>
                   )}
               </div>
          ) : (
               <div className="text-center py-2.5 rounded-xl border border-dashed border-slate-200 text-xs font-medium text-slate-400 select-none bg-slate-50/50">
                   Complete today to add a note
               </div>
          )}
      </div>
    </div>
  );
};

// --- HABIT SUGGESTION CARD ---

interface HabitSuggestionCardProps {
  suggestion: { title: string; category: string; icon: string };
  onAdd: () => void;
}

export const HabitSuggestionCard: React.FC<HabitSuggestionCardProps> = ({ suggestion, onAdd }) => {
  return (
    <button 
      onClick={onAdd}
      className="bg-white p-5 rounded-[1.5rem] border border-slate-100 lg:hover:border-emerald-200 lg:hover:shadow-lg lg:hover:shadow-emerald-500/10 transition-all duration-300 text-left group flex flex-col h-full"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-xl">
          {suggestion.icon}
        </div>
        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 lg:group-hover:bg-emerald-500 lg:group-hover:text-white transition-colors">
          <Plus size={16} />
        </div>
      </div>
      <h4 className="font-bold text-slate-800 text-sm mb-1">{suggestion.title}</h4>
      <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wide">{suggestion.category}</span>
    </button>
  );
};

// --- SUGGESTION CONTROL (Shared) ---
interface SuggestionControlProps {
    onGenerate: (topic?: string) => void;
    isLoading: boolean;
    categories: string[];
}

export const SuggestionControl: React.FC<SuggestionControlProps> = ({ onGenerate, isLoading, categories }) => {
    const [customTopic, setCustomTopic] = useState("");

    return (
        <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-wrap gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide py-1.5 mr-2">Topics:</span>
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => onGenerate(cat)}
                        disabled={isLoading}
                        className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-full text-xs font-bold hover:border-emerald-500 hover:text-emerald-500 transition-colors disabled:opacity-50"
                    >
                        {cat}
                    </button>
                ))}
            </div>
            
            <div className="flex items-center gap-2 max-w-md">
                <div className="relative flex-1">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                        type="text" 
                        value={customTopic}
                        onChange={(e) => setCustomTopic(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && onGenerate(customTopic)}
                        placeholder="Or type a custom topic..."
                        className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    />
                </div>
                <button 
                    onClick={() => onGenerate(customTopic)}
                    disabled={isLoading}
                    className="bg-emerald-500 text-white p-2 rounded-xl hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                    {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                </button>
            </div>
        </div>
    );
};

// --- HABIT MODAL ---

interface HabitFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Habit, 'id' | 'streak'>) => void;
  editingHabit: Habit | null;
  existingHabits?: Habit[];
  existingGoals?: Goal[]; // New prop for linking
  defaultValues?: { title?: string, category?: string, icon?: string };
}

export const HabitFormModal: React.FC<HabitFormModalProps> = ({ 
  isOpen, onClose, onSave, editingHabit, existingHabits = [], existingGoals = [], defaultValues 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    category: 'Health',
    color: 'text-blue-500 bg-blue-500',
    icon: '💪',
    linkedGoalIds: [] as string[]
  });
  const [suggestions, setSuggestions] = useState<Array<{title: string, category: string, icon: string}>>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [isLinkingExpanded, setIsLinkingExpanded] = useState(false);

  useEffect(() => {
    if (editingHabit) {
      setFormData({
        title: editingHabit.title,
        category: editingHabit.category,
        color: editingHabit.color,
        icon: editingHabit.icon || '💪',
        linkedGoalIds: editingHabit.linkedGoalIds || []
      });
    } else if (defaultValues) {
      setFormData({
        title: defaultValues.title || '',
        category: defaultValues.category || 'Health',
        color: 'text-blue-500 bg-blue-500',
        icon: defaultValues.icon || '💪',
        linkedGoalIds: []
      });
    } else {
      setFormData({ title: '', category: 'Health', color: 'text-blue-500 bg-blue-500', icon: '💪', linkedGoalIds: [] });
    }
    setSuggestions([]);
  }, [editingHabit, isOpen, defaultValues]);

  const fetchSuggestions = async () => {
    setLoadingSuggestions(true);
    const existingTitles = existingHabits.map(h => h.title);
    const ideas = await generateSuggestions('habit', existingTitles);
    setSuggestions(ideas);
    setLoadingSuggestions(false);
  };

  const applySuggestion = (s: {title: string, category: string, icon: string}) => {
    setFormData(prev => ({ ...prev, title: s.title, category: s.category, icon: s.icon }));
    setSuggestions([]);
  };

  const toggleLinkedGoal = (goalId: string) => {
      setFormData(prev => {
          const exists = prev.linkedGoalIds.includes(goalId);
          if (exists) {
              return { ...prev, linkedGoalIds: prev.linkedGoalIds.filter(id => id !== goalId) };
          } else {
              return { ...prev, linkedGoalIds: [...prev.linkedGoalIds, goalId] };
          }
      });
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const colors = [
    { label: 'Blue', value: 'text-blue-500 bg-blue-500' },
    { label: 'Emerald', value: 'text-emerald-500 bg-emerald-500' },
    { label: 'Violet', value: 'text-violet-500 bg-violet-500' },
    { label: 'Amber', value: 'text-amber-500 bg-amber-500' },
    { label: 'Rose', value: 'text-rose-500 bg-rose-500' },
    { label: 'Slate', value: 'text-slate-500 bg-slate-500' },
  ];

  const emojis = ['💪', '💧', '🥗', '🧘', '📚', '🎸', '🧠', '🚶', '💊', '🧹', '📷', '✍️', '🌱'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-md transition-all">
      <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl border border-white/50 animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-2xl font-bold text-slate-900">{editingHabit ? 'Edit Habit' : 'New Habit'}</h3>
            <p className="text-slate-500 text-sm">{editingHabit ? 'Modify routine details' : 'Build a new routine'}</p>
          </div>
          <button onClick={onClose} className="p-2 lg:hover:bg-slate-100 rounded-full transition-colors text-slate-400 lg:hover:text-slate-600">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
             <div className="flex justify-between items-end mb-2">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Habit Title</label>
                {!editingHabit && (
                  <button 
                    type="button" 
                    onClick={fetchSuggestions}
                    disabled={loadingSuggestions}
                    className="text-xs font-bold text-emerald-500 flex items-center gap-1 lg:hover:bg-emerald-50 px-2 py-1 rounded-lg transition-colors"
                  >
                    {loadingSuggestions ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                    AI Ideas
                  </button>
                )}
             </div>

             {suggestions.length > 0 && (
               <div className="mb-3 grid grid-cols-1 gap-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                 {suggestions.map((s, idx) => (
                   <button 
                     key={idx}
                     type="button"
                     onClick={() => applySuggestion(s)}
                     className="text-left bg-emerald-50/50 lg:hover:bg-emerald-100 border border-emerald-100 p-2 rounded-xl text-xs flex items-center gap-2 transition-colors"
                   >
                     <span className="text-lg">{s.icon}</span>
                     <div>
                       <span className="font-bold text-slate-800 block">{s.title}</span>
                       <span className="text-emerald-600">{s.category}</span>
                     </div>
                   </button>
                 ))}
               </div>
             )}

            <input
              required
              type="text"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              className="w-full bg-slate-50 border-0 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800 font-semibold placeholder:text-slate-300"
              placeholder="e.g. Morning Stretch"
              autoFocus
            />
          </div>

          <div>
             <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">Icon</label>
             <div className="flex flex-wrap gap-2">
               {emojis.map(emoji => (
                 <button
                   key={emoji}
                   type="button"
                   onClick={() => setFormData({...formData, icon: emoji})}
                   className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all ${
                     formData.icon === emoji 
                       ? 'bg-slate-900 text-white shadow-lg scale-110' 
                       : 'bg-slate-50 text-slate-700 lg:hover:bg-slate-100'
                   }`}
                 >
                   {emoji}
                 </button>
               ))}
             </div>
          </div>
          
          <div>
             <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Category</label>
             <input
               type="text"
               value={formData.category}
               onChange={e => setFormData({...formData, category: e.target.value})}
               className="w-full bg-slate-50 border-0 rounded-2xl px-5 py-4 font-medium text-slate-700"
               placeholder="Health"
             />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">Theme Color</label>
            <div className="flex gap-4">
              {colors.map(c => (
                <button
                  key={c.label}
                  type="button"
                  onClick={() => setFormData({...formData, color: c.value})}
                  className={`w-10 h-10 rounded-full ${c.value.split(' ')[1]} transition-all duration-200 ${
                    formData.color === c.value 
                      ? 'ring-4 ring-offset-2 ring-slate-200 scale-110 shadow-lg' 
                      : 'lg:hover:scale-110 lg:hover:opacity-80'
                  }`}
                />
              ))}
            </div>
          </div>
          
          {/* Goal Linking Section */}
          <div className="border-t border-slate-100 pt-4">
             <button 
                type="button"
                onClick={() => setIsLinkingExpanded(!isLinkingExpanded)}
                className="flex items-center justify-between w-full text-left group"
             >
                <div>
                    <div className="flex items-center gap-2">
                        <LinkIcon size={14} className="text-emerald-500" />
                        <span className="text-sm font-bold text-slate-700 uppercase tracking-wide">Link to Goals</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Completion will update these goals.</p>
                </div>
                {isLinkingExpanded ? <ChevronRight className="rotate-90 text-slate-400" size={16} /> : <ChevronRight className="text-slate-400" size={16} />}
             </button>

             {isLinkingExpanded && (
                 <div className="mt-3 space-y-2 max-h-40 overflow-y-auto custom-scrollbar p-1">
                     {existingGoals.length > 0 ? (
                         existingGoals.map(goal => {
                             const isLinked = formData.linkedGoalIds.includes(goal.id);
                             return (
                                 <div 
                                    key={goal.id} 
                                    onClick={() => toggleLinkedGoal(goal.id)}
                                    className={`flex items-center p-3 rounded-xl border cursor-pointer transition-all ${isLinked ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-transparent hover:bg-slate-100'}`}
                                 >
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center mr-3 transition-colors ${isLinked ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-slate-300'}`}>
                                        {isLinked && <Check size={12} className="text-white" strokeWidth={3} />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">{goal.icon}</span>
                                            <span className={`text-sm font-bold ${isLinked ? 'text-emerald-900' : 'text-slate-700'}`}>{goal.title}</span>
                                        </div>
                                    </div>
                                 </div>
                             );
                         })
                     ) : (
                         <p className="text-xs text-slate-400 italic p-2 text-center">No goals created yet.</p>
                     )}
                 </div>
             )}
          </div>

          <button 
            type="submit" 
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-lg py-4 rounded-2xl mt-4 lg:hover:shadow-lg lg:hover:shadow-emerald-500/20 lg:hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
          >
            <Save size={20} />
            {editingHabit ? 'Update Habit' : 'Create Habit'}
          </button>
        </form>
      </div>
    </div>
  );
};

// --- HABIT HISTORY MODAL ---

interface HabitHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  habit: Habit | null;
  habitLogs: Record<string, HabitLog>;
  onToggleHabit: (habitId: string, completed: boolean, dateKey: string) => void;
  initialView?: 'calendar' | 'list';
  onUpdateNote: (habitId: string, note: string, dateKey: string) => void;
  onDeleteLog: (habitId: string, dateKey: string) => void;
}

export const HabitHistoryModal: React.FC<HabitHistoryModalProps> = ({ 
  isOpen, onClose, habit, habitLogs, onToggleHabit, initialView = 'calendar', onUpdateNote, onDeleteLog
}) => {
  const [view, setView] = useState<'calendar' | 'list'>(initialView);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Editing state for list view
  const [editingLogDate, setEditingLogDate] = useState<string | null>(null);
  const [editNoteText, setEditNoteText] = useState("");

  // Create new log state
  const [isCreatingLog, setIsCreatingLog] = useState(false);
  const [newLogDate, setNewLogDate] = useState(formatLocalYMD(new Date()));
  const [newLogNote, setNewLogNote] = useState("");

  useEffect(() => {
    setView(initialView);
  }, [initialView, isOpen]);

  if (!isOpen || !habit) return null;

  const getLogsForHabit = () => {
    return (Object.values(habitLogs) as HabitLog[])
      .filter(log => log.habitId === habit.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const startEditingLog = (log: HabitLog) => {
    setEditingLogDate(log.date);
    setEditNoteText(log.note || "");
  };

  const saveEditedLog = (log: HabitLog) => {
    onUpdateNote(habit.id, editNoteText, log.date);
    setEditingLogDate(null);
  };

  const handleCreateLog = () => {
    if (newLogDate) {
        // Toggle will create if not exists
        onToggleHabit(habit.id, true, newLogDate);
        if (newLogNote.trim()) {
            // Wait slightly for state update or assume immediate
            // Ideally we'd pass note to onToggleHabit but current signature doesn't support it
            // So we call update note right after
            setTimeout(() => onUpdateNote(habit.id, newLogNote, newLogDate), 0);
        }
        setIsCreatingLog(false);
        setNewLogDate(formatLocalYMD(new Date()));
        setNewLogNote("");
    }
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday

    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

    const monthName = currentDate.toLocaleString('default', { month: 'long' });

    // Helper to get matching color from habit
    const match = habit.color.match(/text-(\w+)-500/);
    const colorName = match ? match[1] : 'emerald';

    return (
      <div className="animate-in fade-in slide-in-from-bottom-2">
         <div className="flex justify-between items-center mb-6">
            <button 
              onClick={() => setCurrentDate(new Date(year, month - 1))}
              className="p-2 lg:hover:bg-slate-100 rounded-xl transition-colors text-slate-500"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="font-bold text-slate-800 text-lg">{monthName} {year}</span>
            <button 
              onClick={() => setCurrentDate(new Date(year, month + 1))}
              className="p-2 lg:hover:bg-slate-100 rounded-xl transition-colors text-slate-500"
            >
              <ChevronRight size={20} />
            </button>
         </div>

         <div className="grid grid-cols-7 gap-2 mb-2">
            {['S','M','T','W','T','F','S'].map(d => (
              <div key={d} className="text-center text-xs font-bold text-slate-400">{d}</div>
            ))}
         </div>
         <div className="grid grid-cols-7 gap-2">
            {emptyDays.map(i => <div key={`empty-${i}`} />)}
            {days.map(day => {
               const dateStr = `${year}-${String(month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
               const logKey = `${habit.id}_${dateStr}`;
               const isCompleted = !!habitLogs[logKey];
               const isToday = dateStr === formatLocalYMD(new Date());
               
               return (
                 <button
                   key={day}
                   onClick={() => onToggleHabit(habit.id, !isCompleted, dateStr)}
                   className={`
                     aspect-square rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-300
                     ${isCompleted 
                        ? `bg-${colorName}-500 text-white shadow-lg shadow-${colorName}-500/20 scale-105` 
                        : isToday 
                           ? 'bg-slate-100 text-slate-900 border-2 border-slate-300' 
                           : 'bg-slate-50 text-slate-400 lg:hover:bg-slate-100'}
                   `}
                   title={isCompleted ? "Completed (Click to undo)" : "Not completed (Click to complete)"}
                 >
                   {day}
                 </button>
               );
            })}
         </div>
         <div className="mt-6 flex justify-center gap-6 text-xs font-medium text-slate-400">
            <div className="flex items-center gap-2">
               <div className={`w-3 h-3 rounded-full bg-${colorName}-500`}></div> Completed
            </div>
            <div className="flex items-center gap-2">
               <div className="w-3 h-3 rounded-full bg-slate-100 border border-slate-300"></div> Missed
            </div>
         </div>
         <p className="text-center text-[10px] text-slate-300 mt-4">Tip: Click any past date to toggle status.</p>
      </div>
    );
  };

  const renderList = () => {
    const logs = getLogsForHabit();
    const match = habit.color.match(/text-(\w+)-500/);
    const colorName = match ? match[1] : 'emerald';

    return (
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar animate-in fade-in slide-in-from-bottom-2">
         
         {/* Helper to add manual log directly here if list is empty or just as a feature */}
         <div className="flex justify-end mb-2">
            <button 
                onClick={() => setIsCreatingLog(!isCreatingLog)}
                className="text-xs font-bold text-emerald-600 flex items-center gap-1 hover:bg-emerald-50 px-2 py-1 rounded-lg transition-colors"
            >
                {isCreatingLog ? <X size={14} /> : <Plus size={14} />}
                {isCreatingLog ? "Cancel" : "Add Past Entry"}
            </button>
         </div>

         {isCreatingLog && (
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 mb-4 animate-in fade-in slide-in-from-top-2">
                <h4 className="text-xs font-bold text-emerald-800 uppercase mb-3">New Entry</h4>
                <div className="space-y-3">
                    <input 
                        type="date"
                        max={formatLocalYMD(new Date())}
                        value={newLogDate}
                        onChange={(e) => setNewLogDate(e.target.value)}
                        className="w-full text-sm p-2 rounded-xl border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800"
                    />
                    <input 
                        type="text"
                        placeholder="Optional note..."
                        value={newLogNote}
                        onChange={(e) => setNewLogNote(e.target.value)}
                        className="w-full text-sm p-2 rounded-xl border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800"
                    />
                    <button 
                        onClick={handleCreateLog}
                        className="w-full bg-emerald-500 text-white font-bold text-sm py-2 rounded-xl hover:bg-emerald-600 transition-colors"
                    >
                        Save Entry
                    </button>
                </div>
            </div>
         )}

         {logs.length > 0 ? logs.map(log => (
            <div key={log.date} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex gap-4 group hover:border-emerald-200 hover:shadow-sm transition-all">
               <div className={`w-10 h-10 rounded-xl bg-${colorName}-100 text-${colorName}-600 flex items-center justify-center shrink-0`}>
                  <Check size={20} />
               </div>
               <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                     <span className="font-bold text-slate-800">
                        {new Date(log.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                     </span>
                     <div className="flex gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                        {editingLogDate === log.date ? (
                           <>
                             <button 
                                onClick={() => saveEditedLog(log)}
                                className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600"
                                title="Save"
                             >
                                <Check size={14} />
                             </button>
                             <button 
                                onClick={() => setEditingLogDate(null)}
                                className="p-1.5 rounded-lg bg-slate-200 text-slate-500"
                                title="Cancel"
                             >
                                <X size={14} />
                             </button>
                           </>
                        ) : (
                           <>
                             <button 
                                onClick={() => startEditingLog(log)}
                                className="p-1.5 rounded-lg bg-white text-slate-400 border border-slate-200 lg:hover:text-emerald-500 lg:hover:border-emerald-200 transition-colors"
                                title={log.note ? "Edit Note" : "Add Note"}
                             >
                                {log.note ? <Pencil size={14} /> : <MessageSquarePlus size={14} />}
                             </button>
                             <button 
                                onClick={() => onDeleteLog(habit.id, log.date)}
                                className="p-1.5 rounded-lg bg-white text-slate-400 border border-slate-200 lg:hover:text-red-500 lg:hover:border-red-200 transition-colors"
                                title="Delete Entry"
                             >
                                <Trash2 size={14} />
                             </button>
                           </>
                        )}
                     </div>
                  </div>
                  
                  {editingLogDate === log.date ? (
                     <input 
                        type="text"
                        value={editNoteText}
                        onChange={(e) => setEditNoteText(e.target.value)}
                        className="w-full text-sm p-2 rounded-lg bg-slate-800 text-white border border-slate-700 focus:outline-none focus:border-emerald-500 placeholder:text-slate-500"
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && saveEditedLog(log)}
                        placeholder="Add a note..."
                     />
                  ) : (
                     log.note ? (
                       <p className="text-sm text-slate-600 bg-white p-2 rounded-lg border border-slate-100 inline-block">
                         {log.note}
                       </p>
                     ) : (
                       <p className="text-xs text-slate-400 italic">No notes added.</p>
                     )
                  )}
               </div>
            </div>
         )) : (
            <div className="text-center py-12 text-slate-400 italic">
               No history available for this habit.
            </div>
         )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-md transition-all">
      <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl border border-white/50 animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-2xl font-bold text-slate-900">Habit History</h3>
            <p className="text-slate-500 text-sm">Track your consistency</p>
          </div>
          <button onClick={onClose} className="p-2 lg:hover:bg-slate-100 rounded-full transition-colors text-slate-400 lg:hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        <div className="bg-slate-100 p-1 rounded-xl flex mb-6">
          <button 
            onClick={() => setView('calendar')}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${view === 'calendar' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 lg:hover:text-slate-600'}`}
          >
            Calendar
          </button>
          <button 
            onClick={() => setView('list')}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${view === 'list' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 lg:hover:text-slate-600'}`}
          >
            List & Notes
          </button>
        </div>

        {view === 'calendar' ? renderCalendar() : renderList()}
      </div>
    </div>
  );
};
