# PeacePath Project State Documentation

**Date**: 2025-01-15  
**Version**: 1.0.0  
**Current Phase**: Phase 1 Complete - Authentication System  

## Project Overview

PeacePath is an Expo React Native app that warns users when blocked contacts are nearby and suggests calmer paths. The project follows a privacy-first approach with email/password authentication, contact matching, and location-based proximity alerts.

## Current Implementation Status

### ✅ Phase 1: Authentication System (COMPLETE)
- **Firebase Authentication**: Email/password auth with user profile creation
- **User Profile Management**: Phone number collection and storage in Firestore
- **State Management**: Zustand store for auth state
- **Navigation**: Expo Router with proper auth flow routing
- **Testing**: Unit tests for auth service and store

### 🔄 Phase 2: Contact Sync & Matching (NOT STARTED)
- Contact permission handling
- Phone number normalization with libphonenumber-js
- Firestore contact matching system
- Known users storage

### ⏳ Phase 3: Swipe Classification UI (NOT STARTED)
- react-native-deck-swiper integration
- Relationship classification (blocked/neutral)
- Undo functionality

### ⏳ Phase 4: Location & Proximity System (NOT STARTED)
- Background location tracking
- GeoFireX proximity detection
- Push notification alerts

## Technical Architecture

### Core Technologies
- **Framework**: Expo SDK ~53.0.17
- **Navigation**: Expo Router ~5.1.3 (file-based routing)
- **State Management**: Zustand ^5.0.6
- **Backend**: Firebase (Auth + Firestore)
- **Styling**: NativeWind ^4.1.23 (with inline fallbacks)
- **Language**: TypeScript throughout
- **Testing**: Jest + @testing-library/react-native

### Key Technical Decisions

1. **Authentication Method**: 
   - **Original Plan**: Firebase Phone OTP authentication
   - **Current Implementation**: Email/password with phone number as profile data
   - **Reason**: Firebase phone auth requires paid plan, email auth is free tier compatible

2. **Navigation Pattern**:
   - **Problem**: Race conditions with auth state and navigation
   - **Solution**: Created `app/index.tsx` as auth checker route
   - **Benefit**: Prevents "navigate before mounting" errors

3. **Styling Approach**:
   - **Intended**: NativeWind (Tailwind CSS for React Native)
   - **Current**: Inline styles with NativeWind imports
   - **Issue**: NativeWind compilation problems causing style disappearance
   - **Status**: Temporary workaround, needs resolution

## File Structure Analysis

```
peacepath/
├── app/                        # Expo Router routes
│   ├── index.tsx              # Auth checker route (NEW)
│   ├── _layout.tsx            # Root layout with navigation
│   ├── (tabs)/               # Tab navigation group
│   │   ├── index.tsx         # Home screen with auth status
│   │   ├── explore.tsx       # Placeholder explore screen
│   │   └── _layout.tsx       # Tab layout configuration
│   ├── auth/                 # Authentication stack
│   │   ├── login.tsx         # Email/password login screen
│   │   └── _layout.tsx       # Auth stack layout
│   ├── +not-found.tsx        # 404 error screen
│   └── CLAUDE.md             # Navigation documentation
├── src/                       # Source code
│   ├── services/             # Business logic services
│   │   ├── authService.ts    # Firebase authentication service
│   │   └── authService.spec.ts # Auth service tests
│   ├── stores/               # Zustand state stores
│   │   ├── authStore.ts      # Authentication state management
│   │   └── authStore.spec.ts # Auth store tests
│   └── hooks/                # Custom React hooks
│       └── useAuth.ts        # Authentication hook
├── components/               # Reusable UI components
│   ├── ui/                   # Base UI primitives
│   ├── ThemedText.tsx        # Themed text component
│   ├── ThemedView.tsx        # Themed view component
│   ├── ParallaxScrollView.tsx # Parallax scroll component
│   ├── HelloWave.tsx         # Wave animation component
│   ├── HapticTab.tsx         # Haptic feedback tabs
│   ├── ExternalLink.tsx      # External link component
│   ├── Collapsible.tsx       # Collapsible component
│   └── CLAUDE.md             # Component documentation
├── firebase.config.ts        # Firebase configuration
├── global.css               # Tailwind CSS imports
├── metro.config.js          # Metro bundler configuration
├── tailwind.config.js       # Tailwind CSS configuration
├── jest.config.js           # Jest testing configuration
├── package.json             # Dependencies and scripts
└── CLAUDE.md               # Project documentation
```

