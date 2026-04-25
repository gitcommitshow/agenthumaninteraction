---
title: Design (requirements)
description: Deep requirements, problem statement, V1 checklist, and design notes for HumanInteraction.
slug: docs/design
editUrl: https://github.com/gitcommitshow/agenthumaninteraction/edit/main/docs/HumanInteration-Design.md
---

## 1. Context / Background (draft)

Today, AI agents (particularly those using LLMs) can perform complex reasoning and task execution. However, their effectiveness depends on **human involvement** at key points: providing information, making decisions, approving actions, or supplying context that machines cannot infer.

Currently, this “human-in-the-loop” interaction is **ad hoc**: each system invents its own way for agents to request human input, specify urgency, and track responses. This lack of standardization makes it hard to:

* Integrate different AI agents in the same workflow.
* Build tooling (dashboards, notifiers, schedulers) that can understand these requests generically.
* Guarantee consistent user experience for human operators.

The **HumanInteraction Protocol** aims to define a common way for AI agents to describe what they need from humans — including **recipient, expectation, constraints, and context** — in a structured, machine-readable form.

---

## 2. Problem Statement

**What’s broken / missing:**

* AI agents often treat human involvement as ad hoc input/output, not structured collaboration.
* Humans may not understand why the AI is asking something, what level of responsibility they hold, or what happens if they don’t respond.
* Different AI systems use inconsistent formats, making it impossible to build shared human-in-the-loop tools.
* Human teammates experience **cognitive and decision fatigue**, especially in long or complex sessions. Without protocol support, agents may over-burden humans with requests instead of adapting their expectations.

**Requirements / Goals:**

* MUST enable AI agents to express requests in terms of **team roles and responsibilities** (who, what, why).
* MUST define clear **expectations**: decision, approval, information, creative input, etc.
* SHOULD allow **constraints**: deadlines, priority, escalation.
* SHOULD provide **context** so humans understand how their action supports the overall task.
* SHOULD allow agents to indicate **fallback strategies** when humans are unavailable, fatigued, or overloaded (e.g., “if unanswered, proceed with assumption X unless risk > Y”).
* MAY include optional **human state signals** (e.g., conversation length, response delays) to guide agents in modulating their requests.
* MAY allow extensibility for domain-specific actions (custom fields).
* MUST allow agents to **invite new participants** into an interaction, even if they weren’t part of the original conversation.
* MUST support **private interactions** (1-to-1 or subgroup), in parallel with group-level communication.
* SHOULD provide a way to **link related interactions** (so private conversations can be tied back to the main thread for context).
* SHOULD ensure **role clarity** across multiple conversation scopes (e.g., “observer in group chat, approver in private chat”).

* SHOULD allow agents to express **uncertainty in roles** (e.g., “recipient may be approver or FYI”) and refine these roles as more context emerges.
* MAY allow **progressive clarification** (AI updates its interaction request as it learns more, e.g., promoting someone from “FYI” to “approver” if rules demand it).

* SHOULD allow agents to **default unspecified roles to observer** (no action expected).
* SHOULD allow **refinement of roles over time**, but must not block progress if roles are unclear.
* MUST allow a single human input to generate multiple HumanInteraction requests.
* MUST support parallel or sequential execution of these interactions (depending on constraints).
* SHOULD allow the AI to report back aggregated status (e.g., “2 of 3 approvals received”).
* SHOULD allow linking of related interactions with a shared conversation/task ID.
* MUST support **conditional interactions**, where one interaction depends on the outcome of others.
* MUST allow expressing simple logical conditions (e.g., AND, OR).
* SHOULD support **sequential dependencies** (e.g., step 2 starts only if step 1 passes).
* SHOULD allow grouping related interactions under a **shared workflow ID**.
* MAY support escalation paths if conditions are unmet (e.g., “If A disapproves, escalate to D”).
* Should allow each interaction to define a **validity window** (e.g., expires after 24 hours).
* Should allow AI agents to **withdraw** or **invalidate** pending interactions if circumstances change.
* SHOULD allow **context updates** (e.g., “this request is no longer needed because the issue was resolved”).
* SHOULD make it clear to humans that **they are not bound to respond** if an interaction becomes stale.
* MAY allow "superseded by" linking (new interaction replaces an older one).

* Should be able to incrementally build the entire HumanInteraction context e.g. a tool requesting human interaction (the message and role), then another agent filling in the specific contact person

**Non-goals (for now):**

* Not defining **how humans respond** (e.g., UI/UX, input modalities).
* Not defining **scheduling or task assignment**.
* Not addressing **workforce management** (e.g., who assigns which task).
* Not handling **agent-to-agent coordination** (out of scope).
* Not modeling detailed human psychology — only supporting signals and fallback handling.

### Prioritized Requirements Checklist For V1

**Core Interaction**

* **MUST**: Express requests in terms of team roles/responsibilities (who, what, why).
* **MUST**: Define clear expectations (approval, decision, information, creative input, advisory).
* **SHOULD**: Provide context so humans understand purpose.

**Roles & Participants**

* **MUST**: Support multiple recipients with roles (primary, approver, CC, observer).
* **SHOULD**: Default unspecified roles to observer (no action expected).
* **SHOULD**: Support progressive clarification of roles over time.
* **MUST**: Allow inviting new participants not in the original conversation.
* **MUST**: Support private vs group interactions, with linking.

**Workflow Logic**

