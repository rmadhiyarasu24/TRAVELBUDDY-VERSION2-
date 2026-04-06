import { useState } from "react";
import { supabase } from "../supabase";
import { useNavigate } from "react-router-dom";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert("Check your email for the confirmation link!");
      }
      navigate("/planner");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 relative overflow-hidden bg-gray-50 dark:bg-neutral-900">
      
      {/* Background flares */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-400/30 dark:bg-indigo-600/20 blur-[100px] rounded-full mix-blend-multiply dark:mix-blend-screen pointer-events-none animate-float"></div>
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-400/30 dark:bg-purple-600/20 blur-[100px] rounded-full mix-blend-multiply dark:mix-blend-screen pointer-events-none animate-float" style={{animationDelay: '2s'}}></div>

      <div className="w-full max-w-md relative z-10 animate-fade-in-up">
        <div className="backdrop-blur-xl bg-white/70 dark:bg-neutral-800/50 border border-gray-200 dark:border-white/10 p-10 rounded-3xl shadow-2xl">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-3">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {isLogin ? "Enter your credentials to continue" : "Sign up and save your trips forever"}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white dark:bg-neutral-900/50 border border-gray-300 dark:border-white/10 rounded-xl px-4 py-4 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-inner"
                placeholder="you@example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white dark:bg-neutral-900/50 border border-gray-300 dark:border-white/10 rounded-xl px-4 py-4 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-inner"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl transition-all shadow-xl shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed mt-4 transform hover:-translate-y-1 active:scale-95"
            >
              {loading ? "Please wait..." : (isLogin ? "Sign In" : "Sign Up")}
            </button>
          </form>

          <div className="mt-8 text-center pt-6 border-t border-gray-200 dark:border-white/10">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-white transition-colors text-sm font-semibold hover:underline"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}