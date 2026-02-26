import { z } from "zod";
import { loadLectures } from "../repo-context.js";

export const getLectureSchema = z.object({
  lecture: z.number().describe("Lecture number (1-based)"),
});

export async function getLecture(args: { lecture: number }): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  const data = loadLectures() as { lectures?: Array<Record<string, unknown>> } | null;
  if (!data?.lectures) {
    return { content: [{ type: "text", text: "lectures.json not found" }] };
  }
  const lecture = data.lectures.find((l) => (l.lecture as number) === args.lecture);
  if (!lecture) {
    return { content: [{ type: "text", text: `Lecture ${args.lecture} not found` }] };
  }
  return {
    content: [{ type: "text", text: JSON.stringify(lecture, null, 2) }],
  };
}
