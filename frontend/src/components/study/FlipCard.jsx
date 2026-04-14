// src/components/study/FlipCard.jsx
// 3D flip card with Memorize / QA badge, keyboard support, framer-motion
import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiRotateCcw } from 'react-icons/fi';

const FlipCard = ({ card, index, total, onRate }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const isMemorize = card.type === 'Memorize';

  const handleRate = (e, rating) => {
    e.stopPropagation(); // Don't flip the card when clicking a button
    if (onRate) onRate(card._id, rating);
    setIsFlipped(false); // Flip back for next card
  };

  return (
    <div
      className="w-full"
      style={{ perspective: '1200px' }}
      onClick={() => setIsFlipped((p) => !p)}
      onKeyDown={(e) => e.key === ' ' && setIsFlipped((p) => !p)}
      tabIndex={0}
      role="button"
      aria-label={isFlipped ? 'Click to see front' : 'Click to reveal answer'}
    >
      <motion.div
        className="relative w-full cursor-pointer"
        style={{
          transformStyle: 'preserve-3d',
          minHeight: '420px', // Slightly taller for buttons
        }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {/* FRONT */}
        <div
          className="absolute inset-0 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col p-8"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Badge + Counter */}
          <div className="flex items-center justify-between mb-6">
            <span
              className={`px-3 py-1 text-xs font-extrabold uppercase tracking-widest border-2 border-black ${
                isMemorize ? 'bg-[#ffb800] text-black' : 'bg-black text-[#ffb800]'
              }`}
            >
              {isMemorize ? 'Memorize' : 'Q & A'}
            </span>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              {index + 1} / {total}
            </span>
          </div>

          {/* Front Content */}
          <div className="flex-1 flex items-center justify-center">
            <p className="text-2xl sm:text-3xl font-extrabold text-black text-center leading-tight">
              {card.front}
            </p>
          </div>

          {/* Hint */}
          <div className="flex items-center justify-center gap-2 mt-6 text-gray-400">
            <FiRotateCcw className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Click or Space to flip</span>
          </div>
        </div>

        {/* BACK */}
        <div
          className="absolute inset-0 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col p-8"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          {/* Badge */}
          <div className="flex items-center justify-between mb-6">
            <span className="px-3 py-1 text-xs font-extrabold uppercase tracking-widest border-2 bg-black text-[#ffb800] border-black">
              Answer
            </span>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              {index + 1} / {total}
            </span>
          </div>

          {/* Back Content */}
          <div className="flex-1 flex items-center justify-center">
            <p className="text-xl sm:text-2xl font-bold text-black text-center leading-relaxed">
              {card.back}
            </p>
          </div>

          {/* Rating Controls */}
          <div className="mt-8 pt-6 border-t-2 border-dashed border-gray-200">
             <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-center mb-4">How well did you recall?</p>
              <div className="grid grid-cols-4 gap-2">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => handleRate(e, 1)}
                  className="flex flex-col items-center gap-1 p-2 border-2 border-black hover:bg-red-500 hover:text-white transition-colors group"
                >
                  <span className="font-black text-xs uppercase">Again</span>
                  <span className="text-[8px] font-bold opacity-50"> 1m</span>
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => handleRate(e, 3)}
                  className="flex flex-col items-center gap-1 p-2 border-2 border-black hover:bg-orange-500 hover:text-white transition-colors"
                >
                  <span className="font-black text-xs uppercase">Hard</span>
                  <span className="text-[8px] font-bold opacity-50">2d</span>
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => handleRate(e, 4)}
                  className="flex flex-col items-center gap-1 p-2 border-2 border-black hover:bg-blue-500 hover:text-white transition-colors"
                >
                  <span className="font-black text-xs uppercase">Good</span>
                  <span className="text-[8px] font-bold opacity-50">4d</span>
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => handleRate(e, 5)}
                  className="flex flex-col items-center gap-1 p-2 border-2 border-black hover:bg-green-500 hover:text-white transition-colors"
                >
                  <span className="font-black text-xs uppercase">Easy</span>
                  <span className="text-[8px] font-bold opacity-50">1w</span>
                </motion.button>
              </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default FlipCard;
