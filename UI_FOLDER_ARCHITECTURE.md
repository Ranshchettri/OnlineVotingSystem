# UI Folder Architecture (Admin / Voter / Party)

This document maps frontend UI files only so you can quickly find where each role's layout, nav, and page content lives.

## 1) Main App Entry

- `src/app/router.jsx`
  - Central route mapping for Admin, Voter, and Party pages.
- `src/app/AccessLanding.jsx`
  - Landing screen with `Get Started` -> role selection -> login routes.

## 2) Admin UI

### Core layout + nav
- `src/admin/layout/AdminLayout.jsx`
  - Admin shell wrapper (`Sidebar` + `Topbar` + page content container).
- `src/admin/layout/Sidebar.jsx`
  - Left sidebar menu items for admin navigation (`Dashboard`, `Elections`, `Voters`, `Parties`, `Analytics`).
- `src/admin/layout/Topbar.jsx`
  - Top header, notifications dropdown, profile dropdown, logout.

### Admin pages (main content area)
- `src/admin/pages/AdminDashboard.jsx`
- `src/admin/pages/CreateElection.jsx`
- `src/admin/pages/ElectionResults.jsx`
- `src/admin/pages/Voters.jsx`
- `src/admin/pages/Parties.jsx`
- `src/admin/pages/Elections.jsx`
- `src/admin/pages/Analytics.jsx`
- `src/admin/pages/Results.jsx`
- `src/admin/pages/Notifications.jsx`
- `src/admin/pages/adminLogin.jsx`

### Admin UI styles
- `src/admin/admin.css`
- `src/admin/styles/*.css`

## 3) Voter UI

### Core layout + nav
- `src/voter/layout/VoterLayout.jsx`
  - Voter shell (`Sidebar` + `Topbar` + `Outlet` content).
- `src/voter/layout/Sidebar.jsx`
  - Voter left navigation (`Election Overview`, `My Profile`, `Results`, `Timeline`, `Rules`).
  - Also shows election status card at bottom.
- `src/voter/layout/Topbar.jsx`
  - Voter top header, verification badge, logout.

### Voter pages (main content area)
- `src/voter/pages/Overview.jsx`
- `src/voter/pages/Profile.jsx`
- `src/voter/pages/Results.jsx`
- `src/voter/pages/Timeline.jsx`
- `src/voter/pages/Rules.jsx`
- `src/voter/pages/PartyProfile.jsx`

### Voter auth + UI components
- `src/voter/Login.jsx`
- `src/voter/components/*.jsx`

### Voter UI styles
- `src/voter/styles/base.css`
- `src/voter/styles/layout.css`
- `src/voter/styles/components.css`
- `src/voter/styles/*.css` (page-specific styles)

## 4) Party UI

### Core layout + nav
- `src/party/layout/PartyLayout.jsx`
  - Party shell (`PartySidebar` + `PartyHeader` + page content).
- `src/party/layout/PartySidebar.jsx`
  - Party left navigation (`Home`, `About`, `Progress`, `Past Performance`, `Current Stats`, `Notifications`, `Rules`).
  - Also handles deadline card section.
- `src/party/layout/PartyHeader.jsx`
  - Party top header, official account badge, logout.

### Party pages (main content area)
- `src/party/pages/PartyHome.jsx`
- `src/party/pages/PartyAbout.jsx`
- `src/party/pages/PartyProgress.jsx`
- `src/party/pages/PartyPerformance.jsx`
- `src/party/pages/PartyStats.jsx`
- `src/party/pages/PartyNotifications.jsx`
- `src/party/pages/PartyRules.jsx`

### Party UI helpers + styles
- `src/party/hooks/usePartyData.js`
- `src/party/styles/base.css`
- `src/party/styles/layout.css`
- `src/party/styles/components.css`
- `src/party/styles/*.css` (page-specific styles)

## 5) Shared UI / API Links Used By All Roles

- `src/assets/*`
  - Logos, emblem, static images used in nav/topbar/cards.
- `src/shared/utils/partyDisplay.js`
  - Party logo display fallback and label helpers.
- `src/services/api.js`
  - Shared Axios client used by Admin/Voter/Party pages.
- `src/services/*.js`
  - Role/domain-specific service wrappers.

## 6) Quick "Where to Edit" Guide

- Change Admin sidebar items: `src/admin/layout/Sidebar.jsx`
- Change Admin top header: `src/admin/layout/Topbar.jsx`
- Change Voter sidebar items/status card: `src/voter/layout/Sidebar.jsx`
- Change Voter top header badge/logout: `src/voter/layout/Topbar.jsx`
- Change Party sidebar items/logo/deadline: `src/party/layout/PartySidebar.jsx`
- Change Party top header badge/logout: `src/party/layout/PartyHeader.jsx`
- Change route -> page mapping: `src/app/router.jsx`
- Change landing and role entry flow: `src/app/AccessLanding.jsx`
