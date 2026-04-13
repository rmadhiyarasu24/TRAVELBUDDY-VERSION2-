import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden">
      
      {/* Background Image Setup */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('/hero-bg.png')` }}
      >
        {/* Dark / Light Overlays */}
        <div className="absolute inset-0 bg-white/40 dark:bg-neutral-900/60 backdrop-blur-[3px] transition-colors duration-500"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-gray-50 via-transparent to-transparent dark:from-neutral-900 transition-colors duration-500"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center animate-fade-in-up">
        
        <div className="inline-flex flex-col md:flex-row items-center gap-2 px-6 py-3 rounded-full bg-white/80 dark:bg-black/30 border border-gray-200 dark:border-white/10 text-orange-600 dark:text-orange-400 text-sm font-bold mb-10 shadow-lg backdrop-blur-md animate-float">
          <span className="relative flex h-3 w-3 mr-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
          </span>
          Next-Generation AI Travel Advisor
        </div>

        <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-6 text-gray-900 dark:text-white drop-shadow-sm">
          Plan Your Next <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 drop-shadow-xl">
            Dream Adventure
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-12 max-w-3xl leading-relaxed font-medium drop-shadow-md">
          Stop worrying about the details. Get hyper-personalized itineraries, curated food spots, 
          transport tips, and smart budget breakdowns in seconds.
        </p>

        <div className="flex flex-col sm:flex-row gap-6">
          <button
            onClick={() => navigate("/planner")}
            className="px-10 py-5 bg-orange-500 dark:bg-orange-500 text-white dark:text-white rounded-2xl font-black text-xl hover:bg-orange-600 dark:hover:bg-orange-600 transition-all shadow-2xl shadow-orange-500/30 hover:-translate-y-1 active:scale-95 border-2 border-transparent"
          >
            Start Planning Now 🌍
          </button>
          
          <button
            onClick={() => navigate("/auth")}
            className="px-10 py-5 bg-white/50 dark:bg-black/20 border-2 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white rounded-2xl font-bold text-xl hover:bg-white/80 dark:hover:bg-white/10 transition-all hover:-translate-y-1 active:scale-95 backdrop-blur-sm"
          >
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
}