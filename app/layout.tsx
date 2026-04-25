import type { Metadata } from "next";
import "./globals.css";
import dynamic from "next/dynamic";
import { Sidebar } from "@/components/sidebar";

const Web3Provider = dynamic(
  () => import("@/providers/web3-provider").then((m) => m.Web3Provider),
  { ssr: false }
);

export const metadata: Metadata = {
  title: "AgentCart — Your AI Agent. Your Wallet. Every Purchase.",
  description: "Web3 AI Marketplace powered by autonomous shopping agents",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0a0a0a] text-white antialiased">
        <Web3Provider>
          <Sidebar />
          <main className="ml-[300px] min-h-screen">{children}</main>
        </Web3Provider>
      </body>
    </html>
  );
}
