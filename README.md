# Agent Human Interaction Protocol (`HumanInteraction`)

This repository is the home for the **Agent–Human Interaction protocol documentation**: a structured, channel-agnostic way for agents (LLM “thinking layers”) to express **what they need from humans**—who should receive what, what’s expected, constraints, and the context needed to respond—while supporting **auditability, privacy, and multi-party collaboration**.

## What problem this solves

Human-in-the-loop moments (approval, clarification, decision, advisory input, creative input) are usually implemented ad hoc per product. That makes it hard to build reusable tooling (dashboards, notifiers, logs), and it creates ambiguity about **responsibility**, **urgency**, and **resolution**.

`HumanInteraction` aims to standardize the “ask” so systems can:

- **Make expectations explicit**: who / what / why, with roles and constraints.
- **Track resolution**: pending vs resolved, tentative vs confirmed, stale/expired requests.
- **Handle multi-party collaboration**: primary/approver/contributor/observer roles, group vs private interactions, conflict and resolution policies.
- **Remain channel-agnostic**: the same structured request can be delivered via chat, email, or UI (delivery orchestration is out of scope).

## Repository contents

Today this repo contains the core protocol documentation in `docs/`:

- **Start here (overview)**: `docs/HumanInteraction - One Pager.md`
- **Design + requirements (deep dive)**: `docs/HumanInteration-Design.md`
- **Protocol spec + examples**: `docs/AgentHumanInteraction-Protocol.md`
- **Public website (source)**: [`site/`](site/) — Astro Starlight; builds a landing page plus the docs above (see **Website** below).

## Where to start

- **If you want the why + goals in 5 minutes**: read `docs/HumanInteraction - One Pager.md`
- **If you’re evaluating scope / requirements**: read `docs/HumanInteration-Design.md`
- **If you’re implementing**: start with `docs/AgentHumanInteraction-Protocol.md` (schema + workflows + sample Node/React integration)

## Conceptual model (quick glossary)

- **HumanInteraction**: the agent’s structured request for human involvement (the smallest unit of interaction).
- **HumanFeedback**: the human response that resolves (or partially resolves) an interaction.
- **Expectation vs commitment**: an expectation is a “soft ask”; a commitment is a binding promise that requires explicit acknowledgement and supports due dates / consequences.
- **Resolution policy**: how multi-party inputs resolve (e.g., first response, majority, all required).
- **Coordination mode**: centralized vs distributed handling for multi-human interactions.

## Scope / non-goals (as documented)

- **In scope**: agent → human interaction requests, roles, constraints, context, privacy-aware variants, resolution tracking, staleness/expiry, multi-party participation.
- **Out of scope**: delivery orchestration (how messages are sent), workforce management/scheduling, and agent-to-agent coordination.

## Status

This is an evolving draft of the protocol and supporting design docs. Expect naming and schema details to change as requirements and examples converge.

## Website

The public site lives in [`site/`](site/) (**Astro Starlight**, MIT). It includes a marketing landing page and renders the canonical markdown in [`docs/`](docs/) (plus [`site/src/content/docs/`](site/src/content/docs/) for pages that only exist for the site, e.g. contributing).

### Local preview

1. `cd site`
2. `npm install`
3. `npm run dev`

### Production build

1. `cd site`
2. `npm install`
3. `npm run build` — static output in `site/dist/`

### Publishing (GitHub Pages)

1. In the GitHub repo: **Settings → Pages → Build and deployment**, set **Source** to **GitHub Actions**.
2. The workflow [`.github/workflows/deploy-site.yml`](.github/workflows/deploy-site.yml) runs on pushes to `main` when `site/`, `docs/`, or that workflow file changes.
3. Default workflow env targets a **project site** URL shape (`PUBLIC_SITE_URL=https://gitcommitshow.github.io`, `ASTRO_BASE=/agenthumaninteraction/`). Forks should update those values.

### Custom domain

When you move to your own hostname, set `PUBLIC_SITE_URL` to `https://your.domain` and `ASTRO_BASE` to `/` in the workflow (or via repository / environment variables), then add `site/public/CNAME` containing **exactly one line**: the hostname (no `https://`). See [`site/cname.example.txt`](site/cname.example.txt). Avoid committing a real `CNAME` until DNS is ready—an incorrect value can confuse the Pages custom-domain setting.

### Live site (after Pages is enabled)

`https://gitcommitshow.github.io/agenthumaninteraction/` (adjust user/org when forking).

## Contributing

Contributions are welcome, especially:

- Clarifying requirements and non-goals
- Tightening/validating the schema for LLM reliability (low hallucination risk)
- Adding interaction scenarios and edge cases (staleness, conflicts, low-confidence resolution)
- Improving implementer guidance and examples across channels (chat/email/UI)

If you’re proposing a change, please include:

- The **motivation/use case**
- The **fields/behavior impacted**
- How the change affects **auditability**, **privacy/visibility**, and **multi-party resolution**
