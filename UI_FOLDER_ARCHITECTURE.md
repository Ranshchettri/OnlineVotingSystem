# UI Folder Architecture (Admin / Voter / Party)

Frontend UI map only (navigation, layout, page content, and style files).

## 1) Global entry + route wiring
- `src/app/router.jsx`: Full route mapping for Admin, Voter, Party, landing, and 404.
- `src/app/AccessLanding.jsx`: First landing page (`Get Started` -> role selection -> login route).
- `src/shared/NotFound.jsx`, `src/shared/notFound.css`: 404 UI.
- `src/services/api.js`: Shared axios client for all role UIs.

## 2) Admin UI map
### Layout/Nav files
- `src/admin/layout/AdminLayout.jsx`: Admin shell composition.
- `src/admin/layout/Sidebar.jsx`: Admin left nav links and bottom system-status card.
- `src/admin/layout/Topbar.jsx`: Admin topbar, notification dropdown, profile/logout.
- `src/admin/admin.css`: Shared admin shell/topbar/sidebar styles.

### Admin page content files
- `src/admin/pages/AdminDashboard.jsx`: Dashboard cards + summaries.
- `src/admin/pages/Elections.jsx`: Election list/create/export modal + report actions.
- `src/admin/pages/Parties.jsx`: Party register/list, docs modal, block/activate, analytics edit.
- `src/admin/pages/Voters.jsx`: Voter management list/actions.
- `src/admin/pages/Analytics.jsx`: Party analytics cards + full report/history/update modals.
- `src/admin/pages/Results.jsx`: Results overview.
- `src/admin/pages/Notifications.jsx`: Admin notification center.
- `src/admin/pages/CreateElection.jsx`, `src/admin/pages/ElectionResults.jsx`: Extra election workflows.
- `src/admin/pages/adminLogin.jsx`: Admin auth screen.

### Admin style files
- `src/admin/styles/adminDashboard.css`
- `src/admin/styles/elections.css`
- `src/admin/styles/partyManagement.css`
- `src/admin/styles/voters.css`
- `src/admin/styles/analytics.css`
- `src/admin/styles/*.css` (other role-specific admin page styling)

## 3) Voter UI map
### Layout/Nav files
- `src/voter/layout/VoterLayout.jsx`: Voter shell and outlet.
- `src/voter/layout/Sidebar.jsx`: Voter left nav + election status mini-card.
- `src/voter/layout/Topbar.jsx`: Voter topbar + verified badge/logout.
- `src/voter/styles/layout.css`: Sidebar/topbar/layout styling.

### Voter page content files
- `src/voter/pages/Overview.jsx`: Live election dashboard + party cards + vote flow modals.
- `src/voter/pages/Profile.jsx`: Voter personal details + voting history.
- `src/voter/pages/Results.jsx`: Current/past election outcomes.
- `src/voter/pages/Timeline.jsx`: Election timeline.
- `src/voter/pages/Rules.jsx`: Voter rules/how-to page.
- `src/voter/pages/PartyProfile.jsx`: Public party profile view for voters.

### Voter components (reusable page blocks)
- `src/voter/components/PartyCard.jsx`
- `src/voter/components/VoteBanner.jsx`
- `src/voter/components/StatCard.jsx`
- `src/voter/components/EmailBanner.jsx`
- `src/voter/components/OtpModal.jsx`
- `src/voter/components/FaceVerifyModal.jsx`
- `src/voter/components/VoteConfirmModal.jsx`
- `src/voter/components/WarningNotice.jsx`

### Voter auth/utils/services
- `src/voter/Login.jsx`, `src/voter/OTP.jsx`, `src/voter/VoteOTP.jsx`
- `src/voter/services/voteApi.js`
- `src/voter/utils/election.js`
- `src/voter/utils/user.js`

### Voter style files
- `src/voter/styles/base.css`
- `src/voter/styles/components.css`
- `src/voter/styles/overview.css`
- `src/voter/styles/profile.css`
- `src/voter/styles/results.css`
- `src/voter/styles/party-profile.css`
- `src/voter/styles/rules.css`
- `src/voter/styles/timeline.css`

## 4) Party UI map
### Layout/Nav files
- `src/party/layout/PartyLayout.jsx`: Party shell.
- `src/party/layout/PartySidebar.jsx`: Left nav + party logo card + deadline card.
- `src/party/layout/PartyHeader.jsx`: Topbar with emblem, account badge, logout.
- `src/party/styles/layout.css`: Sidebar/topbar structure styling.
- `src/party/styles/components.css`: Shared buttons, page header, card helpers.

### Party page content files
- `src/party/pages/PartyHome.jsx`: Party profile edit/home (logo, team, gallery, contact/social).
- `src/party/pages/PartyAbout.jsx`: Future plans view/edit.
- `src/party/pages/PartyProgress.jsx`: Admin-controlled progress analytics.
- `src/party/pages/PartyPerformance.jsx`: Past performance summary + election history.
- `src/party/pages/PartyStats.jsx`: Current live stats/ranking/timeline.
- `src/party/pages/PartyNotifications.jsx`: Party notifications center.
- `src/party/pages/PartyRules.jsx`: Rules & guideline page.

### Party hooks + style files
- `src/party/hooks/usePartyData.js`
- `src/party/styles/home.css`
- `src/party/styles/about.css`
- `src/party/styles/progress.css`
- `src/party/styles/performance.css`
- `src/party/styles/stats.css`
- `src/party/styles/notifications.css`
- `src/party/styles/rules.css`
- `src/party/styles/base.css`

## 5) Shared UI helpers used across roles
- `src/shared/utils/partyDisplay.js`: Safe party logo/short-label helpers.
- `src/assets/*`: Emblems, logos, and static UI images.

## 6) Quick edit shortcuts
- Admin sidebar/nav: `src/admin/layout/Sidebar.jsx`
- Admin topbar: `src/admin/layout/Topbar.jsx`
- Voter sidebar/nav: `src/voter/layout/Sidebar.jsx`
- Voter topbar: `src/voter/layout/Topbar.jsx`
- Party sidebar/nav: `src/party/layout/PartySidebar.jsx`
- Party topbar: `src/party/layout/PartyHeader.jsx`
- Landing role flow: `src/app/AccessLanding.jsx`
- Route remap: `src/app/router.jsx`
