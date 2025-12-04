import React, { useState } from 'react';
import { Sparkles, RefreshCw, Sun, Plus, Clock, ChevronRight, MoreHorizontal, CalendarDays, AlertTriangle, Trash2, X, Save, MapPin } from 'lucide-react';
import { Goal, CalendarEvent, ImportantDate } from '../types';
import { ProgressCard } from './GoalComponents';

export const DailyBriefingWidget: React.FC<{ briefing: string, isGenerating: boolean }> = ({ briefing, isGenerating }) => (
  <div className="col-span-1 lg:col-span-3 bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/60 shadow-xl shadow-indigo-100/40 relative overflow-hidden group">
    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-indigo-100/40 to-purple-100/40 rounded-full blur-3xl opacity-50 -mr-20 -mt-20 group-hover:scale-110 transition-transform duration-1000" />
    <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gradient-to-tr from-blue-100/40 to-emerald-100/40 rounded-full blur-3xl opacity-50 -ml-20 -mb-20" />
    
    <div className="relative z-10 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
          <Sparkles size={20} />
        </div>
        <span className="text-sm font-bold text-indigo-900 tracking-wider uppercase opacity-60">Morning Intelligence</span>
      </div>
      
      {isGenerating ? (
        <div className="flex items-center gap-4 py-8">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-indigo-100 rounded-full" />
            <div className="w-12 h-12 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin absolute top-0 left-0" />
          </div>
          <div>
            <p className="text-slate-900 font-semibold">Generating briefing...</p>
            <p className="text-slate-400 text-sm">Analyzing schedule & priorities</p>
          </div>
        </div>
      ) : (
        <div className="prose prose-lg prose-indigo max-w-none">
          <p className="whitespace-pre-line text-xl md:text-2xl leading-relaxed font-medium text-slate-800 tracking-tight">
            {briefing}
          </p>
        </div>
      )}
    </div>
  </div>
);

const EventRow: React.FC<{ event: CalendarEvent }> = ({ event }) => (
  <div className="flex items-center py-4 px-2 hover:bg-white hover:shadow-lg hover:shadow-slate-100/50 rounded-2xl transition-all duration-300 cursor-pointer group -mx-2">
    <div className="w-20 flex flex-col items-center justify-center shrink-0">
      <span className="text-sm font-bold text-slate-900">{event.time.split(' ')[0]}</span>
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{event.time.split(' ')[1]}</span>
    </div>
    <div className="w-px h-8 bg-slate-100 mx-2" />
    <div className="flex-1 px-4">
      <h4 className="font-bold text-slate-800 text-[15px]">{event.title}</h4>
      <div className="flex items-center gap-3 text-xs font-medium text-slate-400 mt-1">
        <span className="flex items-center gap-1"><Clock size={12} /> {event.duration}</span>
        {event.type === 'work' && <span className="text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">Work</span>}
        {event.type === 'personal' && <span className="text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">Personal</span>}
      </div>
    </div>
    <div className="opacity-0 group-hover:opacity-100 transition-opacity px-2">
      <ChevronRight size={18} className="text-slate-300" />
    </div>
  </div>
);

// --- MODAL FOR ADDING IMPORTANT DATES ---

interface DateFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<ImportantDate, 'id'>) => void;
}

const DateFormModal: React.FC<DateFormModalProps> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    type: 'Personal'
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setFormData({ title: '', date: new Date().toISOString().split('T')[0], type: 'Personal' });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-md transition-all">
      <div className="bg-white rounded-[2rem] p-8 w-full max-w-sm shadow-2xl border border-white/50 animate-in fade-in zoom-in duration-300">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-900">Add Date</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">Event Name</label>
            <input
              required
              type="text"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              className="w-full bg-slate-50 border-0 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500/20"
              placeholder="e.g. Mom's Birthday"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">Date</label>
            <input
              required
              type="date"
              value={formData.date}
              onChange={e => setFormData({...formData, date: e.target.value})}
              className="w-full bg-slate-50 border-0 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">Category</label>
            <select
              value={formData.type}
              onChange={e => setFormData({...formData, type: e.target.value})}
              className="w-full bg-slate-50 border-0 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800"
            >
              <option value="Personal">Personal</option>
              <option value="Work">Work</option>
              <option value="Urgent">Urgent</option>
              <option value="Billing">Billing</option>
              <option value="Holiday">Holiday</option>
            </select>
          </div>
          <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl mt-2 flex items-center justify-center gap-2">
            <Save size={18} /> Save Date
          </button>
        </form>
      </div>
    </div>
  );
};


