
import React, { useState } from 'react';
import { NotebookPen, Sparkles, Send, Calendar, Clock, Briefcase, User, Trash2, Check, Loader2, ArrowRight } from 'lucide-react';
import { CalendarEvent, ProposedEvent } from '../types';
import { generateSchedulePlan } from '../services/gemini';

interface PlannerViewProps {
  existingEvents: CalendarEvent[];
  onAddEvents: (events: Omit<CalendarEvent, 'id'>[]) => Promise<void>;
}

const PlannerView: React.FC<PlannerViewProps> = ({ existingEvents, onAddEvents }) => {
  const [dateContext, setDateContext] = useState<'today' | 'tomorrow'>('today');
  const [prompt, setPrompt] = useState('');
  const [proposedEvents, setProposedEvents] = useState<ProposedEvent[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setProposedEvents([]);
    setSuccessMessage(null);

    // Filter events for the target day so AI has correct context
    const targetDate = new Date();
    if (dateContext === 'tomorrow') targetDate.setDate(targetDate.getDate() + 1);
    
    const relevantEvents = existingEvents.filter(e => {
        const eDate = new Date(e.startTime);
        return eDate.getDate() === targetDate.getDate() && eDate.getMonth() === targetDate.getMonth();
    });

    const result = await generateSchedulePlan(prompt, dateContext, relevantEvents);
    setProposedEvents(result);
    setIsGenerating(false);
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    
    // Convert ProposedEvents to CalendarEvents
    const targetDate = new Date();
    if (dateContext === 'tomorrow') targetDate.setDate(targetDate.getDate() + 1);
    
    const eventsToSave = proposedEvents.map(p => {
        const [hours, minutes] = p.startTime.split(':').map(Number);
        const startTime = new Date(targetDate);
        startTime.setHours(hours, minutes, 0, 0);
        
        // Format display time "9:00 AM"
        const displayTime = startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        return {
            title: p.title,
            startTime: startTime.getTime(),
            time: displayTime,
            type: p.type,
            duration: p.duration
        };
    });

    await onAddEvents(eventsToSave);
    
    setIsSaving(false);
    setProposedEvents([]);
    setPrompt('');
    setSuccessMessage(`Successfully added ${eventsToSave.length} events to your calendar.`);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleDeleteProposed = (id: string) => {
    setProposedEvents(prev => prev.filter(e => e.id !== id));
  };

  const handleUpdateProposed = (id: string, field: keyof ProposedEvent, value: string) => {
    setProposedEvents(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  return (
    <div className="max-w-[1200px] mx-auto pb-12 animate-in fade-in zoom-in-95 duration-500">
      
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-10 h-10 md:w-14 md:h-14 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
            <NotebookPen className="text-white w-5 h-5 md:w-8 md:h-8" />
        </div>
        <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">AI Planner</h1>
            <p className="text-emerald-500 font-bold text-sm mt-1 uppercase tracking-wider">Design your ideal schedule</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* LEFT: INPUT */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100">
            <div className="flex bg-slate-100 p-1 rounded-2xl mb-6">
                <button 
                  onClick={() => setDateContext('today')}
                  className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${dateContext === 'today' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 lg:hover:text-slate-900'}`}
                >
                  Plan Today
                </button>
                <button 
                  onClick={() => setDateContext('tomorrow')}
                  className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${dateContext === 'tomorrow' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 lg:hover:text-slate-900'}`}
                >
                  Plan Tomorrow
                </button>
            </div>

            <div className="mb-6">
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">What do you want to achieve?</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. I need to study for 4 hours, go to the gym, and have a team meeting at 2 PM..."
                  className="w-full h-48 bg-slate-50 border-0 rounded-2xl p-5 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none placeholder:text-slate-400"
                />
            </div>

            <button
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-lg py-4 rounded-2xl lg:hover:shadow-lg lg:hover:shadow-emerald-500/20 lg:hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:scale-100"
            >
                {isGenerating ? <Loader2 size={24} className="animate-spin" /> : <Sparkles size={24} />}
                Generate Schedule
            </button>
        </div>

        {/* RIGHT: RESULTS */}
        <div className="space-y-6">
            {isGenerating && (
                <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-[2.5rem] border border-dashed border-slate-200">
                    <Loader2 size={40} className="text-emerald-500 animate-spin mb-4" />
                    <p className="text-slate-500 font-medium">Crafting your plan...</p>
                </div>
            )}

            {!isGenerating && proposedEvents.length > 0 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="font-bold text-slate-800 text-xl">Proposed Schedule</h3>
                        <span className="text-xs font-bold bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full">
                            {proposedEvents.length} Events
                        </span>
                    </div>

                    <div className="space-y-3">
                        {proposedEvents.map(event => (
                            <div key={event.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex gap-4 lg:hover:border-emerald-200 transition-colors group">
                                <div className="flex flex-col gap-2 pt-1">
                                    <input 
                                      type="time" 
                                      value={event.startTime} 
                                      onChange={(e) => handleUpdateProposed(event.id, 'startTime', e.target.value)}
                                      className="bg-slate-50 text-xs font-bold text-slate-600 rounded-lg p-1 w-20 text-center border-0 focus:ring-1 focus:ring-emerald-500"
                                    />
                                     <div className="flex gap-1 justify-center">
                                       <button 
                                         onClick={() => handleUpdateProposed(event.id, 'type', 'work')}
                                         className={`p-1 rounded-md ${event.type === 'work' ? 'bg-blue-100 text-blue-600' : 'bg-slate-50 text-slate-300'}`}
                                         title="Work"
                                       ><Briefcase size={12} /></button>
                                       <button 
                                         onClick={() => handleUpdateProposed(event.id, 'type', 'personal')}
                                         className={`p-1 rounded-md ${event.type === 'personal' ? 'bg-rose-100 text-rose-600' : 'bg-slate-50 text-slate-300'}`}
                                         title="Personal"
                                       ><User size={12} /></button>
                                     </div>
                                </div>
                                
                                <div className="flex-1 min-w-0 flex flex-col gap-2">
                                     <input 
                                       type="text" 
                                       value={event.title}
                                       onChange={(e) => handleUpdateProposed(event.id, 'title', e.target.value)}
                                       className="font-bold text-slate-800 bg-transparent border-0 p-0 focus:ring-0 w-full placeholder:text-slate-300"
                                       placeholder="Event Title"
                                     />
                                     <div className="flex items-center gap-2 text-xs text-slate-400">
                                        <Clock size={12} />
                                        <input 
                                           type="text"
                                           value={event.duration}
                                           onChange={(e) => handleUpdateProposed(event.id, 'duration', e.target.value)}
                                           className="bg-transparent w-16 border-b border-slate-200 focus:border-emerald-500 focus:outline-none"
                                        />
                                     </div>
                                </div>

                                <button 
                                  onClick={() => handleDeleteProposed(event.id)}
                                  className="text-slate-300 lg:hover:text-rose-500 self-start p-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={handleSaveAll}
                        disabled={isSaving}
                        className="w-full bg-slate-900 text-white font-bold text-lg py-4 rounded-2xl lg:hover:bg-black transition-all flex items-center justify-center gap-2 mt-4"
                    >
                         {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Check size={20} />}
                         Approve & Sync to Calendar
                    </button>
                </div>
            )}

            {!isGenerating && proposedEvents.length === 0 && !successMessage && (
                <div className="text-center py-20 px-8 text-slate-400 border-2 border-dashed border-slate-200 rounded-[2.5rem]">
                    <Sparkles size={48} className="mx-auto mb-4 text-slate-200" />
                    <p className="font-medium">Enter your goals for the day and let AI structure your time.</p>
                </div>
            )}

            {successMessage && (
                <div className="bg-emerald-100 border border-emerald-200 text-emerald-800 p-6 rounded-[2rem] flex items-center gap-4 animate-in fade-in zoom-in">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-emerald-500 shrink-0">
                        <Check size={20} strokeWidth={3} />
                    </div>
                    <div>
                        <h4 className="font-bold">Plan Synced!</h4>
                        <p className="text-sm opacity-80">{successMessage}</p>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default PlannerView;
