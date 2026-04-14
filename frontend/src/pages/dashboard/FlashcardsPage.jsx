import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {FiPlus, FiLayers, FiChevronLeft, FiChevronRight, FiGrid, FiBookOpen, FiFilter, FiRefreshCw, FiAlertTriangle, FiTrash2, FiPieChart} from 'react-icons/fi';
import DeckDropzone from '../../components/study/DeckDropzone';
import FlipCard from '../../components/study/FlipCard';
import AnimatedModal from '../../components/common/AnimatedModal';
import { 
  uploadPDFAPI, fetchDecksAPI, fetchDueCardsAPI, submitReviewAPI, deleteDeckAPI, exportDeckAPI, regenerateDeckAPI, searchDecksAPI
} from '../../api/decks';
import DeckCard from '../../components/common/DeckCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StudySession  from '../../components/common/StudySession'

// ─── Main Flashcards Page ──────────────────────────────────────────────────────
const FlashcardsPage = () => {
  const [decks, setDecks] = useState([]);
  const [activeStudyDeck, setActiveStudyDeck] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [filterType, setFilterType] = useState('all'); // all | Memorize | QA
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
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

  // Debounced search
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim()) {
        try {
          setIsSearching(true);
          const results = await searchDecksAPI(searchQuery);
          setDecks(results || []);
        } catch (err) {
          console.error('Search failed:', err);
        } finally {
          setIsSearching(false);
        }
      } else {
        loadDecks();
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, loadDecks]);

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

  const handleExportDeck = async (deck) => {
    try {
      const blob = await exportDeckAPI(deck._id);
      
      // Create a link element to trigger the download
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${deck.title.replace(/\s+/g, '_')}_Flashcards.pdf`);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Export failed: ' + err.message);
    }
  };

  const filteredDecks = decks.filter((deck) => {
    // If searching, show all matches regardless of type filter to avoid confusion
    if (searchQuery.trim().length > 0) return true;
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
            
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Deep Search Bar */}
              <div className="relative group w-full sm:w-64">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search decks or cards..."
                  className="w-full px-4 py-2 bg-white border-2 border-black text-xs font-bold outline-none placeholder:text-gray-300 focus:shadow-[4px_4px_0px_0px_rgba(255,184,0,1)] transition-all"
                />
                {isSearching && (
                  <div className="absolute right-3 top-2.5">
                    <FiRefreshCw className="w-3 h-3 animate-spin text-[#ffb800]" />
                  </div>
                )}
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
          </div>

          {loading ? (
            <div className="col-span-full">
              <LoadingSpinner message="Fetching your library..." />
            </div>
          ) : filteredDecks.length === 0 ? (
            <div className="border-2 border-dashed border-gray-200 py-24 flex flex-col items-center justify-center gap-6 text-center bg-gray-50/30">
              <div className="w-16 h-16 border-2 border-gray-200 flex items-center justify-center bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)]">
                {searchQuery ? <FiAlertTriangle className="w-8 h-8 text-[#ffb800]" /> : <FiLayers className="w-8 h-8 text-gray-300" />}
              </div>
              <div className="space-y-2">
                <p className="font-black text-black text-xl uppercase tracking-tight">
                  {searchQuery ? 'No Content Found' : 'Your library is empty'}
                </p>
                <p className="text-sm text-gray-500 font-medium max-w-sm mx-auto">
                  {searchQuery 
                    ? `We couldn't find any decks or flashcards matching "${searchQuery}". Try a different keyword.` 
                    : 'Upload a PDF document to generate your first AI-powered study deck.'}
                </p>
              </div>
              
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-8 py-3 bg-black text-[#ffb800] border-2 border-black font-black text-xs uppercase tracking-widest hover:bg-[#ffb800] hover:text-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                  Clear Search
                </button>
              ) : (
                <button
                  onClick={() => setShowUpload(true)}
                  className="px-8 py-3 bg-black text-[#ffb800] border-2 border-black font-black text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-all"
                >
                  Upload Document
                </button>
              )}
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
                      onExport={handleExportDeck}
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
