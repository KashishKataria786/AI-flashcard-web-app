import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHome, FiLayers, FiPieChart, FiSettings, FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import {NAV_ITEMS} from '../../utils/utils';


const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { logout } = useAuth() || {}; // Optional chaining if useAuth is null
  const navigate = useNavigate();

  const handleLogout = () => {
    if (logout) {
      logout();
    } else {
      navigate('/login');
    }
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex h-screen w-full bg-[#f9fafb] font-sans overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSidebar}
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Content */}
      <motion.aside
        className={`fixed inset-y-0 left-0 bg-white z-50 w-64 flex flex-col transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static border-r border-gray-200 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-[72px] px-6 border-b border-gray-200">
          <span className="font-extrabold text-2xl tracking-tight text-black">
            CUEMATH <span className="text-[#ffb800] tracking-normal">FLASH</span>
          </span>
          <button onClick={closeSidebar} className="lg:hidden text-black hover:text-gray-600">
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.end}
              onClick={closeSidebar}
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-3 transition-colors font-bold text-sm ${
                  isActive
                    ? 'bg-[#ffb800] text-black border-2 border-black'
                    : 'text-gray-700 hover:bg-gray-100 border-2 border-transparent hover:border-gray-300'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-black' : 'text-gray-500 group-hover:text-black'}`} />
                  {item.name}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 px-4 py-3 w-full text-left font-bold text-sm text-gray-700 hover:bg-gray-100 border-2 border-transparent hover:border-black transition-colors"
          >
            <FiLogOut className="w-5 h-5 text-gray-500" />
            <span className="uppercase tracking-wide">Log Out</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative bg-math-grid">
        {/* Mobile Header */}
        <header className="lg:hidden h-[72px] bg-white border-b border-gray-200 flex items-center px-4 shrink-0">
          <button
            onClick={toggleSidebar}
            className="p-2 text-black hover:bg-gray-100 transition-colors mr-3"
          >
            <FiMenu className="w-6 h-6" />
          </button>
          <span className="font-extrabold text-xl tracking-tight text-black">
            CUEMATH FLASH
          </span>
        </header>

        {/* Scrollable Canvas for Inner Pages */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto w-full">
          <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 h-full">
             <motion.div
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.4 }}
               className="h-full"
             >
                <Outlet />
             </motion.div>
          </div>
        </main>
      </div>

    </div>
  );
};

export default DashboardLayout;
