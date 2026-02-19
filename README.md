# Hap

Hap (Happenings at places) is a React Native mobile app for creating, discovering, and managing events. Users can organize events, browse what's happening nearby, join events through invite codes, and interact with other attendees.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the App](#running-the-app)
- [Project Structure](#project-structure)
- [Testing](#testing)
- [Development Guidelines](#development-guidelines)
- [Troubleshooting](#troubleshooting)

## Features

The app includes event creation and management, search and discovery, calendar views, announcements, and location-based features. Users can sign in with email, Google, or Apple, and guests can join events without creating an account.

Event organizers can create detailed events with schedules, venues, and media. Attendees can browse events, RSVP, view calendars, and receive push notifications. The app supports offline data persistence and adapts to system dark mode preferences.

## Tech Stack

Built with React Native 0.82.1 and React 19.1.1, using TypeScript for type safety. Navigation is handled by React Navigation 7.x with bottom tabs and native stack navigators.

Backend services use Firebase for authentication and push notifications, plus a custom REST API. Location features use React Native Geolocation Service, Geocoding, and Google Maps API. Media handling is done with React Native Image Picker.

UI components use React Native Linear Gradient, Vector Icons (Evil Icons and FontAwesome 6), and Safe Area Context. Date handling uses Day.js, and local storage uses AsyncStorage.

## Prerequisites

You'll need Node.js 20 or higher, npm or yarn, and React Native CLI installed globally. For Android development, install Android Studio with the Android SDK and either an emulator or a physical device. For iOS development on macOS, you'll need Xcode and CocoaPods. Watchman is recommended but optional.

## Installation

Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd eventflow
npm install
```

For iOS, install CocoaPods dependencies:

```bash
cd ios
bundle install
bundle exec pod install
cd ..
```

Android setup is already configured. Make sure you have Android Studio installed with the SDK, and either an emulator running or a device connected. You may need to set the ANDROID_HOME environment variable pointing to your SDK location.

## Configuration

Configuration is handled in `src/config/env.ts`. Update these values for your setup:

```typescript
export const ENV = {
  API_URL: 'http://10.0.2.2:3000',
  GOOGLE_WEB_CLIENT_ID: 'your-google-client-id',
  ENABLE_GOOGLE_SIGNIN: 'true',
  ENABLE_APPLE_SIGNIN: 'true',
  GOOGLE_MAPS_API_KEY: 'your-google-maps-api-key',
};
```

### Firebase Setup

Create a Firebase project and add both Android and iOS apps. Download the configuration files:
- `google-services.json` for Android goes in `android/app/`
- `GoogleService-Info.plist` for iOS goes in `ios/eventflow/`

Enable Email/Password, Google Sign-In, and Apple Sign-In authentication methods in the Firebase console.

### Google Sign-In Setup

Create OAuth 2.0 credentials in Google Cloud Console. Add your package name and SHA-1 certificate fingerprint, then update the `GOOGLE_WEB_CLIENT_ID` in `src/config/env.ts`.

### Apple Sign-In Setup (iOS)

Enable Sign in with Apple in your Apple Developer account, configure it in Xcode project settings, and make sure your bundle identifier matches your developer account.

## Running the App

Start the Metro bundler:

```bash
npm start
```

To clear the cache if you're having issues:

```bash
npm start -- --reset-cache
```

Run on Android:

```bash
npm run android
```

On Windows PowerShell, you might need:

```bash
cmd /c "npm run android"
```

Run on iOS:

```bash
npm run ios
```

Other useful commands:

```bash
npm test          # Run tests
npm run lint      # Lint code
```

## Project Structure

```
eventflow/
├── android/                 # Android native code
│   └── app/
│       └── google-services.json
├── ios/                     # iOS native code
│   └── eventflow/
│       └── GoogleService-Info.plist
├── src/
│   ├── assets/             # Images, fonts
│   ├── components/          # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── EventCard.tsx
│   │   ├── SearchBar.tsx
│   │   ├── skeletons/      # Loading skeleton components
│   │   └── ...
│   ├── config/             # Configuration files
│   │   ├── api.ts
│   │   ├── env.ts
│   │   └── firebase.ts
│   ├── constants/          # App constants
│   │   ├── colors.ts
│   │   └── spacing.ts
│   ├── context/            # React Context providers
│   │   ├── AuthContext.tsx
│   │   └── LocationContext.tsx
│   ├── navigation/         # Navigation configuration
│   │   ├── AppNavigator.tsx
│   │   └── MainTabNavigator.tsx
│   ├── screens/            # Screen components
│   │   ├── WelcomeScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── CreateEventScreen.tsx
│   │   ├── EventDetailsScreen.tsx
│   │   ├── CalendarScreen.tsx
│   │   ├── AnnouncementsScreen.tsx
│   │   ├── SettingsScreen.tsx
│   │   └── ...
│   ├── services/           # API and business logic services
│   │   ├── api.service.ts
│   │   ├── auth.service.ts
│   │   ├── event.service.ts
│   │   ├── guest.service.ts
│   │   ├── location.service.ts
│   │   └── ...
│   ├── types/              # TypeScript type definitions
│   │   ├── index.ts
│   │   └── navigation.ts
│   └── utils/              # Utility functions
│       └── eventMapper.ts
├── App.tsx                  # Root component
├── index.js                 # Entry point
├── package.json
├── tsconfig.json
└── babel.config.js
```

## Testing

Run tests with:

```bash
npm test
```

For watch mode:

```bash
npm test -- --watch
```

## Development Guidelines

We use TypeScript with functional components and hooks. Follow React Native naming conventions and use the configured ESLint rules for code quality.

Components are organized by purpose: reusable UI components in `src/components/`, screens in `src/screens/`, API services in `src/services/`, and type definitions in `src/types/`.

For state management, we use React Context for global state like authentication and location. Component-specific state uses `useState`, and persistent local data uses AsyncStorage.

## Troubleshooting

If Metro bundler is acting up, try clearing the cache:

```bash
npm start -- --reset-cache
```

For Android build issues, clean the build:

```bash
cd android && ./gradlew clean && cd ..
```

Make sure `google-services.json` is in `android/app/`.

For iOS build issues, try cleaning pods:

```bash
cd ios && pod deintegrate && pod install && cd ..
```

Verify `GoogleService-Info.plist` is in `ios/eventflow/`.

If Google Sign-In isn't working, check that your SHA-1 fingerprint is added to Firebase and Google Cloud Console, and verify the `GOOGLE_WEB_CLIENT_ID` in your config.

For Android permission issues, check `AndroidManifest.xml` for the required permissions.



---

Note: This project is in active development. Some features may be incomplete.