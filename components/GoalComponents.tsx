import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, Plus, Minus, X, Save, Sparkles, Loader2, ArrowRight, Search, Link as LinkIcon, Flame, CheckSquare, Square, AlertCircle, Calendar, Users, GripHorizontal, MousePointerClick } from 'lucide-react';
import { Goal, Habit, Subgoal } from '../types';
import { generateSuggestions } from '../services/gemini';

interface ProgressCardProps {
  goal: Goal;
  linkedHabits?: Habit[];
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (goal: Goal) => void;
  onToggleSubgoal?: (goalId: string, subgoalId: string) => void;
}

// Helper to generate a subtle gradient based on the goal's base color
const getProgressBarGradient = (colorClass: string) => {
  // Extracts 'blue', 'emerald', etc. from "text-blue-500 bg-blue-500"
  const match = colorClass.match(/bg-(\w+)-500/);
  const color = match ? match[1] : 'slate';
  // Creates a gradient from the base color (500) to a slightly lighter shade (400)
  return `bg-gradient-to-r from-${color}-500 to-${color}-400`;
};

// Helper to generate consistent icon styles (Light background, darker text)
const getIconStyles = (colorClass: string) => {
  const match = colorClass.match(/bg-(\w+)-500/);
  const color = match ? match[1] : 'slate';
  return `bg-${color}-100 dark:bg-${color}-500/10 text-${color}-600 dark:text-${color}-400`;
};

