import React from 'react';
import { Grid2x2, AlertCircle, Calendar, Users, Trash2, GripHorizontal, ArrowRight, Plus } from 'lucide-react';
import { Goal } from '../types';

interface PriorityMatrixViewProps {
  goals: Goal[];
  onUpdateGoalQuadrant: (goalId: string, quadrant: 'q1' | 'q2' | 'q3' | 'q4' | undefined) => void;
  onAddGoal: (quadrant: 'q1' | 'q2' | 'q3' | 'q4') => void;
  onEditGoal: (goal: Goal) => void;
}

interface DraggableGoalCardProps {
  goal: Goal;
  onDragStart: (e: React.DragEvent) => void;
  onClick: () => void;
}

const DraggableGoalCard: React.FC<DraggableGoalCardProps> = ({ goal, onDragStart, onClick }) => {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      className="bg-white dark:bg-stone-800 p-3 rounded-xl border border-slate-100 dark:border-stone-700 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-700 transition-all group relative animate-in fade-in zoom-in-95 hover:-translate-y-0.5 z-10"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-stone-900 flex items-center justify-center text-lg shrink-0">
          {goal.icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-slate-800 dark:text-stone-200 text-sm truncate">{goal.title}</p>
          <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wide truncate">{goal.category}</p>
        </div>
        <GripHorizontal className="text-slate-300 dark:text-stone-600 opacity-0 group-hover:opacity-100 transition-opacity" size={16} />
      </div>
    </div>
  );
};

const Quadrant: React.FC<{
  id: 'q1' | 'q2' | 'q3' | 'q4';
  number: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  colorClass: string;
  goals: Goal[];
  onDrop: (e: React.DragEvent, quadrant: 'q1' | 'q2' | 'q3' | 'q4') => void;
  onDragOver: (e: React.DragEvent) => void;
  onAdd: () => void;
  onGoalClick: (goal: Goal) => void;
}> = ({ id, number, title, subtitle, icon, colorClass, goals, onDrop, onDragOver, onAdd, onGoalClick }) => {
  return (
    <div
      onDrop={(e) => onDrop(e, id)}
      onDragOver={onDragOver}
      className={`rounded-[2rem] p-6 flex flex-col h-full min-h-[300px] border transition-colors relative group/quad overflow-hidden ${colorClass}`}
    >
      {/* Background Number */}
      <div className="absolute -top-4 -right-4 text-[120px] font-black opacity-[0.07] pointer-events-none select-none transition-opacity group-hover/quad:opacity-[0.12]">
        {number}
      </div>

      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-black/10 dark:bg-white/10 flex items-center justify-center text-xs font-bold opacity-70">
                {number}
            </span>
            {title}
          </h3>
          <p className="text-xs font-medium opacity-70 mt-1">{subtitle}</p>
        </div>
        
        <div className="flex items-center gap-2">
            <button 
                onClick={onAdd}
                className="p-2 rounded-xl bg-white/20 hover:bg-white/40 backdrop-blur-sm transition-colors opacity-0 group-hover/quad:opacity-100"
                title="Add to this quadrant"
            >
                <Plus size={16} />
            </button>
            <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
                {icon}
            </div>
        </div>
      </div>
      
      <div className="flex-1 space-y-2 relative z-10">
        {goals.map(goal => (
           <DraggableGoalCard 
             key={goal.id} 
             goal={goal} 
             onClick={() => onGoalClick(goal)}
             onDragStart={(e) => {
                e.dataTransfer.setData('goalId', goal.id);
                e.dataTransfer.effectAllowed = 'move';
             }} 
           />
        ))}
        {goals.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-current opacity-10 rounded-2xl cursor-pointer hover:opacity-20 transition-opacity" onClick={onAdd}>
            <p className="text-xs font-bold uppercase tracking-widest opacity-50">Drop or Add</p>
          </div>
        )}
      </div>
    </div>
  );
};

