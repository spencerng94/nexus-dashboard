import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, Sun, Cloud, CloudRain, Snowflake, CloudLightning, Plus, Clock, ChevronRight, MoreHorizontal, CalendarDays, AlertTriangle, Trash2, X, Save, MapPin, LayoutDashboard } from 'lucide-react';
import { Goal, CalendarEvent, ImportantDate } from '../types';
import { ProgressCard } from './GoalComponents';

export const DailyBriefingWidget: React.FC<{ briefing: string, isGenerating: boolean }> = ({ briefing, isGenerating }) => (
  <div className="w-full bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/60 shadow-xl shadow-emerald-100/40 relative overflow-hidden group">
    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-emerald-100/40 to-teal-100/40 rounded-full blur-3xl opacity-50 -mr-20 -mt-20 lg:group-hover:scale-110 transition-transform duration-1000" />
    <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gradient-to-tr from-stone-100/40 to-green-100/40 rounded-full blur-3xl opacity-50 -ml-20 -mb-20" />
    
    <div className="relative z-10 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-emerald-50 rounded-xl text-emerald-500">
          <Sparkles size={20} />
        </div>
        <span className="text-sm font-bold text-emerald-900 tracking-wider uppercase opacity-60">Plan for Today</span>
      </div>
      
      {isGenerating ? (
        <div className="flex items-center gap-4 py-8">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-emerald-100 rounded-full" />
            <div className="w-12 h-12 border-4 border-emerald-400 rounded-full border-t-transparent animate-spin absolute top-0 left-0" />
          </div>
          <div>
            <p className="text-slate-900 font-semibold">Generating plan...</p>
            <p className="text-slate-400 text-sm">Analyzing schedule & priorities</p>
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
          <button onClick={onClose} className="p-2 lg:hover:bg-slate-100 rounded-full transition-colors text-slate-400 lg:hover:text-slate-600">
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
              className="w-full bg-slate-50 border-0 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500/20"
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
      case 'Clear': return 'bg-amber-100 text-amber-600';
      case 'Cloudy': return 'bg-slate-100 text-slate-600';
      case 'Rain': return 'bg-blue-100 text-blue-600';
      case 'Snow': return 'bg-cyan-100 text-cyan-600';
      case 'Storm': return 'bg-purple-100 text-purple-600';
      default: return 'bg-slate-100 text-slate-600';
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

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-12">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-start gap-6 px-2">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
             <LayoutDashboard className="text-white w-6 h-6 md:w-8 md:h-8" />
          </div>
          <div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-2">{dateString}</p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight">{greeting}, {displayName}</h1>
            <p className="text-emerald-500 font-bold text-sm mt-2 uppercase tracking-wider">Focus on what matters most</p>
          </div>
        </div>
        
        {/* Right Header Controls: Refresh, Clock, Weather */}
        <div className="flex items-start gap-4 self-end md:self-auto">
           {/* Refresh Button */}
           <button 
            onClick={onRefreshBriefing}
            className="mt-1.5 p-3 bg-white lg:hover:bg-slate-50 text-slate-400 lg:hover:text-emerald-500 rounded-2xl transition-all shadow-sm border border-slate-100"
            title="Refresh Plan"
           >
             <RefreshCw size={20} className={isGeneratingBriefing ? "animate-spin" : ""} />
           </button>

           <div className="flex flex-col items-end">
              {/* Clock Widget */}
              <div className="flex flex-col items-end select-none cursor-pointer group mb-1" onClick={() => setIs24Hour(!is24Hour)} title="Toggle 12h/24h">
                  <div className="text-4xl md:text-5xl font-bold text-slate-800 tracking-tight leading-none lg:group-hover:text-emerald-500 transition-colors">
                     {currentTime.toLocaleTimeString([], { hour12: !is24Hour, hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                     {is24Hour ? '24-Hour' : '12-Hour'}
                  </div>
              </div>
              
              {/* Weather Below Time */}
              <div className="flex items-center gap-2 text-slate-600 bg-white/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/50 shadow-sm">
                {weather ? (
                  <>
                    <div className={`p-1 rounded-full ${getWeatherColor(weather.condition)}`}>
                      {getWeatherIcon(weather.condition)}
                    </div>
                    <span className="font-bold text-lg leading-none">{weather.temp}°F</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide leading-none">{weather.condition}</span>
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

      {/* MAIN GRID LAYOUT */}
      <div className="flex flex-col gap-8">
        
        {/* ROW 1: AI BRIEFING (Full Width) */}
        <DailyBriefingWidget briefing={briefing} isGenerating={isGeneratingBriefing} />

        {/* ROW 2: GOALS (Full Width) */}
        <div className="space-y-6">
          <div className="flex justify-between items-end px-2">
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Goals</h3>
            <button onClick={openAddModal} className="text-emerald-500 text-sm font-bold lg:hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors">Add New</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
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
              className="border-2 border-dashed border-slate-200/60 rounded-[2rem] p-6 flex flex-col items-center justify-center text-slate-400 lg:hover:border-emerald-400/50 lg:hover:bg-emerald-50/30 transition-all duration-300 group min-h-[140px] md:min-h-[200px]"
            >
              <div className="w-14 h-14 rounded-full bg-slate-50 lg:group-hover:bg-emerald-100 flex items-center justify-center mb-3 transition-colors">
                <Plus size={24} className="lg:group-hover:text-emerald-500" />
              </div>
              <span className="font-bold text-sm">New Goal</span>
            </button>
          </div>
        </div>

        {/* ROW 3: SCHEDULE & UPCOMING DATES (Side by Side on Large Screens) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Today's Schedule */}
          <div className="bg-gradient-to-br from-stone-900 to-stone-800 rounded-[2.5rem] p-8 text-white shadow-xl shadow-stone-900/20 relative overflow-hidden flex flex-col h-full min-h-[400px]">
            {/* Decorative background elements to match Upcoming Dates */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-400 opacity-20 rounded-full blur-xl -ml-5 -mb-5" />

            <div className="relative z-10 flex flex-col h-full">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold text-white tracking-tight">Today's Schedule</h3>
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

          {/* Upcoming Important Dates */}
          <div className="bg-gradient-to-br from-stone-900 to-stone-800 rounded-[2.5rem] p-8 text-white shadow-xl shadow-stone-900/20 relative overflow-hidden flex flex-col min-h-[400px]">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10" />
             <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-400 opacity-20 rounded-full blur-xl -ml-5 -mb-5" />
             
             <div className="relative z-10 flex-1 flex flex-col">
               <div className="flex justify-between items-start mb-6 relative">
                 <h3 className="font-bold text-lg leading-tight max-w-[70%]">Upcoming Important Dates</h3>
                 <div className="flex gap-2 items-center">
                   <button 
                     onClick={() => setIsDateModalOpen(true)}
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
                   <div className="absolute right-0 top-10 bg-white text-slate-900 rounded-xl shadow-xl py-1 w-40 z-20 animate-in fade-in zoom-in-95 duration-200">
                     <button 
                       onClick={() => { setIsMenuOpen(false); onViewCalendar(); }}
                       className="w-full text-left px-4 py-2 text-sm font-medium lg:hover:bg-slate-50 flex items-center gap-2"
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
                                      {/* Opacity toggles on hover only for desktop, visible on mobile due to earlier global changes */}
                                      <button 
                                          onClick={(e) => { e.stopPropagation(); onDeleteImportantDate(d.id); }}
                                          className="p-1.5 text-stone-400 lg:hover:text-rose-400 transition-all bg-stone-800/80 rounded-full opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                                      >
                                          <Trash2 size={12} />
                                      </button>
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