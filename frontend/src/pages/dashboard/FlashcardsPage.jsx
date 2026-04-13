import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {FiPlus, FiLayers, FiChevronLeft, FiChevronRight, FiGrid, FiBookOpen, FiFilter, FiRefreshCw, FiAlertTriangle, FiTrash2, FiPieChart} from 'react-icons/fi';
import DeckDropzone from '../../components/study/DeckDropzone';
import FlipCard from '../../components/study/FlipCard';
import AnimatedModal from '../../components/common/AnimatedModal';
import { 
  uploadPDFAPI, fetchDecksAPI, fetchDueCardsAPI, submitReviewAPI, deleteDeckAPI 
} from '../../api/decks';
import DeckCard from '../../components/common/DeckCard'
import StudySession  from '../../components/common/StudySession'
// ─── Study Session View ───────────────────────────────────────────────────────
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


// ─── Main Flashcards Page ──────────────────────────────────────────────────────
const FlashcardsPage = () => {
  const [decks, setDecks] = useState([]);
  const [activeStudyDeck, setActiveStudyDeck] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [filterType, setFilterType] = useState('all'); // all | Memorize | QA
  const [loading, setLoading] = useState(true);

  // Operation states
  const [regeneratingDeck, setRegeneratingDeck] = useState(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [deletingDeck, setDeletingDeck] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadDecks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchDecksAPI();
      setDecks(data || []);
    } catch (err) {
      console.error('Failed to load decks:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDecks();
  }, [loadDecks]);

  const handleDeckCreated = useCallback((result) => {
    // result.deck structure matches mongo document
    setDecks((prev) => [result.deck, ...prev]);
    setShowUpload(false);
  }, []);

  const handleRegenerateDeck = async (deck) => {
    try {
      setIsRegenerating(true);
      await regenerateDeckAPI(deck._id);
      await loadDecks();
      setRegeneratingDeck(null);
    } catch (err) {
      console.error('Regeneration failed:', err);
      alert('Regeneration failed: ' + err.message);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleDeleteDeck = async (deck) => {
    try {
      setIsDeleting(true);
      await deleteDeckAPI(deck._id);
      await loadDecks();
      setDeletingDeck(null);
    } catch (err) {
      console.error('Deletion failed:', err);
      alert('Deletion failed: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredDecks = decks.filter((deck) => {
    if (filterType === 'all') return true;
    return (deck.cards || []).some(c => c.type === filterType);
  });

  // Study Mode
  if (activeStudyDeck) {
    return (
      <StudySession
        deckId={activeStudyDeck._id}
        deckTitle={activeStudyDeck.title}
        onExit={() => {
          setActiveStudyDeck(null);
          loadDecks();
        }}
      />
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex items-end justify-between gap-6 pb-6 border-b-2 border-black">
        <div>
          <h1 className="text-4xl sm:text-5xl font-black text-black tracking-tight uppercase mb-2">
            My Flashcards
          </h1>
          <p className="text-base font-medium text-gray-600">
            Generate and manage your AI-powered study decks.
          </p>
        </div>
        
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 px-6 py-3 bg-[#ffb800] text-black border-2 border-black font-black text-sm uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all"
        >
          <FiPlus className="w-4 h-4" />
          New Deck
        </button>
      </div>

      <div className="space-y-8">
        {/* Upload Modal */}
        <AnimatedModal
          isOpen={showUpload}
          handleClose={() => setShowUpload(false)}
          title="Create New Deck"
        >
          <DeckDropzone 
            onDeckCreated={(result) => {
              handleDeckCreated(result);
              setShowUpload(false);
            }} 
          />
        </AnimatedModal>

        {/* Deck Library Section */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="flex items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-2">
              <FiGrid className="w-5 h-5 text-black" />
              <h2 className="text-lg font-black text-black uppercase tracking-tight">
                Your Library
                <span className="ml-2 text-sm text-gray-400 font-bold normal-case tracking-normal">{decks.length} total</span>
              </h2>
            </div>
            {/* Filter Tabs */}
            <div className="flex items-center gap-1 border-2 border-black p-1 bg-gray-50">
              {['all', 'Memorize', 'QA'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilterType(f)}
                  className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                    filterType === f 
                      ? 'bg-black text-[#ffb800]' 
                      : 'text-gray-400 hover:text-black hover:bg-white'
                  }`}
                >
                  {f === 'all' ? 'All' : f}
                </button>
              ))}
            </div>
          </div>

          {filteredDecks.length === 0 ? (
            <div className="border-2 border-dashed border-gray-200 py-24 flex flex-col items-center justify-center gap-6 text-center">
              <div className="w-16 h-16 border-2 border-gray-200 flex items-center justify-center bg-gray-50">
                <FiLayers className="w-8 h-8 text-gray-300" />
              </div>
              <div className="space-y-2">
                <p className="font-black text-black text-xl uppercase tracking-tight">Your library is empty</p>
                <p className="text-sm text-gray-500 font-medium max-w-sm mx-auto">
                  Upload a PDF document to generate your first AI-powered study deck.
                </p>
              </div>
              <button
                onClick={() => setShowUpload(true)}
                className="px-8 py-3 bg-black text-[#ffb800] border-2 border-black font-black text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-all"
              >
                Upload Document
              </button>
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.05 } },
                hidden: {},
              }}
            >
              {filteredDecks.map((deck) => (
                <motion.div
                  key={deck._id}
                  variants={{
                    hidden: { opacity: 0, scale: 0.95 },
                    visible: { opacity: 1, scale: 1 },
                  }}
                >
                  <DeckCard 
                    deck={deck} 
                    onStudy={setActiveStudyDeck} 
                    onRegenerate={setRegeneratingDeck}
                    onDelete={setDeletingDeck}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Regeneration Confirmation Modal */}
      <AnimatedModal
        isOpen={!!regeneratingDeck}
        handleClose={() => !isRegenerating && setRegeneratingDeck(null)}
        title="Regenerate Deck"
      >
        <div className="flex flex-col items-center text-center p-4 gap-6">
          <div className="w-16 h-16 bg-blue-50 border-2 border-blue-500 text-blue-500 flex items-center justify-center">
            <FiRefreshCw className="w-8 h-8" />
          </div>
          
          <div>
            <h3 className="text-xl font-black text-black uppercase mb-2">Regenerate all cards?</h3>
            <p className="text-sm font-medium text-gray-600">
              This will <span className="text-blue-600 font-bold uppercase underline">replace all current cards</span> and reset learning progress for 
              <span className="block font-black text-black mt-1">"{regeneratingDeck?.title}"</span>
            </p>
          </div>

          <div className="flex flex-col w-full gap-3 mt-4">
            <button
              onClick={() => handleRegenerateDeck(regeneratingDeck)}
              disabled={isRegenerating}
              className={`w-full py-4 font-black uppercase tracking-widest border-2 border-black transition-all flex items-center justify-center gap-2 ${
                isRegenerating 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-black text-[#ffb800] hover:bg-[#ffb800] hover:text-black'
              }`}
            >
              {isRegenerating ? (
                <>
                  <FiRefreshCw className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FiRefreshCw className="w-4 h-4" />
                  Regenerate Now
                </>
              )}
            </button>
            <button
              onClick={() => setRegeneratingDeck(null)}
              disabled={isRegenerating}
              className="w-full py-3 font-bold uppercase tracking-widest text-xs text-gray-400 hover:text-black transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </AnimatedModal>

      {/* Deletion Confirmation Modal */}
      <AnimatedModal
        isOpen={!!deletingDeck}
        handleClose={() => !isDeleting && setDeletingDeck(null)}
        title="Delete Deck"
      >
        <div className="flex flex-col items-center text-center p-4 gap-6">
          <div className="w-16 h-16 bg-red-100 border-2 border-red-500 text-red-500 flex items-center justify-center">
            <FiTrash2 className="w-8 h-8" />
          </div>
          
          <div>
            <h3 className="text-xl font-black text-black uppercase mb-2">Delete this deck?</h3>
            <p className="text-sm font-medium text-gray-600">
              This action <span className="text-red-600 font-bold uppercase underline">cannot be undone</span>. All cards and data for 
              <span className="block font-black text-black mt-1">"{deletingDeck?.title}"</span> will be lost.
            </p>
          </div>

          <div className="flex flex-col w-full gap-3 mt-4">
            <button
              onClick={() => handleDeleteDeck(deletingDeck)}
              disabled={isDeleting}
              className={`w-full py-4 font-black uppercase tracking-widest border-2 border-black transition-all flex items-center justify-center gap-2 ${
                isDeleting 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-red-500 text-white hover:bg-black'
              }`}
            >
              {isDeleting ? (
                <>
                  <FiRefreshCw className="w-4 h-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <FiTrash2 className="w-4 h-4" />
                  Delete Permanently
                </>
              )}
            </button>
            <button
              onClick={() => setDeletingDeck(null)}
              disabled={isDeleting}
              className="w-full py-3 font-bold uppercase tracking-widest text-xs text-gray-400 hover:text-black transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </AnimatedModal>
    </div>
  );
};

export default FlashcardsPage;
