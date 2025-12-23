# Vouch — Product Document

## 1. Overview

Vouch is a Progressive Web App (PWA) for forming curated circles of people using a vouch-based access control system.

The product is built around intentional access, local trust, and constrained growth. It prioritizes who enters a space over post-hoc moderation or engagement optimization.

## 2. Product Principles

These principles guide both current implementation and future decisions.

- No abundance. Only intention.
- Trust is contextual and local.
- Access control precedes content moderation.
- Consequences are enforced by the system, not socially negotiated.
- Simplicity over configurability.

## 3. Current State (What Is Built Today)

The following functionality is implemented and working in the current version.

### 3.1 Platform

- Progressive Web App (PWA)
- Authenticated user accounts
- Server-side enforcement of access rules

### 3.2 Community Creation

Users can create communities and configure access rules at creation time.

**Configurable settings:**

- Number of vouches required to enter (1, 2, or 3)
- Cooldown period between issuing vouches (7 or 30 days)
- Cover image (optional)

All communities appear on the discover page. Communities are never open-join.

### 3.3 Roles (Implemented)

Roles are scoped per community.

**Creator**

- Full control over access
- No vouch cooldown
- A single vouch from the creator instantly admits the user
- Can promote members to validators
- Can remove members

**Validator**

- Trusted access-control role
- Fixed 7-day cooldown between vouches
- A single vouch from a validator instantly admits the user
- Focused on who enters, not content moderation

**Member**

- Standard participant
- Can interact within the community
- Can vouch subject to community cooldown constraints (7 or 30 days)

### 3.4 Vouching System (Implemented)

Users can vouch for other users within a community.

Each vouch:

- is scoped to a single community
- is private
- is persistent

Vouching triggers a cooldown during which further vouches are blocked.

**Entry into a community occurs either:**

- After receiving the required number of vouches from regular members, OR
- Immediately upon receiving a single vouch from a creator or validator

Cooldowns and vouch eligibility are enforced server-side.

### 3.5 Penalty Enforcement (Implemented)

When a member is removed from a community:

- The system automatically identifies who vouched for them
- Trust penalties (doubled cooldowns) are applied silently
- No public attribution or social blame occurs

The creator does not manually assign penalties.

### 3.6 Discovery (Implemented)

A discovery page exists.

All communities appear in discovery (there is no opt-out mechanism currently).

Discovery surfaces:

- community name
- description
- cover image
- access requirements (required vouches, cooldown period)
- member count

Discovery does not expose trust relationships or activity metrics.

### 3.7 Join Requests (Implemented)

Users can request to join a community from the discover page.

- Requests are visible to community members
- Members can vouch for requesters from a dedicated requests page
- Requests are automatically cleaned up when a user is admitted

### 3.8 Community Interaction (Implemented)

Each community includes two interaction surfaces:

**Chat**

- Chronological message stream
- Text-based
- Simple persistence in database
- Polling-based updates (3-second intervals)
- No reactions, no algorithms

**Moments**

- Post-based interface
- Supports text and images
- Supports comments
- Chronological ordering
- Polling-based updates (5-second intervals)
- Intended for slower, higher-signal updates

## 4. Core Concepts (System Model)

This section defines the conceptual model behind the current implementation.

### 4.1 Users

- Single identity per user
- No global reputation
- No follower graph

### 4.2 Communities

- Isolated trust contexts
- Independent access rules
- Independent social graphs

### 4.3 Social Graph

Vouch maintains an implicit, local trust graph per community.

- Nodes: users
- Edges: directed vouches
- Scope: per community
- Visibility: internal only

The graph is used exclusively for:

- access eligibility
- cooldown enforcement
- penalty application

It is not exposed to users, validators, or creators.

## 5. Explicit Non-Goals (Current)

The following are intentionally not part of the current product:

- Open enrollment
- Global reputation or scoring
- Public trust graphs
- Follower or friend relationships
- Algorithmic feeds
- Engagement optimization
- Real-time messaging infrastructure (WebSockets)
- Monetization features

## 6. Future / Planned Features

The following features are planned for future iterations:

### 6.1 Discoverability Controls

Allow communities to control their visibility:

- **Discoverable:** Appears on the public discover page
- **Hidden:** Only accessible via direct link or invitation

Communities would be hidden by default, preserving the principle that access is intentional.

### 6.2 Final Approval Mode

An optional community setting where, after a user receives the required number of vouches from regular members, a creator or validator must give final approval before the user is admitted.

This adds an additional layer of intentionality for communities that want collective vouching combined with trusted oversight.

### 6.3 Other Future Explorations

- Temporary or event-based circles
- More nuanced access rules (e.g., tiered vouch requirements)
- Inter-circle introductions (carefully designed)
- Vouch expiration or decay

All future work should preserve the core principle that scarcity is a feature, not a bug.

## 7. Summary

Vouch is a system for:

- making curated groups visible without making them open
- enforcing intentional access through social trust
- preserving small, high-signal spaces over time

The product treats access design as the primary lever for quality and intentionally avoids features that encourage unbounded growth or performative social behavior.

