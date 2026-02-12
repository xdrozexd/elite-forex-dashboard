# Agent Instructions for Elite Forex Dashboard

## Project Overview
Plataforma de inversión HYIP (High Yield Investment Program) completa con:
- Sistema de autenticación Firebase (email, Google, Telegram)
- Dashboard tipo app móvil (mobile-first)
- Planes de inversión con distribución diaria de ganancias (0.5% - 1.5%)
- Sistema de depósitos con transferencia bancaria (RD) y cripto (USDT)
- Sistema de retiros con aprobación manual del admin
- Panel de administración completo
- Cloud Functions para distribución automática de ganancias

## Firebase Project
- **Project ID:** `elite-forex-bot`
- **Admin UID:** `JkIWTDgVnyLs9wG5crXj2mlSmnH2`
- **Web App:** https://elite-forex-dashboard.vercel.app
- **Admin Panel:** https://elite-forex-dashboard.vercel.app/admin

## Commands

### Development
- `npm run dev` - Start dev server (Vite)
- `npm run build` - Build for production (tsc + vite build)
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Deploy
- `npx vercel --prod` - Deploy to Vercel

### Firebase
- `cd scripts && node makeAdmin.js <UID>` - Make user admin
- `cd scripts && node setupFirebase.js` - Setup initial Firestore data
- `cd functions && npm install` - Install functions dependencies
- `firebase deploy --only functions` - Deploy Cloud Functions
- `firebase deploy --only firestore:rules` - Deploy Firestore rules
- `firebase deploy --only storage` - Deploy Storage rules

## Code Style Guidelines

### Imports
- Use `@/` alias for all src imports (e.g., `@/components/ui/button`)
- Group imports: React → Libraries → Components → Hooks → Utils
- Example:
```typescript
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
```

### File Naming
- Components: PascalCase (e.g., `LandingPage.tsx`)
- Hooks: camelCase with `use` prefix (e.g., `useAuth.tsx`)
- Utilities: camelCase (e.g., `utils.ts`)
- UI components: lowercase (e.g., `button.tsx`)

### TypeScript
- Strict mode enabled
- Always define interfaces for props and context types
- Use `React.FC` for functional components
- Prefer explicit return types on functions

