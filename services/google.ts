import { CalendarEvent, User } from '../types';

declare const google: any;

let tokenClient: any;
let loginResolver: ((user: User) => void) | null = null;
let loginRejector: ((error: any) => void) | null = null;
let initializedClientId: string | null = null;

const SCOPES = 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email';

export const googleService = {
  /**
   * Initialize the Google Identity Services Token Client
   */
  init(clientId: string) {
    if (typeof google === 'undefined') {
      throw new Error('Google Identity Services script not loaded');
    }

    // Idempotent check: Do not re-initialize if the client ID hasn't changed.
    // This prevents detaching active callbacks.
    if (tokenClient && initializedClientId === clientId) {
      console.log("Google Client already initialized.");
      return;
    }

    console.log("Initializing Google Client...");

    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPES,
      callback: async (response: any) => {
        console.log("GIS Callback received:", response);

        if (response.error) {
          console.error("GIS Error:", response);
          if (loginRejector) {
            loginRejector(new Error(`Google Auth Error: ${response.error}`));
            loginRejector = null;
            loginResolver = null;
          }
          return;
        }

        const accessToken = response.access_token;

        try {
          console.log("Fetching user profile...");
          // Fetch user profile immediately after getting token
          const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` }
          });
          
          if (!userInfoResponse.ok) {
             throw new Error("Failed to fetch user profile");
          }

          const userInfo = await userInfoResponse.json();
          console.log("User profile fetched successfully.");

          const user: User = {
            uid: userInfo.sub,
            displayName: userInfo.name,
            photoURL: userInfo.picture,
            email: userInfo.email,
            accessToken: accessToken
          };
          
          if (loginResolver) {
            loginResolver(user);
            loginResolver = null;
            loginRejector = null;
          }
        } catch (err) {
          console.error("User Info Fetch Error:", err);
          if (loginRejector) {
            loginRejector(err);
            loginRejector = null;
            loginResolver = null;
          }
        }
      },
    });
    
    initializedClientId = clientId;
  },

  /**
   * Trigger the popup login flow
   */
  login(): Promise<User> {
    return new Promise((resolve, reject) => {
      if (!tokenClient) {
        reject(new Error('Google Client not initialized. Please provide a Client ID.'));
        return;
      }

      console.log("Requesting Access Token...");

      // Safety timeout: Reject if no response within 60 seconds (user closed popup, etc)
      const timeoutId = setTimeout(() => {
        const err = new Error("Login timed out. This often happens if the popup was closed, blocked, or if the network connection failed.");
        if (loginRejector) {
           loginRejector(err);
           // Clear handlers to prevent late resolution
           loginResolver = null;
           loginRejector = null;
        }
      }, 60000);

      // Set up the single-use handlers for this specific login attempt
      loginResolver = (user) => {
        clearTimeout(timeoutId);
        resolve(user);
      };

      loginRejector = (error) => {
        clearTimeout(timeoutId);
        reject(error);
      };

      // Force consent prompt to ensure fresh token and clear flow
      tokenClient.requestAccessToken({ prompt: 'consent' });
    });
  },

  /**
   * Fetch primary calendar events from Google Calendar API
   */
  async listEvents(token: string): Promise<CalendarEvent[]> {
    const now = new Date();
    
    // Set timeMin to 2 months ago
    const startRange = new Date();
    startRange.setMonth(now.getMonth() - 2);
    startRange.setHours(0, 0, 0, 0);

    // Set timeMax to 3 months in the future
    const endRange = new Date();
    endRange.setMonth(now.getMonth() + 3);

    try {
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${startRange.toISOString()}&timeMax=${endRange.toISOString()}&singleEvents=true&orderBy=startTime`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (!response.ok) {
        console.error("Google API Error", response.status, response.statusText);
        throw new Error('Failed to fetch events');
      }
      
      const data = await response.json();
      
      return (data.items || []).map((item: any) => {
        const start = new Date(item.start.dateTime || item.start.date);
        const end = new Date(item.end.dateTime || item.end.date);
        const durationMs = end.getTime() - start.getTime();
        const durationHrs = Math.floor(durationMs / 3600000);
        const durationMins = Math.round((durationMs % 3600000) / 60000);
        
        let durationStr = "All Day";
        if (item.start.dateTime) {
             durationStr = durationHrs > 0 ? `${durationHrs}h` : "";
             if (durationMins > 0) durationStr += ` ${durationMins}m`;
             if (durationStr === "") durationStr = "30m"; 
        }

        return {
          id: item.id,
          title: item.summary || "Untitled",
          time: start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          startTime: start.getTime(),
          type: 'work',
          duration: durationStr.trim()
        };
      });
    } catch (e) {
      console.error("Google Calendar Fetch Error", e);
      return [];
    }
  },

  /**
   * Create a new event in the primary Google Calendar
   */
  async createEvent(token: string, event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent | null> {
    const start = new Date(event.startTime);
    let durationMinutes = 60; 
    const dStr = event.duration;
    
    if (dStr === 'All Day') {
        durationMinutes = 1440;
    } else {
        const hMatch = dStr.match(/(\d+)h/);
        const mMatch = dStr.match(/(\d+)m/);
        let mins = 0;
        if (hMatch) mins += parseInt(hMatch[1]) * 60;
        if (mMatch) mins += parseInt(mMatch[1]);
        if (mins > 0) durationMinutes = mins;
    }

    const end = new Date(start.getTime() + durationMinutes * 60000);

    const eventResource = {
      summary: event.title,
      start: { dateTime: start.toISOString() },
      end: { dateTime: end.toISOString() }
    };

    try {
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events`,
        {
          method: 'POST',
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(eventResource)
        }
      );
      
      if (!response.ok) throw new Error('Failed to create event');
      const data = await response.json();
      
      return {
        ...event,
        id: data.id,
        startTime: new Date(data.start.dateTime || data.start.date).getTime()
      };
    } catch (e) {
      console.error("Create Event Error", e);
      return null;
    }
  }
};