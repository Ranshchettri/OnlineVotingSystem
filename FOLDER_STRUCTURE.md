# Online Voting System - Frontend: Complete Folder Structure

```
OnlineVotingSystem-Frontend/
│
├── 📄 package.json                 (Project dependencies & scripts)
├── 📄 vite.config.js               (Vite build configuration)
├── 📄 eslint.config.js             (ESLint rules)
├── 📄 index.html                   (HTML entry point)
├── 📄 README.md                    (Project readme)
│
├── 📁 public/                      (Static assets)
│
└── 📁 src/                         (Source code - 94+ files)
    │
    ├── 📄 main.jsx                 [ENTRY POINT] React app bootstrapper
    ├── 📄 App.jsx                  [MAIN APP] Root component with Router & Auth
    ├── 📄 App.routes.jsx           [ROUTER CONFIG] All routes (Admin/Party/Voter)
    ├── 📄 App.jsx.bak              [BACKUP] Old version
    ├── 📄 App.css                  (Global app styles)
    ├── 📄 index.css                (Global base styles)
    │
    ├── 📁 admin/                   (ADMIN MODULE - 29 files)
    │   ├── 📄 admin.css            (Admin module wrapper styles)
    │   │
    │   ├── 📁 pages/               (12 admin pages)
    │   │   ├── 📄 adminLogin.jsx           [REAL] Email + password + OTP login
    │   │   ├── 📄 AdminDashboard.jsx       [REAL] Fetch & display candidate analytics
    │   │   ├── 📄 CreateElection.jsx       [REAL] Form to create new election
    │   │   ├── 📄 Elections.jsx            [STUB] Coming soon
    │   │   ├── 📄 Voters.jsx               [REAL] List voters, filter, add modal
    │   │   ├── 📄 Parties.jsx              [REAL] Tabs: Registration Requests + Active
    │   │   ├── 📄 PartyRegistrationRequests.jsx [REAL] Pending party approvals
    │   │   ├── 📄 ActivePartiesManagement.jsx   [REAL] Manage active parties
    │   │   ├── 📄 ElectionResults.jsx      [REAL] Results by election ID
    │   │   ├── 📄 Results.jsx              [STUB] Coming soon
    │   │   ├── 📄 Notifications.jsx        [STUB] Coming soon
    │   │   ├── 📄 VerifyOTP.jsx            [REAL] OTP verification for 2FA
    │   │   └── 📄 PartyCard.jsx            [REAL] Reusable party card
    │   │
    │   ├── 📁 layout/               (3 layout components)
    │   │   ├── 📄 AdminLayout.jsx          [REAL] Main wrapper with auth guard
    │   │   ├── 📄 Topbar.jsx               [REAL] Top navigation bar
    │   │   └── 📄 Sidebar.jsx              [REAL] Left sidebar menu
    │   │
    │   ├── 📁 components/           (1 component)
    │   │   └── 📄 AdminNavbar.jsx          [REAL] Navbar component
    │   │
    │   ├── 📁 services/             (1 service)
    │   │   └── 📄 adminAuthService.js      [REAL] Admin auth helpers
    │   │
    │   └── 📁 styles/               (12 CSS files)
    │       ├── 📄 adminAuth.css             (Auth page styles)
    │       ├── 📄 AdminDashboard.css        (Dashboard styles)
    │       ├── 📄 adminLogin.css            (Login page styles)
    │       ├── 📄 adminNav.css              (Navigation styles)
    │       ├── 📄 auth.css                  (Shared auth styles)
    │       ├── 📄 createElection.css        (Election form styles)
    │       ├── 📄 electionResults.css       (Results display styles)
    │       ├── 📄 parties.css               (Parties page styles)
    │       ├── 📄 partiesPage.css           (Alternative parties styles)
    │       ├── 📄 partyManagement.css       (Management UI styles)
    │       └── 📄 voters.css                (Voters list styles)
    │
    ├── 📁 api/                     (API CLIENTS - 3 files)
    │   ├── 📄 axios.js                    [REAL] Base HTTP client with interceptors
    │   ├── 📄 partyApi.js                 [REAL] Party endpoints (6 methods)
    │   └── 📄 voterApi.js                 [REAL] Voter endpoints (9 methods)
    │
    ├── 📁 app/                     (APP STRUCTURE - 4 files)
    │   ├── 📁 guards/              (2 route guards)
    │   │   ├── 📄 PartyGuard.jsx          [REAL] Party token/role check
    │   │   └── 📄 VoterGuard.jsx          [REAL] Voter token/role check
    │   │
    │   └── 📁 layouts/             (2 layout wrappers)
    │       ├── 📄 PartyLayout.jsx         [REAL] Party route wrapper
    │       └── 📄 VoterLayout.jsx         [REAL] Voter route wrapper
    │
    ├── 📁 auth/                    (AUTH FLOWS - 4 files)
    │   ├── 📄 PartyLogin.jsx              [REAL] Party email login form
    │   ├── 📄 PartyOTP.jsx               [REAL] Party OTP verification
    │   ├── 📄 PartyProtectedRoute.jsx    [REAL] Party route protection
    │   └── 📄 VoterProtected.jsx         [REAL] Voter route protection
    │
    ├── 📁 components/              (SHARED COMPONENTS - 2 files)
    │   ├── 📄 PartyNavbar.jsx             [REAL] Party navbar
    │   └── 📄 PartyStatCard.jsx           [REAL] Stat card component
    │
    ├── 📁 contexts/                (GLOBAL STATE - 1 file)
    │   └── 📄 AuthContext.jsx             [REAL] Auth context provider & consumer
    │
    ├── 📁 features/                (FEATURE MODULES - 18 files)
    │   │
    │   ├── 📁 party/               (PARTY FEATURE - 10 files)
    │   │   ├── 📁 pages/           (3 pages using MOCK data)
    │   │   │   ├── 📄 Dashboard.jsx       [MOCK] Uses party.mock.js - dashboard
    │   │   │   ├── 📄 Analytics.jsx       [MOCK] Uses party.mock.js - rankings
    │   │   │   └── 📄 Profile.jsx        [MOCK] Uses party.mock.js - profile edit
    │   │   │
    │   │   ├── 📁 components/      (3 UI components)
    │   │   │   ├── 📄 StatCard.jsx        [REAL] Stat display card
    │   │   │   ├── 📄 RankBadge.jsx       [REAL] Rank badge (e.g., 2 of 7)
    │   │   │   └── 📄 VotesChart.jsx      [REAL] Timeline chart
    │   │   │
    │   │   └── 📁 mock/            (1 MOCK DATA file)
    │   │       └── 📄 party.mock.js       [🔴 FAKE DATA]
    │   │               Contains: partyDashboard, partyProfile, partyAnalytics
    │   │
    │   └── 📁 voter/               (VOTER FEATURE - 8 files)
    │       ├── 📁 pages/           (4 pages using MOCK data)
    │       │   ├── 📄 Home.jsx            [MOCK] Uses voter.mock.js - landing page
    │       │   ├── 📄 Vote.jsx            [MOCK] Uses voter.mock.js - voting UI
    │       │   ├── 📄 Results.jsx         [MOCK] Uses voter.mock.js - results
    │       │   └── 📄 History.jsx         [MOCK] Uses voter.mock.js - vote history
    │       │
    │       ├── 📁 components/      (4 UI components)
    │       │   ├── 📄 ElectionCard.jsx    [REAL] Election info card
    │       │   ├── 📄 PartyCard.jsx       [REAL] Selectable party card
    │       │   ├── 📄 ResultRow.jsx       [REAL] Results table row
    │       │   └── 📄 TimelineItem.jsx    [REAL] Timeline entry
    │       │
    │       └── 📁 mock/            (1 MOCK DATA file)
    │           └── 📄 voter.mock.js       [🔴 FAKE DATA]
    │                   Contains: voterHome, parties, voteHistory, votedParty
    │
    ├── 📁 hooks/                   (CUSTOM HOOKS - 1 file)
    │   └── 📄 useAuth.js                  [REAL] Hook to access auth context
    │
    ├── 📁 party/                   (PARTY MODULE (OLD) - 5 files)
    │   │                           [DUPLICATE of features/party - uses partyFakeData]
    │   ├── 📄 Dashboard.jsx               [MOCK] Uses partyFakeData.js
    │   ├── 📄 Analytics.jsx               [MOCK] Uses partyFakeData.js
    │   ├── 📄 Profile.jsx                 [MOCK] Uses partyFakeData.js
    │   ├── 📄 Results.jsx                 [MOCK] Minimal implementation
    │   └── 📄 PartyLayout.jsx             [REAL] Layout wrapper
    │
    ├── 📁 services/                (SERVICES & FAKE DATA - 8 files)
    │   ├── 📄 api.js                      [REAL] Main axios instance
    │   ├── 📄 authService.js              [REAL] Auth helpers
    │   ├── 📄 adminService.js             [REAL] Admin API calls
    │   ├── 📄 partyService.js             [REAL] Party API (5 endpoints)
    │   ├── 📄 voterService.js             [REAL] Voter API (6 endpoints)
    │   ├── 📄 voteService.js              [REAL] Vote submission (2 endpoints)
    │   └── 📄 partyFakeData.js            [🔴 FAKE DATA]
    │           Contains: partyDashboardData, partyProfileData, partyAnalyticsData
    │           Used by: /party/Dashboard.jsx, /party/Analytics.jsx, /party/Profile.jsx
    │
    ├── 📁 shared/                  (SHARED UI - 3 files)
    │   └── 📁 ui/
    │       ├── 📄 Card.jsx                [REAL] Generic card wrapper
    │       ├── 📄 Button.jsx              [REAL] Button with variants
    │       └── 📄 Badge.jsx               [REAL] Badge component
    │
    ├── 📁 styles/                  (GLOBAL STYLES - 9 CSS files)
    │   ├── 📄 theme.css                  (Color & font variables)
    │   ├── 📄 party.css                  (Party module base styles)
    │   ├── 📄 party-auth.css              (Party auth styles)
    │   ├── 📄 party-dashboard.css         (Dashboard styles)
    │   ├── 📄 party-analytics.css         (Analytics styles)
    │   ├── 📄 party-profile.css           (Profile styles)
    │   ├── 📄 party-results.css           (Results styles)
    │   ├── 📄 party-layout.css            (Layout styles)
    │   └── 📄 party-navbar.css            (Navbar styles)
    │
    ├── 📁 utils/                   (UTILITIES - 1 file)
    │   └── 📄 auth.js                    [REAL] JWT decode & helpers
    │
    └── 📁 voter/                   (VOTER MODULE - 10 files)
        │                           [PAGE-BASED structure]
        ├── 📄 Login.jsx                   [REAL] Email + Voter ID login
        ├── 📄 OTP.jsx                    [REAL] OTP verification
        ├── 📄 Dashboard.jsx               [REAL] Layout wrapper
        ├── 📄 Vote.jsx                    [REAL] Voting UI
        ├── 📄 Parties.jsx                 [REAL] Browse parties
        ├── 📄 Results.jsx                 [REAL] Election results
        ├── 📄 History.jsx                 [REAL] Vote history
        ├── 📄 Profile.jsx                 [REAL] Voter profile
        ├── 📄 VoteOTP.jsx                 [REAL] Vote confirmation OTP
        └── 📄 VoterLayout.jsx             [REAL] Layout wrapper with guard

```

