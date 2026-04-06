import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Recommendations from "./pages/Recommendations";
import History from "./pages/History";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-neutral-900 dark:text-neutral-100 font-sans selection:bg-indigo-500/30 transition-colors duration-500">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<Auth />} />
              
              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/planner" element={<Recommendations />} />
                <Route path="/history" element={<History />} />
              </Route>
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;