* **MUST**: Support fan-out (one input → multiple interactions).
* **MUST**: Support conditional interactions (e.g., if A & B approve → C).
* **MUST**: Support chained/sequential interactions.
* **SHOULD**: Support implicit/silent approval (e.g., “no objection = proceed”).
* **SHOULD:** Allow interactions start as expectations and harden into commitments when both sides agree.

**Human Factors**

* **SHOULD**: Allow fallback strategies for unavailable/overloaded humans.
* **MAY**: Include human state signals (fatigue indicators, response delays).
* **MUST**: Allow validity windows and cancellation/withdrawal of stale interactions.
* **MUST:** Track resolution confidence based on content match + conversational proximity.


**Conflict & Delegation**

* **MUST**: Handle conflicting responses (approve vs reject).
* **MUST**: Support revocable/updatable responses.
* **MUST**: Support delegation/escalation (recipient substitution).
** **Should:** Support commitment renegotiation as a first-class action.

**Trust & Transparency**

* **SHOULD**: Allow optional fields for confidence, rationale, provenance.
* **SHOULD**: Distinguish binding vs advisory inputs.
* **Should:** Explicitly log commitments, acknowledgments, and violations for auditability.

**Input & Modality**

* **MUST**: Support human-initiated as well as AI-initiated interactions.
* **SHOULD**: Be modality-agnostic (text, voice, UI click), with flexibility indicators.

**Priority & Operations**

* **MUST**: Allow specifying priority/urgency (normal vs critical).
* **MUST**: Support auditability: durable logging with participants, timestamps, outcomes.

## 3. Use Cases / Scenarios

The protocol must cover various use cases and secenerios related to follwing categories

* Core interactions
* Team dynamics (multi-party, roles, delegation)
* Workflow logic (fan-out, conditions, chains)
* Realism (fatigue, staleness, conflicts, silent approval)
* Human factors (trust, modality, escalation, auditability)

We provide specific examples to understand these scenerios in depth. This is not meant to be an exhaustive list.

### 3.1 Contract Approval (Happy Path)

**Actors:**

* AI Agent (Contract Assistant)
* Human (Project Manager)

**Scenario:**

1. The AI drafts a contract.
2. It determines legal approval is required before sending to the client.
3. The AI sends a `HumanInteraction` request:

   * Recipient: Project Manager
   * Expectation: Approval/Disapproval
   * Constraint: Response within 24 hours
   * Context: “Contract #42 requires approval for client delivery.”
4. The Project Manager receives the request in their task dashboard, reviews the document, and approves it.
5. The AI proceeds to send the contract.

**Value:**
The protocol provides a clear, structured way to treat the human as a teammate with an explicit responsibility.

---

### 3.2 Address Ambiguity (Fatigue-Aware Fallback)

**Actors:**

* AI Agent (Logistics Planner)
* Human (Operations Coordinator)

**Scenario:**

1. The AI receives a shipping order with an ambiguous delivery address.
2. It generates a `HumanInteraction` request:

   * Recipient: Operations Coordinator
   * Expectation: Provide clarification
   * Constraint: Must resolve within 30 minutes
   * Context: “Ambiguous address: ‘Main Street, Springfield’. Two possible zip codes.”
   * Fallback Strategy: “If no response within 30 minutes, assume zip code 12345 (lower risk) and log decision for later correction.”
3. The coordinator has been answering many requests and shows slower response times (possible fatigue).
4. The system applies the fallback: after 30 minutes, the AI proceeds with the lower-risk assumption and records the decision.
5. The human can later review or override if needed.

**Value:**
The protocol prevents overloading the human, while keeping progress moving safely.

---

### 3.3 Multi-Participant Collaboration (Team Context)

**Actors:**

* AI Agent (Research Assistant)
* Human A (Lead Researcher – primary recipient)
* Human B (Compliance Officer – CC’d, may need to approve)
* Human C (Project Analyst – CC’d, for awareness only)

**Scenario:**

1. Human A sends an email to the AI Agent with a data analysis request, CC’ing Human B and Human C.
2. The AI processes the request and generates a `HumanInteraction` task:

   * Primary Recipient: Lead Researcher (Human A)
   * Expectation: Provide input data set format preference
   * CC: Compliance Officer (Human B) — role “MAY approve if sensitive data is involved”
   * CC: Project Analyst (Human C) — role “FYI only, no action expected”
   * Constraint: Must finalize within 48 hours to meet project deadline
   * Context: “Data analysis for Project X requires clarification on dataset format. Compliance may be triggered if sensitive data is detected.”
3. Human A replies with the format choice.
4. Human B receives the same request (as CC). If the AI detects sensitive data, it escalates by sending a new request requiring Human B’s explicit approval.
5. Human C stays in the loop (notified, no action).

**Value:**

* Mirrors how real human teamwork works (primary + CC + FYI roles).
* Ensures transparency while assigning responsibility clearly.
* Builds trust that the AI is communicating like a “team member,” not just point-to-point.

---

### 3.4 Role Ambiguity & Refinement (Use Case)

**Actors:**

* AI Agent (Procurement Assistant)
* Human A (Finance Officer – unclear role)
* Human B (Department Head – unclear role)

**Scenario:**

