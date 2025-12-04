import { GoogleGenAI } from "@google/genai";
import { Goal, CalendarEvent, Habit, DashboardState } from '../types';

// Lazy initialization of the AI client
let aiClient: GoogleGenAI | null = null;

const getAIClient = () => {
  if (aiClient) return aiClient;
  
  try {
    // @ts-ignore
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.warn("API_KEY not found in environment.");
      return null;
    }
    aiClient = new GoogleGenAI({ apiKey });
    return aiClient;
  } catch (e) {
    console.error("Failed to initialize Gemini Client:", e);
    return null;
  }
};

export const generateDailyBriefing = async (
  goals: Goal[],
  events: CalendarEvent[],
  habits: Habit[]
): Promise<string> => {
  const ai = getAIClient();
  
  if (!ai) {
    return "<p>API Key is missing. Please check your settings.</p>";
  }

  try {
    const activeEvents = events && events.length > 0 ? events : [];
    // Filter for today's events
    const todaysEvents = activeEvents.filter(e => {
      const eDate = new Date(e.startTime);
      const today = new Date();
      return eDate.getDate() === today.getDate() && eDate.getMonth() === today.getMonth();
    });

    const prompt = `
      Act as a high-end personal concierge. Create a "Plan for Today" for me.
      
      Today's Schedule: ${JSON.stringify(todaysEvents)}
      Current Goals: ${JSON.stringify(goals.map(g => ({ title: g.title, progress: g.progress, target: g.target })))}
      Habits to maintain: ${JSON.stringify(habits.map(h => h.title))}
      
      Output format: HTML string (no markdown code blocks, just raw HTML tags).
      
      Styling Rules (Apply these classes exactly):
      1. Wrap ALL times (e.g. "10:00 AM", "Morning"), dates, time-references, AND specific event names/titles in this span:
         <span class="text-emerald-600 font-semibold">...</span>
      
      2. Do NOT use background colors, pills, or underlines. Just colored text.

      Structure:
      - Start with a <p class="mb-4 text-xl md:text-2xl leading-relaxed text-slate-700"> containing a short, elegant greeting.
      - Follow with a <ul class="list-disc pl-6 space-y-2 mb-4 marker:text-emerald-400"> containing 2-3 clear, actionable focus points for the day.
      - Each <li> should have class="text-base md:text-lg text-slate-600 pl-1 leading-relaxed".
      - Do NOT use emojis (like ✅) at the start of list items. Use the standard bullet point.
      - End with a <p class="text-slate-500 italic"> containing a thoughtful closing.
      
      Keep it concise, encouraging, and professional.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "<p>Your day is looking productive. Stay focused on your goals.</p>";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "<p>Ready to conquer the day? Check your goals to get started.</p>";
  }
};

export const chatWithAssistant = async (
  message: string,
  context: DashboardState
): Promise<string> => {
  const ai = getAIClient();

  if (!ai) {
    return "I cannot reply because the API Key is missing. Please configure it in your settings.";
  }

  try {
    const prompt = `
      You are Nexus, a personal productivity assistant.
      
      Current User Context:
      - Goals: ${JSON.stringify(context.goals.map(g => g.title))}
      - Habits: ${JSON.stringify(context.habits.map(h => h.title))}
      - Events: ${JSON.stringify(context.events.length)} scheduled items
      
      User Message: "${message}"
      
      Respond concisely and helpfully. Do not use markdown formatting.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "I'm focusing on your tasks right now.";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "I'm having trouble connecting right now. Please try again later.";
  }
};

export const generateSuggestions = async (
  type: 'goal' | 'habit',
  existingItems: string[]
): Promise<Array<{ title: string; category: string; icon: string }>> => {
  const ai = getAIClient();
  if (!ai) return [];

  try {
    const prompt = `
      Generate 4 unique, high-quality, actionable ideas for a new ${type}.
      The user already has these: ${existingItems.join(', ')}.
      
      Output strictly valid JSON array of objects with keys: "title", "category", "icon" (single emoji).
      Example: [{"title": "Drink 2L Water", "category": "Health", "icon": "💧"}]
      Do not include markdown block markers like \`\`\`json.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    const text = response.text || "[]";
    // Clean potential markdown code blocks if the model ignores instruction
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("Suggestion Error:", error);
    return [];
  }
};