import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="w-full flex justify-center items-center py-32 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg bg-white border border-gray-200 text-center relative">
        {/* Top Accent Header */}
        <div className="w-full h-2 bg-[#ffb800]"></div>

        <div className="p-12">
          <h1 className="text-8xl font-extrabold text-black mb-4">404</h1>
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight mb-2">
            Page Not Found
          </h2>
          <p className="text-gray-500 font-medium mb-10">
            The page you are looking for has been moved or doesn't exist. Let's get you back on track.
          </p>

          <Link
            to="/"
            className="inline-flex justify-center px-8 py-4 bg-black text-white hover:bg-gray-800 font-bold uppercase tracking-wide transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
