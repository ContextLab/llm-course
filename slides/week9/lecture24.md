---
marp: true
theme: cdl-theme
math: katex
transition: fade 0.25s
author: Contextual Dynamics Lab
---

# Lecture 24: Agents and tool use

### PSYC 51.17: Models of language and communication

Jeremy R. Manning
Dartmouth College
Winter 2026

---

# Learning objectives

<div class="note-box" data-title="By the end of this lecture, you will be able to...">

1. Define what an **LLM agent** is and how it differs from a chatbot
2. Explain **function calling**, **MCP**, and how LLMs interact with external tools
3. Describe the **ReAct framework** and its reasoning-action loop
4. Explain how agentic coding tools (Claude Code, Cursor) are changing software development
5. Evaluate the **safety implications** of giving LLMs the ability to act in the world

</div>

<div class="tip-box" data-title="Companion notebook">

📓 [Companion Notebook](https://colab.research.google.com/github/ContextLab/llm-course/blob/main/slides/week9/agents_demo.ipynb) — build a simple agent with tool dispatch

</div>

---

# From chatbots to agents

<div class="definition-box" data-title="What is an LLM agent?">

An **agent** is a system where a language model can:

1. **Reason** about a task (plan steps, reflect on progress)
2. **Act** by calling external tools (search, code execution, APIs)
3. **Observe** the results of those actions
4. **Iterate** until the task is complete

A chatbot *responds to prompts*. An agent *takes actions in the world*.

</div>

<div class="tip-box" data-title="Questions to consider">

When you use ChatGPT to browse the web or run Python code, you are interacting with an agent. What makes this qualitatively different from a simple question-answering system?

</div>

---

# Why tools matter

<div class="note-box" data-title="LLMs are powerful but limited">

Language models trained on text alone cannot:

- **Access current information** (training data has a cutoff date)
- **Perform precise computation** (arithmetic, symbolic math)
- **Interact with external systems** (databases, APIs, file systems)
- **Verify their own claims** (no ground truth access)

</div>

<div class="important-box" data-title="Tools compensate for LLM weaknesses">

By connecting an LLM to external tools, we can combine the model's **language understanding and reasoning** with tools that provide **accuracy, recency, and real-world interaction**. The LLM decides *what* to do; the tools *do* it.

</div>

---

# Function calling

<div class="definition-box" data-title="How LLMs use tools">

**Function calling** is a mechanism where the LLM outputs a structured request to invoke an external function, rather than generating free-form text. The system executes the function, and the result is fed back to the LLM.

</div>

<div class="example-box" data-title="Function calling with the OpenAI API">

```python
tools = [{
    "type": "function",
    "function": {
        "name": "get_weather",
        "description": "Get current weather for a location",
        "parameters": {
            "type": "object",
            "properties": {
                "location": {"type": "string", "description": "City name"},
                "unit": {"type": "string", "enum": ["celsius", "fahrenheit"]}
            },
            "required": ["location"]
        }
    }
}]
```

</div>

---

# Function calling in practice

<div class="example-box" data-title="The LLM decides when and how to call tools">

```python
# User asks: "What's the weather like in Hanover, NH?"

# Step 1: LLM generates a function call (not free text)
response = {
    "function_call": {
        "name": "get_weather",
        "arguments": '{"location": "Hanover, NH", "unit": "fahrenheit"}'
    }
}

# Step 2: System executes the function
result = get_weather(location="Hanover, NH", unit="fahrenheit")
# Returns: {"temperature": 28, "condition": "snowy"}

# Step 3: Result is fed back to the LLM
# LLM generates: "It's 28°F and snowy in Hanover, NH right now."
```

</div>

<div class="note-box" data-title="Key insight">

The LLM never *executes* code itself -- it generates a **structured request** that the system dispatches. This separation of reasoning from execution is fundamental to agent safety.

</div>

---

# The ReAct framework

<div class="definition-box" data-title="Yao et al. (2023): 'ReAct: Synergizing Reasoning and Acting'">

**ReAct** interleaves two capabilities in a loop:

- **Reasoning** (chain-of-thought): The model thinks about what to do next
- **Acting**: The model calls a tool or takes an action
- **Observing**: The model reads the result and decides the next step

This continues until the task is complete or the model decides it has enough information.

</div>

<div class="important-box" data-title="Why interleaving matters">

Pure reasoning (chain-of-thought alone) can hallucinate facts. Pure acting (tool use without reasoning) can call the wrong tools. **ReAct combines both**: the model reasons about *which* tool to use, acts, then reasons about the result.

</div>

---

# ReAct in action

<div class="example-box" data-title="Answering a question with search">

```text
Question: "What is the elevation of the city where Dartmouth College
           is located?"

Thought 1: I need to find which city Dartmouth College is in.
Action 1:  search("Dartmouth College location")
Obs 1:     Dartmouth College is in Hanover, New Hampshire.

Thought 2: Now I need the elevation of Hanover, NH.
Action 2:  search("Hanover New Hampshire elevation")
Obs 2:     Hanover, NH has an elevation of 531 feet (162 m).

Thought 3: I have the answer.
Action 3:  finish("531 feet (162 meters)")
```

Each **Thought** is the model reasoning; each **Action** is a tool call; each **Obs** is the tool's response.

</div>

---

# ReAct vs. chain-of-thought

<div class="note-box" data-title="Comparison of reasoning approaches">

| Approach | Reasoning | Tool use | Strengths | Weaknesses |
|----------|-----------|----------|-----------|------------|
| Standard prompting | None | None | Simple | No reasoning, no grounding |
| Chain-of-thought | Yes | None | Better reasoning | Can hallucinate facts |
| Act-only | None | Yes | Grounded in tool results | May call wrong tools |
| **ReAct** | **Yes** | **Yes** | **Grounded reasoning** | More complex, more tokens |

</div>

<div class="note-box" data-title="Empirical results (Yao et al., 2023)">

On knowledge-intensive tasks (HotpotQA, FEVER), ReAct outperformed chain-of-thought by **reducing hallucinations** through grounded search. On reasoning tasks (ALFWorld, WebShop), ReAct outperformed act-only methods by making **more informed tool choices**.

</div>

---

# Toolformer: self-taught tool use

<div class="definition-box" data-title="Schick et al. (2023): 'Toolformer: Language Models Can Teach Themselves to Use Tools'">

**Toolformer** trains an LLM to decide *when and how* to call tools by embedding API calls directly into training text. The model learns to insert tool calls at positions where they reduce prediction loss.

</div>

<div class="example-box" data-title="How Toolformer annotates training data">

```text
Original:  "The Eiffel Tower is 330 meters tall."
Annotated: "The Eiffel Tower is [QA("height of Eiffel Tower") → 330]
            meters tall."

Original:  "The population of France is about 67 million."
Annotated: "The population of France is about
            [Search("France population") → 67 million] ."
```

The model learns to insert `[Tool(query) → result]` at positions where the tool call improves next-token prediction. At inference time, the system intercepts these calls and executes them.

</div>

---

# Common agent tools

<div class="note-box" data-title="Tools available to modern LLM agents">

| Tool | Purpose | Example |
|------|---------|---------|
| **Web search** | Access current information | "What happened in the news today?" |
| **Code interpreter** | Execute Python, do math | "Calculate the eigenvalues of this matrix" |
| **File system** | Read/write files | "Save this analysis to report.csv" |
| **Database** | Query structured data | "How many users signed up last month?" |
| **API calls** | Interact with services | "Send an email to the team" |
| **Browser** | Navigate web pages | "Fill out this form and submit it" |
| **Image generation** | Create visual content | "Draw a diagram of this architecture" |

</div>

---

# Implementing a simple agent loop

<div class="example-box" data-title="A minimal agent in Python">

```python
import openai, json

TOOLS = {
    "search": lambda q: web_search(q),
    "calculate": lambda expr: eval(expr),  # Simplified!
    "finish": lambda answer: answer,
}

def agent_loop(question, max_steps=5):
    messages = [{"role": "user", "content": question}]
    for step in range(max_steps):
        response = openai.chat.completions.create(
            model="gpt-4", messages=messages, tools=tool_definitions
        )
        msg = response.choices[0].message
        if msg.tool_calls:
            for call in msg.tool_calls:
                fn = TOOLS[call.function.name]
                result = fn(**json.loads(call.function.arguments))
                messages.append({"role": "tool", "content": str(result),
                                 "tool_call_id": call.id})
        else:
            return msg.content  # Final answer (no tool call)
    return "Max steps reached"
```

</div>

---

# The agent loop pattern

<div class="definition-box" data-title="The universal agent architecture">

Nearly all LLM agents follow the same core loop:

1. **Prompt** the LLM with the task and available tools
2. **Parse** the LLM's output for tool calls or a final answer
3. **Execute** any requested tool calls
4. **Append** tool results to the conversation
5. **Repeat** until the LLM produces a final answer (or a step limit is reached)

</div>

<div class="warning-box" data-title="Critical design decisions">

- **Maximum steps**: Prevents infinite loops (typically 5--20)
- **Error handling**: What happens when a tool call fails?
- **Sandboxing**: Code execution must be isolated for safety
- **Cost control**: Each loop iteration costs API tokens

</div>

---

# Multi-step reasoning example

<div class="example-box" data-title="An agent solving a complex task">

```text
User: "Compare the GDP per capita of the US and Japan in 2023,
       and calculate the ratio."

Step 1 - Thought: I need GDP per capita data for both countries.
Step 1 - Action:  search("US GDP per capita 2023")
Step 1 - Result:  "$76,329"

Step 2 - Action:  search("Japan GDP per capita 2023")
Step 2 - Result:  "$33,950"

Step 3 - Thought: Now I can calculate the ratio.
Step 3 - Action:  calculate("76329 / 33950")
Step 3 - Result:  2.248

Step 4 - Answer:  "US GDP per capita ($76,329) is approximately
                   2.25x Japan's ($33,950) in 2023."
```

The agent **decomposed** the task, **gathered data** with search, **computed** the ratio with a calculator, and **synthesized** a final answer.

</div>

---

# Model Context Protocol (MCP)

<div class="definition-box" data-title="A universal standard for tool integration (Anthropic, 2024)">

[MCP](https://modelcontextprotocol.io) is an open protocol that standardizes how LLMs connect to external tools and data sources. Think of it as **USB for AI** — any MCP-compatible tool works with any MCP-compatible model.

</div>

<div class="note-box" data-title="Why MCP matters">

| Before MCP | With MCP |
|-----------|----------|
| Each model has its own tool format | Universal JSON-RPC protocol |
| Custom integration per tool × model | Write once, works everywhere |
| Tools tightly coupled to specific APIs | Tools are portable across models |
| Hard to share tool implementations | Open ecosystem of shared tools |

MCP servers provide tools (functions the model can call), resources (data the model can read), and prompts (templates for common tasks). Any model that speaks MCP can use any MCP server.

</div>

---

# Computer Use and agentic coding

<div class="note-box" data-title="LLMs that can see and control your screen">

[Computer Use](https://docs.anthropic.com/en/docs/agents-and-tools/computer-use) (Anthropic, 2024) gives Claude the ability to see screenshots, move the mouse, click buttons, and type — interacting with *any* software, not just tools with APIs.

</div>

<div class="definition-box" data-title="Agentic coding: LLMs that write and debug software">

| System | What it does | Benchmark |
|--------|-------------|-----------|
| [Claude Code](https://docs.anthropic.com/en/docs/claude-code) | Terminal-based coding agent | — |
| [Cursor](https://cursor.com) | IDE with integrated AI agent | — |
| [OpenHands](https://github.com/All-Hands-AI/OpenHands) | Open-source software agent | [SWE-bench](https://arxiv.org/abs/2310.06770): 53% |
| [Codex CLI](https://github.com/openai/codex) | OpenAI's terminal agent | — |

These tools don't just *suggest* code — they read files, run tests, debug errors, and iterate autonomously. Software engineering is becoming one of the first domains where agents approach human-level competence.

</div>

---

# Agent memory

<div class="note-box" data-title="Overcoming the context window limitation">

LLM context windows are finite (4K--128K tokens). Long-running agents need additional memory:

| Memory type | Implementation | Use case |
|-------------|---------------|----------|
| **Short-term** | Conversation history in context | Recent steps and observations |
| **Working memory** | Scratchpad / notepad tool | Intermediate results, running totals |
| **Long-term** | Vector database (RAG) | Past experiences, learned procedures |
| **Episodic** | Structured logs | What worked/failed in previous runs |

</div>

<div class="important-box" data-title="The memory bottleneck">

Memory management is one of the hardest problems in agent design. Too little context and the agent forgets its plan. Too much context and it becomes slow, expensive, and confused by irrelevant information.

</div>

---

# Agent safety: the principal-agent problem

<div class="warning-box" data-title="Risks of agentic AI systems">

- **Unintended actions**: An agent told to "clean up my email" might delete important messages
- **Goal misalignment**: An agent optimizing a metric might find harmful shortcuts
- **Prompt injection**: A malicious website could hijack an agent browsing the web
- **Cascading errors**: One bad tool call can lead to a chain of incorrect actions
- **Capability overhang**: Agents may have more power than their operators realize

</div>

<div class="definition-box" data-title="The principal-agent problem (Hagendorff, 2025)">

[Hagendorff (2025)](https://arxiv.org/abs/2508.04039) tested LLM agents on safety benchmarks and found a **97.14% attack success rate** — agents routinely executed harmful actions when cleverly prompted. The core challenge: how do you *verify* that an agent is doing what you intended when its actions are opaque and its reasoning is complex?

Mitigations: human-in-the-loop for irreversible actions, sandboxed execution, budget limits, audit logging, and minimal capability grants.

</div>

---

# The agent spectrum

<div class="note-box" data-title="How agents fit into the LLM ecosystem">

| Paradigm | LLM role | Example |
|----------|----------|---------|
| Chatbot | Respond to queries | ChatGPT (basic mode) |
| RAG system | Answer with retrieved context | Lecture 17's pipeline |
| Tool-using LLM | Call functions on demand | ChatGPT with MCP tools |
| ReAct agent | Reason + act iteratively | Research assistant |
| Coding agent | Write, test, debug software | Claude Code, OpenHands |
| Multi-agent system | Multiple LLMs collaborating | Debate, code review, delegation |

</div>

<div class="tip-box" data-title="The key insight">

We have moved from models that *generate text* (GPT-1) to models that *take actions* (agents). Each step up the spectrum gives the LLM more autonomy — and more potential for both benefit and harm.

</div>

---

# Discussion

<div class="tip-box" data-title="Questions to consider">

1. **The automation frontier:** Coding agents can now fix real GitHub issues. What does this mean for software engineering as a career? Is this different from how compilers automated assembly language?

2. **Trust and verification:** Hagendorff found 97% attack success on safety benchmarks. How do you build trust in systems that act on your behalf? Is "human-in-the-loop" scalable?

3. **MCP and the tool ecosystem:** MCP standardizes tool access for any model. If tools are interchangeable and models are interchangeable, where does the value lie? Who benefits most from open standards?

4. **The principal-agent problem:** When you delegate a task to an AI agent, how do you verify it did what you wanted — especially when its reasoning is opaque? How is this different from delegating to a human?

</div>

---
<!-- _class: scale-85 -->

# Further reading

<div class="note-box" data-title="Further reading">

[**Yao et al. (2023, *ICLR*)**](https://arxiv.org/abs/2210.03629) "ReAct: Synergizing Reasoning and Acting in Language Models" — The ReAct framework (+34% on ALFWorld, +10% on WebShop).

[**Schick et al. (2023, *NeurIPS*)**](https://arxiv.org/abs/2302.04761) "Toolformer: Language Models Can Teach Themselves to Use Tools" — Self-taught tool use.

[**Anthropic (2024)**](https://modelcontextprotocol.io) "Model Context Protocol" — Open standard for LLM-tool integration.

[**Jimenez et al. (2024, *ICLR*)**](https://arxiv.org/abs/2310.06770) "SWE-bench: Can Language Models Resolve Real-World GitHub Issues?" — The benchmark for coding agents.

[**Hagendorff (2025, *arXiv*)**](https://arxiv.org/abs/2508.04039) "AI Agent Safety" — 97.14% attack success rate on agent safety benchmarks.

</div>

---

# Questions?

<div class="emoji-figure">
  <div class="emoji-col">
    <span class="emoji emoji-xl emoji-bg emoji-bg-navy">&#x1F4E7;</span>
    <span class="label"><a href="mailto:jeremy@dartmouth.edu">Email</a></span>
  </div>
  <div class="emoji-col">
    <span class="emoji emoji-xl emoji-bg emoji-bg-purple">&#x1F4AC;</span>
    <span class="label"><a href="https://discord.gg/sftEk9Ygdw">Discord</a></span>
  </div>
  <div class="emoji-col">
    <span class="emoji emoji-xl emoji-bg emoji-bg-green">&#x1F481;</span>
    <span class="label"><a href="https://context-lab.youcanbook.me">Office hours</a></span>
  </div>
</div>

<div class="tip-box" data-title="Up next...">

Mixture of experts and efficiency: scaling models without scaling compute

</div>
