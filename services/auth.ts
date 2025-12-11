
import { signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, googleProvider } from './firebase';
import { User } from '../types';
import { firestoreService } from './firestore';

export const authService = {
  /**
   * Sign in with Google Popup
   * Checks if user profile exists in Firestore; if not, creates it.
   * Returns fully hydrated User object (with theme, config, etc.)
   */
  async login(): Promise<User> {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      
      // Fetch existing profile settings (theme, dashboard config)
      const existingProfile = await firestoreService.getUserProfile(fbUser.uid);
      
      let appUser: User = {
        uid: fbUser.uid,
        displayName: fbUser.displayName,
        photoURL: fbUser.photoURL,
        email: fbUser.email,
        accessToken: await fbUser.getIdToken(),
        theme: 'auto', // Defaults
        isGuest: false
      };

      if (existingProfile) {
        // Merge existing preferences with latest auth info
        appUser = { ...appUser, ...existingProfile, accessToken: await fbUser.getIdToken() };
      } else {
        // First time login: Save base profile to Firestore
        await firestoreService.saveUserProfile(appUser);
      }

      return appUser;
    } catch (error) {
      console.error("Login failed", error);
      throw error;
    }
  },

  /**
   * Sign out
   */
  async logout(): Promise<void> {
    await signOut(auth);
  },

  /**
   * Auth State Observer
   * Hydrates the user profile from Firestore whenever Auth state changes.
   */
  onUserChanged(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        try {
          const profile = await firestoreService.getUserProfile(fbUser.uid);
          const token = await fbUser.getIdToken();
          
          const appUser: User = {
            uid: fbUser.uid,
            displayName: fbUser.displayName,
            photoURL: fbUser.photoURL,
            email: fbUser.email,
            accessToken: token,
            isGuest: false,
            ...profile // Spread saved preferences (theme, config, avatar)
          };
          callback(appUser);
        } catch (e) {
          console.error("Error fetching user profile on state change", e);
          callback(null);
        }
      } else {
        callback(null);
      }
    });
  }
};
