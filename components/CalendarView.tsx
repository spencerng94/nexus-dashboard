import React, { useState } from 'react';
import { CalendarEvent } from '../types';

interface CalendarViewProps {
  events: CalendarEvent[];
}

const CalendarView: React.FC<CalendarViewProps> = ({ events }) => {
  const [view, setView] = useState<'month'|'week'|'day'>('month'); 
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
             <div key={i} className={`rounded-[1.5rem] p-3 relative group transition-all duration-300 hover:bg-white hover:shadow-lg hover:shadow-indigo-100/50 hover:scale-[1.02] border border-transparent hover:border-indigo-50 ${isToday ? 'bg-white shadow-md border-indigo-100' : ''}`}>
               <span className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold ${isToday ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/30' : 'text-slate-600'}`}>
                 {date.getDate()}
               </span>
               <div className="mt-2 space-y-1">
                  {dayEvents.map((ev, idx) => (
                    <div key={idx} className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded truncate">
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
              <div key={i} className={`flex flex-col border-r border-slate-100 last:border-0 ${isToday ? 'bg-indigo-50/30' : ''} pt-2`}>
                 <div className="text-center mb-4 sticky top-0 bg-white/50 backdrop-blur-sm py-2 border-b border-slate-100">
                   <span className="block text-xs font-bold text-slate-400 uppercase">{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                   <span className={`block text-lg font-bold ${isToday ? 'text-indigo-600' : 'text-slate-800'}`}>{date.getDate()}</span>
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
                      <div key={idx} className="bg-indigo-50 border-l-4 border-indigo-500 p-2 rounded mb-1">
                         <span className="font-bold text-indigo-900 text-sm">{ev.title}</span>
                         <span className="ml-2 text-indigo-700 text-xs">{ev.duration}</span>
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
        <div className="bg-white/50 backdrop-blur-md p-1 rounded-xl flex border border-white/60">
          {['Day', 'Week', 'Month'].map((v) => (
            <button 
              key={v} 
              onClick={() => setView(v.toLowerCase() as any)}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
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
    </div>
  );
};

export default CalendarView;