export const PriorityMatrixView: React.FC<PriorityMatrixViewProps> = ({ goals, onUpdateGoalQuadrant, onAddGoal, onEditGoal }) => {
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, quadrant: 'q1' | 'q2' | 'q3' | 'q4' | undefined) => {
    e.preventDefault();
    const goalId = e.dataTransfer.getData('goalId');
    if (goalId) {
      onUpdateGoalQuadrant(goalId, quadrant);
    }
  };

  const unassignedGoals = goals.filter(g => !g.priorityQuadrant);
  
  return (
    <div className="max-w-[1600px] mx-auto h-[calc(100vh-140px)] flex flex-col animate-in fade-in zoom-in-95 duration-500">
      <div className="flex items-center gap-4 mb-8 shrink-0">
        <div className="w-10 h-10 md:w-14 md:h-14 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
            <Grid2x2 className="text-white w-5 h-5 md:w-8 md:h-8" />
        </div>
        <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">Priority Matrix</h1>
            <p className="text-emerald-500 dark:text-emerald-400 font-bold text-sm mt-1 uppercase tracking-wider">Prioritize goals with the Eisenhower Method</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 h-full min-h-0">
        
        {/* Unassigned Goals Sidebar */}
        <div 
            className="lg:w-80 flex flex-col bg-white/50 dark:bg-stone-900/50 backdrop-blur-xl border border-slate-200 dark:border-stone-800 rounded-[2rem] p-6 shadow-sm shrink-0"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, undefined)}
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-700 dark:text-stone-300">Unassigned</h3>
                <span className="bg-slate-200 dark:bg-stone-800 text-slate-600 dark:text-stone-400 text-xs font-bold px-2 py-1 rounded-full">{unassignedGoals.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1 min-h-[100px]">
                {unassignedGoals.length > 0 ? (
                    unassignedGoals.map(goal => (
                        <DraggableGoalCard 
                            key={goal.id} 
                            goal={goal} 
                            onClick={() => onEditGoal(goal)}
                            onDragStart={(e) => {
                                e.dataTransfer.setData('goalId', goal.id);
                                e.dataTransfer.effectAllowed = 'move';
                            }} 
                        />
                    ))
                ) : (
                    <div className="text-center py-10 text-slate-400 dark:text-stone-600 text-sm italic">
                        All goals prioritized!
                    </div>
                )}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-stone-800 text-center">
                <p className="text-[10px] text-slate-400 dark:text-stone-500">Drag goals to the matrix to prioritize</p>
            </div>
        </div>

        {/* Matrix Grid */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 h-full overflow-y-auto md:overflow-visible pb-20 md:pb-0">
            {/* Q1: Urgent & Important */}
            <Quadrant 
                id="q1"
                number="1"
                title="Do First"
                subtitle="Urgent & Important"
                icon={<AlertCircle className="text-rose-600 dark:text-rose-400" />}
                colorClass="bg-rose-50/80 dark:bg-rose-900/20 border-rose-100 dark:border-rose-900/30 text-rose-900 dark:text-rose-100"
                goals={goals.filter(g => g.priorityQuadrant === 'q1')}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onAdd={() => onAddGoal('q1')}
                onGoalClick={onEditGoal}
            />

            {/* Q2: Not Urgent & Important */}
            <Quadrant 
                id="q2"
                number="2"
                title="Schedule"
                subtitle="Important, Not Urgent"
                icon={<Calendar className="text-blue-600 dark:text-blue-400" />}
                colorClass="bg-blue-50/80 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900/30 text-blue-900 dark:text-blue-100"
                goals={goals.filter(g => g.priorityQuadrant === 'q2')}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onAdd={() => onAddGoal('q2')}
                onGoalClick={onEditGoal}
            />

            {/* Q3: Urgent & Not Important */}
            <Quadrant 
                id="q3"
                number="3"
                title="Delegate"
                subtitle="Urgent, Not Important"
                icon={<Users className="text-amber-600 dark:text-amber-400" />}
                colorClass="bg-amber-50/80 dark:bg-amber-900/20 border-amber-100 dark:border-amber-900/30 text-amber-900 dark:text-amber-100"
                goals={goals.filter(g => g.priorityQuadrant === 'q3')}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onAdd={() => onAddGoal('q3')}
                onGoalClick={onEditGoal}
            />

            {/* Q4: Not Urgent & Not Important */}
            <Quadrant 
                id="q4"
                number="4"
                title="Eliminate"
                subtitle="Neither Urgent nor Important"
                icon={<Trash2 className="text-slate-600 dark:text-stone-400" />}
                colorClass="bg-slate-100/80 dark:bg-stone-800/50 border-slate-200 dark:border-stone-700 text-slate-700 dark:text-stone-300"
                goals={goals.filter(g => g.priorityQuadrant === 'q4')}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onAdd={() => onAddGoal('q4')}
                onGoalClick={onEditGoal}
            />
        </div>

      </div>
    </div>
  );
};
