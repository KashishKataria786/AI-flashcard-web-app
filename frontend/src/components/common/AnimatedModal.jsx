import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- 1. Animation Variants ---

const backdropVariants = {
  visible: { opacity: 1 },
  hidden: { opacity: 0 },
};

const modalVariants = {
  hidden: {
    y: '-100px',
    opacity: 0,
    scale: 0.9,
  },
  visible: {
    y: '0',
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
    },
  },
  exit: {
    y: '50px',
    opacity: 0,
    transition: {
        duration: 0.2
    }
  }
};


// --- 2. Main Modal Component ---

const AnimatedModal = ({ isOpen, handleClose, children, title, footer }) => {
  const modalRef = useRef(null);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        // Backdrop adjusted for translucent white
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center  backdrop-blur-sm p-4 overflow-y-auto"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={handleBackdropClick}
        >
          {/* Modal Content */}
          <motion.div
            ref={modalRef}
            className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-2xl mx-auto transform transition-all"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b-2 border-black bg-[#ffb800]">
              <h3 className="text-xl font-black text-black uppercase tracking-tight">{title || 'Modal Title'}</h3>
              <button
                onClick={handleClose}
                className="text-black hover:bg-black hover:text-white transition-colors duration-150 p-1 border-2 border-black"
                aria-label="Close modal"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-0">
              {children}
            </div>

            {/* Modal Footer (Optional) */}
            {footer && (
                <div className="p-5 border-t-2 border-black flex justify-end space-x-3">
                    {footer}
                </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AnimatedModal;