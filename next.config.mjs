/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["via.placeholder.com", "placeholder.com"],
  },
  // Speed up dev compilation by skipping packages that only run in Node/React Native
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "@react-native-async-storage/async-storage": false,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
  // Tell Next.js to tree-shake these heavy packages rather than bundling everything
  experimental: {
    optimizePackageImports: ["wagmi", "viem", "@wagmi/connectors"],
  },
};

export default nextConfig;
