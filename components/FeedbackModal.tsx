
import React, { useState } from 'react';
import { ICONS } from '../constants';
import { Button } from './Button';

interface FeedbackModalProps {
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ onClose }) => {
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = () => {
    // In a real app, this would send to an API
    console.log("Feedback Submitted:", { rating, comment });
    setIsSent(true);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl w-full max-w-md p-6 relative overflow-hidden">
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white">
          <ICONS.X size={20} />
        </button>

        {isSent ? (
          <div className="text-center py-8 animate-in fade-in zoom-in">
            <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <ICONS.Check size={32} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Thank You!</h3>
            <p className="text-zinc-400 text-sm">Your feedback helps build the future of AICINEMASUITE.com.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-amber-600/20 p-2 rounded-lg text-amber-500">
                <ICONS.MessageSquare size={24} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Beta Feedback</h2>
                <p className="text-xs text-zinc-500">Found a bug or have an idea?</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-3">How is your experience?</label>
                <div className="flex justify-between gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className={`flex-1 py-3 rounded-lg border transition-all ${
                        rating === star 
                          ? 'bg-amber-600 border-amber-500 text-white shadow-lg shadow-amber-900/50' 
                          : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'
                      }`}
                    >
                      <span className="text-lg font-bold">{star}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Details</label>
                <textarea 
                  className="w-full h-32 bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white text-sm resize-none focus:border-amber-500 outline-none placeholder-zinc-700"
                  placeholder="Tell us what you love or what's broken..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>

              <Button 
                variant="accent" 
                className="w-full" 
                disabled={!rating}
                onClick={handleSubmit}
              >
                Send Feedback
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
