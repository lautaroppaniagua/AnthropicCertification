# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Purpose

Static single-page exam simulator for the **Claude Certified Architect – Foundations** certification. Deployed on GitHub Pages — no build step, no backend, no dependencies.

## Dev Commands

```bash
# Serve locally (required for fetch — do not open index.html directly)
python3 -m http.server 8743

# Deploy: push to GitHub, then Settings → Pages → Branch: main, Folder: /
```

## Architecture

Four files, zero dependencies:

| File | Role |
|---|---|
| `index.html` | Shell — loads `questions.js` then `app.js` |
| `questions.js` | Global `var QUESTIONS = [...]` — the entire question bank |
| `styles.css` | All styling with CSS custom properties for theming |
| `app.js` | All quiz logic: state, shuffle, timer, rendering |

**Why `questions.js` and not `questions.json`:** A plain JS file with a global variable works with `file://` protocol and GitHub Pages without CORS issues. No `fetch()` needed.

**Rendering:** The entire UI is built by string-concatenating HTML into `document.getElementById('app').innerHTML`. All user-visible strings are passed through `escapeHtml()` before insertion.

**State object** (in `app.js`):
```js
{
  questions: [],      // shuffled questions with shuffled options
  current: 0,
  answers: {},        // { questionId: [selectedOptionIndices] }
  confirmed: {},      // { questionId: true }
  elapsed: 0,
  timerInterval: null
}
```

**Question lifecycle:** `init()` → `renderStart()` → `startExam()` → `renderQuestion(i)` (loop via `navigate()`, `toggleAnswer()`, `confirmAnswer()`) → `showResults()`.

## Question Schema

```js
{
  id: "q1",               // unique string
  question: "...",        // question text (English)
  options: ["A", "B", "C", "D", "E"],  // 4–5 options
  correct: [0],           // 0-based indices of correct options
  explanation: "...",     // shown after confirming answer
  doc_link: "https://..." // optional link to official docs
}
```

**Multi-answer detection:** `correct.length > 1` → labels options "Respuesta múltiple". Currently the real exam always has exactly 4 options and a single correct answer — reflect that in new questions.

## About the Actual Exam

From `recursos/Claude Certified Architect – Foundations Certification Exam Guide.pdf`:

- **Format:** Multiple choice, always 1 correct answer + 3 distractors (A–D)
- **Passing score:** 720/1000 (scaled) — roughly 72%
- **Scenarios:** 4 randomly selected from 6; each scenario frames multiple questions

**Domain weights (use to prioritize question coverage):**

| Domain | Weight |
|---|---|
| 1. Agentic Architecture & Orchestration | 27% |
| 2. Tool Design & MCP Integration | 18% |
| 3. Claude Code Configuration & Workflows | 20% |
| 4. Prompt Engineering & Structured Output | 20% |
| 5. Context Management & Reliability | 15% |

**Key topics per domain (ground questions here, not generic Claude facts):**

- **D1:** Agentic loop (`stop_reason` "tool_use" vs "end_turn"), multi-agent hub-and-spoke, `Task` tool for spawning subagents, hooks (`PostToolUse`), session resumption/forking
- **D2:** Tool description quality, `isError` flag, `tool_choice` ("auto"/"any"/forced), MCP scoping (`.mcp.json` vs `~/.claude.json`), built-in tools (Grep vs Glob vs Read/Edit/Write)
- **D3:** CLAUDE.md hierarchy (user/project/directory), `@import`, `.claude/rules/` with glob frontmatter, `.claude/commands/` vs `~/.claude/commands/`, plan mode vs direct execution, `-p` flag for CI
- **D4:** Explicit criteria over vague instructions, few-shot examples for consistency, `tool_choice: "any"` for guaranteed structured output, JSON schema optional fields, Message Batches API (50% savings, 24h window, no SLA)
- **D5:** "Lost in the middle" effect, progressive summarization risks, scratchpad files, structured handoffs, escalation triggers, error propagation with structured context

## Adding Questions

Edit only `questions.js`. Each new question should:
1. Have a unique `id` (e.g., `"q13"`)
2. Be scenario-grounded (production context, not abstract definitions)
3. Have exactly 4 options matching the real exam format
4. Have `correct: [n]` (single answer)
5. Link `doc_link` to `docs.anthropic.com` where applicable

## Theming

CSS custom properties defined in `:root` (light) and `[data-theme="dark"]`. Theme toggled via `toggleTheme()` in `app.js`, persisted in `localStorage`. The toggle button is rendered in the exam header and start screen.
