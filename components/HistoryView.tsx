
import React, { useState } from 'react';
import { History, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { BriefingHistoryEntry } from '../types';

interface HistoryViewProps {
  history: BriefingHistoryEntry[];
  onDelete: (id: string) => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ history, onDelete }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleDelete = (id: string) => {
    onDelete(id);
  };

  // Sort history by date descending
  const sortedHistory = [...history].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="max-w-[1000px] mx-auto pb-12 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-10 h-10 md:w-14 md:h-14 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
            <History className="text-white w-5 h-5 md:w-8 md:h-8" />
        </div>
        <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">Plan History</h1>
            <p className="text-emerald-500 dark:text-emerald-400 font-bold text-sm mt-1 uppercase tracking-wider">Review your past daily briefings</p>
        </div>
      </div>

      {sortedHistory.length > 0 ? (
          <div className="space-y-6">
              {sortedHistory.map((entry) => {
                  const isExpanded = expandedId === entry.id;
                  const dateObj = new Date(entry.date + 'T00:00:00'); // Force local date interpretation

                  return (
                      <div 
                        key={entry.id} 
                        className="bg-white/70 dark:bg-stone-900/70 backdrop-blur-xl rounded-[2rem] border border-white/60 dark:border-stone-800 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md"
                      >
                          <div className="flex items-stretch min-h-[100px]">
                              {/* Main Clickable Area - Expands */}
                              <div 
                                className="flex-1 p-6 flex items-center gap-4 cursor-pointer hover:bg-white/40 dark:hover:bg-white/5 transition-colors select-none"
                                onClick={() => toggleExpand(entry.id)}
                              >
                                  <div className="flex flex-col items-center justify-center w-14 h-14 bg-slate-100 dark:bg-stone-800 rounded-2xl border border-slate-200 dark:border-stone-700 shrink-0 pointer-events-none">
                                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                                          {dateObj.toLocaleString('default', { month: 'short' })}
                                      </span>
                                      <span className="text-xl font-bold text-slate-800 dark:text-stone-200">
                                          {dateObj.getDate()}
                                      </span>
                                  </div>
                                  <div className="min-w-0 pointer-events-none">
                                      <h3 className="font-bold text-slate-800 dark:text-stone-100 text-lg truncate pr-2">
                                          Plan for {dateObj.toLocaleDateString(undefined, { weekday: 'long' })}
                                      </h3>
                                      <div className="flex items-center gap-2 mt-1">
                                         <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full uppercase shrink-0">
                                             {entry.style || 'Standard'}
                                         </span>
                                         <span className="text-xs text-slate-400 truncate">
                                             Generated at {new Date(entry.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                         </span>
                                      </div>
                                  </div>
                              </div>
                              
                              {/* Action Buttons Area - Completely Separate Sibling */}
                              <div className="flex items-center gap-2 pr-6 pl-4 border-l border-slate-100 dark:border-stone-800 my-4 shrink-0">
                                  <button
                                    onClick={() => handleDelete(entry.id)}
                                    className="p-2.5 rounded-full bg-slate-50 dark:bg-stone-800 text-slate-400 hover:bg-rose-100 hover:text-rose-500 dark:hover:bg-rose-900/20 dark:hover:text-rose-400 transition-colors"
                                    title="Delete Plan"
                                  >
                                      <Trash2 size={18} />
                                  </button>
                                  <button
                                    onClick={() => toggleExpand(entry.id)}
                                    className={`p-2.5 rounded-full bg-slate-50 dark:bg-stone-800 text-slate-400 hover:text-emerald-500 transition-colors ${isExpanded ? 'bg-slate-100 dark:bg-stone-700 text-emerald-500' : ''}`}
                                    title={isExpanded ? "Collapse" : "Expand"}
                                  >
                                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                  </button>
                              </div>
                          </div>

                          {isExpanded && (
                              <div className="px-8 pb-8 pt-2 animate-in fade-in slide-in-from-top-2 cursor-text">
                                  <div className="w-full h-px bg-slate-100 dark:bg-stone-800 mb-6" />
                                  <div 
                                    className="briefing-content opacity-90 text-sm md:text-base"
                                    dangerouslySetInnerHTML={{ __html: entry.content }} 
                                  />
                              </div>
                          )}
                      </div>
                  );
              })}
          </div>
      ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white/50 dark:bg-stone-800/50 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-stone-700 text-center">
              <div className="w-16 h-16 bg-slate-100 dark:bg-stone-800 rounded-full flex items-center justify-center mb-4 text-slate-300 dark:text-stone-600">
                  <History size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-700 dark:text-stone-300 mb-2">No history yet</h3>
              <p className="text-slate-500 dark:text-stone-500 max-w-xs">
                  Generate and save a daily plan from your dashboard to see it here.
              </p>
          </div>
      )}
    </div>
  );
};

export default HistoryView;
