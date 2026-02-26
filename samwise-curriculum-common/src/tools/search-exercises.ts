import { z } from "zod";
import { loadExercisesIndex } from "../repo-context.js";

export const searchExercisesSchema = z.object({
  chapter: z.string().optional().describe("Chapter number (e.g. '1', '6')"),
  canonicalId: z.string().optional().describe("Canonical exercise id (e.g. 'ch1ex1')"),
  keyword: z.string().optional().describe("Keyword to search in question excerpts"),
});

interface Exercise {
  chapterNum?: string;
  canonicalId?: string;
  title?: string;
  questionExcerpt?: string;
  path?: string;
  slug?: string;
}

export async function searchExercises(args: {
  chapter?: string;
  canonicalId?: string;
  keyword?: string;
}): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  const index = loadExercisesIndex() as { byChapter?: Record<string, Exercise[]> } | null;
  if (!index?.byChapter) {
    return { content: [{ type: "text", text: "exercises-index.json not found" }] };
  }

  let exercises: Exercise[] = [];
  if (args.canonicalId) {
    for (const chapterExs of Object.values(index.byChapter)) {
      const found = chapterExs.find((e) => e.canonicalId === args.canonicalId);
      if (found) {
        exercises = [found];
        break;
      }
    }
  } else if (args.chapter) {
    exercises = index.byChapter[args.chapter] || [];
  } else {
    exercises = Object.values(index.byChapter).flat();
  }

  if (args.keyword) {
    const kw = args.keyword.toLowerCase();
    exercises = exercises.filter(
      (e) =>
        (e.questionExcerpt?.toLowerCase().includes(kw)) ||
        (e.title?.toLowerCase().includes(kw)) ||
        (e.canonicalId?.toLowerCase().includes(kw))
    );
  }

  const lines = exercises.slice(0, 50).map((e) => {
    return `${e.canonicalId || "?"}: ${e.title || "?"} - ${(e.questionExcerpt || "").slice(0, 80)}...`;
  });
  const text =
    lines.length > 0
      ? lines.join("\n")
      : "No exercises found. Try different chapter, canonicalId, or keyword.";
  return { content: [{ type: "text", text }] };
}
