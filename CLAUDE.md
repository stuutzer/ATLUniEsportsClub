Add a Digital Identity system to AgentCart. This feature proves that the 
AI agent is authorized to act on behalf of the user when interacting with 
merchants. No real merchant integration needed — build a convincing demo flow.

## Feature Overview
When a user connects their wallet:
1. Their ENS name (or truncated address) becomes their identity
2. They generate a signed "Agent Credential" granting the agent permissions
3. During any purchase flow, the agent presents this credential to the merchant
4. A mock merchant verification step plays out visually before payment proceeds

---

## 1. ENS Identity Resolution (on wallet connect)

In /providers/web3-provider.tsx and /components/sidebar.tsx:
- After wallet connects, resolve ENS name using ensjs
- If ENS name found: display "username.eth" in sidebar bottom
- If no ENS: display truncated address "0x1234...5678"
- Store resolved identity in a React context: IdentityContext
- Show a small green "Identity Verified" pill badge next to the name

```typescript
// lib/identity.ts
export interface AgentCredential {
  id: string                    // random uuid
  agentName: string             // "agentcart.eth"
  actingFor: string             // "username.eth" or wallet address
  permissions: string[]         // ["search", "compare", "purchase"]
  spendingLimit: number         // in USD
  allowedCategories: string[]   // ["electronics", "clothing", etc]
  issuedAt: string              // ISO timestamp
  expiresAt: string             // ISO timestamp (24hrs later)
  signature: string             // mock: keccak256 hash of above fields
}
```

---

## 2. Profile Page — Credential Generator

Replace the empty Profile page with:

### Identity Card (top section)
- Large avatar circle with user initials or blockie (use ethereum-blockies-base58 
  or just styled initials)
- ENS name / wallet address displayed prominently  
- "Identity Verified ✓" green badge if credential exists
- Wallet address in full, with copy button

### Agent Credential Panel (middle section)
- If NO credential exists:
  - Empty state card: "No Agent Credential Generated"
  - Subtext: "Generate a credential to allow AgentCart to act on your behalf 
    with merchants"
  - Purple "Generate Credential" button

