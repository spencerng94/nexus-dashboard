import React, { useState, useEffect } from 'react';
import { CalendarEvent } from '../types';
import { Plus, X, Clock, Save, Calendar as CalendarIcon, Briefcase, User, ChevronLeft, ChevronRight, AlignJustify, Grid } from 'lucide-react';

interface CalendarViewProps {
  events: CalendarEvent[];
  onAddEvent: (event: Omit<CalendarEvent, 'id'>) => void;
}

interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Omit<CalendarEvent, 'id'>) => void;
}

const EventFormModal: React.FC<EventFormModalProps> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    type: 'work',
    duration: '1h'
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Construct Date object for startTime
    const [year, month, day] = formData.date.split('-').map(Number);
    const [hours, minutes] = formData.time.split(':').map(Number);
    const startDate = new Date(year, month - 1, day, hours, minutes);

    // Format display time
    const displayTime = startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    onSave({
      title: formData.title,
      startTime: startDate.getTime(),
      time: displayTime,
      type: formData.type,
      duration: formData.duration
    });
    
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-md transition-all">
      <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl border border-white/50 animate-in fade-in zoom-in duration-300">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-2xl font-bold text-slate-900">New Event</h3>
            <p className="text-slate-500 text-sm">Add to your schedule</p>
          </div>
          <button onClick={onClose} className="p-2 lg:hover:bg-slate-100 rounded-full transition-colors text-slate-400 lg:hover:text-slate-600">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Event Title</label>
            <input
              required
              type="text"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              className="w-full bg-slate-50 border-0 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800 font-semibold placeholder:text-slate-300"
              placeholder="e.g. Project Meeting"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Date</label>
                <div className="relative">
                  <input
                    required
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                    className="w-full bg-slate-50 border-0 rounded-2xl px-5 py-4 font-medium text-slate-700"
                  />
                </div>
             </div>
             <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Time</label>
                <div className="relative">
                   <input
                    required
                    type="time"
                    value={formData.time}
                    onChange={e => setFormData({...formData, time: e.target.value})}
                    className="w-full bg-slate-50 border-0 rounded-2xl px-5 py-4 font-medium text-slate-700"
                  />
                </div>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Type</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, type: 'work'})}
                  className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${
                    formData.type === 'work' ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-500/20' : 'bg-slate-50 text-slate-400 lg:hover:bg-slate-100'
                  }`}
                >
                  <Briefcase size={16} /> Work
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, type: 'personal'})}
                  className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${
                    formData.type === 'personal' ? 'bg-rose-100 text-rose-700 ring-2 ring-rose-500/20' : 'bg-slate-50 text-slate-400 lg:hover:bg-slate-100'
                  }`}
                >
                  <User size={16} /> Personal
                </button>
              </div>
            </div>
            
            <div>
               <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Duration</label>
               <select 
                 value={formData.duration}
                 onChange={e => setFormData({...formData, duration: e.target.value})}
                 className="w-full bg-slate-50 border-0 rounded-2xl px-5 py-4 font-medium text-slate-700 appearance-none"
               >
                 <option value="15m">15m</option>
                 <option value="30m">30m</option>
                 <option value="45m">45m</option>
                 <option value="1h">1h</option>
                 <option value="1.5h">1.5h</option>
                 <option value="2h">2h</option>
                 <option value="All Day">All Day</option>
               </select>
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-lg py-4 rounded-2xl mt-4 lg:hover:shadow-lg lg:hover:shadow-emerald-500/20 lg:hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
          >
            <Save size={20} />
            Save Event
          </button>
        </form>
      </div>
    </div>
  );
};

const CurrentTimeLine: React.FC<{ startHour: number, rowHeight: number }> = ({ startHour, rowHeight }) => {
  const [offset, setOffset] = useState(-1);

  useEffect(() => {
    const updatePosition = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMin = now.getMinutes();
      
      const totalMinutes = (currentHour - startHour) * 60 + currentMin;
      const pxOffset = totalMinutes * (rowHeight / 60);
      setOffset(pxOffset);
    };

    updatePosition();
    const interval = setInterval(updatePosition, 60000); 
    return () => clearInterval(interval);
  }, [startHour, rowHeight]);

  if (offset < 0) return null;

  return (
    <div 
      className="absolute left-0 right-0 z-20 pointer-events-none flex items-center"
      style={{ top: `${offset}px` }}
    >
      <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-rose-500 -ml-1 md:-ml-1.5 shadow-md border-2 border-white" />
      <div className="h-0.5 bg-rose-500 w-full opacity-60 shadow-sm" />
    </div>
  );
};

