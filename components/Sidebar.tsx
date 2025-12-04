import React from 'react';
import { LayoutDashboard, Calendar as CalendarIcon, Target, Dumbbell, User as UserIcon, LogOut } from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: User | null;
  onSignOut: () => void;
  onProfileClick: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, user, onSignOut, onProfileClick }) => {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Overview' },
    { id: 'calendar', icon: CalendarIcon, label: 'Calendar' },
    { id: 'goals', icon: Target, label: 'Focus' },
    { id: 'habits', icon: Dumbbell, label: 'Habits' },
  ];

  const displayName = user?.displayName || "Guest";

  return (
    <div className="fixed z-50 transition-all duration-300
      /* Mobile: Floating Bottom Bar */
      bottom-4 left-4 right-4 h-auto min-h-[80px]
      bg-white/90 backdrop-blur-xl border border-white/40 shadow-2xl rounded-[2rem]
      flex flex-row items-center justify-between px-4 py-2
      /* Desktop: Left Sidebar */
      md:top-6 md:bottom-6 md:left-6 md:right-auto md:w-auto md:min-w-[80px] lg:min-w-[280px]
      md:bg-white/80 md:flex-col md:justify-between md:px-4 md:py-8 md:rounded-[2.5rem]
    ">
      
      {/* Top Section: Logo & Nav */}
      <div className="flex flex-1 md:flex-none flex-row md:flex-col items-center md:items-stretch gap-4 md:w-full">
        
        {/* Logo (Desktop Only) */}
        <div className="hidden md:flex items-center justify-center lg:justify-start gap-4 mb-2 lg:mb-8 px-2">
          <div className="w-10 h-10 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
            <span className="text-white font-bold text-xl">N</span>
          </div>
          <span className="text-2xl font-bold text-slate-800 tracking-tight hidden lg:block">Nexus</span>
        </div>

        {/* Navigation */}
        <nav className="flex flex-row md:flex-col gap-1 md:gap-2 w-full justify-between md:justify-start">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`group relative flex items-center justify-center lg:justify-start p-3 lg:px-5 lg:py-4 rounded-2xl transition-all duration-200 shrink-0 ${
                  isActive 
                    ? 'bg-gradient-to-tr from-emerald-400 to-teal-500 text-white shadow-xl shadow-emerald-500/30 scale-105' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-emerald-500'
                }`}
                title={item.label}
              >
                <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} className="transition-transform duration-300 group-hover:scale-110 shrink-0" />
                <span className={`ml-4 font-semibold text-[15px] hidden lg:block ${isActive ? 'text-white' : ''}`}>{item.label}</span>
                
                {/* Desktop Tooltip (Tablet only) */}
                <div className="hidden md:block lg:hidden absolute left-full ml-4 px-3 py-1.5 bg-slate-800 text-white text-xs font-semibold rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-xl">
                  {item.label}
                  <div className="absolute top-1/2 -translate-y-1/2 -left-1 border-4 border-transparent border-r-slate-800"></div>
                </div>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Bottom Section: User & Logout */}
      <div className="flex flex-row md:flex-col items-center gap-2 md:w-full md:border-t border-l md:border-l-0 border-slate-200 pl-3 md:pl-0 md:pt-6 ml-2 md:ml-0 shrink-0">
        <button 
          onClick={onProfileClick}
          className="relative flex items-center justify-center lg:justify-start p-3 lg:px-5 lg:py-4 rounded-2xl text-slate-500 hover:bg-slate-50 hover:text-emerald-500 transition-all duration-200 group shrink-0"
        >
           <UserIcon size={24} strokeWidth={2} className="transition-transform duration-300 group-hover:scale-110 shrink-0" />
           <span className="ml-4 font-semibold text-[15px] hidden lg:block truncate max-w-[120px]">{displayName}</span>
           
           {/* Desktop Tooltip (Tablet only) */}
           <div className="hidden md:block lg:hidden absolute left-full ml-4 px-3 py-1.5 bg-slate-800 text-white text-xs font-semibold rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-xl">
              Profile
              <div className="absolute top-1/2 -translate-y-1/2 -left-1 border-4 border-transparent border-r-slate-800"></div>
           </div>
        </button>
        
        <button 
          onClick={onSignOut} 
          className="group relative flex items-center justify-center lg:justify-start p-3 lg:px-5 lg:py-4 rounded-2xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all duration-200 shrink-0"
        >
          <LogOut size={24} className="shrink-0" />
          <span className="ml-4 font-semibold text-[15px] hidden lg:block">Sign Out</span>

           {/* Desktop Tooltip (Tablet only) */}
           <div className="hidden md:block lg:hidden absolute left-full ml-4 px-3 py-1.5 bg-slate-800 text-white text-xs font-semibold rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-xl">
              Sign Out
              <div className="absolute top-1/2 -translate-y-1/2 -left-1 border-4 border-transparent border-r-slate-800"></div>
           </div>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;