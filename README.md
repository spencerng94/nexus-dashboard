# Nexus Dashboard

Nexus is an intelligent personal productivity dashboard designed to help you organize your life. It combines goal tracking, habit formation, and calendar management with the power of Generative AI to provide daily insights and assistance.

## ✨ Features

- **Daily Briefing**: Starts your day with an AI-generated summary of your schedule, focus areas, and habits, acting as a personal concierge.
- **Goal Tracking**: Set targets (e.g., "Read 100 pages") and track progress visually with increment/decrement controls.
- **Habit Tracker**: Build consistency with daily check-ins, streak tracking, and detailed history views (Calendar & List). Includes note-taking for every check-in.
- **Calendar**: A unified view of your schedule with Month, Week, and Day views.
- **AI Assistant**: A built-in chat widget context-aware of your dashboard data, ready to answer questions about your schedule or help you brainstorm.
- **Local Privacy**: Data is currently persisted to your browser's LocalStorage, ensuring your personal data stays on your device.

## 🛠️ Technology & Design Decisions

### Tech Stack
- **Frontend Framework**: React 19 (TypeScript)
- **Styling**: Tailwind CSS (Utility-first styling for rapid UI development)
- **Icons**: Lucide React
- **AI Integration**: Google GenAI SDK (`@google/genai`) using the Gemini 2.5 Flash model.

### Architecture
- **Service Layer Pattern**:
  - `services/storage.ts`: Abstraction layer for data persistence. Currently implemented using `localStorage` for immediate setup and offline capability, but designed to be easily swapped for a backend (e.g., Firebase) in the future.
  - `services/gemini.ts`: Handles all interactions with the Google Gemini API, isolating AI logic from UI components.
- **Component Design**: Modular components split by domain (`GoalComponents`, `HabitComponents`, `DashboardComponents`) to maintain readability and separation of concerns.
- **Zero-Build Setup (Conceptually)**: The application uses ES Modules and CDN imports in `index.html` to demonstrate a lightweight architecture, though in production a bundler like Vite would be recommended.

## 🚀 Setup & Installation

### Prerequisites
- A Google AI Studio API Key.

### Environment Variables
The application requires a valid API key to power the AI features (Briefing and Chat).
Ensure `process.env.API_KEY` is available in your runtime environment.

### Running the App
1. **Clone the repository** (if applicable).
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Start the development server**:
   ```bash
   npm start
   ```
4. **Login**:
   - The app features a simulated login screen.
   - Click **"Continue with Google"** (Simulated user "Alex") or **"Continue as Guest"**.

## 🧠 AI Features
- **Context-Aware Prompting**: The dashboard feeds your current goals, active habits, and today's calendar events into the prompt context. This allows Gemini to give specific, actionable advice rather than generic motivation.
- **Models Used**: `gemini-2.5-flash` is used for high-speed, low-latency responses suitable for interactive chat and page-load briefings.
