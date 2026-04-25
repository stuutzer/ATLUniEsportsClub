Build a Web3 AI Marketplace app called "AgentCart" based on the following 
UI design spec. Match the layout and visual style exactly.

## Overall Layout
- Full dark theme: background #0a0a0a, sidebar #111111, cards #1a1a1a
- Two-column layout: fixed left sidebar + main content area
- No top navbar — navigation lives entirely in the sidebar

## Sidebar (left, fixed, ~220px wide)
- Dark background, slightly lighter than main (#111111)
- App logo/name "AgentCart" at the top with a subtle purple accent
- Navigation items (top to bottom), each with an icon + label:
  - 🤖 Agent (default active page)
  - 🛍️ Marketplace
  - 👛 Wallet
  - 👤 Profile
  - ⚙️ Settings
- Each nav item: rounded-lg button, full width, icon on left, label right
- Active state: purple background (#7c3aed), white text
- Inactive state: transparent background, muted gray text, hover darkens slightly
- Sidebar has a subtle right border (border-white/5)

## Main Content Area — Agent Page (default view)

### Top Section (center of screen)
- Greeting text: "Good morning, TestUser." in small muted gray
- Below it: "What did you want to purchase today?" in large white bold text (~28px)
- These are vertically and horizontally centered in the upper portion

### Product Grid (below greeting)
- 2x3 grid of placeholder cards (6 cards total)
- Each card: rounded-xl, background #1c1c1c, ~280px wide, ~140px tall
- Empty for now (will be populated by search results later)
- Subtle border: border-white/5
- Leave a TODO comment: // TODO: populate with AI agent search results

### Search Bar (bottom, fixed)
- Pinned to the bottom of the main content area
- Wide pill-shaped input: "What did you want to purchase today?" placeholder
- Dark input background (#1c1c1c), white placeholder text (muted)
- Arrow submit button on the right side of the input, dark rounded button
- Input takes up ~60% of the content area width, centered horizontally
- On submit: TODO comment // TODO: trigger Claude API agent search

## Other Pages (scaffold only, no content yet)

### Marketplace (/marketplace)
- Same sidebar layout
- Empty main area with heading "Marketplace" and subtext "Search results will appear here"
- Leave a 2x4 grid of empty product card placeholders

### Wallet (/wallet)  
- Same sidebar layout
- Show 3 mock balance cards horizontally: ETH, AVAX, USDC
- Each card: token symbol, mock balance (e.g. 0.42 ETH), USD equivalent
- Empty transaction history table below with column headers only

### Profile (/profile)
- Same sidebar layout
- Avatar circle placeholder + "TestUser" name + mock wallet address (truncated)
- Empty sections for: Purchase History, Agent Settings

### Settings (/settings)
- Same sidebar layout
- Empty settings panel placeholders with section headers

## Tech Stack
- Next.js 14 (app router)
- Tailwind CSS
- TypeScript
- shadcn/ui for components
- lucide-react for icons

## File Structure
/app
  /page.tsx (redirects to /agent)
  /agent/page.tsx (default view shown in design)
  /marketplace/page.tsx
  /wallet/page.tsx
  /profile/page.tsx
  /settings/page.tsx
  /layout.tsx (sidebar + main content wrapper)
/components
  /sidebar.tsx (navigation sidebar)
  /product-card.tsx (empty card placeholder)
  /search-bar.tsx (bottom search input)
/lib
  /mockData.ts (mock user, balances, products)

## Design Rules
- NO top navbar
- Sidebar is always visible on all pages
- Active sidebar item reflects current route (use Next.js usePathname)
- All cards: rounded-xl, no sharp corners anywhere
- Font: Inter
- Purple accent (#7c3aed) used ONLY for: active nav item, submit button, 
  focus ring on search bar
- Everything else is shades of dark gray
- Search bar is sticky to bottom of content area on agent page only

## Notes
- App must run with zero errors on `npm run dev`
- Mobile responsiveness is NOT required for the hackathon demo
- Sidebar should NOT collapse
- Leave TODO comments everywhere real functionality will go:
  - // TODO: connect MetaMask wallet
  - // TODO: fetch real user ENS name
  - // TODO: trigger Claude API agent search
  - // TODO: populate grid with ranked results