### Styling (Tailwind + shadcn/ui)
- Use shadcn/ui components as base (Button, Card, Input, etc.)
- Colors: `primary` (#22c55e green), `gold` (#facc15 yellow), `background` (#0f172a dark)
- Use `cn()` utility from `@/lib/utils` for conditional classes
- Glassmorphism: `bg-card/60 backdrop-blur-xl`
- Responsive: Mobile-first (default), `md:` for desktop

### Error Handling
- Use try/catch with specific error messages
- Display errors via toast notifications
- Always clear errors before new operations
- Example:
```typescript
try {
  await login(email, password);
  toast({ title: 'Success', variant: 'success' });
} catch (err: any) {
  toast({ title: 'Error', description: err.message, variant: 'destructive' });
}
```

### State Management
- React Context for auth state
- Local state with `useState` for component-level data
- Custom hooks for reusable logic (e.g., `useBalance`, `useToast`)

### Component Structure
- Props interface at top
- Main component as `React.FC`
- Helper functions inside component or custom hook
- Export at bottom

### Animations (Framer Motion)
- Use `motion.div` for enter/exit animations
- Stagger children with delay: `transition={{ delay: i * 0.1 }}`
- Viewport animations: `whileInView={{ opacity: 1 }}`

### Git Workflow
1. Ask user before committing or deploying
2. Build locally before push: `npm run build`
3. Commit format: `feat:`, `fix:`, `refactor:`

## Project Structure
```
src/
  components/       # React components
    ui/            # shadcn/ui components
    BottomNav.tsx  # Mobile bottom navigation
    GlassCard.tsx  # Glassmorphism card
    MobileHeader.tsx
    MobileStatCard.tsx
    Sidebar.tsx    # Desktop sidebar
    StatCard.tsx
  pages/           # Route pages
    LandingPage.tsx
    LoginPage.tsx
    RegisterPage.tsx
    DashboardPage.tsx
    admin/
      AdminDashboard.tsx
  hooks/           # Custom React hooks
    useAuth.tsx
    useBalance.ts
    useInvestments.ts
    useDeposits.ts
    useWithdrawals.ts
    useAdmin.ts
  context/         # React contexts
  lib/             # Utilities (cn, formatters)
  firebase/        # Firebase config
  data/            # Static data
  types/           # TypeScript types

scripts/
  serviceAccountKey.json    # Firebase service account (sensitive)
  setupFirebase.js          # Setup script for system_settings
  makeAdmin.js              # Script to make user admin

functions/
  index.js                  # Cloud Functions (daily profits)
  package.json
```

## Database Schema

### Collections:

**users/**
```typescript
{
  uid: string,
  email: string,
  displayName: string,
  photoURL: string,
  role: 'user' | 'admin',
  balance: {
    total: number,
    available: number,
    invested: number,
    totalProfit: number,
    lastProfitDate: timestamp
  },
  referralCode: string,
  referredBy: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

**investments/**
```typescript
{
  userId: string,
  plan: 'basic' | 'intermediate' | 'premium',
  amount: number,
  dailyRate: number, // 0.5, 0.85, 1.5
  totalProfitGenerated: number,
  startDate: timestamp,
  endDate: timestamp,
  isActive: boolean,
  status: 'pending' | 'confirmed' | 'rejected',
  createdAt: timestamp,
  updatedAt: timestamp
}
```

**deposits/**
```typescript
{
  userId: string,
  amount: number,
  type: 'initial' | 'topup' | 'plan_upgrade',
  paymentMethod: 'bank_transfer_rd' | 'crypto_usdt',
  bankName?: string, // For bank transfers
  accountNumber?: string, // For bank transfers
  cryptoNetwork?: 'trc20' | 'bep20', // For crypto
  proofImage: string, // URL to Firebase Storage
  status: 'pending' | 'confirmed' | 'rejected',
  approvedBy?: string, // Admin UID
  approvedAt?: timestamp,
  rejectionReason?: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

**withdrawals/**
```typescript
{
  userId: string,
  amount: number,
  paymentMethod: 'bank_transfer_rd' | 'crypto_usdt',
  bankName?: string,
  accountNumber?: string,
  cryptoNetwork?: 'trc20' | 'bep20',
  cryptoAddress?: string,
  status: 'pending' | 'processing' | 'completed' | 'rejected',
  approvedBy?: string,
  approvedAt?: timestamp,
  processedAt?: timestamp,
  rejectionReason?: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

**system_settings/global**
```typescript
{
  withdrawalSchedule: {
    enabledDays: string[], // ['monday', 'wednesday', 'friday']
    startHour: number, // 9
    endHour: number // 17
  },
  currentWithdrawalStatus: 'enabled' | 'disabled',
  plans: {
    basic: { name, minAmount, dailyRate, features, description },
    intermediate: { name, minAmount, dailyRate, features, description },
    premium: { name, minAmount, dailyRate, features, description }
  },
  cryptoWallets: {
    usdt_trc20: string,
    usdt_bep20: string,
    activeNetwork: 'trc20' | 'bep20'
  },
  bankAccounts: [
    { bankName, accountNumber, accountHolder, accountType, isActive, isDefault }
  ],
  maintenanceMode: boolean,
  lastProfitDistribution: timestamp,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## Business Logic

### Investment Plans
- **Basic**: Min $50, 0.5% daily, basic signals, 48h withdrawals
- **Intermediate**: Min $200, 0.85% daily, advanced signals, 24h withdrawals
- **Premium**: Min $500, 1.5% daily, VIP signals, 4h withdrawals

### Profit Distribution
- Runs daily at midnight (America/Santo_Domingo timezone)
- Calculates: `dailyProfit = investmentAmount * (dailyRate / 100)`
- Updates: user balance (available + total), investment totalProfitGenerated
- Cloud Function: `distributeDailyProfits`

### Withdrawal Rules
- Only enabled on configured days (Mon/Wed/Fri) during business hours (9AM-5PM)
- All withdrawals require admin approval
- Users must have sufficient available balance

### Deposit Flow
1. User selects plan and payment method
2. System displays payment details (bank account or crypto wallet)
3. User uploads transfer proof (image)
4. Admin reviews and approves/rejects
5. On approval: Investment is created, balance updated

## Key Dependencies
- React 18 + TypeScript
- Tailwind CSS 3 + shadcn/ui
- Framer Motion (animations)
- Firebase Auth + Firestore + Storage
- Chart.js + react-chartjs-2
- lucide-react (icons)
- @tma.js/sdk (Telegram Mini App)

## Important Notes
- Dark theme only (#0f172a background)
- Mobile-first responsive design
- **Bancos configurados (TEST):** Banco Popular, Banco de Reservas, BHD León
- **Wallets crypto (TEST):** TRC20 y BEP20 (actualizar antes del lanzamiento)
- Admin UID: `JkIWTDgVnyLs9wG5crXj2mlSmnH2`
- Deployed on Vercel: https://elite-forex-dashboard.vercel.app
