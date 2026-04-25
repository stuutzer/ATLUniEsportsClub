You are setting up a Web3 AI Marketplace app called AgentCart. 
This is a hackathon project. Set up the project environment and build 
a polished, refined UI shell with placeholdermock data. 
No real functionality yet — focus on structure and visuals.

## Tech Stack
- Next.js 14 (app router)
- Tailwind CSS
- wagmi v2 + viem (wallet connection)
- shadcnui (components)
- TypeScript

## Project Setup
1. Scaffold a new Next.js 14 project with TypeScript and Tailwind
2. Install and configure wagmi, viem, @tanstackreact-query, shadcnui
3. Install ENS resolution @ensdomainsensjs
4. Set up wagmi config supporting MetaMask + WalletConnect
5. Configure Avalanche C-Chain testnet (chainId 43113) as the default network

## Pages to Build

### 1. Main Marketplace Page ()
- Top navbar with
  - AgentCart logo on the left
  - Search bar in the center (large, prominent)
  - Wallet connect button on the right (shows ENS name or truncated address when connected)
- Hero section tagline Your AI Agent. Your Wallet. Every Purchase.
- Search results grid (use 8-12 mock product cards)
  - Each card shows product image placeholder, product name, price in USD, 
    accepted crypto icons (ETH, AVAX, USDC), and an AI tier badge
  - Tier badges S (purple), A (blue), B (green) — styled prominently on the card corner
  - Cards sorted S → A → B by default
- Filter sidebar category, price range, accepted crypto, tier filter

### 2. Product Detail Page (product[id])
- Product image (large placeholder)
- Product name, description, merchant name
- Price breakdown table
  - Base price in USD
  - Equivalent in ETH  AVAX  USDC
  - Estimated gas fee per network
  - Total cost per network
  - Highlight the cheapest option in green
- AI Recommendation panel (right side card)
  - Tier badge (SAB)
  - 2-3 bullet points why the AI ranked it this way (mock text)
  - Let Agent Purchase primary CTA button
- Wallet status shows connected wallet balance in mock tokens

### 3. User Profile Page (profile)
- Avatar placeholder + ENS name  wallet address
- Connected wallet section show mock balances for ETH, AVAX, USDC
- Purchase history table (mock data) date, item, amount paid, token used, status
- Agent Settings panel
  - Toggle Allow agent to auto-approve purchases under $X
  - Input spending limit
  - Toggle Preferred payment token

### 4. Agent Activity Page (agent)
- Live feed panel (left) mock scrolling log of agent actions
  - Searching web for best price...
  - Found 12 results for 'mechanical keyboard'
  - Comparing gas fees across Ethereum and Avalanche...
  - Ranked results S to B based on price, fees, and merchant trust
- Results summary panel (right) same product cards from marketplace
- Status indicator Agent Active green pulsing dot in navbar when on this page

## Design Guidelines
- Dark mode by default (background #0a0a0a, cards #141414)
- Accent color purple (#7c3aed) for primary actions and S-tier badges
- Font Inter
- Tier badge colors S = purple, A = indigo, B = teal
- Cards rounded-xl, subtle border (border-white10), hover scale effect
- Navbar sticky, frosted glass effect (backdrop-blur)
- All buttons rounded-full, no square corners
- Spacing generous padding, breathable layout
- Crypto icons use simple text labels styled as pill badges (ETH, AVAX, USDC) 
  in muted colors for now

## Mock Data
Create a libmockData.ts file with
- 12 mock products with id, name, description, price, category, 
  tier (SAB), acceptedCrypto[], merchantName, imageUrl (use placeholder.com)
- 5 mock purchase history entries
- Mock agent activity log array (10 entries)

## File Structure
app
  page.tsx (marketplace)
  product[id]page.tsx
  profilepage.tsx
  agentpage.tsx
  layout.tsx (navbar + providers)
components
  navbar.tsx
  product-card.tsx
  tier-badge.tsx
  wallet-button.tsx
  agent-feed.tsx
  price-breakdown.tsx
lib
  mockData.ts
  wagmiConfig.ts
providers
  web3-provider.tsx (wagmi + react-query setup)

## Notes
- Wallet connect button should open a modal to connect MetaMask
- All pages should be responsive (mobile-friendly)
- No real API calls yet — everything uses mockData.ts
- Leave clear TODO comments where real functionality will be plugged in later
  -  TODO Replace with Serper API search results
  -  TODO Replace with Claude API ranking
  -  TODO Replace with real wallet balances
  -  TODO Trigger agent purchasing flow here
- Make sure the app runs with `npm run dev` with zero errors