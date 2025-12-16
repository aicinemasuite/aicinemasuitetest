# 🏗️ System Architecture

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                      │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   SetupView  │  │  StudioView  │  │ ProfileView  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Credit Balance Badge  │  User Avatar Menu          │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │           BuyCreditsModal (Razorpay UI)             │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ useAuth() Hook
                        │ supabaseClient.ts
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                     SUPABASE (Backend)                       │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Auth Users  │  │   Profiles   │  │ Transactions │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  Functions:                                                  │
│  - handle_new_user()      → Auto-create profile + 3 credits │
│  - deduct_credit()        → Atomic credit deduction         │
│  - add_credits()          → Add credits after payment       │
│                                                               │
│  RLS Policies: ✅ Enabled on all tables                     │
│                                                               │
└───────────────────────┬─────────────────────────────────────┘
                        │
        ┌───────────────┴───────────────┐
        │                               │
┌───────▼────────┐            ┌─────────▼──────────┐
│   RAZORPAY     │            │   GOOGLE IMAGEN    │
│   (Payments)   │            │   (AI Generation)  │
│                │            │                    │
│ Test Mode: ✅  │            │ Credit Check: ✅   │
└────────────────┘            └────────────────────┘
```

---

## Data Flow: Image Generation with Credits

```
User clicks "Generate Image"
        │
        ▼
┌──────────────────────────────────┐
│ geminiService.ts                 │
│ generateImageWithCredits()       │
└──────────────────────────────────┘
        │
        ├─── 1. Check Authentication
        │    └─── getUserProfile()
        │         ├─── ✅ User found
        │         └─── ❌ Error: "Please login"
        │
        ├─── 2. Check Credit Balance
        │    └─── profile.credits >= 1?
        │         ├─── ✅ Has credits
        │         └─── ❌ Error: "NO_CREDITS"
        │
        ├─── 3. Generate Image
        │    └─── generateImageWithFallback()
        │         └─── Google Imagen API
        │              ├─── ✅ Image generated
        │              └─── ❌ Error: Don't deduct credit
        │
        └─── 4. Deduct Credit (if success)
             └─── deductCredit()
                  └─── Supabase Function
                       └─── UPDATE profiles SET credits = credits - 1
                       └─── INSERT INTO transactions
```

---

## Payment Flow

```
User clicks "Buy Credits"
        │
        ▼
┌──────────────────────────────────┐
│ BuyCreditsModal.tsx              │
│ - Shows 3 packages               │
│ - User selects package           │
└──────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────┐
│ Razorpay Checkout Modal          │
│ - User enters card details       │
│ - Payment processed              │
└──────────────────────────────────┘
        │
        ├─── Success
        │    └─── response.razorpay_payment_id
        │         │
        │         ▼
        │    ┌────────────────────────┐
        │    │ addCredits()           │
        │    │ - Supabase function    │
        │    └────────────────────────┘
        │         │
        │         ▼
        │    UPDATE profiles SET credits += amount
        │    INSERT INTO credit_transactions
        │         │
        │         ▼
        │    refreshProfile()
        │         │
        │         ▼
        │    UI updates with new balance
        │
        └─── Failure
             └─── Show error message
```

---

## Database Relationships

```
┌─────────────────────┐
│   auth.users        │  (Supabase Auth)
│                     │
│ - id (UUID)         │
│ - email             │
│ - encrypted_password│
└─────────┬───────────┘
          │ 1:1
          │
┌─────────▼───────────┐
│   profiles          │
│                     │
│ - id (FK)           │◄────┐
│ - email             │     │
│ - credits           │     │ 1:N
└─────────────────────┘     │
                            │
                    ┌───────┴──────────────┐
                    │ credit_transactions  │
                    │                      │
                    │ - id                 │
                    │ - user_id (FK)       │
                    │ - amount             │
                    │ - type               │
                    │ - razorpay_payment_id│
                    │ - created_at         │
                    └──────────────────────┘
