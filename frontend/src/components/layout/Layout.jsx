import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-math-grid w-full overflow-x-hidden font-sans text-black">
      <Header />
      <main className="flex-grow w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col items-center">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
