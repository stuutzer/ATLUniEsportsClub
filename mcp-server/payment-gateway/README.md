# Quarter Payment Gateway MCP Server

Official MCP SDK server for cross-chain crypto-to-fiat payment orchestration.

## Run

```bash
npm run mcp:payments
```

## Required Environment

```bash
AVALANCHE_ESCROW_ADDRESS=0x...
AVALANCHE_USDC_ADDRESS=0x...
OFFRAMP_SETTLEMENT_WALLET=0x...
```

## Optional Environment

```bash
AVALANCHE_RPC_URL=https://api.avax.network/ext/bc/C/rpc
SWAPKIT_API_BASE_URL=https://api.swapkit.dev
SWAPKIT_API_KEY=...
SQUID_API_BASE_URL=https://apiplus.squidrouter.com
SQUID_API_KEY=...
CIRCLE_API_BASE_URL=https://api.circle.com
CIRCLE_API_KEY=...
CIRCLE_PAYOUT_PATH=/v1/businessAccount/payouts
STRIPE_API_BASE_URL=https://api.stripe.com
STRIPE_SECRET_KEY=...
STRIPE_CRYPTO_PAYOUT_PATH=/v1/crypto/payouts
```

Provider payout paths are configurable because Circle and Stripe account capabilities vary by program and environment.

## Tools

- `create_cross_chain_quote`: returns route data and Avalanche settlement calldata for native BTC/ETH into Avalanche USDC.
- `monitor_avalanche_payment`: polls `PaymentRegistered(orderId)` on the escrow/router contract.
- `trigger_fiat_offramp`: submits an idempotent Circle/Stripe payout request after Avalanche settlement confirmation.

## MCP Client Config

```json
{
  "mcpServers": {
    "quarter-payment-gateway": {
      "command": "npm",
      "args": ["run", "mcp:payments"],
      "env": {
        "AVALANCHE_ESCROW_ADDRESS": "0x...",
        "AVALANCHE_USDC_ADDRESS": "0x...",
        "OFFRAMP_SETTLEMENT_WALLET": "0x..."
      }
    }
  }
}
```
