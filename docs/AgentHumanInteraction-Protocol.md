---
title: Protocol specification
description: Message schema, field reference, workflows, scenarios, and implementation examples for HumanInteraction.
slug: docs/protocol
editUrl: https://github.com/gitcommitshow/agenthumaninteraction/edit/main/docs/AgentHumanInteraction-Protocol.md
---

# HI - Human Interaction Protocol For Agents/Bots

## Overview

With the increasing use of AI agents in decision-making workflows, ensuring smooth, transparent, and standardized interactions between agents and human stakeholders is critical. The effective use of AI agents requires humans and AI working together as a team.

This document outlines key recommendations for designing agent-to-human interactions, integrating existing standards and protocols, and includes implementation examples using JavaScript (Node.js).

### Scope and principles

`HumanInteraction` defines the standard for the Agents (LLM/thinking layer) to express what they expect from humans. The protocol specifies **who should receive what**, what is expected, some delivery constraints, and some context to execute the interaction.

* Supports only Agent-Human interaction, it does not support bots or inter-agent communication.
* The spec must be reusable for various delivery channels **chat, email, and UI**.
* The spec must handle **privacy**, **content variants**, and **intent**, but **not delivery orchestration**.
* **Message visibility and personalization** are critical — especially when messages fan out to multiple participants.
* The spec should cover context to ensure the **message is not stale** because of the delay in response or action or system state change or the change in conversation context
* The spec should provide info about expectation of response from the humans and a high-level context about how and when this expectation will be considered resolved. This can be non-deterministic for most cases, but the spec should be extensible to make it more deterministic.
* The spec data format must be simple for the LLMs to generate, reducing errors due to hallucination
* It should be easy to apply `HumanInteraction` as a wrapping layer on top of current AI input/response structure, making its adoption easier

---

## 1. Core Design Principles

### 1.1 Human-in-the-Loop (HITL)

Agents should be able to:

* Pause workflows awaiting human decision.
* Escalate low-confidence outputs.
* Accept feedback and apply corrections.

### 1.2 Transparency & Auditability

Interactions must be:

* Logged with time stamps.
* Traceable (who approved what and why).
* Explainable (why did the agent reach its output?).

### 1.3 Usability (based on ISO 9241)

* Provide control to users.
* Display clear options (e.g., approve, revise, reject).
* Maintain a consistent and predictable interface.

### 1.4 Governance & Human Awareness (based on NIST HITL)

* Include metadata for reviewer identification and role-based accountability.
* Support fields that enable tracking of human factors such as trust and cognitive load.
* Accommodate multi-human collaboration, consensus resolution, and traceable roles.

---

## 2. Specification: Agent-Human Interaction Protocol

### 2.1 Purpose

To define a standard message schema and interaction flow between autonomous agents and one or more human reviewers.

