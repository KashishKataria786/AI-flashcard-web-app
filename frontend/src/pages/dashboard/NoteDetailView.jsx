import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiChevronLeft, FiDownload, FiClock, FiBook, FiPrinter } from 'react-icons/fi';
import { fetchNoteByIdAPI } from '../../api/notes';

const NoteDetailView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNote = async () => {
      try {
        setLoading(true);
        const data = await fetchNoteByIdAPI(id);
        setNote(data);
      } catch (err) {
        console.error('Failed to load note:', err);
      } finally {
        setLoading(false);
      }
    };
    loadNote();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <LoadingSpinner message="Preparing your study guide..." />;
  }

  if (!note) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-black uppercase">Note not found</h2>
        <button onClick={() => navigate('/dashboard/notes')} className="mt-4 underline">Back to Notes</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
      {/* Navigation & Actions */}
      <div className="flex items-center justify-between mb-8 sticky top-0 bg-[#f9fafb]/80 backdrop-blur-md py-4 z-10 border-b border-gray-200">
        <button
          onClick={() => navigate('/dashboard/notes')}
          className="flex items-center gap-2 font-bold text-sm text-gray-700 hover:text-black transition-colors"
        >
          <FiChevronLeft className="w-5 h-5" />
          <span className="uppercase tracking-widest">Back to Library</span>
        </button>

        <div className="flex gap-4">
          <button 
            onClick={handlePrint}
            className="p-3 border-2 border-black hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]"
            title="Print Study Guide"
          >
            <FiPrinter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Note Content */}
      <motion.article 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border-2 border-black p-8 sm:p-16 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] print:shadow-none print:border-none"
      >
        {/* Header Section */}
        <header className="mb-12 border-b-2 border-black pb-8">
          <div className="flex items-center gap-2 text-[#ffb800] mb-4">
            <FiBook className="w-6 h-6" />
            <span className="font-black uppercase tracking-widest text-sm">Comprehensive Study Guide</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-black uppercase leading-tight tracking-tighter mb-6">
            {note.title}
          </h1>
          <div className="flex items-center gap-6 text-gray-400 font-bold uppercase text-[10px] tracking-widest">
            <div className="flex items-center gap-2">
              <FiClock className="w-4 h-4" />
              {new Date(note.createdAt).toLocaleDateString()}
            </div>
            <span>•</span>
            <span>Source: {note.sourceType}</span>
          </div>
        </header>

        {/* Content Section with Premium Typography */}
        <div className="prose prose-slate max-w-none">
          {/* We format the content here. In a real app we'd use react-markdown. 
              For now, we'll split by newlines and add vertical spacing. */}
          <div className="text-gray-800 leading-relaxed space-y-6 font-serif text-lg">
            {note.content.split('\n').map((line, i) => {
              if (line.startsWith('# ')) return <h1 key={i} className="text-4xl font-black text-black uppercase mt-12 mb-6 font-sans tracking-tight">{line.replace('# ', '')}</h1>;
              if (line.startsWith('## ')) return <h2 key={i} className="text-2xl font-black text-black uppercase mt-10 mb-4 font-sans border-l-4 border-[#ffb800] pl-4">{line.replace('## ', '')}</h2>;
              if (line.startsWith('### ')) return <h3 key={i} className="text-xl font-bold text-black uppercase mt-8 mb-3 font-sans">{line.replace('### ', '')}</h3>;
              if (line.startsWith('- ') || line.startsWith('* ')) return <li key={i} className="ml-6 pl-2 list-disc">{line.substring(2)}</li>;
              if (line.trim() === '---') return <hr key={i} className="my-12 border-t-2 border-black border-dashed" />;
              if (!line.trim()) return <div key={i} className="h-4" />;
              
              // Basic Bold formatting with regex
              const parts = line.split(/(\*\*.*?\*\*)/g);
              return (
                <p key={i}>
                  {parts.map((part, index) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                      return <strong key={index} className="font-black text-black bg-[#ffb800]/20 px-1">{part.slice(2, -2)}</strong>;
                    }
                    return part;
                  })}
                </p>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-20 pt-8 border-t border-gray-100 flex justify-between items-center opacity-30 grayscale hover:grayscale-0 transition-all">
          <span className="font-black text-xs tracking-tighter uppercase">Cuemath Flash AI</span>
          <span className="text-[10px] font-bold">End of guide</span>
        </footer>
      </motion.article>
    </div>
  );
};

export default NoteDetailView;
