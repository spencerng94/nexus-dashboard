

import React, { useState, useEffect } from 'react';
import { CalendarEvent, ImportantDate, Habit, HabitLog } from '../types';
import { Plus, X, Clock, Save, Calendar as CalendarIcon, Briefcase, User, ChevronLeft, ChevronRight, AlignJustify, Grid, Star, Dumbbell, Trash2, MapPin } from 'lucide-react';

interface CalendarViewProps {
  events: CalendarEvent[];
  importantDates: ImportantDate[];
  onAddEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  onEditEvent: (event: CalendarEvent) => void;
  onDeleteEvent: (id: string) => void;
  // New props for Habits
  habits?: Habit[];
  habitLogs?: Record<string, HabitLog>;
}

export interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Omit<CalendarEvent, 'id'>) => void;
  onUpdate: (event: CalendarEvent) => void;
  onDelete: (id: string) => void;
  editingEvent?: CalendarEvent | null;
}

export const EventFormModal: React.FC<EventFormModalProps> = ({ isOpen, onClose, onSave, onUpdate, onDelete, editingEvent }) => {
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
    type: 'work',
    location: ''
  });

  useEffect(() => {
    if (editingEvent) {
      const start = new Date(editingEvent.startTime);
      const end = editingEvent.endTime ? new Date(editingEvent.endTime) : new Date(editingEvent.startTime + 3600000); // Default 1h if missing
      
      const year = start.getFullYear();
      const month = String(start.getMonth() + 1).padStart(2, '0');
      const day = String(start.getDate()).padStart(2, '0');
      
      const sHours = String(start.getHours()).padStart(2, '0');
      const sMins = String(start.getMinutes()).padStart(2, '0');

      const eHours = String(end.getHours()).padStart(2, '0');
      const eMins = String(end.getMinutes()).padStart(2, '0');

      setFormData({
        title: editingEvent.title,
        date: `${year}-${month}-${day}`,
        startTime: `${sHours}:${sMins}`,
        endTime: `${eHours}:${eMins}`,
        type: editingEvent.type || 'work',
        location: editingEvent.location || ''
      });
    } else {
      setFormData({
        title: '',
        date: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '10:00',
        type: 'work',
        location: ''
      });
    }
  }, [editingEvent, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Construct Date objects
    const [year, month, day] = formData.date.split('-').map(Number);
    
    const [sHours, sMinutes] = formData.startTime.split(':').map(Number);
    const startDate = new Date(year, month - 1, day, sHours, sMinutes);

    const [eHours, eMinutes] = formData.endTime.split(':').map(Number);
    const endDate = new Date(year, month - 1, day, eHours, eMinutes);

    // Basic Validation: End must be after Start
    if (endDate <= startDate) {
      alert("End time must be after start time");
      return;
    }

    // Format display time (start)
    const displayTime = startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Calculate Duration String
    const diffMs = endDate.getTime() - startDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const h = Math.floor(diffMins / 60);
    const m = diffMins % 60;
    
    let durationStr = "";
    if (h > 0) durationStr += `${h}h`;
    if (m > 0) durationStr += ` ${m}m`;
    if (durationStr === "") durationStr = "0m";

    const eventData = {
      title: formData.title,
      startTime: startDate.getTime(),
      endTime: endDate.getTime(),
      time: displayTime,
      type: formData.type,
      duration: durationStr.trim(),
      location: formData.location
    };

    if (editingEvent) {
      onUpdate({ ...eventData, id: editingEvent.id, color: editingEvent.color });
    } else {
      onSave(eventData);
    }
    
    onClose();
  };

  const handleDelete = () => {
    if (editingEvent) {
      onDelete(editingEvent.id.toString());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-md transition-all">
      <div className="bg-white dark:bg-stone-900 rounded-[2rem] p-8 w-full max-w-md shadow-2xl border border-white/50 dark:border-stone-800 animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{editingEvent ? 'Edit Event' : 'New Event'}</h3>
            <p className="text-slate-500 dark:text-stone-400 text-sm">{editingEvent ? 'Update details' : 'Add to your schedule'}</p>
          </div>
          <button onClick={onClose} className="p-2 lg:hover:bg-slate-100 dark:lg:hover:bg-stone-800 rounded-full transition-colors text-slate-400 dark:text-stone-500 lg:hover:text-slate-600 dark:lg:hover:text-stone-300">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-stone-400 mb-2 uppercase tracking-wide">Event Title</label>
            <input
              required
              type="text"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              className="w-full bg-slate-50 dark:bg-stone-800 border-0 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800 dark:text-stone-100 font-semibold placeholder:text-slate-300 dark:placeholder:text-stone-500"
              placeholder="e.g. Project Meeting"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-stone-400 mb-2 uppercase tracking-wide">Date</label>
            <div className="relative">
              <input
                required
                type="date"
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
                className="w-full bg-slate-50 dark:bg-stone-800 border-0 rounded-2xl px-5 py-4 font-medium text-slate-700 dark:text-stone-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-stone-400 mb-2 uppercase tracking-wide">Start Time</label>
                <div className="relative">
                   <input
                    required
                    type="time"
                    value={formData.startTime}
                    onChange={e => setFormData({...formData, startTime: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-stone-800 border-0 rounded-2xl px-5 py-4 font-medium text-slate-700 dark:text-stone-200"
                  />
                </div>
             </div>
             <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-stone-400 mb-2 uppercase tracking-wide">End Time</label>
                <div className="relative">
                   <input
                    required
                    type="time"
                    value={formData.endTime}
                    onChange={e => setFormData({...formData, endTime: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-stone-800 border-0 rounded-2xl px-5 py-4 font-medium text-slate-700 dark:text-stone-200"
                  />
                </div>
             </div>
          </div>

          <div>
             <label className="block text-sm font-bold text-slate-700 dark:text-stone-400 mb-2 uppercase tracking-wide">Location</label>
             <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  value={formData.location}
                  onChange={e => setFormData({...formData, location: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-stone-800 border-0 rounded-2xl pl-11 pr-5 py-4 font-medium text-slate-700 dark:text-stone-200 placeholder:text-slate-400"
                  placeholder="e.g. Conference Room A or Zoom"
                />
             </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-stone-400 mb-2 uppercase tracking-wide">Type</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFormData({...formData, type: 'work'})}
                className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${
                  formData.type === 'work' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20' : 'bg-slate-50 dark:bg-stone-800 text-slate-400 dark:text-stone-500 lg:hover:bg-slate-100 dark:lg:hover:bg-stone-700'
                }`}
              >
                <Briefcase size={16} /> Work
              </button>
              <button
                type="button"
                onClick={() => setFormData({...formData, type: 'personal'})}
                className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${
                  formData.type === 'personal' ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 ring-2 ring-rose-500/20' : 'bg-slate-50 dark:bg-stone-800 text-slate-400 dark:text-stone-500 lg:hover:bg-slate-100 dark:lg:hover:bg-stone-700'
                }`}
              >
                <User size={16} /> Personal
              </button>
            </div>
          </div>
          
          <div className="flex gap-3 mt-4">
             {editingEvent && (
                 <button
                   type="button"
                   onClick={handleDelete}
                   className="px-5 py-4 bg-rose-50 dark:bg-rose-900/20 text-rose-500 dark:text-rose-400 rounded-2xl font-bold lg:hover:bg-rose-100 dark:lg:hover:bg-rose-900/40 transition-all flex items-center justify-center"
                 >
                   <Trash2 size={20} />
                 </button>
             )}
             <button 
                type="submit" 
                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-lg py-4 rounded-2xl lg:hover:shadow-lg lg:hover:shadow-emerald-500/20 lg:hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
             >
                <Save size={20} />
                {editingEvent ? 'Update Event' : 'Save Event'}
             </button>
          </div>
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
      <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-rose-500 -ml-1 md:-ml-1.5 shadow-md border-2 border-white dark:border-stone-900" />
      <div className="h-0.5 bg-rose-500 w-full opacity-60 shadow-sm" />
    </div>
  );
};

const CalendarView: React.FC<CalendarViewProps> = ({ events, importantDates, onAddEvent, onEditEvent, onDeleteEvent, habits = [], habitLogs = {} }) => {
  const [view, setView] = useState<'month'|'week'|'day'>('month'); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Edit State
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  
  // Toggle for showing habits
  const [showHabits, setShowHabits] = useState(false);

  const navigateDate = (direction: number) => {
    const newDate = new Date(currentDate);
    if (view === 'month') newDate.setMonth(newDate.getMonth() + direction);
    if (view === 'week') newDate.setDate(newDate.getDate() + (direction * 7));
    if (view === 'day') newDate.setDate(newDate.getDate() + direction);
    setCurrentDate(newDate);
  };

  const resetToToday = () => {
    setCurrentDate(new Date());
  };

  const handleEventClick = (e: React.MouseEvent, event: CalendarEvent) => {
      e.stopPropagation();
      setEditingEvent(event);
      setIsModalOpen(true);
  };

  const openNewEventModal = () => {
      setEditingEvent(null);
      setIsModalOpen(true);
  };

  const getWeekRangeString = (date: Date) => {
    const start = new Date(date);
    start.setDate(date.getDate() - date.getDay()); 
    const end = new Date(start);
    end.setDate(start.getDate() + 6); 

    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
  };

  // Helper to generate dynamic styles from Google Calendar color
  const getEventStyle = (event: CalendarEvent, isWeekView = false) => {
      // If no color from google, use default based on type
      if (!event.color) {
          if (event.type === 'work') {
              // Work default (blue-ish)
              return isWeekView ? {
                  backgroundColor: 'rgba(59, 130, 246, 0.1)', // blue-500 10%
                  borderColor: 'rgba(96, 165, 250, 1)', // blue-400
                  color: 'rgba(29, 78, 216, 1)', // blue-700
                  borderLeftWidth: '4px',
                  borderStyle: 'solid'
              } : {
                  backgroundColor: 'rgba(59, 130, 246, 0.15)',
                  color: 'rgba(30, 64, 175, 1)'
              };
          } else {
             // Personal default (rose-ish)
             return isWeekView ? {
                  backgroundColor: 'rgba(244, 63, 94, 0.1)', // rose-500 10%
                  borderColor: 'rgba(251, 113, 133, 1)', // rose-400
                  color: 'rgba(190, 18, 60, 1)', // rose-700
                  borderLeftWidth: '4px',
                  borderStyle: 'solid'
              } : {
                  backgroundColor: 'rgba(244, 63, 94, 0.15)',
                  color: 'rgba(159, 18, 57, 1)'
              };
          }
      }

      // We have a hex color from Google
      // We want to mimic the light background style.
      // background: color with ~15% opacity
      // border/text: solid color
      
      // Since we receive hex, we need to handle opacity manually or use CSS variables if possible.
      // Easiest is to append '26' (approx 15% in hex alpha) or '40' (25%)
      const bg = event.color + '26'; // 15% opacity hex
      
      return {
          backgroundColor: bg,
          borderColor: isWeekView ? event.color : undefined,
          borderLeftColor: event.color,
          color: event.color,
          // Specifics for week view vertical bars
          borderStyle: isWeekView ? 'solid' : undefined,
          borderLeftWidth: isWeekView ? '4px' : undefined
      };
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
           <div key={d} className="text-center font-bold text-slate-400 dark:text-stone-500 text-[10px] md:text-sm py-2 uppercase tracking-wide">{d}</div>
         ))}
         
         {/* Empty Cells */}
         {emptyDays.map((_, i) => <div key={`empty-${i}`} className="bg-transparent" />)}

         {/* Days */}
         {days.map((day) => {
           const dateToCheck = new Date(year, month, day);
           const isToday = dateToCheck.toDateString() === new Date().toDateString();
           const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
           
           const importantDate = importantDates.find(d => d.date === dateString);
           const isImportant = !!importantDate;

           const dayEvents = events.filter(e => {
             const eDate = new Date(e.startTime);
             return eDate.getDate() === day && eDate.getMonth() === month && eDate.getFullYear() === year;
           });

           // Get completed habits for this day
           const completedHabits = showHabits ? habits.filter(h => !!habitLogs[`${h.id}_${dateString}`]) : [];

           // Dynamic Styles for Cell
           let cellClasses = "bg-white dark:bg-stone-900 border-slate-100 dark:border-stone-800 lg:hover:border-emerald-200 lg:dark:hover:border-emerald-800 lg:hover:shadow-lg";
           let textClasses = "text-slate-600 dark:text-stone-300";
           
           if (isImportant) {
             cellClasses = "bg-gradient-to-br from-stone-800 to-stone-700 border-stone-600 shadow-md";
             textClasses = "text-white";
           }
           
           if (isToday) {
             if (isImportant) {
               // Today AND Important: Dark bg + Emerald Border
               cellClasses = "bg-gradient-to-br from-stone-800 to-stone-700 border-emerald-400 ring-1 ring-emerald-400 shadow-lg";
               textClasses = "text-emerald-400";
             } else {
               // Just Today
               cellClasses = "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800";
               textClasses = "text-emerald-600 dark:text-emerald-400";
             }
           }

           return (
             <div 
               key={day} 
               className={`rounded-xl md:rounded-2xl p-1 md:p-2 relative group transition-all duration-300 border flex flex-col ${cellClasses}`}
               title={importantDate?.title}
             >
               <div className="flex justify-between items-start shrink-0">
                  <span className={`text-[10px] md:text-sm font-bold ${textClasses}`}>{day}</span>
                  {isImportant && (
                    <div className="hidden md:block">
                        <Star size={10} className="text-amber-400 fill-amber-400" />
                    </div>
                  )}
               </div>

               {/* Mobile Dot for Important Date */}
               {isImportant && (
                 <div className="md:hidden absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-400"></div>
               )}
               
               {/* Cell Content Area - Set min-height 0 to allow flex item to shrink and scroll */}
               <div className="mt-1 flex-1 min-h-0 relative">
                 {showHabits ? (
                    // --- HABIT VIEW ---
                    <div className="flex flex-wrap content-start gap-0.5 md:gap-1 mt-1 h-full overflow-y-auto custom-scrollbar pb-2">
                       {completedHabits.length > 0 ? completedHabits.map(h => (
                           <span key={h.id} className="text-[10px] md:text-sm leading-none select-none hover:scale-125 transition-transform cursor-help shrink-0" title={h.title}>
                               {h.icon}
                           </span>
                       )) : (
                           <div className="w-full h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                               <span className="text-[10px] text-slate-300 dark:text-stone-600 select-none">-</span>
                           </div>
                       )}
                    </div>
                 ) : (
                    // --- EVENT VIEW ---
                    <div className="flex flex-col h-full space-y-0.5 md:space-y-1 overflow-hidden">
                        {isImportant && (
                            <div className="hidden md:block text-[9px] font-bold text-amber-300 truncate mb-1 shrink-0">
                                {importantDate?.title}
                            </div>
                        )}

                        {dayEvents.slice(0, isImportant ? 2 : 4).map(e => {
                            const dynamicStyle = getEventStyle(e);
                            return (
                                <div 
                                    key={e.id} 
                                    onClick={(ev) => handleEventClick(ev, e)}
                                    style={dynamicStyle}
                                    className="h-1.5 md:h-auto w-full md:w-auto rounded-full md:rounded-md shrink-0 cursor-pointer lg:hover:opacity-80 transition-opacity"
                                >
                                    <div className="hidden md:block text-[10px] px-1 truncate font-medium">
                                    {e.time} {e.title}
                                    </div>
                                </div>
                            );
                        })}
                        {dayEvents.length > (isImportant ? 2 : 4) && (
                        <div className={`hidden md:block text-[9px] font-bold px-1 shrink-0 ${isImportant ? 'text-stone-400' : 'text-slate-400 dark:text-stone-500'}`}>+{dayEvents.length - (isImportant ? 2 : 4)} more</div>
                        )}
                    </div>
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
      <div className="flex flex-col h-[600px] overflow-hidden bg-white dark:bg-stone-900 rounded-[2rem] border border-slate-100 dark:border-stone-800 shadow-sm w-full">
        {/* Grid Wrapper */}
        <div className="flex-1 overflow-y-auto custom-scrollbar overflow-x-hidden relative w-full">
           <div className="w-full min-w-0"> 
              {/* Header Row */}
              <div className="grid grid-cols-8 border-b border-slate-100 dark:border-stone-800 bg-slate-50/50 dark:bg-stone-800 sticky top-0 z-30">
                <div className="p-1 md:p-4 text-[10px] md:text-xs font-bold text-slate-400 dark:text-stone-500 uppercase bg-slate-50 dark:bg-stone-800 flex items-center justify-center">Time</div>
                {Array.from({length: 7}).map((_, i) => {
                  const d = new Date(startOfWeek);
                  d.setDate(startOfWeek.getDate() + i);
                  const isToday = d.toDateString() === new Date().toDateString();
                  return (
                    <div key={i} className={`p-1 md:p-4 text-center border-l border-slate-100 dark:border-stone-800 overflow-hidden ${isToday ? 'bg-emerald-50/50 dark:bg-emerald-900/10' : ''}`}>
                      <div className={`text-[8px] md:text-xs font-bold uppercase truncate ${isToday ? 'text-emerald-500 dark:text-emerald-400' : 'text-slate-400 dark:text-stone-500'}`}>
                        {d.toLocaleDateString('en-US', { weekday: 'short' })}
                      </div>
                      <div className={`text-xs md:text-lg font-bold ${isToday ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-stone-200'}`}>
                        {d.getDate()}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Grid Body */}
              <div className="grid grid-cols-8 relative w-full">
                 {/* Time Column */}
                 <div className="flex flex-col border-r border-slate-100 dark:border-stone-800 bg-white dark:bg-stone-900 z-20 sticky left-0 shadow-sm">
                   {hours.map(h => (
                     <div key={h} className="h-[60px] border-b border-slate-50 dark:border-stone-800 text-[9px] md:text-xs text-slate-400 dark:text-stone-500 font-medium p-1 md:p-2 text-center md:text-right flex items-center justify-center md:justify-end">
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
                      <div key={dayIdx} className={`relative border-r border-slate-100 dark:border-stone-800 h-[${hours.length * rowHeight}px] ${isToday ? 'bg-emerald-50/10 dark:bg-emerald-900/5' : ''}`}>
                        {/* Hour Lines */}
                        {hours.map(h => (
                          <div key={h} className="h-[60px] border-b border-slate-50 dark:border-stone-800" />
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
                          
                          const dynamicStyle = getEventStyle(e, true);

                          return (
                            <div 
                              key={e.id}
                              onClick={(ev) => handleEventClick(ev, e)}
                              className="absolute left-0.5 right-0.5 md:left-1 md:right-1 p-0.5 md:p-1.5 rounded-sm md:rounded-lg text-[8px] md:text-[10px] leading-tight shadow-sm cursor-pointer lg:hover:scale-105 transition-transform z-10 overflow-hidden"
                              style={{ top: `${top}px`, height: `${Math.max(heightPx, 20)}px`, ...dynamicStyle }}
                              title={`${e.time} - ${e.title}`}
                            >
                              <div className="font-bold hidden md:block">{e.time}</div>
                              <div className="truncate font-semibold md:font-normal">{e.title}</div>
                              {e.location && <div className="hidden md:flex items-center gap-0.5 text-[8px] opacity-75 truncate"><MapPin size={8} /> {e.location}</div>}
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
      <div className="flex flex-col h-[600px] overflow-hidden bg-white dark:bg-stone-900 rounded-[2rem] border border-slate-100 dark:border-stone-800 shadow-sm relative">
        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
          <div className="relative min-h-full">
            {isToday && <CurrentTimeLine startHour={startHour} rowHeight={rowHeight} />}

            {hours.map(h => (
              <div key={h} className="group flex border-b border-slate-100 dark:border-stone-800 min-h-[80px]">
                <div className="w-14 md:w-20 p-2 md:p-4 border-r border-slate-100 dark:border-stone-800 text-right text-xs md:text-sm font-bold text-slate-400 dark:text-stone-500 bg-slate-50/30 dark:bg-stone-800/30 flex items-center justify-end">
                  {h > 12 ? `${h - 12} PM` : h === 12 ? '12 PM' : `${h} AM`}
                </div>
                <div className="flex-1 relative p-1 md:p-2">
                   {dayEvents.filter(e => new Date(e.startTime).getHours() === h).map(e => {
                     const dynamicStyle = getEventStyle(e);
                     return (
                        <div 
                            key={e.id} 
                            onClick={(ev) => handleEventClick(ev, e)}
                            style={dynamicStyle}
                            className="mb-2 p-2 md:p-3 rounded-xl border-l-4 flex justify-between items-center shadow-sm cursor-pointer lg:hover:scale-[1.01] transition-transform"
                        >
                        <div className="min-w-0 flex-1">
                            <span className="font-bold mr-2 text-xs md:text-base">{e.time}</span>
                            <span className="font-medium text-xs md:text-base truncate">{e.title}</span>
                            {e.location && <div className="text-xs opacity-75 flex items-center gap-1 mt-0.5"><MapPin size={10} /> {e.location}</div>}
                        </div>
                        <span className="text-[10px] md:text-xs font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wide shrink-0 ml-2 bg-white/30">{e.type}</span>
                        </div>
                    );
                   })}
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
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">Calendar</h1>
            <p className="text-emerald-500 dark:text-emerald-400 font-bold text-sm mt-1 uppercase tracking-wider">Manage your schedule</p>
          </div>
        </div>
        
        {/* Controls Toolbar */}
        <div className="flex flex-wrap items-center gap-2 md:gap-4 bg-white dark:bg-stone-900 p-2 rounded-2xl shadow-sm border border-slate-100 dark:border-stone-800 w-full">
           <div className="flex items-center gap-1 md:gap-2 px-1 md:px-2 flex-1 justify-between md:justify-start">
             <button onClick={resetToToday} className="px-3 py-1.5 bg-slate-100 dark:bg-stone-800 lg:hover:bg-slate-200 dark:lg:hover:bg-stone-700 rounded-xl text-xs font-bold text-slate-600 dark:text-stone-300 transition-colors">Today</button>
             <button onClick={() => navigateDate(-1)} className="p-2 lg:hover:bg-slate-100 dark:lg:hover:bg-stone-800 rounded-xl transition-colors text-slate-500 dark:text-stone-400"><ChevronLeft size={20} /></button>
             <span className="font-bold text-slate-800 dark:text-white text-xs md:text-base text-center select-none truncate">
               {view === 'month' && currentDate.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
               {view === 'day' && currentDate.toLocaleDateString('default', { month: 'long', day: 'numeric' })}
               {view === 'week' && getWeekRangeString(currentDate)}
             </span>
             <button onClick={() => navigateDate(1)} className="p-2 lg:hover:bg-slate-100 dark:lg:hover:bg-stone-800 rounded-xl transition-colors text-slate-500 dark:text-stone-400"><ChevronRight size={20} /></button>
           </div>
           
           <div className="h-8 w-px bg-slate-200 dark:bg-stone-700 mx-1 hidden md:block" />
           
           {/* Habits Toggle */}
           <button
             onClick={() => setShowHabits(!showHabits)}
             className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
               showHabits 
                ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 shadow-sm' 
                : 'bg-white dark:bg-stone-800 text-slate-500 dark:text-stone-400 border-transparent lg:hover:bg-slate-50 dark:lg:hover:bg-stone-700'
             }`}
           >
             <Dumbbell size={14} />
             <span className="hidden md:inline">Habits</span>
           </button>

           <div className="h-8 w-px bg-slate-200 dark:bg-stone-700 mx-1 hidden md:block" />

           <div className="flex bg-slate-100 dark:bg-stone-800 rounded-xl p-1 shrink-0 w-full md:w-auto mt-2 md:mt-0">
             <button 
               onClick={() => setView('month')}
               className={`flex-1 md:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${view === 'month' ? 'bg-white dark:bg-stone-700 shadow-sm text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-stone-400 lg:hover:text-slate-900 dark:lg:hover:text-stone-200'}`}
             >
               Month
             </button>
             <button 
               onClick={() => setView('week')}
               className={`flex-1 md:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${view === 'week' ? 'bg-white dark:bg-stone-700 shadow-sm text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-stone-400 lg:hover:text-slate-900 dark:lg:hover:text-stone-200'}`}
             >
               Week
             </button>
             <button 
               onClick={() => setView('day')}
               className={`flex-1 md:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${view === 'day' ? 'bg-white dark:bg-stone-700 shadow-sm text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-stone-400 lg:hover:text-slate-900 dark:lg:hover:text-stone-200'}`}
             >
               Day
             </button>
           </div>
           
           <button 
            onClick={openNewEventModal}
            className="w-full md:w-auto bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2.5 rounded-xl font-bold shadow-lg shadow-emerald-500/20 lg:hover:scale-105 transition-all flex items-center justify-center gap-2 text-sm mt-2 md:mt-0"
           >
             <Plus size={18} /> <span className="inline">New Event</span>
           </button>
        </div>
      </div>
      
      {/* Habit Legend Key - Only visible when habits are shown */}
      {showHabits && habits.length > 0 && (
         <div className="mb-6 flex gap-3 overflow-x-auto pb-2 custom-scrollbar animate-in fade-in slide-in-from-top-2">
            <div className="bg-slate-100 dark:bg-stone-800 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-500 dark:text-stone-400 uppercase tracking-wide flex items-center shrink-0">
               Habit Key:
            </div>
            {habits.map(h => {
               // Extract color class name like "text-emerald-500" -> "emerald"
               const colorMatch = h.color.match(/text-(\w+)-500/);
               const colorName = colorMatch ? colorMatch[1] : 'slate';
               
               return (
                  <div key={h.id} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border shrink-0 bg-${colorName}-50 dark:bg-${colorName}-900/20 border-${colorName}-100 dark:border-${colorName}-800 text-${colorName}-700 dark:text-${colorName}-300`}>
                     <span className="text-base leading-none">{h.icon}</span>
                     <span className="text-xs font-bold">{h.title}</span>
                  </div>
               );
            })}
         </div>
      )}

      <div className="bg-white/50 dark:bg-stone-900/50 backdrop-blur-md rounded-[2rem] md:rounded-[2.5rem] p-2 md:p-8 border border-white/60 dark:border-stone-800 shadow-xl shadow-slate-200/40 dark:shadow-none overflow-hidden">
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
        onUpdate={onEditEvent}
        onDelete={onDeleteEvent}
        editingEvent={editingEvent}
      />
    </div>
  );
};

export default CalendarView;