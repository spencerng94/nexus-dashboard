/**
 * Vercel Serverless Function for Google Gemini API
 * 
 * Status: Ready for deployment
 * 
 * Prerequisites:
 * 1. Install dependencies: npm install @google/genai dotenv
 * 2. Set GEMINI_API_KEY in your Vercel Project Settings (Environment Variables).
 * 3. Ensure this file is located at: api/generate.js
 * 
 * Usage from Frontend:
 * const res = await fetch('/api/generate', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({ prompt: 'Hello Gemini' })
 * });
 * const data = await res.json();
 */

import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  // 1. Method Check: Only allow POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed. Use POST.` });
  }

  try {
    // 2. Input Validation
    const { prompt } = req.body || {};
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Bad Request. JSON body must contain a "prompt" string.' });
    }

    // 3. Environment Configuration Check
    // Reads from standard Vercel environment variables
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('Server Error: GEMINI_API_KEY is missing from environment variables.');
      return res.status(500).json({ error: 'Server configuration error.' });
    }

    // 4. Initialize Gemini Client
    const ai = new GoogleGenAI({ apiKey });

    // 5. Call Google Gemini API
    // Using the specifically requested model 'gemini-2.0-flash'
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    // 6. Extract and Return Response
    // The SDK extracts the text automatically via the .text getter
    const text = response.text || "";

    return res.status(200).json({ text });

  } catch (error) {
    console.error('Gemini API Error:', error);
    
    // Return 500 for API errors to the client with a generic message
    return res.status(500).json({ 
      error: 'Internal Server Error', 
      details: error instanceof Error ? error.message : 'Failed to generate content' 
    });
  }
}