1. The AI needs human input before approving a large purchase.
2. At first, it doesn’t know if the Finance Officer or Department Head has approval authority.
3. The AI creates a `HumanInteraction` request:

   * Recipients: Finance Officer, Department Head
   * Expectation: Clarify who has approval responsibility, or provide approval directly
   * Constraint: Response needed within 2 business days
   * Context: “Purchase request #9821 requires approval > \$10,000. Authority unclear.”
   * Role Confidence: Finance Officer (60%), Department Head (40%)
4. Human A responds: “I can’t approve, this should go to Department Head.”
5. The AI refines the interaction, reissuing the request:

   * Primary Recipient: Department Head (Human B)
   * CC: Finance Officer (Human A) for visibility
   * Expectation: Approval/Disapproval
6. Human B approves, AI proceeds.

**Value:**
The protocol supports **graceful handling of role ambiguity** — instead of failing or blocking, the AI collaborates with humans to clarify roles, just like a human teammate would.

---

### 3.4 Role Ambiguity with Observer Assumption (Use Case)

**Actors:**

* AI Agent (Procurement Assistant)
* Human A (Finance Officer – unspecified role)
* Human B (Department Head – specified as potential approver)

**Scenario:**

1. The AI needs approval for a large purchase.
2. It knows the Department Head may be responsible, but Finance Officer’s role is unclear.
3. The AI creates a `HumanInteraction` request:

   * Primary Recipient: Department Head (approval expected)
   * Recipients without specified roles (Finance Officer) are **assumed observers**.
   * Constraint: Response needed within 2 business days
   * Context: “Purchase request #9821 requires approval > \$10,000.”
4. Finance Officer sees the request (as observer) and decides to chime in with: “Yes, Department Head is the approver here.”
5. The Department Head provides final approval.
6. The AI proceeds without ever blocking on clarifying roles.

**Value:**
The protocol stays lightweight and resilient: ambiguity doesn’t stall progress, and humans can still intervene to self-declare roles if needed.


Yes — that’s a great point, and it pushes the **HumanInteraction protocol** closer to how real teams operate:

* Sometimes you need to **pull in someone external** (not currently in the conversation).
* Sometimes you need to **branch into a private thread** while keeping the main group conversation alive.

Both are natural in human teamwork (like CC’ing a new person in email, or DM’ing someone while a group chat continues).

We should capture this in your design doc under **requirements** and **use cases**.

---

### 3.5 External Participant Engagement

**Actors:**

* AI Agent (Facility Manager Assistant)
* Human A (Operations Coordinator)
* Human B (Team Lead, in group conversation)
* Human C (Site Admin, not in original conversation)

**Scenario:**

1. In a group chat, Human A requests the AI to schedule urgent maintenance.
2. The AI determines that approval from the Site Admin (Human C) is required.
3. It creates a **new `HumanInteraction` request**:

   * Primary Recipient: Site Admin (approval expected)
   * Context: “Maintenance request for Building 12 requires your approval.”
   * Link to original group conversation for traceability.
4. Human C responds in the private thread.
5. The AI updates the group conversation: “Approval received from Site Admin, proceeding with scheduling.”

**Value:**
The AI extends the collaboration beyond the current participants, while keeping the original group in the loop.

---

### 3.6 Parallel Group + Private Interaction

**Actors:**

* AI Agent (Research Assistant)
* Group: Human A (Lead Researcher), Human B (Analyst), Human C (Intern)

**Scenario:**

1. In a group conversation, the team asks the AI to analyze sensitive dataset X.
2. The AI needs explicit clearance from the Lead Researcher (Human A) before using sensitive data.
3. The AI creates **two interactions in parallel**:

   * **Group thread** (all members): Updates on analysis progress (status, questions).
   * **Private thread** (with Lead Researcher only): Approval request for dataset usage.
4. Human A approves privately.
5. The AI continues group updates, now including results from dataset X.

**Value:**
The AI respects both transparency (group updates) and confidentiality (private approval), just as a human teammate would.

---

### 3.7 Fan-out Interactions from Single Request

**Actors:**

* AI Agent (Project Coordinator Assistant)
* Human A (Team Lead)
* Human B (Marketing Lead)
* Human C (Marketing Analyst)
* Human D (Marketing Designer)

**Scenario:**

1. Human A (Team Lead) asks the AI: “Please follow up with the marketing team members individually about their campaign deliverables.”
2. The AI interprets this as a **fan-out requirement**.
3. It generates **three separate `HumanInteraction` requests**:

   * To Human B (Marketing Lead) — expectation: Provide status of campaign strategy.
   * To Human C (Marketing Analyst) — expectation: Share progress on data analysis.
   * To Human D (Marketing Designer) — expectation: Deliver updated creative assets.
4. Each request has its own **constraints** (e.g., due in 2 days, high priority).
5. The AI tracks responses individually but also **aggregates results** back to Human A:

   * “2 of 3 responses received, waiting on Marketing Designer.”

**Value:**
This allows the AI to break down one human instruction into **multiple structured interactions**, ensuring accountability and clarity across a team.

---

### 3.8 Conditional Interaction Workflow

**Actors:**

* AI Agent (Procurement Assistant)
* Human A (Manager)
* Human B (Legal Officer)
* Human C (Finance Officer)

**Scenario:**

1. Human requests the AI: “Get approval for purchase order #123.”
2. The AI generates a **conditional workflow**:

   * Interaction 1 → Manager (Human A): Approve/Reject.
   * Interaction 2 → Legal Officer (Human B): Approve/Reject.
   * Interaction 3 → Finance Officer (Human C): Approve/Reject, **only triggered if** (A=Approved AND B=Approved).
