import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

/* 🔁 AI FUNCTION (GEMINI ENGINE) */
const askAIJSON = async (prompt) => {
  const GEMINI_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_KEY) throw new Error("Missing GEMINI_API_KEY");

  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
    {
      contents: [{
        parts: [{ text: prompt }]
      }],
      systemInstruction: {
        parts: [{ text: "You are an expert travel advisor. You must respond in pure JSON. Do not include markdown formatting or anything outside the JSON object." }]
      },
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.7,
      }
    },
    { headers: { "Content-Type": "application/json" } }
  );

  const rawText = response.data.candidates[0].content.parts[0].text;
  return JSON.parse(rawText);
};

/* 🚀 MAIN ROUTE */
app.post("/generate", async (req, res) => {
  try {
    console.log("BODY RECEIVED:", req.body);

    const { origin, destination, days, budget, travelStyle, companions, diet, pace, transportMode } = req.body;

    // ✅ VALIDATION
    if (!origin || !destination || !days || !budget || days <= 0) {
      return res.status(400).json({
        error: "Please enter valid origin, destination, days (>0), and budget",
      });
    }

    const totalDays = parseInt(days);

    console.log(`Generating highly personalized plan from ${origin} to ${destination} via ${transportMode} for ${totalDays} days with budget ₹${budget}...`);

    // 🟢 Sequential execution to respect free-tier rate limits
    let itineraryResult, logisticsResult;

    try {
      itineraryResult = await askAIJSON(`
        Generate a detailed travel itinerary for a trip from ${origin} to ${destination} for ${totalDays} days.
        The primary intercity mode of transport chosen is: ${transportMode || "Flight"}.
        The travel group consists of: ${companions || "any"}.
        The preferred travel style is: ${travelStyle || "any"}.
        The preferred pace of travel is: ${pace || "moderate"}.
        
        Tailor the tone of the overview and the specific activity selections strictly to match the above group, style, and pace!
        
        Return EXACTLY this JSON structure:
        {
          "overview": "A short, exciting professional travel overview customized for the specific group, style, and pace.",
          "timeline": [
            {
              "day": 1,
              "morning": ["Activity 1", "Activity 2"],
              "afternoon": ["Activity 3"],
              "evening": ["Activity 4"]
            }
          ]
        }
      `);
    } catch (err) {
      console.error("AI First Request Failed:", err.message);
      return res.status(500).json({ error: "AI Service Rate Limit Exceeded. Try again in 60s." });
    }

    try {
      /* 🟢 2. FOOD, TRANSPORT, BUDGET, TIPS */
      logisticsResult = await askAIJSON(`
        Provide travel logistics for a trip from ${origin} to ${destination} with a budget of ₹${budget}.
        The intercity travel mode is: ${transportMode || "Flight"}. Provide advice specifically relating to this travel mode.
        The travel group consists of: ${companions || "any"}.
        The dietary preference is strictly: ${diet || "any"}.
        
        Tailor the food recommendations strictly to the dietary preferences! Tailor transport and tips to the group dynamics.
        
        Return EXACTLY this JSON structure:
        {
          "food": ["Recommendation 1 matching diet", "Recommendation 2 matching diet"],
          "transport": ["Transport suggestion 1 suitable for the group", "Transport suggestion 2"],
          "budgetBreakdown": {
            "stay": "estimated amount in ₹",
            "food": "estimated amount in ₹",
            "transport": "estimated amount in ₹"
          },
          "tips": ["Important travel tip 1", "Important travel tip 2"]
        }
      `);
    } catch (err) {
      console.warn("AI Second Request Failed, proceeding with basic logistics:", err.message);
      logisticsResult = {
        food: ["Local cuisines available near destination"],
        transport: ["Book tickets in advance"],
        budgetBreakdown: { stay: "-", food: "-", transport: "-" },
        tips: ["Always carry water!"]
      };
    }

    const finalPlan = {
      overview: itineraryResult.overview,
      timeline: itineraryResult.timeline,
      food: logisticsResult.food,
      transport: logisticsResult.transport,
      budgetBreakdown: logisticsResult.budgetBreakdown,
      tips: logisticsResult.tips
    };

    console.log("✅ PERSONALIZED PLAN GENERATED!");

    res.json(finalPlan);

  } catch (error) {
    console.error("ERROR:", error.response?.data || error.message);

    res.status(500).json({
      error: "Error generating travel plan",
    });
  }
});

/* 🟢 SERVER START */
app.listen(5000, () => {
  console.log("🚀 Server running at http://localhost:5000");
});