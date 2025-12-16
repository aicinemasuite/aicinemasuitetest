import React, { useState } from 'react';
import { ICONS } from '../constants';
import { Button } from './Button';

interface APIKeyModalProps {
  onSave: (key: string) => void;
  onClose?: () => void;
  isMandatory?: boolean;
}

export const APIKeyModal: React.FC<APIKeyModalProps> = ({ onSave, onClose, isMandatory = false }) => {
  const [key, setKey] = useState("");
  const [showGuide, setShowGuide] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (key.trim().length > 10) {
      onSave(key.trim());
    } else {
      alert("Please enter a valid API Key.");
    }
  };

  const handleClear = () => {
     if (confirm("Are you sure you want to remove your API Key?")) {
        onSave(""); // Empty string signal to clear
     }
  };

  const hasExistingKey = !!localStorage.getItem('gemini_api_key');

  return (
    <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Decorative Background */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        {/* Content Container */}
        <div className="p-8 overflow-y-auto flex-1 relative z-10">
          
          {/* HEADER */}
          <div className="text-center mb-6">
             <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-700 shadow-lg">
                <ICONS.Key size={32} className="text-amber-500"/>
             </div>
             <h2 className="text-2xl font-bold text-white mb-2 cinematic-font">
                {showGuide ? "How to Get a Key" : (hasExistingKey ? "Manage API Key" : "Activate Studio")}
             </h2>
             <p className="text-sm text-zinc-400">
               {showGuide 
                 ? "Follow these 3 simple steps to get your free key from Google."
                 : "Connect your Google Gemini AI to start generating scripts, images, and videos."
               }
             </p>
          </div>

          {showGuide ? (
            /* GUIDE VIEW */
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
               <div className="space-y-4">
                  <div className="flex gap-4 items-start">
                     <span className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-white shrink-0">1</span>
                     <div>
                        <p className="text-sm text-zinc-300 mb-1">Go to <strong>Google AI Studio</strong>.</p>
                        <a 
                          href="https://aistudio.google.com/app/apikey" 
                          target="_blank" 
                          rel="noreferrer" 
                          className="inline-flex items-center gap-2 text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-full transition-colors"
                        >
                           Open Link <ICONS.ExternalLink size={12}/>
                        </a>
                     </div>
                  </div>
                  <div className="flex gap-4 items-start">
                     <span className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-white shrink-0">2</span>
                     <div>
                        <p className="text-sm text-zinc-300 mb-1">Click the blue <strong>"Get API Key"</strong> or <strong>"Create API Key"</strong> button.</p>
                        <p className="text-[10px] text-zinc-500">You may need to sign in with your Google account first.</p>
                     </div>
                  </div>
                  <div className="flex gap-4 items-start">
                     <span className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-white shrink-0">3</span>
                     <div>
                        <p className="text-sm text-zinc-300 mb-1">Copy the key starting with <code>AIza...</code></p>
                        <p className="text-[10px] text-zinc-500">Come back here and paste it in the box.</p>
                     </div>
                  </div>
               </div>

               <Button variant="secondary" className="w-full" onClick={() => setShowGuide(false)}>
                  <ICONS.ChevronLeft size={16} className="mr-2"/> I have my key
               </Button>
            </div>
          ) : (
            /* INPUT FORM VIEW */
            <form onSubmit={handleSubmit} className="space-y-4 animate-in slide-in-from-left duration-300">
               <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase block mb-2">Google API Key</label>
                  <input 
                    type="password"
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none transition-all placeholder-zinc-700"
                    placeholder={hasExistingKey ? "••••••••••••••••••••" : "Paste key here (starts with AIzaSy...)"}
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    autoFocus={!hasExistingKey}
                  />
               </div>

               {!hasExistingKey && (
                  <button 
                     type="button"
                     onClick={() => setShowGuide(true)}
                     className="w-full text-center text-xs text-amber-500 hover:text-amber-400 hover:underline py-2 flex items-center justify-center gap-1"
                  >
                     <ICONS.HelpCircle size={12}/> I don't have a key, help me!
                  </button>
               )}

               <div className="bg-zinc-800/50 p-3 rounded border border-zinc-700 flex gap-3 items-start">
                  <ICONS.ShieldCheck className="text-green-500 shrink-0 mt-0.5" size={16} />
                  <p className="text-[10px] text-zinc-400 leading-relaxed">
                     Your key is stored locally in your browser for this session. It is never sent to our servers.
                  </p>
               </div>

               <Button variant="accent" className="w-full py-3 font-bold shadow-lg shadow-amber-900/20">
                  {hasExistingKey ? "Update Key" : "Save & Start"}
               </Button>
               
               {hasExistingKey && (
                  <Button type="button" variant="danger" className="w-full" onClick={handleClear}>
                     Disconnect / Remove Key
                  </Button>
               )}
            </form>
          )}
        </div>

        {/* Close Button (Only if not mandatory) */}
        {!isMandatory && onClose && (
           <button onClick={onClose} className="absolute top-4 right-4 text-zinc-600 hover:text-white transition-colors z-20">
              <ICONS.X size={20}/>
           </button>
        )}
      </div>
    </div>
  );
};