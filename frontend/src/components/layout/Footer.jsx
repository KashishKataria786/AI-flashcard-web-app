const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-6 mt-auto">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center">
          <span className="font-extrabold text-xl text-black tracking-tight">
            CUEMATH
          </span>
        </div>
        
        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">
          &copy; {new Date().getFullYear()} Cuemath Platform. All rights reserved.
        </p>
        
        <div className="flex gap-6">
          <a href="#" className="text-xs font-bold text-black uppercase tracking-wider hover:text-gray-600 transition-colors">Terms</a>
          <a href="#" className="text-xs font-bold text-black uppercase tracking-wider hover:text-gray-600 transition-colors">Privacy</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
