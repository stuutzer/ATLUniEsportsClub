Add auto-generated PDF invoices to AgentCart using @react-pdf/renderer.

1. Install: npm install @react-pdf/renderer

2. Create /components/invoice-pdf.tsx:
   - A React PDF document component
   - Dark themed invoice (or white for print-friendliness)
   - Shows: AgentCart logo text, invoice number (random), 
     agent ENS name, user ENS name, merchant name,
     item name, amount in crypto, network fee, total,
     transaction hash, timestamp, "CONFIRMED" status stamp
   - Footer: "Generated autonomously by AgentCart AI Agent"

3. In /components/order-tracking-modal.tsx:
   - After status shows "delivered" or any completed state
   - Add "Download Invoice" button in modal footer
   - On click: use pdf() from @react-pdf/renderer to 
     generate and trigger browser download of the PDF
   - Filename: "agentcart-invoice-[txn_id].pdf"

4. In /app/wallet/page.tsx transaction cards:
   - Add a small download icon on each transaction row
   - On click: generates and downloads invoice for that transaction

App must run with zero errors on npm run dev.