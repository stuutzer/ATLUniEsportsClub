# AGENTS.md

Guidance for AI coding assistants (Claude Code, Codex, Cursor, etc.) working in this repo.

---

## Project at a glance

AgentCart (UI brand: **Quarter**) is a Next.js 14 App Router app demonstrating an AI shopping agent that proves authority to merchants via a signed **Agent Credential**. Wallet integration is wagmi v2 + viem against Base Sepolia. The credential is stored in `localStorage` only — there is no backend database.

Default route: `/` redirects to `/agent`.

---

## Where things live

| Concern | File |
|--------|------|
| Credential type + generate / save / load / revoke | `lib/identity.ts` |
| Global identity state (address, ENS, credential) | `context/IdentityContext.tsx` |
| Wallet + ENS sync into context | `providers/web3-provider.tsx` |
| Wagmi chain + connector config | `lib/wagmiConfig.ts` |
| 5-step purchase verification UI | `components/purchase-modal.tsx` |
| Buy button that opens the modal and fires `writeContract` | `components/buy-item-button.tsx` |
| Identity status pill on `/agent` | `components/identity-banner.tsx` |
| Sidebar identity row + nav | `components/sidebar.tsx` |
| Profile page (credential + permissions) | `app/profile/page.tsx` |
| Local OpenAI Agents SDK server | `lib/openai-shopping-agent.ts`, `mcp-server/` |

---

## Core invariants

- **Credential lifecycle is client-only.** `localStorage["agentcart_credential"]` is the source of truth. `loadCredential()` already handles expiry and JSON errors — don't reimplement.
- **Signature is mocked.** `generateCredential()` produces a deterministic hex string. There is a `// TODO: replace with real EIP-712 wallet signature` comment — preserve it. Real signing requires `eth_signTypedData` (EIP-712).
- **Purchase modal is a *visual* gate.** The 5 steps are timed with `setTimeout`. Step 5's "Confirm Payment" calls the `onConfirm` prop which the buy button uses to trigger `writeContract`. Don't move the transaction call earlier in the flow.
- **No backend.** Don't add API persistence for credentials. The `app/api` routes exist for the OpenAI agent only.
- **ENS resolution runs against mainnet** even though transactions run on Base Sepolia (`useEnsName({ chainId: 1 })` in `IdentitySync`). Don't "fix" this to match the tx chain.

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
Use `<BuyItemButton product={product} />`. It expects a full `Product` (`lib/mockData.ts`), not just `{ name, price }`. The modal + on-chain transfer are handled internally.

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

- Don't replace the mocked signature with `crypto.subtle` or a hash library — the `TODO` is intentional.
- Don't pull credential state out of context into prop drilling. Use `useIdentity()`.
- Don't add backwards-compatibility shims for the old `/marketplace` and `/wallet` routes — they were intentionally removed.
- Don't commit `.env`. `OPENAI_API_KEY` is the only var the app needs and it's runtime-only.
