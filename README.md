# WxCC Extensibility Guide

An interactive developer guide for learning how Webex Contact Center can be extended with APIs, webhooks, desktop widgets, flow integrations, and reporting experiences.

Live guide: https://wxccdemo.github.io/WxCC-Extensibility-Guide/

## What This Is

The WxCC Extensibility Guide is a browser-based learning hub for builders who want to understand the main extension points of Webex Contact Center.

It is designed to help readers answer practical questions:

- Where do I start?
- Which API or SDK should I use?
- What is the difference between REST APIs, webhooks, Flow Designer, Desktop SDK, and reporting APIs?
- Which sample should I try first?
- How do these pieces fit together in a real integration?

The guide starts with an interactive explorer, then leads into deeper topic pages for authentication, REST APIs, webhooks, Desktop SDK, Flow Designer, reporting, and FAQs.

## Who This Is For

This guide is useful for:

- Developers building Webex Contact Center integrations.
- Solution engineers explaining extensibility options.
- Architects comparing API, event, desktop, flow, and reporting patterns.
- Partners looking for implementation starting points.
- Learners who want a guided path before jumping into API documentation.

## Guide Pages

| Page | What It Helps You Understand |
| --- | --- |
| [Explorer](index.html) | The full WxCC extensibility landscape in one interactive map |
| [Getting Started](getting-started.html) | Authentication, OAuth, Service Apps, scopes, tokens, and first API calls |
| [REST APIs](rest-apis.html) | Tasks, agents, queues, configuration, pagination, and API usage patterns |
| [Webhooks](webhooks.html) | Real-time events, payloads, listener setup, retry behavior, and validation |
| [Desktop SDK](desktop-sdk.html) | Custom agent desktop widgets, screen pops, events, and desktop actions |
| [Flow Designer](flow-designer.html) | HTTP nodes, flow variables, routing logic, and IVR integrations |
| [Reporting](reporting.html) | Realtime dashboards, historical analytics, CDR exports, and reporting APIs |
| [FAQ](faq.html) | Searchable answers for common implementation questions |

## Recommended Learning Path

Start here if you are new:

1. Open [index.html](index.html).
2. Click a topic node in the explorer.
3. Read the short concept, use cases, code preview, and FAQs.
4. Open the full documentation page for that topic.
5. Follow a related sample from one of the sample repositories.

Suggested order:

1. Authentication and setup
2. REST API fundamentals
3. Webhooks and event-driven integrations
4. Desktop SDK widgets
5. Flow Designer HTTP integrations
6. Reporting and analytics

## Interactive Experience Direction

The first page sets the right pattern: clickable topics, compact explanations, and guided discovery.

The goal is to carry that same interactive feel across every page:

| Page | Recommended Interactive Pattern |
| --- | --- |
| Getting Started | Auth decision tree: Personal Token vs OAuth vs Service App |
| REST APIs | Clickable API surface map for tasks, agents, queues, config, and reporting |
| Webhooks | Event explorer: event type, payload, handler, retry, and security |
| Desktop SDK | Widget builder journey: layout JSON, SDK init, events, and actions |
| Flow Designer | Visual flow path: IVR input, HTTP node, variables, and routing |
| Reporting | Data pipeline map for realtime stats, historical reports, and CDR exports |
| FAQ | Filters by topic, role, use case, and error code |

## Design Direction

The guide uses a Cisco/Webex-inspired visual style. The recommended direction is a cleaner, more premium palette:

- Primary: deep navy
- Secondary: teal or cyan
- Background: white and light slate
- Text: dark slate
- Accents: one restrained color per domain

Suggested accents:

| Domain | Accent |
| --- | --- |
| Authentication | Blue |
| REST APIs | Green |
| Webhooks | Amber |
| Desktop SDK | Violet |
| Flow Designer | Coral |
| Reporting | Cyan |

Use accent colors for badges, borders, icons, active states, and diagram highlights. Keep large surfaces calm and readable.

## Sample Code Sources

This guide should point readers to working samples instead of isolated snippets.

Primary sample repository:

- [WebexSamples/webex-contact-center-api-samples](https://github.com/WebexSamples/webex-contact-center-api-samples)

Use it for:

- Postman and API fundamentals
- App authentication
- Token management
- Configuration API examples
- GraphQL and reporting samples
- Webhook notification samples
- Callback samples
- Desktop widget samples
- Desktop JS SDK samples

Advanced/provider sample repository:

- [CiscoDevNet/webex-contact-center-provider-sample-code](https://github.com/CiscoDevNet/webex-contact-center-provider-sample-code)

Use it for:

- Provider integration patterns
- BYoVA-style scenarios
- Media and event provider examples
- Java and Python simulators
- Advanced reference implementations

## Suggested Sample Mapping

Each topic page should include a "Try This Sample" block with a direct link to a relevant sample.

| Guide Area | Recommended Sample Type |
| --- | --- |
| Getting Started | Postman sample, app auth sample, token management sample |
| REST APIs | App auth sample, configuration samples |
| Webhooks | Webhook email notification sample, recording download sample |
| Desktop SDK | Widget samples, Desktop JS SDK sample, call control widget sample |
| Flow Designer | HTTP backend examples and provider-side examples |
| Reporting | GraphQL sample, wallboard sample, Power BI/reporting connector sample |
| Advanced Provider Patterns | CiscoDevNet provider sample code |

Each sample block should tell the reader:

- What the sample teaches
- Which language or runtime it uses
- What prerequisites are needed
- When to use it
- Where to go next

## Mental Models

Use these simple patterns when deciding what to build:

- Use REST APIs when you need to look up or manage contact center state.
- Use webhooks when you need to react to change.
- Use Flow Designer before the contact reaches an agent.
- Use Desktop SDK after the contact reaches the agent desktop.
- Use reporting APIs when you need dashboards, exports, trends, or analytics.
- Use provider samples when you are exploring advanced platform integration patterns.

## Running Locally

No build step is required.

Open `index.html` directly in a browser, or serve the folder with any static web server.

Example:

```bash
python3 -m http.server 8080
```

Then open:

```text
http://localhost:8080
```

## Repository Hygiene

Keep this repository focused on the guide and its assets.

Do not commit local assistant, editor, generated, or temporary folders such as:

- `.claude/`
- `.codex/`
- `.agents/`
- `node_modules/`
- `dist/`
- `build/`

## Helpful Links

- [Live guide](https://wxccdemo.github.io/WxCC-Extensibility-Guide/)
- [Webex Contact Center developer docs](https://developer.webex.com/webex-contact-center/docs)
- [Webex Contact Center API samples](https://github.com/WebexSamples/webex-contact-center-api-samples)
- [CiscoDevNet provider sample code](https://github.com/CiscoDevNet/webex-contact-center-provider-sample-code)

## Disclaimer

This guide is intended for learning, demos, and solution exploration. When building production integrations, validate current API behavior against the official Webex developer documentation, apply least-privilege scopes, protect credentials, and design with security, reliability, and tenant isolation in mind.
