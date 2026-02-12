# Agent Instructions for Elite Forex Dashboard

## Project Overview
React + TypeScript + Tailwind CSS + shadcn/ui trading dashboard with Firebase authentication.

## Commands

### Development
- `npm run dev` - Start dev server (Vite)
- `npm run build` - Build for production (tsc + vite build)
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Deploy
- `npx vercel --prod` - Deploy to Vercel

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
  components/ui/    # shadcn/ui components
  pages/            # Route pages
  hooks/            # Custom React hooks
  context/          # React contexts
  lib/              # Utilities (cn, formatters)
  firebase/         # Firebase config
  data/             # Static data
  types/            # TypeScript types
```

## Key Dependencies
- React 18 + TypeScript
- Tailwind CSS 3 + shadcn/ui
- Framer Motion (animations)
- Firebase Auth + Firestore
- Chart.js + react-chartjs-2
- lucide-react (icons)
- @tma.js/sdk (Telegram Mini App)

## Important Notes
- Dark theme only (#0f172a background)
- Mobile-first responsive design
- No tests configured yet (add test framework if needed)
- Deployed on Vercel connected to GitHub
