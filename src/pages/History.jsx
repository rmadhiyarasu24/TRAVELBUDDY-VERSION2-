import { useState, useEffect } from "react";
import { supabase } from "../supabase";

export default function History() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const { data, error } = await supabase
        .from("trips")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTrips(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const deleteTrip = async (id) => {
    if (!window.confirm("Are you sure you want to delete this trip?")) return;
    try {
      const { error } = await supabase.from("trips").delete().eq("id", id);
      if (error) throw error;
      setTrips(trips.filter(t => t.id !== id));
    } catch (error) {
      alert("Error deleting trip");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="w-12 h-12 border-4 border-gray-200 dark:border-indigo-500/30 border-t-indigo-600 dark:border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] py-12 px-4 bg-gray-50 dark:bg-neutral-900 transition-colors duration-500">
      <div className="max-w-7xl mx-auto space-y-10 animate-fade-in-up">
        
        <div className="mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-3">My Travel History 🧳</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">All your beautifully curated AI-generated travel plans in one place.</p>
        </div>

        {trips.length === 0 ? (
          <div className="text-center py-24 bg-white dark:bg-neutral-800/30 border border-gray-200 dark:border-white/5 rounded-3xl shadow-sm">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-300 mb-3">No trips found</h3>
            <p className="text-gray-500 dark:text-gray-500">Go to the planner and start architecting your first adventure!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {trips.map((trip, index) => (
              <div 
                key={trip.id} 
                className="bg-white dark:bg-neutral-800/40 border border-gray-200 dark:border-white/10 rounded-3xl overflow-hidden hover:border-indigo-500/50 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="p-8 border-b border-gray-100 dark:border-white/5">
                  <div className="flex justify-between items-start mb-5">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white truncate pr-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {trip.destination}
                    </h2>
                    <span className="bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-black px-3 py-1.5 rounded-lg whitespace-nowrap">
                      {trip.days} Days
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 line-clamp-3 leading-relaxed">
                    {trip.trip_data?.overview || "No overview available."}
                  </p>
                  
                  <div className="flex items-center gap-2">
                    <span className="p-2 bg-green-100 dark:bg-green-500/10 rounded-full">
                      <span className="text-green-700 dark:text-green-400 font-bold text-sm">₹{trip.budget}</span>
                    </span>
                  </div>
                </div>
                
                <div className="px-8 py-5 bg-gray-50 dark:bg-neutral-900/50 flex justify-between items-center transition-opacity border-t border-gray-100 dark:border-transparent">
                  <span className="text-xs font-semibold text-gray-400 dark:text-gray-500">
                    Saved on {new Date(trip.created_at).toLocaleDateString()}
                  </span>
                  <button 
                    onClick={() => deleteTrip(trip.id)}
                    className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10 px-3 py-1.5 rounded-md text-sm font-bold transition-all"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
