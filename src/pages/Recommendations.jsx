import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../supabase";

const OptionCard = ({ icon, label, selected, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex-shrink-0 flex items-center justify-center gap-2 px-6 h-12 rounded-full border-2 transition-all duration-300 ${
      selected 
        ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/20 shadow-md shadow-orange-500/20 scale-105' 
        : 'border-gray-200 dark:border-white/10 bg-white dark:bg-neutral-800 hover:border-gray-300 dark:hover:border-white/20'
    }`}
  >
    <span className="text-xl drop-shadow-sm">{icon}</span>
    <span className={`text-sm font-bold whitespace-nowrap ${selected ? 'text-orange-700 dark:text-orange-300' : 'text-gray-600 dark:text-gray-300'}`}>
      {label}
    </span>
  </button>
);

export default function Recommendations() {
  const { user } = useAuth();
  
  // Basic Info
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState("");
  const [budget, setBudget] = useState("");
  
  // Hyper-Personalized Info
  const [routePreference, setRoutePreference] = useState("Destination Only");
  const [travelStyle, setTravelStyle] = useState("Any");
  const [companions, setCompanions] = useState("Solo");
  const [groupSize, setGroupSize] = useState(1);
  const [groupDetails, setGroupDetails] = useState("");
  const [diet, setDiet] = useState("Any");
  const [pace, setPace] = useState("Moderate");
  const [transportMode, setTransportMode] = useState("Flight");
  
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);

  const getLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await res.json();
        const city = data.address.city || data.address.town || data.address.village || data.address.state_district;
        if (city) setOrigin(city);
        else alert("Could not fetch city from location.");
      } catch (err) {
        console.error(err);
        alert("Failed to reverse geocode location.");
      } finally {
        setLocating(false);
      }
    }, () => {
      setLocating(false);
      alert("Unable to retrieve your location");
    });
  };

  const generatePlan = async (e) => {
    e.preventDefault();
    if (!origin || !destination || !days || !budget || Number(days) <= 0) {
      alert("Please enter valid details (origin, destination, days > 0)");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("http://localhost:5000/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin, destination, days: Number(days), budget: Number(budget),
          travelStyle, companions, diet, pace, transportMode, routePreference,
          groupSize: (companions === "Family" || companions === "Friends") ? Number(groupSize) : (companions === "Couple" ? 2 : 1),
          groupDetails: (companions === "Family" || companions === "Friends") ? groupDetails : (companions === "Couple" ? "2 people" : "1 person")
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to generate plan");
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error(error);
      alert(error.message || "Error generating plan. Is the backend server running?");
    } finally {
      setLoading(false);
    }
  };

  const saveTrip = async () => {
    if (!result) return;
    setSaving(true);
    try {
      const tripDataWithPrefs = {
        ...result,
        preferences: { origin, travelStyle, companions, diet, pace, transportMode, routePreference }
      };

      const { error } = await supabase.from("trips").insert([
        {
          user_id: user.id,
          destination: `${origin} ➔ ${destination}`,
          days: Number(days),
          budget: Number(budget),
          trip_data: tripDataWithPrefs
        }
      ]);

      if (error) throw error;
      alert("Trip saved successfully! You can view it in 'My Trips'.");
    } catch (err) {
      console.error(err);
      alert("Failed to save trip. Make sure the 'trips' table exists in Supabase.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-gray-50 dark:bg-neutral-900 transition-colors duration-500">
      
      {/* Background Image for Planner */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat fixed"
        style={{ backgroundImage: `url('/hero-bg.png')` }}
      >
        <div className="absolute inset-0 bg-white/70 dark:bg-neutral-900/80 backdrop-blur-[10px] transition-colors duration-500"></div>
      </div>

      <div className="relative z-10 py-12 px-4 max-w-7xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="text-center space-y-4 mb-12 animate-fade-in-up">
          <h1 className="text-5xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-amber-600 dark:from-orange-400 dark:to-amber-400 tracking-tight drop-shadow-sm">
            Trip Architect 🪄
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto font-medium shadow-sm">
            Build your personalized adventure down to the finest detail.
          </p>
        </div>

        {/* Form Main Container */}
        <form onSubmit={generatePlan} className="bg-white/90 dark:bg-neutral-800/90 backdrop-blur-xl border border-white/40 dark:border-white/10 p-6 md:p-10 rounded-[2.5rem] shadow-2xl max-w-5xl mx-auto space-y-8 animate-fade-in-up" style={{animationDelay: '100ms'}}>
          
          {/* Top Row: The Basics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div className="relative">
              <label className="block text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3 pl-2">From</label>
              <div className="relative flex items-center">
                <input
                  type="text" required placeholder="Origin City" value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="w-full bg-gray-100/50 dark:bg-neutral-900/50 border border-gray-200 dark:border-white/5 rounded-2xl pl-5 pr-12 py-4 focus:ring-2 focus:ring-orange-500 text-gray-900 dark:text-white placeholder-gray-400 font-bold transition-all shadow-inner"
                />
                <button
                  type="button"
                  onClick={getLocation}
                  disabled={locating}
                  title="Use My Current Location"
                  className="absolute right-2 flex items-center justify-center p-2 rounded-xl bg-orange-100 hover:bg-orange-200 dark:bg-orange-900/30 dark:hover:bg-orange-800/50 text-orange-600 dark:text-orange-400 transition-colors"
                >
                  {locating ? <span className="animate-spin text-sm">⏳</span> : <span className="text-xl">📍</span>}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3 pl-2">To</label>
              <input
                type="text" required placeholder="Destination" value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full bg-gray-100/50 dark:bg-neutral-900/50 border border-gray-200 dark:border-white/5 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-orange-500 text-gray-900 dark:text-white placeholder-gray-400 font-bold transition-all shadow-inner"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3 pl-2">Days</label>
              <input
                type="number" required placeholder="E.g. 5" value={days}
                onChange={(e) => setDays(e.target.value)}
                className="w-full bg-gray-100/50 dark:bg-neutral-900/50 border border-gray-200 dark:border-white/5 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-orange-500 text-gray-900 dark:text-white placeholder-gray-400 font-bold transition-all shadow-inner"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3 pl-2">Budget (₹)</label>
              <input
                type="number" required placeholder="E.g. 50000" value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full bg-gray-100/50 dark:bg-neutral-900/50 border border-gray-200 dark:border-white/5 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-orange-500 text-gray-900 dark:text-white placeholder-gray-400 font-bold transition-all shadow-inner"
              />
            </div>
          </div>

          <hr className="border-gray-200 dark:border-white/5 my-4" />

          {/* Visual Selectors */}
          <div className="space-y-8">

            {/* Route Preference */}
            <div>
              <label className="block text-xs font-black text-orange-500 dark:text-orange-400 uppercase tracking-widest mb-4 pl-2">Trip Focus</label>
              <div className="flex gap-4 overflow-x-auto py-5 px-2 custom-scrollbar">
                {[
                  { label: "Destination Only", icon: "🎯" },
                  { label: "On-the-Way", icon: "🛣️" }
                ].map(opt => (
                  <OptionCard key={opt.label} label={opt.label} icon={opt.icon} selected={routePreference === opt.label} onClick={() => setRoutePreference(opt.label)} />
                ))}
              </div>
              {routePreference === "On-the-Way" && (
                <p className="pl-4 text-sm font-bold text-orange-600 dark:text-orange-400 mt-2 animate-fade-in-up">
                  We will optimize the itinerary to explore sights strictly along the route from {origin || "Origin"} to {destination || "Destination"}.
                </p>
              )}
            </div>
            
            {/* Travel Style */}
            <div>
              <label className="block text-xs font-black text-orange-500 dark:text-orange-400 uppercase tracking-widest mb-4 pl-2">Travel Style</label>
              <div className="flex gap-4 overflow-x-auto py-5 px-2 custom-scrollbar smooth-scroll">
                {[
                  { label: "Any", icon: "🌍" },
                  { label: "Adventure", icon: "🧗" },
                  { label: "Culture", icon: "🏛️" },
                  { label: "Relaxation", icon: "🌴" },
                  { label: "Romantic", icon: "🥂" },
                  { label: "Party", icon: "🪩" }
                ].map(opt => (
                  <OptionCard key={opt.label} label={opt.label} icon={opt.icon} selected={travelStyle === opt.label} onClick={() => setTravelStyle(opt.label)} />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Companions */}
              <div className="w-full overflow-hidden">
                <label className="block text-xs font-black text-orange-500 dark:text-orange-400 uppercase tracking-widest mb-4 pl-2">Companions</label>
                <div className="flex gap-4 overflow-x-auto py-5 px-2 custom-scrollbar">
                  {[
                    { label: "Solo", icon: "🧍" },
                    { label: "Couple", icon: "👫" },
                    { label: "Family", icon: "👨‍👩‍👧‍👦" },
                    { label: "Friends", icon: "🍻" }
                  ].map(opt => (
                    <OptionCard key={opt.label} label={opt.label} icon={opt.icon} selected={companions === opt.label} onClick={() => setCompanions(opt.label)} />
                  ))}
                </div>

                {/* Dynamic Group Inputs */}
                {(companions === "Family" || companions === "Friends") && (
                  <div className="mt-4 p-5 bg-orange-50/50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-500/20 rounded-2xl space-y-4 animate-fade-in-up">
                    <div>
                      <label className="block text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-2 pl-1">Total Persons</label>
                      <input
                        type="number" min="2" required placeholder="E.g. 4" value={groupSize}
                        onChange={(e) => setGroupSize(e.target.value)}
                        className="w-full bg-white dark:bg-neutral-800 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 text-gray-900 dark:text-white font-bold transition-all shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-2 pl-1">Group Details (Ages, Genders)</label>
                      <input
                        type="text" required placeholder="E.g. 2 Adults, 2 Kids (boy 8, girl 5)" value={groupDetails}
                        onChange={(e) => setGroupDetails(e.target.value)}
                        className="w-full bg-white dark:bg-neutral-800 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 text-gray-900 dark:text-white font-bold transition-all shadow-sm"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Diet */}
              <div className="w-full overflow-hidden">
                <label className="block text-xs font-black text-orange-500 dark:text-orange-400 uppercase tracking-widest mb-4 pl-2">Dietary Needs</label>
                <div className="flex gap-4 overflow-x-auto py-5 px-2 custom-scrollbar">
                  {[
                    { label: "Any", icon: "🍽️" },
                    { label: "Vegetarian", icon: "🥗" },
                    { label: "Vegan", icon: "🌱" },
                    { label: "Halal", icon: "🥩" },
                    { label: "Gluten-Free", icon: "🌾" }
                  ].map(opt => (
                    <OptionCard key={opt.label} label={opt.label} icon={opt.icon} selected={diet === opt.label} onClick={() => setDiet(opt.label)} />
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Pace */}
              <div className="w-full overflow-hidden">
                <label className="block text-xs font-black text-orange-500 dark:text-orange-400 uppercase tracking-widest mb-4 pl-2">Pace</label>
                <div className="flex gap-4 overflow-x-auto py-5 px-2 custom-scrollbar">
                  {[
                    { label: "Relaxed", icon: "🐢" },
                    { label: "Moderate", icon: "🚶" },
                    { label: "Action-packed", icon: "🏃" }
                  ].map(opt => (
                    <OptionCard key={opt.label} label={opt.label} icon={opt.icon} selected={pace === opt.label} onClick={() => setPace(opt.label)} />
                  ))}
                </div>
              </div>

              {/* Transport */}
              <div className="w-full overflow-hidden">
                <label className="block text-xs font-black text-orange-500 dark:text-orange-400 uppercase tracking-widest mb-4 pl-2">Transport Mode</label>
                <div className="flex gap-4 overflow-x-auto py-5 px-2 custom-scrollbar">
                  {[
                    { label: "Flight", icon: "✈️" },
                    { label: "Train", icon: "🚆" },
                    { label: "Bus", icon: "🚌" },
                    { label: "Car", icon: "🚗" }
                  ].map(opt => (
                    <OptionCard key={opt.label} label={opt.label} icon={opt.icon} selected={transportMode === opt.label} onClick={() => setTransportMode(opt.label)} />
                  ))}
                </div>
              </div>
            </div>

          </div>

          <div className="pt-8 flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-2/3 px-10 py-6 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 rounded-2xl font-black text-white transition-all disabled:opacity-50 text-xl shadow-2xl shadow-orange-500/30 hover:-translate-y-1 active:scale-95 border border-transparent"
            >
              {loading ? "Designing Your Perfect Trip Layout..." : "✨ Generate AI Itinerary"}
            </button>
          </div>
          
        </form>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 space-y-6">
            <div className="w-24 h-24 border-8 border-gray-200 dark:border-orange-500/30 border-t-orange-600 dark:border-t-orange-500 rounded-full animate-spin"></div>
            <p className="text-xl text-orange-700 dark:text-orange-400 font-extrabold animate-pulse text-center max-w-sm px-4 py-2 bg-white/80 dark:bg-black/50 backdrop-blur-md rounded-xl">
              Consulting AI travel experts exactly for your needs...
            </p>
          </div>
        )}

        {/* Results Dashboard */}
        {result && (
          <div className="space-y-8 animate-fade-in-up">
            {/* Control Bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md border border-gray-200 dark:border-white/10 p-6 rounded-3xl shadow-xl gap-4">
              <div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white max-w-sm md:max-w-none truncate flex items-center gap-3">
                  {origin} ➔ {destination} <span className="text-gray-400 dark:text-gray-500 text-lg font-bold">({days} Days)</span>
                </h3>
                <p className="text-sm font-bold text-green-600 dark:text-green-400 mt-1">Est. Budget: ₹{budget} <span className="text-gray-400 mx-2">|</span> {travelStyle} Style</p>
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                <a 
                  href={`https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`}
                  target="_blank" rel="noopener noreferrer"
                  className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 px-6 py-4 rounded-2xl font-black text-white transition-all shadow-lg shadow-blue-500/30 hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2"
                >
                  🗺️ Map Route
                </a>
                <button 
                  onClick={saveTrip}
                  disabled={saving}
                  className="w-full md:w-auto bg-green-600 hover:bg-green-500 px-6 py-4 rounded-2xl font-black text-white transition-all shadow-lg shadow-green-500/30 disabled:opacity-50 hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2"
                >
                  {saving ? "Saving..." : "💾 Save Trip"}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Timeline */}
              <div className="lg:col-span-2 space-y-8">
                
                <div className="bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md border border-gray-200 dark:border-white/10 p-8 rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-shadow">
                  <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-white/10 pb-4">Trip Overview</h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg font-medium">{result.overview}</p>
                </div>

                <div className="bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md border border-gray-200 dark:border-white/10 p-8 rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-shadow">
                  <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-8 border-b border-gray-100 dark:border-white/10 pb-4">Daily Itinerary &nbsp;🗓️</h2>
                  
                  <div className="space-y-10 pl-6 border-l-4 border-orange-100 dark:border-orange-500/30">
                    {result.timeline?.map((dayPlan, idx) => (
                      <div key={idx} className="relative group">
                        <div className="absolute -left-[32px] w-6 h-6 bg-orange-600 dark:bg-orange-500 rounded-full top-1 shadow-[0_0_0_6px_rgba(255,255,255,1)] dark:shadow-[0_0_0_6px_rgba(23,23,23,1)] transition-transform group-hover:scale-125"></div>
                        <h3 className="text-2xl font-black text-orange-600 dark:text-orange-400 mb-5">Day {dayPlan.day}</h3>
                        
                        <div className="space-y-5">
                          <div className="bg-yellow-50 dark:bg-neutral-800/80 p-6 rounded-3xl border border-yellow-200 dark:border-transparent transition-all hover:translate-x-2">
                            <h4 className="text-yellow-600 dark:text-yellow-500 font-extrabold mb-3 text-lg flex items-center gap-2">🌅 Morning</h4>
                            <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 space-y-2 font-medium">
                              {dayPlan.morning?.map((act, i) => <li key={i}>{act}</li>)}
                            </ul>
                          </div>
                          
                          <div className="bg-orange-50 dark:bg-neutral-800/80 p-6 rounded-3xl border border-orange-200 dark:border-transparent transition-all hover:translate-x-2">
                            <h4 className="text-orange-600 dark:text-orange-400 font-extrabold mb-3 text-lg flex items-center gap-2">☀️ Afternoon</h4>
                            <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 space-y-2 font-medium">
                              {dayPlan.afternoon?.map((act, i) => <li key={i}>{act}</li>)}
                            </ul>
                          </div>
                          
                          <div className="bg-cyan-50 dark:bg-neutral-800/80 p-6 rounded-3xl border border-cyan-200 dark:border-transparent transition-all hover:translate-x-2">
                            <h4 className="text-cyan-700 dark:text-cyan-400 font-extrabold mb-3 text-lg flex items-center gap-2">🌙 Evening</h4>
                            <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 space-y-2 font-medium">
                              {dayPlan.evening?.map((act, i) => <li key={i}>{act}</li>)}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Right Column: Cards */}
              <div className="space-y-8">
                
                <div className="bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md border border-gray-200 dark:border-white/10 p-6 rounded-3xl shadow-xl hover:shadow-2xl transition-transform hover:-translate-y-1">
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-5 flex items-center gap-3">🍜 Food</h2>
                  <ul className="space-y-3">
                    {result.food?.map((item, idx) => (
                      <li key={idx} className="bg-orange-50 dark:bg-neutral-800/80 px-5 py-4 rounded-2xl text-gray-800 dark:text-gray-300 font-bold border-l-4 border-orange-500 shadow-sm leading-snug">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md border border-gray-200 dark:border-white/10 p-6 rounded-3xl shadow-xl hover:shadow-2xl transition-transform hover:-translate-y-1">
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-5 flex items-center gap-3">🚗 Transport</h2>
                  <ul className="space-y-3">
                    {result.transport?.map((item, idx) => (
                      <li key={idx} className="bg-blue-50 dark:bg-neutral-800/80 px-5 py-4 rounded-2xl text-gray-800 dark:text-gray-300 font-bold border-l-4 border-blue-500 shadow-sm leading-snug">
                        {item}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-5 pt-5 border-t border-gray-100 dark:border-white/10">
                    <a 
                      href={transportMode === 'Flight' ? 'https://www.makemytrip.com/flights/' : transportMode === 'Bus' ? 'https://www.redbus.in/' : transportMode === 'Train' ? 'https://www.makemytrip.com/railways/' : `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`}
                      target="_blank" rel="noopener noreferrer"
                      className="block w-full text-center bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-800/40 text-blue-700 dark:text-blue-400 font-black py-3 rounded-xl transition-colors shadow-sm hover:shadow"
                    >
                      Book {transportMode} Tickets 🎟️
                    </a>
                  </div>
                </div>

                <div className="bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md border border-gray-200 dark:border-white/10 p-6 rounded-3xl shadow-xl hover:shadow-2xl transition-transform hover:-translate-y-1">
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-5 flex items-center gap-3">💰 Budget Analysis</h2>
                  
                  {/* Total Comparison */}
                  <div className="mb-6 bg-gray-100 dark:bg-neutral-800 p-5 rounded-2xl space-y-2 border border-gray-200 dark:border-neutral-700">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-500 dark:text-gray-400">Allocated Budget:</span>
                      <span className="font-black text-xl text-gray-900 dark:text-white">₹{budget}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-500 dark:text-gray-400">Estimated Total:</span>
                      <span className={`font-black text-xl ${
                        Number(result.budgetBreakdown?.totalEstimated) > Number(budget) 
                          ? 'text-red-500 dark:text-red-400' 
                          : 'text-green-500 dark:text-green-400'
                      }`}>
                        ₹{result.budgetBreakdown?.totalEstimated || "0"}
                      </span>
                    </div>
                  </div>

                  {/* AI Analysis Message */}
                  {result.budgetBreakdown?.analysisMessage && (
                    <div className={`mb-6 p-4 rounded-2xl border-l-4 font-bold text-sm leading-snug shadow-inner ${
                      Number(result.budgetBreakdown?.totalEstimated) > Number(budget) 
                        ? 'bg-red-50 border-red-500 text-red-800 dark:bg-red-900/20 dark:text-red-300' 
                        : 'bg-green-50 border-green-500 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                    }`}>
                      {result.budgetBreakdown.analysisMessage}
                    </div>
                  )}

                  {/* Breakdown */}
                  <h3 className="font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-xs mb-3 pl-2">Cost Breakdown</h3>
                  <div className="space-y-3 text-base text-gray-700 dark:text-gray-300">
                    <div className="flex justify-between items-center bg-gray-50 dark:bg-neutral-800/80 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-transparent">
                      <span className="font-bold text-gray-500 dark:text-gray-400">Stay</span>
                      <span className="font-black text-gray-900 dark:text-white text-lg">
                        {result.budgetBreakdown?.stay === 0 ? "Not needed (1-Day Trip)" : `₹${result.budgetBreakdown?.stay || "0"}`}
                      </span>
                    </div>

                    {result.budgetBreakdown?.stay !== 0 && (
                      <div className="mt-1 mb-2 pt-2">
                        <a 
                          href={`https://www.booking.com/searchresults.html?ss=${destination}`}
                          target="_blank" rel="noopener noreferrer"
                          className="block w-full text-center bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-800/40 text-green-700 dark:text-green-400 font-black py-2 rounded-xl transition-colors shadow-sm hover:shadow text-sm"
                        >
                          Find Rooms on Booking.com 🏨
                        </a>
                      </div>
                    )}

                    <div className="flex justify-between items-center bg-gray-50 dark:bg-neutral-800/80 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-transparent">
                      <span className="font-bold text-gray-500 dark:text-gray-400">Food</span>
                      <span className="font-black text-gray-900 dark:text-white text-lg">₹{result.budgetBreakdown?.food || "0"}</span>
                    </div>
                    <div className="flex justify-between items-center bg-gray-50 dark:bg-neutral-800/80 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-transparent">
                      <span className="font-bold text-gray-500 dark:text-gray-400">Transport</span>
                      <span className="font-black text-gray-900 dark:text-white text-lg">₹{result.budgetBreakdown?.transport || "0"}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md border border-gray-200 dark:border-white/10 p-6 rounded-3xl shadow-xl hover:shadow-2xl transition-transform hover:-translate-y-1">
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-5 flex items-center gap-3">💡 Pro Tips</h2>
                  <ul className="space-y-4 text-base text-gray-700 dark:text-gray-300 list-disc pl-6 marker:text-orange-500 font-bold">
                    {result.tips?.map((item, idx) => (
                      <li key={idx} className="pl-1 leading-relaxed">{item}</li>
                    ))}
                  </ul>
                </div>

              </div>
              
            </div>
          </div>
        )}
      </div>
    </div>
  );
}