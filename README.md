# ከነአን Café - Customer Experience

A beautiful, mobile-first café ordering system built with Next.js and Tailwind CSS.

## Features

### Phase 1: Menu & Ordering
- 🎨 Soft minimalist design with cream/gold color palette
- 📱 Mobile-first responsive layout
- 🛒 Dedicated cart page with special instructions
- ✨ Staggered fade-in animations for menu items
- 🍰 Categorized menu (Coffee, Breakfast, Pastry)

### Phase 1.5: Navigation & Order Tracking
- 🏠 Brand experience home page with story and staff picks
- 🧭 Bottom navigation bar with backdrop blur
- 📋 Active order session tracking
- 🔔 Real-time order status notifications
- 💰 Request bill functionality (visible when items are served)
- 📊 Order history within session

### Phase 1.6: UI Polish & Route Refactoring
- 🎯 Menu as landing page (/)
- 🏛️ Premium brand experience page (/home)
- 🛒 Full-page cart with special instructions (/cart)
- ✨ Staggered animations for smooth UX
- 🎨 Enhanced typography with serif fonts
- 📐 Fixed layout overlaps with proper spacing

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Lucide React (icons)
- React Context API (state management)

## Project Structure

```
├── app/
│   ├── layout.tsx          # Root layout with AppProvider
│   ├── page.tsx            # Menu page (landing)
│   ├── home/
│   │   └── page.tsx        # Brand experience page
│   ├── cart/
│   │   └── page.tsx        # Full cart page
│   ├── orders/
│   │   └── page.tsx        # Order status & history
│   ├── profile/
│   │   └── page.tsx        # User profile
│   └── globals.css
├── components/
│   ├── BottomNav.tsx       # Navigation bar with backdrop blur
│   ├── Header.tsx          # Premium header with serif font
│   ├── CategoryFilter.tsx
│   ├── MenuGrid.tsx        # With staggered animations
│   ├── ViewCartButton.tsx  # Floating cart button
│   ├── SuccessModal.tsx
│   └── Toast.tsx           # Notification toasts
├── context/
│   └── AppContext.tsx      # Global state management
├── data/
│   └── menu.ts
└── types/
    ├── menu.ts
    └── order.ts
```

## Page Routes

- `/` - Menu page (landing)
- `/home` - Brand experience with story and staff picks
- `/cart` - Full cart page with special instructions
- `/orders` - Active order tracking and history
- `/profile` - User profile

## Order Flow

1. **Browse Menu**: View categorized items on the landing page
2. **Add to Cart**: Select items and see floating cart button
3. **Review Cart**: Navigate to dedicated cart page
4. **Add Instructions**: Optional special requests
5. **Place Order**: Submit order from cart page
6. **Track Status**: Monitor order progress on Orders page
   - Pending → Preparing → Served
7. **Request Bill**: Available once items are served

## Design Features

- Staggered fade-in animations for menu items
- Backdrop blur on navigation and headers
- Premium serif typography for brand name
- Smooth transitions throughout
- Fixed layout spacing (pb-24 for bottom nav clearance)

## Color Palette

- Cream: #F9F8F6 (background)
- Charcoal: #2D2D2D (text)
- Gold: #C9A961 (accent)
