import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiInfo, FiActivity, FiCheckCircle } from 'react-icons/fi';

const MasteryHeatmap = ({ data, loading }) => {
  const [viewMode, setViewMode] = useState('reviews'); // 'reviews' | 'mastery'
  const [hoveredDate, setHoveredDate] = useState(null);

  // Generate the last 150 days for the heatmap
  const days = useMemo(() => {
    const arr = [];
    const today = new Date();
    for (let i = 150; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayData = data?.find(item => item._id === dateStr) || { _id: dateStr, reviews: 0, mastery: 0 };
      arr.push(dayData);
    }
    return arr;
  }, [data]);

  const getColor = (value) => {
    if (value === 0) return 'bg-gray-100';
    if (viewMode === 'reviews') {
      if (value < 5) return 'bg-[#ffd366]';
      if (value < 15) return 'bg-[#ffb800]';
      return 'bg-black text-[#ffb800]';
    } else {
      if (value < 1) return 'bg-[#ecfdf5]';
      if (value < 3) return 'bg-[#10b981]';
      return 'bg-[#065f46] text-white';
    }
  };

  if (loading) {
    return (
      <div className="w-full h-48 bg-gray-50 border-2 border-dashed border-gray-200 animate-pulse flex items-center justify-center">
        <p className="font-black uppercase text-[10px] tracking-widest text-gray-300">Synchronizing Mastery Patterns...</p>
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className={`p-2 border-2 border-black ${viewMode === 'reviews' ? 'bg-[#ffb800]' : 'bg-[#10b981] text-white'}`}>
            {viewMode === 'reviews' ? <FiActivity className="w-5 h-5" /> : <FiCheckCircle className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="font-black uppercase tracking-tight text-sm">Study Consistency</h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Visualizing {viewMode === 'reviews' ? 'Daily Review Volume' : 'New Mastery Milestones'}
            </p>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex border-2 border-black bg-gray-50 p-1 self-start sm:self-center">
          <button
            onClick={() => setViewMode('reviews')}
            className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
              viewMode === 'reviews' ? 'bg-black text-[#ffb800]' : 'text-gray-400'
            }`}
          >
            Reviews
          </button>
          <button
            onClick={() => setViewMode('mastery')}
            className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
              viewMode === 'mastery' ? 'bg-[#10b981] text-white' : 'text-gray-400'
            }`}
          >
            Mastery
          </button>
        </div>
      </div>

      {/* The Grid */}
      <div className="relative">
        <div className="flex flex-wrap gap-[4px]">
          {days.map((day, idx) => (
            <motion.div
              key={day._id}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.002 }}
              onMouseEnter={() => setHoveredDate(day)}
              onMouseLeave={() => setHoveredDate(null)}
              className={`w-4 h-4 sm:w-5 sm:h-5 border-[1px] border-black/5 cursor-pointer transition-transform hover:scale-125 hover:z-10 ${getColor(day[viewMode])}`}
            />
          ))}
        </div>

        {/* Floating Tooltip */}
        <AnimatePresence>
          {hoveredDate && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute top-[-50px] left-0 bg-black text-white p-2 border-2 border-[#ffb800] text-[10px] font-bold z-50 pointer-events-none"
            >
              <p className="uppercase">{new Date(hoveredDate._id).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
              <p className="text-[#ffb800]">
                {hoveredDate[viewMode]} {viewMode === 'reviews' ? 'Reviews' : 'Mastered'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between mt-6 pt-6 border-t-2 border-gray-50">
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-1">
             <div className="w-3 h-3 bg-gray-100 border-[1px] border-black/5"></div>
             <span className="text-[9px] font-bold text-gray-400 uppercase">None</span>
           </div>
           <div className="flex items-center gap-1">
             <div className={`w-3 h-3 border-[1px] border-black/5 ${viewMode === 'reviews' ? 'bg-[#ffb800]' : 'bg-[#10b981]'}`}></div>
             <span className="text-[9px] font-bold text-gray-400 uppercase">Active</span>
           </div>
           <div className="flex items-center gap-1">
             <div className={`w-3 h-3 border-[1px] border-black/5 ${viewMode === 'reviews' ? 'bg-black' : 'bg-[#065f46]'}`}></div>
             <span className="text-[9px] font-bold text-gray-400 uppercase">Intense</span>
           </div>
        </div>
        <div className="flex items-center gap-1 text-gray-300">
           <FiInfo className="w-3 h-3" />
           <span className="text-[9px] font-bold uppercase italic">Rolling 150-day mastery pattern</span>
        </div>
      </div>
    </div>
  );
};

export default MasteryHeatmap;
