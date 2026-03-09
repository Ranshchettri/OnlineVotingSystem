# Frontend UI Architecture

This file documents the current frontend-only structure inside `src/`.

## Stack
- Framework: `React` + `Vite`
- Routing: `react-router-dom`
- API client: `axios`
- Icons: `Remix Icon` loaded from CDN in `index.html`
- Fonts:
  - Tailwind base `font-sans`
  - system sans stack from `src/styles/theme.css`

## Root app wiring
- `src/main.jsx`: React bootstrap
- `src/App.jsx`: root wrapper
- `src/app/router.jsx`: all routes
- `src/app/AccessLanding.jsx`: landing page / access entry
- `src/app/guards/PartyGuard.jsx`: party-only route guard
- `src/app/guards/VoterGuard.jsx`: voter-only route guard
- `src/auth/RoleProtected.jsx`: role protection helper

## Shared auth and API layer
- `src/auth/PortalLogin.jsx`: combined role login page
- `src/auth/PartyLogin.jsx`: party login page
- `src/auth/PartyOTP.jsx`: party OTP page
- `src/services/api.js`: main axios instance
- `src/services/adminService.js`: admin API helpers
- `src/services/authService.js`: auth helpers
- `src/services/partyService.js`: party API helpers
- `src/services/voterService.js`: voter API helpers
- `src/services/voteService.js`: voting API helpers
- `src/api/axios.js`, `src/api/partyApi.js`, `src/api/voterApi.js`: alternate API wrappers still present in frontend

## Admin portal
### Layout
- `src/admin/layout/AdminLayout.jsx`: admin shell wrapper
- `src/admin/layout/Sidebar.jsx`: admin sidebar
- `src/admin/layout/Topbar.jsx`: admin topbar
- `src/admin/admin.css`: shared admin shell/sidebar/topbar styles

### Pages
- `src/admin/pages/AdminDashboard.jsx`: dashboard cards, recent activity, election timeline
- `src/admin/pages/Elections.jsx`: election list, create modal, preview modal, export modal
- `src/admin/pages/ElectionResults.jsx`: detailed results page
- `src/admin/pages/CreateElection.jsx`: standalone create-election view
- `src/admin/pages/Parties.jsx`: party management, docs, analytics edit
- `src/admin/pages/PartyRegistrationRequests.jsx`: party request list
- `src/admin/pages/ActivePartiesManagement.jsx`: active party management view
- `src/admin/pages/Voters.jsx`: voter list and voter creation
- `src/admin/pages/Analytics.jsx`: analytics dashboard and history/report modals
- `src/admin/pages/Results.jsx`: admin result summary
- `src/admin/pages/Notifications.jsx`: admin notifications
- `src/admin/pages/adminLogin.jsx`: admin auth page
- `src/admin/pages/VerifyOTP.jsx`: admin OTP step
- `src/admin/pages/PartyCard.jsx`: reusable admin party card

### Admin styles/services/components
- `src/admin/components/AdminNavbar.jsx`: older admin navbar helper
- `src/admin/services/adminAuthService.js`: admin auth helper
- `src/admin/styles/AdminDashboard.css`
- `src/admin/styles/elections.css`
- `src/admin/styles/electionResults.css`
- `src/admin/styles/createElection.css`
- `src/admin/styles/analytics.css`
- `src/admin/styles/parties.css`
- `src/admin/styles/partiesPage.css`
- `src/admin/styles/partyManagement.css`
- `src/admin/styles/voters.css`
- `src/admin/styles/adminLogin.css`
- `src/admin/styles/adminAuth.css`
- `src/admin/styles/adminNav.css`
- `src/admin/styles/auth.css`

## Voter portal
### Layout
- `src/voter/layout/VoterLayout.jsx`: voter shell
- `src/voter/layout/Sidebar.jsx`: voter sidebar and status card
- `src/voter/layout/Topbar.jsx`: voter topbar, verified badge, logout
- `src/voter/styles/layout.css`: layout/sidebar/topbar styling

