// src/components/study/DeckDropzone.jsx
import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUploadCloud, FiFile, FiX, FiZap, FiCheckCircle, FiAlertCircle, FiType } from 'react-icons/fi';
import { uploadPDFAPI, uploadTextAPI, parsePDFOnlyAPI } from '../../api/decks';

const CARD_COUNTS = [10, 20 ];

const DeckDropzone = ({ onDeckCreated }) => {
  const [inputType, setInputType] = useState('pdf'); // 'pdf' | 'text'
  const [file, setFile] = useState(null);
  const [text, setText] = useState('');
  const [deckTitle, setDeckTitle] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [targetCount, setTargetCount] = useState(20);
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [statusMessage, setStatusMessage] = useState('');
  const [breakdown, setBreakdown] = useState(null);
  const inputRef = useRef(null);

  const extractTextAndSwitch = async (f) => {
    setStatus('loading');
    setStatusMessage('Auto-extracting text from PDF...');
    
    setFile(f); // Temporarily show the file as loading

    try {
      const result = await parsePDFOnlyAPI(f);
      setText(result.parsedData);
      setDeckTitle(result.title || f.name.replace(/\.pdf$/i, ''));
      setInputType('text'); // Auto-switch to text mode
      setStatus('idle');
      setStatusMessage('');
      setFile(null); // Release the PDF so the submission relies purely on the extracted text
    } catch (err) {
      setStatus('error');
      setStatusMessage(err.message || 'Auto-extraction failed. Please try again.');
      setFile(null);
    }
  };

  const handleFile = useCallback((f) => {
    if (!f || f.type !== 'application/pdf') {
      setStatus('error');
      setStatusMessage('Only PDF files are accepted.');
      return;
    }
    setBreakdown(null);
    extractTextAndSwitch(f);
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    handleFile(dropped);
  }, [handleFile]);

  const onDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = () => setIsDragging(false);

  const handleSubmit = async () => {
    // If somehow a PDF sits here unextracted, don't allow submit
    if (inputType === 'pdf' && !file) return;
    if (inputType === 'text' && text.trim().length < 50) {
      setStatus('error');
      setStatusMessage('Please enter at least 50 characters.');
      return;
    }

    setStatus('loading');
    setStatusMessage(`Generating cards with AI...`);
    try {
      let result;
      if (inputType === 'pdf') {
         // Fallback just in case, but usually we've already transitioned to Text
        result = await uploadPDFAPI(file, targetCount, deckTitle || file.name.replace(/\.pdf$/i, ''));
      } else {
        result = await uploadTextAPI(text, targetCount, deckTitle || 'Text Generation Deck');
      }

      setStatus('success');
      setBreakdown(result.breakdown);
      setStatusMessage(`"${result.deck.title}" created with ${result.totalCards} cards!`);
      if (onDeckCreated) onDeckCreated(result);
    } catch (err) {
      setStatus('error');
      setStatusMessage(err.message || 'Something went wrong. Please try again.');
    }
  };

  const reset = () => {
    setFile(null);
    setText('');
    setDeckTitle('');
    setStatus('idle');
    setStatusMessage('');
    setBreakdown(null);
  };

  return (
    <div className="bg-white border-2 border-black p-6 sm:p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 pb-4 border-b-2 border-black">
        <div className="w-10 h-10 bg-[#ffb800] border-2 border-black flex items-center justify-center shrink-0">
          <FiZap className="w-5 h-5 text-black" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-black uppercase tracking-tight">Generate Deck</h2>
          <p className="text-sm font-medium text-gray-600">From PDF notes or raw text</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {status === 'success' ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center text-center py-8 gap-4"
          >
            <div className="w-16 h-16 bg-[#ffb800] border-2 border-black flex items-center justify-center">
              <FiCheckCircle className="w-8 h-8 text-black" />
            </div>
            <p className="text-xl font-extrabold text-black">{statusMessage}</p>
            {breakdown && (
              <div className="flex gap-4 mt-1">
                <span className="px-3 py-1 border-2 border-black bg-[#ffb800] text-black text-xs font-bold uppercase">
                  {breakdown.memorize} Memorize
                </span>
                <span className="px-3 py-1 border-2 border-black bg-black text-white text-xs font-bold uppercase">
                  {breakdown.qa} Q&A
                </span>
              </div>
            )}
            <button onClick={reset} className="mt-4 px-6 py-2 border-2 border-black text-sm font-bold uppercase hover:bg-gray-100 transition-colors">
              Create Another
            </button>
          </motion.div>
        ) : (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
            {/* Type Selector */}
            <div className="flex gap-2 mb-2">
              <button
                onClick={() => { setInputType('pdf'); setStatus('idle'); }}
                className={`flex-1 py-2 font-bold text-xs uppercase tracking-widest border-2 transition-all flex items-center justify-center gap-2 ${
                  inputType === 'pdf' ? 'border-black bg-[#ffb800] text-black' : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-200'
                }`}
              >
                <FiUploadCloud className="w-4 h-4" /> Upload PDF
              </button>
              <button
                onClick={() => { setInputType('text'); setStatus('idle'); }}
                className={`flex-1 py-2 font-bold text-xs uppercase tracking-widest border-2 transition-all flex items-center justify-center gap-2 ${
                  inputType === 'text' ? 'border-black bg-[#ffb800] text-black' : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-200'
                }`}
              >
                <FiType className="w-4 h-4" /> Paste Text
              </button>
            </div>

            {/* Input Selection Content */}
            {inputType === 'pdf' ? (
              <div
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onClick={() => !file && inputRef.current?.click()}
                className={`relative border-2 border-dashed transition-all cursor-pointer py-10 flex flex-col items-center justify-center gap-3 ${
                  isDragging
                    ? 'border-[#ffb800] bg-[#fffbea]'
                    : file
                    ? 'border-black bg-gray-50'
                    : 'border-gray-300 hover:border-black hover:bg-gray-50'
                }`}
              >
                <input ref={inputRef} type="file" accept=".pdf" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
                {file ? (
                  <div className="flex items-center gap-3 px-4">
                    <FiFile className="w-8 h-8 text-black shrink-0" />
                    <div className="text-left min-w-0">
                      <p className="font-bold text-black text-sm truncate max-w-[200px] sm:max-w-xs">{file.name}</p>
                      <p className="text-xs text-gray-500 font-medium">{(file.size / 1024).toFixed(0)} KB</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setFile(null); }}
                      className="ml-auto w-7 h-7 border-2 border-black flex items-center justify-center hover:bg-black hover:text-white transition-colors shrink-0"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <FiUploadCloud className={`w-12 h-12 ${isDragging ? 'text-[#ffb800]' : 'text-gray-400'}`} />
                    <p className="text-sm font-bold text-gray-600 text-center px-4">
                      Drag & drop a PDF here, or <span className="text-black underline underline-offset-2">click to browse</span>
                    </p>
                    <p className="text-xs text-gray-400 font-medium">Max 20MB — textbooks, notes, slides</p>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 tracking-widest mb-1">Deck Title (Optional)</label>
                  <input
                    type="text"
                    value={deckTitle}
                    onChange={(e) => setDeckTitle(e.target.value)}
                    placeholder="e.g. History Chapter 4"
                    className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-4 focus:ring-[#ffb800]/50 font-bold text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 tracking-widest mb-1">Raw Text</label>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Paste your notes, articles, or text here..."
                    className="w-full h-40 px-4 py-3 border-2 border-black focus:outline-none focus:ring-4 focus:ring-[#ffb800]/50 font-medium text-sm resize-none"
                  ></textarea>
                  <div className="text-right mt-1">
                    <span className={`text-xs font-bold ${text.length < 50 ? 'text-red-500' : 'text-green-600'}`}>
                      {text.length} characters (min 50)
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Card Count Selector */}
            <div>
              <p className="text-xs font-bold uppercase text-gray-500 tracking-widest mb-3">Number of Cards</p>
              <div className="flex gap-3">
                {CARD_COUNTS.map((n) => (
                  <button
                    key={n}
                    onClick={() => setTargetCount(n)}
                    className={`flex-1 py-3 border-2 font-bold text-sm transition-all ${
                      targetCount === n
                        ? 'border-black bg-[#ffb800] text-black'
                        : 'border-gray-200 text-gray-600 hover:border-black hover:bg-gray-50'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {status === 'error' && (
              <div className="flex items-center gap-2 bg-red-50 border-2 border-red-500 px-4 py-3">
                <FiAlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                <p className="text-sm font-bold text-red-600">{statusMessage}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={(inputType === 'pdf' && !file) || (inputType === 'text' && text.trim().length < 50) || status === 'loading'}
              className={`w-full py-4 font-extrabold text-sm uppercase tracking-widest border-2 border-black transition-all flex items-center justify-center gap-2 ${
                ((inputType === 'pdf' && !file) || (inputType === 'text' && text.trim().length < 50) || status === 'loading')
                  ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                  : 'bg-[#ffb800] text-black hover:bg-black hover:text-[#ffb800]'
              }`}
            >
              {status === 'loading' ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <FiZap className="w-4 h-4" />
                  Generate {targetCount} Flashcards
                </>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DeckDropzone;
