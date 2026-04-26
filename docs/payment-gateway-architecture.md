# Crypto-to-Fiat Payment Gateway Architecture

This design uses the MCP server as the backend orchestrator for cross-chain payment routing, Avalanche settlement, and fiat off-ramping. The current app demo uses Avalanche Fuji Testnet test AVAX; this gateway document describes the production-style crypto-to-fiat route.

## Components

1. **Frontend checkout**
   - Collects `orderId`, merchant payout profile, and the user's source asset (`BTC` on Bitcoin or `ETH` on Ethereum).
   - Calls the MCP tool `create_cross_chain_quote` to get a route from the source asset into Avalanche USDC.
   - Presents the cross-chain route, estimated fees, expiry, recipient contract, and settlement calldata to the user.
   - The user signs the source-chain transaction directly in their wallet.

2. **Cross-chain liquidity API**
   - SwapKit/THORChain or Squid Router returns an executable route.
   - Preferred route behavior is native source asset -> bridged/swapped USDC on Avalanche -> contract call to `payOrder`.
   - If a provider cannot perform a destination contract call, it should deliver USDC to the escrow contract and the MCP server must reconcile with `recordBridgedPayment` after verifying source and destination transaction evidence.

3. **Avalanche escrow/router contract**
   - Receives Avalanche USDC.
   - Registers payment by `orderId`.
   - Holds funds until the off-ramp flow is ready.
   - Releases USDC only to an allowlisted off-ramp settlement wallet or refunds the payer via an operator-controlled path.

4. **Payment MCP server**
   - Exposes tools for quote creation, Avalanche payment monitoring, and fiat off-ramp initiation.
   - Uses `viem` for Avalanche reads and contract calldata generation.
   - Uses idempotency keys for off-ramp calls.
   - Treats cross-chain settlement as asynchronous and polls with explicit timeout handling.

5. **Off-ramp provider**
   - Circle or Stripe receives released USDC from the escrow contract/off-ramp wallet.
   - Provider converts USDC to USD and initiates ACH/wire to the merchant bank account.
   - MCP stores provider status externally in production; this scaffold returns structured provider references for later persistence.

## Sequence

```text
Frontend
  -> MCP create_cross_chain_quote(orderId, source asset, merchant)
  -> Cross-chain API quote route
  <- route + destination contract + calldata

User wallet
  -> signs native BTC/ETH payment route

Cross-chain router
  -> bridges/swaps into Avalanche USDC
  -> calls AvalanchePaymentEscrowRouter.payOrder(...)

MCP monitor_avalanche_payment
  -> polls PaymentRegistered(orderId) on Avalanche
  <- paid amount, merchant, payer, tx hash

MCP trigger_fiat_offramp
  -> asks escrow operator to release USDC to off-ramp settlement wallet
  -> calls Circle/Stripe payout API with idempotency key
  <- payout/wire/ACH reference
```

## Production Notes

- Do not trust quote metadata alone. Confirm the Avalanche `PaymentRegistered` event before triggering any fiat payout.
- Use a persistent database for `orderId`, quote expiry, source transaction hash, destination transaction hash, payout reference, and retry state.
- Require allowlisted merchant payout profiles. Never accept raw bank details through an MCP tool.
- Run the MCP server behind authenticated infrastructure. MCP tools can trigger financial side effects.
- For BTC routes, prefer SwapKit/THORChain-style providers that support native BTC deposits. For EVM-only routing, use Squid for Ethereum-native ETH routes.
- Off-ramp APIs differ by account configuration. Keep provider paths configurable and use idempotency keys for every payout request.