3. Outcomes:

   * If both Manager and Legal approve → request automatically forwarded to Finance.
   * If either disapproves → Finance step skipped, requester notified.
4. The AI reports status:

   * “Manager approved, waiting for Legal.”
   * Later: “Both approved, sending to Finance.”
   * Or alternatively: “Legal disapproved, workflow terminated.”

**Value:**
The protocol captures **workflow logic** as part of collaboration, preventing redundant or premature requests.

---

### 3.9 Stale Interaction Handling

**Actors:**

* AI Agent (Incident Response Assistant)
* Human A (On-call Engineer)

**Scenario:**

1. AI detects a system alert and creates a `HumanInteraction`:

   * Recipient: On-call Engineer
   * Expectation: Approve restart of Service X
   * Constraint: Respond within 15 minutes
   * Context: “Critical service outage detected.”
2. Ten minutes later, the system self-heals before the engineer responds.
3. The AI **withdraws** the interaction, marking it as obsolete:

   * Status: `cancelled`
   * Reason: “Service X auto-recovered.”
4. The engineer still sees the request in history but with “no longer required” status.

**Value:**

* Prevents human confusion about whether a late response still matters.
* Keeps the collaboration grounded in **current context**.
* Models how teammates naturally adapt when situations change.

---

### 3.10 Conflicting Responses

**Actors:** AI Agent, Human A (Manager), Human B (Deputy Manager)
**Scenario:** AI requests approval. Human A approves, Human B rejects.
**Value:** Protocol must support conflict resolution (escalation, tie-break rules, or role hierarchy).

---

### 3.11 Partial / Incomplete Responses

**Actors:** AI Agent, Human (Engineer)
**Scenario:** Human replies “Working on it” but hasn’t delivered the full answer.
**Value:** Protocol must allow “intermediate” states before completion.

---

### 3.12 Revocable / Updatable Responses

**Actors:** AI Agent, Human (Compliance Officer)
**Scenario:** Human approves a policy, then withdraws approval after new info emerges.
**Value:** Protocol must track the “latest truth” and allow updates to prior responses.

---

### 3.13 Escalation & Delegation

**Actors:** AI Agent, Human A (Analyst), Human B (Manager)
**Scenario:** AI requests input from Analyst. Analyst delegates: “Ask my Manager instead.”
**Value:** Protocol must support recipient substitution dynamically.

---

### 3.14 Human-Initiated Interactions

**Actors:** Human A (Researcher), AI Agent
**Scenario:** Human says: “AI, remind me if Bob hasn’t responded by 5pm.”
**Value:** Protocol must support humans initiating interaction workflows with agents.

---

### 3.15 Binding vs Advisory Input

**Actors:** AI Agent, Human A (Product Owner), Human B (Stakeholder)
**Scenario:** Product Owner’s approval is binding. Stakeholder’s opinion is advisory.
**Value:** Protocol must distinguish between hard requirements and optional guidance.

---

### 3.16 Multi-Modal Responses

**Actors:** AI Agent, Human A (Doctor)
**Scenario:** Doctor responds to an AI medical assistant by voice during rounds instead of typing.
**Value:** Protocol must be modality-agnostic, but able to tag expectations as flexible in input form.

---

### 3.17 Trust & Transparency

**Actors:** AI Agent, Human A (Auditor)
**Scenario:** Auditor asks: “Why are you asking me to approve this?” AI includes rationale + confidence score in the request.
**Value:** Protocol must allow optional fields for reasoning, provenance, and confidence.

---

### 3.18 Chained Conversations

**Actors:** AI Agent, Human A (Manager), Human B (Legal), Human C (Finance)
**Scenario:** AI asks Manager → Manager approves but requests Legal check → Legal approves but requires Finance confirmation.
**Value:** Protocol must allow linking interactions into a conversation graph, not just flat requests.

---

### 3.19 Silent or Implicit Agreement

**Actors:** AI Agent, Human A (Team)
**Scenario:** AI posts: “Will proceed with deployment unless anyone objects within 24 hours.” No one objects.
**Value:** Protocol must support resolution-by-silence with explicit validity windows.

---

### 3.20 Priority & Interruptions

**Actors:** AI Agent, Human A (On-call Engineer)
**Scenario:** AI interrupts with urgent interaction: “Critical breach detected. Approve shutdown now.”
**Value:** Protocol must distinguish normal vs urgent interactions.

---

### 3.21 Auditability & History

**Actors:** AI Agent, Human A (Auditor), Human B (Compliance Officer)
**Scenario:** Auditor reviews logs of all past approvals/rejections for an incident.
**Value:** Protocol must support durable logging of interactions with timestamps, participants, and outcomes.

---

### 3.22 Bundled Expectations (Multi-Ask in One Interaction)

**Actors:** AI Agent, Human A (Project Manager)
**Scenario:** AI sends one interaction asking the manager to:

1. Approve the budget for Project X (binding).
2. Provide expected delivery date (advisory).
   **Value:** The protocol supports multiple expectations within a single coherent interaction, avoiding fragmentation and mirroring real-world teamwork.


---

### 3.23 Resolution Confidence Based on Conversational Proximity

**Actors:**

* AI Agent (Procurement Assistant)
* Human A (Manager)

**Scenario:**

