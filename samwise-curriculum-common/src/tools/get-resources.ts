import { z } from "zod";
import { loadLectures } from "../repo-context.js";

export const getResourcesSchema = z.object({});

export async function getResources(): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  const data = loadLectures() as { resources?: Record<string, unknown>; curriculum?: string } | null;
  if (!data?.resources) {
    return { content: [{ type: "text", text: "lectures.json not found or has no resources" }] };
  }
  const out = { curriculum: data.curriculum, ...data.resources };
  return {
    content: [{ type: "text", text: JSON.stringify(out, null, 2) }],
  };
}
