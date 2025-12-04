import { GoogleGenAI } from "@google/genai";
import { Goal, CalendarEvent, Habit, DashboardState } from '../types';

// Safely retrieve API key to prevent "process is not defined" crashes in browser-only environments
let apiKey = '';
try {
  apiKey = process.env.API_KEY || '';
} catch (e) {
  // process is not defined, likely running in a browser without env injection
  console.warn("API Key not found in process.env. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey });

export const generateDailyBriefing = async (
  goals: Goal[],
  events: CalendarEvent[],
  habits: Habit[]
): Promise<string> => {
  if (!apiKey) {
    return "API Key is missing. Please configure your environment to use the intelligent briefing features.";
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
      Act as a high-end personal concierge. Write a "Daily Briefing" for me.
      
      Today's Schedule: ${JSON.stringify(todaysEvents)}
      Current Goals: ${JSON.stringify(goals.map(g => ({ title: g.title, progress: g.progress, target: g.target })))}
      Habits to maintain: ${JSON.stringify(habits.map(h => h.title))}
      
      Output pure text with no markdown symbols.
      Structure:
      1. A short, elegant greeting sentence.
      2. Two clear, actionable focus points based on my schedule and goals.
      3. A thoughtful closing or heads-up.
      
      Keep it concise, encouraging, and professional.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Your day is looking productive. Stay focused on your goals.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Ready to conquer the day? Check your goals to get started.";
  }
};

export const chatWithAssistant = async (
  message: string,
  context: DashboardState
): Promise<string> => {
  if (!apiKey) {
    return "I cannot reply because the API Key is missing.";
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