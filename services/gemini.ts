import { GoogleGenAI, FunctionDeclaration, Type, Tool } from "@google/genai";
import { Goal, CalendarEvent, Habit, DashboardState } from '../types';
import { googleService } from './google';

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

// --- TOOL DEFINITIONS ---

const calendarTools: Tool[] = [
  {
    functionDeclarations: [
      {
        name: "create_calendar_event",
        description: "Creates a new event in the user's Google Calendar. Requires title and start time.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Title of the event" },
            startTime: { type: Type.STRING, description: "ISO 8601 string for start time (e.g. 2023-12-25T14:00:00)" },
            durationMinutes: { type: Type.NUMBER, description: "Duration in minutes. Default is 60." },
            description: { type: Type.STRING, description: "Optional description" }
          },
          required: ["title", "startTime"]
        }
      },
      {
        name: "delete_calendar_event",
        description: "Deletes an event from the calendar. Requires the exact Event ID. If you don't have the ID, ask the user to list events first.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            eventId: { type: Type.STRING, description: "The unique ID of the event to delete" }
          },
          required: ["eventId"]
        }
      },
      {
        name: "update_calendar_event",
        description: "Updates an existing event. Requires Event ID.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            eventId: { type: Type.STRING, description: "The unique ID of the event" },
            newTitle: { type: Type.STRING, description: "New title (optional)" },
            newStartTime: { type: Type.STRING, description: "New start ISO time (optional)" }
          },
          required: ["eventId"]
        }
      }
    ]
  }
];

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
  context: DashboardState,
  accessToken?: string,
  onEventUpdate?: () => void
): Promise<string> => {
  const ai = getAIClient();

  if (!ai) {
    return "I cannot reply because the API Key is missing. Please configure it in your settings.";
  }

  try {
    const now = new Date();
    
    // System Instruction to ground the AI in time and capabilities
    const systemPrompt = `
      You are Nexus, a smart personal assistant.
      Current Date/Time: ${now.toString()} (ISO: ${now.toISOString()}).
      
      You have access to the user's Google Calendar via tools.
      - If the user asks to add/schedule/create an event, USE the create_calendar_event tool.
      - If the user asks to delete/remove, USE delete_calendar_event (you need the ID, see Context below).
      - If the user asks to update/change/move, USE update_calendar_event.
      
      User Context:
      - Events (IDs included, useful for deletion/updates): ${JSON.stringify(context.events)}
      - Goals: ${JSON.stringify(context.goals.map(g => g.title))}
      - Habits: ${JSON.stringify(context.habits.map(h => h.title))}
      
      Respond naturally. If you perform an action, confirm it.
    `;

    // 1. First API Call: Send user message + tools
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: message,
      config: {
        systemInstruction: systemPrompt,
        tools: calendarTools
      },
    });

    const candidates = response.candidates;
    if (!candidates || candidates.length === 0) return "I didn't catch that.";
    
    const firstCand = candidates[0];
    const parts = firstCand.content.parts;
    
    // 2. Check for Function Calls
    const functionCalls = parts.filter(p => p.functionCall);
    
    if (functionCalls.length > 0) {
      // Execute Tools
      if (!accessToken) return "I can't access your calendar because you aren't signed in or I don't have permission.";
      
      const functionResponses = [];

      for (const call of functionCalls) {
        const fc = call.functionCall;
        if (!fc) continue;
        
        console.log(`Executing Tool: ${fc.name}`, fc.args);
        
        let result = { success: false, message: "Unknown error" };
        
        try {
            if (fc.name === 'create_calendar_event') {
                const { title, startTime, durationMinutes, description } = fc.args as any;
                // Construct event object matching internal types
                await googleService.createEvent(accessToken, {
                    title,
                    startTime: new Date(startTime).getTime(),
                    time: "TBD", // Auto-calculated later
                    type: 'work',
                    duration: (durationMinutes || 60) + 'm'
                });
                result = { success: true, message: "Event created successfully." };
            } 
            else if (fc.name === 'delete_calendar_event') {
                const { eventId } = fc.args as any;
                await googleService.deleteEvent(accessToken, eventId);
                result = { success: true, message: "Event deleted successfully." };
            }
            else if (fc.name === 'update_calendar_event') {
                 const { eventId, newTitle, newStartTime } = fc.args as any;
                 const updates: any = {};
                 if (newTitle) updates.summary = newTitle;
                 if (newStartTime) {
                    updates.start = { dateTime: newStartTime };
                    // Default 1 hour duration if moving, unless we fetch original (simplified)
                    const end = new Date(new Date(newStartTime).getTime() + 3600000); 
                    updates.end = { dateTime: end.toISOString() };
                 }
                 await googleService.updateEvent(accessToken, eventId, updates);
                 result = { success: true, message: "Event updated successfully." };
            }
        } catch (e: any) {
            console.error(`Tool Execution Error (${fc.name}):`, e);
            result = { success: false, message: `Error: ${e.message}` };
        }

        // Prepare response for the model
        functionResponses.push({
            functionResponse: {
                name: fc.name,
                response: { result: result } 
            }
        });
      }

      // 3. Trigger Dashboard Refresh
      if (onEventUpdate) {
          // Delay slightly to ensure API propagation
          setTimeout(() => onEventUpdate(), 1000);
      }

      // 4. Second API Call: Send Tool Results back to Model to get final natural language response
      const secondResponse = await ai.models.generateContent({
         model: 'gemini-2.5-flash',
         contents: [
            { role: 'user', parts: [{ text: message }] },
            { role: 'model', parts: parts }, // The model's original tool call
            { role: 'user', parts: functionResponses as any } // The result of the tool
         ],
         config: { systemInstruction: systemPrompt }
      });
      
      return secondResponse.text || "Action completed.";
    }

    // No function call, just return text
    return response.text || "I'm listening.";

  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "I encountered an error connecting to the assistant services. Please try again.";
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