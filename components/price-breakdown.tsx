import { cn } from "@/lib/utils";

interface NetworkRow {
  network: string;
  token: string;
  amount: string;
  gasFee: string;
  total: string;
  cheapest?: boolean;
}

interface PriceBreakdownProps {
  basePrice: number;
}

export function calcBestCrypto(usdAmount: number): { amount: string; token: string } {
  const ethPrice = 2320;
  const avaxPrice = 9.30;

  const avaxTotal = usdAmount + 0.08;
  const usdcTotal = usdAmount + 0.50;
  const ethTotal  = usdAmount + 4.20;

  if (avaxTotal <= usdcTotal && avaxTotal <= ethTotal) {
    return { amount: (usdAmount / avaxPrice).toFixed(3), token: "AVAX" };
  } else if (usdcTotal <= ethTotal) {
    return { amount: usdAmount.toFixed(2), token: "USDC" };
  } else {
    return { amount: (usdAmount / ethPrice).toFixed(5), token: "ETH" };
  }
}

// TODO: Replace with real on-chain price feed and gas estimation
function calcRows(basePrice: number): NetworkRow[] {
  const ethPrice = 2320;
  const avaxPrice = 9.30;
  const usdcRate = 1;

  const ethGas = 4.2;
  const avaxGas = 0.08;

  const ethTotal = basePrice + ethGas;
  const avaxTotal = basePrice + avaxGas;
  const usdcTotal = basePrice + 0.5;

  const cheapestTotal = Math.min(ethTotal, avaxTotal, usdcTotal);

  return [
    {
      network: "Ethereum",
      token: "ETH",
      amount: (basePrice / ethPrice).toFixed(5),
      gasFee: `$${ethGas.toFixed(2)}`,
      total: `$${ethTotal.toFixed(2)}`,
      cheapest: ethTotal === cheapestTotal,
    },
    {
      network: "Avalanche",
      token: "AVAX",
      amount: (basePrice / avaxPrice).toFixed(3),
      gasFee: `$${avaxGas.toFixed(2)}`,
      total: `$${avaxTotal.toFixed(2)}`,
      cheapest: avaxTotal === cheapestTotal,
    },
    {
      network: "Any",
      token: "USDC",
      amount: (basePrice * usdcRate).toFixed(2),
      gasFee: "$0.50",
      total: `$${usdcTotal.toFixed(2)}`,
      cheapest: usdcTotal === cheapestTotal,
    },
  ];
}

export function PriceBreakdown({ basePrice }: PriceBreakdownProps) {
  const rows = calcRows(basePrice);

  return (
    <div className="rounded-xl overflow-hidden border border-white/10">
      <div className="px-4 py-3 bg-white/5 border-b border-white/10">
        <p className="text-white/60 text-xs uppercase tracking-widest">Price Breakdown</p>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/5">
            <th className="text-left px-4 py-2.5 text-white/40 font-normal text-xs">Network</th>
            <th className="text-right px-4 py-2.5 text-white/40 font-normal text-xs">Amount</th>
            <th className="text-right px-4 py-2.5 text-white/40 font-normal text-xs">Gas</th>
            <th className="text-right px-4 py-2.5 text-white/40 font-normal text-xs">Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.token}
              className={cn(
                "border-b border-white/5 last:border-0 transition-colors",
                row.cheapest ? "bg-green-500/5" : "hover:bg-white/3"
              )}
            >
              <td className="px-4 py-3 text-white/80">
                <div className="flex items-center gap-2">
                  {row.network}
                  {row.cheapest && (
                    <span className="text-xs text-green-400 font-medium bg-green-400/10 px-2 py-0.5 rounded-full">
                      Best
                    </span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 text-right text-white/60 font-mono text-xs">
                {row.amount} {row.token}
              </td>
              <td className="px-4 py-3 text-right text-white/50 text-xs">{row.gasFee}</td>
              <td
                className={cn(
                  "px-4 py-3 text-right font-semibold",
                  row.cheapest ? "text-green-400" : "text-white"
                )}
              >
                {row.total}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
