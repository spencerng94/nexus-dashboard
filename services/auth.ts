import { signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser, GoogleAuthProvider } from 'firebase/auth';
import { auth, googleProvider } from './firebase';
import { User } from '../types';
import { firestoreService } from './firestore';

const TOKEN_KEY = 'nexus_google_access_token';

export const authService = {
  /**
   * Sign in with Google Popup
   */
  async login(): Promise<User> {
    try {
      // CRITICAL FIX: Force the consent screen to appear.
      // This ensures the user sees the checkboxes for Calendar permissions if they were previously missed or the token is stale.
      googleProvider.setCustomParameters({
        prompt: 'select_account consent'
      });

      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      
      // Extract Google Access Token for Calendar API
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const accessToken = credential?.accessToken;

      if (accessToken) {
        localStorage.setItem(TOKEN_KEY, accessToken);
      } else {
        console.warn("No access token returned from Google Sign-In");
      }
      
      // Check if user exists in Firestore, if not create base profile
      const existingProfile = await firestoreService.getUserProfile(fbUser.uid);
      
      let userProfile: User = {
        uid: fbUser.uid,
        displayName: fbUser.displayName,
        photoURL: fbUser.photoURL,
        email: fbUser.email,
        accessToken: accessToken || undefined,
        theme: 'auto', 
        isGuest: false
      };

      if (existingProfile) {
        // Merge existing preferences with latest auth info
        userProfile = { 
          ...userProfile, 
          ...existingProfile, 
          // Prefer fresh token, fallback to existing if needed
          accessToken: accessToken || userProfile.accessToken 
        };
      } else {
        // Save new user to Firestore
        await firestoreService.saveUserProfile(userProfile);
      }

      return userProfile;
    } catch (error) {
      console.error("Login failed", error);
      throw error;
    }
  },

  /**
   * Login as Guest
   */
  loginGuest(): User {
     return {
        uid: 'guest-' + Date.now(),
        displayName: 'Guest',
        photoURL: null,
        email: null,
        isGuest: true,
        theme: 'auto'
     };
  },

  /**
   * Sign out
   */
  async logout(): Promise<void> {
    localStorage.removeItem(TOKEN_KEY);
    await signOut(auth);
  },

  /**
   * Auth State Observer
   */
  onUserChanged(callback: (user: User | null) => void) {
    return onAuthStateChanged(
      auth, 
      async (fbUser: FirebaseUser | null) => {
        if (fbUser) {
          try {
            // Fetch full profile including theme/config preferences
            const profile = await firestoreService.getUserProfile(fbUser.uid);
            
            // Try to recover access token from local storage (since Firebase doesn't persist provider tokens)
            const storedToken = localStorage.getItem(TOKEN_KEY);

            const appUser: User = {
              uid: fbUser.uid,
              displayName: fbUser.displayName,
              photoURL: fbUser.photoURL,
              email: fbUser.email,
              accessToken: storedToken || undefined,
              isGuest: false,
              ...profile // Spread saved preferences (theme, config, avatar)
            };
            callback(appUser);
          } catch (e) {
            console.error("Error hydrating user:", e);
            // Fallback to basic user if hydration fails
            const storedToken = localStorage.getItem(TOKEN_KEY);
            callback({
                uid: fbUser.uid,
                displayName: fbUser.displayName,
                photoURL: fbUser.photoURL,
                email: fbUser.email,
                accessToken: storedToken || undefined,
                isGuest: false,
                theme: 'auto'
            });
          }
        } else {
          callback(null);
        }
      },
      (error) => {
        console.error("Auth state change error:", error);
        callback(null);
      }
    );
  }
};