---

## 📊 FILE STATISTICS

### By Type

- **Real App Code:** 75+ files
- **Fake/Test Data:** 3 files (`party.mock.js`, `partyFakeData.js`, `voter.mock.js`)
- **CSS/Styling:** 16+ files

### By Module

| Module           | Pages  | Components | Services | Styles | Mock Data | Total   |
| ---------------- | ------ | ---------- | -------- | ------ | --------- | ------- |
| Admin            | 12     | 1          | 1        | 12     | 0         |  **26**  |
| Party (features) | 3      | 3          | 0        | 0      | 1         | **7**   |
| Party (old)      | 5      | 0          | 1        | 0      | 1         | **7**   |
| Voter (features) | 4      | 4          | 0        | 0      | 1         | **9**   |
| Voter (pages)    | 10     | 0          | 0        | 0      | 0         | **10**  |
| Shared/Global    | -      | 5          | 8        | 9      | 0         | **22**  |
| Auth             | 4      | 0          | 0        | 0      | 0         | **4**   |
| **TOTAL**        | **38** | **13**     | **10**   | **21** | **3**     | **85+** |

---

## 🎯 KEY PATHS

### Admin Module

```
src/admin/                    ← Complete admin system
├── pages/                    ← 12 admin pages (all REAL)
├── layout/                   ← Admin layout components
├── services/                 ← Admin auth service
└── styles/                   ← 12 CSS files
```

