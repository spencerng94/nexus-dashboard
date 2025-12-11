import React, { useState } from 'react';
import { AlertTriangle, Loader2, User as UserIcon, LayoutDashboard, Target, Dumbbell, Calendar, Sparkles, NotebookPen, ArrowLeft, Info, Grid2x2 } from 'lucide-react';

interface LoginScreenProps {
  onLogin: () => Promise<void>;
  onGuestLogin: () => void;
  loginError: string;
}

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
  <div className="bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-white/50 shadow-sm transition-all hover:shadow-md hover:bg-white/80">
    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500 mb-4 shadow-sm">
      {icon}
    </div>
    <h3 className="text-base font-bold text-slate-900 mb-2">{title}</h3>
    <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
  </div>
);

const StepCard: React.FC<{ number: string; title: string; text: string }> = ({ number, title, text }) => (
  <div className="flex gap-4 items-start">
    <div className="w-8 h-8 shrink-0 bg-slate-900 text-white rounded-lg flex items-center justify-center font-bold text-sm shadow-md">
      {number}
    </div>
    <div>
      <h4 className="font-bold text-slate-800 text-base mb-1">{title}</h4>
      <p className="text-sm text-slate-500 leading-relaxed">{text}</p>
    </div>
  </div>
);

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onGuestLogin, loginError }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  const handleGoogleClick = async () => {
    if (isLoading) return;
    setIsLoading(true);
    
    try {
      // The parent component (App.tsx) handles the Client ID via environment variables
      await onLogin();
    } catch (e) {
      console.error("Login attempt failed", e);
    } finally {
      setIsLoading(false);
    }
  };

  const isUnauthorizedDomain = loginError.includes("auth/unauthorized-domain");

  if (showAbout) {
    return (
        <div className="min-h-screen bg-[#F5F5F7] overflow-y-auto custom-scrollbar relative">
           <div className="fixed top-[-20%] left-[-10%] w-[600px] h-[600px] bg-emerald-100/40 rounded-full blur-[100px] pointer-events-none" />
           <div className="fixed bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-teal-100/40 rounded-full blur-[100px] pointer-events-none" />

           <div className="relative z-10 max-w-5xl mx-auto p-6 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <button 
                  onClick={() => setShowAbout(false)}
                  className="mb-8 flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors font-bold px-4 py-2 bg-white/50 backdrop-blur-md rounded-xl border border-white/50 w-fit shadow-sm hover:shadow"
               >
                  <ArrowLeft size={18} /> Back to Sign In
               </button>

               <div className="text-center mb-16">
                   <div className="w-20 h-20 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/20">
                      <svg width="40" height="40" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M6 14V6L14 14V6" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M14 14L26 26M26 14L14 26" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                   </div>
                   <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">Meet Nexus</h1>
                   <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
                      Your intelligent command center. Nexus closes the gap between planning and doing by combining your calendar, goals, and habits into one cohesive, AI-powered dashboard.
                   </p>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                  <FeatureCard 
                    icon={<LayoutDashboard size={20} />} 
                    title="Daily Plan" 
                    description="Start every morning with an AI-generated briefing that analyzes your schedule and priorities to create a clear plan of attack." 
                  />
                  <FeatureCard 
                    icon={<NotebookPen size={20} />} 
                    title="AI Planner" 
                    description="Simply type your plans naturally (e.g. 'Gym at 5, then Dinner'), and let Nexus build a conflict-free schedule for you." 
                  />
                  <FeatureCard 
                    icon={<Grid2x2 size={20} />} 
                    title="Priority Matrix" 
                    description="Use the Eisenhower Matrix to categorize goals by urgency and importance, focusing your energy on what truly matters." 
                  />
                  <FeatureCard 
                    icon={<Target size={20} />} 
                    title="Goal Tracking" 
                    description="Set numeric targets (e.g., 'Read 5 Books') and track progress visually. Use AI to brainstorm actionable goals." 
                  />
                  <FeatureCard 
                    icon={<Dumbbell size={20} />} 
                    title="Habit Formation" 
                    description="Build consistency with streak tracking and detailed history logs. View your performance in calendar or list formats." 
                  />
                  <FeatureCard 
                    icon={<Calendar size={20} />} 
                    title="Smart Calendar" 
                    description="Syncs seamlessly with Google Calendar. View your day, week, or month, and categorize events as Work or Personal." 
                  />
                  <FeatureCard 
                    icon={<Sparkles size={20} />} 
                    title="Nexus Assistant" 
                    description="A context-aware AI chatbot that can manage your calendar (add, edit, delete events) and answer questions about your day." 
                  />
               </div>

               <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-12 border border-white/50 shadow-xl mb-12">
                  <h2 className="text-2xl font-bold text-slate-900 mb-10 text-center">How It Works</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                     <StepCard number="1" title="Connect" text="Sign in with Google to sync your Calendar events. This gives the AI context about your time." />
                     <StepCard number="2" title="Define" text="Create Goals for long-term targets and Habits for daily routines. Use 'AI Ideas' if you're stuck." />
                     <StepCard number="3" title="Plan" text="Use the AI Planner to instantly structure your day or tomorrow from a simple text prompt." />
                     <StepCard number="4" title="Track" text="Log your habits and update goal progress daily. Consistency creates momentum." />
                  </div>
               </div>
               
               <div className="text-center pb-8">
                 <button 
                    onClick={() => setShowAbout(false)}
                    className="bg-slate-900 text-white font-bold text-lg py-4 px-10 rounded-2xl hover:bg-black hover:scale-105 transition-all shadow-xl shadow-slate-900/20"
                 >
                    Get Started
                 </button>
               </div>
           </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-emerald-100/40 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-teal-100/40 rounded-full blur-[100px]" />

      <div className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] p-12 max-w-md w-full shadow-2xl border border-white/50 relative z-10 text-center">
        <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl mx-auto flex items-center justify-center mb-8 shadow-lg shadow-emerald-500/20">
            <svg width="48" height="48" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* N: Top Left (4,4 to 16,16) */}
              <path d="M4 16V4L16 16V4" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              {/* X: Bottom Right (16,16 to 28,28) - Touching at 16,16 */}
              <path d="M16 16L28 28M28 16L16 28" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        </div>
        <h1 className="text-4xl font-bold text-slate-900 mb-3 tracking-tight">Nexus</h1>
        <p className="text-slate-500 mb-8 text-lg leading-relaxed">
          Your Workspace, Supercharged by AI.
        </p>
        
        {loginError && (
           <div className="mb-6 p-4 bg-amber-50/90 backdrop-blur-sm text-amber-800 text-xs md:text-sm rounded-2xl border border-amber-200 flex items-start gap-3 text-left animate-in fade-in slide-in-from-top-2 shadow-sm">
             <AlertTriangle size={18} className="shrink-0 mt-0.5 text-amber-600" />
             <div className="flex-1 min-w-0">
               {isUnauthorizedDomain ? (
                 <>
                   <p className="font-bold text-sm mb-1">Domain Not Authorized</p>
                   <p className="leading-relaxed mb-2">This domain needs to be added to Firebase:</p>
                   <ol className="list-decimal pl-4 space-y-1 mb-2">
                     <li>Go to Firebase Console &gt; Authentication &gt; Settings &gt; Authorized domains</li>
                     <li>Add this domain: <strong>{window.location.hostname}</strong></li>
                   </ol>
                   <p>Or continue as guest below.</p>
                 </>
               ) : (
                 <pre className="whitespace-pre-wrap font-medium leading-relaxed block font-sans text-[12px]">{loginError}</pre>
               )}
             </div>
           </div>
        )}

        <button 
          onClick={handleGoogleClick}
          disabled={isLoading}
          className="group w-full bg-gradient-to-r from-emerald-500 to-teal-500 lg:hover:from-emerald-600 lg:hover:to-teal-600 text-white font-medium text-lg py-4 px-6 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 shadow-xl shadow-emerald-500/30 lg:hover:shadow-2xl lg:hover:scale-[1.02] mb-4 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isLoading ? (
            <Loader2 className="animate-spin w-6 h-6 text-white" />
          ) : (
            <>
              <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                   <span className="text-emerald-500 font-bold text-xs">G</span>
              </div>
              <span>Sign in with Google</span>
            </>
          )}
        </button>
        
        <button 
          onClick={onGuestLogin}
          disabled={isLoading}
          className="w-full bg-white text-slate-600 font-bold text-lg py-4 px-6 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 border border-slate-200 lg:hover:bg-slate-50 lg:hover:border-slate-300 lg:hover:text-slate-800 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <UserIcon size={24} />
          <span>Continue as Guest</span>
        </button>

        <p className="text-xs text-slate-400 mt-6">
          Google Calendar integration enabled for signed-in users.
        </p>

        <button 
           onClick={() => setShowAbout(true)}
           className="mt-8 text-slate-400 hover:text-emerald-600 text-sm font-semibold flex items-center justify-center gap-2 transition-colors mx-auto"
        >
           <Info size={16} /> About Nexus
        </button>
      </div>
    </div>
  );
};

export default LoginScreen;