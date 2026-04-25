const balances = [
  { token: "ETH", amount: "0.42 ETH", usd: "$1,345.20" },
  { token: "AVAX", amount: "18.50 AVAX", usd: "$518.00" },
  { token: "USDC", amount: "312.00 USDC", usd: "$312.00" },
];

export default function WalletPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-8">Wallet</h1>

      {/* Balance cards */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {/* TODO: connect MetaMask wallet */}
        {balances.map(({ token, amount, usd }) => (
          <div key={token} className="rounded-xl bg-[#1c1c1c] border border-white/5 p-5">
            <p className="text-white/40 text-xs uppercase tracking-widest mb-3">{token}</p>
            <p className="text-white font-bold text-2xl mb-1">{amount}</p>
            <p className="text-white/40 text-sm">{usd}</p>
          </div>
        ))}
      </div>

      {/* Transaction history — column headers only */}
      <div className="rounded-xl bg-[#1c1c1c] border border-white/5 overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5">
          <p className="text-white/40 text-xs uppercase tracking-widest">Transaction History</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left px-5 py-3 text-white/30 font-normal text-xs">Date</th>
              <th className="text-left px-5 py-3 text-white/30 font-normal text-xs">Type</th>
              <th className="text-left px-5 py-3 text-white/30 font-normal text-xs">Item</th>
              <th className="text-right px-5 py-3 text-white/30 font-normal text-xs">Amount</th>
              <th className="text-right px-5 py-3 text-white/30 font-normal text-xs">Status</th>
            </tr>
          </thead>
          <tbody>
            {/* TODO: populate with real transaction data */}
          </tbody>
        </table>
        <div className="px-5 py-10 text-center text-white/20 text-sm">No transactions yet</div>
      </div>
    </div>
  );
}
