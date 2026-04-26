# AgentCart

An AI-powered Web3 shopping agent that acts on your behalf — searching products, comparing prices, and completing purchases while proving its authority to merchants via a cryptographic Digital Identity system.

---

## Overview

AgentCart connects your Ethereum wallet and issues a signed **Agent Credential** that authorises the AI agent to shop for you. Every purchase triggers a 5-step merchant-verification flow that visually demonstrates how the agent presents its credential, gets verified, and only then proceeds to payment.

---

## Features

### Digital Identity System
- Resolves your **ENS name** on connect (falls back to truncated address `0x1234...5678`)
- Issues a signed **Agent Credential** scoped with permissions and an expiry (24 h)
- **Real EIP-712 signature** via `eth_signTypedData` (domain `AgentCart`, chainId `43114`); falls back to a deterministic mock signature when no wallet is connected or the user rejects the prompt. The credential carries a `signatureType: "eip-712" | "mock"` discriminator.
- Credential stored in `localStorage` under key `agentcart_credential`; auto-invalidated on expiry

### Profile Page (`/profile`)
- Identity card with avatar initials and "Identity Verified ✓" badge
- Styled credential card (dark card with purple left-border accent) showing agent name, authorized identity, permissions, validity, and truncated signature
- Revoke / Renew credential actions
- Permission toggles: web search, price comparison, purchase initiation, auto-approve
- Category allowlist (Electronics, Clothing, Food, Software, Travel, Other)
- "Save Permissions" regenerates the credential with updated settings

### 5-Step Purchase Modal
Triggered by the "Buy with Agent" button on any product card:

| Step | Description | Delay |
|------|-------------|-------|
| 1 | Loading agent credential | 800 ms |
| 2 | Contacting merchant | 1 000 ms |
| 3 | Presenting credential (animated slide-in) | 1 200 ms |
| 4 | Verification result (green ✓ or red ✗ if no credential) | 800 ms |
| 5 | Payment confirmation with price breakdown | — |

- Progress indicator (5 dots, active dot purple)
- If no credential: flow halts at step 4 with a "Go to Profile" link
- Step 5 "Confirm Payment" triggers a real on-chain **test AVAX** transfer on **Avalanche Fuji Testnet** via wagmi `useSendTransaction` (auto-switches chain if needed)

### Invoice PDF Generation
- Every settled purchase can be exported as a professional PDF invoice via `@react-pdf/renderer`
- Data shape and mock-filling helper live in `lib/invoiceData.ts`; the document component is `components/invoice-pdf.tsx`
- Download buttons are wired into the order-tracking modal and per-row on the profile page
- Invoice surfaces the EIP-712 credential signature, agent identity, merchant identity, line items, totals, and the on-chain tx hash / block number — usable as a compliance artifact for agent-initiated purchases

### Agent Page (`/agent`)
- Identity status banner — green pill when credential is active, yellow warning when missing
- Shopping categories and search bar

### Sidebar
- ENS name or truncated address at the bottom with green/grey status dot
- Clicking routes to `/profile`

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + tailwindcss-animate |
| UI components | Radix UI primitives (Dialog, Switch, Tooltip, etc.) |
| Web3 | wagmi v2 + viem |
| Chains | Avalanche Fuji Testnet (demo payments), mainnet, sepolia |
| ENS resolution | wagmi `useEnsName` hook (mainnet) |
| AI agent | Vercel AI SDK + `@ai-sdk/openai` (`gpt-5.4-mini`) over local MCP tools |
| PDF | `@react-pdf/renderer` (client-only) |
| State | React Context (`IdentityContext`, `AgentContext`) |
| Data fetching | TanStack Query v5 |

---

## Project Structure

