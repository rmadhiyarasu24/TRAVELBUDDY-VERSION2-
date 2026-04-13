import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

/* 🔁 AI FUNCTION (GEMINI ENGINE) */
const askAIJSON = async (prompt, retries = 3) => {
  const GEMINI_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_KEY) throw new Error("Missing GEMINI_API_KEY");

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
          systemInstruction: {
            parts: [{ text: "You are an expert travel advisor. You must respond in pure JSON. Do not include markdown formatting or anything outside the JSON object." }]
          },
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.7,
          }
        },
        { headers: { "Content-Type": "application/json" }, timeout: 60000 }
      );

      const rawText = response.data.candidates[0].content.parts[0].text;
      const cleanedText = rawText.replace(/```json\n?/gi, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleanedText);
    } catch (err) {
      console.error(`AI Request Attempt ${attempt} Failed:`, err?.response?.status, err.message);
      if (attempt === retries) throw err;
      await sleep(3000 * attempt); // exponential backoff
    }
  }
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/* 🚀 MAIN ROUTE */
app.post("/generate", async (req, res) => {
  try {
    console.log("BODY RECEIVED:", req.body);

    const { origin, destination, days, budget, travelStyle, companions, diet, pace, transportMode, groupSize, groupDetails, routePreference } = req.body;

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
        TRIP FOCUS: ${routePreference || "Destination Only"}.
        The primary intercity mode of transport chosen is: ${transportMode || "Flight"}.
        The travel group consists of: ${companions || "any"} (Total Size: ${groupSize || 1} people).
        Specific Group Details (Ages, Genders, etc.): ${groupDetails || "Not specified"}.
        The preferred travel style is: ${travelStyle || "any"}.
        The preferred pace of travel is: ${pace || "moderate"}.
        
        CRITICAL RULES:
        1. IF TRIP FOCUS IS "On-the-Way", you MUST NOT just list places at the final destination. Instead, map out a road trip experience and perfectly recommend specific tourist spots, attractions, and eateries located geographically ON THE HIGHWAY OR ROUTE BETWEEN ${origin} and ${destination}.
        2. DO NOT repeat places or activities. Every single activity across all ${totalDays} days MUST be unique and explore a different part of the destination or a different experience.
        3. Tailor the tone of the overview and the specific activity selections strictly to match the above group, style, and pace! IF the "Group Details" mention kids/children, you MUST actively recommend highly suitable places like theme parks, interactive museums, or safe nature spots. IF "Friends" are mentioned, recommend group-friendly venues.
        
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
      if (err?.response?.status === 429) {
        return res.status(429).json({ error: "AI Rate Limit Reached! Please wait 60 seconds before trying again." });
      }
      return res.status(500).json({ error: "AI Service Error. Try again." });
    }

    try {
      await sleep(2000); // Respect free-tier rate limits
      /* 🟢 2. FOOD, TRANSPORT, BUDGET, TIPS */
      logisticsResult = await askAIJSON(`
        Provide travel logistics for a trip from ${origin} to ${destination} with an allocated budget of ₹${budget} for ${totalDays} days.
        TRIP FOCUS: ${routePreference || "Destination Only"}.
        The intercity travel mode is: ${transportMode || "Flight"}. Provide advice specifically relating to this travel mode.
        The travel group consists of: ${companions || "any"} (Total Size: ${groupSize || 1} people).
        Specific Group Details (Ages, Genders, etc.): ${groupDetails || "Not specified"}.
        The dietary preference is strictly: ${diet || "any"}.
        
        Tailor the food recommendations strictly to the dietary preferences! Tailor transport and tips to the group dynamics.
        
        CRITICAL BUDGET RULES: 
        1. If the trip is exactly 1 day long OR if the TRIP FOCUS is "On-the-Way" and can be completed in a single drive without overnight stops, you MUST NOT include any hotel or stay costs. Set stay cost to 0.
        2. Calculate realistic costs based on the destination, days, travel style, and exactly ${groupSize || 1} people.
        3. EXTREMELY IMPORTANT: Your budget figures MUST accurately estimate the total cost for ALL ${groupSize || 1} people combined! Multiply the per-person food cost, transport cost, and activity cost by ${groupSize || 1} to get the true total cost for the exact group size!
        
        Return EXACTLY this JSON structure:
        {
          "food": ["Recommendation 1 matching diet", "Recommendation 2 matching diet"],
          "transport": ["Transport suggestion 1 suitable for the group", "Transport suggestion 2"],
          "budgetBreakdown": {
            "stay": estimated stay amount as a NUMBER (0 if 1 day),
            "food": estimated food amount as a NUMBER,
            "transport": estimated transport amount as a NUMBER,
            "totalEstimated": total estimated amount as a NUMBER,
            "analysisMessage": "A short, engaging message comparing the totalEstimated to the user's allocated budget of ₹${budget}. If under budget, congratulate them and mention the exact amount saved (e.g. 'You saved ₹500!'). If over budget, accurately state exactly how much more they need (e.g. 'You need ₹1500 more'), and explain what they can afford with their current budget."
          },
          "tips": ["Important travel tip 1", "Important travel tip 2"]
        }
      `);
    } catch (err) {
      console.warn("AI Second Request Failed, proceeding with basic logistics:", err.message);
      logisticsResult = {
        food: ["Local cuisines available near destination"],
        transport: ["Book tickets in advance"],
        budgetBreakdown: { stay: 0, food: 0, transport: 0, totalEstimated: 0, analysisMessage: "Unable to analyze budget automatically." },
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