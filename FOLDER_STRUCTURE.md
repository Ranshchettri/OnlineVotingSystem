# Frontend Folder Structure

Current frontend-only structure for `src/`.

```text
src/
|-- App.jsx
|-- main.jsx
|-- index.css
|
|-- app/
|   |-- router.jsx
|   |-- AccessLanding.jsx
|   |-- guards/
|   |   |-- PartyGuard.jsx
|   |   `-- VoterGuard.jsx
|   `-- layouts/
|       |-- PartyLayout.jsx
|       `-- VoterLayout.jsx
|
|-- auth/
|   |-- PortalLogin.jsx
|   |-- PartyLogin.jsx
|   |-- PartyOTP.jsx
|   `-- RoleProtected.jsx
|
|-- admin/
|   |-- admin.css
|   |-- components/
|   |   `-- AdminNavbar.jsx
|   |-- layout/
|   |   |-- AdminLayout.jsx
|   |   |-- Sidebar.jsx
|   |   `-- Topbar.jsx
|   |-- pages/
|   |   |-- AdminDashboard.jsx
|   |   |-- Elections.jsx
|   |   |-- ElectionResults.jsx
|   |   |-- CreateElection.jsx
|   |   |-- Parties.jsx
|   |   |-- PartyRegistrationRequests.jsx
|   |   |-- ActivePartiesManagement.jsx
|   |   |-- Voters.jsx
|   |   |-- Analytics.jsx
|   |   |-- Results.jsx
|   |   |-- Notifications.jsx
|   |   |-- adminLogin.jsx
|   |   |-- VerifyOTP.jsx
|   |   `-- PartyCard.jsx
|   |-- services/
|   |   `-- adminAuthService.js
|   `-- styles/
|       |-- AdminDashboard.css
|       |-- elections.css
|       |-- electionResults.css
|       |-- createElection.css
|       |-- analytics.css
|       |-- parties.css
|       |-- partiesPage.css
|       |-- partyManagement.css
|       |-- voters.css
|       |-- adminLogin.css
|       |-- adminAuth.css
|       |-- adminNav.css
|       `-- auth.css
|
|-- voter/
|   |-- Login.jsx
|   |-- OTP.jsx
|   |-- VoteOTP.jsx
|   |-- components/
|   |   |-- PartyCard.jsx
|   |   |-- VoteConfirmModal.jsx
|   |   |-- OtpModal.jsx
|   |   |-- FaceVerifyModal.jsx
|   |   |-- VoteBanner.jsx
|   |   |-- EmailBanner.jsx
|   |   |-- WarningNotice.jsx
|   |   |-- StatCard.jsx
|   |   `-- ProgressBar.jsx
|   |-- layout/
|   |   |-- VoterLayout.jsx
|   |   |-- Sidebar.jsx
|   |   `-- Topbar.jsx
|   |-- pages/
|   |   |-- Overview.jsx
|   |   |-- Profile.jsx
|   |   |-- Results.jsx
|   |   |-- Timeline.jsx
|   |   |-- Rules.jsx
|   |   `-- PartyProfile.jsx
|   |-- services/
|   |   `-- voteApi.js
|   |-- styles/
|   |   |-- base.css
|   |   |-- components.css
|   |   |-- layout.css
|   |   |-- overview.css
|   |   |-- profile.css
|   |   |-- results.css
|   |   |-- timeline.css
|   |   |-- rules.css
|   |   `-- party-profile.css
|   `-- utils/
|       |-- election.js
|       `-- user.js
|
|-- party/
|   |-- hooks/
|   |   `-- usePartyData.js
|   |-- layout/
|   |   |-- PartyLayout.jsx
|   |   |-- PartySidebar.jsx
|   |   `-- PartyHeader.jsx
|   |-- pages/
|   |   |-- PartyHome.jsx
|   |   |-- PartyAbout.jsx
|   |   |-- PartyProgress.jsx
|   |   |-- PartyPerformance.jsx
|   |   |-- PartyStats.jsx
|   |   |-- PartyNotifications.jsx
|   |   `-- PartyRules.jsx
|   `-- styles/
|       |-- base.css
|       |-- components.css
|       |-- layout.css
|       |-- home.css
|       |-- about.css
|       |-- progress.css
|       |-- performance.css
|       |-- stats.css
|       |-- notifications.css
|       |-- rules.css
|       `-- party-auth.css
|
|-- shared/
|   |-- NotFound.jsx
|   |-- notFound.css
|   |-- ui/
|   |   |-- Badge.jsx
|   |   |-- Button.jsx
|   |   `-- Card.jsx
|   `-- utils/
|       `-- partyDisplay.js
|
|-- services/
|   |-- api.js
|   |-- adminService.js
|   |-- authService.js
|   |-- partyService.js
|   |-- voterService.js
|   `-- voteService.js
|
|-- api/
|   |-- axios.js
|   |-- partyApi.js
|   `-- voterApi.js
|
|-- contexts/
|   |-- AuthContext.jsx
|   |-- createAuthContext.js
|   `-- useAuth.js
|
|-- hooks/
|   `-- useAuth.js
|
|-- utils/
|   `-- auth.js
|
|-- styles/
|   |-- theme.css
|   |-- landing.css
|   |-- portal-login.css
|   |-- auth.css
|   `-- gradient-auth.css
|
`-- assets/
    |-- nepal-emblem.svg
    |-- parliament-login-clear.jpg
    `-- react.svg
```

## Icon system
- `Remix Icon`
- loaded in `index.html`

## Font system
- Tailwind `font-sans`
- system sans stack from `src/styles/theme.css`

## Main edit shortcuts
- Landing page: `src/app/AccessLanding.jsx`
- Login page: `src/auth/PortalLogin.jsx`
- Route map: `src/app/router.jsx`
- Admin UI: `src/admin/`
- Voter UI: `src/voter/`
- Party UI: `src/party/`
