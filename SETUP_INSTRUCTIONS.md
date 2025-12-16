# 🎬 AICINEMASUITE - SaaS Setup Instructions

## ✅ Completed Implementation

Your app now has:
- **Supabase Authentication** (Email/Password & Google OAuth)
- **Credit System** with automatic profile creation (3 free credits)
- **Razorpay Payment Integration** (Test Mode)
- **Credit-based Image Generation** (automatic deduction on success)
- **User Dashboard** with credit balance display

---

## 🔧 Environment Setup

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment Variables

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Fill in your credentials in `.env`:

#### **Supabase Configuration**
- Go to: https://app.supabase.com/project/YOUR_PROJECT/settings/api
- Copy **Project URL** → `VITE_SUPABASE_URL`
- Copy **anon/public key** → `VITE_SUPABASE_ANON_KEY`

#### **Razorpay Configuration**
- Go to: https://dashboard.razorpay.com/app/keys
- Switch to **Test Mode** (top left toggle)
- Copy **Key ID** → `VITE_RAZORPAY_KEY_ID`

#### **Google AI API Key**
- Can be set via the app UI (Settings modal)
- Or set in `.env` as `API_KEY=your_key_here`

---

## 🗄️ Database Setup

### ✅ Database Already Configured!

The Supabase migration has been applied automatically:

**Tables Created:**
- `profiles` - User profiles with credit balance
- `credit_transactions` - Purchase and usage history

**Functions Created:**
- `handle_new_user()` - Auto-creates profile with 3 free credits
- `deduct_credit()` - Atomically deducts credits
- `add_credits()` - Adds credits after payment

**Security:**
- Row Level Security (RLS) enabled on all tables
- Users can only access their own data

---

## 💳 Payment Testing (Razorpay Test Mode)

### Test Card Details:
- **Card Number:** `4111 1111 1111 1111`
- **CVV:** Any 3 digits
- **Expiry:** Any future date
- **Name:** Any name

### Packages Available:
1. **50 Credits** - ₹299 (₹5.98 per credit)
2. **150 Credits** - ₹799 (₹5.33 per credit) ⭐ Popular
3. **500 Credits** - ₹2499 (₹5.00 per credit)

---

## 🎨 UI Features (Preserved)

**No changes were made to your existing UI design.**

### What's New (Added):
- **Credit Balance Badge** (Top Right) - Shows current credits with "Buy" button
- **User Avatar Menu** (Top Right) - Quick access to AI Settings and Sign Out
- **Buy Credits Modal** - Beautiful Razorpay payment interface
- **Authentication Gate** - Login required to access studio

### Existing Components (Untouched):
- ✅ All your existing views (Setup, Studio, Profile, Admin)
- ✅ Script Magic, Storyboard, Character Lab, etc.
- ✅ Existing modals and overlays
- ✅ Color scheme and typography

---

## 🚀 Running the App

### Development Mode:
```bash
npm run dev
```

### Build for Production:
```bash
npm run build
```

---

## 🔐 How It Works

### 1. User Flow:
```
Sign Up/Login (Supabase Auth)
    ↓
Auto-create Profile with 3 Free Credits
    ↓
Generate Images (each costs 1 credit)
    ↓
Credits depleted? → Buy More via Razorpay
```

### 2. Credit Deduction Logic:
```typescript
// Before Image Generation:
1. Check if user is authenticated
2. Check if user has credits > 0
3. If yes → Generate image
4. If generation succeeds → Deduct 1 credit
5. If no credits → Show "Buy Credits" modal
```

### 3. Payment Flow:
```
User clicks "Buy Credits"
    ↓
Select Package (50/150/500 credits)
    ↓
Razorpay Checkout Modal Opens
    ↓
Payment Success
    ↓
Credits added to Supabase profile
    ↓
Balance refreshed automatically
```

---

## 📊 Database Functions Reference

### Deduct Credit:
```sql
SELECT deduct_credit(
  user_id UUID,
  description TEXT
) RETURNS BOOLEAN
```

### Add Credits:
```sql
SELECT add_credits(
  user_id UUID,
  amount INTEGER,
  razorpay_payment_id TEXT,
  razorpay_order_id TEXT
) RETURNS BOOLEAN
```

---

## 🔍 Error Messages

The system provides clear error messages:

- **"NO_CREDITS"** → Show Buy Credits modal
- **"AUTHENTICATION_REQUIRED"** → Redirect to login
- **"QUOTA_EXCEEDED"** → Google API rate limit (wait 1-2 min)
- **"Image Gen Failed"** → API key or network issue

---

## 🛠️ Integration Points

### Image Generation Functions:
All these now check credits before generation:
- `generateSlideImage()`
- `generatePosterImage()`
- `generateCharacterImage()`
- `generateStoryboardImage()`
- `generateLocationImage()`

### Credit Check Location:
File: `services/geminiService.ts`
Function: `generateImageWithCredits()`

---

## 📝 Testing Checklist

- [ ] Sign up with email/password
- [ ] Verify 3 free credits on profile
- [ ] Generate an image (should deduct 1 credit)
- [ ] Try generating with 0 credits (should show error)
- [ ] Purchase credits (use test card)
- [ ] Verify credits added to balance
- [ ] Check transaction history in Supabase dashboard

---

## 🐛 Troubleshooting

### "Missing Supabase credentials" error:
- Double-check `.env` file exists
- Restart dev server after adding env vars

### Payment not working:
- Verify Razorpay is in **Test Mode**
- Check `VITE_RAZORPAY_KEY_ID` in `.env`
- Use test card: `4111 1111 1111 1111`

### Credits not deducting:
- Check Supabase RLS policies are enabled
- Verify user is authenticated
- Check browser console for errors

---

## 🎯 Next Steps (Optional)

1. **Enable Google OAuth:**
   - Go to Supabase Dashboard → Authentication → Providers
   - Enable Google and add credentials

2. **Customize Credit Packages:**
   - Edit: `components/BuyCreditsModal.tsx`
   - Modify the `packages` array

3. **Production Payment:**
   - Switch Razorpay to **Live Mode**
   - Update `VITE_RAZORPAY_KEY_ID` with live key

4. **Add Webhook Verification:**
   - Create Supabase Edge Function to verify Razorpay signatures
   - For production security

---

## 📦 Files Modified/Added

### New Files:
- `services/supabaseClient.ts` - Supabase client & profile functions
- `hooks/useAuth.ts` - Authentication hook
- `components/BuyCreditsModal.tsx` - Payment UI
- `.env.example` - Environment template
- `SETUP_INSTRUCTIONS.md` - This file

### Modified Files:
- `App.tsx` - Added auth integration & credit display
- `services/geminiService.ts` - Added credit checks
- `package.json` - Added @supabase/supabase-js

---

## 📞 Support

For issues or questions:
- Check browser console for errors
- Verify all environment variables are set
- Ensure Supabase migration was applied
- Test with provided test card details

---

**🎉 Your SaaS is ready! Test thoroughly in development before deploying to production.**
