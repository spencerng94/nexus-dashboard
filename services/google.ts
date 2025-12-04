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

    // Idempotency check: If already initialized with the same ID, do nothing.
    if (tokenClient && currentClientId === clientId) {
        console.log("Google Token Client already initialized.");
        return;
    }

    console.log("Initializing Google Token Client...");

    try {
      tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: clientId,
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

      if (isRequesting) {
        // If a request is already in progress, we can't easily cancel it in GIS.
        // We reject the new request to prevent stacking.
        const msg = "A login popup is already open. Please check your other windows.";
        console.warn(msg);
        reject(new Error(msg));
        return;
      }

      isRequesting = true;

      // Define the handler for this specific login attempt
      tokenClient.callback = async (response: any) => {
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
        
        let errorMessage = "Google Sign-In failed.";
    
        if (nonResponseError.type === 'popup_closed') {
            const currentOrigin = window.location.origin;
            errorMessage = `Login Window Closed.\n\n1. Check 'Authorized Origins' in Google Cloud Console.\n2. Ensure this URL is added EXACTLY (no trailing slash):\n   ${currentOrigin}\n3. If you just added it, wait 5 minutes.\n4. If you closed the window manually, try again.`;
        } else if (nonResponseError.type === 'popup_blocked') {
            errorMessage = "Popup blocked. Please check your browser address bar for a blocked popup icon.";
        } else {
            errorMessage = `Configuration Error: ${nonResponseError.message}`;
        }

        reject(new Error(errorMessage));
      };

      try {
        // 'select_account' is often more robust than 'consent' for repeated logins
        tokenClient.requestAccessToken({ prompt: 'select_account' });
      } catch (e: any) {
        console.error("GIS Launch Error:", e);
        isRequesting = false; // Release lock on crash
        
        let msg = "Failed to launch Google Sign-In.";
        if (e.message && e.message.includes('pending')) {
           // This specific error means the lock variable got out of sync with Google's internal state
           msg = "A login window is already open in the background. Please close it and try again.";
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
