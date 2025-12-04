import { CalendarEvent, User } from '../types';

declare const google: any;

let tokenClient: any;
let currentClientId: string | null = null;
let loginResolver: ((user: User) => void) | null = null;
let loginRejector: ((error: any) => void) | null = null;
let activeTimeoutId: any = null;

const SCOPES = 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email';

export const googleService = {
  /**
   * Initialize the Google Identity Services Token Client
   */
  init(clientId: string) {
    if (typeof google === 'undefined') {
      throw new Error('Google Identity Services script not loaded. Check internet connection.');
    }

    // Avoid re-initializing if already set up with same ID
    if (tokenClient && currentClientId === clientId) {
        console.log("Google Client already initialized.");
        return;
    }

    // Cleanup previous attempts if any
    if (loginRejector) {
      const err = new Error("Interrupted by new initialization.");
      loginRejector(err);
      loginRejector = null;
      loginResolver = null;
    }
    if (activeTimeoutId) {
      clearTimeout(activeTimeoutId);
      activeTimeoutId = null;
    }

    console.log("Initializing Google Client...");

    try {
      tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: SCOPES,
        callback: async (response: any) => {
          // Clear timeout immediately upon response
          if (activeTimeoutId) {
              clearTimeout(activeTimeoutId);
              activeTimeoutId = null;
          }
  
          console.log("GIS Callback received:", response);
  
          if (response.error) {
            console.error("GIS Error:", response);
            if (loginRejector) {
              let msg = `Google Auth Error: ${response.error}`;
              if (response.error === 'popup_closed_by_user') {
                  msg = "Login cancelled by user.";
              } else if (response.error === 'access_denied') {
                  msg = "Access denied. You must grant permission to use the app.";
              }
              loginRejector(new Error(msg));
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
        error_callback: (nonResponseError: any) => {
          // Handles configuration errors or immediate load failures
          if (activeTimeoutId) {
              clearTimeout(activeTimeoutId);
              activeTimeoutId = null;
          }
          console.error("GIS Configuration Error:", nonResponseError);
          
          let errorMessage = "Google Sign-In failed.";
      
          if (nonResponseError.type === 'popup_closed') {
              errorMessage = "Login cancelled.\n\nDid you see an error in the popup?\n• Check for 'Error 400: redirect_uri_mismatch'. If so, update your Authorized Origins in Google Cloud.\n• Check for 'Error 403: access_denied'. Check your Test Users list.";
          } else if (nonResponseError.type === 'popup_blocked') {
              errorMessage = "Popup blocked. Please allow popups for this website in your browser settings.";
          } else {
              errorMessage = `Configuration Error: ${nonResponseError.message || JSON.stringify(nonResponseError)}`;
          }
  
          if (loginRejector) {
              loginRejector(new Error(errorMessage));
              loginRejector = null;
              loginResolver = null;
          }
        }
      });
      currentClientId = clientId;
    } catch (e) {
      console.error("Failed to initialize token client:", e);
      throw new Error("Failed to initialize Google Sign-In. Check your Client ID.");
    }
  },

  /**
   * Trigger the popup login flow
   */
  login(): Promise<User> {
    return new Promise((resolve, reject) => {
      if (!tokenClient) {
        reject(new Error('Google Client not initialized. Please configure Client ID.'));
        return;
      }

      console.log("Requesting Access Token...");

      // Clear any stale timeouts
      if (activeTimeoutId) {
          clearTimeout(activeTimeoutId);
      }

      // Safety timeout
      activeTimeoutId = setTimeout(() => {
        const err = new Error("Login timed out.\n\nDid you see an error in the popup?\nCheck for 'Error 400: redirect_uri_mismatch' or 'Error 403: access_denied'.\nIf the popup closed immediately, check your popup blocker.");
        if (loginRejector) {
           loginRejector(err);
           loginResolver = null;
           loginRejector = null;
        }
        activeTimeoutId = null;
      }, 60000);

      loginResolver = resolve;
      loginRejector = reject;

      try {
        // Use overridablePrompt to force account selection if needed
        tokenClient.requestAccessToken({ prompt: 'consent' });
      } catch (e: any) {
        console.error("GIS Launch Error", e);
        if (activeTimeoutId) {
            clearTimeout(activeTimeoutId);
            activeTimeoutId = null;
        }
        
        let msg = "Failed to launch Google Sign-In popup.";
        if (e.message && e.message.includes('pending')) {
            msg = "A login popup is already open or pending. Please check other windows or try again in a moment.";
        } else {
            msg += " " + (e.message || "");
        }

        reject(new Error(msg));
        loginResolver = null;
        loginRejector = null;
      }
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