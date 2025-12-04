import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, Check, AlignLeft, List, CalendarDays, X, Save, CornerDownLeft, Sparkles, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Habit, HabitLog } from '../types';
import { generateSuggestions } from '../services/gemini';

// Helper for date formatting in this module
const formatLocalYMD = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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
  const todaysDateKey = formatLocalYMD(new Date());
  const log = habitLogs[`${habit.id}_${todaysDateKey}`];
  
  const [noteText, setNoteText] = useState(log?.note || "");
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    setNoteText(log?.note || "");
  }, [log]);

  const handleSaveNote = () => {
    if (log) {
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

  return (
    <div className="bg-white/60 backdrop-blur-md rounded-[2rem] border border-white/60 shadow-xl shadow-slate-200/40 hover:shadow-2xl transition-all duration-300 group relative overflow-hidden flex flex-col">
       <div className="absolute top-6 right-6 flex gap-2 z-20">
         <button 
          onClick={(e) => { e.stopPropagation(); onViewHistory(habit, 'list'); }}
          className="p-2 rounded-full bg-slate-100 text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-emerald-50 hover:text-emerald-500 transition-all duration-300"
          title="List View"
        >
          <List size={16} />
        </button>
         <button 
          onClick={(e) => { e.stopPropagation(); onViewHistory(habit, 'calendar'); }}
          className="p-2 rounded-full bg-slate-100 text-slate-400 hover:bg-emerald-50 hover:text-emerald-500 transition-colors"
          title="History Calendar"
        >
          <CalendarDays size={16} />
        </button>
         <button 
          onClick={(e) => { e.stopPropagation(); onEdit(habit); }}
          className="p-2 rounded-full bg-slate-100 text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-emerald-50 hover:text-emerald-500 transition-all duration-300"
          title="Edit Habit"
        >
          <Pencil size={16} />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(habit.id); }}
          className="p-2 rounded-full bg-slate-100 text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 transition-all duration-300"
          title="Delete Habit"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="p-6">
        <div className="flex items-center gap-5">
          <button 
            onClick={() => onToggle(habit.id, !log, todaysDateKey)}
            className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl transition-all duration-500 shadow-lg shrink-0 ${
              log 
                ? `${habit.color.replace('text-', 'bg-')} text-white scale-110 shadow-emerald-500/30` 
                : 'bg-white text-slate-400 hover:bg-slate-50'
            }`}
          >
            {log ? <Check size={32} strokeWidth={4} /> : habit.icon}
          </button>
          
          <div className="flex-1 min-w-0 pr-20">
             <h3 className="font-bold text-slate-800 text-lg truncate">{habit.title}</h3>
             <div className="flex items-center gap-2 mt-1">
               <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider truncate">{habit.category}</span>
               <span className="text-xs font-medium text-slate-300">•</span>
               <span className="text-xs font-medium text-amber-500 flex items-center gap-1 whitespace-nowrap">
                  🔥 {habit.streak || 0} Streak
               </span>
             </div>
          </div>
        </div>

        <div 
          className={`mt-4 overflow-hidden transition-all duration-500 ${log ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'}`}
          key={log ? 'note-visible' : 'note-hidden'}
        >
          <div className="relative">
            <AlignLeft className="absolute left-4 top-3.5 text-slate-400" size={16} />
            <input 
              type="text" 
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              onBlur={() => onUpdateNote(habit.id, noteText)}
              onKeyDown={handleKeyDown}
              placeholder="Habit details..."
              className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-11 pr-12 text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all"
            />
            
            <div className="absolute right-2 top-2 bottom-2 flex items-center">
              {showSuccess ? (
                <div className="bg-emerald-100 text-emerald-600 p-1.5 rounded-lg animate-in fade-in zoom-in duration-300">
                  <Check size={16} strokeWidth={3} />
                </div>
              ) : (
                <button 
                  onClick={handleSaveNote}
                  className="p-1.5 bg-slate-100 hover:bg-emerald-100 text-slate-400 hover:text-emerald-500 rounded-lg transition-colors"
                  title="Save Note"
                >
                  <CornerDownLeft size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
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
}

export const HabitFormModal: React.FC<HabitFormModalProps> = ({ isOpen, onClose, onSave, editingHabit, existingHabits = [] }) => {
  const [formData, setFormData] = useState({
    title: '',
    category: 'Health',
    color: 'text-blue-500 bg-blue-500',
    icon: '💪'
  });

  const [suggestions, setSuggestions] = useState<Array<{title: string, category: string, icon: string}>>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  useEffect(() => {
    if (editingHabit) {
      setFormData({
        title: editingHabit.title,
        category: editingHabit.category,
        color: editingHabit.color,
        icon: editingHabit.icon || '💪'
      });
    } else {
      setFormData({ title: '', category: 'Health', color: 'text-blue-500 bg-blue-500', icon: '💪' });
    }
    setSuggestions([]);
  }, [editingHabit, isOpen]);

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
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600">
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
                    className="text-xs font-bold text-emerald-500 flex items-center gap-1 hover:bg-emerald-50 px-2 py-1 rounded-lg transition-colors"
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
                     className="text-left bg-emerald-50/50 hover:bg-emerald-100 border border-emerald-100 p-2 rounded-xl text-xs flex items-center gap-2 transition-colors"
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
                       : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
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
                      : 'hover:scale-110 hover:opacity-80'
                  }`}
                />
              ))}
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-slate-900 text-white font-bold text-lg py-4 rounded-2xl mt-4 hover:bg-black hover:scale-[1.02] transition-all shadow-xl shadow-slate-900/20 flex items-center justify-center gap-2"
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
}

export const HabitHistoryModal: React.FC<HabitHistoryModalProps> = ({ 
  isOpen, onClose, habit, habitLogs, onToggleHabit, initialView = 'calendar', onUpdateNote
}) => {
  const [view, setView] = useState<'calendar' | 'list'>(initialView);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    setView(initialView);
  }, [initialView, isOpen]);

  if (!isOpen || !habit) return null;

  const getLogsForHabit = () => {
    return (Object.values(habitLogs) as HabitLog[])
      .filter(log => log.habitId === habit.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday

    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

    const monthName = currentDate.toLocaleString('default', { month: 'long' });

    return (
      <div className="animate-in fade-in slide-in-from-bottom-2">
         <div className="flex justify-between items-center mb-6">
            <button 
              onClick={() => setCurrentDate(new Date(year, month - 1))}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="font-bold text-slate-800 text-lg">{monthName} {year}</span>
            <button 
              onClick={() => setCurrentDate(new Date(year, month + 1))}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500"
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
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 scale-105' 
                        : isToday 
                           ? 'bg-slate-100 text-slate-900 border-2 border-slate-300' 
                           : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}
                   `}
                 >
                   {day}
                 </button>
               );
            })}
         </div>
         <div className="mt-6 flex justify-center gap-6 text-xs font-medium text-slate-400">
            <div className="flex items-center gap-2">
               <div className="w-3 h-3 rounded-full bg-emerald-500"></div> Completed
            </div>
            <div className="flex items-center gap-2">
               <div className="w-3 h-3 rounded-full bg-slate-100 border border-slate-300"></div> Missed
            </div>
         </div>
      </div>
    );
  };

  const renderList = () => {
    const logs = getLogsForHabit();
    return (
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar animate-in fade-in slide-in-from-bottom-2">
         {logs.length > 0 ? logs.map(log => (
            <div key={log.date} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex gap-4">
               <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Check size={20} />
               </div>
               <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                     <span className="font-bold text-slate-800">
                        {new Date(log.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                     </span>
                  </div>
                  {log.note ? (
                    <p className="text-sm text-slate-600 bg-white p-2 rounded-lg border border-slate-100 inline-block">
                      {log.note}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No notes added.</p>
                  )}
               </div>
            </div>
         )) : (
            <div className="text-center py-10 text-slate-400 italic">No history yet. Start today!</div>
         )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-md transition-all">
      <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl border border-white/50 animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto custom-scrollbar">
         <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
               <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${habit.color.replace('text-','bg-')} text-white`}>
                 {habit.icon}
               </div>
               <div>
                 <h3 className="font-bold text-slate-900 text-xl">{habit.title}</h3>
                 <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{habit.category}</p>
               </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600">
              <X size={24} />
            </button>
         </div>

         <div className="bg-slate-100 p-1 rounded-xl flex mb-6">
            <button 
              onClick={() => setView('calendar')}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                view === 'calendar' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <CalendarDays size={16} /> Calendar
            </button>
            <button 
              onClick={() => setView('list')}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                view === 'list' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <List size={16} /> List
            </button>
         </div>

         {view === 'calendar' ? renderCalendar() : renderList()}
      </div>
    </div>
  );
};