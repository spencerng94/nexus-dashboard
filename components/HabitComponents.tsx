import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, Check, AlignLeft, List, CalendarDays, X, Save, CornerDownLeft } from 'lucide-react';
import { Habit, HabitLog } from '../types';

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
}

export const HabitFormModal: React.FC<HabitFormModalProps> = ({ isOpen, onClose, onSave, editingHabit }) => {
  const [formData, setFormData] = useState({
    title: '',
    category: 'Health',
    color: 'text-blue-500 bg-blue-500',
    icon: '💪'
  });

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
  }, [editingHabit, isOpen]);

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
      <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl border border-white/50 animate-in fade-in zoom-in duration-300">
        <div className="flex justify-between items-center mb-8">
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
            <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Habit Title</label>
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

// --- HISTORY MODAL ---

interface HabitHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  habit: Habit | null;
  habitLogs: Record<string, HabitLog>;
  onToggleHabit: (habitId: string, completed: boolean, dateKey: string) => void;
  initialView: 'calendar' | 'list';
  onUpdateNote: (habitId: string, note: string, dateKey: string) => void;
}

export const HabitHistoryModal: React.FC<HabitHistoryModalProps> = ({ isOpen, onClose, habit, habitLogs, onToggleHabit, initialView, onUpdateNote }) => {
  const [view, setView] = useState<'calendar' | 'list'>(initialView || 'calendar'); 
  const [editingLogDate, setEditingLogDate] = useState<string | null>(null);
  const [editNote, setEditNote] = useState("");

  useEffect(() => {
    if (isOpen && initialView) setView(initialView);
  }, [isOpen, initialView]);

  if (!isOpen || !habit) return null;

  const today = new Date();
  const getDaysForMiniCalendar = () => {
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => {
       const date = new Date(today.getFullYear(), today.getMonth(), i + 1);
       return date;
    });
  };
  const miniCalendarDays = getDaysForMiniCalendar();

  const historyList = (Object.values(habitLogs) as HabitLog[])
    .filter(log => log.habitId === habit.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const startEditing = (log: HabitLog) => {
    setEditingLogDate(log.date);
    setEditNote(log.note || "");
  };

  const saveEdit = (log: HabitLog) => {
    onUpdateNote(habit.id, editNote, log.date);
    setEditingLogDate(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-md transition-all">
      <div className="bg-white rounded-[2rem] p-8 w-full max-w-lg shadow-2xl border border-white/50 animate-in fade-in zoom-in duration-300 max-h-[85vh] flex flex-col">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${habit.color.replace('text-', 'bg-')} text-white shadow-lg`}>
              {habit.icon}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900">{habit.title}</h3>
              <div className="flex gap-2 mt-1">
                 <button 
                   onClick={() => setView('calendar')}
                   className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${view === 'calendar' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                 >
                   Calendar
                 </button>
                 <button 
                   onClick={() => setView('list')}
                   className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${view === 'list' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                 >
                   List
                 </button>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        {/* View Content */}
        {view === 'calendar' ? (
          <div className="bg-slate-50/80 rounded-2xl p-5 mb-2 border border-slate-100">
             <div className="flex justify-between items-center mb-4">
               <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                 {today.toLocaleString('default', { month: 'long', year: 'numeric' })}
               </span>
             </div>
             <div className="grid grid-cols-7 gap-2">
               {['S','M','T','W','T','F','S'].map((d, i) => (
                 <div key={i} className="text-center text-[10px] font-bold text-slate-300">{d}</div>
               ))}
               {miniCalendarDays.map((date, i) => {
                  const dateStr = formatLocalYMD(date); 
                  const dayLog = habitLogs[`${habit.id}_${dateStr}`];
                  const isFuture = date > new Date();
                  const isToday = dateStr === formatLocalYMD(new Date());
                  
                  return (
                    <button 
                      key={i}
                      disabled={isFuture}
                      onClick={() => onToggleHabit(habit.id, !dayLog, dateStr)}
                      className={`aspect-square rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                         dayLog 
                           ? `${habit.color.replace('text-', 'bg-')} text-white shadow-sm scale-105` 
                           : isFuture ? 'opacity-20 cursor-not-allowed' : 'bg-white text-slate-400 hover:bg-slate-200'
                      } ${isToday && !dayLog ? 'ring-2 ring-emerald-500 ring-offset-1' : ''}`}
                    >
                      {date.getDate()}
                    </button>
                  )
               })}
             </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar min-h-[300px]">
            {historyList.length === 0 ? (
              <div className="text-center py-12 text-slate-400 italic">No history recorded yet.</div>
            ) : (
              historyList.map((log) => (
                <div key={log.date} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-100 transition-colors">
                  <div className="w-14 flex flex-col items-center justify-center text-slate-500 bg-white rounded-xl py-2 border border-slate-100 shadow-sm shrink-0">
                    <span className="text-[10px] font-bold uppercase tracking-wide">{new Date(log.date).toLocaleString('default', { month: 'short' })}</span>
                    <span className="text-xl font-bold text-slate-800">{new Date(log.date).getDate() + 1}</span>
                  </div>
                  <div className="flex-1 pt-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-slate-800">{habit.title}</span>
                      <Check size={14} className="text-emerald-500" strokeWidth={3} />
                    </div>
                    
                    {editingLogDate === log.date ? (
                      <div className="flex gap-2 items-center">
                        <input 
                          type="text" 
                          value={editNote}
                          onChange={(e) => setEditNote(e.target.value)}
                          className="flex-1 bg-white border border-slate-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          autoFocus
                        />
                        <button onClick={() => saveEdit(log)} className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700">
                          <Check size={14} />
                        </button>
                        <button onClick={() => setEditingLogDate(null)} className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200">
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center group/note">
                        <p className="text-sm text-slate-600 bg-white p-2 rounded-lg border border-slate-100 inline-block min-w-[50%] truncate">
                          {log.note || <span className="italic opacity-50">No details added</span>}
                        </p>
                        <button 
                          onClick={() => startEditing(log)}
                          className="p-1.5 text-slate-400 hover:text-emerald-600 opacity-0 group-hover/note:opacity-100 transition-opacity"
                        >
                          <Pencil size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};