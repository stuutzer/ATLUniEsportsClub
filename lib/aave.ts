export const AVALANCHE_USDC_ADDRESS = "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E";
export const AAVE_V3_AVALANCHE_POOL_ADDRESS = "0x794a61358D6845594F94dc1DB02A252b5b4814aD";

export const AAVE_TARGET_APY = 5.2;
export const IDLE_WINDOW_HOURS = 24;

export const aavePoolAbi = [
  {
    inputs: [
      { internalType: "address", name: "asset", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "address", name: "onBehalfOf", type: "address" },
      { internalType: "uint16", name: "referralCode", type: "uint16" },
    ],
    name: "supply",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
