import { Route, Routes } from "react-router-dom";
import "./App.css";
import HomePage from "./pages/landingpage/HomePage.jsx";
import NotFound from "./pages/common/NotFound.jsx";
import LoginPage from "./pages/auth/LoginPage.jsx";
import SignupPage from "./pages/auth/SignupPage.jsx";
import ProtectedRoute from "./components/common/ProtectedRoute.jsx";
import Layout from "./components/layout/Layout.jsx";
// Dashboard Imports
import DashboardLayout from "./components/layout/DashboardLayout.jsx";
import OverviewPage from "./pages/dashboard/OverviewPage.jsx";
import FlashcardsPage from "./pages/dashboard/FlashcardsPage.jsx";
import PlaceholderPage from "./pages/dashboard/PlaceholderPage.jsx";

function App() {
  return (
    <>
      <Routes>
        {/* Everything inside this Layout route gets the Header and Footer */}
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<SignupPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Dashboard Routes (Protected) */}
        {/* Temporarily omitting ProtectedRoute wrapper to make it easy to view, or we can use it if it just verifies token. Assuming the user wants to see it, I'll wrap it in ProtectedRoute if it's already functional, but I'll let the user decide. Actually, let's wrap it in ProtectedRoute since it was commented out in the original file. */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<OverviewPage />} />
          <Route path="flashcards" element={<FlashcardsPage />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