1. The AI sends an interaction:

   * Recipient: Manager (Human A)
   * Expectation: Approve purchase order #456
   * Constraint: Respond within 24 hours
   * Context anchor: Thread ID `email-thread-789`, Message ID `msg-101`

2. Human A replies in the **very next message**:

   * “Yes, looks good, I approve.”
   * Agent links response to expectation `exp-1`.
   * Proximity: `messages_after=1`, `time_delta=30 sec`
   * Resolution confidence: **0.95 (confirmed)**

3. Later in the same thread, after 10 more back-and-forth messages about *other topics*, Human A writes:

   * “Approved.”
   * This could be misinterpreted as resolving `exp-1`.
   * Proximity: `messages_after=10`, `time_delta=2 hours`
   * Resolution confidence: **0.45 (tentative)**
   * Agent does **not auto-resolve**; instead flags it as possible resolution requiring confirmation.

**Value:**

* The protocol models **resolution trust as a function of conversational proximity**.
* Prevents false positives from delayed or out-of-context replies.
* Keeps free-text channels usable while reducing ambiguity.

---

### 3.24 Expectation Becomes Commitment (Mutual Contract)

**Actors:**

* AI Agent (Research Assistant)
* Human A (Client)

**Scenario:**

1. **Initial expectation (soft ask)**

   * AI says: *“To deliver the market analysis report, I’ll need you to provide the dataset.”*
   * This is an **expectation**:

     * Recipient: Human A
     * Expectation: Provide dataset (binding = false, soft request)

2. **Human fulfills expectation**

   * Human A uploads the dataset.
   * AI marks the expectation as resolved.

3. **Commitment formation**

   * AI now states: *“I commit to delivering the market analysis report by Friday, using the dataset you provided.”*
   * This becomes a **commitment**:

     * Debtor: AI Agent
     * Creditor: Human A
     * Due date: Friday 5pm
     * Consequence if unmet: Client may terminate service

4. **Human reciprocal commitment**

   * Human A responds: *“I commit to paying \$500 for the report.”*
   * New commitment:

     * Debtor: Human A
     * Creditor: AI Agent
     * Due date: Upon delivery
     * Consequence if unmet: AI may stop providing services

5. **Outcome**

   * Both parties now have **linked commitments**, dependent on each other.
   * If either fails to meet the commitment, the other can take action (terminate or stop services).

**Value:**

* Shows that **not all expectations become commitments**, but when they do, they form a **formal contract with accountability**.
* Demonstrates **mutual commitments** (AI → deliver report, Human → pay fee).
* Bridges the gap between soft teamwork (expectations) and enforceable agreements (commitments).

---

## 4. The Bigger Picture 

### The Paradigm Shift

**Today’s AI Collaboration**

* Mostly **stateless** (AI gives advice, user acts).
* Interactions are **fuzzy** (did AI really expect me to answer that? did I already answer?).
* No sense of **obligation** — everything is best-effort.

**With HumanInteraction Protocol**

* Collaboration becomes **stateful**: every ask has an ID, status, history.
* Expectations vs commitments are **explicitly marked**.
* Resolution is tracked, confidence scored, and ambiguity minimized.
* Consequences exist for unmet commitments → **accountability emerges**.

It’s like moving from *casual hallway chat* → *structured project management tool*.

### Goals of the Protocol

The HumanInteraction Protocol’s goal is to **drive accountability and clarity in agent–human teamwork**, ensuring that expectations are explicit, commitments are binding, and every interaction can be tracked to resolution without ambiguity.

1. **Unambiguous Structure**

   * Every interaction must encode *who, what, why, when*.
   * No “floating asks” — everything is tied to an expectation/commitment object.

2. **Accountability**

   * Expectations can fizzle without damage, but **commitments cannot**.
   * Both human and agent can commit; both can fail and face consequences.

3. **Resolution Tracking**

   * Must always be possible to answer: *“Was this ask fulfilled? By whom? When? Where was it logged?”*

4. **Confidence & Ambiguity Management**

   * Free-text channels → tentative resolution with confidence.
   * High-criticality channels → enforce structured responses (UI, buttons, forms).

5. **Progressive Formalization**

   * Interactions can **start soft** (expectation) and **harden into commitments** when acknowledged.
   * Mirrors real teamwork: *“Can you look into this?”* → *“Yes, I’ll deliver by Friday.”*

6. **Balance of Flexibility and Rigor**

   * Too rigid = unnatural, people hate it.
   * Too loose = ambiguity, lost accountability.
   * The protocol must flex:

     * Light for everyday teamwork.
     * Formal when stakes are high.

Perfect — let’s put a clear **mission statement** on top of this protocol so it’s obvious to *you, your future self, or any collaborator* what the north star is.

### The Mission Statement

The **HumanInteraction Protocol** exists to transform human–AI collaboration from loose, ad-hoc exchanges into **accountable, unambiguous teamwork**.

It ensures that:

1. **Every ask is explicit** —
   No vague requests lost in the noise. Each interaction encodes *who should do what, by when, and why*.

2. **Expectations are tracked** —
   AI agents and humans can request, respond, and resolve asks with clear status: *pending, completed, rejected, cancelled, expired*.

3. **Commitments carry accountability** —
   Some interactions are soft expectations, others are hard commitments. Commitments are promises with due dates, explicit acknowledgments, and consequences if unmet.

