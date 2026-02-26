import { readFileSync } from "fs";
import { z } from "zod";
import { resolvePath } from "../repo-context.js";

export const readFileSchema = z.object({
  path: z.string().describe("File path relative to repo root"),
});

export async function readFile(args: { path: string }): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  const filePath = resolvePath(args.path);
  const content = readFileSync(filePath, "utf-8");
  return {
    content: [{ type: "text" as const, text: content }],
  };
}
