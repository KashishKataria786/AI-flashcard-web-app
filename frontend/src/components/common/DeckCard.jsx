
import { motion} from 'framer-motion';
import {FiLayers, FiBookOpen,  FiTrash2} from 'react-icons/fi';


const DeckCard = ({ deck, onStudy, onRegenerate,  onDelete }) => {
  const memorize = (deck.cards || []).filter((c) => c.type === 'Memorize').length;
  const qa = (deck.cards || []).filter((c) => c.type === 'QA').length;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white border-2 border-black p-6 flex flex-col gap-4 group"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="w-10 h-10 bg-[#ffb800] border-2 border-black flex items-center justify-center shrink-0">
          <FiLayers className="w-5 h-5 text-black" />
        </div>
        <div className="flex items-center gap-2">
           {/* <button
            onClick={(e) => { e.stopPropagation(); onRegenerate(deck); }}
            className="w-8 h-8 border-2 border-black flex items-center justify-center hover:bg-black hover:text-white transition-colors"
            title="Regenerate Deck"
          >
            <FiRefreshCw className="w-4 h-4" />
          </button> */}
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(deck); }}
            className="w-8 h-8 border-2 border-black flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
            title="Delete Deck"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest pt-1">
            {deck.cards?.length || 0} cards
          </span>
        </div>
      </div>

      <div>
        <h3 className="font-extrabold text-black text-lg leading-tight uppercase line-clamp-2">
          {deck.title}
        </h3>
        <p className="text-xs text-gray-500 font-medium mt-1">
          Created {deck.createdAt ? new Date(deck.createdAt).toLocaleDateString() : 'just now'}
        </p>
      </div>

      <div className="flex gap-2">
        <span className="px-2 py-1 bg-[#ffb800] border border-black text-xs font-bold">{memorize} Memorize</span>
        <span className="px-2 py-1 bg-black text-white text-xs font-bold">{qa} Q&A</span>
      </div>

      <button
        onClick={() => onStudy(deck)}
        className="mt-auto w-full py-3 bg-black text-[#ffb800] font-extrabold text-xs uppercase tracking-widest border-2 border-black hover:bg-[#ffb800] hover:text-black transition-all flex items-center justify-center gap-2"
      >
        <FiBookOpen className="w-4 h-4" />
        Study Deck
      </button>
    </motion.div>
  );
};


export default DeckCard;