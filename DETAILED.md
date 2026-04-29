# COSMIC ATTIRE - Complete Application Documentation

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Technology Stack](#technology-stack)
3. [Architecture Overview](#architecture-overview)
4. [Database Schema](#database-schema)
5. [Authentication System](#authentication-system)
6. [User Flow & Navigation](#user-flow--navigation)
7. [Core Features](#core-features)
8. [API & Services](#api--services)
9. [UI/UX System](#uiux-system)
10. [Security & Privacy](#security--privacy)
11. [Payment Integration](#payment-integration)
12. [Admin App Requirements](#admin-app-requirements)

---

## Executive Summary

**COSMIC ATTIRE** is a React Native mobile application for managing NFC-enabled smart rings that enable contactless payments, access control, and personal identification. The app provides a complete user experience from onboarding to daily transaction management.

### Key Capabilities
- **Smart Ring Management**: Pair, configure, and manage COSMIC smart rings
- **Digital Wallet**: Store money, make payments, track transactions
- **Security Controls**: Block/unblock rings, monitor usage, set limits
- **Analytics**: Spending insights, category breakdowns, trends
- **Payment Processing**: Razorpay integration for wallet top-ups
- **Multi-platform**: iOS and Android support via Expo

### Business Model
- B2C application for end users who purchase COSMIC rings
- Revenue from ring sales and potential transaction fees
- Digital wallet ecosystem with payment capabilities

---

## Technology Stack

### Frontend Framework
```json
{
  "platform": "React Native",
  "version": "0.81.5",
  "runtime": "Expo SDK 54.0.31",
  "language": "JavaScript (ES6+)"
}
```

### Core Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| `react` | 19.1.0 | UI Framework |
| `react-native` | 0.81.5 | Mobile Platform |
| `expo` | 54.0.31 | Build & Deploy |
| `@react-navigation/native` | 7.1.27 | Navigation |
| `@supabase/supabase-js` | 2.90.1 | Backend & Auth |
| `expo-linear-gradient` | 15.0.8 | UI Gradients |
| `expo-local-authentication` | 17.0.8 | Biometric Auth |
| `@react-native-async-storage/async-storage` | 2.2.0 | Local Storage |
| `expo-web-browser` | 15.0.10 | OAuth Flows |

### Backend Infrastructure
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Email/Password + OAuth)
- **Real-time**: Supabase Realtime subscriptions
- **Storage**: AsyncStorage for local data
- **Payment Gateway**: Razorpay (India)

### Development Tools
- **Testing**: Jest + React Testing Library
- **Version Control**: Git
- **Package Manager**: npm
- **Deployment**: Expo EAS Build

---

## Architecture Overview

### Application Structure
```
cosmic-attire/
├── App.js                      # Root component with navigation
├── app.json                    # Expo configuration
├── package.json                # Dependencies
├── src/
│   ├── components/             # Reusable UI components
│   │   ├── BottomTabs.js      # Navigation tab bar
│   │   ├── Header.js          # Screen headers
│   │   ├── HeroHeader.js      # Home screen hero
│   │   ├── QRCodeDisplay.js   # QR code generator
│   │   ├── RingAnimation.js   # Ring visual effects
│   │   └── AddMoneyModal.js   # Payment modal
│   ├── screens/                # Screen components
│   │   ├── AuthEntryScreen.js # Landing/welcome
│   │   ├── LoginScreen.js     # Email login
│   │   ├── SignupScreen.js    # Registration
│   │   ├── RingDetection.js   # Ring pairing flow
│   │   ├── SecurePairing.js   # Pairing progress
│   │   ├── Personalization.js # Ring customization
│   │   ├── UserProfile.js     # Profile setup
│   │   ├── OTPVerification.js # Phone/Email OTP
│   │   ├── Home.js            # Main dashboard
│   │   ├── Payments.js        # Wallet & transactions
│   │   ├── Insights.js        # Analytics dashboard
│   │   ├── RingPage.js        # Ring details & settings
│   │   ├── SafetySecurity.js  # Security controls
│   │   ├── Settings.js        # App settings
│   │   └── [15+ more screens]
│   ├── lib/                    # Core libraries
│   │   ├── authContext.js     # Auth state management
│   │   ├── authHelpers.js     # Auth functions
│   │   ├── oauthHelpers.js    # OAuth providers
│   │   ├── dbHelpers.js       # Database operations
│   │   ├── supabase.js        # Supabase client
│   │   └── SUPABASE_SCHEMA.sql # DB schema
│   ├── services/               # Business logic
│   │   ├── transactionService.js
│   │   ├── userService.js
│   │   └── apiClient.js
│   ├── utils/                  # Utilities
│   │   ├── qrGenerator.js     # QR code logic
│   │   ├── razorpayConfig.js  # Payment config
│   │   └── setupManager.js    # Setup flow
│   ├── uikit/                  # Design system
│   │   └── [Button, Text, Card, etc.]
│   └── theme.js                # Theme definitions
└── assets/
    └── images/
        ├── logo.png
        └── ring.jpeg
```

### Navigation Architecture

#### Three-Tier Navigation System
1. **Auth Stack** (Unauthenticated users)
   - AuthEntry → Login → Signup

2. **Ring Setup Stack** (Authenticated, no ring)
   - RingDetection → SecurePairing → Personalization → UserProfile → OTPVerification

3. **Main App Stack** (Fully onboarded)
   - Home, Payments, Insights, Ring, Safety, Settings + 15 sub-screens

#### Navigation Flow Decision Tree
```javascript
if (!user) {
  → AuthStack
} else if (setupStage === 'ring_setup') {
  → RingSetupStack
} else {
  → AppStack (with BottomTabs)
}
```

---

## Database Schema

### Core Tables (Supabase PostgreSQL)

#### 1. **profiles** - User Profile Data
```sql
CREATE TABLE profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  age text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT '',
  bio text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

**Purpose**: Extended user information beyond auth credentials
**RLS Policy**: Users can only access their own profile (`auth.uid() = user_id`)

#### 2. **rings** - User's Smart Rings
```sql
CREATE TABLE rings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ring_id text NOT NULL,
  nickname text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','temp_blocked','permanent_blocked')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, ring_id)
);
```

**Purpose**: Track rings linked to user account
**Status Values**:
- `active`: Ring is operational
- `temp_blocked`: Temporarily disabled (user can unblock)
- `permanent_blocked`: Permanently disabled (requires support)

#### 3. **otp_verifications** - Verification Status
```sql
CREATE TABLE otp_verifications (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email_verified boolean NOT NULL DEFAULT false,
  phone_verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

**Purpose**: Track which verification methods completed (no plaintext OTPs stored)

#### 4. **wallets** - Digital Wallet Balances
```sql
CREATE TABLE wallets (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  balance numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'INR',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

**Purpose**: Store user's digital wallet balance

#### 5. **transactions** - Payment History
```sql
CREATE TABLE transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ring_id text,
  amount numeric NOT NULL,
  type text NOT NULL CHECK (type IN ('payment', 'refund', 'topup')),
  description text,
  merchant text,
  category text,
  location text,
  status text DEFAULT 'completed',
  created_at timestamptz NOT NULL DEFAULT now()
);
```

**Purpose**: Complete transaction ledger
**Transaction Types**:
- `payment`: Money spent using ring
- `topup`: Money added to wallet
- `refund`: Money returned to wallet

### Row Level Security (RLS)

**ALL tables have RLS enabled** - users can only access their own data:

```sql
-- Example for profiles table
CREATE POLICY "Read own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);
```

**Security Principle**: Never use Service Role Key in frontend; only Public Anon Key is exposed.

---

## Authentication System

### Authentication Flow

#### Supported Methods
1. **Email/Password** (Primary)
2. **OAuth Providers**:
   - Google
   - Apple
   - GitHub
   - Microsoft

#### Signup Process
```javascript
// Email/Password Signup
signUpWithEmail(email, password) → {
  user: { id, email, ... },
  session: { access_token, ... },
  error: null | string
}

// OAuth Signup
signUpWithOAuth(provider) → {
  authUrl: "https://...",  // Open in WebBrowser
  error: null | string
}
```

#### Login Process
```javascript
signInWithEmail(email, password) → {
  user: { id, email, ... },
  session: { access_token, ... },
  error: null | string
}
```

#### Session Management
- **Storage**: AsyncStorage (React Native)
- **Auto-refresh**: Enabled (Supabase handles token refresh)
- **Persistence**: Sessions survive app restarts
- **Deep Linking**: OAuth callbacks via `cosmicattire://auth/callback`

### Setup Stages (Onboarding Flow)

After authentication, users progress through setup stages:

```javascript
export const SETUP_STAGES = {
  AUTH: 'auth',                     // Not logged in
  RING_SETUP: 'ring_setup',         // Need to pair ring
  RING_PAIRED: 'ring_paired',       // Ring added, need profile
  PROFILE_SETUP: 'profile_setup',   // Need to complete profile
  OTP_VERIFICATION: 'otp_verification', // Need phone/email OTP
  COMPLETE: 'complete',             // Fully onboarded
};
```

**Stage Determination Logic**:
```javascript
if (otpVerified && profileCompleted) {
  → COMPLETE (show main app)
} else if (!otpVerified && profileCompleted) {
  → OTP_VERIFICATION
} else if (!profileCompleted) {
  → PROFILE_SETUP
} else {
  → RING_SETUP
}
```

### AuthContext API

The app uses React Context for global auth state:

```javascript
const { 
  user,           // Current user object
  session,        // Auth session
  profile,        // User profile from DB
  loading,        // Auth initialization state
  setupStage,     // Current onboarding stage
  otpVerified,    // OTP completion status
  logout          // Logout function
} = useAuth();
```

---

## User Flow & Navigation

### Complete User Journey

#### 1. First-Time User Flow
```
Download App
  ↓
AuthEntryScreen (Landing)
  ↓
Signup/Login
  ↓
RingDetection (Search for ring via NFC)
  ↓
SecurePairing (Linking ring to account)
  ↓
Personalization (Name the ring, customize)
  ↓
UserProfile (Enter personal details)
  ↓
OTPVerification (Verify phone/email)
  ↓
Home (Main Dashboard)
```

#### 2. Returning User Flow
```
Open App
  ↓
[Session Check]
  ↓
Home (Direct access if fully onboarded)
```

#### 3. Ring Pairing Flow (Post-Signup)

**Screen: RingDetection**
- Purpose: Detect NFC ring proximity
- Duration: ~2.3 seconds searching animation
- Success: Vibration feedback + "Ring detected ✓"
- Next: SecurePairing

**Screen: SecurePairing**
- Purpose: Secure linking of ring to user account
- Visual: Progress bar animation (1.6 seconds)
- Action: Creates entry in `rings` table
- Next: Personalization

**Screen: Personalization**
- Purpose: Name the ring, view QR code for sharing
- Features:
  - Ring nickname input
  - QR code generation (for ring sharing/setup)
  - Ring visual preview
- Next: UserProfile

**Screen: UserProfile**
- Purpose: Collect user details for profile completion
- Fields: Full name, age, phone, email, role, bio
- Validation: Required fields enforced
- Database: Inserts into `profiles` table
- Next: OTPVerification

**Screen: OTPVerification**
- Purpose: Mandatory verification for security
- Options: Email OTP or Phone OTP
- Flow: Send OTP → Enter code → Verify → Mark as verified
- Database: Updates `otp_verifications` table
- Next: Home (setup complete)

### Main App Navigation

#### Bottom Tab Bar (5 Tabs)
1. **Home** - Dashboard with balance, recent activity, quick actions
2. **Payments** - Wallet, transactions, add money
3. **Ring** - Ring details, sync, re-pair
4. **Safety** - Block ring, usage history, auto-safety
5. **Settings** - Account, preferences, support

#### Screen Hierarchy
```
Home
├── TransactionDetail (from recent activity)

Payments
├── TransactionDetail (from transaction list)
├── WalletSettings
├── TransactionLimits

Ring
├── Offers (rewards program)

Safety
└── (standalone)

Settings
├── Profile
├── Offers
├── WalletSettings
├── TransactionLimits
├── SecuritySettings
├── AppLock
├── Notifications
├── Appearance (theme switcher)
├── Support
├── About
├── Privacy
└── HelpSupport
```

---

## Core Features

### 1. Home Dashboard

**Purpose**: Central hub showing user's financial status and recent activity

**Key Components**:
- **Greeting**: Time-based greeting (Good Morning/Afternoon/Evening/Night)
- **Wallet Balance**: Prominent display with gradient background
- **Quick Actions** (4 buttons):
  - Block Ring (red accent)
  - Add Money (green accent)
  - Find My Ring (blue accent)
  - Find Devices (purple accent)
- **AI Suggestion Engine**: Context-aware tips based on recent activity
- **Recent Activity Feed**: Last 5 transactions from database

**Visual Design**:
- Dynamic gradients based on time of day
- Orbit animation for device status
- Collapsing header on scroll
- Real-time updates via Supabase subscriptions

**Data Sources**:
```javascript
// Wallet balance
getWalletBalance() → { balance: number }

// Recent transactions
getRecentTransactions(limit) → { transactions: [...] }

// Real-time updates
supabase
  .channel('public:transactions')
  .on('postgres_changes', { event: 'INSERT', table: 'transactions' }, handler)
```

### 2. Payments & Wallet

**Purpose**: Manage digital wallet, view transactions, add money

**Features**:
- **Wallet Balance Card**
  - Current balance (₹ INR format)
  - Daily spending limit tracker (₹10,000 default)
  - Progress bar visualization
  - "Add Money" CTA button

- **Transaction List**
  - Chronological feed (newest first)
  - Merchant name, amount, date
  - Color coding: green for top-ups, white for payments
  - Tap to view details

- **Add Money Flow**
  - Modal with preset amounts (₹100, ₹500, ₹1000, custom)
  - Razorpay integration (see Payment Integration section)
  - Success confirmation with payment ID

**Database Operations**:
```javascript
// Add money transaction
addTransaction({
  amount: 500,
  type: 'topup',
  merchant: 'Wallet Top-up',
  category: 'Wallet',
  description: 'Added via Razorpay (pay_ABC123)'
});

// Update balance
updateWalletBalance(newBalance);
```

### 3. Insights & Analytics

**Purpose**: Visualize spending patterns and trends

**Features**:
- **Time Range Selector**: Weekly vs Monthly view
- **Spending Chart**: Bar chart with 7-day or 4-month data
- **Total Calculation**: Aggregate spending for selected period
- **Category Breakdown**: 
  - Food, Groceries, Commute, Entertainment, Essentials, Access
  - Color-coded dots
  - Amount per category
  - Sorted by highest spending

**Chart Logic**:
```javascript
// Weekly data: Last 7 days
weeklyData = Array.from({ length: 7 }).map((_, index) => {
  const date = new Date();
  date.setDate(today.getDate() - (6 - index));
  const value = transactions
    .filter(tx => isSameDay(date, tx.created_at))
    .reduce((sum, tx) => sum + tx.amount, 0);
  return { label: date.weekday, value };
});

// Monthly data: Last 4 months
monthlyData = Array.from({ length: 4 }).map((_, offset) => {
  const monthDate = new Date(now.getFullYear(), now.getMonth() - (3 - offset), 1);
  const value = transactions
    .filter(tx => isSameMonth(monthDate, tx.created_at))
    .reduce((sum, tx) => sum + tx.amount, 0);
  return { label: monthDate.month, value };
});
```

### 4. Ring Management

**Purpose**: View ring details, sync, and re-pair

**Features**:
- **Ring Hero Visual**: Revolving ring image with orbit animation
- **Ring Status Badge**: 
  - Active (green)
  - Temp Blocked (yellow)
  - Permanently Blocked (red)
- **Ring Details Card**:
  - Ring ID (e.g., CR-00123)
  - Nickname
  - Linked account
  - Last sync time
- **Actions**:
  - **Sync Ring**: Simulated sync with pulse animation
  - **Re-pair Ring**: Factory reset flow (requires confirmation)

**Re-pair Flow**:
```javascript
handleRepairRing() {
  Alert.alert('Re-pair Your Ring?', 'This will reset your ring setup completely...');
  // If confirmed:
  restartSetup(); // Clears setup data, returns to RingDetection
  navigation.reset({ index: 0, routes: [{ name: 'RingDetection' }] });
}
```

### 5. Safety & Security

**Purpose**: Control ring access and monitor usage

**Features**:
- **Ring Status Display**:
  - Active / Temporarily Blocked / Permanently Blocked
  - Visual indicator with colored badge
  
- **Blocking Options**:
  - **Temporary Block**: Instant, no auth required, reversible
  - **Permanent Block**: Requires app lock PIN/biometric, irreversible
  
- **Usage History**:
  - Last 5 ring transactions
  - Location, time, action type
  - Status (success/failed)
  
- **Auto-Safety Toggle**:
  - Placeholder for future automated security features
  - Stored in AsyncStorage

**Block Flow**:
```javascript
// Temporary Block
setBlockStatus('temporary');
// User can unblock anytime

// Permanent Block
requestAuthentication(); // Verify app lock
→ setBlockStatus('permanent');
→ Alert: "Contact support for replacement"
```

**Security Settings Storage**:
```javascript
AsyncStorage.setItem('securityPrivacySettings', JSON.stringify({
  blockStatus: 'temporary' | 'permanent' | null,
  autoSafety: boolean,
  lastActivity: string
}));
```

### 6. Settings Hub

**Purpose**: Central access to all app configurations

**Sections**:
1. **Account**
   - Profile (edit user details)
   - Offers & Rewards

2. **Payments**
   - Wallet & Payments
   - Transaction Limits (daily/monthly caps)

3. **Security**
   - Security & Privacy settings
   - App Lock (PIN or biometric)

4. **Preferences**
   - Notifications (push settings)
   - Appearance (dark/light/system theme)

5. **Support & Info**
   - Help & Support (FAQs, contact)
   - About COSMIC ATTIRE (version, legal)

6. **System**
   - Logout (with confirmation alert)

**Logout Flow**:
```javascript
logout() {
  Alert.alert('Log out', 'Are you sure?');
  // If confirmed:
  await signOut(); // Clears session from Supabase
  resetAllAuth(); // Clears local auth state
  // App.js navigates back to AuthEntry
}
```

---

## API & Services

### Database Helpers (`dbHelpers.js`)

#### User Profile Operations
```javascript
// Create profile (after signup)
createUserProfile(userId, {
  full_name, email, phone, age, role, bio
}) → { user, error }

// Get current user's profile
getUserProfile() → { profile, error }

// Update profile
updateUserProfile({ full_name, bio, ... }) → { profile, error }
```

#### Ring Operations
```javascript
// Get user's rings
getUserRings() → { rings, error }

// Add new ring
addUserRing({ ring_id, nickname }) → { ring, error }

// Update ring status
updateRingStatus(ringId, status) → { ring, error }
// status: 'active' | 'temp_blocked' | 'permanent_blocked'
```

#### Wallet Operations
```javascript
// Get wallet balance
getWalletBalance() → { balance, error }

// Update balance (after transaction)
updateWalletBalance(newBalance) → { error }

// Initialize wallet (first time)
initializeWallet() → { wallet, error }
```

#### Transaction Operations
```javascript
// Get recent transactions
getRecentTransactions(limit = 10) → { transactions, error }

// Add transaction
addTransaction({
  amount: number,
  type: 'payment' | 'topup' | 'refund',
  merchant: string,
  category: string,
  description: string,
  ring_id?: string,
  location?: string
}) → { transaction, error }
```

#### OTP Operations
```javascript
// Mark OTP as verified
markOTPVerified(type) → { error }
// type: 'email' | 'phone'

// Check OTP status
getOTPStatus() → { email_verified, phone_verified, error }
```

### Authentication Helpers (`authHelpers.js`)

```javascript
// Email/Password
signUpWithEmail(email, password) → { user, session, error }
signInWithEmail(email, password) → { user, session, error }

// Email OTP (passwordless)
sendEmailOTP(email) → { success, error, message }
verifyEmailOTP(email, token) → { user, session, error }

// Phone OTP
sendPhoneOTP(phone) → { success, error, message }
verifyPhoneOTP(phone, token) → { user, session, error }

// Session management
signOut() → { error }
resetPassword(email) → { success, error }
```

### OAuth Helpers (`oauthHelpers.js`)

```javascript
signUpWithOAuth(provider) → { authUrl, error }
// provider: 'google' | 'apple' | 'github' | 'microsoft'

// OAuth flow:
// 1. Get authUrl
// 2. Open in WebBrowser.openAuthSessionAsync()
// 3. User authenticates with provider
// 4. Callback to cosmicattire://auth/callback
// 5. Supabase session auto-established
```

### Transaction Service (`transactionService.js`)

```javascript
transactionService.getTransactions(query) → Promise<Transaction[]>
// query: { user_id?, type?, category?, ... }

transactionService.getTransactionById(id) → Promise<Transaction>

transactionService.createTransaction(transaction) → Promise<Transaction>
```

### Real-time Subscriptions

**Home Screen - Live Transaction Updates**:
```javascript
const channel = supabase
  .channel('public:transactions')
  .on('postgres_changes', { 
    event: 'INSERT', 
    schema: 'public', 
    table: 'transactions' 
  }, (payload) => {
    console.log('New transaction:', payload.new);
    fetchActivity(); // Refresh UI
  })
  .subscribe();
```

**Cleanup**:
```javascript
supabase.removeChannel(channel);
```

---

## UI/UX System

### Theme System

**Two Themes**: Dark (default) and Light

```javascript
// Dark Theme (OLED-optimized)
export const DarkTheme = {
  background: '#0B0D10',           // Near-black
  backgroundSecondary: '#11141A',  // Modals/sheets
  card: '#141822',                 // All cards
  textPrimary: '#FFFFFF',          // Titles
  textSecondary: 'rgba(255,255,255,0.78)', // Body text
  textTertiary: 'rgba(255,255,255,0.55)', // Hints
  accent: '#6D5EF6',               // COSMIC Violet (primary brand)
  success: '#3DDC97',              // Green
  error: '#E05A5A',                // Red/SOS
  border: 'rgba(255,255,255,0.06)',
  ...
};

// Light Theme (optional)
export const LightTheme = {
  background: '#F7F7F9',
  card: '#FFFFFF',
  textPrimary: '#0B0D10',
  accent: '#6D5EF6',
  ...
};
```

**Theme Context**:
```javascript
<ThemeProvider theme={resolvedTheme}>
  {/* App content */}
</ThemeProvider>

// In components:
const theme = useTheme();
<View style={{ backgroundColor: theme.background }} />
```

**Theme Persistence**:
```javascript
// Save preference
AsyncStorage.setItem('appTheme', 'dark' | 'light' | 'system');

// Resolve system theme
const systemColorScheme = RNAppearance.getColorScheme(); // 'dark' | 'light'
const resolvedTheme = themeName === 'system' 
  ? (systemColorScheme === 'dark' ? DarkTheme : LightTheme)
  : (themeName === 'light' ? LightTheme : DarkTheme);
```

### UI Kit Components

**Location**: `src/uikit/`

**Components**:
- `<Text>` - Typography with variants (h1, h2, h3, body, bodyStrong, label, caption, subtext)
- `<Button>` - Primary, secondary, tertiary styles
- `<Card>` - Elevated container with shadows
- `<TouchableOpacity>` - Pressable with feedback

**Usage**:
```javascript
import { Text, Button, Card } from '../uikit';

<Card padding={16}>
  <Text variant="h3">Wallet Balance</Text>
  <Text variant="body">₹2,450</Text>
  <Button label="Add Money" variant="primary" onPress={handlePress} />
</Card>
```

### Custom Components

#### Bottom Tabs (`BottomTabs.js`)
- 5 tabs with icons (Feather + MaterialCommunityIcons)
- Animated indicator (Spring physics)
- Active tab highlighting (COSMIC Violet)
- Glassmorphism effect (gradient overlay)

#### Hero Header (`HeroHeader.js`)
- Home screen collapsing header
- Parallax scroll effect
- Wallet balance display
- Dynamic greeting based on time

#### QR Code Display (`QRCodeDisplay.js`)
- Generates HTTPS URL for ring setup
- iOS-compatible QR codes
- Share functionality
- Visual placeholder (MaterialCommunityIcons 'qrcode')

#### Ring Animation (`RingAnimation.js`)
- Pulsing ring visual
- Glow effect on detection
- Used in pairing flow

### Accessibility

**Features**:
- Reduce motion detection (`AccessibilityInfo.isReduceMotionEnabled()`)
- Accessibility roles on interactive elements
- High contrast text colors
- Large touch targets (minimum 44x44)

---

## Security & Privacy

### Row Level Security (RLS)

**Enforcement**: ALL database tables have RLS enabled

**Policy Examples**:
```sql
-- Users can only read their own data
CREATE POLICY "Read own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only update their own data
CREATE POLICY "Update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);
```

**Benefit**: Even if frontend is compromised, users cannot access others' data.

### Authentication Security

**Password Requirements**:
- Minimum 6 characters
- Must contain uppercase letter
- Must contain number
- Validated client-side before submission

**Session Security**:
- Auto-refresh tokens (Supabase handles)
- Secure storage (AsyncStorage with encryption)
- Session expiry on logout
- No credentials stored in plain text

### App Lock Feature

**Purpose**: Additional layer of security for app access

**Options**:
1. **PIN**: 4-6 digit numeric code
2. **Biometric**: Face ID / Touch ID (via `expo-local-authentication`)

**Storage**:
```javascript
AsyncStorage.setItem('appLockSettings', JSON.stringify({
  enabled: boolean,
  method: 'pin' | 'biometric',
  pin: 'hashed_pin' // Never plain text
}));
```

**Usage**:
- Verify on app launch (if enabled)
- Required for sensitive actions (permanent ring block)

### Ring Security

**Status Levels**:
1. **Active**: Full functionality
2. **Temp Blocked**: User-initiated, reversible without auth
3. **Permanent Blocked**: Requires app lock verification, irreversible

**Emergency Actions**:
- Instant temporary block (no delay)
- Usage history tracking
- Real-time alerts (future feature)

### Data Privacy

**Storage Locations**:
- **Sensitive**: Supabase (encrypted at rest)
- **Session**: AsyncStorage (device-encrypted)
- **No analytics tracking**: Privacy-first approach

**Data Access**:
- Only user's own data visible
- No cross-user data leakage
- Admin access requires separate backend (not in mobile app)

---

## Payment Integration

### Razorpay Integration

**Purpose**: Enable wallet top-ups with Indian payment methods

**Configuration** (`razorpayConfig.js`):
```javascript
const RAZORPAY_KEY_ID = 'rzp_test_...';
const RAZORPAY_KEY_SECRET = '...'; // NEVER expose in frontend

export const getRazorpayCheckoutUrl = (amount, userId, email) => {
  // Generate checkout URL or order ID
  return `https://razorpay.com/checkout/...`;
};
```

**Payment Flow**:
1. User taps "Add Money" on Payments screen
2. AddMoneyModal opens with preset amounts
3. User selects/enters amount
4. App initiates Razorpay checkout (WebBrowser or native SDK)
5. User completes payment
6. Razorpay webhook/callback confirms payment
7. App updates wallet balance and adds transaction

**Current Implementation** (Demo Mode):
```javascript
// Mock payment for testing
handlePaymentConfirm = async (amount) => {
  // Simulate payment processing
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const mockPaymentId = `pay_${randomString()}`;
  
  // Add transaction
  addTransaction({
    amount: amount,
    type: 'topup',
    merchant: 'Wallet Top-up',
    description: `Added via Razorpay (${mockPaymentId})`
  });
  
  // Update balance
  updateWalletBalance(currentBalance + amount);
  
  Alert.alert('Payment Successful', `₹${amount} added`);
};
```

**Production Requirements**:
1. Implement Razorpay SDK (`react-native-razorpay`)
2. Create server-side order creation endpoint
3. Verify payment signature on backend
4. Handle webhooks for payment status
5. Implement refund logic

### Transaction Processing

**Types**:
- **topup**: Razorpay → Wallet
- **payment**: Wallet → Merchant (via ring tap)
- **refund**: Merchant → Wallet

**Ledger Integrity**:
- All transactions recorded in `transactions` table
- Atomic balance updates
- No negative balances allowed (validation needed)
- Transaction history immutable

---

## Admin App Requirements

### Admin Dashboard Needs

Based on this mobile app, an admin application should provide:

#### 1. User Management
**Features**:
- View all users (profiles table)
- Search/filter by email, phone, name
- View user details:
  - Profile info (name, age, role, bio)
  - Account status (active, suspended)
  - Registration date
  - Last login timestamp
- Actions:
  - Suspend/unsuspend user account
  - Reset user password
  - View user's onboarding progress (setupStage)
  - Delete user (cascade delete via RLS)

**Database Queries**:
```sql
-- Get all users with profile data
SELECT 
  u.id, u.email, u.created_at, u.last_sign_in_at,
  p.full_name, p.phone, p.age, p.role
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.user_id
ORDER BY u.created_at DESC;

-- Get user by email
SELECT * FROM auth.users WHERE email = ?;
```

#### 2. Ring Management
**Features**:
- View all rings across all users
- Search by ring_id
- View ring details:
  - Linked user
  - Nickname
  - Status (active/temp_blocked/permanent_blocked)
  - Pairing date
- Actions:
  - Force block/unblock ring
  - Transfer ring to different user (support ticket)
  - Delete ring record
  - View ring usage history

**Database Queries**:
```sql
-- Get all rings with user info
SELECT 
  r.id, r.ring_id, r.nickname, r.status, r.created_at,
  p.full_name, p.email
FROM rings r
JOIN profiles p ON r.user_id = p.user_id
ORDER BY r.created_at DESC;

-- Get rings by status
SELECT * FROM rings WHERE status = 'permanent_blocked';
```

#### 3. Transaction Monitoring
**Features**:
- View all transactions across platform
- Real-time transaction feed
- Filter by:
  - Date range
  - Transaction type (payment/topup/refund)
  - User
  - Amount range
  - Merchant
  - Category
- Analytics:
  - Total transaction volume
  - Average transaction value
  - Top merchants
  - Transaction success rate
- Actions:
  - View transaction details
  - Issue refunds
  - Flag suspicious transactions

**Database Queries**:
```sql
-- Get all transactions with user info
SELECT 
  t.id, t.amount, t.type, t.merchant, t.category, t.created_at,
  p.full_name, p.email
FROM transactions t
JOIN profiles p ON t.user_id = p.user_id
ORDER BY t.created_at DESC
LIMIT 100;

-- Transaction analytics
SELECT 
  type, 
  COUNT(*) as count, 
  SUM(amount) as total,
  AVG(amount) as average
FROM transactions
GROUP BY type;

-- Top merchants
SELECT 
  merchant, 
  COUNT(*) as transaction_count, 
  SUM(amount) as total_revenue
FROM transactions
WHERE type = 'payment'
GROUP BY merchant
ORDER BY total_revenue DESC
LIMIT 10;
```

#### 4. Wallet Oversight
**Features**:
- View all user wallets
- Total platform wallet balance
- Actions:
  - Manual balance adjustment (with audit log)
  - View wallet transaction history
  - Freeze/unfreeze wallet
  - Set wallet limits per user

**Database Queries**:
```sql
-- Get all wallets
SELECT 
  w.user_id, w.balance, w.currency,
  p.full_name, p.email
FROM wallets w
JOIN profiles p ON w.user_id = p.user_id
ORDER BY w.balance DESC;

-- Platform total balance
SELECT SUM(balance) as total_platform_balance FROM wallets;
```

#### 5. Security & Fraud Detection
**Features**:
- Flag suspicious activities:
  - Multiple failed login attempts
  - Rapid balance changes
  - Unusual transaction patterns
  - Permanent ring blocks (review why)
- View blocked rings with reasons
- OTP verification status monitoring
- App lock usage statistics

**Queries**:
```sql
-- Users with permanently blocked rings
SELECT 
  r.ring_id, r.user_id, p.full_name, p.email, r.created_at
FROM rings r
JOIN profiles p ON r.user_id = p.user_id
WHERE r.status = 'permanent_blocked';

-- Users without OTP verification
SELECT 
  u.email, p.full_name, o.email_verified, o.phone_verified
FROM auth.users u
JOIN profiles p ON u.id = p.user_id
LEFT JOIN otp_verifications o ON u.id = o.user_id
WHERE (o.email_verified = false OR o.phone_verified = false);
```

#### 6. Analytics Dashboard
**Metrics**:
- **User Metrics**:
  - Total users
  - New signups (daily/weekly/monthly)
  - Active users (last 7/30 days)
  - User retention rate
  - Onboarding completion rate (% reaching COMPLETE stage)

- **Transaction Metrics**:
  - Total transaction volume (₹)
  - Transaction count
  - Average transaction value
  - Top-up vs payment ratio
  - Category breakdown

- **Ring Metrics**:
  - Total rings in circulation
  - Active vs blocked rings
  - Average rings per user
  - Ring pairing success rate

- **Financial Metrics**:
  - Total wallet balance on platform
  - Top-up volume (revenue indicator)
  - Pending refunds
  - Payment gateway fees

**Charts**:
- User growth over time (line chart)
- Transaction volume trends (area chart)
- Category spending distribution (pie chart)
- Top merchants (bar chart)

#### 7. Support & Ticketing
**Features**:
- View support requests from HelpSupport screen
- Respond to user queries
- Issue refunds
- Assist with ring re-pairing
- Account recovery

#### 8. Settings & Configuration
**Features**:
- Platform-wide settings:
  - Daily transaction limit (default ₹10,000)
  - Wallet top-up limits
  - Supported payment methods
  - Razorpay configuration
- Feature flags:
  - Enable/disable OAuth providers
  - Maintenance mode
  - New user signups enabled/disabled

### Admin Tech Stack Recommendations

**Frontend**:
- React.js (web dashboard)
- Next.js for SSR
- Chart.js or Recharts for analytics
- Tailwind CSS for styling

**Backend** (if not using Supabase directly):
- Node.js + Express
- Supabase Service Role Key (server-side only)
- Admin-specific RLS policies or separate admin schema

**Authentication**:
- Separate admin user table (not same as end users)
- Role-based access control (RBAC)
- Admin-only Supabase policies

**Database Access**:
```javascript
// Use Service Role Key (backend only)
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY // Full access, bypasses RLS
);

// Now admin can query all users
const { data } = await supabaseAdmin
  .from('profiles')
  .select('*'); // Not restricted by RLS
```

**API Endpoints** (if building separate backend):
```
GET  /admin/users              - List all users
GET  /admin/users/:id          - Get user details
POST /admin/users/:id/suspend  - Suspend user
POST /admin/users/:id/reset    - Reset password

GET  /admin/rings              - List all rings
POST /admin/rings/:id/block    - Force block ring

GET  /admin/transactions       - List all transactions
POST /admin/transactions/:id/refund - Issue refund

GET  /admin/analytics          - Platform analytics
GET  /admin/analytics/users    - User metrics
GET  /admin/analytics/transactions - Transaction metrics
```

### Admin Database Schema Extensions

**Additional Tables** (not in mobile app):

```sql
-- Admin users (separate from end users)
CREATE TABLE admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  role text NOT NULL CHECK (role IN ('super_admin', 'support', 'analyst')),
  created_at timestamptz DEFAULT now()
);

-- Audit log (track admin actions)
CREATE TABLE admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid REFERENCES admin_users(id),
  action text NOT NULL, -- 'user_suspended', 'ring_blocked', 'refund_issued'
  target_user_id uuid REFERENCES auth.users(id),
  target_resource_id uuid, -- ring_id or transaction_id
  details jsonb,
  created_at timestamptz DEFAULT now()
);

-- Support tickets (optional)
CREATE TABLE support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  subject text NOT NULL,
  description text NOT NULL,
  status text DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
  assigned_to uuid REFERENCES admin_users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

---

## Additional Implementation Details

### Environment Variables
```bash
# .env (not committed to repo)
SUPABASE_URL=https://tjboqkcyvsiemuhhirqn.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...
RAZORPAY_KEY_ID=rzp_test_...
```

### Deep Linking Configuration
```json
// app.json
{
  "expo": {
    "scheme": "cosmicattire",
    "ios": {
      "bundleIdentifier": "com.cosmicattire.app"
    },
    "android": {
      "package": "com.cosmicattire.app"
    }
  }
}
```

**Supported URLs**:
- `cosmicattire://auth/callback` - OAuth redirect
- `cosmicattire://auth` - Auth entry
- `cosmicattire://login` - Direct login
- `cosmicattire://signup` - Direct signup

### Error Handling Patterns
```javascript
// Consistent error handling across app
try {
  const { data, error } = await someAsyncFunction();
  if (error) {
    Alert.alert('Error', error);
    return;
  }
  // Success path
} catch (err) {
  console.error('[ComponentName] Error:', err);
  Alert.alert('Error', 'Something went wrong');
}
```

### Loading States
```javascript
const [loading, setLoading] = useState(false);

const handleAction = async () => {
  setLoading(true);
  try {
    await performAction();
  } finally {
    setLoading(false);
  }
};

// UI
{loading ? <ActivityIndicator /> : <Button ... />}
```

---

## Deployment Checklist

### Pre-Production Requirements

1. **Environment Setup**:
   - [ ] Production Supabase project
   - [ ] Production Razorpay account
   - [ ] Configure OAuth providers with production URLs

2. **Security**:
   - [ ] Remove all console.log with sensitive data
   - [ ] Enable Supabase RLS on all tables
   - [ ] Rotate API keys
   - [ ] Implement rate limiting

3. **Testing**:
   - [ ] End-to-end signup flow
   - [ ] Ring pairing flow
   - [ ] Payment integration (real transactions)
   - [ ] OAuth login on iOS and Android
   - [ ] Offline mode handling

4. **App Store Submission**:
   - [ ] Configure app.json with production bundle IDs
   - [ ] Generate app icons and splash screens
   - [ ] Write app descriptions
   - [ ] Create privacy policy
   - [ ] Build with `eas build --platform ios/android`
   - [ ] Submit to App Store / Play Store

5. **Monitoring**:
   - [ ] Set up crash reporting (Sentry)
   - [ ] Analytics integration (if needed)
   - [ ] Backend logging

---

## Conclusion

This document provides complete technical documentation of the COSMIC ATTIRE mobile application. With this information, you can:

1. **Build an Admin Dashboard** - All database schemas, queries, and business logic are documented
2. **Understand the User Journey** - Complete flow from signup to daily usage
3. **Extend the App** - Architecture and code structure are clear
4. **Integrate New Features** - Service layer and API patterns are established
5. **Debug Issues** - Component responsibilities and data flow are mapped

### Key Takeaways for Admin App Development

- **Database**: Use Supabase Service Role Key for full access (bypassing RLS)
- **User Data**: All user info is in `profiles`, `rings`, `wallets`, `transactions` tables
- **Authentication**: Separate admin auth system (don't reuse end-user auth)
- **Analytics**: Aggregate queries on transactions, users, rings tables
- **Actions**: User suspension, ring blocking, refunds, manual balance adjustments
- **Monitoring**: Real-time dashboards, fraud detection, support ticketing

### Contact & Support

For questions about this app or admin dashboard development:
- Review codebase in `src/` directory
- Check Supabase schema in `src/lib/SUPABASE_SCHEMA.sql`
- Refer to API documentation in `src/services/`

---

**Document Version**: 1.0  
**Last Updated**: January 27, 2026  
**App Version**: 0.1.0
