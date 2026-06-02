/* ============================================================
   nodes-data.js
   All content for the interactive explorer nodes.
   Add new nodes here — explorer.js picks them up automatically.
   ============================================================ */

const NODES = {

  /* ─────────────────────────────────────────────
     CATEGORY NODES  (6 pillars)
  ───────────────────────────────────────────── */

  auth: {
    badge: '🔑 Authentication', badgeColor: '#dbeafe', badgeText: '#1d4ed8',
    title: 'Authentication & Setup',
    subtitle: 'OAuth 2.0 · Personal Tokens · Service Apps · API Scopes',
    what: 'All WxCC APIs use <strong>OAuth 2.0 Bearer tokens</strong>. There are three ways to authenticate depending on your use case: a quick personal token for testing, a 3-legged OAuth flow for user-facing apps, or a Service App (machine-to-machine) for production integrations.',
    useCases: [
      'Testing APIs in Postman or during development',
      'Building a supervisor dashboard that users log into',
      'Running a background service that refreshes tokens automatically',
      'Multi-org partner integrations requiring per-org approval'
    ],
    code: {
      lang: 'JavaScript',
      content: `<span class="cm">// Service App — Client Credentials Grant (Production)</span>
<span class="kw">const</span> <span class="var">credentials</span> = Buffer.<span class="fn">from</span>(<span class="str">\`\${CLIENT_ID}:\${CLIENT_SECRET}\`</span>).<span class="fn">toString</span>(<span class="str">'base64'</span>);
<span class="kw">const</span> <span class="var">res</span> = <span class="kw">await</span> axios.<span class="fn">post</span>(<span class="str">'https://webexapis.com/v1/access_token'</span>,
  <span class="kw">new</span> <span class="fn">URLSearchParams</span>({ grant_type: <span class="str">'client_credentials'</span>,
    scope: <span class="str">'cjp:config cjp:config_read'</span> }),
  { headers: { Authorization: <span class="str">\`Basic \${credentials}\`</span> } }
);
<span class="kw">const</span> { <span class="var">access_token</span>, <span class="var">expires_in</span> } = res.data;
<span class="cm">// Cache the token; refresh 60s before expires_in</span>`
    },
    faqs: [
      { q: 'Personal token vs Service App — which should I use?', a: 'Personal tokens expire after 12 hours and are tied to your individual account — use them only for testing. Service Apps use machine-to-machine auth with configurable expiry and are required for any production or automated integration.' },
      { q: 'How do I automatically refresh tokens?', a: 'Cache the access_token with its expiry timestamp. Before making an API call, check if the token expires in less than 60 seconds and refresh proactively using stored refresh_token or a new client_credentials request.' },
      { q: 'Which scopes does a read-only dashboard need?', a: 'Request <code>cjp:config_read</code> for configuration data and <code>cjp:analyzer_read</code> for reporting. Avoid requesting <code>cjp:config</code> (write access) unless you need to make changes.' }
    ],
    link: 'getting-started.html'
  },

  rest: {
    badge: '🔌 REST APIs', badgeColor: '#dcfce7', badgeText: '#059669',
    title: 'Contact Center REST APIs',
    subtitle: 'Tasks · Agents · Queues · Configuration · Entry Points',
    what: 'WxCC exposes a comprehensive REST API covering every resource in the contact center. All endpoints are under <code>https://webexapis.com/v1/contactCenter/</code>, return JSON, and require a Bearer token. Most list endpoints support cursor-based pagination.',
    useCases: [
      'Pull live agent states into a real-time supervisor wallboard',
      'Bulk-create agents, teams and queues when onboarding a new customer',
      'Query active calls to drive a CRM screen pop before the agent answers',
      'Automate configuration backups and deployments via CI/CD'
    ],
    code: {
      lang: 'JavaScript',
      content: `<span class="cm">// List available agents with their current state</span>
<span class="kw">const</span> <span class="var">res</span> = <span class="kw">await</span> axios.<span class="fn">get</span>(
  <span class="str">'https://webexapis.com/v1/contactCenter/agents'</span>,
  { headers: { Authorization: <span class="str">\`Bearer \${token}\`</span> },
    params: { orgId, max: <span class="num">200</span> } }
);
<span class="kw">const</span> <span class="var">available</span> = res.data.items
  .<span class="fn">filter</span>(a => a.agentState === <span class="str">'Available'</span>);
console.<span class="fn">log</span>(<span class="str">\`\${available.length} agents ready\`</span>);`
    },
    faqs: [
      { q: 'How does pagination work?', a: 'WxCC list endpoints return a <code>Link</code> header with a <code>rel="next"</code> cursor URL when more pages exist. Keep fetching the next URL until it\'s absent. Never use offset-based pagination — it\'s not supported.' },
      { q: 'How should API calls support a business workflow?', a: 'Keep API calls focused on the outcome: lookup the right customer, update the right record, or retrieve the right operational data. Cache stable configuration data and request only what the experience needs.' },
      { q: 'Can I create agents programmatically?', a: 'Yes — POST to <code>/contactCenter/agents</code>. The Webex user account must already exist first. There\'s no native bulk endpoint, so loop with a small delay between calls.' }
    ],
    link: 'rest-apis.html'
  },

  webhooks: {
    badge: '📡 Webhooks', badgeColor: '#fef3c7', badgeText: '#b45309',
    title: 'Webhooks & Real-Time Events',
    subtitle: 'task:created · task:ended · agentSession:stateChange · HMAC verification',
    what: 'Webhooks let WxCC push events to your server the moment they happen — no polling. Register an HTTPS endpoint and subscribe to event types. Every delivery includes an HMAC-SHA1 signature in the <code>X-Spark-Signature</code> header so you can verify authenticity.',
    useCases: [
      'Trigger a CRM record update the moment a call ends',
      'Show a real-time screen pop as soon as a task is offered to the agent',
      'Feed a live operations dashboard without polling',
      'Log every agent state change to a compliance audit trail'
    ],
    code: {
      lang: 'JavaScript',
      content: `<span class="cm">// Express webhook listener with HMAC verification</span>
app.<span class="fn">post</span>(<span class="str">'/webhooks/wxcc'</span>,
  express.<span class="fn">raw</span>({ type: <span class="str">'application/json'</span> }), (req, res) => {
  <span class="kw">const</span> <span class="var">sig</span>      = req.headers[<span class="str">'x-spark-signature'</span>];
  <span class="kw">const</span> <span class="var">expected</span> = crypto.<span class="fn">createHmac</span>(<span class="str">'sha1'</span>, SECRET)
    .<span class="fn">update</span>(req.body).<span class="fn">digest</span>(<span class="str">'hex'</span>);
  <span class="kw">if</span> (!crypto.<span class="fn">timingSafeEqual</span>(Buffer.<span class="fn">from</span>(sig), Buffer.<span class="fn">from</span>(expected)))
    <span class="kw">return</span> res.<span class="fn">status</span>(<span class="num">401</span>).<span class="fn">send</span>(<span class="str">'Invalid signature'</span>);
  res.<span class="fn">status</span>(<span class="num">200</span>).<span class="fn">json</span>({ status: <span class="str">'ok'</span> }); <span class="cm">// respond FIRST</span>
  <span class="fn">processEvent</span>(JSON.<span class="fn">parse</span>(req.body));
});`
    },
    faqs: [
      { q: 'WxCC retries failed deliveries — how long?', a: 'WxCC retries with exponential backoff for up to 24 hours. If still failing after 24 hours, the subscription is automatically disabled. Always respond 200 immediately before any async processing.' },
      { q: 'Can I filter events to a specific queue or agent?', a: 'Webhook subscriptions are org-level — you receive all events. Filter in your handler by checking <code>data.queueId</code> or <code>data.agentId</code> in the payload.' },
      { q: 'How do I test webhooks locally?', a: 'Use <code>ngrok http 3000</code> to expose your local server. Register the ngrok HTTPS URL as the webhook target. WxCC will deliver live events to your local machine.' }
    ],
    link: 'webhooks.html'
  },

  desktop: {
    badge: '🖥️ Desktop SDK', badgeColor: '#f3e8ff', badgeText: '#7c3aed',
    title: 'Agent Desktop JS SDK',
    subtitle: 'Custom iFrame widgets · Screen pop · Call variables · Agent state control',
    what: 'The Desktop JS SDK lets you embed custom web panels inside the WxCC agent desktop. Your widget runs in a sandboxed iFrame and communicates with the desktop via <code>postMessage</code>. Install via <code>npm install @wxcc-desktop/sdk</code> and register your widget URL in the Desktop Layout JSON.',
    useCases: [
      'Auto-display customer CRM record when a call arrives (screen pop)',
      'Show AI-suggested responses based on the caller\'s history',
      'Embed a ticketing system (ServiceNow, Zendesk) directly in the agent view',
      'Write call outcome data back to CRM without the agent leaving the desktop'
    ],
    code: {
      lang: 'JavaScript',
      content: `<span class="kw">import</span> { Desktop } <span class="kw">from</span> <span class="str">'@wxcc-desktop/sdk'</span>;
<span class="kw">await</span> Desktop.config.<span class="fn">init</span>({
  widgetName: <span class="str">'CRM Widget'</span>,
  widgetSrc:  <span class="str">'https://your-app.com/widget'</span>
});

Desktop.agentContact.<span class="fn">addEventListener</span>(<span class="str">'eAgentContact'</span>,
  <span class="kw">async</span> ({ detail }) => {
    <span class="kw">if</span> (detail.type === <span class="str">'AgentContactOffered'</span>) {
      <span class="kw">const</span> <span class="var">customer</span> = <span class="kw">await</span> <span class="fn">fetchFromCRM</span>(detail.data.callerId);
      <span class="fn">renderScreenPop</span>(customer);
    }
});`
    },
    faqs: [
      { q: 'My widget\'s init() never resolves — why?', a: 'The SDK communicates via postMessage and only works when loaded inside the actual WxCC agent desktop iFrame. Opening your widget URL directly in a browser tab will hang forever. Use ngrok + Desktop Layout JSON to test inside the real desktop.' },
      { q: 'How many custom widget panels can I add?', a: 'You can add panels to multiple areas (right panel, task area, nav bar). No hard limit, but keep it to 1–3 for good agent usability. Each widget is an independent iFrame.' },
      { q: 'Can my widget call external APIs like my CRM?', a: 'Yes — your widget is a standard web app and can make any HTTPS calls. Ensure your backend has CORS configured to allow the desktop origin (<code>*.wxcc-us1.cisco.com</code>). Never store API keys in the widget frontend.' }
    ],
    link: 'desktop-sdk.html'
  },

  flow: {
    badge: '🔀 Flow Designer', badgeColor: '#fee2e2', badgeText: '#b91c1c',
    title: 'Flow Designer & Intelligent Routing',
    subtitle: 'HTTP Request node · Flow variables · Condition branching · Subflows',
    what: 'Flow Designer is the visual drag-and-drop builder in WxCC Admin for defining what happens when a contact arrives. The <strong>HTTP Request node</strong> lets any flow call an external REST API mid-IVR — authenticate callers, fetch account data, score intent with AI — all before routing to an agent.',
    useCases: [
      'Authenticate callers by account number via CRM lookup in IVR',
      'Route Enterprise tier callers to a priority queue automatically',
      'Use an AI model to predict call intent and pre-populate agent notes',
      'Log every IVR interaction to an external audit database'
    ],
    code: {
      lang: 'JavaScript',
      content: `<span class="cm">// Your backend API — called by the WxCC HTTP Request node</span>
app.<span class="fn">post</span>(<span class="str">'/api/verify-caller'</span>, <span class="kw">async</span> (req, res) => {
  <span class="cm">// $(CollectedDigits) is passed from the IVR flow</span>
  <span class="kw">const</span> { accountNumber } = req.body;
  <span class="kw">const</span> <span class="var">c</span> = <span class="kw">await</span> db.<span class="fn">findCustomer</span>(accountNumber);
  <span class="cm">// WxCC maps: $.tier → FlowVar_Tier, $.name → FlowVar_Name</span>
  res.<span class="fn">json</span>(c
    ? { authenticated: <span class="kw">true</span>,  tier: c.tier, name: c.name }
    : { authenticated: <span class="kw">false</span> });
});`
    },
    faqs: [
      { q: 'What\'s the HTTP node timeout limit?', a: 'You can configure 1–30 seconds. Keep external API responses under 2 seconds for good caller experience — every second of HTTP delay is a second callers wait in IVR silence.' },
      { q: 'What\'s the difference between Flow Variables and Global Variables?', a: 'Flow Variables exist only for the current call. Global Variables are shared across all flows in your org — use them for shared values like API endpoint URLs or auth tokens.' },
      { q: 'Can I version-control flows?', a: 'Flow Designer keeps a full version history in the UI. For CI/CD, use the <code>POST /contactCenter/flows/{id}/publish</code> API to programmatically promote a specific version to live.' }
    ],
    link: 'flow-designer.html'
  },

  reporting: {
    badge: '📊 Reporting', badgeColor: '#cffafe', badgeText: '#0e7490',
    title: 'Reporting & Analytics APIs',
    subtitle: 'Real-time queue stats · Historical reports · CDR export · Custom dashboards',
    what: 'WxCC exposes both real-time snapshot APIs (live queue depths, agent states) and historical aggregated APIs (hourly/daily SLA, AHT, abandon rates). Call Detail Records (CDRs) provide one row per contact with full timestamps. Data is available for up to 13 months.',
    useCases: [
      'Build a live supervisor wallboard showing queue depth and agent availability',
      'Export CDRs nightly to BigQuery or Snowflake for BI reporting',
      'Alert supervisors via Slack when no agents are available in a queue',
      'Build a Power BI dashboard with real contact-center KPIs'
    ],
    code: {
      lang: 'JavaScript',
      content: `<span class="cm">// Live wallboard — poll queue stats every 30s</span>
<span class="kw">async function</span> <span class="fn">getQueueSnapshot</span>(queueId) {
  <span class="kw">const</span> { data } = <span class="kw">await</span> axios.<span class="fn">get</span>(
    <span class="str">\`https://webexapis.com/v1/contactCenter/queues/\${queueId}/statistics\`</span>,
    { headers: { Authorization: <span class="str">\`Bearer \${token}\`</span> },
      params: { orgId } }
  );
  <span class="kw">return</span> {
    waiting:   data.contactsInQueue,
    available: data.agentsAvailable,
    sla:       data.serviceLevelPercentage
  };
}
<span class="fn">setInterval</span>(() => <span class="fn">getQueueSnapshot</span>(QUEUE_ID)
  .<span class="fn">then</span>(updateWallboard), <span class="num">30_000</span>);`
    },
    faqs: [
      { q: 'How far back can I query historical data?', a: 'Up to 13 months. For longer retention, export nightly to your own data warehouse (BigQuery, Redshift, Snowflake) using a cron job. CDRs are the best source for granular per-call data.' },
      { q: 'Can I get real-time queue stats without polling?', a: 'The stats API is point-in-time (polling). For event-driven updates, combine polling with webhooks — webhooks notify you of state changes instantly, then you fetch updated stats on demand.' },
      { q: 'What is a CDR and what does it contain?', a: 'Call Detail Record — one record per contact including: callId, callerId, agentId, queueId, startTime, talkDuration, holdDuration, wrapUpCode, channelType, and all call variables set in your flow.' }
    ],
    link: 'reporting.html'
  },

  /* ─────────────────────────────────────────────
     LEAF NODES  (Auth)
  ───────────────────────────────────────────── */

  'personal-token': {
    badge: '🔑 Auth', badgeColor: '#dbeafe', badgeText: '#1d4ed8',
    title: 'Personal Access Token',
    subtitle: 'Quick 12-hour token from developer.webex.com',
    what: 'A personal token is tied to your Webex account and expires after 12 hours. Get one instantly at developer.webex.com by clicking your avatar. Use it to test APIs in Postman, cURL, or quickly prototype — never in production.',
    code: {
      lang: 'cURL',
      content: `curl -X GET \\
  "https://webexapis.com/v1/contactCenter/agents?orgId=YOUR_ORG_ID" \\
  -H <span class="str">"Authorization: Bearer YOUR_PERSONAL_TOKEN"</span> \\
  -H <span class="str">"Content-Type: application/json"</span>`
    },
    faqs: [{ q: 'Why does my token stop working after a few hours?', a: 'Personal tokens expire after exactly 12 hours from generation. Go back to developer.webex.com and copy a fresh one, or switch to a Service App token for automated use.' }],
    link: 'getting-started.html'
  },

  oauth: {
    badge: '🔑 Auth', badgeColor: '#dbeafe', badgeText: '#1d4ed8',
    title: 'OAuth 2.0 Authorization Flow',
    subtitle: '3-legged user login · Authorization Code Grant',
    what: 'Use OAuth 2.0 when building apps where end-users log in with their own Webex account (e.g., a supervisor dashboard). The user is redirected to Webex, grants permission, and your app receives an access + refresh token pair.',
    code: {
      lang: 'JavaScript',
      content: `<span class="cm">// Step 1 — redirect user to Webex authorize endpoint</span>
<span class="kw">const</span> <span class="var">authUrl</span> = <span class="str">\`https://webexapis.com/v1/authorize
  ?client_id=\${CLIENT_ID}
  &response_type=code
  &redirect_uri=\${encodeURIComponent(REDIRECT_URI)}
  &scope=cjp:config_read%20cjp:analyzer_read\`</span>;
res.<span class="fn">redirect</span>(authUrl);

<span class="cm">// Step 2 — exchange code for tokens in callback</span>
<span class="kw">const</span> { data } = <span class="kw">await</span> axios.<span class="fn">post</span>(
  <span class="str">'https://webexapis.com/v1/access_token'</span>,
  { grant_type: <span class="str">'authorization_code'</span>, code: req.query.code,
    redirect_uri: REDIRECT_URI },
  { auth: { username: CLIENT_ID, password: CLIENT_SECRET } }
);`
    },
    faqs: [{ q: 'When should I use 3-legged OAuth vs a Service App?', a: 'Use 3-legged OAuth when you need to act on behalf of a specific logged-in user. Use Service App (Client Credentials) for background services where no user is present.' }],
    link: 'getting-started.html'
  },

  'service-app': {
    badge: '🔑 Auth', badgeColor: '#dbeafe', badgeText: '#1d4ed8',
    title: 'Service App (Production Auth)',
    subtitle: 'Machine-to-machine · Client Credentials · Auto-refresh',
    what: 'Service Apps are the correct choice for production integrations. They use the Client Credentials OAuth grant — no user interaction. A Webex Org Admin must approve the Service App before it can access org resources. Tokens can be refreshed indefinitely.',
    code: {
      lang: 'JavaScript',
      content: `<span class="cm">// Token cache — refresh 60s before expiry</span>
<span class="kw">let</span> <span class="var">cache</span> = { token: <span class="kw">null</span>, expiresAt: <span class="num">0</span> };

<span class="kw">async function</span> <span class="fn">getToken</span>() {
  <span class="kw">if</span> (Date.<span class="fn">now</span>() < cache.expiresAt - <span class="num">60_000</span>) <span class="kw">return</span> cache.token;
  <span class="kw">const</span> b64 = btoa(<span class="str">\`\${CLIENT_ID}:\${CLIENT_SECRET}\`</span>);
  <span class="kw">const</span> { data } = <span class="kw">await</span> axios.<span class="fn">post</span>(
    <span class="str">'https://webexapis.com/v1/access_token'</span>,
    <span class="kw">new</span> <span class="fn">URLSearchParams</span>({ grant_type: <span class="str">'client_credentials'</span>,
      scope: <span class="str">'cjp:config cjp:config_read'</span> }),
    { headers: { Authorization: <span class="str">\`Basic \${b64}\`</span> } }
  );
  cache = { token: data.access_token,
    expiresAt: Date.<span class="fn">now</span>() + data.expires_in * <span class="num">1000</span> };
  <span class="kw">return</span> cache.token;
}`
    },
    faqs: [{ q: 'Does a Webex admin need to approve my Service App?', a: 'Yes — an Org Admin at your target org must authorize the Service App at least once. Until they do, all API calls return 403.' }],
    link: 'getting-started.html'
  },

  /* ─────────────────────────────────────────────
     LEAF NODES  (REST APIs)
  ───────────────────────────────────────────── */

  tasks: {
    badge: '🔌 REST', badgeColor: '#dcfce7', badgeText: '#059669',
    title: 'Task / Contact APIs',
    subtitle: 'GET · POST · PATCH active contacts',
    what: 'A Task represents a single customer interaction (call, chat, email). These APIs let you list, filter, update, and end tasks programmatically.',
    code: {
      lang: 'JavaScript',
      content: `<span class="kw">const</span> { data } = <span class="kw">await</span> axios.<span class="fn">get</span>(
  <span class="str">'https://webexapis.com/v1/contactCenter/tasks'</span>,
  { headers: { Authorization: <span class="str">\`Bearer \${token}\`</span> },
    params: { orgId, channelType: <span class="str">'telephony'</span>, status: <span class="str">'active'</span> } }
);
console.<span class="fn">log</span>(<span class="str">\`Active calls: \${data.items.length}\`</span>);`
    },
    faqs: [{ q: 'What does "task" mean in WxCC?', a: 'A task is any single customer interaction — a voice call, a chat session, or an email. Each has a unique ID and goes through states: parked → assigned → ended.' }],
    link: 'rest-apis.html'
  },

  agents: {
    badge: '🔌 REST', badgeColor: '#dcfce7', badgeText: '#059669',
    title: 'Agent APIs',
    subtitle: 'Profile · State · Team assignment',
    what: 'Read agent profiles, retrieve real-time state (Available, Idle, InACall, WrapUp), create new agents, and assign them to teams or skill profiles.',
    code: {
      lang: 'JavaScript',
      content: `<span class="kw">const</span> { data } = <span class="kw">await</span> axios.<span class="fn">get</span>(
  <span class="str">'https://webexapis.com/v1/contactCenter/agents'</span>,
  { headers: { Authorization: <span class="str">\`Bearer \${token}\`</span> },
    params: { orgId, max: <span class="num">200</span> } }
);
<span class="kw">const</span> <span class="var">available</span> = data.items
  .<span class="fn">filter</span>(a => a.agentState === <span class="str">'Available'</span>);`
    },
    faqs: [{ q: 'Can I change an agent\'s state via API?', a: 'Changing state programmatically is done via the Desktop JS SDK from within a widget — call <code>Desktop.agentContact.setAgentStatus()</code>.' }],
    link: 'rest-apis.html'
  },

  queues: {
    badge: '🔌 REST', badgeColor: '#dcfce7', badgeText: '#059669',
    title: 'Queue APIs',
    subtitle: 'Config · Real-time stats · SLA settings',
    what: 'Queues define how contacts are distributed to agents. Read queue configuration, update SLA thresholds, and query live statistics like contacts waiting, agents available, and longest wait time.',
    code: {
      lang: 'JavaScript',
      content: `<span class="kw">const</span> { data } = <span class="kw">await</span> axios.<span class="fn">get</span>(
  <span class="str">\`https://webexapis.com/v1/contactCenter/queues/\${queueId}/statistics\`</span>,
  { headers: { Authorization: <span class="str">\`Bearer \${token}\`</span> }, params: { orgId } }
);
<span class="cm">// { contactsInQueue, agentsAvailable, longestContactInQueue, serviceLevelPercentage }</span>`
    },
    faqs: [{ q: 'How often do queue stats update?', a: 'Stats endpoints return a point-in-time snapshot at the moment of the API call. For a live wallboard, poll every 15–30 seconds.' }],
    link: 'rest-apis.html'
  },

  /* ─────────────────────────────────────────────
     LEAF NODES  (Webhooks)
  ───────────────────────────────────────────── */

  'task-events': {
    badge: '📡 Webhooks', badgeColor: '#fef3c7', badgeText: '#b45309',
    title: 'Task Event Types',
    subtitle: 'task:created · task:assigned · task:ended · task:abandoned',
    what: 'Task events fire throughout the lifecycle of every contact interaction. Subscribe to these to trigger CRM updates, screen pops, compliance logging, and real-time dashboards.',
    code: {
      lang: 'JSON',
      content: `{
  <span class="str">"name"</span>: <span class="str">"task:created"</span>,
  <span class="str">"data"</span>: {
    <span class="str">"id"</span>:          <span class="str">"task-uuid-5678"</span>,
    <span class="str">"channelType"</span>: <span class="str">"telephony"</span>,
    <span class="str">"callerId"</span>:    <span class="str">"+14085551234"</span>,
    <span class="str">"queueId"</span>:     <span class="str">"queue-uuid"</span>,
    <span class="str">"callVariables"</span>: {
      <span class="str">"accountNumber"</span>: <span class="str">"ACC-98765"</span>
    }
  }
}`
    },
    faqs: [{ q: 'How do I get call variables in a webhook event?', a: 'Call variables (CAD variables) set in the Flow Designer are included in the <code>data.callVariables</code> object of task events — available from the very first <code>task:created</code> event.' }],
    link: 'webhooks.html'
  },

  'agent-events': {
    badge: '📡 Webhooks', badgeColor: '#fef3c7', badgeText: '#b45309',
    title: 'Agent Session Events',
    subtitle: 'agentSession:stateChange · login · logout',
    what: 'Subscribe to agent session events to track login/logout times, state transitions (Available → Idle → InACall), and build real-time workforce management dashboards.',
    code: {
      lang: 'JSON',
      content: `{
  <span class="str">"name"</span>: <span class="str">"agentSession:stateChange"</span>,
  <span class="str">"data"</span>: {
    <span class="str">"agentId"</span>:       <span class="str">"agent-uuid"</span>,
    <span class="str">"agentName"</span>:     <span class="str">"Jane Doe"</span>,
    <span class="str">"previousState"</span>: <span class="str">"Available"</span>,
    <span class="str">"currentState"</span>:  <span class="str">"Idle"</span>,
    <span class="str">"idleCode"</span>:      <span class="str">"LUNCH_BREAK"</span>
  }
}`
    },
    faqs: [{ q: 'Can I filter agent events to one team?', a: 'Webhooks are org-level. Filter in your event handler by checking <code>data.teamId</code> against the teams you care about.' }],
    link: 'webhooks.html'
  },

  'webhook-security': {
    badge: '📡 Webhooks', badgeColor: '#fef3c7', badgeText: '#b45309',
    title: 'Webhook Security & HMAC',
    subtitle: 'X-Spark-Signature · SHA-1 · Timing-safe comparison',
    what: 'Every webhook delivery includes an <code>X-Spark-Signature</code> header — an HMAC-SHA1 of the raw request body using your registered secret. Always verify this before processing any event to prevent spoofing.',
    code: {
      lang: 'JavaScript',
      content: `<span class="kw">const</span> <span class="var">sig</span>      = req.headers[<span class="str">'x-spark-signature'</span>];
<span class="kw">const</span> <span class="var">expected</span> = crypto
  .<span class="fn">createHmac</span>(<span class="str">'sha1'</span>, WEBHOOK_SECRET)
  .<span class="fn">update</span>(req.body) <span class="cm">// raw Buffer — do NOT parse JSON first</span>
  .<span class="fn">digest</span>(<span class="str">'hex'</span>);

<span class="kw">if</span> (!crypto.<span class="fn">timingSafeEqual</span>(
    Buffer.<span class="fn">from</span>(sig), Buffer.<span class="fn">from</span>(expected)))
  <span class="kw">return</span> res.<span class="fn">sendStatus</span>(<span class="num">401</span>);`
    },
    faqs: [{ q: 'Why use timingSafeEqual instead of ===?', a: 'String comparison (===) can leak timing information that attackers can exploit to guess the signature byte-by-byte. <code>timingSafeEqual</code> always takes the same amount of time regardless of how similar the strings are.' }],
    link: 'webhooks.html'
  },

  /* ─────────────────────────────────────────────
     LEAF NODES  (Desktop SDK)
  ───────────────────────────────────────────── */

  'screen-pop': {
    badge: '🖥️ Desktop SDK', badgeColor: '#f3e8ff', badgeText: '#7c3aed',
    title: 'Screen Pop',
    subtitle: 'Auto-display CRM data when a call arrives',
    what: 'Screen pop is the most common Desktop SDK use case: when a task is offered to the agent, your widget receives the <code>AgentContactOffered</code> event, looks up the caller in your CRM, and displays their record — before the agent even picks up.',
    code: {
      lang: 'JavaScript',
      content: `Desktop.agentContact.<span class="fn">addEventListener</span>(
  <span class="str">'eAgentContact'</span>, <span class="kw">async</span> ({ detail }) => {
    <span class="kw">if</span> (detail.type === <span class="str">'AgentContactOffered'</span>) {
      <span class="kw">const</span> { callerId, callVariables } = detail.data;
      <span class="kw">const</span> <span class="var">customer</span> = <span class="kw">await</span> <span class="fn">fetchCRM</span>(callerId);
      document.<span class="fn">getElementById</span>(<span class="str">'name'</span>).textContent  = customer.name;
      document.<span class="fn">getElementById</span>(<span class="str">'tier'</span>).textContent  = customer.tier;
      document.<span class="fn">getElementById</span>(<span class="str">'card'</span>).style.display = <span class="str">'block'</span>;
    }
});`
    },
    faqs: [{ q: 'Can the screen pop also open a browser tab?', a: 'Yes — call <code>window.open(crmUrl, \'_blank\')</code> inside the event handler. Combine with rendering data in your widget panel for a dual-surface screen pop.' }],
    link: 'desktop-sdk.html'
  },

  'custom-widget': {
    badge: '🖥️ Desktop SDK', badgeColor: '#f3e8ff', badgeText: '#7c3aed',
    title: 'Custom Widget Panels',
    subtitle: 'iFrame · Desktop Layout JSON · Webex Components',
    what: 'Any web app can become a custom widget. Build with React, Vue, or plain HTML/JS. Register its URL in the Desktop Layout JSON and assign the layout to your team.',
    code: {
      lang: 'JSON',
      content: `<span class="cm">// Desktop Layout JSON — register a custom widget</span>
{
  <span class="str">"area"</span>: { <span class="str">"panel"</span>: { <span class="str">"children"</span>: [{
    <span class="str">"comp"</span>: <span class="str">"agentx-wc-iframe"</span>,
    <span class="str">"attributes"</span>: {
      <span class="str">"src"</span>: <span class="str">"https://your-app.com/widget/index.html"</span>
    },
    <span class="str">"properties"</span>: {
      <span class="str">"title"</span>: <span class="str">"CRM Panel"</span>,
      <span class="str">"initializeConnector"</span>: <span class="kw">true</span>
    }
  }]}}
}`
    },
    faqs: [{ q: 'Where can the widget appear on the desktop?', a: 'You can place widgets in: the right panel, the task (center) area, the nav bar (left side icons), or as a full-page tab. Each area is defined separately in the layout JSON.' }],
    link: 'desktop-sdk.html'
  },

  'agent-state': {
    badge: '🖥️ Desktop SDK', badgeColor: '#f3e8ff', badgeText: '#7c3aed',
    title: 'Agent State Control',
    subtitle: 'Read state · Change state · Listen for transitions',
    what: 'Your widget can read the current agent state and change it programmatically — useful for auto-setting agents to Available after completing a CRM task, or forcing Idle during a scheduled break.',
    code: {
      lang: 'JavaScript',
      content: `<span class="cm">// Read current state</span>
<span class="kw">const</span> <span class="var">info</span> = <span class="kw">await</span> Desktop.agentContact.<span class="fn">fetchAgentInfo</span>();
console.<span class="fn">log</span>(info.status);
<span class="cm">// 'Available' | 'Idle' | 'InACall' | 'WrapUp'</span>

<span class="cm">// Set agent to Available</span>
<span class="kw">await</span> Desktop.agentContact.<span class="fn">setAgentStatus</span>({
  state: <span class="str">'Available'</span>, auxCode: <span class="kw">null</span>
});`
    },
    faqs: [{ q: 'Can I prevent agents from going Idle at certain times?', a: 'You can listen for <code>AgentStateChange</code> events and immediately call <code>setAgentStatus</code> to override — though this should be used carefully and only for legitimate operational reasons.' }],
    link: 'desktop-sdk.html'
  },

  /* ─────────────────────────────────────────────
     LEAF NODES  (Flow Designer)
  ───────────────────────────────────────────── */

  'http-node': {
    badge: '🔀 Flow Designer', badgeColor: '#fee2e2', badgeText: '#b91c1c',
    title: 'HTTP Request Node',
    subtitle: 'Call any REST API mid-IVR · Parse response to flow variables',
    what: 'The HTTP Request node is the gateway between your IVR flow and external systems. Configure URL, headers, method, and JSON body using flow variable references like <code>$(VariableName)</code>. Map response fields to flow variables using JSONPath.',
    code: {
      lang: 'JavaScript',
      content: `<span class="cm">// Your backend API — called by the HTTP Request node</span>
app.<span class="fn">post</span>(<span class="str">'/api/auth-caller'</span>, (req, res) => {
  <span class="cm">// IVR passes: { accountNumber: "$(CollectedDigits)" }</span>
  <span class="kw">const</span> { accountNumber } = req.body;
  <span class="kw">const</span> <span class="var">c</span> = db.<span class="fn">find</span>(accountNumber);
  <span class="cm">// WxCC parses: $.tier → FlowVar_Tier  $.name → FlowVar_Name</span>
  res.<span class="fn">json</span>(c
    ? { ok: <span class="kw">true</span>,  tier: c.tier, name: c.name }
    : { ok: <span class="kw">false</span> });
});`
    },
    faqs: [{ q: 'What timeout should I set?', a: 'Set 2–5 seconds. Your external API should respond well under this — every second of delay is a second callers wait in IVR silence. Use caching on your backend to keep responses fast.' }],
    link: 'flow-designer.html'
  },

  'flow-variables': {
    badge: '🔀 Flow Designer', badgeColor: '#fee2e2', badgeText: '#b91c1c',
    title: 'Flow Variables',
    subtitle: 'Local · Global · CAD (Call-Associated Data)',
    what: 'Flow variables carry data between nodes in a call flow. Variables set as CAD (Call-Associated Data) travel with the task to the agent desktop and appear in screen pops and webhook payloads.',
    code: {
      lang: 'JSON',
      content: `<span class="cm">// CAD variables visible on agent desktop &amp; in webhooks</span>
{
  <span class="str">"callVariables"</span>: {
    <span class="str">"customerName"</span>:     <span class="str">"John Smith"</span>,
    <span class="str">"customerTier"</span>:     <span class="str">"Enterprise"</span>,
    <span class="str">"aiPredictedIntent"</span>: <span class="str">"billing"</span>
  }
}`
    },
    faqs: [{ q: 'How do I read flow variables in my desktop widget?', a: 'CAD variables are available in the <code>AgentContactOffered</code> SDK event: <code>detail.data.callVariables.customerTier</code>. They\'re also in every webhook <code>task:created</code> payload.' }],
    link: 'flow-designer.html'
  },

  routing: {
    badge: '🔀 Flow Designer', badgeColor: '#fee2e2', badgeText: '#b91c1c',
    title: 'Routing Logic & Conditions',
    subtitle: 'Skills-based · Tier routing · Overflow · Subflows',
    what: 'The Condition node evaluates flow variables and branches to different paths. Chain conditions to build enterprise-grade routing: tier-based priority queues, language matching, time-of-day routing, and AI intent-based agent selection.',
    code: {
      lang: 'Text',
      content: `<span class="cm">Condition node expression examples:</span>

<span class="str">FlowVar_Tier == "Enterprise"</span>
  → Priority Queue (skip wait time)

<span class="str">FlowVar_Language == "ES"</span>
  → Spanish-speaking agent queue

<span class="str">FlowVar_WaitTime > 120</span>
  → Overflow to voicemail / callback

<span class="str">FlowVar_Intent == "billing"</span>
  → Billing specialist team queue`
    },
    faqs: [{ q: 'What is a Subflow?', a: 'A subflow is a reusable flow segment — like a function in programming. Define caller authentication once as a subflow and import it into every main flow. Changes to the subflow apply everywhere it\'s used.' }],
    link: 'flow-designer.html'
  },

  /* ─────────────────────────────────────────────
     LEAF NODES  (Reporting)
  ───────────────────────────────────────────── */

  realtime: {
    badge: '📊 Reporting', badgeColor: '#cffafe', badgeText: '#0e7490',
    title: 'Real-Time Statistics',
    subtitle: 'Queue depth · Agent states · Longest wait · SLA live',
    what: 'Real-time stats endpoints return a point-in-time snapshot of current contact center state. Use these to power live wallboards, supervisor dashboards, and automated staffing alerts.',
    code: {
      lang: 'JavaScript',
      content: `<span class="kw">const</span> { data } = <span class="kw">await</span> axios.<span class="fn">get</span>(
  <span class="str">\`https://webexapis.com/v1/contactCenter/queues/\${qId}/statistics\`</span>,
  { headers: { Authorization: <span class="str">\`Bearer \${token}\`</span> }, params: { orgId } }
);
<span class="cm">// data: { contactsInQueue, agentsAvailable,</span>
<span class="cm">//         longestContactInQueue, serviceLevelPercentage }</span>
<span class="kw">if</span> (data.agentsAvailable === <span class="num">0</span>)
  <span class="fn">alertSupervisor</span>(<span class="str">'⚠️ No agents available!'</span>);`
    },
    faqs: [{ q: 'How often should I poll real-time stats?', a: 'Every 15–30 seconds is the recommended polling interval for a wallboard. Polling faster than every 5 seconds will hit rate limits (20 req/sec for real-time APIs).' }],
    link: 'reporting.html'
  },

  historical: {
    badge: '📊 Reporting', badgeColor: '#cffafe', badgeText: '#0e7490',
    title: 'Historical Reports',
    subtitle: 'Hourly · Daily · SLA · AHT · Abandon rate',
    what: 'Query aggregated contact center metrics for any time range up to 13 months. Granularity can be hourly, daily, weekly, or monthly. Key metrics: contacts handled, average handle time (AHT), service level %, abandon rate.',
    code: {
      lang: 'JavaScript',
      content: `<span class="kw">const</span> { data } = <span class="kw">await</span> axios.<span class="fn">get</span>(
  <span class="str">'https://webexapis.com/v1/contactCenter/reports/queues'</span>,
  { headers: { Authorization: <span class="str">\`Bearer \${token}\`</span> },
    params: {
      orgId,
      startDate:   <span class="str">'2024-01-01T00:00:00Z'</span>,
      endDate:     <span class="str">'2024-01-31T23:59:59Z'</span>,
      granularity: <span class="str">'DAILY'</span>,
      metrics: <span class="str">'contactsHandled,avgHandleTime,serviceLevelPercentage'</span>
    }
  }
);`
    },
    faqs: [{ q: 'Can I export historical data to Power BI or Tableau?', a: 'Yes — pull data via the API and write to a database or data lake (BigQuery, S3, Azure). Connect Power BI or Tableau to that source. Schedule nightly exports with a cron job.' }],
    link: 'reporting.html'
  },

  cdr: {
    badge: '📊 Reporting', badgeColor: '#cffafe', badgeText: '#0e7490',
    title: 'Call Detail Records (CDR)',
    subtitle: 'One row per contact · Full timeline · All variables',
    what: 'CDRs are the most granular data available — one record per contact with complete timestamps, agent assignments, hold times, wrap-up codes, and all CAD variables set during the call.',
    code: {
      lang: 'JavaScript',
      content: `<span class="kw">const</span> { data } = <span class="kw">await</span> axios.<span class="fn">get</span>(
  <span class="str">'https://webexapis.com/v1/contactCenter/recordings/calls'</span>,
  { headers: { Authorization: <span class="str">\`Bearer \${token}\`</span> },
    params: { orgId,
      startDate:   <span class="str">'2024-01-01T00:00:00Z'</span>,
      endDate:     <span class="str">'2024-01-07T23:59:59Z'</span>,
      channelType: <span class="str">'telephony'</span>, max: <span class="num">1000</span> } }
);
<span class="cm">// Each CDR: { callId, callerId, agentId, talkDuration,</span>
<span class="cm">//             holdDuration, wrapUpCode, callVariables }</span>`
    },
    faqs: [{ q: 'How do I export CDRs to a data warehouse nightly?', a: 'Use a cron job (e.g., node-cron) to run at 2 AM, fetch yesterday\'s CDRs, and insert them into BigQuery or your target database. See the Reporting page for a complete ETL example.' }],
    link: 'reporting.html'
  }

}; /* end NODES */
