import type { Metadata } from "next";
import "./globals.css";
import dynamic from "next/dynamic";
import { Sidebar } from "@/components/sidebar";
import { AgentProvider } from "@/context/AgentContext";

const Web3Provider = dynamic(
  () => import("@/providers/web3-provider").then((m) => m.Web3Provider),
  { ssr: false }
);

export const metadata: Metadata = {
  title: "Quarter — Your AI Shopping Agent",
  description: "Quarter is your personal AI shopping agent. Tell it what you want; it finds, compares, and checks out for you.",
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
          <AgentProvider>
            <Sidebar />
            <main className="ml-[260px] min-h-screen">{children}</main>
          </AgentProvider>
        </Web3Provider>
      </body>
    </html>
  );
}