```
app/
  agent/          — main shopping / agent page (default landing)
  api/            — Next.js route handlers (OpenAI agent endpoint)
  profile/        — identity & credential management
  settings/       — app settings

components/
  purchase-modal       — 5-step merchant verification flow
  credential-card      — styled digital ID card
  identity-banner      — agent page status bar
  sidebar              — navigation + identity display
  buy-item-button      — opens purchase modal, fires test AVAX send on Avalanche Fuji
  order-tracking-modal — post-purchase status + invoice download
  invoice-pdf          — @react-pdf/renderer invoice document
  agent-console        — chat-style agent interface
  ...

context/
  IdentityContext — wallet address, ENS name, credential state
  AgentContext    — agent feed / activity / transaction history

lib/
  identity.ts            — AgentCredential + EIP-712 typed-data builder + mock fallback
  demoPayment.ts         — shared Avalanche Fuji test payment constants
  wagmiConfig.ts         — wagmi chain + connector config, including Avalanche Fuji for demo payments
  openai-shopping-agent  — server-side AI SDK shopping agent (gpt-5.4-mini + local MCP tools)
  shopping-backend.mjs   — local shopping data backend used by the MCP server
  invoiceData.ts         — invoice data shape + generator from a Transaction
  mockData.ts            — product fixtures

contracts/
  AvalanchePaymentEscrowRouter.sol — escrow + router for cross-chain USDC settlement

mcp-server/
  server.mjs            — shopping MCP server (stdio)
  payment-gateway/      — cross-chain crypto-to-fiat MCP server (Avalanche + off-ramp)

mcp-server/         — local MCP server exposing shopping tools to the agent

providers/
  web3-provider   — WagmiProvider + QueryClientProvider + IdentitySync
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- A browser wallet (MetaMask or any WalletConnect-compatible wallet)
- `OPENAI_API_KEY` if you want the `/agent` page to use the OpenAI shopping agent

### Install

```bash
npm install
```

### Start the app locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — the root redirects to `/agent`.

If port `3000` is already in use:

```bash
npm run dev -- --port 3001
```

### Start the mocked shopping MCP server

```bash
npm run mcp:shopping
```

This is only needed if you want to run the MCP server directly for local testing or connect an external MCP client. The Next.js app can also spawn it on demand through the OpenAI agent route.

### Start the payment-gateway MCP server (optional)

```bash
npm run mcp:payments
```

Cross-chain crypto-to-fiat orchestrator (BTC/ETH → Avalanche USDC → Circle/Stripe off-ramp). Requires `AVALANCHE_ESCROW_ADDRESS`, `AVALANCHE_USDC_ADDRESS`, and `OFFRAMP_SETTLEMENT_WALLET` in env. See `mcp-server/payment-gateway/README.md` and `docs/payment-gateway-architecture.md`.

### Enable the OpenAI shopping agent

Add this to `.env`:

```bash
OPENAI_API_KEY=sk-...
```

Then open `/agent` and submit a shopping prompt. The agent uses `gpt-5.4-mini` through the AI SDK plus local shopping tools.

### Build for production

```bash
npm run build
npm start
```

---

## Usage

1. **Connect wallet** — click the wallet button in the sidebar; ENS name resolves automatically.
2. **Generate credential** — go to `/profile`, configure permissions, and click "Generate Credential".
3. **Shop** — browse categories or use the search bar on the Agent page; the identity banner confirms the credential is active.
4. **Purchase** — click "Purchase with Agent" in an item modal. The 5-step verification flow runs, then confirming step 5 sends the configured on-chain payment through MetaMask.
5. **Invoice** — open a settled order (profile or order-tracking modal) and click "Download Invoice ↓" to export the PDF compliance artifact.

---

## Credential Architecture

```typescript
interface AgentCredential {
  id: string              // UUID
  agentName: string       // "agentcart.eth"
  actingFor: string       // ENS name or wallet address
  permissions: string[]   // ["search", "compare", "purchase"]
  allowedCategories: string[]
  issuedAt: string        // ISO 8601
  expiresAt: string       // ISO 8601 — 24 h after issuedAt
  signature: string       // EIP-712 signature (or mock fallback)
  signatureType: "eip-712" | "mock"
}
```

Typed-data domain: `{ name: "AgentCart", version: "1", chainId: 43114 }`. Credentials are stored client-side only (`localStorage`) — no backend required.

---

## Notes

- Signing prefers real EIP-712 via `eth_signTypedData`; the deterministic mock signature is only used when no wallet is available or the user rejects the prompt. The `signatureType` field on the stored credential records which path was taken.
- No backend or database — all state lives in localStorage and React context.
- The purchase flow is intentionally animated and staged to make the AI identity verification process visible to observers (e.g. judges / demos).
- Buy, cart checkout, and order commitment use a tiny Fuji test AVAX payment so demos do not require real funds.
- The `app/wallet` page exposes a `simulatePurchase` dev affordance for seeding transaction history without broadcasting a transaction.
