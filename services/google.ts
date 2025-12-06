import { CalendarEvent, User } from '../types';

declare const google: any;

let tokenClient: any | null = null;
let currentClientId: string | null = null;
let isRequesting = false;

const SCOPES =
  'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email';

export const googleService = {
  /**
   * Initialize Google Identity Services token client
   * - clientId optional, fallback to REACT_APP_GOOGLE_CLIENT_ID / VITE_GOOGLE_CLIENT_ID
   * - If missing, operates in guest mode
   */
  init(clientId?: string) {
    const envClientId =
      typeof process !== 'undefined'
        ? process.env.REACT_APP_GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID
        : undefined;

    const resolved = (clientId && clientId.trim()) || (envClientId && envClientId.trim()) || '';

    if (!resolved) {
      // Guest mode
      console.info('Guest mode active, skipping OAuth');
      tokenClient = null;
      currentClientId = null;
      return;
    }

    if (typeof google === 'undefined' || !google?.accounts?.oauth2?.initTokenClient) {
      throw new Error('Google Identity Services script not loaded.');
    }

    const cleanId = resolved.trim();
    if (tokenClient && currentClientId === cleanId) return;

    try {
      tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: cleanId,
        scope: SCOPES,
        callback: async (response: any) => {
          console.log('Global callback received', response);
        },
        error_callback: (err: any) => {
          console.error('Global error callback:', err);
        },
      });
      currentClientId = cleanId;
      console.log('Google Token Client initialized.');
    } catch (e) {
      console.error('Failed to initialize token client', e);
      tokenClient = null;
      currentClientId = null;
      throw new Error('Failed to initialize Google Sign-In.');
    }
  },

  /**
   * Trigger login flow
   */
  login(): Promise<User> {
    return new Promise((resolve, reject) => {
      if (!tokenClient) {
        reject(new Error('Guest mode: OAuth not initialized.'));
        return;
      }

      if (isRequesting) {
        reject(new Error('Login popup already open.'));
        return;
      }

      isRequesting = true;

      tokenClient.callback = async (response: any) => {
        isRequesting = false;
        if (response?.error) {
          reject(new Error(`Google Error: ${response.error}`));
          return;
        }

        const accessToken = response?.access_token;
        if (!accessToken) {
          reject(new Error('No access token received.'));
          return;
        }

        try {
          const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` },
          });

          if (!userInfoResponse.ok) throw new Error('Failed to fetch user profile');

          const userInfo = await userInfoResponse.json();

          resolve({
            uid: userInfo.sub,
            displayName: userInfo.name,
            photoURL: userInfo.picture,
            email: userInfo.email,
            accessToken,
          });
        } catch (err) {
          reject(err);
        }
      };

      tokenClient.error_callback = (err: any) => {
        isRequesting = false;
        tokenClient = null;
        currentClientId = null;
        reject(new Error(err?.message || 'Google Sign-In failed.'));
      };

      try {
        tokenClient.requestAccessToken({ prompt: 'select_account' });
      } catch (e: any) {
        isRequesting = false;
        tokenClient = null;
        currentClientId = null;
        reject(new Error(e?.message || 'Failed to launch Google Sign-In.'));
      }
    });
  },

  /**
   * Calendar methods
   */
  async listEvents(token?: string | null): Promise<CalendarEvent[]> {
    if (!token) return [];
    const now = new Date();
    const startRange = new Date();
    startRange.setMonth(now.getMonth() - 2);
    startRange.setHours(0, 0, 0, 0);
    const endRange = new Date();
    endRange.setMonth(now.getMonth() + 3);

    try {
      const res = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${startRange.toISOString()}&timeMax=${endRange.toISOString()}&singleEvents=true&orderBy=startTime`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error('Failed to fetch events');
      const data = await res.json();
      return (data.items || []).map((item: any) => {
        const start = new Date(item.start.dateTime || item.start.date);
        const end = new Date(item.end.dateTime || item.end.date);
        const durationMs = end.getTime() - start.getTime();
        const hours = Math.floor(durationMs / 3600000);
        const mins = Math.round((durationMs % 3600000) / 60000);
        let durationStr = 'All Day';
        if (item.start.dateTime) {
          durationStr = `${hours > 0 ? hours + 'h' : ''}${mins > 0 ? ' ' + mins + 'm' : ''}`.trim();
          if (!durationStr) durationStr = '30m';
        }
        return {
          id: item.id,
          title: item.summary || 'Untitled',
          time: start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          startTime: start.getTime(),
          type: 'work',
          duration: durationStr,
        };
      });
    } catch (e) {
      console.error('Calendar fetch error', e);
      throw e;
    }
  },

  async createEvent(token: string | null | undefined, event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent | null> {
    if (!token) return null;
    const start = new Date(event.startTime);
    let durationMinutes = 60;
    if (event.duration === 'All Day') durationMinutes = 1440;
    const end = new Date(start.getTime() + durationMinutes * 60000);
    try {
      const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ summary: event.title, start: { dateTime: start.toISOString() }, end: { dateTime: end.toISOString() } }),
      });
      if (!res.ok) throw new Error('Failed to create event');
      const data = await res.json();
      return { ...event, id: data.id, startTime: new Date(data.start.dateTime || data.start.date).getTime() };
    } catch (e) {
      console.error('Create event error', e);
      throw e;
    }
  },

  async deleteEvent(token: string | null | undefined, eventId: string): Promise<boolean> {
    if (!token) return false;
    try {
      const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      return res.ok;
    } catch (e) {
      console.error('Delete event error', e);
      throw e;
    }
  },

  async updateEvent(token: string | null | undefined, eventId: string, updates: any): Promise<boolean> {
    if (!token) return false;
    try {
      const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      return res.ok;
    } catch (e) {
      console.error('Update event error', e);
      throw e;
    }
  },
};
