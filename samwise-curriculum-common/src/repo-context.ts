import { readFileSync, existsSync } from "fs";
import { join, resolve, relative } from "path";

const REPO_ROOT = process.env.REPO_ROOT || process.cwd();

export function getRepoRoot(): string {
  return resolve(REPO_ROOT);
}

export function resolvePath(relativePath: string): string {
  const root = getRepoRoot();
  const resolved = resolve(root, relativePath.replace(/^\//, ""));
  if (!resolved.startsWith(root)) {
    throw new Error("Path traversal not allowed");
  }
  return resolved;
}

export function loadLectures(): unknown {
  const path = join(getRepoRoot(), "lectures.json");
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf-8"));
}

export function loadExercisesIndex(): unknown {
  const path = join(getRepoRoot(), "exercises-index.json");
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf-8"));
}
