# AIMA Assignment (with MCP Tools)

AIMA assignment template with **MCP (Model Context Protocol)** tools for Cursor/Codespaces. When you open this in GitHub Codespaces, the curriculum MCP server runs automatically so AI assistants can search exercises, read lectures, and browse files.

## Features

- **MCP curriculum tools** — `curriculum_search_exercises`, `curriculum_read_file`, `curriculum_get_lecture`, etc.
- **Dev container** — Node 20, Python 3.11, auto-starts MCP server on port 9324
- **Cursor integration** — `.cursor/mcp.json` preconfigured for the curriculum server

## Setup

1. **GitHub Codespaces:** Open this repo in Codespaces. The MCP server starts automatically.
2. **Cursor (local):** Clone the repo, run `npm install`, then `cd samwise-curriculum-common && npm run build`, and start the server:
   ```bash
   npx samwise-curriculum-server --port 9324
   ```
   Keep it running; Cursor will connect via `.cursor/mcp.json`.

## Structure

- `exercises/` — Written exercise answers (Markdown)
- `search.py`, `games.py`, etc. — Python implementations
- `lectures.json`, `exercises-index.json` — Curriculum data for MCP tools

## Resources

- [AIMA Exercises](https://aimacode.github.io/aima-exercises/)
- [AIMA Python](https://github.com/aimacode/aima-python)
