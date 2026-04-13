import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";

export default function Navbar() {
  const { user, signOut } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-lg bg-white/80 dark:bg-neutral-900/80 border-b border-gray-200 dark:border-white/10 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <div className="flex-shrink-0 animate-fade-in-up">
            <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
              <img src="/logo.png" alt="TravelBuddy Logo" className="h-12 w-12 md:h-14 md:w-14 object-contain rounded-full shadow-sm" />
              <span className="hidden sm:block text-2xl md:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-amber-500 tracking-tight">
                TravelBuddy
              </span>
            </Link>
          </div>
          
          <div className="flex items-center gap-6">
            
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {isDark ? "☀️" : "🌙"}
            </button>

            <Link to="/planner" className="text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-white font-medium transition-colors">
              Planner
            </Link>
            
            {user ? (
              <>
                <Link to="/history" className="text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-white font-medium transition-colors">
                  My Trips
                </Link>
                <button
                  onClick={signOut}
                  className="bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 text-gray-800 dark:text-white px-4 py-2 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 hover:-translate-y-0.5"
                >
                  Log out
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                className="bg-orange-500 hover:bg-orange-400 text-white px-5 py-2 rounded-lg font-semibold transition-all shadow-lg shadow-orange-500/30 hover:-translate-y-0.5 hover:shadow-orange-500/50"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}