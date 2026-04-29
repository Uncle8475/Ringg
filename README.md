# Cosmic Attire - Customer App

A React Native mobile application for managing NFC-enabled smart rings that enable contactless payments, access control, and personal identification.

## Overview

**Cosmic Attire Customer App** provides a complete user experience from onboarding to daily transaction management with COSMIC smart rings. Users can pair their rings, manage their digital wallets, make contactless payments, and track spending analytics.

## Features

- 🔐 **Secure Authentication** - Email/password and OAuth login
- 💍 **Smart Ring Management** - Pair, configure, and manage COSMIC rings
- 💳 **Digital Wallet** - Store money, make payments, track transactions
- 🔒 **Security Controls** - Block/unblock rings, monitor usage, set limits
- 📊 **Analytics** - Spending insights, category breakdowns, trends
- 💰 **Payment Processing** - Razorpay integration for wallet top-ups
- 📱 **Multi-platform** - iOS and Android support via Expo

## Tech Stack

- **Framework**: React Native (v0.81.5)
- **Runtime**: Expo SDK (v54.0.31)
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payment Gateway**: Razorpay
- **Navigation**: React Navigation (v7.1.27)
- **UI**: Custom theme with gradients and animations

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- Supabase account
- Razorpay account (for payments)

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/cosmic-attire-customer-app.git
   cd cosmic-attire-customer-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Copy `.env.example` to `.env` and fill in your credentials:
   ```bash
   cp .env.example .env
   ```
   
   Required environment variables:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   RAZORPAY_KEY_ID=your_razorpay_key_id
   ```

4. **Set up Supabase database**
   
   Run the SQL schema files in your Supabase project:
   - Execute `supabase_schema.sql` in Supabase SQL Editor
   - This creates all necessary tables, RLS policies, and functions

5. **Start the development server**
   ```bash
   npm start
   ```

6. **Run on device/emulator**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app for physical device

## Project Structure

```
cosmic-attire-customer-app/
├── App.js                      # Root component with navigation
├── src/
│   ├── components/             # Reusable UI components
│   ├── screens/                # Screen components
│   ├── lib/                    # Supabase integration & auth
│   ├── services/               # API services
│   ├── utils/                  # Utility functions
│   └── theme.js                # Color scheme and styling
├── assets/                     # Images and static files
└── __tests__/                  # Test files
```

## Documentation

For complete technical documentation, architecture details, and API reference, see [DETAILED.md](DETAILED.md).

## Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm run web` - Run on web browser
- `npm test` - Run tests

## Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| react | 19.1.0 | UI Framework |
| react-native | 0.81.5 | Mobile Platform |
| expo | 54.0.31 | Build & Deploy |
| @react-navigation/native | 7.1.27 | Navigation |
| @supabase/supabase-js | 2.90.1 | Backend & Auth |
| expo-linear-gradient | 15.0.8 | UI Gradients |
| expo-local-authentication | 17.0.8 | Biometric Auth |

## Security Features

- Secure authentication with Supabase
- Biometric authentication (Face ID/Touch ID)
- Row Level Security (RLS) on database
- Encrypted local storage
- PCI compliant payment processing via Razorpay

## User Flow

1. **Onboarding** - Welcome screen → Login/Signup
2. **Ring Setup** - Detect ring → Pair → Personalize
3. **Profile Setup** - Complete user profile
4. **Main App** - Home → Wallet → Payments → Settings

## Contributing

This is a private project for Cosmic Attire customers. For internal development guidelines, please contact the development team.

## License

Proprietary - All rights reserved by Cosmic Attire

## Contact

For support or inquiries, please contact the Cosmic Attire support team.

---

**Version**: 0.1.0  
**Last Updated**: March 3, 2026
