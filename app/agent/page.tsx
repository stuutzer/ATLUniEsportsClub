import { AgentConsole } from "@/components/agent-console";
import { IdentityBanner } from "@/components/identity-banner";

export default function AgentPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <AgentConsole />
    </div>
  );
}
