# Nexus Dashboard

Nexus is an intelligent personal productivity dashboard designed to help you organize your life. It combines goal tracking, habit formation, and calendar management with the power of Generative AI to provide daily insights and assistance.

## ✨ Features

- **Daily Briefing**: Starts your day with an AI-generated summary of your schedule, focus areas, and habits, acting as a personal concierge.
- **Goal Tracking**: Set targets (e.g., "Read 100 pages") and track progress visually with increment/decrement controls.
- **Habit Tracker**: Build consistency with daily check-ins, streak tracking, and detailed history views (Calendar & List). Includes note-taking for every check-in.
- **Calendar**: 
  - **Google Calendar Sync**: View and add events directly to your primary Google Calendar (Requires Login).
  - **Local Calendar**: Full functionality available for guest users.
- **AI Assistant**: A built-in chat widget context-aware of your dashboard data, ready to answer questions about your schedule or help you brainstorm.
- **Local Privacy**: Data is currently persisted to your browser's LocalStorage, ensuring your personal data stays on your device.

## 🛠️ Technology & Design Decisions

### Tech Stack
- **Frontend Framework**: React 19 (TypeScript)
- **Styling**: Tailwind CSS (Utility-first styling for rapid UI development)
- **Icons**: Lucide React
- **AI Integration**: Google GenAI SDK (`@google/genai`) using the Gemini 2.5 Flash model.
- **Auth & Calendar**: Google Identity Services SDK (OAuth 2.0).

### Architecture
- **Service Layer Pattern**:
  - `services/storage.ts`: Abstraction layer for local data persistence.
  - `services/google.ts`: Handles Google OAuth authentication and Calendar API interactions.
  - `services/gemini.ts`: Handles interactions with the Google Gemini API.
- **Component Design**: Modular components split by domain (`GoalComponents`, `HabitComponents`, `DashboardComponents`) to maintain readability and separation of concerns.

## 🚀 Setup & Installation

### Prerequisites
- Node.js installed.
- A Google AI Studio API Key.
- A Google Cloud Project for OAuth.

### 1. Google Cloud Configuration (For Calendar Sync)
To enable the "Sign in with Google" feature locally:
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project.
3. Search for **"Google Calendar API"** and enable it.
4. Go to **APIs & Services > Credentials**.
5. Click **Create Credentials > OAuth client ID**.
6. Select **Web application**.
7. **CRITICAL STEP**: Under **Authorized JavaScript origins**, paste the exact URL your app is running on (e.g., `http://localhost:3000` or `http://127.0.0.1:5173`).
   * *Tip: You can find this URL in the "Configure Client ID" section of the app's login screen.*
8. Copy the **Client ID**.

### 2. Environment Variables
1. Create a file named `.env` in the root directory.
2. Add your API key (for Gemini) and optionally your Client ID (for Calendar):
   ```
   REACT_APP_API_KEY=your_gemini_api_key
   # Optional: Pre-fill Client ID in Login Screen code if using a build system that supports env injection
   # REACT_APP_GOOGLE_CLIENT_ID=your_oauth_client_id 
   ```

### 3. Running the App
1. **Clone the repository**.
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Start the development server**:
   ```bash
   npm start
   # or
   npm run dev
   ```
4. **Login**:
   - On the Login Screen, click **"Configure Client ID"** at the bottom.
   - Paste the **Client ID** you copied from Google Cloud Console.
   - Verify the "Authorized Origin" matches your browser URL.
   - Click **"Sign in with Google"**.

## 🔧 Troubleshooting

### Error 400: redirect_uri_mismatch
If you see this error when signing in, it means your current browser URL is not in the "Authorized JavaScript origins" list in Google Cloud Console.
1. Look at the "Your Current Origin" box on the app's login screen (e.g., `http://localhost:5173`).
2. Go to Google Cloud Console > Credentials > Your OAuth Client.
3. Add that **exact** URL to the Authorized JavaScript origins list.
4. Save and wait 5 minutes for changes to propagate.

### Error 403: access_denied / App not verified
If you see "This app has not completed the Google verification process", it is because your Google Cloud project is in **Testing** mode.
1. Go to Google Cloud Console > **APIs & Services** > **OAuth consent screen**.
2. Scroll to **Test users**.
3. Click **+ ADD USERS**.
4. Enter your email address and click Save.

## 🧠 AI Features
- **Context-Aware Prompting**: The dashboard feeds your current goals, active habits, and today's calendar events into the prompt context.
- **Models Used**: `gemini-2.5-flash` is used for high-speed, low-latency responses.