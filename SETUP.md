# EventFlow Setup Guide

## Installation Steps

### 1. Install Dependencies

First, install the required React Navigation dependencies:

```bash
npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/native-stack react-native-screens react-native-gesture-handler
```

### 2. iOS Setup (if needed)

For iOS, you need to install pods:

```bash
cd ios
pod install
cd ..
```

### 3. Android Setup

The Android configuration is already set up. Make sure you have:
- Android SDK installed
- Android emulator running or device connected
- Java Development Kit (JDK) installed

### 4. Run the App

#### Android
```bash
npm run android
# or
cmd /c "npm run android"  # If you have PowerShell execution policy issues
```

#### iOS
```bash
npm run ios
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── SearchBar.tsx
│   ├── EventCard.tsx
│   ├── BottomNavigation.tsx
│   ├── Header.tsx
│   └── SegmentedControl.tsx
├── screens/            # Screen components
│   ├── WelcomeScreen.tsx
│   ├── HomeScreen.tsx
│   ├── CalendarScreen.tsx
│   ├── AnnouncementsScreen.tsx
│   └── SettingsScreen.tsx
├── navigation/        # Navigation configuration
│   ├── AppNavigator.tsx
│   └── MainTabNavigator.tsx
├── constants/         # Constants and theme
│   ├── colors.ts
│   └── spacing.ts
└── types/            # TypeScript type definitions
    ├── index.ts
    └── navigation.ts
```

## Features Implemented

✅ Welcome/Onboarding Screen
✅ Home Screen with event listings
✅ Calendar/Timeline Screen
✅ Announcements Screen
✅ Settings/Profile Screen
✅ Bottom Navigation
✅ Reusable Components
✅ TypeScript Support
✅ Proper Component Structure

## Notes

- The app starts with a Welcome screen. Clicking "Join Event" or "Sign in" will navigate to the main app.
- All screens are fully functional with mock data.
- Components follow React Native best practices.
- The codebase uses TypeScript for type safety.

