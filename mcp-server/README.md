# AgentCart Shopping MCP Server

This MCP server exposes a mocked shopping backend over stdio for hackathon demos.

## Run

```bash
npm run mcp:shopping
```

## Tools

- `search_products`
- `compare_prices`
- `convert_price`
- `estimate_network_fee`
- `verify_merchant`
- `rank_purchase_options`
- `create_purchase_quote`
- `get_catalog_snapshot`

## Dashboard integration

The same mocked backend is also available to the Next.js app through:

- `GET /api/shopping/search`
- `POST /api/shopping/rank`
- `POST /api/shopping/quote`

## Example MCP client config

```json
{
  "mcpServers": {
    "agentcart-shopping": {
      "command": "node",
      "args": [
        "/home/uniccx/Documents/ATLUniEsportsClub/mcp-server/server.mjs"
      ]
    }
  }
}
```

## Notes

- All catalog, merchant, pricing, FX, and gas values are mocked.
- Wallet signing should stay in the dashboard; this server only returns structured shopping intelligence and quotes.
