

import React, { useMemo } from 'react';
import { LayoutDashboard, Calendar as CalendarIcon, Target, Dumbbell, User as UserIcon, LogOut, Info, NotebookPen, Moon, Sun } from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: User | null;
  onSignOut: () => void;
  onProfileClick: () => void;
  onThemeToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, user, onSignOut, onProfileClick, onThemeToggle }) => {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Overview' },
    { id: 'planner', icon: NotebookPen, label: 'Planner' },
    { id: 'calendar', icon: CalendarIcon, label: 'Calendar' },
    { id: 'goals', icon: Target, label: 'Goals' },
    { id: 'habits', icon: Dumbbell, label: 'Habits' },
    { id: 'about', icon: Info, label: 'About' },
  ];

  const displayName = user?.displayName || "Guest";
  
  const effectiveTheme = useMemo(() => {
    if (user?.theme === 'auto' || !user?.theme) {
       const h = new Date().getHours();
       return (h >= 6 && h < 18) ? 'light' : 'dark';
    }
    return user.theme;
  }, [user?.theme]);

  const isDark = effectiveTheme === 'dark';

  return (
    <div className="fixed z-50 transition-all duration-300
      /* Mobile: Floating Bottom Bar */
      bottom-4 left-2 right-2 h-auto min-h-[70px]
      bg-white/90 dark:bg-stone-900/90 backdrop-blur-xl border border-white/40 dark:border-stone-800/50 shadow-2xl rounded-[1.5rem]
      flex flex-row items-center justify-between px-3 py-2
      /* Desktop: Left Sidebar */
      md:top-6 md:bottom-6 md:left-6 md:right-auto md:w-auto md:min-w-[80px] lg:min-w-[280px]
      md:bg-white/80 md:dark:bg-stone-900/80 md:flex-col md:justify-between md:px-4 md:py-8 md:rounded-[2.5rem]
    ">
      
      {/* Top Section: Logo & Nav */}
      <div className="flex flex-1 md:flex-none flex-row md:flex-col items-center md:items-stretch gap-1 md:gap-4 md:w-full justify-between md:justify-start">
        
        {/* Logo (Desktop Only) */}
        <div className="hidden md:flex items-center justify-center lg:justify-start gap-4 mb-2 lg:mb-8 px-2">
          <div className="w-12 h-12 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* N: Top Left (6,6 to 14,14) */}
                <path d="M6 14V6L14 14V6" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                {/* X: Bottom Right (14,14 to 26,26) - Touching at 14,14 */}
                <path d="M14 14L26 26M26 14L14 26" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-2xl font-bold text-slate-800 dark:text-stone-100 tracking-tight hidden lg:block">Nexus</span>
        </div>

        {/* Navigation */}
        <nav className="flex flex-row md:flex-col gap-1 md:gap-2 w-full md:w-auto justify-evenly md:justify-start flex-1 md:flex-none">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`group relative flex items-center justify-center lg:justify-start p-2.5 lg:px-5 lg:py-4 rounded-xl md:rounded-2xl transition-all duration-200 shrink-0 ${
                  isActive 
                    ? 'bg-gradient-to-tr from-emerald-500 to-teal-500 text-white shadow-lg md:shadow-xl shadow-emerald-500/30 scale-105' 
                    : 'text-slate-500 dark:text-stone-400 lg:hover:bg-slate-50 lg:dark:hover:bg-white/5 lg:hover:text-emerald-500 dark:lg:hover:text-emerald-400'
                }`}
                title={item.label}
              >
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} className="transition-transform duration-300 lg:group-hover:scale-110 shrink-0 md:w-6 md:h-6" />
                <span className={`ml-4 font-semibold text-[15px] hidden lg:block ${isActive ? 'text-white' : ''}`}>{item.label}</span>
                
                {/* Desktop Tooltip (Tablet only) */}
                <div className="hidden md:block lg:hidden absolute left-full ml-6 px-3 py-1.5 bg-slate-800 text-white text-xs font-semibold rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-xl">
                  {item.label}
                  <div className="absolute top-1/2 -translate-y-1/2 -left-1 border-4 border-transparent border-r-slate-800"></div>
                </div>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Bottom Section: User & Logout */}
      <div className="flex flex-row md:flex-col items-center md:items-stretch gap-1 md:gap-2 md:w-full md:border-t border-l md:border-l-0 border-slate-200 dark:border-stone-800 pl-1 md:pl-0 md:pt-6 ml-1 md:ml-0 shrink-0">
        <button 
          onClick={onProfileClick}
          className="relative flex items-center justify-center lg:justify-start p-2.5 lg:px-5 lg:py-4 rounded-xl md:rounded-2xl text-slate-500 dark:text-stone-400 lg:hover:bg-slate-50 lg:dark:hover:bg-white/5 lg:hover:text-emerald-500 dark:lg:hover:text-emerald-400 transition-all duration-200 group shrink-0"
        >
           <UserIcon size={22} strokeWidth={2} className="transition-transform duration-300 lg:group-hover:scale-110 shrink-0 md:w-6 md:h-6" />
           <span className="ml-4 font-semibold text-[15px] hidden lg:block truncate max-w-[120px]">{displayName}</span>
           
           {/* Desktop Tooltip (Tablet only) */}
           <div className="hidden md:block lg:hidden absolute left-full ml-6 px-3 py-1.5 bg-slate-800 text-white text-xs font-semibold rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-xl">
              Profile
              <div className="absolute top-1/2 -translate-y-1/2 -left-1 border-4 border-transparent border-r-slate-800"></div>
           </div>
        </button>
        
        <button 
          onClick={onThemeToggle}
          className="group relative flex items-center justify-center lg:justify-start p-2.5 lg:px-5 lg:py-4 rounded-xl md:rounded-2xl text-slate-400 dark:text-stone-500 lg:hover:text-amber-500 dark:lg:hover:text-amber-400 lg:hover:bg-amber-50 dark:lg:hover:bg-amber-900/10 transition-all duration-200 shrink-0"
        >
          {isDark ? <Moon size={22} className="shrink-0 md:w-6 md:h-6" /> : <Sun size={22} className="shrink-0 md:w-6 md:h-6" />}
          <span className="ml-4 font-semibold text-[15px] hidden lg:block">{isDark ? 'Dark Mode' : 'Light Mode'}</span>

           {/* Desktop Tooltip (Tablet only) */}
           <div className="hidden md:block lg:hidden absolute left-full ml-6 px-3 py-1.5 bg-slate-800 text-white text-xs font-semibold rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-xl">
              {isDark ? 'Dark Mode' : 'Light Mode'}
              <div className="absolute top-1/2 -translate-y-1/2 -left-1 border-4 border-transparent border-r-slate-800"></div>
           </div>
        </button>

        <button 
          onClick={onSignOut} 
          className="group relative flex items-center justify-center lg:justify-start p-2.5 lg:px-5 lg:py-4 rounded-xl md:rounded-2xl text-slate-400 dark:text-stone-500 lg:hover:text-rose-500 dark:lg:hover:text-rose-400 lg:hover:bg-rose-50 dark:lg:hover:bg-rose-900/10 transition-all duration-200 shrink-0"
        >
          <LogOut size={22} className="shrink-0 md:w-6 md:h-6" />
          <span className="ml-4 font-semibold text-[15px] hidden lg:block">Sign Out</span>

           {/* Desktop Tooltip (Tablet only) */}
           <div className="hidden md:block lg:hidden absolute left-full ml-6 px-3 py-1.5 bg-slate-800 text-white text-xs font-semibold rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-xl">
              Sign Out
              <div className="absolute top-1/2 -translate-y-1/2 -left-1 border-4 border-transparent border-r-slate-800"></div>
           </div>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;