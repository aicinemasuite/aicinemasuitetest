
import React from 'react';
import { ICONS, DICTIONARY } from '../constants';
import { Slide, ProjectInfo } from '../types';
import { Button } from './Button';

interface StructureViewProps {
  slides: Slide[];
  project: ProjectInfo;
  onUpdateSlide: (id: string, updates: Partial<Slide>) => void;
  onRemoveSlide: (id: string) => void;
  onAddSlide: () => void;
  onOpenStudio: () => void;
  onGoHome: () => void;
}

export const StructureView: React.FC<StructureViewProps> = ({
  slides,
  project,
  onUpdateSlide,
  onRemoveSlide,
  onAddSlide,
  onOpenStudio,
  onGoHome
}) => {
  const t = DICTIONARY[project.language];

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950">
      <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-6 pr-80 bg-zinc-900/50 backdrop-blur">
        <div className="flex items-center gap-4">
           {/* Global Logo */}
           <button 
             onClick={onGoHome}
             className="flex items-center gap-2 text-white hover:text-amber-500 transition-colors group mr-4"
           >
              <ICONS.Clapperboard size={20} className="text-amber-500 group-hover:rotate-12 transition-transform" />
              <span className="font-bold cinematic-font tracking-wide text-sm hidden md:block">AICINEMASUITE.COM</span>
           </button>
           <div className="h-6 w-px bg-zinc-800" />
           <h2 className="text-lg font-bold text-zinc-300">{t.structureTitle}</h2>
        </div>
        <Button variant="accent" onClick={onOpenStudio} icon={<ICONS.Layout size={18} />}>
          {t.openStudio}
        </Button>
      </header>
      
      <div className="flex-1 overflow-auto p-8 max-w-4xl mx-auto w-full">
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
          <div className="p-4 bg-zinc-800/50 border-b border-zinc-800 grid grid-cols-12 gap-4 text-sm font-medium text-zinc-400">
            <div className="col-span-1 text-center">#</div>
            <div className="col-span-10">{t.slideTitle}</div>
            <div className="col-span-1 text-center">{t.action}</div>
          </div>
          <div className="divide-y divide-zinc-800">
            {slides.map((slide, idx) => (
              <div key={slide.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-zinc-800/30 transition-colors">
                <div className="col-span-1 text-center font-mono text-zinc-500">{idx + 1}</div>
                <div className="col-span-10">
                  <input 
                    value={slide.title}
                    onChange={(e) => onUpdateSlide(slide.id, { title: e.target.value })}
                    className="w-full bg-transparent border-none focus:ring-0 text-zinc-200 font-medium placeholder-zinc-600"
                  />
                </div>
                <div className="col-span-1 flex justify-center">
                  <button 
                    onClick={() => onRemoveSlide(slide.id)}
                    className="text-zinc-600 hover:text-red-400 transition-colors"
                  >
                    <ICONS.Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 bg-zinc-800/30 border-t border-zinc-800">
            <Button variant="secondary" onClick={onAddSlide} icon={<ICONS.Plus size={16}/>} className="w-full">
              {t.addNewSlide}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
