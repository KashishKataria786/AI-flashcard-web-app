import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const SignupPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await register(name, email, password);
      navigate("/login");
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full flex justify-center items-center py-20 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white border border-gray-200">
        
        {/* Top Accent Header */}
        <div className="w-full h-2 bg-[#ffb800]"></div>

        <div className="p-10">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-black tracking-tight">
              Get Started
            </h2>
            <p className="mt-3 text-sm font-bold text-gray-500 uppercase tracking-widest">
              Join Cuemath today
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-bold text-black mb-2 uppercase tracking-wide"
              >
                Full Name
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="appearance-none block w-full px-4 py-4 border border-gray-300 placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black font-medium transition duration-200"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-bold text-black mb-2 uppercase tracking-wide"
              >
                Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-4 py-4 border border-gray-300 placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black font-medium transition duration-200"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-bold text-black mb-2 uppercase tracking-wide"
              >
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-4 py-4 border border-gray-300 placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black font-medium transition duration-200"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex justify-center py-4 px-4 text-base font-bold text-black transition-colors ${
                  isSubmitting
                    ? "bg-[#fedc80] cursor-not-allowed"
                    : "bg-[#ffb800] hover:bg-[#e6a600]"
                }`}
              >
                {isSubmitting ? "Creating Profile..." : "Get Started"}
              </button>
            </div>
          </form>

          <div className="mt-10 text-center border-t border-gray-100 pt-8">
            <p className="text-sm font-bold text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-black underline decoration-2 underline-offset-4 hover:text-[#ffb800] transition-colors"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
