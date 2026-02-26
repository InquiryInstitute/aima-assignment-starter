import { Request, Response } from "express";
import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { validateToken } from "./auth.js";
import * as listDir from "./tools/list-dir.js";
import * as readFile from "./tools/read-file.js";
import * as searchExercises from "./tools/search-exercises.js";
import * as getLecture from "./tools/get-lecture.js";
import * as getResources from "./tools/get-resources.js";

function createServer(): McpServer {
  const server = new McpServer(
    { name: "samwise-curriculum", version: "1.0.0" },
    { capabilities: { tools: {} } }
  );

  server.registerTool(
    "curriculum_list_dir",
    {
      description: "List directory contents (path relative to repo root). Scoped to repo.",
      inputSchema: listDir.listDirSchema,
    },
    listDir.listDir
  );

  server.registerTool(
    "curriculum_read_file",
    {
      description: "Read file contents. Path traversal blocked.",
      inputSchema: readFile.readFileSchema,
    },
    readFile.readFile
  );

  server.registerTool(
    "curriculum_search_exercises",
    {
      description: "Search exercises-index.json by chapter, id, or keyword.",
      inputSchema: searchExercises.searchExercisesSchema,
    },
    searchExercises.searchExercises
  );

  server.registerTool(
    "curriculum_get_lecture",
    {
      description: "Return lecture info from lectures.json by lecture number.",
      inputSchema: getLecture.getLectureSchema,
    },
    getLecture.getLecture
  );

  server.registerTool(
    "curriculum_get_resources",
    {
      description: "Return resources section from lectures.json (URLs, repo paths).",
      inputSchema: getResources.getResourcesSchema,
    },
    getResources.getResources
  );

  return server;
}

const TOOL_HANDLERS: Record<string, (args: unknown) => Promise<{ content: Array<{ type: "text"; text: string }> }>> = {
  curriculum_list_dir: (a) => listDir.listDir(a as { path: string }),
  curriculum_read_file: (a) => readFile.readFile(a as { path: string }),
  curriculum_search_exercises: (a) => searchExercises.searchExercises(a as { chapter?: string; canonicalId?: string; keyword?: string }),
  curriculum_get_lecture: (a) => getLecture.getLecture(a as { lecture: number }),
  curriculum_get_resources: () => getResources.getResources(),
};

export function createApp() {
  const app = express();
  app.use(express.json());

  const mcpHandler = async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    const valid = await validateToken(authHeader);
    if (!valid) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const server = createServer();
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
    await server.connect(transport);
    try {
      await transport.handleRequest(req, res, req.body);
    } finally {
      res.on("close", () => {
        transport.close();
        server.close();
      });
    }
  };

  app.post("/mcp", mcpHandler);

  /** REST API for tool calls (used by pupil server to proxy curriculum tools). */
  app.post("/api/tool", async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    const valid = await validateToken(authHeader);
    if (!valid) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const { tool, arguments: args } = req.body ?? {};
    if (!tool || typeof tool !== "string") {
      res.status(400).json({ error: "Missing tool name" });
      return;
    }
    const handler = TOOL_HANDLERS[tool];
    if (!handler) {
      res.status(400).json({ error: `Unknown tool: ${tool}` });
      return;
    }
    try {
      const result = await handler(args ?? {});
      res.json(result);
    } catch (err) {
      res.status(500).json({
        content: [{ type: "text" as const, text: `Error: ${(err as Error).message}` }],
      });
    }
  });

  app.get("/mcp", (req: Request, res: Response) => {
    res.status(405).json({ error: "Method not allowed" });
  });

  app.delete("/mcp", (req: Request, res: Response) => {
    res.status(405).json({ error: "Method not allowed" });
  });

  return app;
}
