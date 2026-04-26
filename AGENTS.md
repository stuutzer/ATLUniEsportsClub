# AGENTS.md

Guidance for AI coding assistants (Claude Code, Codex, Cursor, etc.) working in this repo.

---

## Project at a glance

AgentCart (UI brand: **Quarter**) is a Next.js 14 App Router app demonstrating an AI shopping agent that proves authority to merchants via a signed **Agent Credential**. Wallet integration is wagmi v2 + viem. The credential is stored in `localStorage` only — there is no backend database.

All demo payment paths use a tiny native **test AVAX** send (`0.0003`) on **Avalanche Fuji Testnet** (`chainId 43113`) through MetaMask. Buy, cart checkout, and order commitment all share the constants in `lib/demoPayment.ts`, so the demo can run without real crypto. The credential's EIP-712 domain is still pinned to `chainId 43114`.

Default route: `/` redirects to `/agent`. The dedicated `/product/[id]` page was removed — product detail is now an in-place quick-view modal opened from the product card.

---

## Where things live

| Concern | File |
|--------|------|
| Credential type + EIP-712 typed-data + mock fallback | `lib/identity.ts` |
| Global identity state (address, ENS, credential) | `context/IdentityContext.tsx` |
| Wallet + ENS sync into context | `providers/web3-provider.tsx` |
| Wagmi chain + connector config | `lib/wagmiConfig.ts` |
| 5-step purchase verification UI | `components/purchase-modal.tsx` |
| Fuji demo payment constants | `lib/demoPayment.ts` |
| Single-item buy — modal + Fuji test AVAX send | `components/buy-item-button.tsx` |
| Product card + quick-view modal (replaces product detail page) | `components/product-card.tsx` |
| Wallet-required gate (search + buy entry points) | `components/wallet-required-modal.tsx` |
| Cart state (per-item shippingUsd, persisted) | `context/CartContext.tsx` |
| Cart page — bundled Fuji test AVAX checkout + fiat-exchange banner | `app/cart/page.tsx` |
| Orders state (pending / ready / fulfilled / cancelled) | `context/OrdersContext.tsx` |
| Place-order modal — config phase + reuses `PurchaseModal` for AVAX commitment | `components/place-order-modal.tsx` |
| Orders page — filters, cancel, "Move to cart" | `app/orders/page.tsx` |
| Order tracking + invoice download trigger | `components/order-tracking-modal.tsx` |
| Invoice PDF document (`@react-pdf/renderer`) | `components/invoice-pdf.tsx` |
| Invoice data shape + generator | `lib/invoiceData.ts` |
| Identity status pill on `/agent` | `components/identity-banner.tsx` |
| Sidebar — nav + Cart/Orders badges + identity row | `components/sidebar.tsx` |
| Agent console — search + sessionStorage result cache | `components/agent-console.tsx` |
| Profile page (credential + permissions + invoice download) | `app/profile/page.tsx` |
| Wallet page + dev `simulatePurchase` button | `app/wallet/page.tsx` |
| AI SDK shopping agent (server) | `lib/openai-shopping-agent.ts`, `app/api/agent/run/route.ts` |
| Shopping MCP server (stdio) | `mcp-server/server.mjs` |
| Payment-gateway MCP (Avalanche + off-ramp) | `mcp-server/payment-gateway/`, `contracts/AvalanchePaymentEscrowRouter.sol` |

---

## Core invariants

