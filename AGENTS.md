# AGENTS.md

Guidance for AI coding assistants (Claude Code, Codex, Cursor, etc.) working in this repo.

---

## Project at a glance

AgentCart (UI brand: **Quarter**) is a Next.js 14 App Router app demonstrating an AI shopping agent that proves authority to merchants via a signed **Agent Credential**. Wallet integration is wagmi v2 + viem; on-chain settlement is a native **AVAX** send on **Avalanche C-Chain** (mainnet, chainId `43114`). The credential is stored in `localStorage` only — there is no backend database.

Default route: `/` redirects to `/agent`.

---

## Where things live

| Concern | File |
|--------|------|
| Credential type + EIP-712 typed-data + mock fallback | `lib/identity.ts` |
| Global identity state (address, ENS, credential) | `context/IdentityContext.tsx` |
| Wallet + ENS sync into context | `providers/web3-provider.tsx` |
| Wagmi chain + connector config | `lib/wagmiConfig.ts` |
| 5-step purchase verification UI | `components/purchase-modal.tsx` |
| Buy button — modal + AVAX send + spending-limit policy | `components/buy-item-button.tsx` |
| Order tracking + invoice download trigger | `components/order-tracking-modal.tsx` |
| Invoice PDF document (`@react-pdf/renderer`) | `components/invoice-pdf.tsx` |
| Invoice data shape + generator | `lib/invoiceData.ts` |
| Identity status pill on `/agent` | `components/identity-banner.tsx` |
| Sidebar identity row + nav | `components/sidebar.tsx` |
| Profile page (credential + permissions + invoice download) | `app/profile/page.tsx` |
| Wallet page + dev `simulatePurchase` button | `app/wallet/page.tsx` |
| AI SDK shopping agent (server) | `lib/openai-shopping-agent.ts`, `app/api/agent/run/route.ts` |
| Shopping MCP server (stdio) | `mcp-server/server.mjs` |
| Payment-gateway MCP (Avalanche + off-ramp) | `mcp-server/payment-gateway/`, `contracts/AvalanchePaymentEscrowRouter.sol` |

---

## Core invariants

- **Credential lifecycle is client-only.** `localStorage["agentcart_credential"]` is the source of truth. `loadCredential()` already handles expiry, JSON errors, and backfilling `signatureType` for legacy entries — don't reimplement.
- **Signing is real EIP-712, with a mock fallback.** Prefer `eth_signTypedData` using `buildTypedData(draft)` from `lib/identity.ts`. Only fall back to `generateMockCredential()` when no wallet is connected or the user rejects the prompt. Persist `signatureType: "eip-712" | "mock"` so downstream UI (and the invoice) can disclose which path was taken. The EIP-712 domain is pinned to `chainId 43114` (Avalanche C-Chain) — don't change it casually.
- **Purchase modal is a *visual* gate.** The 5 steps are timed with `setTimeout` (`STEP_DELAYS` at the top of `components/purchase-modal.tsx`). Step 5's "Confirm Payment" calls the `onConfirm` prop, which the buy button uses to trigger `useSendTransaction`. Don't move the transaction call earlier in the flow.
- **Spending limit is a hard cap.** `BuyItemButton` computes `policyError` when `product.price > credential.spendingLimit` and the modal halts at step 4 with a "Blocked by policy" panel — the tx is never broadcast. Preserve this gate when refactoring.
- **Settlement chain is Avalanche C-Chain mainnet.** `BuyItemButton` calls `switchChainAsync({ chainId: avalanche.id })` before `sendTransaction`. Test transfers use `parseEther("0.0003")` AVAX to a burn address. Don't switch the live path back to Base Sepolia / Fuji — those chains are kept in `wagmiConfig` for dev only.
- **No backend.** Don't add API persistence for credentials. The `app/api` routes exist for the AI SDK agent and shopping mock only. `app/api/newmoney/mint` is empty by design (settlement was removed in `b89df7b`) — don't repopulate it without discussion.
- **ENS resolution runs against mainnet** even though transactions run on Avalanche (`useEnsName({ chainId: 1 })` in `IdentitySync`). Don't "fix" this to match the tx chain.
- **Invoice PDF is client-only.** `components/invoice-pdf.tsx` is `"use client"` and imported directly from client components. Do not wrap it in `next/dynamic`; do not import it from a server component.

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
Use `<BuyItemButton product={product} />`. It expects a full `Product` (`lib/mockData.ts`), not just `{ name, price }`. The modal, spending-limit policy check, chain-switch, and AVAX transfer are handled internally.

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
- Don't repopulate `app/api/newmoney/mint` — newmoney/dNZD settlement was deliberately removed.
- Don't commit `.env`. Runtime-only vars: `OPENAI_API_KEY` (agent), `NEXT_PUBLIC_AVALANCHE_RPC_URL` (custom RPC), `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`, plus the payment-gateway MCP vars documented in `mcp-server/payment-gateway/README.md`.
