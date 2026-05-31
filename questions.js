var QUESTIONS = [
  // ── Scenario: Customer Support Resolution Agent ──────────────────────────

  {
    id: "q1",
    official: true,
    question: "Production data shows that in 12% of cases, your agent skips get_customer entirely and calls lookup_order using only the customer's stated name, occasionally leading to misidentified accounts and incorrect refunds. What change would most effectively address this reliability issue?",
    options: [
      "Add a programmatic prerequisite that blocks lookup_order and process_refund calls until get_customer has returned a verified customer ID.",
      "Enhance the system prompt to state that customer verification via get_customer is mandatory before any order operations.",
      "Add few-shot examples showing the agent always calling get_customer first, even when customers volunteer order details.",
      "Implement a routing classifier that analyzes each request and enables only the subset of tools appropriate for that request type."
    ],
    correct: [0],
    explanation: "When a specific tool sequence is required for critical business logic (like verifying customer identity before processing refunds), programmatic enforcement provides deterministic guarantees that prompt-based approaches cannot. Options B and C rely on probabilistic LLM compliance, which is insufficient when errors have financial consequences. Option D addresses tool availability rather than tool ordering, which is not the actual problem.",
    doc_link: "https://docs.anthropic.com/en/docs/build-with-claude/agents"
  },
  {
    id: "q2",
    official: true,
    question: "Production logs show the agent frequently calls get_customer when users ask about orders (e.g., 'check my order #12345'), instead of calling lookup_order. Both tools have minimal descriptions ('Retrieves customer information' / 'Retrieves order details') and accept similar identifier formats. What's the most effective first step to improve tool selection reliability?",
    options: [
      "Add few-shot examples to the system prompt demonstrating correct tool selection patterns, with 5–8 examples showing order-related queries routing to lookup_order.",
      "Expand each tool's description to include input formats it handles, example queries, edge cases, and boundaries explaining when to use it versus similar tools.",
      "Implement a routing layer that parses user input before each turn and pre-selects the appropriate tool based on detected keywords and identifier patterns.",
      "Consolidate both tools into a single lookup_entity tool that accepts any identifier and internally determines which backend to query."
    ],
    correct: [1],
    explanation: "Tool descriptions are the primary mechanism LLMs use for tool selection. When descriptions are minimal, models lack the context to differentiate between similar tools. Option B directly addresses this root cause with a low-effort, high-leverage fix. Few-shot examples (A) add token overhead without fixing the underlying issue. A routing layer (C) is over-engineered and bypasses the LLM's natural language understanding. Consolidating tools (D) is a valid architectural choice but requires more effort than a 'first step' warrants when the immediate problem is inadequate descriptions.",
    doc_link: "https://docs.anthropic.com/en/docs/build-with-claude/tool-use"
  },
  {
    id: "q3",
    official: true,
    question: "Your agent achieves 55% first-contact resolution, well below the 80% target. Logs show it escalates straightforward cases (standard damage replacements with photo evidence) while attempting to autonomously handle complex situations requiring policy exceptions. What's the most effective way to improve escalation calibration?",
    options: [
      "Add explicit escalation criteria to your system prompt with few-shot examples demonstrating when to escalate versus resolve autonomously.",
      "Have the agent self-report a confidence score (1–10) before each response and automatically route requests to humans when confidence falls below a threshold.",
      "Deploy a separate classifier model trained on historical tickets to predict which requests need escalation before the main agent begins processing.",
      "Implement sentiment analysis to detect customer frustration levels and automatically escalate when negative sentiment exceeds a threshold."
    ],
    correct: [0],
    explanation: "Adding explicit escalation criteria with few-shot examples directly addresses the root cause: unclear decision boundaries. This is the proportionate first response before adding infrastructure. Option B fails because LLM self-reported confidence is poorly calibrated. Option C is over-engineered, requiring labeled data and ML infrastructure when prompt optimization hasn't been tried. Option D solves a different problem entirely; sentiment doesn't correlate with case complexity, which is the actual issue.",
    doc_link: "https://docs.anthropic.com/en/docs/build-with-claude/agents"
  },

  // ── Scenario: Code Generation with Claude Code ───────────────────────────

  {
    id: "q4",
    official: true,
    question: "You want to create a custom /review slash command that runs your team's standard code review checklist. This command should be available to every developer when they clone or pull the repository. Where should you create this command file?",
    options: [
      "In the .claude/commands/ directory in the project repository",
      "In ~/.claude/commands/ in each developer's home directory",
      "In the CLAUDE.md file at the project root",
      "In a .claude/config.json file with a commands array"
    ],
    correct: [0],
    explanation: "Project-scoped custom slash commands should be stored in the .claude/commands/ directory within the repository. These commands are version-controlled and automatically available to all developers when they clone or pull the repo. Option B (~/.claude/commands/) is for personal commands that aren't shared via version control. Option C (CLAUDE.md) is for project instructions and context, not command definitions. Option D describes a configuration mechanism that doesn't exist in Claude Code.",
    doc_link: "https://docs.anthropic.com/en/docs/claude-code/slash-commands"
  },
  {
    id: "q5",
    official: true,
    question: "You've been assigned to restructure the team's monolithic application into microservices. This will involve changes across dozens of files and requires decisions about service boundaries and module dependencies. Which approach should you take?",
    options: [
      "Enter plan mode to explore the codebase, understand dependencies, and design an implementation approach before making changes.",
      "Start with direct execution and make changes incrementally, letting the implementation reveal the natural service boundaries.",
      "Use direct execution with comprehensive upfront instructions detailing exactly how each service should be structured.",
      "Begin in direct execution mode and only switch to plan mode if you encounter unexpected complexity during implementation."
    ],
    correct: [0],
    explanation: "Plan mode is designed for complex tasks involving large-scale changes, multiple valid approaches, and architectural decisions — exactly what monolith-to-microservices restructuring requires. It enables safe codebase exploration and design before committing to changes. Option B risks costly rework when dependencies are discovered late. Option C assumes you already know the right structure without exploring the code. Option D ignores that the complexity is already stated in the requirements, not something that might emerge later.",
    doc_link: "https://docs.anthropic.com/en/docs/claude-code/plan-mode"
  },
  {
    id: "q6",
    official: true,
    question: "Your codebase has distinct areas with different coding conventions: React components use functional style with hooks, API handlers use async/await with specific error handling, and database models follow a repository pattern. Test files are spread throughout the codebase alongside the code they test (e.g., Button.test.tsx next to Button.tsx), and you want all tests to follow the same conventions regardless of location. What's the most maintainable way to ensure Claude automatically applies the correct conventions when generating code?",
    options: [
      "Create rule files in .claude/rules/ with YAML frontmatter specifying glob patterns to conditionally apply conventions based on file paths",
      "Consolidate all conventions in the root CLAUDE.md file under headers for each area, relying on Claude to infer which section applies",
      "Create skills in .claude/skills/ for each code type that include the relevant conventions in their SKILL.md files",
      "Place a separate CLAUDE.md file in each subdirectory containing that area's specific conventions"
    ],
    correct: [0],
    explanation: "Option A is correct because .claude/rules/ with glob patterns (e.g., **/*.test.tsx) allows conventions to be automatically applied based on file paths regardless of directory location — essential for test files spread throughout the codebase. Option B relies on inference rather than explicit matching, making it unreliable. Option C requires manual skill invocation, contradicting the need for deterministic automatic application. Option D can't easily handle files spread across many directories since CLAUDE.md files are directory-bound.",
    doc_link: "https://docs.anthropic.com/en/docs/claude-code/memory"
  },

  // ── Scenario: Multi-Agent Research System ────────────────────────────────

  {
    id: "q7",
    official: true,
    question: "After running the system on the topic 'impact of AI on creative industries,' you observe that each subagent completes successfully: the web search agent finds relevant articles, the document analysis agent summarizes papers correctly, and the synthesis agent produces coherent output. However, the final reports cover only visual arts, completely missing music, writing, and film production. When you examine the coordinator's logs, you see it decomposed the topic into three subtasks: 'AI in digital art creation,' 'AI in graphic design,' and 'AI in photography.' What is the most likely root cause?",
    options: [
      "The synthesis agent lacks instructions for identifying coverage gaps in the findings it receives from other agents.",
      "The coordinator agent's task decomposition is too narrow, resulting in subagent assignments that don't cover all relevant domains of the topic.",
      "The web search agent's queries are not comprehensive enough and need to be expanded to cover more creative industry sectors.",
      "The document analysis agent is filtering out sources related to non-visual creative industries due to overly restrictive relevance criteria."
    ],
    correct: [1],
    explanation: "The coordinator's logs reveal the root cause directly: it decomposed 'creative industries' into only visual arts subtasks (digital art, graphic design, photography), completely omitting music, writing, and film. The subagents executed their assigned tasks correctly — the problem is what they were assigned. Options A, C, and D incorrectly blame downstream agents that are working correctly within their assigned scope.",
    doc_link: "https://docs.anthropic.com/en/docs/build-with-claude/agents"
  },
  {
    id: "q8",
    official: true,
    question: "The web search subagent times out while researching a complex topic. You need to design how this failure information flows back to the coordinator agent. Which error propagation approach best enables intelligent recovery?",
    options: [
      "Return structured error context to the coordinator including the failure type, the attempted query, any partial results, and potential alternative approaches.",
      "Implement automatic retry logic with exponential backoff within the subagent, returning a generic 'search unavailable' status only after all retries are exhausted.",
      "Catch the timeout within the subagent and return an empty result set marked as successful.",
      "Propagate the timeout exception directly to a top-level handler that terminates the entire research workflow."
    ],
    correct: [0],
    explanation: "Structured error context gives the coordinator the information it needs to make intelligent recovery decisions — whether to retry with a modified query, try an alternative approach, or proceed with partial results. Option B's generic status hides valuable context from the coordinator. Option C suppresses the error by marking failure as success, which prevents any recovery. Option D terminates the entire workflow unnecessarily when recovery strategies could succeed.",
    doc_link: "https://docs.anthropic.com/en/docs/build-with-claude/agents"
  },
  {
    id: "q9",
    official: true,
    question: "During testing, you observe that the synthesis agent frequently needs to verify specific claims while combining findings. Currently, when verification is needed, the synthesis agent returns control to the coordinator, which invokes the web search agent, then re-invokes synthesis with results. This adds 2–3 round trips per task and increases latency by 40%. Your evaluation shows that 85% of these verifications are simple fact-checks (dates, names, statistics) while 15% require deeper investigation. What's the most effective approach to reduce overhead while maintaining system reliability?",
    options: [
      "Give the synthesis agent a scoped verify_fact tool for simple lookups, while complex verifications continue delegating to the web search agent through the coordinator.",
      "Have the synthesis agent accumulate all verification needs and return them as a batch to the coordinator at the end of its pass, which then sends them all to the web search agent at once.",
      "Give the synthesis agent access to all web search tools so it can handle any verification need directly without round-trips through the coordinator.",
      "Have the web search agent proactively cache extra context around each source during initial research, anticipating what the synthesis agent might need to verify."
    ],
    correct: [0],
    explanation: "Option A applies the principle of least privilege: the synthesis agent gets only what it needs for the 85% common case (simple fact verification) while preserving the existing coordination pattern for complex cases. Option B's batching creates blocking dependencies since synthesis steps may depend on earlier verified facts. Option C over-provisions the synthesis agent, violating separation of concerns. Option D relies on speculative caching that cannot reliably predict what the synthesis agent will need.",
    doc_link: "https://docs.anthropic.com/en/docs/build-with-claude/agents"
  },

  // ── Scenario: Claude Code for Continuous Integration ─────────────────────

  {
    id: "q10",
    official: true,
    question: "Your pipeline script runs claude \"Analyze this pull request for security issues\" but the job hangs indefinitely. Logs indicate Claude Code is waiting for interactive input. What's the correct approach to run Claude Code in an automated pipeline?",
    options: [
      "Add the -p flag: claude -p \"Analyze this pull request for security issues\"",
      "Set the environment variable CLAUDE_HEADLESS=true before running the command",
      "Redirect stdin from /dev/null: claude \"Analyze this pull request for security issues\" < /dev/null",
      "Add the --batch flag: claude --batch \"Analyze this pull request for security issues\""
    ],
    correct: [0],
    explanation: "The -p (or --print) flag is the documented way to run Claude Code in non-interactive mode. It processes the prompt, outputs the result to stdout, and exits without waiting for user input — exactly what CI/CD pipelines require. The other options reference non-existent features (CLAUDE_HEADLESS environment variable, --batch flag) or use Unix workarounds that don't properly address Claude Code's command syntax.",
    doc_link: "https://docs.anthropic.com/en/docs/claude-code/cli-reference"
  },
  {
    id: "q11",
    official: true,
    question: "Your team wants to reduce API costs for automated analysis. Currently, real-time Claude calls power two workflows: (1) a blocking pre-merge check that must complete before developers can merge, and (2) a technical debt report generated overnight for review the next morning. Your manager proposes switching both to the Message Batches API for its 50% cost savings. How should you evaluate this proposal?",
    options: [
      "Use batch processing for the technical debt reports only; keep real-time calls for pre-merge checks.",
      "Switch both workflows to batch processing with status polling to check for completion.",
      "Keep real-time calls for both workflows to avoid batch result ordering issues.",
      "Switch both to batch processing with a timeout fallback to real-time if batches take too long."
    ],
    correct: [0],
    explanation: "The Message Batches API offers 50% cost savings but has processing times up to 24 hours with no guaranteed latency SLA. This makes it unsuitable for blocking pre-merge checks where developers wait for results, but ideal for overnight batch jobs like technical debt reports. Option B is wrong because relying on 'often faster' completion isn't acceptable for blocking workflows. Option C reflects a misconception — batch results can be correlated using custom_id fields. Option D adds unnecessary complexity.",
    doc_link: "https://docs.anthropic.com/en/docs/build-with-claude/message-batches"
  },
  {
    id: "q12",
    official: true,
    question: "A pull request modifies 14 files across the stock tracking module. Your single-pass review analyzing all files together produces inconsistent results: detailed feedback for some files but superficial comments for others, obvious bugs missed, and contradictory feedback — flagging a pattern as problematic in one file while approving identical code elsewhere in the same PR. How should you restructure the review?",
    options: [
      "Split into focused passes: analyze each file individually for local issues, then run a separate integration-focused pass examining cross-file data flow.",
      "Require developers to split large PRs into smaller submissions of 3–4 files before the automated review runs.",
      "Switch to a higher-tier model with a larger context window to give all 14 files adequate attention in one pass.",
      "Run three independent review passes on the full PR and only flag issues that appear in at least two of the three runs."
    ],
    correct: [0],
    explanation: "Splitting reviews into focused passes directly addresses the root cause: attention dilution when processing many files at once. File-by-file analysis ensures consistent depth, while a separate integration pass catches cross-file issues. Option B shifts burden to developers without improving the system. Option C misunderstands that larger context windows don't solve attention quality issues. Option D would actually suppress detection of real bugs by requiring consensus on issues that may only be caught intermittently.",
    doc_link: "https://docs.anthropic.com/en/docs/claude-code/overview"
  },

  // ── Scenario: Customer Support Resolution Agent (generated) ──────────────

  {
    id: "q13",
    official: false,
    question: "Company policy caps autonomous refunds at $500; anything higher must go to a human. Your system prompt instructs the agent never to exceed $500, but production logs show that when customers are persistent, the agent occasionally calls process_refund for amounts like $650. What is the most reliable way to guarantee the cap is enforced?",
    options: [
      "Add a tool-call interception hook that blocks any process_refund call above $500 and redirects the request to the escalate_to_human workflow.",
      "Strengthen the system prompt with capitalized, emphatic wording stating the $500 limit is absolute and must never be exceeded.",
      "Lower the model's temperature so it follows the policy instruction more deterministically.",
      "Add several few-shot examples showing the agent declining refunds above $500 and offering escalation instead."
    ],
    correct: [0],
    explanation: "When a business rule requires guaranteed compliance and the action has financial consequences, deterministic programmatic enforcement (a hook intercepting the outgoing tool call) is the only approach with a zero failure rate. Options B, C, and D all rely on probabilistic LLM compliance, which has a non-zero failure rate no matter how forceful the prompt or how many examples are added. Temperature does not make instruction-following deterministic.",
    doc_link: "https://code.claude.com/docs/en/hooks"
  },
  {
    id: "q14",
    official: false,
    question: "Your process_refund MCP tool returns the same generic '{\"error\": \"Operation failed\"}' for every failure. Logs show the agent repeatedly retries refunds that fail because the order is outside the 30-day return window — a fixed policy outcome that will never succeed. What change to the tool's error responses would most improve the agent's behavior?",
    options: [
      "Return structured error metadata including an errorCategory (e.g., business), an isRetryable: false flag, and a customer-friendly explanation of the policy.",
      "Add automatic retry with exponential backoff inside the tool so the agent does not have to retry manually.",
      "Increase the tool's timeout so the backend has more time to complete the refund successfully.",
      "Have the tool return an empty success response when the return window has passed so the agent stops retrying."
    ],
    correct: [0],
    explanation: "A business-rule violation is non-retryable. Returning structured error context (category, isRetryable: false, human-readable reason) lets the agent stop retrying and explain the outcome to the customer. Option B wastes retries on an error that can never succeed. Option C addresses transient failures, not a policy outcome. Option D silently masks failure as success — an anti-pattern that produces incorrect customer communication.",
    doc_link: "https://docs.claude.com/en/docs/agents-and-tools/tool-use/overview"
  },
  {
    id: "q15",
    official: false,
    question: "In a long multi-turn billing dispute, your context-management strategy summarizes older turns to save tokens. After several turns the agent quotes the disputed charge as 'about $50' when the customer originally stated $47.83, eroding trust. What is the most effective fix?",
    options: [
      "Extract transactional facts (exact amounts, dates, order numbers, statuses) into a persistent 'case facts' block included verbatim in every prompt, outside the summarized history.",
      "Increase the summarization frequency so the running summary stays shorter and more accurate.",
      "Instruct the summarizer in the system prompt to 'preserve all important details' when condensing turns.",
      "Switch to a model with a larger context window so summarization is never required."
    ],
    correct: [0],
    explanation: "Progressive summarization predictably condenses precise numerical values into vague approximations. Pinning exact transactional facts in a structured block that bypasses summarization preserves them reliably. Option B summarizes more often, increasing the risk of detail loss. Option C relies on a vague instruction that does not reliably protect specific values. Option D defers the problem; even large windows accumulate verbose history that benefits from structured fact extraction.",
    doc_link: "https://docs.claude.com/en/docs/build-with-claude/context-windows"
  },
  {
    id: "q16",
    official: false,
    question: "A customer contacts support with only their name. get_customer returns three different accounts that all match 'John Smith.' What should the agent do to maintain reliability?",
    options: [
      "Ask the customer for an additional identifier (such as email, order number, or postal code) to disambiguate before taking any account action.",
      "Select the account with the most recent activity, since that is most likely the active customer.",
      "Proceed with the first returned match and correct the account later if the customer objects.",
      "Escalate immediately to a human agent because multiple matches indicate a complex case."
    ],
    correct: [0],
    explanation: "Multiple matches require clarification with additional identifiers rather than heuristic selection, which risks acting on the wrong account. Options B and C use heuristics that can misidentify the customer and lead to incorrect actions. Option D over-escalates: needing one more identifier is not case complexity, and escalation should be reserved for genuine policy gaps, explicit customer requests, or inability to progress.",
    doc_link: "https://docs.claude.com/en/docs/agents-and-tools/tool-use/overview"
  },

  // ── Scenario: Code Generation with Claude Code (generated) ──────────────

  {
    id: "q17",
    official: false,
    question: "A newly onboarded engineer reports that Claude Code is not following the team's mandatory commit-message and testing conventions, while existing teammates have no issue. You discover the conventions live in your own ~/.claude/CLAUDE.md. What is the correct fix so every developer gets them?",
    options: [
      "Move the conventions into a project-level CLAUDE.md (or .claude/CLAUDE.md) committed to the repository so they are shared via version control.",
      "Ask each developer to copy the conventions into their own ~/.claude/CLAUDE.md file.",
      "Paste the conventions into a pinned message in the team chat for everyone to load manually.",
      "Add the conventions to a .claude/config.json file with a rules array."
    ],
    correct: [0],
    explanation: "User-level (~/.claude/CLAUDE.md) settings apply only to that user and are not shared via version control — exactly why the new engineer is missing them. Project-level CLAUDE.md committed to the repo is delivered to everyone on clone/pull. Option B is unscalable and error-prone. Option C is not a configuration mechanism Claude Code loads. Option D references a config file/array that does not exist.",
    doc_link: "https://code.claude.com/docs/en/memory"
  },
  {
    id: "q18",
    official: false,
    question: "You created a /analyze-architecture skill that maps the whole codebase and emits very verbose output. When teammates run it mid-task, the lengthy discovery output floods the main conversation and pushes earlier work out of context. Which SKILL.md configuration best addresses this?",
    options: [
      "Set context: fork in the skill's frontmatter so it runs in an isolated sub-agent context and returns only a summary to the main conversation.",
      "Add allowed-tools to the frontmatter to restrict which tools the skill can call.",
      "Add an argument-hint to the frontmatter prompting the developer for parameters.",
      "Move the skill from .claude/skills/ to ~/.claude/skills/ so it is personal rather than shared."
    ],
    correct: [0],
    explanation: "context: fork runs the skill in an isolated sub-agent context, keeping verbose discovery output out of the main conversation and returning a concise summary — directly solving context pollution. allowed-tools restricts tool access (a safety concern, not context). argument-hint prompts for parameters. Relocating to user scope changes sharing, not context behavior.",
    doc_link: "https://code.claude.com/docs/en/skills"
  },
  {
    id: "q19",
    official: false,
    question: "You repeatedly ask Claude Code to reformat legacy log strings into a normalized structure, but the results are inconsistent — different field orders and inconsistent date handling each run — despite a detailed prose description of the rules. What is the most effective way to get consistent transformations?",
    options: [
      "Provide 2–3 concrete input/output examples showing exactly how a raw log line should map to the normalized structure.",
      "Rewrite the prose description to be longer and more exhaustive about every edge case.",
      "Ask Claude to explain its reasoning step by step before producing each transformation.",
      "Lower the temperature to make the formatting deterministic across runs."
    ],
    correct: [0],
    explanation: "Concrete input/output examples are the most effective way to communicate expected transformations when prose is interpreted inconsistently — they demonstrate exact format rather than describing it. More prose (B) tends to be interpreted inconsistently too. Reasoning narration (C) does not pin down output format. Temperature (D) reduces randomness but does not teach the intended mapping.",
    doc_link: "https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/multishot-prompting"
  },
  {
    id: "q20",
    official: false,
    question: "A bug report includes a clear stack trace pointing to a single null-check that is missing in one function. The fix is well understood and scoped to that one file. Which approach is most appropriate?",
    options: [
      "Use direct execution to apply the targeted fix, since the change is simple, well-scoped, and the cause is already known.",
      "Enter plan mode to explore the codebase before making any change, to be safe.",
      "Fork the session to compare multiple fix strategies before applying one.",
      "Use the Explore subagent to map the whole module before editing the function."
    ],
    correct: [0],
    explanation: "Direct execution is appropriate for simple, well-scoped changes with a clear cause — like adding one missing null-check identified by a stack trace. Plan mode (B) is for large-scale, multi-file, or architecturally ambiguous work and adds overhead here. Forking (C) and the Explore subagent (D) are for divergent-approach exploration and verbose discovery, neither of which this single-line fix requires.",
    doc_link: "https://code.claude.com/docs/en/permission-modes"
  },

  // ── Scenario: Multi-Agent Research System (generated) ───────────────────

  {
    id: "q21",
    official: false,
    question: "Your coordinator agent is supposed to delegate to specialized subagents, but at runtime it never spawns them — it tries to do all the research itself and produces shallow results. Configuration review shows the subagent definitions are correct. What is the most likely cause?",
    options: [
      "The coordinator's allowedTools does not include 'Task', so it cannot invoke subagents.",
      "The subagents are not inheriting the coordinator's conversation history automatically.",
      "The coordinator's temperature is set too low for it to choose delegation.",
      "The subagents lack their own allowedTools entries for the Task tool."
    ],
    correct: [0],
    explanation: "Spawning subagents requires the coordinator to have 'Task' in its allowedTools; without it, the coordinator cannot delegate. Option B describes expected behavior (subagents do not auto-inherit parent context) and is unrelated to spawning. Option C misattributes delegation to temperature. Option D is backwards — it is the coordinator, not the subagents, that needs Task access to spawn them.",
    doc_link: "https://code.claude.com/docs/en/sub-agents"
  },
  {
    id: "q22",
    official: false,
    question: "Your research system always routes every query through the full pipeline (web search → document analysis → synthesis → report). For a simple factual query like 'What year was the Eiffel Tower completed?' this is slow and expensive. What design change best improves efficiency without hurting quality on complex topics?",
    options: [
      "Have the coordinator analyze each query's requirements and dynamically select only the subagents needed, rather than always invoking the full pipeline.",
      "Remove the document analysis and synthesis subagents so all queries are answered by web search alone.",
      "Set a fixed iteration cap so the pipeline halts early on simple queries.",
      "Merge all subagents into a single agent so there is no inter-agent routing overhead."
    ],
    correct: [0],
    explanation: "The coordinator should analyze query complexity and dynamically select which subagents to invoke, scaling effort to the task. Option B permanently strips capability needed for complex topics. Option C uses an arbitrary cap as a control mechanism — an anti-pattern that can truncate legitimately complex work. Option D collapses the specialization that makes the system reliable on hard queries.",
    doc_link: "https://code.claude.com/docs/en/sub-agents"
  },
  {
    id: "q23",
    official: false,
    question: "While researching market size, your document-analysis subagents return two different figures from two credible sources ($12B from a 2023 report, $15B from a 2024 report). The synthesis agent currently picks one value and drops the other. What should the synthesis behavior be instead?",
    options: [
      "Preserve both values with source attribution and publication dates, annotating the discrepancy rather than arbitrarily selecting one.",
      "Average the two figures to produce a single representative number for the report.",
      "Always keep the higher figure, since it likely reflects the most recent growth.",
      "Drop both conflicting figures and report only that the market size is uncertain."
    ],
    correct: [0],
    explanation: "Conflicting statistics from credible sources should be annotated with source attribution and dates, not silently resolved — and the two figures here differ partly because they are from different years, a temporal difference that should not be misread as a contradiction. Averaging (B) fabricates a number no source supports. Keeping the higher value (C) is an arbitrary heuristic. Dropping both (D) discards valid, useful information.",
    doc_link: "https://code.claude.com/docs/en/sub-agents"
  },
  {
    id: "q24",
    official: false,
    question: "Each of your four research subagents was given the full set of 18 tools 'for flexibility.' You notice the synthesis subagent sometimes launches its own web searches and document fetches instead of synthesizing the findings it was handed, producing inconsistent reports. What is the best corrective action?",
    options: [
      "Scope each subagent's tool set to only the tools its role needs, removing web search and fetch tools from the synthesis agent.",
      "Add system-prompt instructions telling the synthesis agent not to use web search or fetch tools.",
      "Increase the synthesis agent's max_tokens so it has room to both search and synthesize.",
      "Give every subagent identical tools but rely on the coordinator to reject off-role tool calls."
    ],
    correct: [0],
    explanation: "Too many tools degrade selection reliability, and agents with out-of-role tools tend to misuse them. Restricting each subagent to its role's tools (the principle of least privilege) prevents the misuse structurally. Option B relies on probabilistic prompt compliance. Option C does not stop off-role behavior. Option D keeps the problematic access and adds fragile after-the-fact filtering.",
    doc_link: "https://docs.claude.com/en/docs/agents-and-tools/tool-use/overview"
  },

  // ── Scenario: Claude Code for Continuous Integration (generated) ────────

  {
    id: "q25",
    official: false,
    question: "Your automated PR reviewer posts many comments about minor style preferences and local naming choices alongside genuine bugs. Developers start ignoring all of its comments, including the accurate security findings. What is the most effective first change?",
    options: [
      "Rewrite the review prompt with explicit criteria defining which issues to report (e.g., bugs, security) versus skip (minor style, local patterns), instead of relying on confidence-based filtering.",
      "Add an instruction telling the model to 'be conservative and only report high-confidence findings.'",
      "Reduce the number of comments by capping the reviewer at a maximum of five comments per PR.",
      "Switch the reviewer to a larger model so its judgments about what matters are more accurate."
    ],
    correct: [0],
    explanation: "High false-positive categories erode trust in the accurate ones; the fix is explicit categorical criteria specifying what to report versus skip. Vague guidance like 'be conservative' (B) does not improve precision. An arbitrary comment cap (C) can drop real bugs while keeping noise. A bigger model (D) does not substitute for clear criteria about which issues matter to this team.",
    doc_link: "https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/be-clear-and-direct"
  },
  {
    id: "q26",
    official: false,
    question: "In your CI pipeline, the same Claude session that generates code then reviews its own changes for bugs. It rarely flags problems, yet independent testing later finds real defects. What change most improves defect detection?",
    options: [
      "Run the review in a separate, independent Claude instance that lacks the generator's reasoning context.",
      "Append an instruction asking the generating session to 'carefully double-check your own work before approving.'",
      "Enable extended thinking in the same session so it reasons longer about its own code.",
      "Have the generating session output a self-reported confidence score and only merge above a threshold."
    ],
    correct: [0],
    explanation: "A session retains the reasoning it used to generate code, making it less likely to question its own decisions. An independent review instance, without that context, catches subtle issues more effectively than self-review prompts, extended thinking, or self-reported confidence — all of which remain anchored to the original reasoning. LLM self-reported confidence is also poorly calibrated.",
    doc_link: "https://code.claude.com/docs/en/overview"
  },
  {
    id: "q27",
    official: false,
    question: "Your CI job runs Claude Code non-interactively to review PRs, and a downstream script must post each finding as an inline GitHub comment. Right now the findings come back as free-form prose that the script cannot reliably parse. What is the best way to produce machine-parseable output?",
    options: [
      "Use --output-format json together with --json-schema to enforce structured, schema-conformant findings the script can parse directly.",
      "Add a prompt instruction asking Claude to format its findings as a Markdown table.",
      "Parse the prose output with a regular expression that extracts file, line, and message fields.",
      "Switch the job to the Message Batches API, which returns structured JSON by default."
    ],
    correct: [0],
    explanation: "--output-format json with --json-schema enforces structured, schema-conformant output suitable for automated posting. A Markdown-table instruction (B) still relies on probabilistic formatting. Regex over prose (C) is brittle. The Batches API (D) addresses cost/latency for non-blocking jobs and does not itself guarantee a parseable schema, nor is it suited to a blocking PR check.",
    doc_link: "https://code.claude.com/docs/en/cli-reference"
  },

  // ── Scenario: Structured Data Extraction (generated) ────────────────────

  {
    id: "q28",
    official: false,
    question: "Your extraction tool's JSON schema marks every field as required. When a source invoice omits a purchase-order number, the model invents a plausible-looking PO number to satisfy the schema. What schema design change best prevents this fabrication?",
    options: [
      "Make fields that may be absent from source documents optional/nullable so the model can return null instead of fabricating a value.",
      "Add a post-extraction validation step that rejects any PO number not matching the expected format.",
      "Lower the temperature so the model is less likely to invent values.",
      "Add a system-prompt instruction telling the model never to make up field values."
    ],
    correct: [0],
    explanation: "Required fields pressure the model to fabricate values when the information is absent; making such fields optional/nullable lets it return null truthfully. Format validation (B) catches some fakes but not a fabricated value that happens to match the format. Temperature (C) does not remove the structural pressure of a required field. A prompt instruction (D) is probabilistic and conflicts with a schema that still requires the field.",
    doc_link: "https://docs.claude.com/en/docs/agents-and-tools/tool-use/overview"
  },
  {
    id: "q29",
    official: false,
    question: "You receive a stream of documents of unknown type — invoices, contracts, and receipts — and have a separate extraction tool (schema) for each. The model sometimes responds with conversational text instead of calling any extraction tool. How do you guarantee it always returns structured output via a tool?",
    options: [
      "Set tool_choice: \"any\" so the model must call one of the available extraction tools rather than returning free text, letting it pick the schema that matches the document.",
      "Set tool_choice: \"auto\" and add a prompt instruction to always call an extraction tool.",
      "Force a single tool with tool_choice: {\"type\": \"tool\", \"name\": \"extract_invoice\"} for every document.",
      "Remove all but one extraction tool so there is only one possible choice."
    ],
    correct: [0],
    explanation: "tool_choice: \"any\" requires the model to call some tool (eliminating free-text replies) while still letting it select the schema appropriate to the unknown document type. \"auto\" (B) permits the model to return text, which is the failure being fixed. Forcing extract_invoice (C) misapplies the invoice schema to contracts and receipts. Removing tools (D) destroys the ability to handle multiple document types.",
    doc_link: "https://docs.claude.com/en/docs/agents-and-tools/tool-use/overview"
  },
  {
    id: "q30",
    official: false,
    question: "Your extraction pipeline retries on validation failure by re-sending the document, the failed extraction, and the specific error. For 'total does not equal sum of line items' errors the retry usually succeeds, but for 'required tax_id missing' errors the retries keep failing because the tax ID simply is not in the document. How should you handle these two error types?",
    options: [
      "Retry format/structural errors (like the sum mismatch), but for information genuinely absent from the source, route to human review instead of retrying.",
      "Increase the retry limit for both error types so the model eventually finds the missing tax ID.",
      "Treat both error types identically with the same retry-with-feedback loop until they pass.",
      "Disable retries entirely and send every validation failure to human review."
    ],
    correct: [0],
    explanation: "Retries help with format and structural errors the model can correct, but are ineffective when the required information is absent from the source — no amount of retrying invents data that is not there. Such cases should be routed to human review. Option B and C waste calls on an unrecoverable error. Option D discards retries' real value on correctable errors.",
    doc_link: "https://docs.claude.com/en/docs/agents-and-tools/tool-use/overview"
  },
  {
    id: "q31",
    official: false,
    question: "Before reducing human review, your team measures the extraction system at 97% overall accuracy and proposes auto-approving all high-confidence extractions. You are concerned this number could hide weak spots. What is the most appropriate validation step?",
    options: [
      "Analyze accuracy stratified by document type and field, using stratified random sampling, to confirm performance is consistent across all segments before automating.",
      "Re-run the full dataset to confirm the 97% aggregate figure is reproducible.",
      "Auto-approve now and monitor the aggregate accuracy metric for any drop over time.",
      "Raise the confidence threshold for auto-approval until the aggregate accuracy reaches 99%."
    ],
    correct: [0],
    explanation: "Aggregate accuracy can mask poor performance on specific document types or fields. Stratified analysis by type and field (with stratified random sampling) verifies consistent performance before automating. Re-running for the same aggregate (B) does not reveal segment weaknesses. Auto-approving on the aggregate (C) risks systematic errors in hidden segments. Raising the global threshold (D) still relies on an aggregate that can hide segment-level failures.",
    doc_link: "https://docs.claude.com/en/docs/agents-and-tools/tool-use/overview"
  }
];