// --- MAIN DASHBOARD VIEW ---

interface DashboardViewProps {
  goals: Goal[];
  events: CalendarEvent[];
  briefing: string;
  isGeneratingBriefing: boolean;
  onRefreshBriefing: () => void;
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
  onDeleteImportantDate: (id: string) => void;
  weather: { temp: number, condition: string } | null;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ 
  goals, events, briefing, isGeneratingBriefing, onRefreshBriefing, openAddModal, onViewCalendar,
  onGoalIncrement, onGoalDecrement, onDeleteGoal, onEditGoal, displayName, syncError,
  importantDates, onAddImportantDate, onDeleteImportantDate, weather
}) => {
  const date = new Date();
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };
  const dateString = date.toLocaleDateString('en-US', options);
  
  const todaysEvents = events.filter(e => {
    const eDate = new Date(e.startTime);
    const today = new Date();
    return eDate.getDate() === today.getDate() && eDate.getMonth() === today.getMonth();
  }).slice(0, 4); 

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);

  // Sort dates: closest upcoming first
  const sortedDates = [...importantDates].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-2">{dateString}</p>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">Good Morning, {displayName}</h1>
        </div>
        <div className="flex items-center gap-4">
           <button 
            onClick={onRefreshBriefing}
            className="p-3 bg-white hover:bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-2xl transition-all shadow-sm border border-slate-100"
            title="Refresh Intelligence"
           >
             <RefreshCw size={20} className={isGeneratingBriefing ? "animate-spin" : ""} />
           </button>
          
          <div className="bg-white/60 backdrop-blur-md p-3 px-5 rounded-[1.5rem] shadow-sm border border-white/50 flex items-center gap-3 text-slate-700 min-w-[120px]">
            {weather ? (
              <>
                <div className={`p-1.5 rounded-full ${weather.condition === 'Clear' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'}`}>
                   <Sun size={16} fill={weather.condition === 'Clear' ? "currentColor" : "none"} />
                </div>
                <div className="flex flex-col leading-none">
                  <span className="font-bold text-lg">{weather.temp}°F</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{weather.condition}</span>
                </div>
              </>
            ) : (
               <>
                 <MapPin size={16} className="text-slate-400 animate-pulse" />
                 <span className="text-xs font-bold text-slate-400">Locating...</span>
               </>
            )}
          </div>
        </div>
      </div>

      {syncError && (
         <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-r-2xl flex items-start gap-3 shadow-sm animate-in fade-in slide-in-from-top-4">
            <AlertTriangle className="text-rose-500 shrink-0 mt-0.5" size={20} />
            <div>
               <h4 className="font-bold text-rose-800 text-sm">Calendar Sync Issue</h4>
               <p className="text-rose-700 text-sm mt-1">{syncError}</p>
               {syncError.toLowerCase().includes('enabled') && (
                 <p className="text-xs font-bold text-rose-800 mt-2 bg-rose-100/50 p-2 rounded-lg">
                   Action: Enable 'Google Calendar API' in your Google Cloud Console project.
                 </p>
               )}
            </div>
         </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <DailyBriefingWidget briefing={briefing} isGenerating={isGeneratingBriefing} />

        <div className="lg:col-span-2 space-y-8">
          <div className="flex justify-between items-end px-2">
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Core Focus</h3>
            <button onClick={openAddModal} className="text-indigo-600 text-sm font-bold hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">Add New</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {goals.map(goal => (
              <ProgressCard 
                key={goal.id} 
                goal={goal} 
                onIncrement={onGoalIncrement} 
                onDecrement={onGoalDecrement}
                onDelete={onDeleteGoal}
                onEdit={onEditGoal}
              />
            ))}
            <button 
              onClick={openAddModal}
              className="border-2 border-dashed border-slate-200/60 rounded-[2rem] p-6 flex flex-col items-center justify-center text-slate-400 hover:border-indigo-400/50 hover:bg-indigo-50/30 transition-all duration-300 group min-h-[200px]"
            >
              <div className="w-14 h-14 rounded-full bg-slate-50 group-hover:bg-indigo-100 flex items-center justify-center mb-3 transition-colors">
                <Plus size={24} className="group-hover:text-indigo-600" />
              </div>
              <span className="font-bold text-sm">New Goal</span>
            </button>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white/60 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/60 shadow-xl shadow-slate-200/40">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">Today's Schedule</h3>
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                {todaysEvents.length}
              </div>
            </div>
            <div className="space-y-1">
              {todaysEvents.length > 0 ? (
                todaysEvents.map(event => <EventRow key={event.id} event={event} />)
              ) : (
                <div className="text-center py-6 text-slate-400 italic text-sm">No events scheduled today.</div>
              )}
            </div>
            <button 
              onClick={onViewCalendar}
              className="w-full mt-8 py-4 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold text-sm transition-colors flex items-center justify-center gap-2"
            >
              Full Calendar
            </button>
          </div>

          {/* UPCOMING DATES WIDGET */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] p-8 text-white shadow-xl shadow-slate-900/20 relative overflow-hidden flex flex-col min-h-[400px]">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10" />
             <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-500 opacity-20 rounded-full blur-xl -ml-5 -mb-5" />
             
             <div className="relative z-10 flex-1">
               <div className="flex justify-between items-center mb-6 relative">
                 <h3 className="font-bold text-lg">Upcoming</h3>
                 <div className="flex gap-2">
                   <button 
                     onClick={() => setIsDateModalOpen(true)}
                     className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-full hover:bg-white/10"
                     title="Add Date"
                   >
                     <Plus size={18} />
                   </button>
                   <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-full hover:bg-white/10">
                     <MoreHorizontal size={18} />
                   </button>
                 </div>
                 
                 {isMenuOpen && (
                   <div className="absolute right-0 top-10 bg-white text-slate-900 rounded-xl shadow-xl py-1 w-40 z-20 animate-in fade-in zoom-in-95 duration-200">
                     <button 
                       onClick={() => { setIsMenuOpen(false); onViewCalendar(); }}
                       className="w-full text-left px-4 py-2 text-sm font-medium hover:bg-slate-50 flex items-center gap-2"
                     >
                       <CalendarDays size={16} />
                       View Calendar
                     </button>
                   </div>
                 )}
               </div>

               <div className="space-y-4 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                 {sortedDates.length > 0 ? (
                   sortedDates.map((d) => {
                     const dateObj = new Date(d.date);
                     const month = dateObj.toLocaleString('default', { month: 'short' }).toUpperCase();
                     const day = dateObj.getDate();
                     
                     return (
                       <div key={d.id} className="flex items-center gap-4 group cursor-pointer relative">
                         <div className="bg-white/10 w-14 h-14 rounded-2xl flex flex-col items-center justify-center backdrop-blur-md border border-white/5 group-hover:bg-white/20 transition-colors shrink-0">
                           <span className="text-[10px] font-bold text-indigo-300">{month}</span>
                           <span className="text-lg font-bold text-white">{day}</span>
                         </div>
                         <div className="flex-1 min-w-0">
                           <p className="font-bold text-slate-100 truncate">{d.title}</p>
                           <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">{d.type}</p>
                         </div>
                         <button 
                           onClick={() => onDeleteImportantDate(d.id)}
                           className="opacity-0 group-hover:opacity-100 absolute right-0 p-2 text-slate-400 hover:text-rose-400 transition-all bg-slate-800/80 rounded-full"
                         >
                           <Trash2 size={14} />
                         </button>
                       </div>
                     );
                   })
                 ) : (
                   <div className="text-center py-8 text-slate-500 italic text-sm">
                     No important dates added. <br/>Tap + to add one.
                   </div>
                 )}
               </div>
             </div>
          </div>
        </div>
      </div>
      
      <DateFormModal 
        isOpen={isDateModalOpen} 
        onClose={() => setIsDateModalOpen(false)} 
        onSave={onAddImportantDate} 
      />
    </div>
  );
};