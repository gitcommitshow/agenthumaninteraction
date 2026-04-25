---
title: Overview
description: Mission, core requirements, and non-goals for the HumanInteraction protocol (one-pager).
slug: docs/overview
editUrl: https://github.com/gitcommitshow/agenthumaninteraction/edit/main/docs/HumanInteraction%20-%20One%20Pager.md
---

# Requirements for HumanInteraction Protocol

## 1. Mission / Purpose

The HumanInteraction Protocol exists to drive **accountability, clarity, and trust** in agent–human collaboration by:

* Making every ask explicit.
* Tracking whether it was answered.
* Distinguishing soft expectations from hard commitments.
* Ensuring both humans and agents can be held accountable.

---

## 2. Core Requirements

### 2.1 Clarity of Expectations

* MUST support expressing **who, what, why** for every ask.
* MUST allow multiple types of expectations (approval, info, decision, advisory, creative input).
* SHOULD allow bundling multiple expectations together.
* MUST capture context so humans know *why* they are asked.

---

### 2.2 Roles & Participation

* MUST support explicit roles: primary, approver, contributor, observer.
* SHOULD default unspecified roles to observer (no action required).
* MUST allow inviting new participants mid-conversation.
* MUST support both group and private interactions.

---

### 2.3 Commitments & Accountability

* MUST distinguish between **expectations** (soft asks) and **commitments** (binding promises).
* MUST require explicit acknowledgment before an expectation becomes a commitment.
* MUST support commitments with: debtor, creditor, due date, and consequences if unmet.
* MUST allow commitments to be renegotiated, revoked, or updated.
* SHOULD support mutual commitments (e.g., “You deliver report, I pay fee”).

---

### 2.4 Resolution & Tracking

* MUST track the state of every expectation/commitment (pending, completed, rejected, expired, cancelled).
* MUST support linking human responses to specific expectations/commitments.
* MUST allow marking resolutions as **tentative** (uncertain, e.g. free-text interpretation) vs **confirmed** (explicit, unambiguous).
* MUST support expiration of stale expectations.
* SHOULD record evidence for resolution (who, when, where, how).

---

### 2.5 Confidence & Ambiguity

* MUST acknowledge that free-text channels are ambiguous.
* MUST allow **confidence scoring** for resolutions based on content match and conversational proximity.
* SHOULD support escalation when confidence is low (ask for clarification, switch to structured channel).
* MUST prevent silent misclassification: tentative resolutions should be visible as tentative, not hidden.

---

### 2.6 Workflow & Logic

* MUST support conditional interactions (e.g., if A and B approve, ask C).
* MUST support fan-out (one input triggers multiple asks).
* MUST support chaining (expectation → commitment → next step).
* SHOULD support implicit defaults (e.g., no objection = proceed).

---

### 2.7 Human Factors

* MUST allow humans to decline or defer.
* SHOULD allow agents to account for human limitations (fatigue, overload, timing).
* MUST provide fallback paths if expectations aren’t met (skip, escalate, cancel).
* MUST minimize unnecessary friction: only escalate or formalize when needed.

---

### 2.8 Transparency & Trust

* MUST make accountability visible: who is expected, who committed, who resolved.
* MUST log rationale for resolutions (tentative vs confirmed).
* SHOULD allow provenance and audit trails.
* MUST prefer under-claiming over false resolution (better to mark unresolved than resolved incorrectly).

---

### 2.9 Multi-Channel Support

* MUST be channel-agnostic: same protocol works across email, chat, UI.
* MUST allow specifying the authoritative response channel.
* SHOULD support escalation to structured channels when stakes are high.
* MUST allow cross-channel reconciliation (same expectation tracked across email + UI).

---

## 3. Constraints / Non-Goals

* The protocol cannot make free-text fully deterministic.
* Enforcement of commitments (penalties, rewards) lies outside the protocol; it can only log and expose violations.
* Not all expectations are commitments — soft asks may expire or remain unresolved without consequence.