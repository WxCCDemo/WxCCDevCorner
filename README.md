# WxCC Dev Corner

An interactive solution hub for exploring how Webex Contact Center can be extended with APIs, webhooks, desktop widgets, Flow Designer integrations, reporting experiences, and customer/partner use cases.

This repository is intended for developers, solution engineers, architects, partners, and customer-facing teams who want a practical catalog of extensibility capabilities and implementation patterns.

## What You Can Explore

The guide is organized around the main ways builders extend Webex Contact Center:

| Area | What It Covers |
| --- | --- |
| Explorer | A clickable map of the Webex Contact Center extensibility landscape |
| Getting Started | Authentication, OAuth, Service Apps, scopes, tokens, and first API calls |
| REST APIs | Tasks, agents, queues, configuration, pagination, and API usage patterns |
| Webhooks | Real-time events, payloads, listener setup, retries, and validation |
| Desktop SDK | Custom agent desktop widgets, screen pops, events, and desktop actions |
| Flow Designer | HTTP nodes, flow variables, routing logic, and IVR integrations |
| Reporting | Realtime dashboards, historical analytics, CDR exports, and reporting APIs |
| FAQ | Common implementation questions and troubleshooting guidance |

## Solution Capability Map

Use the overview page to understand the scope of solution capabilities covered by this hub:

- Authentication and setup
- REST API fundamentals
- Webhooks and event-driven integrations
- Desktop SDK widgets
- Flow Designer HTTP integrations
- Reporting and analytics
- Published samples and solution patterns

Each page is designed to connect a capability area to practical implementation details: what the feature is, when to use it, what the API pattern looks like, and which published sample can help you go deeper.

## Design Goal

The guide is built as an interactive learning experience, not just static documentation.

The first page introduces a clickable topic explorer. The same style can be extended across the guide:

| Page | Interactive Experience |
| --- | --- |
| Getting Started | Choose the right auth model: Personal Token, OAuth, or Service App |
| REST APIs | Browse API categories by use case |
| Webhooks | Explore events by payload, handler, retry, and security pattern |
| Desktop SDK | Follow a widget journey from layout JSON to SDK events and actions |
| Flow Designer | Walk through IVR input, HTTP node calls, variables, and routing decisions |
| Reporting | Explore realtime, historical, and export-oriented data patterns |
| FAQ | Search and filter by topic, role, use case, and error type |

## Visual Direction

The visual style is based on a calm Cisco/Webex-inspired palette:

- Deep navy for structure and navigation
- Teal or cyan for primary highlights
- White and light slate for readable content surfaces
- Restrained domain accents for scanability

Suggested domain accents:

| Domain | Accent |
| --- | --- |
| Authentication | Blue |
| REST APIs | Green |
| Webhooks | Amber |
| Desktop SDK | Violet |
| Flow Designer | Coral |
| Reporting | Cyan |

The accent colors should guide readers through the experience without overwhelming the content.

## Sample Code

The guide should connect concepts to working sample code. These repositories are the recommended sources for implementation examples:

- [WebexSamples/webex-contact-center-api-samples](https://github.com/WebexSamples/webex-contact-center-api-samples)
- [CiscoDevNet/webex-contact-center-provider-sample-code](https://github.com/CiscoDevNet/webex-contact-center-provider-sample-code)

Recommended sample mapping:

| Guide Area | Sample Direction |
| --- | --- |
| Getting Started | Postman, app auth, and token management samples |
| REST APIs | App auth and configuration samples |
| Webhooks | Webhook notification and recording-related samples |
| Desktop SDK | Widget, Desktop JS SDK, and call-control samples |
| Flow Designer | HTTP backend and provider-side examples |
| Reporting | GraphQL, wallboard, and reporting connector samples |
| Advanced Provider Patterns | CiscoDevNet provider sample code |

Each sample reference should help readers understand what the sample teaches, when to use it, and what to explore next.

## Mental Models

Use these patterns when deciding which extensibility option fits a use case:

- Use REST APIs when you need to look up or manage contact center state.
- Use webhooks when you need to react to change.
- Use Flow Designer before the contact reaches an agent.
- Use Desktop SDK after the contact reaches the agent desktop.
- Use reporting APIs when you need dashboards, exports, trends, or analytics.
- Use provider samples when exploring advanced platform integration scenarios.

## Reference Links

- [Webex Contact Center developer documentation](https://developer.webex.com/webex-contact-center/docs)
- [Webex Contact Center API samples](https://github.com/WebexSamples/webex-contact-center-api-samples)
- [CiscoDevNet provider sample code](https://github.com/CiscoDevNet/webex-contact-center-provider-sample-code)

## Disclaimer

This guide is for learning, demos, and solution exploration. It references public sample repositories from WebexSamples, CiscoDevNet, and related developer sources. Code, sample projects, and repository assets remain credited to their original owners and are governed by the license and README in each linked repository.

For production integrations, validate current behavior against the official Webex developer documentation and follow security-first design practices for credentials, scopes, reliability, and tenant isolation.
