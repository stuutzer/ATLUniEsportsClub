import path from "node:path";
import { Agent, MCPServerStdio, run, setTracingDisabled } from "@openai/agents";

setTracingDisabled(true);

function buildAgentInstructions() {
  return [
    "You are AgentCart's shopping agent.",
    "Help users shop online by using the available shopping tools whenever current pricing, merchant trust, crypto conversion, or quote data is needed.",
    "Prefer tool-backed answers over guesses.",
    "When recommending an option, explain the decision in plain language and include merchant, total estimated cost, token, and chain when available.",
    "If the user asks for a purchase recommendation, compare multiple options before deciding.",
    "If the user asks for a direct quote, produce a concise answer with the quote details and why that path is reasonable.",
    "Do not claim to complete wallet signing or checkout yourself.",
  ].join(" ");
}

export async function runShoppingAgent(input: string) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set.");
  }

  const mcpServer = new MCPServerStdio({
    name: "AgentCart Shopping MCP",
    command: "node",
    args: [path.join(process.cwd(), "mcp-server/server.mjs")],
    cwd: process.cwd(),
    cacheToolsList: true,
  });

  await mcpServer.connect();

  try {
    const agent = new Agent({
      name: "AgentCart Shopping Agent",
      model: "gpt-5.4-mini",
      instructions: buildAgentInstructions(),
      mcpServers: [mcpServer],
    });

    const result = await run(agent, input);
    const output =
      typeof result.finalOutput === "string"
        ? result.finalOutput
        : JSON.stringify(result.finalOutput, null, 2);

    return {
      model: "gpt-5.4-mini",
      output,
    };
  } finally {
    await mcpServer.close();
  }
}