```

---

## Security Layers

```
┌────────────────────────────────────────────────┐
│  Layer 1: Authentication                       │
│  - Supabase Auth (JWT tokens)                  │
│  - Session management                          │
└────────────────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────────────┐
│  Layer 2: Row Level Security (RLS)             │
│  - Users can only see their own profiles       │
│  - Users can only see their own transactions   │
└────────────────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────────────┐
│  Layer 3: Server-Side Functions                │
│  - Credit deduction runs on Supabase           │
│  - Atomic transactions (no race conditions)    │
└────────────────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────────────┐
│  Layer 4: Business Logic Validation            │
│  - Check credits before generation             │
│  - Only deduct on success                      │
│  - Transaction logging                         │
└────────────────────────────────────────────────┘
```

---

## Component Hierarchy

```
App.tsx (Root)
│
├─── useAuth() Hook
│    └─── Supabase Auth Session
│
├─── Credit Balance Badge (Top Right)
│    ├─── Shows profile.credits
│    └─── [Buy] button → BuyCreditsModal
│
├─── User Avatar Menu
│    ├─── Email display
│    ├─── AI Settings → APIKeyModal
│    └─── Sign Out
│
├─── SetupView (if viewMode === SETUP)
│    └─── Project configuration
│
├─── StudioView (if viewMode === STUDIO)
│    ├─── Deck Tab
│    ├─── Characters Tab → generateCharacterImage()
│    ├─── Storyboard Tab → generateStoryboardImage()
│    ├─── Posters Tab → generatePosterImage()
│    └─── [All call generateImageWithCredits()]
│
├─── ProfileView
│
├─── AdminView (if user.role === ADMIN)
│
├─── Modals:
│    ├─── BuyCreditsModal (Razorpay)
│    ├─── APIKeyModal
│    ├─── FeedbackModal
│    └─── FAQOverlay
│
└─── Global Components:
     ├─── AIChatBot
     └─── ToastContainer
```

---

## File Structure

```
project/
│
├── components/
│   ├── BuyCreditsModal.tsx         ← NEW (Payment UI)
│   ├── (all existing components)
│   └── ...
│
├── services/
│   ├── supabaseClient.ts           ← NEW (DB & Auth)
│   ├── geminiService.ts            ← MODIFIED (Credit checks)
│   └── ProjectIO.ts
│
├── hooks/
│   └── useAuth.ts                  ← NEW (Auth hook)
│
├── App.tsx                         ← MODIFIED (Auth integration)
├── package.json                    ← MODIFIED (Added Supabase)
│
├── .env.example                    ← NEW (Template)
├── SETUP_INSTRUCTIONS.md           ← NEW (Guide)
├── IMPLEMENTATION_SUMMARY.md       ← NEW (Overview)
├── ENV_SETUP.txt                   ← NEW (Quick ref)
└── SYSTEM_ARCHITECTURE.md          ← NEW (This file)
```

---

## Credit Transaction Types

```
┌─────────────────────────────────────────────────┐
│  TYPE          │  AMOUNT  │  DESCRIPTION         │
├─────────────────────────────────────────────────┤
│  BONUS         │  +3      │  Welcome bonus       │
│  PURCHASE      │  +50/150 │  Razorpay payment    │
│  USAGE         │  -1      │  Image generation    │
│  REFUND        │  +N      │  Manual refund       │
└─────────────────────────────────────────────────┘
```

---

## Error Handling Flow

```
Image Generation Request
        │
        ├─── NO_CREDITS Error
        │    └─── Show toast: "0 credits remaining"
        │    └─── Auto-open BuyCreditsModal
        │
        ├─── AUTHENTICATION_REQUIRED Error
        │    └─── Redirect to login screen
        │
        ├─── QUOTA_EXCEEDED Error
        │    └─── Show toast: "API rate limit, wait 1-2 min"
        │
        └─── Image Gen Failed Error
             └─── Show toast: "Generation failed, try again"
             └─── Credits NOT deducted
```

---

## Deployment Checklist

### Development Mode:
- [ ] Set `.env` with test credentials
- [ ] Run `npm install`
- [ ] Run `npm run dev`
- [ ] Test with test card

### Production Mode:
- [ ] Switch Razorpay to LIVE mode
- [ ] Update `VITE_RAZORPAY_KEY_ID` with live key
- [ ] Enable email verification in Supabase
- [ ] Add webhook verification for payments
- [ ] Set up proper domain for Supabase redirects
- [ ] Enable Google OAuth (optional)
- [ ] Configure CORS for production domain
- [ ] Set up monitoring and logging

---

## Performance Considerations

### Optimizations Implemented:
- ✅ Atomic credit transactions (no race conditions)
- ✅ Server-side functions (reduce client load)
- ✅ Lazy loading of modals
- ✅ Credit check before API call (save API quota)

### Future Optimizations:
- 🔲 Cache user profile for 5 seconds
- 🔲 Debounce credit balance refresh
- 🔲 Add loading states for better UX
- 🔲 Implement optimistic UI updates

---

## Cost Analysis (Per User)

### Free Tier:
- 3 free credits = 3 AI image generations
- Cost to you: ~₹0.12 (3 × $0.04 × ₹100)

### Paid Package (50 Credits for ₹299):
- Revenue: ₹299
- Cost: ~₹200 (50 × $0.04 × ₹100)
- Profit: ~₹99 (33% margin)

### Break-even:
- Need ~4 paid users to cover 100 free users
- 96% profit margin after infrastructure costs

---

**🎯 This architecture ensures:**
- ✅ Scalability (Supabase handles load)
- ✅ Security (RLS + JWT auth)
- ✅ Monetization (Credit-based model)
- ✅ User Experience (Seamless flow)
- ✅ Maintainability (Clean separation of concerns)
