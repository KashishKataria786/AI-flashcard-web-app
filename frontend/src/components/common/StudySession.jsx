import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {FiPlus, FiLayers, FiChevronLeft, FiChevronRight, FiGrid, FiBookOpen, FiFilter, FiRefreshCw, FiAlertTriangle, FiTrash2, FiPieChart} from 'react-icons/fi';
import DeckDropzone from '../../components/study/DeckDropzone';
import FlipCard from '../../components/study/FlipCard';
import AnimatedModal from '../../components/common/AnimatedModal';
import { 
  uploadPDFAPI, fetchDecksAPI, fetchDueCardsAPI, submitReviewAPI, deleteDeckAPI 
} from '../../api/decks';

const StudySession = ({ deckId, deckTitle, onExit }) => {
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sessionStats, setSessionStats] = useState({ reviewed: 0, memorize: 0, qa: 0 });

  const loadDueCards = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchDueCardsAPI(deckId);
      setCards(data.cards || []);
      setSessionStats({
         reviewed: 0,
         memorize: data.cards?.filter(c => c.type === 'Memorize').length || 0,
         qa: data.cards?.filter(c => c.type === 'QA').length || 0
      });
    } catch (err) {
      console.error('Failed to load session:', err);
    } finally {
      setLoading(false);
    }
  }, [deckId]);

  useEffect(() => {
    loadDueCards();
  }, [loadDueCards]);

  const handleRate = async (cardId, rating) => {
    try {
      await submitReviewAPI(cardId, deckId, rating);
      setSessionStats(prev => ({ ...prev, reviewed: prev.reviewed + 1 }));
      
      if (currentIndex < cards.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setCurrentIndex(cards.length); // End of session
      }
    } catch (err) {
      console.error('Rating failed:', err);
    }
  };

  const total = cards.length;
  const isFinished = currentIndex >= total && total > 0;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
        <div className="w-12 h-12 border-4 border-black border-t-[#ffb800] animate-spin"></div>
        <p className="font-extrabold text-black uppercase tracking-widest text-sm animate-pulse">Loading Study Session...</p>
      </div>
    );
  }

  if (total === 0 && !loading) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#ffb800] border-2 border-black p-12 flex flex-col items-center text-center gap-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
      >
        <div className="w-20 h-20 bg-white border-2 border-black flex items-center justify-center rotate-3">
          <FiLayers className="w-10 h-10 text-black" />
        </div>
        <div>
          <h2 className="text-3xl font-black text-black uppercase mb-2">You're All Caught Up!</h2>
          <p className="font-bold text-black/70 max-w-sm">No cards are due for review in this deck right now. Great job!</p>
        </div>
        <button 
          onClick={onExit} 
          className="px-10 py-4 bg-black text-[#ffb800] font-black uppercase text-sm border-2 border-black hover:bg-white hover:text-black transition-all"
        >
          Back to Library
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-6 max-w-4xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-5 border-b-2 border-black">
        <div className="flex items-center gap-4">
          <button
            onClick={onExit}
            className="w-10 h-10 border-2 border-black flex items-center justify-center hover:bg-[#ffb800] transition-colors"
          >
            <FiChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-black uppercase tracking-tight">{deckTitle}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 bg-[#ffb800] border border-black text-[10px] font-black uppercase text-black">
                {sessionStats.memorize} Memorize
              </span>
              <span className="px-2 py-0.5 bg-black border border-black text-[10px] font-black uppercase text-[#ffb800]">
                {sessionStats.qa} Q&A
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
           <span className="block text-2xl font-black text-black tabular-nums">
              {Math.min(currentIndex + 1, total)}
              <span className="text-gray-400 text-lg font-bold"> / {total}</span>
           </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-3 bg-gray-100 border-2 border-black">
        <motion.div
          className="h-full bg-black shadow-[2px_0_0_0_rgba(255,184,0,1)]"
          initial={{ width: 0 }}
          animate={{ width: `${(currentIndex / total) * 100}%` }}
          transition={{ type: 'spring', stiffness: 200, damping: 30 }}
        />
      </div>

      {/* Card Display */}
      <AnimatePresence mode="wait">
        {isFinished ? (
          <motion.div
            key="finish"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#ffb800] border-2 border-black p-12 text-center flex flex-col items-center gap-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
          >
            <div className="w-24 h-24 bg-white border-2 border-black flex items-center justify-center -rotate-3">
              <span className="text-5xl">🎯</span>
            </div>
            <div>
              <h2 className="text-4xl font-black text-black uppercase mb-2">Session Won!</h2>
              <p className="font-bold text-black/80 text-lg">You reviewed all {sessionStats.reviewed} cards in this set.</p>
            </div>
            <button 
              onClick={onExit} 
              className="px-10 py-4 bg-black text-[#ffb800] font-black uppercase text-sm border-2 border-black hover:bg-white hover:text-black transition-all"
            >
              Finish Review
            </button>
          </motion.div>
        ) : (
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.2 }}
          >
            <FlipCard 
              card={cards[currentIndex]} 
              index={currentIndex} 
              total={total} 
              onRate={handleRate}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};


export default StudySession;