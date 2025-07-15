# Firebase Setup Instructions

Your PeacePath app is now configured with Firebase! Here's what you need to do to complete the setup:

## 1. Firebase Project Setup

1. **Go to [Firebase Console](https://console.firebase.google.com/)**
2. **Select your existing project: `budget-tracker-e76ef`**
3. **Enable Authentication:**
   - Go to Authentication > Sign-in method
   - Enable "Phone" provider
   - Configure your app's domain if needed

4. **Enable Firestore:**
   - Go to Firestore Database
   - Create database in production mode (rules are already deployed)
   - Choose a location closest to your users

## 2. Test Authentication

1. **Start the app:**
   ```bash
   pnpm expo start
   ```

2. **Open in simulator or device**

3. **Test the login flow:**
   - Enter a phone number
   - Receive SMS verification code
   - Complete authentication

## 3. Verify Everything Works

Your `.env.local` file already has the correct Firebase configuration:
- Project ID: `budget-tracker-e76ef`
- All necessary API keys and configuration

## 4. Security Rules

The Firestore security rules have been deployed and restrict access so users can only read/write their own data.

## 5. Next Steps

Once authentication is working:
1. Test user sign-up and sign-in
2. Verify user data is stored in Firestore
3. Test sign-out functionality

## Files Created:
- `firebase.config.ts` - Firebase initialization
- `firestore.rules` - Security rules (already deployed)
- `firebase.json` - Firebase project configuration
- `.firebaserc` - Project mapping
- Authentication services and stores in `src/`

The app is now ready for Phase 2: Contact Sync & Matching!