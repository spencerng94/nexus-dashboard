import React from 'react';
import { LayoutDashboard, Calendar as CalendarIcon, Target, Dumbbell, User as UserIcon, LogOut } from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: User | null;
  onSignOut: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, user, onSignOut }) => {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Overview' },
    { id: 'calendar', icon: CalendarIcon, label: 'Calendar' },
    { id: 'goals', icon: Target, label: 'Focus' },
    { id: 'habits', icon: Dumbbell, label: 'Habits' },
  ];

  const displayName = user?.displayName || "Guest";

  return (
    <div className="fixed left-6 top-6 bottom-6 w-20 lg:w-72 bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl shadow-slate-200/50 rounded-[2.5rem] z-40 flex flex-col justify-between py-8 transition-all duration-300">
      <div className="px-4 lg:px-8">
        <div className="flex items-center justify-center lg:justify-start gap-4 mb-12">
          <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
            <span className="text-white font-bold text-xl">N</span>
          </div>
          <span className="text-2xl font-bold text-slate-800 tracking-tight hidden lg:block">Nexus</span>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative w-full flex items-center justify-center lg:justify-start px-4 py-4 rounded-2xl transition-all duration-300 group ${
                  isActive 
                    ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/10 scale-[1.02]' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} className="transition-transform duration-300 group-hover:scale-110" />
                <span className={`ml-4 font-semibold text-[15px] hidden lg:block ${isActive ? 'text-white' : ''}`}>{item.label}</span>
                
                <div className="lg:hidden absolute left-full ml-4 px-3 py-1.5 bg-slate-800 text-white text-xs font-semibold rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-xl">
                  {item.label}
                  <div className="absolute top-1/2 -translate-y-1/2 -left-1 border-4 border-transparent border-r-slate-800"></div>
                </div>
              </button>
            )
          })}
        </nav>
      </div>

      <div className="px-4 lg:px-8 space-y-2">
        <button className="relative w-full flex items-center justify-center lg:justify-start px-4 py-4 rounded-2xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all duration-300 group">
           <UserIcon size={22} strokeWidth={2} className="transition-transform duration-300 group-hover:scale-110" />
           <span className="ml-4 font-semibold text-[15px] hidden lg:block truncate">{displayName}</span>
        </button>
        
        <button 
          onClick={onSignOut} 
          className="relative w-full flex items-center justify-center lg:justify-start px-4 py-4 rounded-2xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all duration-300 group"
        >
          <LogOut size={22} />
          <span className="ml-4 font-semibold text-[15px] hidden lg:block">Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;