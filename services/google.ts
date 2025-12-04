import { CalendarEvent, User } from '../types';

declare const google: any;

let tokenClient: any;
let accessToken: string | null = null;

const SCOPES = 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email';

export const googleService = {
  /**
   * Initialize the Google Identity Services Token Client
   */
  init(clientId: string) {
    if (typeof google === 'undefined') {
      throw new Error('Google Identity Services script not loaded');
    }

    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPES,
      callback: (response: any) => {
        // Callback handled in login promise
      },
    });
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

      // Override callback for this specific request
      tokenClient.callback = async (resp: any) => {
        if (resp.error) {
          reject(resp);
          return;
        }
        
        accessToken = resp.access_token;

        // Fetch user profile
        try {
          const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` }
          }).then(r => r.json());

          const user: User = {
            uid: userInfo.sub,
            displayName: userInfo.name,
            photoURL: userInfo.picture,
            email: userInfo.email,
            accessToken: accessToken || undefined
          };
          
          resolve(user);
        } catch (err) {
          reject(err);
        }
      };

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

    // Set timeMax to 3 months in the future to cover upcoming planning
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
             if (durationStr === "") durationStr = "30m"; // fallback
        }

        return {
          id: item.id,
          title: item.summary || "Untitled",
          time: start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          startTime: start.getTime(),
          type: 'work', // Default categorization logic could be improved with AI
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
    // Parse duration string roughly to get end time
    // Simple parser: assumes '1h 30m' or '1h' or '30m' format
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