const CalendarView: React.FC<CalendarViewProps> = ({ events, onAddEvent }) => {
  const [view, setView] = useState<'month'|'week'|'day'>('month'); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  const navigateDate = (direction: number) => {
    const newDate = new Date(currentDate);
    if (view === 'month') newDate.setMonth(newDate.getMonth() + direction);
    if (view === 'week') newDate.setDate(newDate.getDate() + (direction * 7));
    if (view === 'day') newDate.setDate(newDate.getDate() + direction);
    setCurrentDate(newDate);
  };

  const getWeekRangeString = (date: Date) => {
    const start = new Date(date);
    start.setDate(date.getDate() - date.getDay()); 
    const end = new Date(start);
    end.setDate(start.getDate() + 6); 

    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
  };
  
  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay(); 
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const emptyDays = Array.from({ length: firstDay });
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return (
      <div className="grid grid-cols-7 auto-rows-fr gap-1 md:gap-2 h-[500px] md:h-[600px] w-full">
         {/* Headers */}
         {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
           <div key={d} className="text-center font-bold text-slate-400 text-[10px] md:text-sm py-2 uppercase tracking-wide">{d}</div>
         ))}
         
         {/* Empty Cells */}
         {emptyDays.map((_, i) => <div key={`empty-${i}`} className="bg-transparent" />)}

         {/* Days */}
         {days.map((day) => {
           const dateToCheck = new Date(year, month, day);
           const isToday = dateToCheck.toDateString() === new Date().toDateString();
           
           const dayEvents = events.filter(e => {
             const eDate = new Date(e.startTime);
             return eDate.getDate() === day && eDate.getMonth() === month && eDate.getFullYear() === year;
           });

           return (
             <div key={day} className={`rounded-xl md:rounded-2xl p-1 md:p-2 relative group transition-all duration-300 border overflow-hidden ${isToday ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-100 lg:hover:border-emerald-200 lg:hover:shadow-lg'}`}>
               <span className={`text-[10px] md:text-sm font-bold ${isToday ? 'text-emerald-600' : 'text-slate-600'}`}>{day}</span>
               
               <div className="mt-1 space-y-0.5 md:space-y-1 overflow-hidden">
                 {dayEvents.slice(0, 3).map(e => (
                   <div key={e.id} className={`h-1.5 md:h-auto w-full md:w-auto rounded-full md:rounded-md ${
                     e.type === 'work' ? 'bg-blue-400 md:bg-blue-50 md:text-blue-600' : 'bg-rose-400 md:bg-rose-50 md:text-rose-600'
                   }`}>
                     <div className="hidden md:block text-[10px] px-1 truncate font-medium">
                       {e.time} {e.title}
                     </div>
                   </div>
                 ))}
                 {dayEvents.length > 3 && (
                   <div className="hidden md:block text-[9px] text-slate-400 font-bold px-1">+{dayEvents.length - 3} more</div>
                 )}
               </div>
             </div>
           );
         })}
      </div>
    );
  };

  const renderWeekView = () => {
    // Determine start of week (Sunday)
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    // Grid Setup: 6 AM to 10 PM
    const startHour = 6;
    const endHour = 22;
    const hours = Array.from({ length: endHour - startHour }, (_, i) => i + startHour);
    const rowHeight = 60; // px

    return (
      <div className="flex flex-col h-[600px] overflow-hidden bg-white rounded-[2rem] border border-slate-100 shadow-sm w-full">
        {/* Grid Wrapper */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative w-full">
           <div className="min-w-[800px] w-full"> 
              {/* Header Row */}
              <div className="grid grid-cols-8 border-b border-slate-100 bg-slate-50/50 sticky top-0 z-30">
                <div className="p-1 md:p-4 text-[10px] md:text-xs font-bold text-slate-400 uppercase bg-slate-50 flex items-center justify-center">Time</div>
                {Array.from({length: 7}).map((_, i) => {
                  const d = new Date(startOfWeek);
                  d.setDate(startOfWeek.getDate() + i);
                  const isToday = d.toDateString() === new Date().toDateString();
                  return (
                    <div key={i} className={`p-1 md:p-4 text-center border-l border-slate-100 overflow-hidden ${isToday ? 'bg-emerald-50/50' : ''}`}>
                      <div className={`text-[8px] md:text-xs font-bold uppercase truncate ${isToday ? 'text-emerald-500' : 'text-slate-400'}`}>
                        {d.toLocaleDateString('en-US', { weekday: 'short' })}
                      </div>
                      <div className={`text-xs md:text-lg font-bold ${isToday ? 'text-emerald-600' : 'text-slate-700'}`}>
                        {d.getDate()}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Grid Body */}
              <div className="grid grid-cols-8 relative w-full">
                 {/* Time Column */}
                 <div className="flex flex-col border-r border-slate-100 bg-white z-20 sticky left-0 shadow-sm">
                   {hours.map(h => (
                     <div key={h} className="h-[60px] border-b border-slate-50 text-[9px] md:text-xs text-slate-400 font-medium p-1 md:p-2 text-center md:text-right flex items-center justify-center md:justify-end">
                       {h > 12 ? `${h - 12}` : h}
                       <span className="hidden md:inline ml-0.5">{h >= 12 ? 'PM' : 'AM'}</span>
                     </div>
                   ))}
                 </div>

                 {/* Days Columns */}
                 {Array.from({length: 7}).map((_, dayIdx) => {
                    const currentDayDate = new Date(startOfWeek);
                    currentDayDate.setDate(startOfWeek.getDate() + dayIdx);
                    const isToday = currentDayDate.toDateString() === new Date().toDateString();

                    const dayEvents = events.filter(e => {
                      const eDate = new Date(e.startTime);
                      return eDate.toDateString() === currentDayDate.toDateString();
                    });

                    return (
                      <div key={dayIdx} className={`relative border-r border-slate-100 h-[${hours.length * rowHeight}px] ${isToday ? 'bg-emerald-50/10' : ''}`}>
                        {/* Hour Lines */}
                        {hours.map(h => (
                          <div key={h} className="h-[60px] border-b border-slate-50" />
                        ))}

                        {/* Red Current Time Line (Only for Today) */}
                        {isToday && <CurrentTimeLine startHour={startHour} rowHeight={rowHeight} />}

                        {/* Events */}
                        {dayEvents.map(e => {
                          const eDate = new Date(e.startTime);
                          const hour = eDate.getHours();
                          const min = eDate.getMinutes();
                          if (hour < startHour || hour >= endHour) return null;

                          const top = ((hour - startHour) * 60 + min) * (rowHeight / 60);
                          let height = 50; 
                          if (e.duration.includes('h')) height = parseInt(e.duration) * 60;
                          if (e.duration.includes('30m')) height = 30;
                          const heightPx = height * (rowHeight / 60);

                          return (
                            <div 
                              key={e.id}
                              className={`absolute left-0.5 right-0.5 md:left-1 md:right-1 p-0.5 md:p-1.5 rounded-sm md:rounded-lg border-l-2 md:border-l-4 text-[8px] md:text-[10px] leading-tight shadow-sm cursor-pointer lg:hover:scale-105 transition-transform z-10 overflow-hidden ${
                                 e.type === 'work' 
                                   ? 'bg-blue-50 border-blue-400 text-blue-700' 
                                   : 'bg-rose-50 border-rose-400 text-rose-700'
                              }`}
                              style={{ top: `${top}px`, height: `${Math.max(heightPx, 20)}px` }}
                              title={`${e.time} - ${e.title}`}
                            >
                              <div className="font-bold hidden md:block">{e.time}</div>
                              <div className="truncate font-semibold md:font-normal">{e.title}</div>
                            </div>
                          );
                        })}
                      </div>
                    );
                 })}
              </div>
           </div>
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const startHour = 6;
    const endHour = 22;
    const hours = Array.from({ length: endHour - startHour }, (_, i) => i + startHour);
    const rowHeight = 80;

    const dayEvents = events.filter(e => {
       const eDate = new Date(e.startTime);
       return eDate.toDateString() === currentDate.toDateString();
    });

    const isToday = currentDate.toDateString() === new Date().toDateString();

    return (
      <div className="flex flex-col h-[600px] overflow-hidden bg-white rounded-[2rem] border border-slate-100 shadow-sm relative">
        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
          <div className="relative min-h-full">
            {isToday && <CurrentTimeLine startHour={startHour} rowHeight={rowHeight} />}

            {hours.map(h => (
              <div key={h} className="group flex border-b border-slate-100 min-h-[80px]">
                <div className="w-14 md:w-20 p-2 md:p-4 border-r border-slate-100 text-right text-xs md:text-sm font-bold text-slate-400 bg-slate-50/30 flex items-center justify-end">
                  {h > 12 ? `${h - 12} PM` : h === 12 ? '12 PM' : `${h} AM`}
                </div>
                <div className="flex-1 relative p-1 md:p-2">
                   {dayEvents.filter(e => new Date(e.startTime).getHours() === h).map(e => (
                     <div key={e.id} className={`mb-2 p-2 md:p-3 rounded-xl border-l-4 flex justify-between items-center shadow-sm ${
                        e.type === 'work' 
                          ? 'bg-blue-50 border-blue-500 text-blue-800' 
                          : 'bg-rose-50 border-rose-500 text-rose-800'
                     }`}>
                       <div className="min-w-0 flex-1">
                         <span className="font-bold mr-2 text-xs md:text-base">{e.time}</span>
                         <span className="font-medium text-xs md:text-base truncate">{e.title}</span>
                       </div>
                       <span className={`text-[10px] md:text-xs font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wide shrink-0 ml-2 ${
                          e.type === 'work' ? 'bg-blue-200/50' : 'bg-rose-200/50'
                       }`}>{e.type}</span>
                     </div>
                   ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-[1600px] mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col items-start mb-6 md:mb-8 gap-4">
        <div className="flex items-center gap-4 w-full">
          <div className="w-10 h-10 md:w-14 md:h-14 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
             <CalendarIcon className="text-white w-5 h-5 md:w-8 md:h-8" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Calendar</h1>
            <p className="text-emerald-500 font-bold text-sm mt-1 uppercase tracking-wider">Manage your schedule</p>
          </div>
        </div>
        
        {/* Controls Toolbar */}
        <div className="flex flex-wrap items-center gap-2 md:gap-4 bg-white p-2 rounded-2xl shadow-sm border border-slate-100 w-full">
           <div className="flex items-center gap-1 md:gap-2 px-1 md:px-2 flex-1 justify-between md:justify-start">
             <button onClick={() => navigateDate(-1)} className="p-2 lg:hover:bg-slate-100 rounded-xl transition-colors text-slate-500"><ChevronLeft size={20} /></button>
             <span className="font-bold text-slate-800 text-xs md:text-base text-center select-none truncate">
               {view === 'month' && currentDate.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
               {view === 'day' && currentDate.toLocaleDateString('default', { month: 'long', day: 'numeric' })}
               {view === 'week' && getWeekRangeString(currentDate)}
             </span>
             <button onClick={() => navigateDate(1)} className="p-2 lg:hover:bg-slate-100 rounded-xl transition-colors text-slate-500"><ChevronRight size={20} /></button>
           </div>
           
           <div className="h-8 w-px bg-slate-200 mx-1 hidden md:block" />

           <div className="flex bg-slate-100 rounded-xl p-1 shrink-0 w-full md:w-auto mt-2 md:mt-0">
             <button 
               onClick={() => setView('month')}
               className={`flex-1 md:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${view === 'month' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500 lg:hover:text-slate-900'}`}
             >
               Month
             </button>
             <button 
               onClick={() => setView('week')}
               className={`flex-1 md:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${view === 'week' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500 lg:hover:text-slate-900'}`}
             >
               Week
             </button>
             <button 
               onClick={() => setView('day')}
               className={`flex-1 md:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${view === 'day' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500 lg:hover:text-slate-900'}`}
             >
               Day
             </button>
           </div>
           
           <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full md:w-auto bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2.5 rounded-xl font-bold shadow-lg shadow-emerald-500/20 lg:hover:scale-105 transition-all flex items-center justify-center gap-2 text-sm mt-2 md:mt-0"
           >
             <Plus size={18} /> <span className="inline">New Event</span>
           </button>
        </div>
      </div>

      <div className="bg-white/50 backdrop-blur-md rounded-[2rem] md:rounded-[2.5rem] p-2 md:p-8 border border-white/60 shadow-xl shadow-slate-200/40 overflow-hidden">
         <div className="w-full">
           {view === 'month' && renderMonthView()}
         </div>
         {view === 'week' && renderWeekView()}
         {view === 'day' && renderDayView()}
      </div>

      <EventFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={onAddEvent} 
      />
    </div>
  );
};

export default CalendarView;