# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Run Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server on http://localhost:3000
npm run build        # Production build
npm run preview      # Preview production build
```

## Environment Setup

Set the following in `.env.local`:

```
GEMINI_API_KEY=your_gemini_api_key

# Firebase Configuration (from Firebase Console -> Project Settings)
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

## Architecture Overview

**Trip Mode** is a mobile-first React app for coordinating meetups with friends while traveling.

### Tech Stack
- React 19 + TypeScript
- Vite (bundler, serves on port 3000)
- React Router v7 (HashRouter)
- Firebase (Authentication + Firestore)
- Google Gemini AI (`@google/genai`) for geocoding and venue suggestions
- Tailwind CSS (utility classes)
- Lucide React (icons)
- PapaParse (CSV parsing)
- vcf (vCard parsing)

### Routes
- `/auth` - AuthScreen: sign in/up with email, phone, or Google
- `/` - Welcome: lists saved trips (protected)
- `/new` - TripForm: create trip with destination and dates (protected)
- `/trip/:id` - TripDetail: view trip, invite friends, add activities (protected)
- `/respond/:id` - ResponsePage: friends respond to invitations (public)
- `/profile` - UserProfile: view/edit profile settings (protected)
- `/profile/setup` - ProfileSetup: name collection for new users (protected)
- `/contacts` - ContactsPage: manage imported contacts (protected)
- `/contacts/import` - ContactImport: import contacts from file or phone (protected)

### Authentication
- Firebase Auth with email/password, phone (SMS), and Google sign-in
- `AuthContext` provides user state and profile management
- `ProtectedRoute` guards authenticated routes
- Profile setup required for new users (name collection)

### Data Persistence
All data stored in Firebase Firestore:

```
/users/{userId}
  - name, email, phone, createdAt

/users/{userId}/contacts/{contactId}
  - name, email, phone, matchedUserId

/trips/{tripId}
  - ownerId, city, lat, lng, dates, activities

/responses/{responseId}
  - tripId, responderName, status, selectedWindowIds
```

### Services

**Firebase (`services/firebase.ts`)**
- App initialization, exports auth and db instances

**Auth (`services/authService.ts`)**
- Email/password sign up and sign in
- Google OAuth sign in
- Phone verification with reCAPTCHA
- User profile CRUD

**Firestore (`services/firestoreService.ts`)**
- Trip CRUD with real-time subscriptions
- Response creation and queries
- Contact management with user matching

**Contact Import (`services/contactImportService.ts`)**
- CSV parsing with auto-column detection
- vCard (.vcf) parsing

**Contact Picker (`services/contactPickerService.ts`)**
- Native Contact Picker API (Android Chrome/Edge)
- Fallback detection for unsupported browsers

**Gemini AI (`services/geminiService.ts`)**
- `getCoordinatesForCity(city)` - geocode city name to lat/lng
- `getCityFromCoordinates(lat, lng)` - reverse geocode
- `getVenueSuggestions(city, type)` - get venue recommendations

### Key Types (`types.ts`)
- `UserProfile` - id, name, email, phone, createdAt
- `Contact` - id, ownerId, name, email, phone, matchedUserId
- `Trip` - ownerId, destination, dates, coordinates, activities
- `Activity` - scheduled meetup with friend at venue
- `Response` - friend's availability response
- `Venue` - name, address, rating, description, type

### Component Flow
1. User signs in (AuthScreen) -> redirected to home
2. User creates trip (TripForm) -> saved to Firestore
3. User imports contacts (ContactImport) -> CSV/vCard or native picker
4. User views trip (TripDetail) -> can invite contacts
5. Activity creation: select contact -> pick time slot -> AI suggests venues -> send SMS/WhatsApp invite
6. Friends respond via shareable link (ResponsePage) -> response saved to Firestore
