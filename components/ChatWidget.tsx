import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, MessageSquare } from 'lucide-react';
import { DashboardState } from '../types';
import { chatWithAssistant } from '../services/gemini';

interface ChatWidgetProps {
  dashboardState: DashboardState;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ dashboardState }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "Ready to assist. How can I help clarify your day?" }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage = input;
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput("");
    setIsLoading(true);
    
    try {
      const responseText = await chatWithAssistant(userMessage, dashboardState);
      setMessages(p => [...p, { role: 'assistant', text: responseText }]);
    } catch (e) {
      setMessages(p => [...p, { role: 'assistant', text: "Connection unavailable." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`fixed bottom-8 right-8 z-50 flex flex-col items-end pointer-events-none ${isOpen ? 'pointer-events-auto' : ''}`}>
      <div 
        className={`bg-white/90 backdrop-blur-2xl rounded-[2rem] shadow-2xl mb-6 w-[380px] border border-white/50 overflow-hidden transition-all duration-500 origin-bottom-right ${
          isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 translate-y-10 pointer-events-none'
        }`}
        style={{ height: '500px', display: isOpen ? 'flex' : 'none', flexDirection: 'column' }}
      >
        <div className="bg-slate-50/50 p-5 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Bot size={16} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Nexus Assistant</h3>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">Online</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200/50 transition-colors">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-5 py-3 text-[14px] leading-relaxed shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-slate-900 text-white rounded-tr-sm' 
                  : 'bg-white border border-slate-100 text-slate-600 rounded-tl-sm'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
               <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-sm px-5 py-3 shadow-sm">
                 <div className="flex gap-1">
                   <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                   <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75" />
                   <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150" />
                 </div>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-white/50 backdrop-blur-sm border-t border-slate-100">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask anything..."
              className="w-full bg-slate-100 hover:bg-slate-50 focus:bg-white transition-colors rounded-xl pl-5 pr-12 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 font-medium placeholder:text-slate-400"
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim()}
              className="absolute right-2 top-2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-0 disabled:scale-90 transition-all duration-200 shadow-lg shadow-indigo-500/20"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`pointer-events-auto h-16 w-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-500 hover:scale-105 active:scale-95 ${
          isOpen ? 'bg-slate-900 rotate-90' : 'bg-white border border-slate-100'
        }`}
      >
        {isOpen ? <X size={28} className="text-white" /> : <MessageSquare size={28} className="text-slate-800" />}
      </button>
    </div>
  );
};

export default ChatWidget;