## Implemented Features

### Authentication System
- **Sign Up**: Email/password with phone number collection
- **Sign In**: Email/password authentication
- **User Profile**: Firestore document with user data
- **Phone Validation**: libphonenumber-js integration
- **Auth State**: Persistent authentication state
- **Sign Out**: Proper session termination

### Navigation Flow
- **Index Route**: `/` - Auth checker that redirects based on auth state
- **Login Route**: `/auth/login` - Email/password authentication
- **Home Route**: `/(tabs)` - Authenticated user dashboard
- **Error Handling**: 404 and navigation error handling

### State Management
- **AuthStore**: Zustand store managing user, userProfile, loading, and error states
- **useAuth Hook**: React hook providing auth state and actions
- **Error Handling**: Proper error state management and user feedback

### Testing Coverage
- **AuthService Tests**: Sign in, sign up, sign out, and error handling
- **AuthStore Tests**: State management, user actions, and error handling
- **Test Setup**: Proper mocking of Firebase and Firestore

## Configuration Files

### Firebase Configuration
```typescript
// firebase.config.ts
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  // ... other config
};
```

### Package.json Dependencies
```json
{
  "dependencies": {
    "expo": "~53.0.17",
    "expo-router": "~5.1.3",
    "firebase": "^11.10.0",
    "zustand": "^5.0.6",
    "libphonenumber-js": "^1.12.10",
    "nativewind": "^4.1.23",
    "react-native-deck-swiper": "^2.0.18",
    "expo-location": "^18.1.6",
    "expo-notifications": "^0.31.4",
    "expo-contacts": "^14.2.5"
  }
}
```

## Data Model Implementation

### User Profile Structure
```typescript
interface UserProfile {
  uid: string;
  email: string;
  phoneNumber: string;
  createdAt: timestamp;
  preferences: {
    tracking: boolean;
    trackingInterval: number; // minutes
  };
}
```

### Firestore Document Structure
```
users/{uid}/profile/main
├── uid: string
├── email: string
├── phoneNumber: string (E.164 format)
├── createdAt: timestamp
└── preferences: {
    tracking: boolean,
    trackingInterval: number
}
```

## Known Issues and Technical Debt

### 1. NativeWind Styling Issues
- **Problem**: Styles disappear after initial render
- **Current Workaround**: Inline styles in login screen
- **Impact**: Inconsistent styling approach
- **Priority**: High - needs resolution before Phase 2

### 2. Test Coverage Gaps
- **Missing**: Component testing (login screen, home screen)
- **Missing**: E2E testing setup
- **Missing**: Navigation flow testing
- **Priority**: Medium - expand before major features

### 3. Error Handling
- **Current**: Basic error alerts
- **Needed**: Better error boundaries
- **Needed**: User-friendly error messages
- **Priority**: Medium - improve UX

## Environment Setup

### Required Environment Variables
```bash
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Development Commands
```bash
# Start development server
pnpm expo start

# Run tests
pnpm test

# Type checking
pnpm typecheck

# Linting
pnpm lint
```

## Git History Summary

```
4708d7c feat: Implement Firebase authentication and user management
4f848b7 add git ignore  
726ca10 initial setup
e225cdf Initial commit
```

## Performance Considerations

### Current State
- **Bundle Size**: Standard Expo app with Firebase (~2.5MB)
- **Startup Time**: Fast due to simple auth flow
- **Memory Usage**: Minimal, only auth state in memory

### Future Considerations
- **Contact Sync**: Large contact lists may require pagination
- **Location Services**: Battery optimization needed
- **Push Notifications**: Efficient background processing required

## Security Implementation

### Authentication Security
- **Firebase Auth**: Industry-standard security
- **Password Requirements**: Minimum 6 characters
- **Email Validation**: Client-side validation
- **Session Management**: Firebase handles token refresh

### Data Security
- **Firestore Rules**: User-specific data access only
- **Environment Variables**: Sensitive config externalized
- **Phone Numbers**: Stored in normalized E.164 format

## Next Steps Overview

1. **Resolve NativeWind Issues** - Critical for consistent styling
2. **Implement Contact Sync** - Phase 2 of PRD
3. **Add Swipe Classification** - Phase 3 of PRD
4. **Location Services** - Phase 4 of PRD
5. **Expand Testing** - Better coverage and E2E tests

---

*This document represents the current state as of the completion of Phase 1. Update this file when moving to subsequent phases.*