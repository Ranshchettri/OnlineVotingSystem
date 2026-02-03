# Online Voting System - Frontend: Complete Project Structure & Analysis

**Generated:** February 3, 2026  
**Total Files:** 85+ (JSX, JS, CSS)  
**Project Type:** React + Vite SPA with Multi-Role Auth (Admin, Party, Voter)

---

## TABLE OF CONTENTS

1. [Root-Level Files](#root-level-files)
2. [Core App Structure](#core-app-structure)
3. [Admin Module (Complete)](#admin-module-complete)
4. [Party Module (Mock + Real UI)](#party-module-mock--real-ui)
5. [Voter Module (Mock + Real UI)](#voter-module-mock--real-ui)
6. [Services & APIs](#services--apis)
7. [Shared Components & Utilities](#shared-components--utilities)
8. [Mock vs Real Data Summary](#mock-vs-real-data-summary)

---

## ROOT-LEVEL FILES

### `src/main.jsx` [ENTRY POINT]

- **Purpose:** React app bootstrapper
- **Content:** Renders App component to DOM, imports Bootstrap CSS & icons
- **Type:** Real app code
- **Dependencies:** React, ReactDOM, Bootstrap

### `src/App.jsx` [MAIN APP]

- **Purpose:** Root component wrapper
- **Content:**
  - `<BrowserRouter>` - React Router setup
  - `<AuthProvider>` - Global auth context
  - `<AppRoutes />` - Route config
- **Type:** Real app code

### `src/App.routes.jsx` [ROUTER CONFIG]

- **Purpose:** Central routing configuration for all 3 roles
- **Content:**
  - Admin routes: `/admin/login`, `/admin/dashboard`, `/admin/elections/*`, etc.
  - Party routes: `/party/login`, `/party/dashboard`, `/party/analytics`, etc.
  - Voter routes: `/voter/login`, `/voter/dashboard`, `/voter/vote`, `/voter/results`, etc.
  - Stateful login flow for both Party and Voter (manages email + OTP screen state)
- **Type:** Real app code (routes) + Mock (login flow state management)
- **Total Routes:** 20+ endpoints

### `src/App.jsx.bak` [BACKUP]

- **Purpose:** Old version backup (contains only admin login + dashboard)
- **Type:** Deprecated/backup code

### `src/App.css` & `src/index.css`

- **Purpose:** Global styles
- **Type:** Real app code

---

## CORE APP STRUCTURE

### `src/contexts/AuthContext.jsx` [AUTH STATE MANAGEMENT]

- **Purpose:** Global auth context provider
- **Functions:**
  - `login()` - POST to `/auth/login`, stores token + user in localStorage
  - `logout()` - Clears localStorage
  - Provides `user`, `loading`, `login`, `logout` to entire app
- **Type:** Real app code (connects to backend)
- **Provider:** Wraps root App component

### `src/hooks/useAuth.js` [AUTH HOOK]

- **Purpose:** Custom hook to consume AuthContext
- **Functions:**
  - `saveToken(token)` - localStorage.setItem("token")
  - `isLoggedIn()` - Checks if token exists
  - `logout()` - Clears storage + redirect
- **Type:** Real app code
- **Usage:** Anywhere you need auth state

### `src/utils/auth.js`

- **Purpose:** Token utilities
- **Functions:** `decodeToken()`, `getToken()` - JWT parsing helpers
- **Type:** Real app code

---

## ADMIN MODULE (COMPLETE)

### Directory: `src/admin/`

#### **Pages** (`src/admin/pages/`)

| File                            | Purpose                                                             | Type       | Status                                     |
| ------------------------------- | ------------------------------------------------------------------- | ---------- | ------------------------------------------ |
| `adminLogin.jsx`                | Admin email + password + OTP verification flow                      | Real       | Connected to `/auth/login` endpoint        |
| `AdminDashboard.jsx`            | Fetches `/analytics/candidates`, displays candidate stats           | Real       | API calls to backend                       |
| `CreateElection.jsx`            | Form to create new election (POST `/elections`)                     | Real       | Full form validation + submission          |
| `Elections.jsx`                 | Stub page: "coming soon"                                            | Incomplete | Not implemented                            |
| `Voters.jsx`                    | Lists all voters, filter by status, pagination, add new voter modal | Real       | Fetches `/voters` or `/voters/admin/stats` |
| `Parties.jsx`                   | Tabs for "Registration Requests" + "Active Parties"                 | Real       | Uses sub-components                        |
| `PartyRegistrationRequests.jsx` | Lists pending party approvals                                       | Real       | Fetches party requests from API            |
| `ActivePartiesManagement.jsx`   | Lists approved parties, manage statuses                             | Real       | Party management UI                        |
| `ElectionResults.jsx`           | Displays election results by ID                                     | Real       | Parameterized route                        |
| `Results.jsx`                   | Stub page: "coming soon"                                            | Incomplete | Not implemented                            |
| `Notifications.jsx`             | Stub page: "coming soon"                                            | Incomplete | Not implemented                            |
| `VerifyOTP.jsx`                 | OTP verification for admin 2FA                                      | Real       | OTP input + verification                   |
| `PartyCard.jsx`                 | Reusable party card component                                       | Real       | Small component                            |

#### **Layout** (`src/admin/layout/`)

| File              | Purpose                                                                         | Type |
| ----------------- | ------------------------------------------------------------------------------- | ---- |
| `AdminLayout.jsx` | Wrapper with auth check (redirects if not ADMIN role), renders Topbar + content | Real |
| `Topbar.jsx`      | Top navigation bar (logout, profile, etc.)                                      | Real |
| `Sidebar.jsx`     | Left sidebar nav menu                                                           | Real |

#### **Components** (`src/admin/components/`)

| File              | Purpose                                | Type |
| ----------------- | -------------------------------------- | ---- |
| `AdminNavbar.jsx` | Navbar component (shared across admin) | Real |

#### **Services** (`src/admin/services/`)

| File                  | Purpose                                                        | Type |
| --------------------- | -------------------------------------------------------------- | ---- |
| `adminAuthService.js` | Helper for `adminLogin()`, `verifyAdminOtp()` calls to backend | Real |

#### **Styles** (`src/admin/styles/`)

- `admin.css` - Root admin layout styles
- `adminAuth.css`, `adminLogin.css` - Login/auth styles
- `adminNav.css`, `AdminDashboard.css` - Component styles
- `createElection.css`, `electionResults.css` - Page styles
- `voters.css`, `parties.css`, `partyManagement.css` - Page styles
- `auth.css` - Shared auth styles

**Admin Summary:** Fully implemented real app code. All pages connect to real backend APIs for election/voter/party management.

---

## PARTY MODULE (Mock + Real UI)

### Directory: `src/features/party/` & `src/party/`

#### **features/party/pages/** [NEW FEATURE PAGES - USE MOCK DATA]

| File            | Purpose                                               | Source          | Type | Status                                                   |
| --------------- | ----------------------------------------------------- | --------------- | ---- | -------------------------------------------------------- |
| `Dashboard.jsx` | Displays party vote stats, ranking, election timeline | `party.mock.js` | Mock | Uses mock data from `partyDashboard` object              |
| `Analytics.jsx` | Party ranking table vs other parties                  | `party.mock.js` | Mock | Uses `partyAnalytics.ranks` (7 parties with vote counts) |
| `Profile.jsx`   | Edit/view party manifesto + description               | `party.mock.js` | Mock | Uses `partyProfile`, edit is client-side only            |

#### **features/party/components/** [UI COMPONENTS]

| File             | Purpose                                           | Type |
| ---------------- | ------------------------------------------------- | ---- |
| `StatCard.jsx`   | Card displaying stat (votes, rank, trend, status) | Real |
| `RankBadge.jsx`  | Badge showing party rank (e.g., "Rank 2 of 7")    | Real |
| `VotesChart.jsx` | Chart showing vote timeline data                  | Real |

#### **features/party/mock/** [MOCK DATA]

| File            | Content                                                    | Type               | Usage                                 |
| --------------- | ---------------------------------------------------------- | ------------------ | ------------------------------------- |
| `party.mock.js` | `partyDashboard`, `partyProfile`, `partyAnalytics` objects | **FAKE/TEST DATA** | Imported by `/features/party/pages/*` |

**Mock Data Details (party.mock.js):**

```javascript
partyDashboard = {
  electionTitle: "National Assembly 2026",
  status: "ACTIVE",
  rank: 2,
  votes: 18234,
  trend: "+3.2%",
  timeline: [...] // 5 time points
}

partyProfile = {
  name: "Progressive Unity Party",
  manifesto: "Jobs, education, clean governance.",
  logo: "/mock/logo.png",
  coverImage: "/mock/cover.jpg"
}

partyAnalytics = {
  ranks: [7 parties with votes and names]
}
```

#### **party/** [OLD/ALTERNATIVE PARTY PAGES - USE partyFakeData.js]

| File              | Purpose                        | Source             | Type           | Status                                            |
| ----------------- | ------------------------------ | ------------------ | -------------- | ------------------------------------------------- |
| `Dashboard.jsx`   | Alt dashboard page             | `partyFakeData.js` | Mock           | Same role as `features/party/pages/Dashboard.jsx` |
| `Analytics.jsx`   | Alt analytics page             | `partyFakeData.js` | Mock           | Shows "Good Work" 68% vs "Bad Work" 32%           |
| `Profile.jsx`     | Alt profile page               | `partyFakeData.js` | Mock           | Edit form (client-side only)                      |
| `Results.jsx`     | Results display (stub)         | Not specified      | Incomplete     | Minimal implementation                            |
| `PartyLayout.jsx` | Layout wrapper for party pages | Real               | Page structure |

#### **services/partyFakeData.js** [FAKE DATA SOURCE]

**Type: FAKE/TEST DATA**

```javascript
partyDashboardData = {
  partyName: "Nepal Progressive Party",
  electionTitle: "General Election 2026",
  status: "ACTIVE",
  votesReceived: 128430,
  rank: 1,
  totalParties: 12,
  votePercentage: 34.6
}

partyProfileData = {
  description: "We aim to build a strong, corruption-free...",
  manifesto: ["Digital governance", "Employment for youth", ...]
}

partyAnalyticsData = {
  goodWork: 68,
  badWork: 32
}
```

#### **services/partyService.js** [REAL API WRAPPER]

```javascript
getPartyProfile() → api.get("/party/profile")
updatePartyInfo(data) → api.put("/party/profile", data)
getPartyVotes() → api.get("/party/votes")
getPartyDetails(partyId) → api.get("/parties/{partyId}")
```

**Type:** Real app code (backend integration)

#### **api/partyApi.js** [REAL API METHODS]

```javascript
partyLogin(email) → POST /auth/party-login
verifyPartyOTP(data) → POST /auth/party/verify-otp
getPartyDashboard() → GET /party/dashboard
updatePartyProfile(data) → PUT /party/profile
getPartyAnalytics() → GET /party/analytics
getPartyResults() → GET /party/results
```

**Type:** Real app code (endpoint definitions)

#### **Styles** (`src/styles/party-*.css`)

- `party-auth.css` - Party login styling
- `party-dashboard.css` - Dashboard styles
- `party-analytics.css` - Analytics page styles
- `party-profile.css` - Profile edit form styles
- `party-results.css` - Results display styles
- `party-layout.css` - Layout wrapper styles
- `party-navbar.css` - Navigation styles
- `party.css` - General party module styles

#### **Auth** (`src/auth/PartyLogin.jsx`, `src/auth/PartyOTP.jsx`)

| File                      | Purpose                                            | Type |
| ------------------------- | -------------------------------------------------- | ---- |
| `PartyLogin.jsx`          | Email input form, sends OTP via `partyLogin()` API | Real |
| `PartyOTP.jsx`            | OTP verification form                              | Real |
| `PartyProtectedRoute.jsx` | Route guard for party pages (checks token)         | Real |

**Party Summary:**

- **Mock/Fake Data:** `party.mock.js` + `partyFakeData.js` contain test data for development
- **Real Code:** Auth flows, API definitions, services, UI components
- **Pages:** Both `/features/party/` and `/party/` duplicate functionality (design decision)
- **Status:** UI complete, backend integration ready but using mock data for testing

---

## VOTER MODULE (Mock + Real UI)

### Directory: `src/features/voter/` & `src/voter/`

#### **features/voter/pages/** [VOTER FEATURE PAGES - USE MOCK DATA]

| File          | Purpose                                        | Source          | Type | Status                                                         |
| ------------- | ---------------------------------------------- | --------------- | ---- | -------------------------------------------------------------- |
| `Home.jsx`    | Landing page with active election, voter stats | `voter.mock.js` | Mock | Uses `voterHome` object (1.2M voters, 7 parties, 61% turnout)  |
| `Vote.jsx`    | Party selection UI + OTP verification flow     | `voter.mock.js` | Mock | Lists 5 parties from mock data, submit vote (client-side demo) |
| `Results.jsx` | Election results ranking                       | `voter.mock.js` | Mock | Sorts `parties` array by votes                                 |
| `History.jsx` | Voter's past votes timeline                    | `voter.mock.js` | Mock | Shows 2 historical elections                                   |

#### **features/voter/components/** [UI COMPONENTS]

| File               | Purpose                                              | Type |
| ------------------ | ---------------------------------------------------- | ---- |
| `ElectionCard.jsx` | Displays active election info + countdown            | Real |
| `PartyCard.jsx`    | Selectable party card (shows name, votes, manifesto) | Real |
| `ResultRow.jsx`    | Single row in results table (rank + party info)      | Real |
| `TimelineItem.jsx` | Timeline entry for vote history                      | Real |

#### **features/voter/mock/** [MOCK DATA]

| File            | Content                                                     | Type               | Usage                   |
| --------------- | ----------------------------------------------------------- | ------------------ | ----------------------- |
| `voter.mock.js` | `voterHome`, `parties`, `voteHistory`, `votedParty` objects | **FAKE/TEST DATA** | Imported by voter pages |

**Mock Data Details (voter.mock.js):**

```javascript
voterHome = {
  activeElection: {
    id: "e1",
    title: "National Assembly 2026",
    endsAt: "2026-03-01T18:00:00"
  },
  stats: {
    totalVoters: 1203456,
    parties: 7,
    turnout: "61%"
  }
}

parties = [5 party objects with id, name, logo, votes, manifesto]

voteHistory = [2 historical election entries]

votedParty = { id: "p2", name: "Green Front" }
```

#### **voter/** [VOTER PAGE WRAPPERS]

| File              | Purpose                           | Type | Status                       |
| ----------------- | --------------------------------- | ---- | ---------------------------- |
| `Login.jsx`       | Email/Phone + Voter ID input form | Real | Calls `voterLogin()` API     |
| `OTP.jsx`         | OTP verification                  | Real | Calls `verifyVoterOTP()` API |
| `Dashboard.jsx`   | Voter dashboard redirect/wrapper  | Real | Layout                       |
| `Vote.jsx`        | Vote casting page wrapper         | Real | Layout                       |
| `Parties.jsx`     | Browse all parties                | Real | Calls API for party list     |
| `Results.jsx`     | View election results             | Real | API call                     |
| `History.jsx`     | Voting history                    | Real | API call                     |
| `Profile.jsx`     | Voter profile edit/view           | Real | API call                     |
| `VoteOTP.jsx`     | OTP for vote confirmation         | Real | API call                     |
| `VoterLayout.jsx` | Layout wrapper (auth guard)       | Real | Page structure               |

#### **services/voterService.js** [REAL API WRAPPER]

```javascript
getVoterDashboard() → GET /voter/dashboard
getVoterProfile() → GET /voter/profile
getActiveParties() → GET /voter/parties
castVote(data) → POST /voter/vote
getElectionResults() → GET /voter/election-results
```

**Type:** Real app code

#### **services/voteService.js** [REAL API WRAPPER]

```javascript
getVoteParties() → GET /voter/active-parties
submitVote(data) → POST /votes
```

**Type:** Real app code

#### **api/voterApi.js** [REAL API METHODS]

```javascript
voterLogin(payload) → POST /auth/voter-login
verifyVoterOTP(payload) → POST /auth/voter/verify-otp
getVoterDashboard() → GET /voter/dashboard
getAllParties() → GET /voter/parties
submitVote(payload) → POST /voter/vote
getVoterResults() → GET /voter/results
getVoterProfile() → GET /voter/profile
updateVoterProfile(payload) → PUT /voter/profile
getVoterVoteHistory() → GET /voter/vote-history
```

**Type:** Real app code

#### **Auth** (`src/auth/VoterProtected.jsx`)

| File                 | Purpose                          | Type |
| -------------------- | -------------------------------- | ---- |
| `VoterProtected.jsx` | Route guard (checks voter token) | Real |

**Voter Summary:**

- **Mock/Fake Data:** `voter.mock.js` contains 5 test parties + election stats + history
- **Real Code:** Auth flows, API definitions, services, UI components
- **Structure:** Two layers: `/features/voter/` (feature-based) + `/voter/` (page-based)
- **Status:** UI complete, backend integration ready but using mock data for testing

---

## SERVICES & APIs

### API Clients

#### `src/api/axios.js` [AXIOS INSTANCE]

- **Purpose:** Base HTTP client with auth interceptor
- **Config:** `baseURL: http://localhost:5000/api`
- **Interceptor:** Auto-adds `Authorization: Bearer {token}` to all requests
- **Response Handler:** Logs 401 errors, clears auth on failure
- **Type:** Real app code

#### `src/api/partyApi.js` [PARTY ENDPOINTS]

- **Type:** Real endpoint definitions
- **Calls:** 6 party-specific API methods

#### `src/api/voterApi.js` [VOTER ENDPOINTS]

- **Type:** Real endpoint definitions
- **Calls:** 9 voter-specific API methods

### Service Modules

#### `src/services/api.js` [MAIN API INSTANCE]

- **Purpose:** Global axios instance (different from `src/api/axios.js`)
- **Config:** `baseURL: http://localhost:5000/api`
- **Used by:** Admin pages (CreateElection, Voters, etc.)
- **Type:** Real app code

#### `src/services/authService.js` [AUTH SERVICE]

```javascript
loginAdmin(data) → POST /auth/login with role check
```

**Type:** Real app code

#### `src/services/adminService.js` [ADMIN SERVICE]

- **Purpose:** Admin-specific API calls
- **Type:** Real app code (header missing, but referenced)

#### `src/services/partyService.js` [PARTY SERVICE]

```javascript
getPartyProfile() → GET /party/profile
updatePartyInfo(data) → PUT /party/profile
getPartyVotes() → GET /party/votes
getPartyDetails(partyId) → GET /parties/{partyId}
getPartyStats(partyId) → GET /parties/{partyId}/stats
```

**Type:** Real app code

#### `src/services/voterService.js` [VOTER SERVICE]

```javascript
getVoterDashboard() → GET /voter/dashboard
getVoterProfile() → GET /voter/profile
getActiveParties() → GET /voter/parties
castVote(data) → POST /voter/vote
getElectionResults() → GET /voter/election-results
```

**Type:** Real app code

#### `src/services/voteService.js` [VOTE SERVICE]

```javascript
getVoteParties() → GET /voter/active-parties
submitVote(data) → POST /votes
```

**Type:** Real app code

#### `src/services/partyFakeData.js` [FAKE DATA]

- **Type:** FAKE/TEST DATA
- **Contains:** Mock party dashboard, profile, analytics data
- **Used by:** `/party/Dashboard.jsx`, `/party/Analytics.jsx`, `/party/Profile.jsx`

---

## SHARED COMPONENTS & UTILITIES

### Components (`src/components/`)

| File                | Purpose               | Type |
| ------------------- | --------------------- | ---- |
| `PartyNavbar.jsx`   | Party-specific navbar | Real |
| `PartyStatCard.jsx` | Reusable stat card    | Real |

### UI Components (`src/shared/ui/`)

| File         | Purpose                                                              | Type |
| ------------ | -------------------------------------------------------------------- | ---- |
| `Card.jsx`   | Generic card wrapper with classname support                          | Real |
| `Button.jsx` | Button with variant (primary, secondary, danger) + size (sm, md, lg) | Real |
| `Badge.jsx`  | Badge component for labels/counts                                    | Real |

### App Guards (`src/app/guards/`)

| File             | Purpose                               | Type |
| ---------------- | ------------------------------------- | ---- |
| `PartyGuard.jsx` | Route guard checking party token/role | Real |
| `VoterGuard.jsx` | Route guard checking voter token/role | Real |

### App Layouts (`src/app/layouts/`)

| File              | Purpose                         | Type |
| ----------------- | ------------------------------- | ---- |
| `PartyLayout.jsx` | Layout wrapper for party routes | Real |
| `VoterLayout.jsx` | Layout wrapper for voter routes | Real |

### Utilities (`src/utils/`)

| File      | Purpose                             | Type |
| --------- | ----------------------------------- | ---- |
| `auth.js` | JWT decode, token retrieval helpers | Real |

### Global Styles (`src/styles/`)

| File          | Purpose                                                       |
| ------------- | ------------------------------------------------------------- |
| `theme.css`   | Global theme variables (colors, fonts, spacing)               |
| `party.css`   | Base party module styles                                      |
| `party-*.css` | Feature-specific party styles (auth, dashboard, layout, etc.) |

---

## MOCK vs REAL DATA SUMMARY

### FAKE/TEST DATA FILES (Used for UI Development & Testing)

| File               | Location                   | Purpose                 | Objects                                                        | Status   |
| ------------------ | -------------------------- | ----------------------- | -------------------------------------------------------------- | -------- |
| `party.mock.js`    | `src/features/party/mock/` | Party feature test data | `partyDashboard`, `partyProfile`, `partyAnalytics`             | **MOCK** |
| `partyFakeData.js` | `src/services/`            | Alt party test data     | `partyDashboardData`, `partyProfileData`, `partyAnalyticsData` | **MOCK** |
| `voter.mock.js`    | `src/features/voter/mock/` | Voter feature test data | `voterHome`, `parties`, `voteHistory`, `votedParty`            | **MOCK** |

**Why are they there?**

- You requested **fake data for testing** during development
- Allows UI development **without backend API running**
- Enables rapid prototyping of pages before integrating with backend
- Can be replaced with real API calls when backend is ready

### REAL APPLICATION CODE (Will Connect to Backend)

| Module      | Type | Files                         | Purpose                              |
| ----------- | ---- | ----------------------------- | ------------------------------------ |
| Admin       | Real | Pages, Layout, Services       | Election/Voter/Party management      |
| Party       | Real | Auth, API, Services           | Party login, profile, analytics      |
| Voter       | Real | Auth, API, Services           | Voter login, voting, results         |
| API Clients | Real | `api/*.js`, `services/*.js`   | HTTP request definitions             |
| Auth        | Real | AuthContext, Guards           | Global auth state + route protection |
| Shared      | Real | Components, Guards, Utilities | Reusable across all modules          |

---

## FILE COUNT BREAKDOWN

```
Admin Module:
  - Pages: 12 files
  - Layout: 3 files
  - Components: 1 file
  - Services: 1 file
  - Styles: 12 CSS files
  Total: ~29 files

Party Module:
  - Features pages: 3 files (using mock)
  - Components: 3 files
  - Mock data: 1 file (FAKE)
  - Old pages: 5 files (using partyFakeData)
  - Styles: 8 CSS files
  Total: ~20 files

Voter Module:
  - Features pages: 4 files (using mock)
  - Components: 4 files
  - Mock data: 1 file (FAKE)
  - Pages/wrappers: 9 files
  Total: ~18 files

Shared:
  - Contexts: 1 file
  - Hooks: 1 file
  - Guards: 2 files
  - Layouts: 2 files
  - Components: 5 files
  - Utilities: 1 file
  - API clients: 3 files
  - Services: 7 files
  Total: ~22 files

Root:
  - App, Routes, Main, CSS: 4 files
  - Backup: 1 file

GRAND TOTAL: ~94+ files
```

---

## KEY INSIGHTS

### Why "Lot of Party Content"?

1. **Multi-role System** - You built separate UIs for Admin, Party, and Voter roles
   - Each role has own pages, auth flow, dashboard, and styling
   - Party module is comprehensive: dashboard, analytics, profile, results

2. **Feature Duplication** - Two parallel implementations:
   - `/features/party/` (newer, feature-based structure)
   - `/party/` (older, page-based structure)
   - Both use different mock data sources (`party.mock.js` vs `partyFakeData.js`)

3. **Styling** - 8 dedicated CSS files for party module alone
   - Auth, dashboard, analytics, profile, results, layout, navbar styles

### Original vs Fake/Test:

- **Original (Real Code):**
  - All authentication flows (admin, party, voter)
  - All API service definitions and wrappers
  - All UI components, guards, contexts
  - All layout and styling
  - Route configuration

- **Fake/Test (What You Requested):**
  - `party.mock.js` - Party dashboard, profile, analytics test data
  - `partyFakeData.js` - Alternative party test data (duplicate for /party module)
  - `voter.mock.js` - Voter homepage, parties list, history, election stats test data
  - These enable UI development without running backend server

### Next Steps:

**To use real data instead of mocks:**

1. Import API methods from `src/api/partyApi.js` or `src/services/partyService.js`
2. Replace `partyDashboard` with `await getPartyDashboard()`
3. Replace `parties` with `await getAllParties()`
4. Same pattern for all mock-using pages
5. Add loading states, error handling

**Cleanup (Optional):**

- Merge `/party/` and `/features/party/` into single structure
- Remove duplicate mock data files
- Consolidate services

---

**End of Detailed Structure Report**
