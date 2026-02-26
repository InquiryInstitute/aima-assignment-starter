#!/usr/bin/env node
import { createApp } from "../server.js";

let portFromArg: number | undefined;
const portIdx = process.argv.indexOf("--port");
if (portIdx >= 0 && process.argv[portIdx + 1]) {
  portFromArg = parseInt(process.argv[portIdx + 1], 10);
} else {
  const portEq = process.argv.find((a) => a.startsWith("--port="));
  portFromArg = portEq ? parseInt(portEq.split("=")[1], 10) : undefined;
}
const PORT = portFromArg || parseInt(process.env.PORT || "9324", 10);
const app = createApp();

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Curriculum MCP server http://0.0.0.0:${PORT}`);
  console.log(`  MCP endpoint: http://localhost:${PORT}/mcp`);
});