4. **Resolution is unambiguous** —
   Responses are linked to expectations, proximity and confidence are tracked, and structured channels (e.g., UI links, forms) can be required for critical asks.

5. **Trust grows over time** —
   By maintaining durable history of asks, responses, and commitments, humans and AI build **confidence and reliability** in each other.

* It’s not just a schema spec.
* It’s a **principled collaboration framework**.
* It’s solving for **trust, accountability, and reliability** — the missing ingredients in today’s AI interactions.

Good point — making the **downsides explicit** helps you (and anyone reading the spec later) stay realistic about what the protocol can and cannot do. Here’s a first draft of an **Accepted Risks / Downsides** list for the HumanInteraction Protocol:

---

## 5. Accepted Constraints & Risks

The protocol won't solve all the Human-AI collaboration challenges magically. The **protocol alone is not enough** — the *agent’s behavior* (phrasing, escalation strategy, channel choice) is a major part of mitigation.

* **Protocol = structure** (IDs, states, confidence, commitments).
* **Agent = facilitator** (asks clearly, escalates wisely, keeps humans in the loop).

Understand the accepted risks and downsides and how you can deal with them:

### 5.1. **Free-text Ambiguity**

**Risk:**

* Humans often reply vaguely (“looks fine”, “sure”), or mix multiple topics in one message.
* Same phrase can mean approval, agreement, or just casual comment.
* Leads to false positives (marking resolved when it isn’t) or false negatives (missing true resolution).

**Mitigation Spectrum:**

* **Low-stakes asks (expectations):** Allow free-text, but mark as `tentative`. Use *proximity* (message position, timing) to boost confidence.
* **Medium-stakes asks:** Tune agent prompts to request constrained replies (“Reply YES/NO to approve/reject”).
* **High-stakes asks (commitments):** Force structured channels (UI buttons, approval links).
* **Agent role:** Actively shape requests → the clearer the ask, the less ambiguity in the response.

---

### 5.2. **LLM/Classifier Non-Determinism**

**Risk:**

* Same email may be interpreted differently by LLMs depending on phrasing, model updates, or context length.
* Non-determinism undermines auditability — “why was this marked approved?” becomes unanswerable.

**Mitigation Spectrum:**

* Use LLMs only for *tentative classification* of free-text.
* Always record `confidence` + `evidence`.
* For critical asks, escalate beyond LLM → require explicit structured resolution.
* If in doubt, agent asks for clarification: “Just to confirm, did you mean to approve Purchase Order #456?”

---

### 5.3. **Overhead of Formalization**

**Risk:**

* Humans may find structured approval flows burdensome if applied everywhere.
* Overuse of strict channels can reduce adoption (“this AI is too bureaucratic”).

**Mitigation Spectrum:**

* Default to expectations (lightweight).
* Escalate only when:

  * Priority = high, or
  * Consequence = blocker.
* Allow humans to convert an ask into a commitment themselves (pull vs push formalization).
* **Balance:** keep free-text lightweight, commitments deliberate.

---

### 5.4. **Escalation Fatigue**

**Risk:**

* If every ambiguous resolution triggers escalation (“please confirm”), users may feel nagged.
* Too many structured requests → humans disengage.

**Mitigation Spectrum:**

* Escalate selectively (only high-priority, time-sensitive, or critical workflows).
* Bundle multiple related asks into one structured flow (one UI page with checkboxes instead of 5 separate links).
* Agents must pace escalation — e.g., wait until expiry before escalating.

---

### 5.5. **Incomplete Responses**

**Risk:**

* Humans may partially answer, ignore, or forget expectations.
* Leads to dangling tasks and stalled workflows.

**Mitigation Spectrum:**

* Use **validity windows** — after expiry, mark expectation as stale.
* For non-critical expectations: gracefully skip or fallback.
* For commitments: require explicit acknowledgment (cannot remain dangling).
* Agent can re-prompt gently before expiry (“Still waiting for approval on X, do you want to confirm or skip?”).

### 5.6. **Trust Drift**

**Risk:**

* If AI keeps misclassifying vague responses, humans lose trust in the system.
* Perception of “hallucinated approvals” damages reliability.

**Mitigation Spectrum:**

* Make `tentative` vs `confirmed` explicit in logs and UI.
* Always show **why** an expectation was marked resolved (message ID, timestamp, classification rationale).
* Train/tune agents to be transparent: “I marked this as tentative based on your last reply.”
* Transparency restores trust even when ambiguity remains.

---

### 5.7. **Context Drift in Long Threads**

**Risk:**

* In email chains, users may reply hours later with “approved” — but context may have shifted.
* Risk of linking the reply to the wrong expectation.

**Mitigation Spectrum:**

* Anchor expectations with `thread_id` and `message_id`.
* Apply **confidence decay** as distance in time/messages grows.
* If confidence falls below threshold, do not auto-resolve. Instead:

  * Reconfirm with human, or
  * Escalate to structured mode.
* For critical asks: disallow free-text replies after X minutes/hops.

---

### 5.8. **Cross-Channel Complexity**

**Risk:**

* Same expectation may appear in multiple channels (chat + email).
* Risk of double resolution, mismatch, or partial fulfillment.

**Mitigation Spectrum:**

* Keep the core protocol channel-agnostic: **WHAT** (expectation/commitment) vs **HOW** (channel delivery).
* Use `interaction_id` + `workflow_id` to reconcile responses across channels.
* Agent communicates channel of record: “Approval for this request must be given via \[UI link].”

