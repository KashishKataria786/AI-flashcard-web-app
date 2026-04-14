import { motion } from 'framer-motion';

const LoadingSpinner = ({ message = "Loading content..." }) => {
  return (
    <div className="flex flex-col items-center justify-center p-20 gap-6 w-full h-full min-h-[400px]">
      <div className="relative">
        {/* Outer Ring */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          className="w-16 h-16 border-4 border-dashed border-gray-200 rounded-full"
        />
        {/* Inner Spinner */}
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="absolute top-0 left-0 w-16 h-16 border-4 border-t-[#ffb800] border-transparent rounded-full"
        />
        {/* Center Dot */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-black border-2 border-[#ffb800]" />
      </div>
      
      <div className="space-y-1 text-center">
        <p className="font-black uppercase tracking-[0.2em] text-xs text-black animate-pulse">
          {message}
        </p>
        <div className="flex gap-1 justify-center">
          <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0 }} className="w-1 h-1 bg-[#ffb800]" />
          <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1 h-1 bg-[#ffb800]" />
          <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1 h-1 bg-[#ffb800]" />
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
