# Simulador de Certificación Anthropic — RockingData

Herramienta interna de RockingData para prepararse para el examen **Claude Certified Architect – Foundations**. Simula el formato del examen real: preguntas de opción múltiple, cronómetro, y explicaciones con links a la documentación oficial.

## ¿De qué trata el examen?

El examen valida que podés tomar decisiones informadas sobre tradeoffs al implementar soluciones reales con Claude. No es un quiz de trivia — las preguntas son escenarios de producción con 4 opciones donde debés identificar la respuesta arquitectónicamente correcta.

**Formato:**
- Múltiple choice, siempre 1 respuesta correcta de 4 opciones
- Puntaje mínimo para aprobar: **720/1000** (escala de 100 a 1000)
- 4 escenarios aleatorios de un pool de 6, con múltiples preguntas cada uno

**Dominios evaluados:**

| Dominio | Peso |
|---|---|
| Agentic Architecture & Orchestration | 27% |
| Prompt Engineering & Structured Output | 20% |
| Claude Code Configuration & Workflows | 20% |
| Tool Design & MCP Integration | 18% |
| Context Management & Reliability | 15% |

**Temas fuera del examen:** fine-tuning, autenticación/billing de API, Constitutional AI, RLHF, computer use, streaming, rate limiting, infraestructura de MCP servers.

---

## Cómo usar el simulador

### Opción 1 — Online (GitHub Pages)

Entrá directo desde el browser: **https://lautaroppaniagua.github.io/AnthropicCertification/**

### Opción 2 — Local

```bash
git clone https://github.com/TODO/AnthropicCertification
cd AnthropicCertification
python3 -m http.server 8743
```

Abrí `http://localhost:8743` en tu browser.

> **Nota:** No abras `index.html` directamente con doble click — los browsers bloquean scripts locales por seguridad. Necesitás el servidor HTTP.

---

## Cómo funciona el simulador

- Las preguntas se **aleatorizan** en cada intento (orden y opciones)
- Confirmás cada respuesta individualmente
- Al confirmar aparece la **explicación** del por qué es correcta y un link a la documentación oficial
- El **cronómetro** corre desde que empezás hasta que enviás el examen
- Al finalizar: puntaje, porcentaje, tiempo, y si aprobaste (≥ 70%)
- Podés repasar todas las respuestas antes de salir

Las preguntas tienen dos tipos:

| Badge | Significado |
|---|---|
| ✓ **Pregunta oficial** | Tomada textualmente del Exam Guide oficial de Anthropic |
| ⚠ **Pregunta experimental** | Generada por el equipo basándose en el material oficial |

---

## Cómo agregar preguntas

Editá únicamente el archivo `questions.js`. Cada pregunta sigue este esquema:

```js
{
  id: "q13",           // ID único, seguir la numeración
  official: false,     // true = del PDF oficial, false = experimental
  question: "...",     // Texto de la pregunta (en inglés, como el examen real)
  options: [
    "Opción A",
    "Opción B",
    "Opción C",
    "Opción D"
  ],
  correct: [1],        // Índice 0-based de la respuesta correcta
  explanation: "...",  // Por qué es correcta (y por qué las otras no)
  doc_link: "https://docs.anthropic.com/..."  // Link a la doc oficial
}
```

**Tips para escribir buenas preguntas:**
- Basalas en escenarios de producción concretos, no en definiciones abstractas
- Los distractores deben ser plausibles — que un candidato con conocimiento incompleto los elija
- La explicación debe explicar por qué cada opción incorrecta falla, no solo por qué la correcta es correcta

---

## Material de estudio recomendado

El examen se enfoca en estas tecnologías:

- **Claude Agent SDK** — Agentic loops, `stop_reason`, hooks (`PostToolUse`), subagents via `Task` tool
- **Model Context Protocol (MCP)** — Tool descriptions, `isError` flag, `.mcp.json`, `tool_choice`
- **Claude Code** — `CLAUDE.md` hierarchy, `.claude/rules/` con glob patterns, `.claude/commands/`, plan mode vs direct execution, `-p` flag para CI
- **Claude API** — `tool_use` con JSON schemas, `tool_choice` ("auto"/"any"/forced), Message Batches API
- **Prompt Engineering** — Few-shot prompting, structured output, retry-with-feedback loops

Documentación oficial: [docs.anthropic.com](https://docs.anthropic.com)

El PDF del Exam Guide está en la carpeta `recursos/` de este repositorio.

---

## Contribuir

Pull requests bienvenidos. Si encontrás una pregunta con respuesta incorrecta o explicación mejorable, abrí un issue o mandá el fix directamente.