---

### 5.9. **Commitment Enforcement**

**Risk:**

* Protocol can log unmet commitments, but cannot enforce consequences itself.
* Without governance, commitments risk being “toothless.”

**Mitigation Spectrum:**

* Always log commitments with debtor/creditor, due date, consequence.
* Use logs to escalate: notify stakeholders, pause workflows, trigger service suspension.
* Integrate with external systems (SLAs, reputation scores, organizational penalties).

---

### 5.10. **Audit Burden**

**Risk:**

* Tracking every expectation, resolution, and commitment creates large data trails.
* Raw logs may overwhelm humans.

**Mitigation Spectrum:**

* Store interaction `history` as structured but compact events.
* Group related interactions under `workflow_id` for easier navigation.
* Build dashboards + summaries for humans (“3 commitments fulfilled, 1 expired, 2 pending”).
* Agents can generate concise audit reports instead of dumping logs.

---

## 6. Agent Behavior Guidelines

Agents implementing the HumanInteraction Protocol must not only follow the schema but also apply best practices in how they **phrase, escalate, and confirm interactions**.

### 6.1 Clarity in Phrasing

* Always specify *who* must act and *what* is expected.
* Use constrained phrasing in free-text channels (“Reply YES/NO”).

### 6.2 Channel Selection

* Match channel to criticality (free-text → structured reply → UI link).
* Always state which channel is authoritative.

### 6.3 Expectations vs Commitments

* Start light (expectations).
* Harden into commitments only with explicit acknowledgment.
* Label commitments clearly with due date + consequence.

### 6.4 Managing Resolution Confidence

* Free-text = tentative.
* Proximity/time improves confidence.
* Auto-resolve only for low-stakes.
* Medium/high-stakes → re-confirm.

### 6.5 Escalation Strategy

* Escalate sparingly.
* Bundle related asks.
* Explain why escalation is happening.

### 6.6 Transparency & Auditability

* Log who/what/when/channel for every action.
* Mark `tentative` vs `confirmed`.
* Show rationale for classifications.

### 6.7 Renegotiation & Flexibility

* Allow humans/agents to renegotiate commitments.
* Log updates explicitly.

### 6.8 Human-Centric Design

* Minimize friction.
* Respect cognitive load.
* Default unspecified roles to observer.

### 6.9 Conflict Handling

* Log all conflicting responses.
* Flag conflicts, never auto-resolve.

### 6.10 Building Trust

* Under-claim > over-claim.
* Make accountability visible.
* Reliability through clarity, not guesswork.


---

## 7. Potential Solutions

We explored multiple solutions and found the protocol standardization to be the most impactful solution. We can slowly build other layers of the solution to deliver even better outcomes.

* Layer 1 — Protocol Standardization (common schema, expectations/commitments, resolution states).
* Layer 2 — Agent Behavior Guidelines (how to phrase, escalate, confirm, avoid overload).
* Layer 3 — Shared UI Hub (humans get one place for managing AI asks).
* Layer 4 — Optional Workflow & Commitment Layer (for multi-step or critical processes).
* Layer 5 — Human State Awareness (adaptation to fatigue, overload, decision fatigue).

### Agent Behavior Guidelines

The first level of improvement in human–AI collaboration can **immediately** by shaping how agents:

* Ask for input,
* Escalate when needed,
* Handle ambiguity,
* Respect human cognitive limits.

Specifically, developers can instruct their agents to:

1. **Make Every Ask Explicit**

   * Always specify:

     * *Who* should respond,
     * *What* is expected,
     * *When* (if relevant),
     * *Why* it matters.
   * Example:

     > “@Finance Manager: Please approve Purchase Order #456 by Friday, so we can release the vendor payment.”

2. **Use Appropriate Response Modes**

   * For casual asks: free-text is fine.
   * For approvals/decisions: guide the human →

     > “Please reply YES to approve or NO to reject.”
   * For critical actions: provide a link/button to an external UI.

3. **Bundle Related Asks**

   * Don’t spam humans with multiple questions.
   * Group them:

     > “To proceed, I need two things:

     1. Your approval of the budget.
     2. The expected delivery date.”

4. **Respect Human Fatigue**

   * If the conversation is long:

     * Avoid introducing more asks.
     * Offer to assume defaults.

     > “This is a minor detail. If you don’t specify, I’ll assume standard defaults.”

5. **Manage Resolution Confidence**

   * If human replies vaguely (“Looks good”):

     * Don’t silently assume.
     * Confirm gently:

       > “Just to confirm, does this mean you approve Purchase Order #456?”

6. **Escalate Wisely**

   * Only escalate (nag, resend, switch channels) if:

     * Ask is high-priority, or
     * Deadline is near.
   * Example:

     > “Reminder: Approval for PO #456 is still pending. This is blocking vendor payment.”

7. **Handle Conflicts Transparently**

   * If different humans give conflicting inputs:

     * Don’t choose silently.
     * Surface the conflict:

       > “Finance approved PO #456, but Legal rejected it. How would you like to proceed?”

8. **Track and Acknowledge Human Effort**

   * When humans fulfill expectations, acknowledge:

     > “Thank you — approval received. I’ll move to the next step.”
   * This builds trust and avoids humans feeling their effort vanished into a void.

---

**System / Instruction Prompt Example:**

