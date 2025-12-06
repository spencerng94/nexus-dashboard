
import React, { useState, useEffect, useMemo } from 'react';
import { NotebookPen, Sparkles, Clock, Briefcase, User, Trash2, Check, Loader2, Calendar as CalendarIcon, Edit3, Eye, Wand2 } from 'lucide-react';
import { CalendarEvent, ProposedEvent } from '../types';
import { generateSchedulePlan, refineSchedulePlan } from '../services/gemini';

interface PlannerViewProps {
  existingEvents: CalendarEvent[];
  onAddEvents: (events: Omit<CalendarEvent, 'id'>[]) => Promise<void>;
}

interface VisualSchedulePreviewProps {
  targetDate: Date;
  events: any[];
}

const VisualSchedulePreview: React.FC<VisualSchedulePreviewProps> = ({ targetDate, events }) => {
    const startHour = 6;
    const endHour = 23;
    const hours = Array.from({ length: endHour - startHour }, (_, i) => i + startHour);
    const rowHeight = 60; // Compact height

    return (
        <div className="bg-white dark:bg-stone-900 rounded-[2rem] border border-slate-100 dark:border-stone-800 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-4 border-b border-slate-100 dark:border-stone-800 bg-slate-50 dark:bg-stone-800 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 dark:text-stone-100 flex items-center gap-2">
                    <CalendarIcon size={18} className="text-emerald-500" />
                    {targetDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric'})}
                </h3>
                <span className="text-xs font-bold text-slate-400 dark:text-stone-500 uppercase tracking-wider">Preview</span>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-white dark:bg-stone-900">
                <div className="relative" style={{ height: hours.length * rowHeight }}>
                    {hours.map(h => (
                        <div key={h} className="group flex border-b border-slate-50 dark:border-stone-800 h-[60px]">
                            <div className="w-24 border-r border-slate-50 dark:border-stone-800 text-[10px] font-bold text-slate-400 dark:text-stone-500 flex items-center justify-center bg-slate-50/30 dark:bg-stone-800/30">
                                {h > 12 ? `${h-12} PM` : h === 12 ? '12 PM' : `${h} AM`}
                            </div>
                            <div className="flex-1 relative">
                                {/* Hour Lines */}
                            </div>
                        </div>
                    ))}

                    {/* Events Overlay */}
                    {events.map((e: any) => {
                        const eDate = new Date(e.startTime);
                        const hour = eDate.getHours();
                        const min = eDate.getMinutes();
                        
                        if (hour < startHour || hour >= endHour) return null;

                        // Calculate Position
                        const top = ((hour - startHour) * 60 + min) * (rowHeight / 60);
                        
                        // Parse duration for height
                        let durationMins = 60;
                        if (e.duration.includes('h')) durationMins = parseInt(e.duration) * 60;
                        else if (e.duration.includes('m')) durationMins = parseInt(e.duration);
                        else if (e.duration === 'All Day') durationMins = 60; // fallback

                        const height = Math.max(durationMins * (rowHeight / 60), 30); // min 30px height

                        // Style based on type and status (Proposed vs Existing)
                        const isProposed = e.isProposed;
                        const isWork = e.type === 'work';

                        const bgClass = isProposed 
                            ? (isWork ? 'bg-blue-50 dark:bg-blue-900/30' : 'bg-rose-50 dark:bg-rose-900/30') 
                            : (isWork ? 'bg-blue-100 dark:bg-blue-800/60' : 'bg-rose-100 dark:bg-rose-800/60');
                        
                        const borderClass = isProposed
                            ? (isWork ? 'border-blue-400 dark:border-blue-400 border-dashed' : 'border-rose-400 dark:border-rose-400 border-dashed')
                            : (isWork ? 'border-blue-500 dark:border-blue-500' : 'border-rose-500 dark:border-rose-500');

                        const textClass = isWork ? 'text-blue-900 dark:text-blue-100' : 'text-rose-900 dark:text-rose-100';

                        return (
                            <div 
                                key={e.id}
                                className={`absolute left-[6rem] ml-1 right-2 rounded-lg border-l-4 p-2 text-xs leading-tight overflow-hidden transition-all ${bgClass} ${borderClass} ${textClass} ${isProposed ? 'z-20 shadow-lg' : 'z-10 opacity-70 grayscale-[0.3]'}`}
                                style={{ top: `${top}px`, height: `${height}px` }}
                            >
                                <div className="flex justify-between items-start">
                                    <span className="font-bold truncate">{e.time}</span>
                                    {isProposed && <span className="text-[8px] font-black uppercase tracking-wider bg-white/50 dark:bg-black/30 px-1 rounded">New</span>}
                                </div>
                                <div className="font-semibold truncate">{e.title}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

const PlannerView: React.FC<PlannerViewProps> = ({ existingEvents, onAddEvents }) => {
  const [dateContext, setDateContext] = useState<'today' | 'tomorrow'>('today');
  const [prompt, setPrompt] = useState('');
  const [proposedEvents, setProposedEvents] = useState<ProposedEvent[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Refinement State
  const [refinementPrompt, setRefinementPrompt] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  
  // Mobile View State
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');

  // Calculate the actual Date object based on context
  const targetDate = useMemo(() => {
    const d = new Date();
    if (dateContext === 'tomorrow') {
      d.setDate(d.getDate() + 1);
    }
    return d;
  }, [dateContext]);

  // Combine Existing + Proposed events for the Visual Preview
  const previewEvents = useMemo(() => {
    // 1. Get Existing Events for Target Date
    const relevantExisting = existingEvents.filter(e => {
        const eDate = new Date(e.startTime);
        return eDate.toDateString() === targetDate.toDateString();
    }).map(e => ({ ...e, isProposed: false }));

    // 2. Convert Proposed Events to CalendarEvent structure (temporary)
    const convertedProposed = proposedEvents.map(p => {
        const [hours, minutes] = p.startTime.split(':').map(Number);
        const startTime = new Date(targetDate);
        startTime.setHours(hours, minutes, 0, 0);

        // Parse duration
        let durationMins = 60;
        if (p.duration.includes('h')) durationMins = parseInt(p.duration) * 60;
        if (p.duration.includes('m')) durationMins = parseInt(p.duration);

        // Format nice time string
        const timeStr = startTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

        return {
            id: p.id, // Keep proposed ID
            title: p.title,
            startTime: startTime.getTime(),
            time: timeStr,
            type: p.type,
            duration: p.duration,
            isProposed: true // Flag for styling
        };
    });

    return [...relevantExisting, ...convertedProposed];
  }, [existingEvents, proposedEvents, targetDate]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setProposedEvents([]);
    setSuccessMessage(null);
    setMobileTab('editor'); // Stay on editor to see results list first

    // Filter events for the target day so AI has correct context
    const relevantEvents = existingEvents.filter(e => {
        const eDate = new Date(e.startTime);
        return eDate.getDate() === targetDate.getDate() && eDate.getMonth() === targetDate.getMonth();
    });

    const result = await generateSchedulePlan(prompt, dateContext, relevantEvents);
    setProposedEvents(result);
    setIsGenerating(false);
  };

  const handleRefine = async () => {
    if (!refinementPrompt.trim()) return;
    setIsRefining(true);
    
    const updatedPlan = await refineSchedulePlan(proposedEvents, refinementPrompt, dateContext);
    setProposedEvents(updatedPlan);
    setRefinementPrompt('');
    setIsRefining(false);
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    
    // Convert ProposedEvents to CalendarEvents final
    const eventsToSave = proposedEvents.map(p => {
        const [hours, minutes] = p.startTime.split(':').map(Number);
        const startTime = new Date(targetDate);
        startTime.setHours(hours, minutes, 0, 0);
        
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
    setRefinementPrompt('');
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
    <div className="max-w-[1600px] mx-auto pb-12 animate-in fade-in zoom-in-95 duration-500 h-[calc(100vh-100px)] flex flex-col">
      
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-6 shrink-0">
        <div className="w-10 h-10 md:w-14 md:h-14 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
            <NotebookPen className="text-white w-5 h-5 md:w-8 md:h-8" />
        </div>
        <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">AI Planner</h1>
            <p className="text-emerald-500 dark:text-emerald-400 font-bold text-sm mt-1 uppercase tracking-wider">Intelligent scheduling, synced to your calendar</p>
        </div>
      </div>

      {/* MOBILE TABS - Hidden on Tablet (md) and up */}
      <div className="md:hidden flex bg-slate-200/50 dark:bg-stone-800 p-1 rounded-xl mb-4 shrink-0">
          <button 
            onClick={() => setMobileTab('editor')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${mobileTab === 'editor' ? 'bg-white dark:bg-stone-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 dark:text-stone-400'}`}
          >
            <Edit3 size={16} /> Editor
          </button>
          <button 
            onClick={() => setMobileTab('preview')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${mobileTab === 'preview' ? 'bg-white dark:bg-stone-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 dark:text-stone-400'}`}
          >
            <Eye size={16} /> Preview
          </button>
      </div>

      <div className="flex-1 min-h-0 flex flex-col md:flex-row gap-6 lg:gap-8 items-stretch overflow-hidden">
        
        {/* LEFT COLUMN: INPUT & LIST (Visible on Tablet+ OR Mobile Editor Tab) */}
        <div className={`flex flex-col gap-6 flex-1 min-w-0 overflow-y-auto custom-scrollbar pb-20 ${mobileTab === 'preview' ? 'hidden md:flex' : 'flex'}`}>
            
            {/* Input Card */}
            <div className="bg-white dark:bg-stone-900 rounded-[2.5rem] p-6 shadow-xl border border-slate-100 dark:border-stone-800 shrink-0">
                <div className="flex bg-slate-100 dark:bg-stone-800 p-1 rounded-2xl mb-6">
                    <button 
                      onClick={() => setDateContext('today')}
                      className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${dateContext === 'today' ? 'bg-white dark:bg-stone-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 dark:text-stone-400 lg:hover:text-slate-900 dark:lg:hover:text-stone-200'}`}
                    >
                      Today
                    </button>
                    <button 
                      onClick={() => setDateContext('tomorrow')}
                      className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${dateContext === 'tomorrow' ? 'bg-white dark:bg-stone-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 dark:text-stone-400 lg:hover:text-slate-900 dark:lg:hover:text-stone-200'}`}
                    >
                      Tomorrow
                    </button>
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-bold text-slate-700 dark:text-stone-400 mb-2 uppercase tracking-wide">Your Goal</label>
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="e.g. I need to pick up meds at 7:30pm, then gym at 8:30pm, then dinner..."
                      className="w-full h-32 bg-slate-50 dark:bg-stone-800 border-0 rounded-2xl p-4 font-medium text-slate-700 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none placeholder:text-slate-400 dark:placeholder:text-stone-500 text-sm"
                    />
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={!prompt.trim() || isGenerating}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-lg py-3 rounded-2xl lg:hover:shadow-lg lg:hover:shadow-emerald-500/20 lg:hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:scale-100"
                >
                    {isGenerating ? <Loader2 size={24} className="animate-spin" /> : <Sparkles size={24} />}
                    Generate Plan
                </button>
                
                <p className="text-center text-xs text-slate-400 dark:text-stone-500 font-medium mt-4 px-2 leading-relaxed">
                   Describe your plans naturally. Review the generated timeline, make adjustments, and sync directly to your calendar.
                </p>
            </div>

            {/* Results List */}
            {proposedEvents.length > 0 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="font-bold text-slate-800 dark:text-white text-lg">Proposed Events</h3>
                        <span className="text-xs font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full">
                            {proposedEvents.length} New
                        </span>
                    </div>

                    <div className="space-y-3">
                        {proposedEvents.map(event => (
                            <div key={event.id} className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-slate-100 dark:border-stone-800 shadow-sm flex gap-3 lg:hover:border-emerald-200 dark:lg:hover:border-emerald-700 transition-colors group">
                                <div className="flex flex-col gap-2 pt-1 shrink-0">
                                    <input 
                                      type="time" 
                                      value={event.startTime} 
                                      onChange={(e) => handleUpdateProposed(event.id, 'startTime', e.target.value)}
                                      className="bg-slate-50 dark:bg-stone-800 text-xs font-bold text-slate-600 dark:text-stone-300 rounded-lg p-1 w-[70px] text-center border-0 focus:ring-1 focus:ring-emerald-500"
                                    />
                                     <div className="flex gap-1 justify-center">
                                       <button 
                                         onClick={() => handleUpdateProposed(event.id, 'type', 'work')}
                                         className={`p-1 rounded-md ${event.type === 'work' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300' : 'bg-slate-50 dark:bg-stone-800 text-slate-300 dark:text-stone-500'}`}
                                         title="Work"
                                       ><Briefcase size={12} /></button>
                                       <button 
                                         onClick={() => handleUpdateProposed(event.id, 'type', 'personal')}
                                         className={`p-1 rounded-md ${event.type === 'personal' ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-300' : 'bg-slate-50 dark:bg-stone-800 text-slate-300 dark:text-stone-500'}`}
                                         title="Personal"
                                       ><User size={12} /></button>
                                     </div>
                                </div>
                                
                                <div className="flex-1 min-w-0 flex flex-col gap-2">
                                     <input 
                                       type="text" 
                                       value={event.title}
                                       onChange={(e) => handleUpdateProposed(event.id, 'title', e.target.value)}
                                       className="font-bold text-slate-800 dark:text-stone-100 bg-transparent border-0 p-0 focus:ring-0 w-full placeholder:text-slate-300 dark:placeholder:text-stone-600 text-sm"
                                       placeholder="Event Title"
                                     />
                                     <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-stone-500">
                                        <Clock size={12} />
                                        <input 
                                           type="text"
                                           value={event.duration}
                                           onChange={(e) => handleUpdateProposed(event.id, 'duration', e.target.value)}
                                           className="bg-transparent text-slate-600 dark:text-stone-300 w-16 border-b border-slate-200 dark:border-stone-700 focus:border-emerald-500 focus:outline-none"
                                        />
                                     </div>
                                </div>

                                <button 
                                  onClick={() => handleDeleteProposed(event.id)}
                                  className="text-slate-300 dark:text-stone-600 lg:hover:text-rose-500 dark:lg:hover:text-rose-400 self-start p-1"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* REFINEMENT SECTION */}
                    <div className="bg-emerald-50/50 dark:bg-emerald-900/10 rounded-2xl p-4 border border-emerald-100/50 dark:border-emerald-800/30 mt-4">
                       <label className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide mb-2 block">Refine this plan</label>
                       <div className="flex gap-2">
                         <input 
                           type="text"
                           value={refinementPrompt}
                           onChange={(e) => setRefinementPrompt(e.target.value)}
                           onKeyDown={(e) => e.key === 'Enter' && handleRefine()}
                           placeholder="e.g. Move dinner 30 mins later"
                           className="flex-1 bg-white dark:bg-stone-800 border border-emerald-100 dark:border-emerald-900/30 rounded-xl px-4 py-2 text-sm text-slate-700 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                         />
                         <button 
                           onClick={handleRefine}
                           disabled={!refinementPrompt.trim() || isRefining}
                           className="bg-emerald-500 text-white p-2.5 rounded-xl lg:hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                         >
                           {isRefining ? <Loader2 size={18} className="animate-spin" /> : <Wand2 size={18} />}
                         </button>
                       </div>
                    </div>

                    <button
                        onClick={handleSaveAll}
                        disabled={isSaving || isRefining}
                        className="w-full bg-slate-900 dark:bg-stone-800 text-white font-bold text-lg py-4 rounded-2xl lg:hover:bg-black dark:lg:hover:bg-stone-700 transition-all flex items-center justify-center gap-2 mt-2 shadow-lg shadow-slate-900/20 dark:shadow-none"
                    >
                         {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Check size={20} />}
                         Approve & Sync
                    </button>
                </div>
            )}
             
            {successMessage && (
                <div className="bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 p-6 rounded-[2rem] flex items-center gap-4 animate-in fade-in zoom-in">
                    <div className="w-10 h-10 bg-white dark:bg-stone-900 rounded-full flex items-center justify-center text-emerald-500 shrink-0">
                        <Check size={20} strokeWidth={3} />
                    </div>
                    <div>
                        <h4 className="font-bold">Plan Synced!</h4>
                        <p className="text-sm opacity-80">{successMessage}</p>
                    </div>
                </div>
            )}
        </div>

        {/* RIGHT COLUMN: VISUAL PREVIEW (Visible on Tablet+ OR Mobile Preview Tab) */}
        <div className={`flex-1 min-w-0 bg-slate-50/50 dark:bg-stone-950/50 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-stone-800 p-2 md:p-6 overflow-hidden flex-col ${mobileTab === 'editor' ? 'hidden md:flex' : 'flex'}`}>
             <VisualSchedulePreview targetDate={targetDate} events={previewEvents} />
             <p className="text-center text-xs text-slate-400 dark:text-stone-500 font-medium mt-4">
               {proposedEvents.length > 0 
                  ? "Visualizing proposed schedule changes" 
                  : "Current schedule shown above. Generate a plan to see updates."}
             </p>
        </div>

      </div>
    </div>
  );
};

export default PlannerView;
