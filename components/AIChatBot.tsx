
import React, { useState, useRef, useEffect } from 'react';
import { ICONS } from '../constants';
import { getCinemaChatResponse } from '../services/geminiService';

export const AIChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'model', content: string}[]>([
    { role: 'model', content: "Hello! I'm the AI Cinema Master. How can I assist with your production today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const response = await getCinemaChatResponse(messages, userMsg);
      if (response) {
        setMessages(prev => [...prev, { role: 'model', content: response }]);
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', content: "Sorry, I encountered a connection error." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* CHAT WINDOW */}
      {isOpen && (
        <div className="mb-4 w-80 md:w-96 h-[500px] bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 origin-bottom-right">
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-amber-700 to-amber-600 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2 text-white">
              <div className="bg-white/20 p-1.5 rounded-full">
                <ICONS.Sparkles size={16} className="text-white"/>
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight">Cinema Master</h3>
                <p className="text-[10px] text-amber-100 opacity-90">Live Assistant</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors">
              <ICONS.X size={18}/>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-950/50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-amber-600 text-white rounded-br-none' 
                      : 'bg-zinc-800 text-zinc-200 rounded-bl-none border border-zinc-700'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-zinc-800 rounded-2xl rounded-bl-none px-4 py-3 border border-zinc-700 flex gap-1">
                  <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-zinc-900 border-t border-zinc-800 shrink-0">
            <div className="relative">
              <input 
                className="w-full bg-zinc-950 border border-zinc-700 rounded-full pl-4 pr-12 py-3 text-sm text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
                placeholder="Ask about script, shots..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <button 
                className="absolute right-1 top-1 p-2 bg-amber-600 hover:bg-amber-500 text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
              >
                <ICONS.ArrowRight size={16}/>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOGGLE BUTTON */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all transform hover:scale-105 active:scale-95 ${isOpen ? 'bg-zinc-700 text-zinc-400 rotate-90' : 'bg-gradient-to-br from-amber-500 to-orange-600 text-white border-2 border-white/10'}`}
      >
        {isOpen ? <ICONS.X size={24}/> : <ICONS.MessageSquare size={28} fill="currentColor" />}
      </button>
    </div>
  );
};
