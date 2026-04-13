import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-[72px] items-center">
          {/* Logo Section */}
          <div className="flex-shrink-0 flex items-center h-full">
            <Link to="/" className="flex items-center">
              <span className="font-extrabold text-2xl tracking-tight text-black">
                CUEMATH
              </span>
            </Link>
          </div>

          <nav className="hidden md:flex space-x-8 lg:space-x-12 ml-10">
            <a href="#" className="text-sm font-bold text-black hover:text-gray-600 transition-colors">Math Classes</a>
            <a href="#" className="text-sm font-bold text-black hover:text-gray-600 transition-colors">Pricing</a>
            <a href="#" className="text-sm font-bold text-black hover:text-gray-600 transition-colors">Resources</a>
            <a href="#" className="text-sm font-bold text-black hover:text-gray-600 transition-colors">About Us</a>
            <a href="#" className="text-sm font-bold text-black hover:text-gray-600 transition-colors">Become a Tutor</a>
          </nav>

          {/* User Auth Section */}
          <div className="flex items-center h-full ml-auto">
            {user ? (
              <div className="flex items-center space-x-4 h-full">
                <span className="text-black font-bold hidden sm:block">
                  {user.name.split(" ")[0]}
                </span>
                <button
                  onClick={logout}
                  className="h-full px-6 flex items-center justify-center text-sm font-bold text-black border-l border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  Log out
                </button>
              </div>
            ) : (
              <div className="flex items-center h-full">
                <Link
                  to="/login"
                  className="hidden sm:flex h-full items-center px-6 text-sm font-bold text-black hover:bg-gray-50 transition-colors border-l border-gray-200"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="h-full flex items-center px-8 text-sm font-bold text-black bg-[#ffb800] hover:bg-[#e6a600] transition-colors border-l border-gray-200 border-r"
                >
                  Get started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