### Party Module (Dual Implementation)

```
src/features/party/          ← NEWER (feature-based) using party.mock.js
└── src/party/               ← OLDER (page-based) using partyFakeData.js
   ↓
BOTH have: Dashboard, Analytics, Profile pages
DIFFERENT MOCK DATA sources
```

### Voter Module

```
src/features/voter/          ← NEWER (feature-based) using voter.mock.js
   └── pages/                ← 4 voter pages (all using MOCK data)

src/voter/                    ← OLDER (page-based) using real API calls
   └── 10 page files          ← Voting, history, profile, etc.
```

### API & Services

```
src/api/                      ← HTTP client definitions (real)
src/services/                 ← API wrappers (real) + FAKE data
```

---

## 🔴 MOCK DATA LOCATIONS

### Party Mock

- **File:** `src/features/party/mock/party.mock.js`
- **Objects:**
  - `partyDashboard` - election status, votes, rank, timeline
  - `partyProfile` - party name, manifesto, logo
  - `partyAnalytics` - ranking table (7 parties)
- **Used By:** `src/features/party/pages/Dashboard.jsx`, Analytics.jsx, Profile.jsx

### Party Fake Data

- **File:** `src/services/partyFakeData.js`
- **Objects:**
  - `partyDashboardData` - party name, votes, rank
  - `partyProfileData` - description, manifesto array
  - `partyAnalyticsData` - goodWork %, badWork %
