## 🧪 ADMIN FRONTEND - TEST CHECKLIST

### Structure ✅
```
src/
├── App.jsx                          ← Router setup
├── main.jsx                         ← Entry point
├── index.css                        ← Global styles
│
├── services/
│   ├── api.js                       ← Axios instance + token interceptor
│   └── authService.js               ← Admin login & OTP verify
│
├── hooks/
│   └── useAuth.js                   ← Token management
│
└── admin/
    ├── AdminApp.jsx                 ← Route config
    ├── pages/
    │   ├── Login.jsx                ← Email + Password
    │   ├── VerifyOTP.jsx            ← OTP verification
    │   └── Dashboard.jsx            ← Admin stats
    ├── components/
    │   └── AdminNavbar.jsx           ← Nav + Logout
    └── styles/
        ├── auth.css                 ← Auth UI (pastel)
        └── dashboard.css            ← Dashboard UI
```

---

### Test Flow

#### 1️⃣ **LOGIN PAGE**
- URL: `http://localhost:5173/`
- Enter email: `ranshsunar@gmail.com`
- Enter password: `Admin@123456`
- Click "Send OTP"
- Expected: Alert "OTP sent to email" → Redirect to /verify-otp

#### 2️⃣ **OTP VERIFICATION PAGE**
- URL: `http://localhost:5173/verify-otp`
- Check email for OTP code
- Enter OTP (6 digits)
- Click "Verify"
- Expected: Token saved → Redirect to /dashboard

#### 3️⃣ **DASHBOARD**
- URL: `http://localhost:5173/dashboard`
- Shows: Navbar + Admin Dashboard title + 3 stat cards
- Stat cards:
  - Total Voters
  - Total Parties
  - Active Election
- Navbar has: "OVS Admin" + "Logout" button
- Expected: Dashboard visible only if logged in

#### 4️⃣ **PERSISTENCE**
- Refresh page → Still logged in (token in localStorage)
- Check browser console: `localStorage.getItem('token')`
- Should show JWT token

#### 5️⃣ **LOGOUT**
- Click "Logout" button
- Expected: localStorage cleared → Redirect to /
- Token removed

---

### Error Handling
- Wrong credentials → Shows error below form
- OTP invalid → Shows error below input
- No token → Auto-redirect to login

---

### Backend Requirements
✅ Admin endpoints must exist:
- `POST /api/auth/login` → Returns OTP required
- `POST /api/auth/verify-otp` → Returns JWT token

---

### Dependencies (in package.json)
```json
{
  "dependencies": {
    "react": "^18.x",
    "react-dom": "^18.x",
    "react-router-dom": "^6.x",
    "axios": "^1.x"
  },
  "devDependencies": {
    "vite": "^4.x",
    "@vitejs/plugin-react": "^4.x"
  }
}
```

---

### Next Steps
1. Install dependencies: `npm install`
2. Start dev server: `npm run dev`
3. Run backend on `http://localhost:5000`
4. Follow test flow above
5. Check browser console for errors
6. Check Network tab in DevTools for API requests

---
