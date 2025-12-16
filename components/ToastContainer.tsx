
import React from 'react';
import { ToastMessage } from '../types';
import { ICONS } from '../constants';

interface ToastContainerProps {
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div 
          key={toast.id}
          className={`
            pointer-events-auto min-w-[300px] max-w-sm bg-zinc-900 border shadow-2xl rounded-lg p-4 flex items-start gap-3 
            transform transition-all duration-300 animate-in slide-in-from-right-12 fade-in
            ${toast.type === 'success' ? 'border-green-900/50' : ''}
            ${toast.type === 'error' ? 'border-red-900/50' : ''}
            ${toast.type === 'info' ? 'border-blue-900/50' : ''}
            ${toast.type === 'warning' ? 'border-amber-900/50' : ''}
          `}
        >
          <div className="mt-0.5 shrink-0">
            {toast.type === 'success' && <ICONS.Check size={18} className="text-green-500" />}
            {toast.type === 'error' && <ICONS.AlertTriangle size={18} className="text-red-500" />}
            {toast.type === 'info' && <ICONS.Info size={18} className="text-blue-500" />}
            {toast.type === 'warning' && <ICONS.AlertTriangle size={18} className="text-amber-500" />}
          </div>
          <div className="flex-1">
            <h4 className={`text-sm font-bold ${
               toast.type === 'success' ? 'text-green-400' :
               toast.type === 'error' ? 'text-red-400' :
               toast.type === 'warning' ? 'text-amber-400' : 'text-blue-400'
            }`}>
              {toast.title}
            </h4>
            {toast.message && <p className="text-xs text-zinc-400 mt-1">{toast.message}</p>}
          </div>
          <button onClick={() => removeToast(toast.id)} className="text-zinc-500 hover:text-white transition-colors">
            <ICONS.X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};
