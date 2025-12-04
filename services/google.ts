import { CalendarEvent, User } from '../types';

declare const google: any;

let tokenClient: any | null = null;
let currentClientId: string | null = null;
let isRequesting = false;

const SCOPES = 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email';

export const googleService = {
  /**
   * Initialize the Google Identity Services Token Client
   * This is now idempotent - it won't re-initialize if the client ID hasn't changed.
   */
  init(clientId: string) {
    if (typeof google === 'undefined') {
      throw new Error('Google Identity Services script not loaded. Check internet connection.');
    }

    // Validation
    if (!clientId || clientId.trim() === '') {
        throw new Error("Client ID is empty.");
    }
    const cleanId = clientId.trim();

    // Idempotency check: If already initialized with the same ID, do nothing.
    if (tokenClient && currentClientId === cleanId) {
        console.log("Google Token Client already initialized for ID:", cleanId);
        return;
    }

    console.log(`Initializing Google Token Client...`);
    console.log(`- Client ID: ${cleanId}`);
    console.log(`- Origin: ${window.location.origin}`);

    try {
      tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: cleanId,
        scope: SCOPES,
        // The callback function is standard for handling the response
        callback: async (response: any) => {
          // This global handler will be overridden by the specific promise resolver in login(),
          // but we define a default here to prevent crashes if called externally.
          console.log("Global callback received (should be handled by promise).", response);
        },
        error_callback: (nonResponseError: any) => {
             console.error("Global error callback:", nonResponseError);
        }
      });
      currentClientId = cleanId;
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

      if (isRequesting) {
        const msg = "A login popup is already open. Please check your other windows.";
        console.warn(msg);
        reject(new Error(msg));
        return;
      }

      console.log("Starting login flow...");
      isRequesting = true;

      // Define the handler for this specific login attempt
      tokenClient.callback = async (response: any) => {
        console.log("Login callback received.");
        isRequesting = false; // Release lock
        
        if (response.error) {
          console.error("GIS Response Error:", response);
          reject(new Error(`Google Error: ${response.error}`));
          return;
        }

        const accessToken = response.access_token;
        if (!accessToken) {
            reject(new Error("No access token received."));
            return;
        }

        try {
          // Fetch user profile
          const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` }
          });
          
          if (!userInfoResponse.ok) {
             throw new Error("Failed to fetch user profile");
          }

          const userInfo = await userInfoResponse.json();

          const user: User = {
            uid: userInfo.sub,
            displayName: userInfo.name,
            photoURL: userInfo.picture,
            email: userInfo.email,
            accessToken: accessToken
          };
          
          resolve(user);
        } catch (err) {
          console.error("User Info Fetch Error:", err);
          reject(err);
        }
      };

      // Define the error handler for this specific login attempt
      tokenClient.error_callback = (nonResponseError: any) => {
        isRequesting = false; // Release lock
        console.error("GIS Error Callback:", nonResponseError);
        
        // CRITICAL: If an error occurs, we destroy the client to force a fresh init next time.
        // This prevents the "pending" loop if the browser's internal state gets desynced.
        tokenClient = null;
        currentClientId = null;
        
        let errorMessage = "Google Sign-In failed.";
    
        if (nonResponseError.type === 'popup_closed') {
            const currentOrigin = window.location.origin;
            errorMessage = `Login Window Closed.\n\n1. Check 'Authorized JavaScript Origins' (NOT Redirect URIs) in Google Cloud.\n2. Ensure this URL is added EXACTLY:\n   ${currentOrigin}\n3. Note: Changes take 5 minutes to propagate.`;
        } else if (nonResponseError.type === 'popup_blocked') {
            errorMessage = "Popup blocked. Please check your address bar for a blocked popup icon.";
        } else {
            errorMessage = `Configuration Error: ${nonResponseError.message || nonResponseError.type}`;
        }

        reject(new Error(errorMessage));
      };

      try {
        // We use 'select_account' to ensure the user actually sees the Google screen
        // and doesn't get auto-rejected by a silent failure.
        tokenClient.requestAccessToken({ prompt: 'select_account' });
      } catch (e: any) {
        console.error("GIS Launch Error:", e);
        isRequesting = false; 
        
        // If we crash here, also reset the client to be safe.
        tokenClient = null;
        currentClientId = null;
        
        let msg = "Failed to launch Google Sign-In.";
        if (e.message && e.message.includes('pending')) {
           msg = "A login window is already open or stuck. Please reload the page and try again.";
        } else {
           msg += " " + (e.message || "");
        }
        reject(new Error(msg));
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
        let detailedError = response.statusText;
        try {
            const errorBody = await response.json();
            if (errorBody.error && errorBody.error.message) {
                detailedError = errorBody.error.message;
            }
        } catch (jsonErr) {
            // If json parse fails, stick with statusText
        }
        
        console.error("Google Calendar API Error Detail:", detailedError);
        throw new Error(detailedError);
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
    } catch (e: any) {
      console.error("Google Calendar Fetch Error:", e);
      // Re-throw so the UI knows there was an error
      throw e;
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
      
      if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData?.error?.message || "Failed to create event");
      }
      const data = await response.json();
      
      return {
        ...event,
        id: data.id,
        startTime: new Date(data.start.dateTime || data.start.date).getTime()
      };
    } catch (e) {
      console.error("Create Event Error", e);
      throw e;
    }
  }
};