- If credential EXISTS, show a styled credential card:
  - Looks like a digital ID card / passport
  - Dark card (#1a1a1a) with purple left border accent
  - Fields displayed:
    - Agent: agentcart.eth
    - Authorized For: [ens name / address]
    - Permissions: Search • Compare • Purchase
    - Spending Limit: $[amount]
    - Valid Until: [timestamp]
    - Signature: [first 20 chars of hash]...
  - "Revoke Credential" red outlined button
  - "Renew Credential" ghost button

### Permissions Settings (below credential card)
- Section header: "Agent Permissions"
- Toggle switches (shadcn Switch component) for:
  - ✅ Allow web search on my behalf
  - ✅ Allow price comparison
  - ✅ Allow purchase initiation
  - ❌ Auto-approve purchases (off by default)
- Number input: "Spending limit per transaction" (default $100)
- Multi-select or checkbox list: "Allowed categories"
  - Electronics, Clothing, Food, Software, Travel, Other
- "Save Permissions" button → regenerates credential with new settings
- All values saved to localStorage under key: "agentcart_credential"

---

## 3. Credential Generation Logic

In /lib/identity.ts:

```typescript
export function generateCredential(
  walletAddress: string,
  ensName: string | null,
  permissions: string[],
  spendingLimit: number,
  allowedCategories: string[]
): AgentCredential {
  const now = new Date()
  const expires = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  
  const credential: AgentCredential = {
    id: crypto.randomUUID(),
    agentName: "agentcart.eth",
    actingFor: ensName || walletAddress,
    permissions,
    spendingLimit,
    allowedCategories,
    issuedAt: now.toISOString(),
    expiresAt: expires.toISOString(),
    signature: "" // filled below
  }
  
  // Mock signature: hash of stringified credential fields
  // In production this would be a real wallet signature via eth_signTypedData
  const payload = JSON.stringify({
    agent: credential.agentName,
    for: credential.actingFor,
    permissions: credential.permissions,
    limit: credential.spendingLimit,
    issued: credential.issuedAt
  })
  
  // Simple deterministic mock hash for demo
  credential.signature = "0x" + Array.from(payload)
    .reduce((hash, char) => 
      ((hash << 5) - hash + char.charCodeAt(0)) | 0, 0
    ).toString(16).padStart(64, "0").slice(0, 64)
  
  return credential
}

export function saveCredential(credential: AgentCredential): void {
  localStorage.setItem("agentcart_credential", JSON.stringify(credential))
}

export function loadCredential(): AgentCredential | null {
  const raw = localStorage.getItem("agentcart_credential")
  if (!raw) return null
  const cred = JSON.parse(raw)
  // Check expiry
  if (new Date(cred.expiresAt) < new Date()) {
    localStorage.removeItem("agentcart_credential")
    return null
  }
  return cred
}
```

---

## 4. Purchase Flow — Merchant Verification Steps

When user clicks "Let Agent Purchase" on any product, show a 
full-screen modal or slide-up panel with animated steps:

### Step 1: Loading Credential
- Spinner + text: "Loading agent credential..."
- 800ms delay then auto-advance
- Shows credential card summary (agent name, authorized for, spending limit)

### Step 2: Contacting Merchant  
- Spinner + text: "Contacting merchant..."
- 1000ms delay then auto-advance
- Shows merchant name and logo placeholder

### Step 3: Presenting Identity
- Animated credential card slides in from left
- Text: "Presenting agent credential to [merchant]..."
- Shows key fields: Agent, Authorized For, Signature (truncated)
- 1200ms delay then auto-advance

### Step 4: Verification Result
- If credential valid:
  - Green checkmark animation
  - "Identity Verified ✓" 
  - "Merchant accepted agent credential. No login required."
  - Auto-advance to Step 5 after 800ms
- If NO credential exists:
  - Red X
  - "No credential found"
  - "Please generate an Agent Credential in your Profile first"
  - Button: "Go to Profile" — stops the flow here

### Step 5: Payment Confirmation
- Shows final price breakdown
- Network + gas fee
- Total in crypto
- "Confirm Payment" purple button → triggers MetaMask transaction
- "Cancel" ghost button

### Implementation notes:
- Build this as /components/purchase-modal.tsx
- Use shadcn Dialog or a custom slide-up panel
- Each step stored in useState: currentStep (1-5)
- Steps advance automatically with setTimeout
- Show a progress indicator at top: 5 dots, active one purple
- The whole flow should feel like watching an AI work in real time

---

## 5. Agent Page — Identity Status Banner

At the top of the Agent page, add a small status bar:
- If credential exists: 
  - Green pill: "🤖 AgentCart Identity Active • acting as username.eth • 
    Limit $100 • Expires in 23h"
- If no credential:
  - Yellow pill: "⚠️ No agent credential — purchases unavailable. 
    Generate one in Profile →" (clickable, routes to /profile)

---

## 6. Sidebar — Identity Display

At the bottom of the sidebar (above settings):
- Thin divider line
- Small avatar circle (initials) + ENS name or truncated address
- Green dot if credential active, gray dot if not
- Clicking it routes to /profile

---

## Files to Create/Modify
- /lib/identity.ts (new — credential logic)
- /context/IdentityContext.tsx (new — global identity state)
- /components/purchase-modal.tsx (new — 5-step verification flow)
- /components/credential-card.tsx (new — styled ID card component)
- /components/identity-banner.tsx (new — agent page status bar)
- /app/profile/page.tsx (replace empty page with full identity UI)
- /app/agent/page.tsx (add identity banner at top)
- /components/sidebar.tsx (add identity display at bottom)
- /providers/web3-provider.tsx (add ENS resolution + IdentityContext)

---

## Notes
- All credential data stored in localStorage — no backend needed
- Mock signature is fine for demo — add comment explaining production 
  would use eth_signTypedData (EIP-712)
- The 5-step purchase modal is the most important visual — 
  make it look impressive, this is what judges will see
- Add a // TODO: replace with real EIP-712 wallet signature comment 
  in generateCredential()
- App must run with zero errors on npm run dev