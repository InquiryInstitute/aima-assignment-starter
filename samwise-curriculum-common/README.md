# samwise-curriculum-common

MCP server exposing curriculum tools for SAMWISE in Codespaces. Runs in each curriculum Codespace and provides tools to list directories, read files, search exercises, and get lecture info.

## Tools

| Tool | Purpose |
|------|---------|
| `curriculum_list_dir` | List directory contents (path relative to repo root) |
| `curriculum_read_file` | Read file contents |
| `curriculum_search_exercises` | Search exercises-index.json by chapter, id, or keyword |
| `curriculum_get_lecture` | Return lecture info from lectures.json by lecture number |
| `curriculum_get_resources` | Return resources section from lectures.json |

## Usage

```bash
# From a curriculum repo (e.g. samwise-aima)
npx @inquiryinstitute/samwise-curriculum-server --port 9324
# or
PORT=9324 npx @inquiryinstitute/samwise-curriculum-server
```

## Environment

- `PORT` - Server port (default: 9324)
- `REPO_ROOT` - Repo root for file operations (default: `process.cwd()`)
- `SUPABASE_JWT_SECRET` - When set, requires `Authorization: Bearer <token>` on requests. When unset, no auth (dev mode).

## Auth

The curriculum page stores the Supabase `access_token` in `localStorage` under `samwise_api_token`. SAMWISE reads this and sends it as `Authorization: Bearer <token>` when calling the MCP server.

## Cursor MCP Config

Add to `.cursor/mcp.json` or project config:

```json
{
  "mcpServers": {
    "samwise-curriculum": {
      "url": "http://localhost:9324/mcp",
      "transport": "streamable-http"
    }
  }
}
```
