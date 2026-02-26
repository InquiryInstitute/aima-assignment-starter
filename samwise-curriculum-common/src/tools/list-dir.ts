import { readdirSync } from "fs";
import { z } from "zod";
import { resolvePath } from "../repo-context.js";

export const listDirSchema = z.object({
  path: z.string().describe("Directory path relative to repo root (e.g. 'aima-python' or '.')"),
});

export async function listDir(args: { path: string }): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  const dirPath = resolvePath(args.path || ".");
  const entries = readdirSync(dirPath, { withFileTypes: true });
  const lines = entries.map((e) => {
    const suffix = e.isDirectory() ? "/" : "";
    return `${e.name}${suffix}`;
  });
  return {
    content: [{ type: "text" as const, text: lines.join("\n") || "(empty)" }],
  };
}
