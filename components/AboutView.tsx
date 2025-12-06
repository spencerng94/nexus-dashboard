
import React from 'react';
import { LayoutDashboard, Target, Dumbbell, Calendar, Sparkles, Shield, ArrowRight, Info, NotebookPen, Mail } from 'lucide-react';

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
  <div className="bg-white/60 dark:bg-stone-900/60 backdrop-blur-md p-6 rounded-[2rem] border border-white/60 dark:border-stone-800 shadow-lg shadow-emerald-100/20 dark:shadow-none lg:hover:shadow-xl lg:hover:shadow-emerald-100/40 transition-all duration-300 lg:hover:-translate-y-1">
    <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center text-emerald-500 dark:text-emerald-400 mb-4">
      {icon}
    </div>
    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
    <p className="text-sm text-slate-500 dark:text-stone-400 leading-relaxed">{description}</p>
  </div>
);

const StepCard: React.FC<{ number: string; title: string; text: string }> = ({ number, title, text }) => (
  <div className="flex gap-4 items-start">
    <div className="w-10 h-10 shrink-0 bg-slate-900 dark:bg-stone-700 text-white rounded-xl flex items-center justify-center font-bold shadow-lg shadow-slate-900/20 dark:shadow-none">
      {number}
    </div>
    <div>
      <h4 className="font-bold text-slate-800 dark:text-white text-lg mb-1">{title}</h4>
      <p className="text-sm text-slate-500 dark:text-stone-400">{text}</p>
    </div>
  </div>
);

const AboutView: React.FC = () => {
  return (
    <div className="max-w-[1600px] mx-auto pb-12 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-10 h-10 md:w-14 md:h-14 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
            <Info className="text-white w-5 h-5 md:w-8 md:h-8" />
        </div>
        <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">About Nexus</h1>
            <p className="text-emerald-500 dark:text-emerald-400 font-bold text-sm mt-1 uppercase tracking-wider">Philosophy & Guide</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: HERO & INFO */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Mission */}
          <div className="bg-white dark:bg-stone-900 rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-stone-800 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-emerald-100/50 to-teal-100/50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
             
             <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6 relative z-10">
               Your Intelligent Command Center
             </h2>
             <p className="text-lg text-slate-600 dark:text-stone-300 leading-relaxed mb-6 relative z-10">
               Nexus is designed to close the gap between <strong>planning</strong> and <strong>doing</strong>. 
               Unlike fragmented tools that separate your calendar from your goals, Nexus brings them together into a single, cohesive dashboard powered by Generative AI.
             </p>
             <p className="text-lg text-slate-600 dark:text-stone-300 leading-relaxed relative z-10">
               Whether you want to build new habits, track professional goals, or simply get a handle on your daily schedule, Nexus provides the clarity you need to perform at your best.
             </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FeatureCard 
              icon={<LayoutDashboard size={24} />}
              title="Daily Plan"
              description="Start every morning with an AI-generated briefing that analyzes your schedule and priorities to create a clear plan of attack."
            />
            <FeatureCard 
              icon={<NotebookPen size={24} />}
              title="AI Planner"
              description="Simply type your plans naturally (e.g. 'Gym at 5, then Dinner'), and let Nexus build a conflict-free schedule for you."
            />
            <FeatureCard 
              icon={<Target size={24} />}
              title="Goal Tracking"
              description="Set numeric targets (e.g., 'Read 5 Books') and track progress visually. Use AI to brainstorm actionable goals based on your interests."
            />
            <FeatureCard 
              icon={<Dumbbell size={24} />}
              title="Habit Formation"
              description="Build consistency with streak tracking and detailed history logs. View your performance in calendar or list formats."
            />
             <FeatureCard 
              icon={<Calendar size={24} />}
              title="Smart Calendar"
              description="Syncs seamlessly with Google Calendar. View your day, week, or month, and categorize events as Work or Personal."
            />
            <FeatureCard 
              icon={<Sparkles size={24} />}
              title="Nexus Assistant"
              description="A context-aware AI chatbot that can manage your calendar (add, edit, delete events) and answer questions about your day."
            />
          </div>

        </div>

        {/* RIGHT COLUMN: HOW TO & DETAILS */}
        <div className="space-y-8">
           
           {/* How to Use */}
           <div className="bg-slate-50 dark:bg-stone-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-stone-800">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">How to use Nexus</h3>
              <div className="space-y-8">
                <StepCard 
                  number="1"
                  title="Connect"
                  text="Sign in with Google to sync your Calendar events. This gives the AI context about your time."
                />
                <StepCard 
                  number="2"
                  title="Define"
                  text="Create Goals for long-term targets and Habits for daily routines. Use the 'AI Ideas' button if you're stuck."
                />
                <StepCard 
                  number="3"
                  title="Plan"
                  text="Use the AI Planner to instantly structure your day or tomorrow from a simple text prompt."
                />
                <StepCard 
                  number="4"
                  title="Track"
                  text="Log your habits and update goal progress daily. Consistency creates momentum."
                />
              </div>
           </div>

           {/* Tech Stack */}
           <div className="bg-gradient-to-br from-stone-900 to-stone-800 rounded-[2.5rem] p-8 text-white shadow-xl shadow-stone-900/20 dark:shadow-none relative overflow-hidden">
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-emerald-500 rounded-full blur-3xl opacity-20 -mr-10 -mb-10" />
              <h3 className="text-xl font-bold text-white mb-4">Under the Hood</h3>
              <p className="text-stone-300 text-sm mb-6 leading-relaxed">
                Nexus is built with modern web technologies to ensure speed and reliability.
              </p>
              <ul className="space-y-3 text-sm font-medium text-stone-300">
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  React 19 & TypeScript
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Google Gemini 2.5 Flash Model
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Google Calendar API
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Open-Meteo Weather API
                </li>
              </ul>
           </div>

           {/* Feedback Section */}
           <div className="bg-white dark:bg-stone-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-stone-800 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-100 dark:bg-emerald-900/10 rounded-full blur-3xl -mr-10 -mt-10 transition-opacity opacity-50 group-hover:opacity-100 pointer-events-none" />
              
              <div className="relative z-10">
                <div className="w-12 h-12 bg-slate-50 dark:bg-stone-800 rounded-2xl flex items-center justify-center text-slate-400 dark:text-stone-500 mb-4 group-hover:scale-110 transition-transform duration-300 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/20 group-hover:text-emerald-500">
                    <Mail size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Have Feedback?</h3>
                <p className="text-slate-500 dark:text-stone-400 text-sm mb-6 leading-relaxed">
                    We'd love to hear from you. Help us shape the future of Nexus by sharing your ideas or reporting issues.
                </p>
                
                <a 
                    href="mailto:nexus.planner.ai@gmail.com?subject=Nexus%20Feedback&body=Hi%20Nexus%20Team%2C%0A%0AType%20of%20Feedback%3A%20(Feature%20Request%20%2F%20Bug%20Report%20%2F%20General)%0A%0ADescription%3A%0A%0AWhat%20I%20love%3A%0A%0AWhat%20could%20be%20better%3A"
                    className="w-full py-3.5 bg-slate-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10 dark:shadow-none"
                >
                    <Mail size={18} /> Send Feedback
                </a>
                <p className="text-center text-[10px] text-slate-400 dark:text-stone-500 mt-3">
                    Opens email client with template
                </p>
              </div>
           </div>

        </div>
      </div>
    </div>
  );
};

export default AboutView;
