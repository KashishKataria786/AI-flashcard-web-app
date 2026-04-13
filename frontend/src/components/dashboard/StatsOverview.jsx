import { FiCheckCircle, FiActivity, FiLayers } from 'react-icons/fi';
import { motion } from 'framer-motion';

const StatsOverview = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 bg-gray-100 border-2 border-dashed border-gray-300"></div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-6"
    >
      <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-4 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all">
        <div className="w-12 h-12 bg-[#ffb800] border-2 border-black flex items-center justify-center">
          <FiCheckCircle className="w-6 h-6" />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Mastered Cards</p>
          <p className="text-3xl font-black italic">{stats.summary.totalMastered}</p>
        </div>
      </div>
      
      <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-4 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all">
        <div className="w-12 h-12 bg-black border-2 border-black flex items-center justify-center">
          <FiActivity className="w-6 h-6 text-[#ffb800]" />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Total Reviews</p>
          <p className="text-3xl font-black italic">{stats.summary.totalReviews}</p>
        </div>
      </div>

      <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-4 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all">
        <div className="w-12 h-12 bg-gray-100 border-2 border-black flex items-center justify-center">
          <FiLayers className="w-6 h-6" />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Global Decks</p>
          <p className="text-3xl font-black italic">{stats.summary.totalDecks}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default StatsOverview;
