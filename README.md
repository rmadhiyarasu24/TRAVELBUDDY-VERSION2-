# TravelBuddy 🌍✈️

TravelBuddy is an advanced, AI-powered travel planning application. It transforms the way you plan trips by providing group-aware budgeting, intelligent route optimization, and personalized travel recommendations.

## Features ✨
- **AI-Powered Recommendations:** Built with Google Generative AI (Gemini) for crafting customized itineraries.
- **Smart Budget Planner:** Headcount-based calculations to help groups effectively manage their travel finances.
- **Dynamic Routing:** "On-the-Way" vs "Destination-only" route planning.
- **Modern UI:** A stunning, premium user interface crafted with React, Tailwind CSS, and smooth Framer Motion animations.
- **Authentication & Data:** Integrated with Supabase for secure user authentication and fast data storage.

## Tech Stack 🛠️
- **Frontend:** React, Vite, Tailwind CSS, Framer Motion, Lucide React
- **Backend:** Node.js, Express, Google Generative AI integration, Supabase

## Getting Started 🚀

### Prerequisites
- Node.js installed on your machine.
- Project requires Supabase keys and a Google Gemini API Key.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/rmadhiyarasu24/TRAVELBUDDY-VERSION2-.git
   cd travelbuddy
   ```

2. **Install frontend dependencies:**
   ```bash
   npm install
   ```

3. **Install backend dependencies:**
   ```bash
   cd server
   npm install
   ```

4. **Environment Setup:**
   - Create a `.env` file in the root directory for your frontend variables.
   - Create a `.env` file in the `server` directory for your `GEMINI_API_KEY`.

5. **Run the Application:**
   Start the backend server (from `server` directory):
   ```bash
   npm start
   ```
   Start the frontend (from root):
   ```bash
   npm run dev
   ```

## Design Aesthetics 🎨
Designed with premium visuals, vibrant aesthetics, dark mode support, and dynamic micro-animations to create a visually appealing, interactive experience.

## License 📄
This project is open-source and available under the MIT License.