- **Credential lifecycle is client-only.** `localStorage["agentcart_credential"]` is the source of truth. `loadCredential()` already handles expiry, JSON errors, and backfilling `signatureType` for legacy entries — don't reimplement.
- **Signing is real EIP-712, with a mock fallback.** Prefer `eth_signTypedData` using `buildTypedData(draft)` from `lib/identity.ts`. Only fall back to `generateMockCredential()` when no wallet is connected or the user rejects the prompt. Persist `signatureType: "eip-712" | "mock"` so downstream UI (and the invoice) can disclose which path was taken. The EIP-712 domain is pinned to `chainId 43114` — don't change it casually.
- **Purchase modal is a *visual* gate.** The 5 steps are timed with `setTimeout` (`STEP_DELAYS` at the top of `components/purchase-modal.tsx`). Step 5's "Confirm Payment" calls the `onConfirm` prop, which the buy button uses to broadcast the actual transaction. Don't move the transaction call earlier in the flow. The modal is reused by `BuyItemButton`, the cart's checkout flow, and `PlaceOrderModal` — three callers, one component.
- **No credential caps.** Purchases must not be blocked by credential policy amounts. The purchase modal is visual verification only; payment is only gated by wallet confirmation and transaction errors.
- **Fuji demo payments.** `BuyItemButton`, `app/cart/page.tsx`, and `PlaceOrderModal` all use `useSendTransaction` with `parseEther(DEMO_PAYMENT_AMOUNT_AVAX)` to `DEMO_MERCHANT_ADDRESS`. Switch to `DEMO_PAYMENT_CHAIN.id` before broadcasting. `PlaceOrderModal` persists the hash on the `Order` as `commitmentHash`.
- **Wallet-required gate.** Search submission and the cart "Ship All Items" path open `WalletRequiredModal` if `useAccount().isConnected` is false. New entry points that broadcast or call the agent should follow the same pattern instead of failing silently.
- **Order placement reuses the purchase flow.** `PlaceOrderModal` has two phases: `configure` (type / target price / note form) and `verifying` (renders `PurchaseModal` with `paymentToken=DEMO_PAYMENT_TOKEN`, `paymentAmount=DEMO_PAYMENT_AMOUNT_AVAX`, and the price label/value overrides). The Order is only persisted after the Fuji commitment is `isConfirmed` — never before. A `placedRef` guards against double-write on re-renders.
- **Cart shipping does not compound with quantity.** `CartContext.shipping` reduces `shippingUsd` per **item line**, not per unit. `addItem(product, 1, shippingUsd)` writes the per-line shipping value; bumping quantity must not multiply it.
- **Agent search results are cached in `sessionStorage`.** `agent-console.tsx` uses `quarter_agent_result:<query>` for per-query results and `quarter_agent_last_result` for the most-recent result so the agent screen restores after navigation. Don't replace with an in-memory `Map` (lost on route changes).
- **No backend.** Don't add API persistence for credentials, cart, or orders. The `app/api` routes exist for the AI SDK agent and shopping mock only.
- **ENS resolution runs against mainnet** (`useEnsName({ chainId: 1 })` in `IdentitySync`). Don't "fix" this to match the tx chain.
- **Invoice PDF is client-only.** `components/invoice-pdf.tsx` is `"use client"` and imported directly from client components. Do not wrap it in `next/dynamic`; do not import it from a server component.
- **The product detail page is gone.** `app/product/[id]/page.tsx` was deleted — clicking a product card image opens the in-place `ProductQuickView` modal instead. Don't add new external links to `/product/[id]`. The quick-view modal is the canonical "details + Buy + Add to Cart + Place Order" surface.

---

## Common tasks

### Adding a new permission
1. Extend the toggle UI in `app/profile/page.tsx` (`PermissionRow` + `buildPermissions`).
2. Permissions are just strings in `AgentCredential.permissions` — no schema migration needed.
3. The credential card auto-renders permissions as `Title Case • Title Case`.

### Changing modal step timing
Edit `STEP_DELAYS` at the top of `components/purchase-modal.tsx`. Indexes map to step transitions 1→2, 2→3, 3→4, 4→5.

### Adding a new product category
Edit `ALL_CATEGORIES` in `app/profile/page.tsx`. Categories propagate into `credential.allowedCategories`.

### Wiring a new "buy" entry point
Use `<BuyItemButton product={product} />`. It expects a full `Product` (`lib/mockData.ts`), not just `{ name, price }`. The modal, chain-switch, and Fuji test AVAX send are handled internally.

### Adding a new field to the invoice
1. Add it to `InvoiceData` / `InvoiceItem` in `lib/invoiceData.ts`.
2. Provide a default in `generateInvoiceData()` so existing transactions still render.
3. Render it in `components/invoice-pdf.tsx` with the existing Helvetica + StyleSheet pattern (no external fonts).

---

## Conventions

- **TypeScript strict.** Run `npx tsc --noEmit` before declaring a task done.
- **Tailwind only.** No CSS modules. Color tokens lean on `white/X` opacity utilities and `purple-600` for accents.
- **`"use client"`** is required on any component that uses wagmi hooks, context, `useState`, `useEffect`, or `localStorage`.
- **Server vs client `localStorage`.** `loadCredential()` is called inside `useEffect` in the provider — never call it during render. WalletConnect already triggers SSR `localStorage` errors; don't add new code paths that touch `localStorage` server-side.
- **No emoji in code or comments** unless mirroring an existing checkmark/X (e.g. `Identity Verified ✓`).

---

## Known issues

- WalletConnect prints `this.localStorage.getItem is not a function` during SSR. It's noisy but non-fatal; fix by wrapping `Web3Provider` consumers in a client-only boundary or `dynamic(..., { ssr: false })` if you touch the provider stack.
- `tsconfig.tsbuildinfo` is checked in and frequently shows up in `git status`. Leave it alone unless you're cleaning the working tree.

---

## Don'ts

- Don't replace the EIP-712 path with a homegrown hash. The mock-signature fallback in `lib/identity.ts` is for the no-wallet / rejected-prompt case only — keep both paths.
- Don't pull credential state out of context into prop drilling. Use `useIdentity()`.
- Don't add backwards-compatibility shims for the old `/marketplace` route — it was intentionally removed. `/wallet` still exists (with a `simulatePurchase` dev button); don't delete it.
- Don't repopulate `app/api/newmoney/mint` — legacy token minting was deliberately removed.
- Don't commit `.env`. Runtime-only vars: `OPENAI_API_KEY` (agent), `NEXT_PUBLIC_AVALANCHE_RPC_URL` (custom RPC), `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`, plus the payment-gateway MCP vars documented in `mcp-server/payment-gateway/README.md`.
