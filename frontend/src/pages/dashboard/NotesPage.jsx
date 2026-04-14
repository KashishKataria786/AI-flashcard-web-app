import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiFileText, FiTrash2, FiExternalLink, FiUpload, FiType } from 'react-icons/fi';
import AnimatedModal from '../../components/common/AnimatedModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { fetchNotesAPI, generateNoteFromPDFAPI, generateNoteFromTextAPI, deleteNoteAPI } from '../../api/notes';
import { parsePDFOnlyAPI } from '../../api/decks';

const NotesPage = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadType, setUploadType] = useState('pdf'); // 'pdf' | 'text'
  const [isGenerating, setIsGenerating] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [sourceText, setSourceText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  
  const navigate = useNavigate();

  const loadNotes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchNotesAPI();
      setNotes(data || []);
    } catch (err) {
      console.error('Failed to load notes:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const handleParsePDF = async () => {
    if (!selectedFile) return;
    try {
      setIsParsing(true);
      const data = await parsePDFOnlyAPI(selectedFile);
      setSourceText(data.parsedData);
      if (!noteTitle) setNoteTitle(selectedFile.name.replace(/\.pdf$/i, ''));
      setUploadType('text'); // Switch to text view for review
    } catch (err) {
      alert('Parsing failed: ' + err.message);
    } finally {
      setIsParsing(false);
    }
  };

  const handleGenerateNote = async (e) => {
    e.preventDefault();
    try {
      setIsGenerating(true);
      
      if (uploadType === 'pdf') {
        if (!selectedFile) return alert('Please select a PDF file first');
        await generateNoteFromPDFAPI(selectedFile, noteTitle);
      } else {
        if (!sourceText || sourceText.length < 100) {
          return alert('Please provide at least 100 characters of text (or extract from PDF first).');
        }
        await generateNoteFromTextAPI(sourceText, noteTitle);
      }
      
      setShowUpload(false);
      setNoteTitle('');
      setSourceText('');
      setSelectedFile(null);
      await loadNotes();
    } catch (err) {
      alert('Generation failed: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteNote = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await deleteNoteAPI(id);
      await loadNotes();
    } catch (err) {
      alert('Deletion failed: ' + err.message);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-end justify-between gap-6 pb-6 border-b-2 border-black">
        <div>
          <h1 className="text-4xl sm:text-5xl font-black text-black tracking-tight uppercase mb-2">
            Study Notes
          </h1>
          <p className="text-base font-medium text-gray-600">
            Comprehensive AI-generated study guides for deep understanding.
          </p>
        </div>
        
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 px-6 py-3 bg-black text-[#ffb800] border-2 border-black font-black text-sm uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(255,184,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(255,184,0,1)] transition-all"
        >
          <FiPlus className="w-4 h-4" />
          New Note
        </button>
      </div>

      {/* Notes List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full">
            <LoadingSpinner message="Retrieving study guides..." />
          </div>
        ) : notes.length === 0 ? (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-200">
            <FiFileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="font-bold text-gray-500 uppercase tracking-widest text-sm">No study notes yet</p>
          </div>
        ) : (
          notes.map((note) => (
            <motion.div
              key={note._id}
              whileHover={{ y: -4 }}
              className="bg-white border-2 border-black p-6 flex flex-col gap-4 group"
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 bg-black text-[#ffb800] border-2 border-black flex items-center justify-center">
                  <FiFileText className="w-5 h-5" />
                </div>
                <button
                  onClick={() => handleDeleteNote(note._id, note.title)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>

              <div>
                <h3 className="font-extrabold text-black text-lg leading-tight uppercase line-clamp-2">
                  {note.title}
                </h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                  Generated {new Date(note.createdAt).toLocaleDateString()} • {note.sourceType}
                </p>
              </div>

              <button
                onClick={() => navigate(`/dashboard/notes/${note._id}`)}
                className="mt-auto w-full py-3 bg-[#ffb800] text-black font-extrabold text-xs uppercase tracking-widest border-2 border-black hover:bg-black hover:text-[#ffb800] transition-all flex items-center justify-center gap-2"
              >
                Read Notes
                <FiExternalLink className="w-4 h-4" />
              </button>
            </motion.div>
          ))
        )}
      </div>

      {/* Generation Modal */}
      <AnimatedModal
        isOpen={showUpload}
        handleClose={() => !isGenerating && !isParsing && setShowUpload(false)}
        title="Generate Study Notes"
      >
        <div className="p-4 space-y-6">
          {/* Type Toggle */}
          <div className="flex border-2 border-black overflow-hidden bg-gray-50 p-1">
            <button
              onClick={() => setUploadType('pdf')}
              className={`flex-1 py-3 flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest transition-all ${
                uploadType === 'pdf' ? 'bg-black text-[#ffb800]' : 'text-gray-400 hover:text-black'
              }`}
            >
              <FiUpload className="w-4 h-4" />
              PDF Upload
            </button>
            <button
              onClick={() => setUploadType('text')}
              className={`flex-1 py-3 flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest transition-all ${
                uploadType === 'text' ? 'bg-black text-[#ffb800]' : 'text-gray-400 hover:text-black'
              }`}
            >
              <FiType className="w-4 h-4" />
              Raw Text
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest mb-2 text-black">
                Note Title (Optional)
              </label>
              <input
                type="text"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                placeholder="e.g. Calculus Basics"
                className="w-full p-4 border-2 border-black bg-white focus:ring-0 outline-none text-sm font-bold"
              />
            </div>

            {uploadType === 'pdf' ? (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-black p-8 text-center bg-gray-50">
                  <FiUpload className="w-8 h-8 mx-auto mb-4 text-gray-400" />
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                    className="hidden"
                    id="pdf-upload"
                  />
                  <label
                    htmlFor="pdf-upload"
                    className="cursor-pointer font-black text-xs uppercase tracking-widest underline hover:text-[#ffb800]"
                  >
                    {selectedFile ? selectedFile.name : 'Select PDF File'}
                  </label>
                  <p className="text-[10px] text-gray-400 font-bold mt-2 uppercase">Max 20MB</p>
                </div>
                
                {selectedFile && (
                  <button
                    onClick={handleParsePDF}
                    disabled={isParsing || isGenerating}
                    className="w-full py-3 border-2 border-black bg-white text-black font-black text-xs uppercase tracking-widest hover:bg-[#ffb800] transition-colors flex items-center justify-center gap-2"
                  >
                    {isParsing ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Extracting Content...
                      </>
                    ) : 'Verify Content in Text Editor'}
                  </button>
                )}
              </div>
            ) : (
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest mb-2 text-black">
                   {sourceText ? "Review & Edit Extracted Text" : "Paste Study Material"}
                </label>
                <textarea
                  value={sourceText}
                  onChange={(e) => setSourceText(e.target.value)}
                  placeholder="Paste your text here or use PDF upload to extract..."
                  className="w-full h-48 p-4 border-2 border-black bg-white focus:ring-0 outline-none text-sm font-medium resize-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]"
                />
              </div>
            )}
          </div>

          <button
            onClick={handleGenerateNote}
            disabled={isGenerating || isParsing}
            className={`w-full py-4 border-2 border-black flex items-center justify-center gap-3 font-black uppercase tracking-widest transition-all ${
              isGenerating || isParsing
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-black text-[#ffb800] hover:bg-white hover:text-black'
            }`}
          >
            {isGenerating ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                >
                  <FiPlus className="w-5 h-5 text-[#ffb800]" />
                </motion.div>
                AI is Studying...
              </>
            ) : (
              <>{sourceText ? "Generate Guide from Text" : "Pending Verification..."}</>
            )}
          </button>
        </div>
      </AnimatedModal>
    </div>
  );
};

export default NotesPage;
