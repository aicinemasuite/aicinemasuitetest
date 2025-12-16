import React, { useState } from 'react';
import { Slide } from '../types';
import { ICONS, PLACEHOLDER_IMAGE } from '../constants';

interface SlideThumbnailProps {
  slide: Slide;
  index: number;
  isActive: boolean;
  onClick: () => void;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
}

export const SlideThumbnail: React.FC<SlideThumbnailProps> = ({
  slide,
  index,
  isActive,
  onClick,
  onDragStart,
  onDragOver,
  onDrop
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={(e) => onDrop(e, index)}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        group relative flex items-center p-3 rounded-lg cursor-pointer transition-all border
        ${isActive 
          ? 'bg-amber-900/20 border-amber-600/50' 
          : 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700'
        }
      `}
    >
      <div className="mr-3 text-zinc-500 font-mono text-xs select-none cursor-move">
        <ICONS.Grid size={14} className="opacity-50 group-hover:opacity-100" />
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className={`text-sm truncate font-medium ${isActive ? 'text-zinc-100' : 'text-zinc-400'}`}>
          {slide.title}
        </h4>
        <div className="flex items-center gap-2 mt-1">
           {slide.imageUrl ? (
             <span className="text-[10px] bg-green-900/30 text-green-400 px-1.5 py-0.5 rounded border border-green-900/50">Img Ready</span>
           ) : (
             <span className="text-[10px] bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded border border-zinc-700">No Img</span>
           )}
        </div>
      </div>

      {/* Pop-up Preview Portal Effect */}
      {isHovered && slide.imageUrl && (
        <div className="fixed left-72 z-50 w-[480px] aspect-video bg-zinc-950 rounded-lg border border-zinc-700 shadow-2xl overflow-hidden pointer-events-none transform transition-all duration-200">
           <img src={slide.imageUrl} alt="preview" className="w-full h-full object-cover" />
           <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
              <h5 className="text-white font-bold text-lg drop-shadow-md">{slide.title}</h5>
           </div>
        </div>
      )}
    </div>
  );
};
