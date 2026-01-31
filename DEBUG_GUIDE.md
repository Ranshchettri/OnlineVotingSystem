# 🔧 BACKEND ENDPOINT DEBUGGING GUIDE

## ❌ Current Error
```
POST http://localhost:5000/api/auth/verify-otp 404 (Not Found)
```

## 🛠️ Solutions

### Option 1: Check Your Backend Endpoints
Run this in your backend folder:
```bash
grep -r "verify-otp\|verify-admin\|verify" routes/ controllers/
```

### Option 2: Update .env File
Edit `.env` to match your actual backend endpoints:

```env
# Default (current)
VITE_AUTH_LOGIN_ENDPOINT=/auth/login
VITE_AUTH_VERIFY_OTP_ENDPOINT=/auth/verify-otp

# If endpoints are admin-specific:
VITE_AUTH_LOGIN_ENDPOINT=/admin/auth/login
VITE_AUTH_VERIFY_OTP_ENDPOINT=/admin/auth/verify-otp

# If verify-otp is under different path:
VITE_AUTH_VERIFY_OTP_ENDPOINT=/auth/admin/verify-otp
VITE_AUTH_VERIFY_OTP_ENDPOINT=/otp/verify
```

### Option 3: Test Backend is Running
```bash
# Check if backend is running
curl http://localhost:5000/api/auth/login -X POST

# If 404 → endpoint doesn't exist
# If error about auth → endpoint exists but auth failed
```

---

## 📝 Common Backend Routes

### Typical Express.js Pattern
```javascript
// In your backend routes/auth.js
router.post('/login', authController.login);                    // ✓ Works
router.post('/verify-otp', authController.verifyOtp);          // ✓ Should work
router.post('/admin/verify-otp', authController.verifyOtp);    // Alternative
```

### Expected Response Format
```json
// POST /auth/login → sends OTP
{
  "message": "OTP sent",
  "adminId": "123"
}

// POST /auth/verify-otp → returns token
{
  "token": "jwt_token_here",
  "user": { "id": "123", "email": "admin@example.com" }
}
```

---

## ✅ Next Steps

1. Check backend routes file
2. Update `.env` if needed
3. Restart frontend: `npm run dev`
4. Test again
5. Check browser Network tab for actual endpoint being called

---

## 🐛 Debug Tips
- Open DevTools → Network tab
- Look for failed requests
- Click on request → see URL and response
- Check if endpoint matches your backend routes