export const ProgressCard: React.FC<ProgressCardProps> = ({ goal, linkedHabits, onIncrement, onDecrement, onDelete, onEdit, onToggleSubgoal }) => {
  const [showLinkedHabits, setShowLinkedHabits] = useState(false);
  const [showSubgoals, setShowSubgoals] = useState(true);

  return (
    <div className="bg-white/60 dark:bg-stone-900/80 backdrop-blur-md p-6 rounded-[2rem] border border-white/60 dark:border-stone-800 shadow-xl shadow-slate-200/40 dark:shadow-none lg:hover:shadow-2xl lg:hover:shadow-slate-200/50 lg:dark:hover:shadow-emerald-500/5 lg:hover:-translate-y-1 transition-all duration-300 group relative flex flex-col h-full">
      <div className="absolute top-6 right-6 flex gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-300 z-10">
         {linkedHabits && linkedHabits.length > 0 && (
            <button 
              onClick={(e) => { e.stopPropagation(); setShowLinkedHabits(!showLinkedHabits); }}
              className={`p-2 rounded-full transition-colors ${showLinkedHabits ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 dark:bg-stone-800 text-slate-400 lg:hover:bg-emerald-50 lg:dark:hover:bg-emerald-900/20 lg:hover:text-emerald-500'}`}
              title="Linked Habits"
            >
              <LinkIcon size={16} />
            </button>
         )}
         <button 
          onClick={(e) => { e.stopPropagation(); onEdit(goal); }}
          className="p-2 rounded-full bg-slate-100 dark:bg-stone-800 text-slate-400 lg:hover:bg-emerald-50 lg:dark:hover:bg-emerald-900/20 lg:hover:text-emerald-500 transition-colors"
          title="Edit Goal"
        >
          <Pencil size={16} />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(goal.id); }}
          className="p-2 rounded-full bg-slate-100 dark:bg-stone-800 text-slate-400 lg:hover:bg-red-50 lg:dark:hover:bg-red-900/20 lg:hover:text-red-500 transition-colors"
          title="Delete Goal"
        >
          <Trash2 size={16} />
        </button>
      </div>
  
      <div className="flex justify-between items-start mb-6 pr-24">
        <div className="flex gap-4 items-center">
          <div className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center text-2xl ${getIconStyles(goal.color)}`}>
            {goal.icon || '🎯'}
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-stone-100 text-lg leading-tight">{goal.title}</h3>
            <span className="text-xs font-semibold text-slate-400 dark:text-stone-500 uppercase tracking-wider">{goal.category}</span>
          </div>
        </div>
      </div>
      
      <div className="space-y-4 mb-4">
        <div className="flex justify-between items-end">
          <span className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            {goal.target > 0 ? Math.round((goal.progress / goal.target) * 100) : 0}<span className="text-lg text-slate-400 dark:text-stone-500 font-medium ml-0.5">%</span>
          </span>
          <div className="flex items-center gap-3 bg-white/50 dark:bg-stone-800/50 p-1 pr-1.5 rounded-full border border-white/50 dark:border-stone-700/50">
             <button 
              onClick={() => onDecrement(goal.id)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 lg:hover:bg-slate-100 dark:lg:hover:bg-stone-700 lg:hover:text-slate-600 transition-colors"
             >
               <Minus size={16} />
             </button>
             <span className="text-sm font-bold text-slate-600 dark:text-stone-300 min-w-[40px] text-center">
               {goal.progress} <span className="text-xs font-normal text-slate-400 dark:text-stone-500">/ {goal.target} {goal.unit}</span>
             </span>
             <button 
              onClick={() => onIncrement(goal.id)}
              className="w-8 h-8 rounded-full bg-slate-900 dark:bg-stone-700 flex items-center justify-center text-white lg:hover:bg-black dark:lg:hover:bg-stone-600 transition-colors shadow-lg shadow-slate-900/20"
             >
               <Plus size={16} />
             </button>
          </div>
        </div>
        <div className="h-3 w-full bg-slate-100 dark:bg-stone-800 rounded-full overflow-hidden p-[2px]">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ease-out ${getProgressBarGradient(goal.color)} shadow-sm`} 
            style={{ width: `${Math.min((goal.progress / (goal.target || 1)) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Subgoals Section */}
      {goal.subgoals && goal.subgoals.length > 0 && (
         <div className="mt-auto border-t border-slate-100 dark:border-stone-800 pt-3">
             <button 
               onClick={() => setShowSubgoals(!showSubgoals)}
               className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-stone-300 uppercase tracking-wide mb-2"
             >
                {showSubgoals ? <Minus size={10} /> : <Plus size={10} />} Checkpoints ({goal.subgoals.filter(s => s.completed).length}/{goal.subgoals.length})
             </button>
             {showSubgoals && (
                 <div className="space-y-1">
                     {goal.subgoals.map(sub => (
                         <div 
                           key={sub.id} 
                           onClick={() => onToggleSubgoal && onToggleSubgoal(goal.id, sub.id)}
                           className={`flex items-start gap-2 p-2 rounded-xl cursor-pointer transition-colors ${sub.completed ? 'bg-emerald-50/50 dark:bg-emerald-900/10' : 'hover:bg-slate-50 dark:hover:bg-stone-800/50'}`}
                         >
                             <div className={`mt-0.5 ${sub.completed ? 'text-emerald-500' : 'text-slate-300 dark:text-stone-600'}`}>
                                 {sub.completed ? <CheckSquare size={16} /> : <Square size={16} />}
                             </div>
                             <span className={`text-sm font-medium leading-tight ${sub.completed ? 'text-slate-400 dark:text-stone-600 line-through' : 'text-slate-600 dark:text-stone-400'}`}>
                                 {sub.title}
                             </span>
                         </div>
                     ))}
                 </div>
             )}
         </div>
      )}

      {showLinkedHabits && linkedHabits && (
        <div className="mt-4 pt-4 border-t border-slate-100/60 dark:border-stone-800 animate-in fade-in slide-in-from-top-1">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-3 flex items-center gap-1">
                <LinkIcon size={10} /> Linked Habits
            </h4>
            <div className="space-y-2">
                {linkedHabits.map(h => (
                    <div key={h.id} className="flex items-center gap-3 bg-white/50 dark:bg-stone-800/50 p-2 rounded-xl border border-white/50 dark:border-stone-700/50">
                        <span className="text-lg">{h.icon}</span>
                        <span className="text-sm font-bold text-slate-700 dark:text-stone-300 flex-1">{h.title}</span>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-amber-500 bg-white dark:bg-stone-700 px-2 py-1 rounded-lg shadow-sm">
                            <Flame size={12} fill="currentColor" /> {h.streak}
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}
    </div>
  );
};

interface GoalSuggestionCardProps {
  suggestion: { title: string; category: string; icon: string };
  onAdd: () => void;
}

export const GoalSuggestionCard: React.FC<GoalSuggestionCardProps> = ({ suggestion, onAdd }) => {
  return (
    <button 
      onClick={onAdd}
      className="bg-white dark:bg-stone-900 p-5 rounded-[1.5rem] border border-slate-100 dark:border-stone-800 lg:hover:border-emerald-200 dark:lg:hover:border-emerald-700 lg:hover:shadow-lg lg:hover:shadow-emerald-500/10 transition-all duration-300 text-left group flex flex-col h-full"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-xl">
          {suggestion.icon}
        </div>
        <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-stone-800 flex items-center justify-center text-slate-400 lg:group-hover:bg-emerald-500 lg:group-hover:text-white transition-colors">
          <Plus size={16} />
        </div>
      </div>
      <h4 className="font-bold text-slate-800 dark:text-stone-200 text-sm mb-1">{suggestion.title}</h4>
      <span className="text-[10px] font-bold text-emerald-500 dark:text-emerald-400 uppercase tracking-wide">{suggestion.category}</span>
    </button>
  );
};

// --- SUGGESTION CONTROL ---
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
                        className="px-3 py-1.5 bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-800 text-slate-600 dark:text-stone-400 rounded-full text-xs font-bold hover:border-emerald-500 hover:text-emerald-500 transition-colors disabled:opacity-50"
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
                        className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-700 bg-slate-800 dark:bg-stone-800 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
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


interface GoalFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Goal, 'id' | 'progress'>) => void;
  editingGoal: Goal | null;
  existingGoals?: Goal[];
  defaultValues?: { 
      title?: string, 
      category?: string, 
      icon?: string,
      priorityQuadrant?: 'q1' | 'q2' | 'q3' | 'q4'
  };
}

export const GoalFormModal: React.FC<GoalFormModalProps> = ({ isOpen, onClose, onSave, editingGoal, existingGoals = [], defaultValues }) => {
  const [formData, setFormData] = useState({
    title: '',
    category: 'Personal',
    target: 10,
    unit: 'pts',
    color: 'text-blue-500 bg-blue-500',
    icon: '🎯',
    priorityQuadrant: undefined as 'q1' | 'q2' | 'q3' | 'q4' | undefined
  });
  
  const [subgoals, setSubgoals] = useState<Subgoal[]>([]);
  const [newSubgoalTitle, setNewSubgoalTitle] = useState("");

  const [suggestions, setSuggestions] = useState<Array<{title: string, category: string, icon: string}>>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Extract unique categories for suggestions
  const existingCategories = Array.from(new Set(existingGoals.map(g => g.category || 'Personal')));

  useEffect(() => {
    if (editingGoal) {
      setFormData({
        title: editingGoal.title,
        category: editingGoal.category,
        target: editingGoal.target,
        unit: editingGoal.unit || 'pts',
        color: editingGoal.color,
        icon: editingGoal.icon || '🎯',
        priorityQuadrant: editingGoal.priorityQuadrant
      });
      setSubgoals(editingGoal.subgoals || []);
    } else if (defaultValues) {
      setFormData({
        title: defaultValues.title || '',
        category: defaultValues.category || 'Personal',
        target: 10,
        unit: 'pts',
        color: 'text-blue-500 bg-blue-500',
        icon: defaultValues.icon || '🎯',
        priorityQuadrant: defaultValues.priorityQuadrant
      });
      setSubgoals([]);
    } else {
      setFormData({ title: '', category: 'Personal', target: 10, unit: 'pts', color: 'text-blue-500 bg-blue-500', icon: '🎯', priorityQuadrant: undefined });
      setSubgoals([]);
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

  const addSubgoal = () => {
      if (newSubgoalTitle.trim()) {
          setSubgoals([...subgoals, { id: Date.now().toString(), title: newSubgoalTitle, completed: false }]);
          setNewSubgoalTitle("");
      }
  };

  const removeSubgoal = (id: string) => {
      setSubgoals(subgoals.filter(s => s.id !== id));
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, subgoals });
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

  // Added 🏆 to make 16 items (4x4 grid)
  const emojis = ['🎯', '💻', '🏃', '📚', '💰', '🎨', '🧘', '✈️', '🍎', '🎵', '⚡', '💡', '🛠️', '💧', '💤', '🏆'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-md transition-all">
      <div className="bg-white dark:bg-stone-900 rounded-3xl md:rounded-[2rem] p-5 md:p-8 w-full max-w-2xl shadow-2xl border border-white/50 dark:border-stone-800 animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{editingGoal ? 'Edit Goal' : 'New Goal'}</h3>
            <p className="text-slate-500 dark:text-stone-400 text-sm">{editingGoal ? 'Update your target' : 'Set a new target for yourself'}</p>
          </div>
          <button onClick={onClose} className="p-2 lg:hover:bg-slate-100 dark:lg:hover:bg-stone-800 rounded-full transition-colors text-slate-400 dark:text-stone-500 lg:hover:text-slate-600 dark:lg:hover:text-stone-300">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Left Column: Core Data */}
            <div className="space-y-6">
                <div>
                    <div className="flex justify-between items-end mb-2">
                       <label className="text-sm font-bold text-slate-700 dark:text-stone-400 uppercase tracking-wide">Goal Title</label>
                       {!editingGoal && (
                         <button 
                           type="button" 
                           onClick={fetchSuggestions}
                           disabled={loadingSuggestions}
                           className="text-xs font-bold text-emerald-500 flex items-center gap-1 lg:hover:bg-emerald-50 dark:lg:hover:bg-emerald-900/20 px-2 py-1 rounded-lg transition-colors"
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
                            className="text-left bg-emerald-50/50 dark:bg-emerald-900/20 lg:hover:bg-emerald-100 border border-emerald-100 dark:border-emerald-800 p-2 rounded-xl text-xs flex items-center gap-2 transition-colors"
                          >
                            <span className="text-lg">{s.icon}</span>
                            <div>
                              <span className="font-bold text-slate-800 dark:text-stone-200 block">{s.title}</span>
                              <span className="text-emerald-600 dark:text-emerald-400">{s.category}</span>
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
                      className="w-full bg-slate-50 dark:bg-stone-800 border-0 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800 dark:text-stone-100 font-semibold placeholder:text-slate-300 text-base md:text-sm"
                      placeholder="e.g. Read 30 mins"
                      autoFocus
                    />
                </div>

                {/* Priority Matrix Selector */}
                <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-stone-400 mb-2 uppercase tracking-wide">Priority (Matrix)</label>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={() => setFormData({...formData, priorityQuadrant: formData.priorityQuadrant === 'q1' ? undefined : 'q1'})}
                            className={`p-3 rounded-xl border-2 text-left transition-all ${
                                formData.priorityQuadrant === 'q1' 
                                ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-500 text-rose-800 dark:text-rose-100 shadow-md' 
                                : 'bg-white dark:bg-stone-800 border-transparent text-slate-500 dark:text-stone-400 hover:bg-slate-50 dark:hover:bg-stone-700'
                            }`}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <AlertCircle size={14} /> <span className="text-xs font-bold uppercase">Do First</span>
                            </div>
                            <p className="text-[10px] opacity-70 leading-tight">Urgent & Important</p>
                        </button>

                        <button
                            type="button"
                            onClick={() => setFormData({...formData, priorityQuadrant: formData.priorityQuadrant === 'q2' ? undefined : 'q2'})}
                            className={`p-3 rounded-xl border-2 text-left transition-all ${
                                formData.priorityQuadrant === 'q2' 
                                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-800 dark:text-blue-100 shadow-md' 
                                : 'bg-white dark:bg-stone-800 border-transparent text-slate-500 dark:text-stone-400 hover:bg-slate-50 dark:hover:bg-stone-700'
                            }`}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <Calendar size={14} /> <span className="text-xs font-bold uppercase">Schedule</span>
                            </div>
                            <p className="text-[10px] opacity-70 leading-tight">Important, Not Urgent</p>
                        </button>

                        <button
                            type="button"
                            onClick={() => setFormData({...formData, priorityQuadrant: formData.priorityQuadrant === 'q3' ? undefined : 'q3'})}
                            className={`p-3 rounded-xl border-2 text-left transition-all ${
                                formData.priorityQuadrant === 'q3' 
                                ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-500 text-amber-800 dark:text-amber-100 shadow-md' 
                                : 'bg-white dark:bg-stone-800 border-transparent text-slate-500 dark:text-stone-400 hover:bg-slate-50 dark:hover:bg-stone-700'
                            }`}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <Users size={14} /> <span className="text-xs font-bold uppercase">Delegate</span>
                            </div>
                            <p className="text-[10px] opacity-70 leading-tight">Urgent, Not Important</p>
                        </button>

                        <button
                            type="button"
                            onClick={() => setFormData({...formData, priorityQuadrant: formData.priorityQuadrant === 'q4' ? undefined : 'q4'})}
                            className={`p-3 rounded-xl border-2 text-left transition-all ${
                                formData.priorityQuadrant === 'q4' 
                                ? 'bg-slate-100 dark:bg-stone-700 border-slate-500 text-slate-800 dark:text-slate-100 shadow-md' 
                                : 'bg-white dark:bg-stone-800 border-transparent text-slate-500 dark:text-stone-400 hover:bg-slate-50 dark:hover:bg-stone-700'
                            }`}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <Trash2 size={14} /> <span className="text-xs font-bold uppercase">Eliminate</span>
                            </div>
                            <p className="text-[10px] opacity-70 leading-tight">Neither</p>
                        </button>
                    </div>
                </div>

                {/* Category & Target */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-stone-400 mb-2 uppercase tracking-wide">Category</label>
                        <input
                          type="text"
                          value={formData.category}
                          onChange={e => setFormData({...formData, category: e.target.value})}
                          className="w-full bg-slate-50 dark:bg-stone-800 border-0 rounded-2xl px-5 py-4 font-medium text-slate-700 dark:text-stone-200 text-base md:text-sm mb-2"
                          placeholder="Health"
                          list="category-suggestions"
                        />
                        <div className="flex flex-wrap gap-1">
                           {existingCategories.slice(0,4).map(cat => (
                               <button
                                 key={cat}
                                 type="button"
                                 onClick={() => setFormData({...formData, category: cat})}
                                 className="text-[10px] bg-slate-100 dark:bg-stone-800 text-slate-500 dark:text-stone-400 px-2 py-1 rounded-full font-bold hover:bg-slate-200 dark:hover:bg-stone-700"
                               >
                                 {cat}
                               </button>
                           ))}
                        </div>
                     </div>
                     <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-stone-400 mb-2 uppercase tracking-wide">Target & Unit</label>
                        <div className="flex gap-2">
                           <input
                            type="number"
                            min="1"
                            value={formData.target}
                            onChange={e => setFormData({...formData, target: parseInt(e.target.value)})}
                            className="w-16 bg-slate-50 dark:bg-stone-800 border-0 rounded-2xl px-2 py-4 font-medium text-slate-700 dark:text-stone-200 text-center text-base md:text-sm"
                          />
                          <input
                            type="text"
                            value={formData.unit}
                            onChange={e => setFormData({...formData, unit: e.target.value})}
                            className="flex-1 min-w-0 bg-slate-50 dark:bg-stone-800 border-0 rounded-2xl px-3 py-4 font-medium text-slate-700 dark:text-stone-200 text-base md:text-sm"
                            placeholder="pts"
                          />
                        </div>
                     </div>
                </div>

                {/* Subgoals */}
                <div>
                     <label className="block text-sm font-bold text-slate-700 dark:text-stone-400 mb-2 uppercase tracking-wide">Subgoals / Checkpoints</label>
                     <div className="bg-slate-50 dark:bg-stone-800 rounded-2xl p-3 space-y-2">
                        <div className="flex gap-2">
                           <input 
                             type="text" 
                             value={newSubgoalTitle}
                             onChange={(e) => setNewSubgoalTitle(e.target.value)}
                             onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSubgoal())}
                             placeholder="Add checkpoint..."
                             className="flex-1 bg-white dark:bg-stone-700 border-0 rounded-xl px-3 py-2 text-base md:text-sm text-slate-700 dark:text-stone-200"
                           />
                           <button type="button" onClick={addSubgoal} className="bg-emerald-500 text-white rounded-xl px-3"><Plus size={16} /></button>
                        </div>
                        {subgoals.map(sub => (
                            <div key={sub.id} className="flex items-center gap-2 bg-white dark:bg-stone-700 p-2 rounded-xl">
                                <span className="flex-1 text-sm text-slate-600 dark:text-stone-300">{sub.title}</span>
                                <button type="button" onClick={() => removeSubgoal(sub.id)} className="text-slate-400 hover:text-red-500"><X size={14} /></button>
                            </div>
                        ))}
                        {subgoals.length === 0 && <p className="text-xs text-slate-400 italic text-center py-1">No checkpoints yet</p>}
                     </div>
                </div>
            </div>

            {/* Right Column: Visuals */}
            <div className="space-y-8 flex flex-col">
                <div>
                     <label className="block text-sm font-bold text-slate-700 dark:text-stone-400 mb-3 uppercase tracking-wide">Icon</label>
                     <div className="grid grid-cols-4 gap-3">
                       {emojis.map(emoji => (
                         <button
                           key={emoji}
                           type="button"
                           onClick={() => setFormData({...formData, icon: emoji})}
                           className={`aspect-square rounded-xl flex items-center justify-center text-xl transition-all ${
                             formData.icon === emoji 
                               ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-lg scale-110' 
                               : 'bg-slate-50 dark:bg-stone-800 text-slate-700 dark:text-stone-300 lg:hover:bg-slate-100 dark:lg:hover:bg-stone-700'
                           }`}
                         >
                           {emoji}
                         </button>
                       ))}
                     </div>
                </div>
                  
                <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-stone-400 mb-3 uppercase tracking-wide">Theme Color</label>
                    <div className="flex flex-wrap gap-4">
                      {colors.map(c => (
                        <button
                          key={c.label}
                          type="button"
                          onClick={() => setFormData({...formData, color: c.value})}
                          className={`w-12 h-12 rounded-full ${c.value.split(' ')[1]} transition-all duration-200 ${
                            formData.color === c.value 
                              ? 'ring-4 ring-offset-2 ring-slate-200 dark:ring-stone-600 scale-110 shadow-lg' 
                              : 'lg:hover:scale-110 lg:hover:opacity-80'
                          }`}
                          title={c.label}
                        />
                      ))}
                    </div>
                </div>
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-lg py-4 rounded-2xl mt-8 lg:hover:shadow-lg lg:hover:shadow-emerald-500/20 lg:hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
          >
            <Save size={20} />
            {editingGoal ? 'Update Goal' : 'Create Goal'}
          </button>
        </form>
      </div>
    </div>
  );
};