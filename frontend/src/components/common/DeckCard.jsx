
import { motion} from 'framer-motion';
import {FiLayers, FiBookOpen, FiTrash2, FiDownload} from 'react-icons/fi';


const DeckCard = ({ deck, onStudy, onRegenerate, onDelete, onExport }) => {
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
          <button
            onClick={(e) => { e.stopPropagation(); onExport(deck); }}
            className="w-8 h-8 border-2 border-black flex items-center justify-center hover:bg-[#ffb800] hover:text-black transition-colors"
            title="Export to PDF"
          >
            <FiDownload className="w-4 h-4" />
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

      {/* Mastery & Studied Progress Progress */}
      <div className="space-y-3">
        <div className="flex justify-between items-end">
          <div>
            <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">Total Progress</span>
            <div className="flex items-baseline gap-2">
               <span className="text-2xl font-black text-black">{deck.masteryScore || 0}%</span>
               <span className="text-[10px] font-bold text-gray-400 uppercase italic">Mastered</span>
            </div>
          </div>
          <div className="text-right">
             <span className="block text-[10px] font-bold uppercase text-gray-400">{deck.studiedScore || 0}% Studied</span>
          </div>
        </div>
        
        <div className="relative w-full h-3 bg-gray-100 border-2 border-black overflow-hidden">
          {/* Studied Progress Layer (Lighter) */}
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${deck.studiedScore || 0}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="absolute top-0 left-0 h-full bg-[#ffb800] opacity-30"
          />
          {/* Mastered Progress Layer (Solid) */}
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${deck.masteryScore || 0}%` }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
            className={`absolute top-0 left-0 h-full shadow-[2px_0_0_0_rgba(255,184,0,1)] transition-all ${
              deck.masteryScore === 100 ? 'bg-green-500' : 'bg-[#ffb800]'
            }`}
          />
        </div>
      </div>

      {/* 7-Day Activity Indicator */}
      <div className="space-y-2 mt-4 pt-4 border-t-2 border-dashed border-gray-100">
        <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-gray-400">
          <span>Weekly Activity</span>
          <span className="italic">Last 7 Days</span>
        </div>
        <div className="flex justify-between gap-1">
          {deck.activity?.map((isActive, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className={`flex-1 h-3 border-[1px] border-black/5 rounded-sm transition-all ${
                isActive ? 'bg-[#ffb800] shadow-[0px_2px_4px_rgba(255,184,0,0.3)]' : 'bg-gray-100'
              }`}
              title={idx === 6 ? 'Today' : `${6 - idx} days ago`}
            />
          ))}
        </div>
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