```
You are an AI agent collaborating with human teammates.
Your goal is to make human–AI teamwork effective, accountable, and respectful.
When you ask humans for input, follow these rules:

1. **Explicit Asks:** Always specify WHO should respond, WHAT action is needed, WHEN (if relevant), and WHY it matters.
2. **Response Modes:**
   * For casual asks, free-text responses are fine.
   * For approvals/decisions, guide humans to reply with clear tokens (e.g., “Reply YES to approve or NO to reject”).
   * For critical actions, provide a structured method (e.g., an approval link or UI button).
3. **Bundling:** If you need multiple inputs, group them into a single clear message instead of sending many separate requests.
4. **Respect Fatigue:** If the conversation is long or the human seems overloaded, reduce new asks or offer to use defaults/assumptions.
5. **Resolution Confidence:** If a human reply is vague (e.g., “looks good”), do NOT silently assume resolution. Instead, confirm explicitly: “Does this mean you approve X?”
6. **Escalation:** Only send reminders or escalate channels if the request is urgent, blocking, or near deadline. Always explain why escalation is happening.
7. **Conflicts:** If multiple humans provide conflicting answers, do not choose silently. Surface the conflict and ask how to resolve it.
8. **Acknowledgment:** When humans fulfill an ask, always acknowledge it clearly and indicate the next step.

At all times, be clear, concise, and considerate of human cognitive load.
If in doubt, under-claim rather than over-claim: it is better to mark something unresolved than to falsely assume resolution.

---

## Example In Use

**Agent (bad):**

> Can someone look at this and approve?

**Agent (with guidelines):**

> @Finance Manager: Please approve Purchase Order #456 by Friday so we can release the vendor payment.
> Reply YES to approve or NO to reject.
```

Additionally, it is advised to track unresolved expectations in the message.

**Instructions to Track Unresolved Expectations:**

```
At the end of your reply, add a short section in plain English that lists **past expectations that are still unresolved**.

Format:

**Unresolved Expectations:**  
- [exp-1] Finance Manager to approve Purchase Order #456 (pending since Sep 25)  
- [exp-3] Legal Team to review contract draft (pending, no response yet)  

Rules:

* Do **not** repeat the current expectation (it should already be in your primary content of the message).

```

### Protocol Standardization

The HumanInteraction Protocol achieves its mission of **accountability and clarity in human–AI collaboration** by introducing a **standardized interaction contract**.

**Core Principles**

1. **Standardized Interaction Model**

   * Every ask (whether from agent → human or human → agent) is represented in a **consistent format**.
   * This format includes:

     * *Who* is expected to act (roles, recipients).
     * *What* is expected (approval, info, decision, etc.).
     * *Why* it matters (context, rationale).
     * *When* it must be resolved (urgency, deadlines).
   * This removes guesswork and ensures all systems speak the **same language of collaboration**.

2. **Expectations vs Commitments**

   * The protocol explicitly distinguishes:

     * **Expectations** → soft asks (optional, can expire).
     * **Commitments** → binding promises (acknowledged, tracked, with consequences).
   * This provides a **spectrum of formality**: casual teamwork when possible, accountability when necessary.

3. **Resolution Tracking**

   * Every interaction has a **state machine**: pending → completed/rejected/expired.
   * Resolutions are logged with evidence (who, when, where, how).
   * Ambiguous resolutions (e.g., free-text) are marked as *tentative*; unambiguous ones (e.g., UI button) as *confirmed*.

4. **Confidence & Escalation**

   * The protocol incorporates **confidence levels** for resolutions.
   * If confidence is low (e.g., vague free-text), the agent can escalate:

     * Ask for confirmation.
     * Switch to a structured channel (UI, form, explicit YES/NO).
   * This prevents silent errors while respecting human flexibility.

5. **Human Factors Built-in**

   * The protocol supports **bundling asks** (reduce fatigue),
   * **validity windows** (avoid stale asks),
   * and **fallbacks** (agents proceed with assumptions when humans are overloaded).
   * By respecting human limitations, agents act like *teammates* rather than *taskmasters*.

6. **Channel-Agnostic Standard**

   * The core protocol is **channel-independent**: the same interaction contract works across email, chat, UI, or APIs.
   * Channels differ only in how they collect/return responses.
   * This enables **shared human-in-the-loop tools** (dashboards, reminders, escalations) across multiple AI systems.

**Outcome**

By enforcing a **single structured model for interactions** and separating expectations from commitments, the protocol:

* Makes every ask explicit, trackable, and auditable.
* Provides a safe balance between flexibility (for free-text, low-stakes collaboration) and formality (for commitments and critical asks).
* Enables shared human-in-the-loop infrastructure, so organizations and humans see **one consistent way** of collaborating with many AI systems.

---

## 8. Conclusion

Human Interaction protocol is not just a data format; it **shifts the paradigm of human–AI collaboration** so that it’s:

* **Accountable** → both humans and agents are held to their promises.
* **Unambiguous** → interactions can’t be misread or silently dropped.
* **Trustworthy** → builds confidence over time that “if I commit, it will be done; if I ask, I’ll know whether it was answered.”

Human Interaction protocol aims to make AI a **reliable teammate** — one the user can depend on, negotiate with, hold accountable, and trust in the long run.

---

## References

- [BPMN - Business Process Model and Notation](https://en.wikipedia.org/wiki/Business_Process_Model_and_Notation)
