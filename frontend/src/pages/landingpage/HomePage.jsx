import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const HomePage = () => {
  const { token, loading } = useAuth();

  // If auth is resolved and user is logged in, redirect to dashboard
  if (!loading && token) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="w-full flex justify-center py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full text-center">
        
        {/* Main Hero Section replicating Cuemath */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-black tracking-tight mb-6">
          Community of 200,000+ MathFit Kids
        </h1>
        
        <p className="text-lg sm:text-xl text-gray-700 font-medium mb-12">
          Heartfelt stories of transformations, learnings, and achievements of cuemath students!
        </p>

        <div className="flex justify-center mb-24">
          {token ? (
            <Link
              to="/dashboard"
              className="px-8 py-4 bg-[#ffb800] hover:bg-[#e6a600] text-black font-bold text-lg uppercase tracking-wide border-2 border-transparent hover:border-black transition-all"
            >
              Go to Dashboard
            </Link>
          ) : (
            <Link
              to="/register"
              className="px-8 py-4 bg-[#ffb800] hover:bg-[#e6a600] text-black font-bold text-lg uppercase tracking-wide border-2 border-transparent hover:border-black transition-all"
            >
              Get Started
            </Link>
          )}
        </div>

        {/* Mock Content Grid below Hero */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          <div className="bg-[#e0f7fa] p-8 border border-gray-200 text-left relative overflow-hidden transition-transform hover:-translate-y-1 hover:shadow-lg">
            <span className="absolute top-4 right-4 bg-white px-2 py-1 text-xs font-bold uppercase border border-gray-200">
              ELIN LUNA
            </span>
            <div className="mb-4">
              <svg className="w-8 h-8 opacity-20" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" /></svg>
            </div>
            <h3 className="text-xl font-bold text-black mb-2">Thriving in School, State Tests, and Accelerated...</h3>
            <p className="text-gray-600 text-sm font-medium">Elin went from struggling with basics to topping her class. A remarkable journey of dedication.</p>
          </div>

          <div className="bg-white p-8 border border-gray-200 text-left relative overflow-hidden transition-transform hover:-translate-y-1 hover:shadow-lg">
            <span className="absolute top-4 right-4 bg-gray-100 px-2 py-1 text-xs font-bold uppercase border border-gray-200">
              FEATURED
            </span>
            <div className="w-full h-32 bg-gray-100 mb-6 flex items-center justify-center">
               <span className="text-gray-400 font-bold">Image Placeholder</span>
            </div>
            <h3 className="text-xl font-bold text-black mb-2">Confidence built systematically</h3>
            <p className="text-gray-600 text-sm font-medium">"My son starts his homework without me asking now. Incredible results."</p>
          </div>

          <div className="bg-white p-8 border border-gray-200 text-left relative overflow-hidden transition-transform hover:-translate-y-1 hover:shadow-lg">
            <div className="w-full h-32 bg-gray-100 mb-6 flex items-center justify-center">
               <span className="text-gray-400 font-bold">Image Placeholder</span>
            </div>
            <h3 className="text-xl font-bold text-black mb-2">Acing the logic puzzles</h3>
            <p className="text-gray-600 text-sm font-medium">Building spatial awareness and strong foundational math reasoning.</p>
          </div>

        </div>

      </div>
    </div>
  );
};

export default HomePage;