2.1.1 We propose `HumanInteraction`, a specification of Agent's request for interaction with humans to deliver the best outcome.
2.1.2 Agent prescribes the one or more `HumanInteraction` and the Human provides the `HumanFeedback`.
2.1.3 Agent may prescribe multiple `HumanInteraction` in a single interaction.
2.1.4 The result of `HumanInteraction` (the `HumanFeedback`) can be consumed by the Agent to deliver the best outcome.
2.1.5 These interactions are logged and can be used for accountability and governance.
2.1.6 These interactions can be as simple as a single question to one human or as complex as approval from multiple people in a sequence, notification to others, and optional input from some. These multi-party interactions may lead to conflicts and require resolution.
2.1.7 The HumanInteraction can be a necessary step (e.g. clarification or approval) to complete the human's initial request and generally require Agent to leverage this human feedback to move forward with the request. `HumanInteraction` can be the final outcome as well e.g. notifying humans about the outcome of the request.
2.1.8 For the simplicity, the scope of `HumanInteraction` is limited to the immediate interaction after an event (agent's output), not the series of interactions with one human. In simpler words, `HumanInteraction` represents the smallest unit of interaction prescribed by the Agent.

### 2.2 Message Format (JSON)

A generic interaction message supporting unified collaboration can be represented in JSON:

```json
{
  "interactionId": "abc123",
  "groupId": "grp789",
  "coordinationMode": "centralized",
  "resolutionPolicy": "majority",
  "timestamp": "2025-06-24T10:00:00Z",
  "agentInstanceId": "agent-XZ01:exec-5589",
  "participants": [
    { "id": "user-108", "role": "compliance_analyst" },
    { "id": "user-222", "role": "finance_approver" }
  ],
  "agentOutput": {
    "summary": "This invoice exceeds the threshold.",
    "confidence": 0.62
  },
  "type": "approval",
  "urgency": "blocking",
  "userActions": ["approve", "edit", "reject", "submit_text"],
  "status": "awaiting_input",
  "humanFactors": {
    "trustLevel": 0.8,
    "fatigueScore": 0.2
  },
  "history": []
}
```

#### Field Reference Table

| Field                | Type           | Purpose                                                                     |
| -------------------- | -------------- | --------------------------------------------------------------------------- |
| `interactionId`      | string         | Unique ID for the interaction instance                                      |
| `groupId`            | string         | Optional. Used to link related interactions (for distributed mode)          |
| `coordinationMode`   | string         | `centralized` or `distributed`—indicates how multiple participants are handled |
| `resolutionPolicy`   | string         | `first_response`, `majority`, `all_required`, etc.                          |
| `timestamp`          | ISO8601 string | Time when interaction was created                                           |
| `agentInstanceId`    | string         | Unique id for the agent instance                                            |
| `participants`       | array          | List of participant metadata (ID and role)                                  |
| `agentOutput`        | object         | Summary and confidence from the agent                                       |
| `type`               | string         | Type of interaction (e.g., approval, notification)                          |
| `urgency`            | string         | Urgency level (e.g., blocking, recommended)                                 |
| `userActions`        | array          | Permitted actions for the human participants                                |
| `status`             | string         | Current state of the interaction                                            |
| `humanFactors`       | object         | Trust and fatigue levels, if applicable                                     |
| `history`            | array          | Logs of participant responses and decisions                                 |

### 2.3 Interaction Workflow

1. Agent sends output with metadata, type, and urgency.
2. System evaluates whether human input is required.
3. If required, each participant may act based on their role.
4. Human responses are logged independently in the `history`.
5. The system determines resolution logic (e.g., first response, majority, all must act).
6. Feedback can also be initiated unsolicited by any user.
7. System updates status and logs results.

### 2.4 Error Handling

* Invalid or missing interaction ID (when expected): return 404.
* Unsupported action: return 400.
* Allow for unsolicited feedback with synthetic interaction ID.
* Detect and manage conflicting inputs.
* Log all interaction attempts for auditing.

---

## 3. Interaction Scenarios and State Transitions

This section describes real-world scenarios using the unified interaction spec, showing how state changes throughout the interaction lifecycle.

### Scenario 1: Agent-Initiated Single Human Interaction

* **Trigger**: Agent detects low confidence or high-risk condition.
* **Creates**: One interaction with a single participant.
* **State flow**:

  1. `status = awaiting_input`
  2. Participant submits feedback → `history[]` updated
  3. System applies resolutionPolicy (e.g., `first_response`) → `status = resolved`

### Scenario 2: Agent-Initiated Multi-Human Interaction

* **Trigger**: Agent requires input from multiple roles (e.g., compliance + finance).
* **Creates**: One centralized interaction (or multiple linked ones with `groupId`)
* **State flow**:

  1. `status = awaiting_input`
  2. Participants submit feedback independently → `history[]` accumulates
  3. Resolution policy applied (e.g., `majority`, `all_required`) → `status = resolved`

### Scenario 3: Human-Initiated Agent Interaction

* **Trigger**: A user wants to override, revise, or raise a new issue not prompted by the agent.
* **Creates**: A feedback-only interaction where:

  * `agentOutput = null`
  * `type = feedback`, `urgency = optional`
* **State flow**:

  1. System logs feedback as `status = received`
  2. Agent (or participant dashboard) can reference this input for future decisions

Each scenario uses the same interaction schema, enabling consistent logging, UI behavior, and downstream auditing.

## 4. Node.js Implementation Example

The following Node.js example demonstrates a full interaction lifecycle:

### 4.1 Step-by-Step Workflow

1. **Agent sends a request for human input** via `/agent-output`.
2. The system stores this interaction and returns it to the agent or UI client.
3. One or more **human participants submit feedback** through `/human-feedback`.
4. The system tracks individual responses and evaluates them based on `resolutionPolicy`.
5. Once the resolution is met (e.g., majority approval), the **system updates the status** and notifies the agent or downstream process.

### 4.2 Agent returns human interaction requirement

```javascript
// Agent running...
// Needs human feedback...
// Creates a new HumanInteraction request...
// Pauses execution (saves the state with link to the HI request)...
const interaction = {
  interactionId,
  groupId: groupId || null,
  coordinationMode: coordinationMode || 'centralized',
  resolutionPolicy: resolutionPolicy || 'first_response',
  timestamp: new Date().toISOString(),
  agentInstanceId,
  participants,
  agentOutput,
  type,
  urgency,
  userActions: ["approve", "edit", "reject"],
  status: 'awaiting_input',
  humanFactors: {},
  history: []
};
```

### 4.3 POST /human-feedback — Human submits feedback

```javascript
app.post('/human-feedback', (req, res) => {
  const { interactionId, participantId, action, reason, inputText } = req.body;
  const interaction = interactionLog.find(i => i.interactionId === interactionId);
  if (!interaction) return res.status(404).send('Interaction not found');
  interaction.history.push({
    participantId,
    action,
    reason: reason || null,
    inputText: inputText || null,
    timestamp: new Date().toISOString()
  });
  // Resolution logic example: auto-resolve on first valid response
  if (interaction.resolutionPolicy === 'first_response' && interaction.history.length > 0) {
    interaction.status = 'resolved';
  } else if (interaction.resolutionPolicy === 'majority') {
    const counts = interaction.history.reduce((acc, h) => {
      acc[h.action] = (acc[h.action] || 0) + 1;
      return acc;
    }, {});
    if (counts['approve'] >= Math.ceil(interaction.participants.length / 2)) {
      interaction.status = 'resolved';
    }
  }
  res.status(200).json({ message: 'Feedback recorded', interaction });
});
```

---

## 5. Frontend Integration Example

To use the interaction specification on the frontend, developers should render interaction messages as tasks or notifications with the ability for human reviewers to respond. Here's a basic React-based example:

### 5.1 React UI Example (Simplified)

```jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const InteractionReview = ({ interactionId }) => {
  const [interaction, setInteraction] = useState(null);
  const [action, setAction] = useState('');
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    axios.get(`/api/interactions/${interactionId}`)
      .then(res => setInteraction(res.data))
      .catch(console.error);
  }, [interactionId]);

  const submitFeedback = async () => {
    await axios.post('/human-feedback', {
      interactionId,
      participantId: 'user-108',
      action,
      reason: 'Reviewed by analyst',
      inputText
    });
    alert('Feedback submitted.');
  };

  if (!interaction) return <p>Loading...</p>;

  return (
    <div>
      <h2>Interaction Review</h2>
      <p><strong>Summary:</strong> {interaction.agentOutput.summary}</p>
      <p><strong>Confidence:</strong> {interaction.agentOutput.confidence}</p>
      <label>Action: 
        <select value={action} onChange={e => setAction(e.target.value)}>
          {interaction.userActions.map(a => <option key={a}>{a}</option>)}
        </select>
      </label>
      <br />
      <label>Comment:
        <textarea value={inputText} onChange={e => setInputText(e.target.value)} />
      </label>
      <br />
      <button onClick={submitFeedback}>Submit Feedback</button>
    </div>
  );
};

export default InteractionReview;
```

### 5.2 Notes

* This frontend consumes the `/agent-output` API to render content and `/human-feedback` to submit responses.
* You can enhance this with user authentication, reviewer role display, or timeline/history views.

---

## 6. Recommendations

* Use structured JSON messages with clearly defined fields.
* Include `agentInstanceId`, and a list of `participants` for multi-party accountability.
* Use `groupId`, `coordinationMode`, and `resolutionPolicy` to unify centralized and distributed workflows.
* Track individual participant responses in `history` for transparency and resolution logic.
* Accommodate cognitive metrics (`trustLevel`, `fatigueScore`) to inform adaptive UX.
* Support unsolicited feedback to enhance adaptability.
* Implement secure, API-driven collaboration flows with audit trails.

## 7. Relevant Standards & Specifications

### 7.1 NIST HITL Guidelines

* Standardized modular components for interaction.
* Clearly structured data messages for approvals and annotations.
* Governance fields for accountability.
* Human-awareness tracking to prevent overtrust or fatigue.

### 7.2 Model Context Protocol (MCP)

* Proposed for interoperable agent-to-human interactions.
* Useful for secure data exchange, context sharing.

### 7.3 ISO 9241-210 & 110

* Human-centered design principles for interactive systems.
* Dialogue principles for user interaction models.

---

## 8. Conclusion

By adopting these recommendations, developers can create human-centric, reliable, and accountable AI systems. The integration of HITL principles, support for multi-human collaboration, and standardized protocols ensures that human oversight remains effective and scalable in AI-driven workflows.

---

## 9. References
- National Institute of Standards and Technology (NIST), Special Publication 1270, Human-Centered Artificial Intelligence (Draft), 2022. https://doi.org/10.6028/NIST.SP.1270-draft
- [Model Context Protocol (MCP)](https://modelcontextprotocol.io/specification/)
- International Organization for Standardization, ISO 9241-210:2019 – Ergonomics of human-system interaction — Part 210: Human-centred design for interactive systems.
- International Organization for Standardization, ISO 9241-110:2020 – Ergonomics of human-system interaction — Interaction principles.
- [Azorus: Commitments over Protocols for BDI Agents](https://www.csc2.ncsu.edu/faculty/mpsingh/papers/mas/AAMAS-25-Azorus.pdf)
- [Chain of Thought Explanation for Dialogue State Tracking](https://arxiv.org/abs/2403.04656)
- [Agent Commitments and Ranking of Commitment Protocols](https://www.ijarcce.com/upload/2015/april-15/IJARCCE%2012.pdf)

---
<!-->
## Three Abstraction Levels to Choose From

### **Option A: Minimal Schema (Core Interaction Only)**

> Focuses only on task-level coordination.

**Includes:**

* Interaction type, status, participants
* Resolution policies
* Agent output + human feedback

**Excludes:**

* Message content
* Visibility rules
* Personalization

**Pros:** Very clean, interoperable.

**Cons:** Not enough for chat/email personalization or privacy handling.

---

### **Option B: Intent-Aware with Privacy Recommendations** (*Recommended direction*)

> Includes everything needed for communication-aware interaction, but leaves final delivery formatting to client logic.

**Adds:**

* `initiatedByAgent`: who started the interaction
* `audience`: who is part of the interaction and in what role
* `messageVariants`: personalized content per recipient
* `visibilityPreferences`: privacy guidance (e.g. “don’t reply all”)

This **empowers the LLM/thinking layer** to encode:

* Who needs to be contacted
* What content is meant for each person
* Whether threads should be isolated
* Whether observers (e.g. CCs) can see full message content

**Pros:** Balances structure with flexibility; leaves delivery decisions to infra; enables personalized multi-human collaboration.

**Cons:** Slightly more complex schema.

---

### **Option C: Delivery-Prescriptive (Too Heavy)**

> Starts modeling actual channels, delivery modes, and threading (e.g., `"sendAs": "direct_email"`, `"threadId"`)

This creates a communication protocol on top of the interaction spec.

**Cons:** Oversteps the schema’s domain; inflexible across platforms; risks tight coupling with delivery channels.

<--->