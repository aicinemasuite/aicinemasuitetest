
import React, { useEffect, useState } from 'react';
import { ICONS, PLACEHOLDER_IMAGE } from '../constants';
import { ShowcaseScene, ProjectInfo } from '../types';

interface StoryboardPresentationProps {
  project: ProjectInfo;
  scenes: ShowcaseScene[];
  onClose: () => void;
}

export const StoryboardPresentation: React.FC<StoryboardPresentationProps> = ({
  project,
  scenes,
  onClose
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showInfo, setShowInfo] = useState(true);

  const activeScene = scenes[currentIndex];

  const nextScene = () => {
    if (currentIndex < scenes.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsPlaying(false); // Stop at end
    }
  };

  const prevScene = () => {
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
  };

  // Auto-play Logic
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        nextScene();
      }, 3000); // 3 Seconds per shot for storyboard
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentIndex, scenes.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextScene();
      if (e.key === 'ArrowLeft') prevScene();
      if (e.key === 'Escape') onClose();
      if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying(!isPlaying);
      }
      if (e.key === 'i') {
        setShowInfo(!showInfo);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, scenes, onClose, isPlaying, showInfo]);

  if (!activeScene) return null;

  return (
    <div className="fixed inset-0 bg-black z-[100] flex items-center justify-center cursor-none hover:cursor-default overflow-hidden">
      
      {/* IMAGE LAYER - CLEAR, NO GRADIENT */}
      <div className="absolute inset-0 z-0 flex items-center justify-center bg-zinc-950">
         <img 
           src={activeScene.imageUrl || PLACEHOLDER_IMAGE} 
           className="max-w-full max-h-full object-contain"
           alt={`Scene ${currentIndex + 1}`}
         />
      </div>

      {/* DSLR VIEWFINDER OVERLAY */}
      <div className="absolute inset-0 z-10 pointer-events-none p-8 flex flex-col justify-between">
         
         {/* Top Data Bar */}
         <div className="flex justify-between items-start text-white/90 font-mono text-sm tracking-wider drop-shadow-md">
            <div className="flex flex-col gap-1">
               <div className="flex items-center gap-2">
                  <span className="text-red-500 animate-pulse text-xs">● REC</span>
                  <span className="bg-white/20 px-1 rounded text-xs">{project.title.toUpperCase()}</span>
               </div>
               <div className="text-xs text-zinc-400 mt-1">
                  00:00:0{currentIndex}:12
               </div>
            </div>

            <div className="flex items-center gap-6">
               <div className="flex flex-col items-center">
                  <span className="text-[10px] text-zinc-400">ISO</span>
                  <span>800</span>
               </div>
               <div className="flex flex-col items-center">
                  <span className="text-[10px] text-zinc-400">SHUTTER</span>
                  <span>1/50</span>
               </div>
               <div className="flex flex-col items-center">
                  <span className="text-[10px] text-zinc-400">IRIS</span>
                  <span>f/2.8</span>
               </div>
               <div className="flex flex-col items-center">
                  <span className="text-[10px] text-zinc-400">WB</span>
                  <span>5600K</span>
               </div>
               <div className="flex items-center gap-1 border border-white/40 px-2 py-1 rounded">
                  <span className="text-[10px]">BAT</span>
                  <div className="w-6 h-3 border border-white flex items-center p-0.5">
                     <div className="w-3/4 h-full bg-white"></div>
                  </div>
               </div>
            </div>
         </div>

         {/* Center Reticle / Guides */}
         <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
            {/* Center Cross */}
            <div className="w-8 h-8 relative">
               <div className="absolute top-1/2 left-0 w-full h-px bg-white"></div>
               <div className="absolute left-1/2 top-0 h-full w-px bg-white"></div>
            </div>
            {/* Thirds Grid (Subtle) */}
            <div className="absolute w-[90%] h-[90%] border border-white/20"></div>
            {/* Crop Marks Corners */}
            <div className="absolute top-8 left-8 w-8 h-8 border-t-2 border-l-2 border-white"></div>
            <div className="absolute top-8 right-8 w-8 h-8 border-t-2 border-r-2 border-white"></div>
            <div className="absolute bottom-8 left-8 w-8 h-8 border-b-2 border-l-2 border-white"></div>
            <div className="absolute bottom-8 right-8 w-8 h-8 border-b-2 border-r-2 border-white"></div>
         </div>

         {/* Bottom Info Bar */}
         <div className="flex items-end justify-between text-white drop-shadow-md">
            <div className="max-w-2xl">
               <div className="flex items-center gap-3 mb-2">
                  <span className="bg-amber-600 text-black px-1.5 py-0.5 text-xs font-bold rounded">SCENE {currentIndex + 1}</span>
                  <span className="font-mono text-xs text-zinc-300">{activeScene.shotSize || 'WIDE'} | {activeScene.lensType || '35mm'} | {activeScene.cameraAngle || 'EYE'}</span>
               </div>
               {showInfo && (
                  <div className="bg-black/60 backdrop-blur-sm p-4 rounded-lg border-l-4 border-amber-500">
                     <h2 className="text-xl font-bold font-serif mb-1 leading-none">{activeScene.heading}</h2>
                     <p className="text-sm text-zinc-300 leading-tight opacity-90">{activeScene.action}</p>
                  </div>
               )}
            </div>

            <div className="flex flex-col items-end gap-1 font-mono text-xs text-zinc-400">
                <span>{currentIndex + 1} / {scenes.length}</span>
                <span>RAW 4K</span>
            </div>
         </div>
      </div>

      {/* Control UI (Clickable) */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 flex gap-4 pointer-events-auto opacity-0 hover:opacity-100 transition-opacity duration-300">
         <button onClick={prevScene} className="p-3 bg-zinc-800/80 hover:bg-white hover:text-black rounded-full text-white transition-all">
            <ICONS.ChevronLeft size={20} />
         </button>
         <button onClick={() => setIsPlaying(!isPlaying)} className="p-4 bg-amber-600 hover:bg-amber-500 rounded-full text-white shadow-lg transition-all">
            {isPlaying ? <div className="w-4 h-4 bg-white rounded-sm" /> : <ICONS.Play size={20} fill="currentColor" />}
         </button>
         <button onClick={nextScene} className="p-3 bg-zinc-800/80 hover:bg-white hover:text-black rounded-full text-white transition-all">
            <ICONS.ChevronRight size={20} />
         </button>
      </div>

      {/* Close Button */}
      <button 
        onClick={onClose} 
        className="absolute top-6 right-6 z-50 p-2 bg-black/50 hover:bg-red-600 text-white rounded-full pointer-events-auto transition-colors"
      >
         <ICONS.X size={20} />
      </button>

    </div>
  );
};
