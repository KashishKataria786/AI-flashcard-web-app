const PlaceholderPage = ({ title, description }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh]">
      <div className="text-center max-w-md">
        <h1 className="text-3xl font-bold text-slate-800 mb-4">{title}</h1>
        <p className="text-slate-500">{description}</p>
        <div className="mt-8 p-6 bg-white rounded-2xl shadow-sm border border-slate-100 italic text-slate-400">
          This area is under construction. Check back soon for updates!
        </div>
      </div>
    </div>
  );
};

export default PlaceholderPage;