- **Used By:** `src/party/Dashboard.jsx`, Analytics.jsx, Profile.jsx

### Voter Mock

- **File:** `src/features/voter/mock/voter.mock.js`
- **Objects:**
  - `voterHome` - active election, stats (1.2M voters, 7 parties, 61% turnout)
  - `parties` - 5 party objects with votes
  - `voteHistory` - 2 historical elections
  - `votedParty` - selected party info
- **Used By:** `src/features/voter/pages/Home.jsx`, Vote.jsx, Results.jsx, History.jsx

---

## 🚀 ROLE-BASED ROUTES

### Admin Routes (`/admin/*`)

```
/admin/login                  → adminLogin.jsx
/admin/dashboard              → AdminDashboard.jsx
/admin/elections              → Elections.jsx
/admin/elections/create       → CreateElection.jsx
/admin/elections/results/:id  → ElectionResults.jsx
/admin/voters                 → Voters.jsx
/admin/parties                → Parties.jsx (with tabs)
/admin/results                → Results.jsx
/admin/notifications          → Notifications.jsx
```

### Party Routes (`/party/*`)

```
/party/login                  → PartyLogin.jsx
/party/dashboard              → PartyDashboard (from /party/Dashboard.jsx)
/party/analytics              → Analytics.jsx
/party/profile                → Profile.jsx
/party/results                → Results.jsx
```

### Voter Routes (`/voter/*`)

```
/voter/login                  → voter/Login.jsx
/voter/otp                    → voter/OTP.jsx
/voter/dashboard              → voter/Dashboard.jsx
/voter/parties                → voter/Parties.jsx
/voter/vote                   → voter/Vote.jsx
/voter/vote-otp               → voter/VoteOTP.jsx
/voter/results                → voter/Results.jsx
/voter/history                → voter/History.jsx
/voter/profile                → voter/Profile.jsx
```

---

## ✅ INTEGRATION CHECKLIST

### To Connect to Real Backend:

- [ ] Replace `party.mock.js` imports with API calls to `partyApi.js`
- [ ] Replace `partyFakeData.js` imports with API calls to `partyService.js`
- [ ] Replace `voter.mock.js` imports with API calls to `voterApi.js`
- [ ] Merge `/party/` and `/features/party/` into single structure
- [ ] Merge `/voter/` pages with `/features/voter/` pages
- [ ] Add loading spinners for API calls
- [ ] Add error handling for failed API calls

---

**Generated:** February 3, 2026
