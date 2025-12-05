import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, Plus, Minus, X, Save, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { Goal } from '../types';
import { generateSuggestions } from '../services/gemini';

interface ProgressCardProps {
  goal: Goal;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (goal: Goal) => void;
}

// Helper to generate a subtle gradient based on the goal's base color
const getProgressBarGradient = (colorClass: string) => {
  // Extracts 'blue', 'emerald', etc. from "text-blue-500 bg-blue-500"
  const match = colorClass.match(/bg-(\w+)-500/);
  const color = match ? match[1] : 'slate';
  // Creates a gradient from the base color (500) to a slightly lighter shade (400)
  return `bg-gradient-to-r from-${color}-500 to-${color}-400`;
};

export const ProgressCard: React.FC<ProgressCardProps> = ({ goal, onIncrement, onDecrement, onDelete, onEdit }) => (
  <div className="bg-white/60 backdrop-blur-md p-6 rounded-[2rem] border border-white/60 shadow-xl shadow-slate-200/40 lg:hover:shadow-2xl lg:hover:shadow-slate-200/50 lg:hover:-translate-y-1 transition-all duration-300 group relative">
    <div className="absolute top-6 right-6 flex gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-300">
       <button 
        onClick={(e) => { e.stopPropagation(); onEdit(goal); }}
        className="p-2 rounded-full bg-slate-100 text-slate-400 lg:hover:bg-emerald-50 lg:hover:text-emerald-500 transition-colors"
        title="Edit Goal"
      >
        <Pencil size={16} />
      </button>
      <button 
        onClick={(e) => { e.stopPropagation(); onDelete(goal.id); }}
        className="p-2 rounded-full bg-slate-100 text-slate-400 lg:hover:bg-red-50 lg:hover:text-red-500 transition-colors"
        title="Delete Goal"
      >
        <Trash2 size={16} />
      </button>
    </div>

    <div className="flex justify-between items-start mb-6 pr-20">
      <div className="flex gap-4 items-center">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${goal.color.replace('text-', 'bg-').replace('bg-', 'bg-opacity-10 ')}`}>
          {goal.icon || '🎯'}
        </div>
        <div>
          <h3 className="font-bold text-slate-800 text-lg leading-tight">{goal.title}</h3>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{goal.category}</span>
        </div>
      </div>
    </div>
    
    <div className="space-y-4">
      <div className="flex justify-between items-end">
        <span className="text-3xl font-bold text-slate-900 tracking-tight">
          {Math.round((goal.progress / goal.target) * 100)}<span className="text-lg text-slate-400 font-medium ml-0.5">%</span>
        </span>
        <div className="flex items-center gap-3 bg-white/50 p-1 pr-1.5 rounded-full border border-white/50">
           <button 
            onClick={() => onDecrement(goal.id)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 lg:hover:bg-slate-100 lg:hover:text-slate-600 transition-colors"
           >
             <Minus size={16} />
           </button>
           <span className="text-sm font-bold text-slate-600 min-w-[40px] text-center">
             {goal.progress}
           </span>
           <button 
            onClick={() => onIncrement(goal.id)}
            className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white lg:hover:bg-black transition-colors shadow-lg shadow-slate-900/20"
           >
             <Plus size={16} />
           </button>
        </div>
      </div>
      <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-[2px]">
        <div 
          className={`h-full rounded-full transition-all duration-1000 ease-out ${getProgressBarGradient(goal.color)} shadow-sm`} 
          style={{ width: `${Math.min((goal.progress / goal.target) * 100, 100)}%` }}
        />
      </div>
    </div>
  </div>
);

interface GoalSuggestionCardProps {
  suggestion: { title: string; category: string; icon: string };
  onAdd: () => void;
}

export const GoalSuggestionCard: React.FC<GoalSuggestionCardProps> = ({ suggestion, onAdd }) => {
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

interface GoalFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Goal, 'id' | 'progress'>) => void;
  editingGoal: Goal | null;
  existingGoals?: Goal[];
  defaultValues?: { title?: string, category?: string, icon?: string };
}

export const GoalFormModal: React.FC<GoalFormModalProps> = ({ isOpen, onClose, onSave, editingGoal, existingGoals = [], defaultValues }) => {
  const [formData, setFormData] = useState({
    title: '',
    category: 'Personal',
    target: 10,
    unit: 'pts',
    color: 'text-blue-500 bg-blue-500',
    icon: '🎯'
  });
  
  const [suggestions, setSuggestions] = useState<Array<{title: string, category: string, icon: string}>>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  useEffect(() => {
    if (editingGoal) {
      setFormData({
        title: editingGoal.title,
        category: editingGoal.category,
        target: editingGoal.target,
        unit: editingGoal.unit || 'pts',
        color: editingGoal.color,
        icon: editingGoal.icon || '🎯'
      });
    } else if (defaultValues) {
      setFormData({
        title: defaultValues.title || '',
        category: defaultValues.category || 'Personal',
        target: 10,
        unit: 'pts',
        color: 'text-blue-500 bg-blue-500',
        icon: defaultValues.icon || '🎯'
      });
    } else {
      setFormData({ title: '', category: 'Personal', target: 10, unit: 'pts', color: 'text-blue-500 bg-blue-500', icon: '🎯' });
    }
    setSuggestions([]);
  }, [editingGoal, isOpen, defaultValues]);

  const fetchSuggestions = async () => {
    setLoadingSuggestions(true);
    const existingTitles = existingGoals.map(g => g.title);
    const ideas = await generateSuggestions('goal', existingTitles);
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

  const emojis = ['🎯', '💻', '🏃', '📚', '💰', '🎨', '🧘', '✈️', '🍎', '🎵', '⚡', '💡', '🛠️', '💧', '💤'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-md transition-all">
      <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl border border-white/50 animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-2xl font-bold text-slate-900">{editingGoal ? 'Edit Goal' : 'New Goal'}</h3>
            <p className="text-slate-500 text-sm">{editingGoal ? 'Update your target' : 'Set a new target for yourself'}</p>
          </div>
          <button onClick={onClose} className="p-2 lg:hover:bg-slate-100 rounded-full transition-colors text-slate-400 lg:hover:text-slate-600">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <div className="flex justify-between items-end mb-2">
               <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Goal Title</label>
               {!editingGoal && (
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
              <div className="mb-3 grid grid-cols-1 gap-2">
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
              placeholder="e.g. Read 30 mins"
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
          
          <div className="grid grid-cols-2 gap-4">
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
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Target</label>
                <div className="flex gap-2">
                   <input
                    type="number"
                    min="1"
                    value={formData.target}
                    onChange={e => setFormData({...formData, target: parseInt(e.target.value)})}
                    className="w-full bg-slate-50 border-0 rounded-2xl px-5 py-4 font-medium text-slate-700"
                  />
                </div>
             </div>
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

          <button 
            type="submit" 
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-lg py-4 rounded-2xl mt-4 lg:hover:shadow-lg lg:hover:shadow-emerald-500/20 lg:hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
          >
            <Save size={20} />
            {editingGoal ? 'Update Goal' : 'Create Goal'}
          </button>
        </form>
      </div>
    </div>
  );
};