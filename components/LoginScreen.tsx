import React, { useState, useEffect } from 'react';
import { AlertTriangle, Settings, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (clientId: string) => Promise<void>;
  onGuestLogin: () => void;
  loginError: string;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onGuestLogin, loginError }) => {
  const [clientId, setClientId] = useState("");
  const [showConfig, setShowConfig] = useState(false);
  const [origin, setOrigin] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  const handleGoogleClick = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      await onLogin(clientId);
    } catch (e) {
      // Error handled in parent state, but we stop loading here
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-200/30 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-200/30 rounded-full blur-[100px]" />

      <div className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] p-12 max-w-md w-full shadow-2xl border border-white/50 relative z-10 text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center mb-8 shadow-lg shadow-indigo-500/20">
          <span className="text-4xl font-bold text-white tracking-tight">N</span>
        </div>
        <h1 className="text-4xl font-bold text-slate-900 mb-3 tracking-tight">Nexus</h1>
        <p className="text-slate-500 mb-8 text-lg leading-relaxed">
          Your intelligent workspace. <br/>Synced. Organized. Ready.
        </p>
        
        {loginError && (
           <div className="mb-6 p-4 bg-amber-50/80 backdrop-blur-sm text-amber-700 text-sm rounded-2xl border border-amber-100/50 flex items-center gap-3 text-left">
             <AlertTriangle size={18} className="shrink-0" />
             {loginError}
           </div>
        )}

        <button 
          onClick={handleGoogleClick}
          disabled={isLoading}
          className="group w-full bg-slate-900 hover:bg-black text-white font-medium text-lg py-4 px-6 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-[1.02] mb-4 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="animate-spin w-6 h-6 text-white" />
          ) : (
            <>
              <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                   <span className="text-slate-900 font-bold text-xs">G</span>
              </div>
              <span>Sign in with Google</span>
            </>
          )}
        </button>

        <button 
          onClick={onGuestLogin}
          disabled={isLoading}
          className="w-full bg-white hover:bg-slate-50 text-slate-600 font-bold text-sm py-4 rounded-2xl transition-all border border-slate-200 mb-8 disabled:opacity-50"
        >
          Continue as Guest
        </button>

        <div className="border-t border-slate-100 pt-6">
          <button 
            onClick={() => setShowConfig(!showConfig)}
            className="flex items-center justify-center gap-2 text-xs font-bold text-slate-400 hover:text-indigo-500 transition-colors mx-auto uppercase tracking-wider"
          >
             <Settings size={14} />
             Configure Client ID
             {showConfig ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          
          {showConfig && (
            <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300 text-left space-y-4">
              <div>
                <p className="text-xs text-slate-500 mb-2">
                  1. <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer" className="text-indigo-500 hover:underline font-bold">Create OAuth Client ID</a> in Google Cloud.
                </p>
                <input 
                  type="text" 
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  placeholder="Paste Client ID here..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                   2. Add this URL to "Authorized Origins"
                 </p>
                 <div className="bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-600 break-all select-all flex justify-between items-center group">
                   {origin}
                   <span className="text-[10px] text-slate-400 italic opacity-0 group-hover:opacity-100 transition-opacity">copy</span>
                 </div>
                 <p className="text-[10px] text-amber-600 mt-1 leading-tight">
                   ⚠ If this doesn't match exactly in Google Cloud Console, you will get a 400 Error.
                 </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;