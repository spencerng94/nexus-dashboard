import React, { useState } from 'react';
import { AlertTriangle, Settings, ChevronDown, ChevronUp } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (clientId: string) => void;
  onGuestLogin: () => void;
  loginError: string;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onGuestLogin, loginError }) => {
  const [clientId, setClientId] = useState("");
  const [showConfig, setShowConfig] = useState(false);

  const handleGoogleClick = () => {
    onLogin(clientId);
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
          className="group w-full bg-slate-900 hover:bg-black text-white font-medium text-lg py-4 px-6 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-[1.02] mb-4"
        >
          <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
               <span className="text-slate-900 font-bold text-xs">G</span>
          </div>
          <span>Sign in with Google</span>
        </button>

        <button 
          onClick={onGuestLogin}
          className="w-full bg-white hover:bg-slate-50 text-slate-600 font-bold text-sm py-4 rounded-2xl transition-all border border-slate-200 mb-8"
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
            <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <p className="text-xs text-slate-500 mb-2 text-left">
                Required for Calendar Sync. <br/> 
                <a href="https://console.cloud.google.com/apis/credentials" target="_blank" className="text-indigo-500 hover:underline">Get ID from Google Cloud Console</a>
              </p>
              <input 
                type="text" 
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder="Paste OAuth Client ID here..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;