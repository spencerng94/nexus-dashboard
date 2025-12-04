import React, { useState } from 'react';
import { CalendarEvent } from '../types';
import { Plus, X, Clock, Save, Calendar as CalendarIcon, Briefcase, User } from 'lucide-react';

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
    
    // Reset form defaults for next time (optional)
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
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600">
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
                    formData.type === 'work' ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-500/20' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                  }`}
                >
                  <Briefcase size={16} /> Work
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, type: 'personal'})}
                  className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${
                    formData.type === 'personal' ? 'bg-rose-100 text-rose-700 ring-2 ring-rose-500/20' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
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
            className="w-full bg-slate-900 text-white font-bold text-lg py-4 rounded-2xl mt-4 hover:bg-black hover:scale-[1.02] transition-all shadow-xl shadow-slate-900/20 flex items-center justify-center gap-2"
          >
            <Save size={20} />
            Save Event
          </button>
        </form>
      </div>
    </div>
  );
};

const CalendarView: React.FC<CalendarViewProps> = ({ events, onAddEvent }) => {
  const [view, setView] = useState<'month'|'week'|'day'>('month'); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const today = new Date();
  
  const renderMonthView = () => {
    return (
      <div className="grid grid-cols-7 auto-rows-fr gap-4 h-[650px]">
         {Array.from({ length: 35 }).map((_, i) => {
           const date = new Date();
           date.setDate(date.getDate() - date.getDay() + i); 
           const isToday = date.getDate() === new Date().getDate() && date.getMonth() === new Date().getMonth();
           
           const dayEvents = events.filter(e => {
             const eDate = new Date(e.startTime);
             return eDate.getDate() === date.getDate() && eDate.getMonth() === date.getMonth();
           });

           return (
             <div key={i} className={`rounded-[1.5rem] p-3 relative group transition-all duration-300 hover:bg-white hover:shadow-lg hover:shadow-emerald-100/50 hover:scale-[1.02] border border-transparent hover:border-emerald-50 ${isToday ? 'bg-white shadow-md border-emerald-100' : ''}`}>
               <span className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold ${isToday ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/30' : 'text-slate-600'}`}>
                 {date.getDate()}
               </span>
               <div className="mt-2 space-y-1">
                  {dayEvents.map((ev, idx) => (
                    <div key={idx} className="text-[10px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded truncate">
                      {ev.title}
                    </div>
                  ))}
               </div>
             </div>
           )
         })}
      </div>
    );
  };

  const renderWeekView = () => {
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    return (
      <div className="h-[650px] overflow-y-auto">
        <div className="grid grid-cols-7 gap-2 min-h-full">
          {Array.from({ length: 7 }).map((_, i) => {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            const isToday = date.getDate() === new Date().getDate();
            
            const dayEvents = events.filter(e => {
              const eDate = new Date(e.startTime);
              return eDate.getDate() === date.getDate() && eDate.getMonth() === date.getMonth();
            });

            return (
              <div key={i} className={`flex flex-col border-r border-slate-100 last:border-0 ${isToday ? 'bg-emerald-50/30' : ''} pt-2`}>
                 <div className="text-center mb-4 sticky top-0 bg-white/50 backdrop-blur-sm py-2 border-b border-slate-100">
                   <span className="block text-xs font-bold text-slate-400 uppercase">{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                   <span className={`block text-lg font-bold ${isToday ? 'text-emerald-500' : 'text-slate-800'}`}>{date.getDate()}</span>
                 </div>
                 <div className="flex-1 space-y-2 px-1">
                   {dayEvents.map((ev, idx) => (
                     <div key={idx} className="bg-white p-2 rounded-lg border border-slate-100 shadow-sm text-xs">
                       <div className="font-bold text-slate-700">{ev.time}</div>
                       <div className="truncate text-slate-500">{ev.title}</div>
                     </div>
                   ))}
                 </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
     const dayEvents = events.filter(e => {
        const eDate = new Date(e.startTime);
        return eDate.getDate() === today.getDate() && eDate.getMonth() === today.getMonth();
     });

     return (
       <div className="h-[650px] overflow-y-auto pr-2">
         {Array.from({ length: 14 }).map((_, i) => {
            const hour = i + 6; // Start at 6 AM
            const hourEvents = dayEvents.filter(e => new Date(e.startTime).getHours() === hour);
            
            return (
              <div key={i} className="flex border-b border-slate-100 min-h-[60px] group">
                <div className="w-20 text-xs font-bold text-slate-400 py-2 border-r border-slate-100 text-center">
                  {hour > 12 ? hour - 12 : hour} {hour >= 12 ? 'PM' : 'AM'}
                </div>
                <div className="flex-1 p-1">
                   {hourEvents.map((ev, idx) => (
                      <div key={idx} className="bg-emerald-50 border-l-4 border-emerald-400 p-2 rounded mb-1">
                         <span className="font-bold text-emerald-900 text-sm">{ev.title}</span>
                         <span className="ml-2 text-emerald-600 text-xs">{ev.duration}</span>
                      </div>
                   ))}
                </div>
              </div>
            )
         })}
       </div>
     );
  };

  return (
    <div className="h-full flex flex-col max-w-[1600px] mx-auto">
      <div className="flex justify-between items-end mb-8 px-2">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Calendar</h1>
          <p className="text-slate-500 font-medium mt-1">
            {view === 'month' ? 'Monthly Overview' : view === 'week' ? 'Weekly Schedule' : 'Daily Timeline'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg hover:shadow-emerald-500/30 hover:scale-105 transition-all flex items-center gap-2 text-sm"
          >
            <Plus size={18} /> New Event
          </button>
          
          <div className="bg-white/50 backdrop-blur-md p-1 rounded-xl flex border border-white/60">
            {['Day', 'Week', 'Month'].map((v) => (
              <button 
                key={v} 
                onClick={() => setView(v.toLowerCase() as any)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  view === v.toLowerCase() 
                    ? 'bg-white shadow-md text-slate-900' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] border border-white/60 flex-1 p-8 shadow-xl shadow-slate-200/40">
        {view === 'month' && (
          <div className="grid grid-cols-7 mb-6">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-center text-sm font-bold text-slate-400 uppercase tracking-widest">{d}</div>
            ))}
          </div>
        )}
        
        {view === 'month' && renderMonthView()}
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