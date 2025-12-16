
import React, { useEffect, useState } from 'react';
import { ICONS, PLACEHOLDER_IMAGE } from '../constants';
import { Slide, ProjectInfo } from '../types';

interface PresentationViewProps {
  project: ProjectInfo;
  slides: Slide[];
  activeSlideId: string | null;
  setActiveSlideId: (id: string) => void;
  onClose: () => void;
}

export const PresentationView: React.FC<PresentationViewProps> = ({
  project,
  slides,
  activeSlideId,
  setActiveSlideId,
  onClose
}) => {
  const slide = slides.find(s => s.id === activeSlideId) || slides[0];
  const currentIndex = slides.findIndex(s => s.id === slide.id);
  const [isPlaying, setIsPlaying] = useState(false);

  const nextSlide = () => {
    if (currentIndex < slides.length - 1) {
      setActiveSlideId(slides[currentIndex + 1].id);
    } else {
      setIsPlaying(false); // Stop at end
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) setActiveSlideId(slides[currentIndex - 1].id);
  };

  // Auto-play Logic
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        nextSlide();
      }, 5000); // 5 Seconds per slide
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentIndex, slides.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'Escape') onClose();
      if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying(!isPlaying);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [slide, currentIndex, slides, onClose, isPlaying]);

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      {/* Background Image Layer */}
      <div className="absolute inset-0 z-0 bg-black">
         <img 
           src={slide.imageUrl || PLACEHOLDER_IMAGE} 
           className={`w-full h-full object-cover transition-all duration-1000 opacity-100`}
           alt="bg"
         />
         {/* NO GRADIENT OVERLAY - 100% REAL COLORS */}
      </div>

      {/* Content Layer with TEXT SHADOW */}
      <div className="relative z-10 w-full max-w-7xl px-12 grid grid-cols-12 gap-12 items-end pb-32 h-full pointer-events-none">
         <div className="col-span-8 mb-10">
            <h4 className="text-amber-500 text-lg tracking-[0.2em] font-bold mb-4 uppercase animate-fade-in drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              {project.title} | {project.genre}
            </h4>
            <h1 className="text-7xl font-bold text-white mb-8 cinematic-font leading-tight animate-slide-up drop-shadow-[0_4px_6px_rgba(0,0,0,0.9)]">
              {slide.title}
            </h1>
            <div className="w-24 h-1 bg-amber-500 mb-8 shadow-lg shadow-black" />
            <p className="text-2xl text-white leading-relaxed font-light max-w-4xl whitespace-pre-wrap animate-fade-in delay-150 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
              {slide.content}
            </p>
         </div>
      </div>

      {/* Top Controls */}
      <div className="absolute top-6 right-6 z-20">
         <button onClick={onClose} className="p-3 bg-black/50 text-white hover:bg-red-600/80 rounded-full backdrop-blur transition-colors" title="Exit Presentation (Esc)">
            <ICONS.Minimize2 size={20} />
         </button>
      </div>

      {/* Bottom Control Bar */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-4 w-full max-w-2xl">
         
         {/* Progress Bar */}
         <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-amber-600 transition-all duration-500" 
              style={{ width: `${((currentIndex + 1) / slides.length) * 100}%` }}
            />
         </div>

         {/* Buttons */}
         <div className="flex items-center gap-6 bg-black/60 backdrop-blur-md px-8 py-3 rounded-full border border-zinc-800/50 shadow-2xl">
            <button 
              onClick={prevSlide} 
              disabled={currentIndex === 0} 
              className="p-2 text-zinc-400 hover:text-white disabled:opacity-30 transition-colors"
              title="Previous Slide (Left Arrow)"
            >
               <ICONS.ChevronLeft size={28} />
            </button>

            <button 
              onClick={() => setIsPlaying(!isPlaying)} 
              className={`p-4 rounded-full transition-all ${isPlaying ? 'bg-amber-600 text-white hover:bg-amber-500' : 'bg-white text-black hover:bg-zinc-200'}`}
              title={isPlaying ? "Pause (Space)" : "Play Slideshow (Space)"}
            >
               {isPlaying ? <span className="block w-4 h-4 border-l-4 border-r-4 border-current mx-auto"/> : <ICONS.Play size={20} fill="currentColor" className="ml-1"/>}
            </button>

            <button 
              onClick={nextSlide} 
              disabled={currentIndex === slides.length - 1} 
              className="p-2 text-zinc-400 hover:text-white disabled:opacity-30 transition-colors"
              title="Next Slide (Right Arrow)"
            >
               <ICONS.ChevronRight size={28} />
            </button>
         </div>

         <div className="text-zinc-500 font-mono text-xs tracking-widest drop-shadow-md">
            SLIDE {currentIndex + 1} / {slides.length}
         </div>
      </div>
    </div>
  );
};
