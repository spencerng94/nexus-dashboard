import { CalendarEvent, User } from '../types';

declare const google: any;

let tokenClient: any;
let currentClientId: string | null = null;
let loginResolver: ((user: User) => void) | null = null;
let loginRejector: ((error: any) => void) | null = null;
let activeTimeoutId: any = null;
let isRequesting = false; // Lock to prevent multiple popups

const SCOPES = 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email';

const resetState = () => {
  if (activeTimeoutId) {
    clearTimeout(activeTimeoutId);
    activeTimeoutId = null;
  }
  isRequesting = false;
  loginResolver = null;
  loginRejector = null;
};

export const googleService = {
  /**
   * Initialize the Google Identity Services Token Client
   */
  init(clientId: string) {
    if (typeof google === 'undefined') {
      throw new Error('Google Identity Services script not loaded. Check internet connection.');
    }

    // If we are already initialized with this ID, don't re-init
    if (tokenClient && currentClientId === clientId) {
        return;
    }

    // If we are changing IDs or initializing for the first time, reset everything
    resetState();

    console.log("Initializing Google Client with ID:", clientId);

    try {
      tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: SCOPES,
        callback: async (response: any) => {
          console.log("GIS Callback received.");
          if (activeTimeoutId) clearTimeout(activeTimeoutId);
          isRequesting = false;
  
          if (response.error) {
            console.error("GIS Error Response:", response);
            if (loginRejector) {
              loginRejector(new Error(`Google Error: ${response.error}`));
            }
            resetState();
            return;
          }
  
          const accessToken = response.access_token;
  
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
            
            if (loginResolver) {
              loginResolver(user);
            }
          } catch (err) {
            console.error("User Info Fetch Error:", err);
            if (loginRejector) loginRejector(err);
          } finally {
            resetState();
          }
        },
        error_callback: (nonResponseError: any) => {
          console.error("GIS Configuration/Popup Error:", nonResponseError);
          
          let errorMessage = "Google Sign-In failed.";
      
          if (nonResponseError.type === 'popup_closed') {
              const currentOrigin = window.location.origin;
              errorMessage = `Login Popup Closed.\n\n1. Check 'Authorized Origins' in Google Cloud Console.\n2. Ensure this URL is added exactly:\n   ${currentOrigin}\n3. If you closed the window manually, please try again.`;
          } else if (nonResponseError.type === 'popup_blocked') {
              errorMessage = "Popup blocked. Please allow popups for this site.";
          } else {
              errorMessage = `Configuration Error: ${nonResponseError.message}`;
          }
  
          if (loginRejector) {
              loginRejector(new Error(errorMessage));
          }
          resetState();
        }
      });
      currentClientId = clientId;
    } catch (e) {
      console.error("Failed to initialize token client:", e);
      resetState();
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
        reject(new Error('A login popup is already open. Please check your other windows or tabs.'));
        return;
      }

      console.log("Requesting Access Token...");
      isRequesting = true;
      loginResolver = resolve;
      loginRejector = reject;

      // Safety timeout: 2 minutes
      activeTimeoutId = setTimeout(() => {
        console.warn("Login timed out by application.");
        if (loginRejector) {
           loginRejector(new Error("Login timed out. Please try again."));
        }
        resetState();
      }, 120000);

      try {
        // Use 'select_account' to avoid 'consent' forcing re-approval loops,
        // while still allowing the user to pick an account.
        tokenClient.requestAccessToken({ prompt: 'select_account' });
      } catch (e: any) {
        console.error("GIS Launch Error:", e);
        
        let msg = "Failed to launch Google Sign-In.";
        
        // Handle the specific "pending" error from Google
        if (e.message && e.message.includes('pending')) {
            msg = "A login window is already open in the background.\n\nPlease find and close the existing Google Sign-in window, then try again.";
            // We do NOT reset state here because the popup IS actually open
        } else {
            msg += " " + (e.message || "");
            resetState();
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
