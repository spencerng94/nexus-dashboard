
import React, { useState } from 'react';
import { AlertTriangle, Loader2, User as UserIcon } from 'lucide-react';

interface LoginScreenProps {
  onLogin: () => Promise<void>;
  onGuestLogin: () => void;
  loginError: string;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onGuestLogin, loginError }) => {
  const [isLoading, setIsLoading] = useState(false);

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
          Your intelligent workspace. <br/>Synced. Organized. Ready.
        </p>
        
        {loginError && (
           <div className="mb-6 p-4 bg-amber-50/90 backdrop-blur-sm text-amber-800 text-xs md:text-sm rounded-2xl border border-amber-200 flex items-start gap-3 text-left animate-in fade-in slide-in-from-top-2 shadow-sm">
             <AlertTriangle size={18} className="shrink-0 mt-0.5 text-amber-600" />
             <div className="flex-1 min-w-0">
               <pre className="whitespace-pre-wrap font-medium leading-relaxed block font-sans text-[12px]">{loginError}</pre>
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
      </div>
    </div>
  );
};

export default LoginScreen;