### Pages
- `src/voter/pages/Overview.jsx`: main voting dashboard
- `src/voter/pages/Profile.jsx`: voter profile and voting history
- `src/voter/pages/Results.jsx`: current and past election results
- `src/voter/pages/Timeline.jsx`: election timeline
- `src/voter/pages/Rules.jsx`: voter rules/how-to
- `src/voter/pages/PartyProfile.jsx`: voter-facing public party profile
- `src/voter/Login.jsx`: voter login
- `src/voter/OTP.jsx`: voter OTP verification
- `src/voter/VoteOTP.jsx`: vote OTP step

### Components
- `src/voter/components/PartyCard.jsx`: party card on voter dashboard
- `src/voter/components/VoteConfirmModal.jsx`: vote confirm modal
- `src/voter/components/OtpModal.jsx`: OTP modal
- `src/voter/components/FaceVerifyModal.jsx`: face verification modal
- `src/voter/components/VoteBanner.jsx`: success/info banner
- `src/voter/components/EmailBanner.jsx`: email notice
- `src/voter/components/WarningNotice.jsx`: warning component
- `src/voter/components/StatCard.jsx`: stat card
- `src/voter/components/ProgressBar.jsx`: progress helper

### Utils/services/styles
- `src/voter/utils/election.js`: election formatting and status helpers
- `src/voter/utils/user.js`: local voter helper methods
- `src/voter/services/voteApi.js`: vote API wrapper
- `src/voter/styles/base.css`
- `src/voter/styles/components.css`
- `src/voter/styles/overview.css`
- `src/voter/styles/profile.css`
- `src/voter/styles/results.css`
- `src/voter/styles/timeline.css`
- `src/voter/styles/rules.css`
- `src/voter/styles/party-profile.css`

## Party portal
### Layout
- `src/party/layout/PartyLayout.jsx`: party shell
- `src/party/layout/PartySidebar.jsx`: party sidebar
- `src/party/layout/PartyHeader.jsx`: party topbar
- `src/party/styles/layout.css`: party layout/sidebar/topbar styles
- `src/party/styles/components.css`: shared party components
- `src/party/styles/base.css`: base party styles

### Pages
- `src/party/pages/PartyHome.jsx`: party profile/home editor
- `src/party/pages/PartyAbout.jsx`: about/future plans
- `src/party/pages/PartyProgress.jsx`: progress analytics
- `src/party/pages/PartyPerformance.jsx`: past performance
- `src/party/pages/PartyStats.jsx`: current election stats
- `src/party/pages/PartyNotifications.jsx`: notifications
- `src/party/pages/PartyRules.jsx`: rules

### Hooks/styles
- `src/party/hooks/usePartyData.js`: party data fetch hook
- `src/party/styles/home.css`
- `src/party/styles/about.css`
- `src/party/styles/progress.css`
- `src/party/styles/performance.css`
- `src/party/styles/stats.css`
- `src/party/styles/notifications.css`
- `src/party/styles/rules.css`
- `src/party/styles/party-auth.css`

## Shared frontend utilities
- `src/shared/NotFound.jsx`: 404 page
- `src/shared/notFound.css`: 404 styles
- `src/shared/utils/partyDisplay.js`: party logo / short-label helpers
- `src/shared/ui/Button.jsx`: generic button
- `src/shared/ui/Card.jsx`: generic card
- `src/shared/ui/Badge.jsx`: generic badge

## Global styles
- `src/index.css`: Tailwind import and base layer
- `src/styles/theme.css`: theme variables and global system font
- `src/styles/landing.css`: landing page styles
- `src/styles/portal-login.css`: portal login styles
- `src/styles/auth.css`: shared auth styles
- `src/styles/gradient-auth.css`: gradient auth styles

## Assets
- `src/assets/nepal-emblem.svg`
- `src/assets/parliament-login-clear.jpg`
- `src/assets/react.svg`

## Quick lookup
- Landing page: `src/app/AccessLanding.jsx`
- Login page: `src/auth/PortalLogin.jsx`
- Admin sidebar: `src/admin/layout/Sidebar.jsx`
- Voter sidebar: `src/voter/layout/Sidebar.jsx`
- Party sidebar: `src/party/layout/PartySidebar.jsx`
- Admin topbar: `src/admin/layout/Topbar.jsx`
- Voter topbar: `src/voter/layout/Topbar.jsx`
- Party topbar: `src/party/layout/PartyHeader.jsx`
- Route map: `src/app/router.jsx`
