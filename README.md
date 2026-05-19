# Computer Agents JavaScript SDK

[![npm version](https://img.shields.io/npm/v/computer-agents.svg?color=success)](https://www.npmjs.com/package/computer-agents)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Official TypeScript/JavaScript SDK for [Computer Agents](https://computer-agents.com), the Agentic Compute Platform.

Computer Agents gives AI agents the things a real teammate needs to finish work: persistent cloud computers, files, project plans, tasks, memory, skills, scheduled work, and deployable resources. Use this SDK to start agents, stream their work, manage projects and computers, deploy web apps and functions, store data, connect auth, and keep secrets out of source code.

## What You Can Build

- **Agentic product workspaces** with projects, releases, tickets, reviewers, comments, and task-linked threads.
- **Persistent cloud computers** where agents can browse, code, run CLIs, install packages, edit files, and keep state across sessions.
- **Hosted products and internal tools** with Web Apps, Functions, Databases, Auth, Agent Runtimes, and Secrets.
- **Automated research and operations** with threads, schedules, triggers, skills, and reusable custom agents.
- **Apps built on Computer Agents** where your product calls the same platform API that powers the web platform.

## Install

```bash
npm install computer-agents
```

Node.js 18 or newer is required.

## Authenticate

Create an API key in Computer Agents, then set:

```bash
export COMPUTER_AGENTS_API_KEY="ca_..."
```

```ts
import { ComputerAgentsClient } from 'computer-agents';

const client = new ComputerAgentsClient({
  apiKey: process.env.COMPUTER_AGENTS_API_KEY,
});
```

You can also pass `baseUrl` when targeting a custom deployment.

## Quick Start

Run a task and stream the agent's work:

```ts
import { ComputerAgentsClient } from 'computer-agents';

const client = new ComputerAgentsClient({
  apiKey: process.env.COMPUTER_AGENTS_API_KEY,
});

const result = await client.run('Create a small Next.js dashboard and explain how to run it.', {
  onEvent: (event) => {
    if (event.type === 'response.item.completed') {
      console.log(event);
    }
  },
});

console.log(result.content);
console.log(result.threadId);
```

## Core Concepts

| Concept | What it means |
| --- | --- |
| **Threads** | Multi-turn agent sessions with messages, logs, reasoning, diffs, permission requests, feedback, and resumable state. |
| **Computers** | Persistent cloud workspaces with files, runtimes, packages, GUI access, Git, snapshots, and deployment context. |
| **Projects** | Shared workspaces for complex work: strategy, releases, tasks, comments, resources, review state, and task-linked threads. |
| **Agents** | Reusable agent profiles with model, instructions, skills, reasoning effort, and analytics. |
| **Resources** | Deployable product surfaces: Web Apps, Functions, Databases, Auth, Agent Runtimes, and Secrets. |
| **Skills** | Reusable capabilities agents can invoke, such as research, image generation, app deployment, or task management. |

## Persistent Computers and Threads

Create a computer, start a thread inside it, and continue later with the same files and state:

```ts
const computer = await client.computers.create({
  name: 'product-build-computer',
  internetAccess: true,
});

const thread = await client.threads.create({
  computerId: computer.id,
});

await client.threads.sendMessage(thread.id, {
  content: 'Create a Node.js API with a health route.',
  onEvent: (event) => console.log(event.type),
});

await client.threads.sendMessage(thread.id, {
  content: 'Now add authentication and tests.',
});

const logs = await client.threads.getLogs(thread.id);
const diffs = await client.threads.getDiffs(thread.id);
```

Thread methods include `create`, `list`, `get`, `sendMessage`, `cancel`, `resume`, `copy`, `search`, `getMessages`, `getLogs`, `getStatus`, `getDiffs`, `listSteps`, `downloadStepFile`, `forkFromStep`, `revertToStep`, `setFeedback`, `reportIssue`, and permission request approval/denial.

## Projects and Tasks

Use projects when agents need the same context a human team would need: the goal, current release, backlog, comments, dependencies, resources, and review policy.

```ts
const project = await client.projects.create({
  name: 'Customer Portal',
  description: 'Build and deploy an authenticated customer portal.',
});

const release = await client.tasks.createRelease({
  projectId: project.id,
  name: 'v0.1 MVP',
});

const task = await client.tasks.create({
  projectId: project.id,
  releaseId: release.id,
  title: 'Deploy login and account settings',
  status: 'todo',
  priority: 'high',
});

await client.tasks.createComment(task.id, {
  body: 'Include password reset and session validation.',
});

await client.tasks.startThread(task.id, {
  environmentId: computer.id,
});
```

## Deployable Server Resources

Computer Agents resources let humans and agents ship software from the same workspace where the work is planned and built.

| Manager | Resource kind | Typical use |
| --- | --- | --- |
| `client.webApps` | `web_app` | Dashboards, internal tools, portals, prototypes, AI apps. |
| `client.functions` | `function` | APIs, webhooks, jobs, data transforms, backend actions. |
| `client.databases` | Database | Collections and JSON documents for apps, functions, and agents. |
| `client.auth` | `auth` | Sign-up, sign-in, sessions, protected app workflows. |
| `client.runtimes` | `agent_runtime` | Always-on agent APIs and embedded agent services. |
| `client.secrets` | `secrets` | Secret vaults for API keys, tokens, credentials, and private config. |
| `client.resources` | Generic resources | Cross-kind automation when one workflow handles multiple resource types. |

### Create and Deploy a Function

Upload source code from a computer, create the Function, deploy it, then invoke it.

```ts
await client.files.uploadFile({
  environmentId: computer.id,
  path: 'functions/hello-world',
  filename: 'index.mjs',
  content: `
export default async function handler(request) {
  return Response.json({ message: 'Hello from Computer Agents Functions' });
}
`,
  contentType: 'text/javascript',
});

const fn = await client.functions.create({
  name: 'hello-world',
  sourceType: 'computer',
  sourceEnvironmentId: computer.id,
  sourcePath: 'functions/hello-world',
  runtime: 'nodejs22',
  authMode: 'public',
});

await client.functions.deploy(fn.id);

const response = await client.functions.invoke(fn.id, {
  method: 'GET',
  path: '/',
});

console.log(response.status, response.body);
```

Resource managers support `create`, `list`, `get`, `update`, `delete`, `deploy`, `listDeployments`, `rollbackDeployment`, `invoke`, `getAnalytics`, `getLogs`, `listBindings`, `upsertBinding`, `deleteBinding`, file operations, and secret operations. Auth resources also support `listUsers`, `createUser`, `signUp`, and `signIn`.

## Databases and Secrets

Use databases for app state and structured output. Use Secrets for credentials that functions, web apps, and agents can read at runtime.

```ts
const db = await client.databases.create({
  name: 'crm-data',
});

const leads = await client.databases.createCollection(db.id, {
  name: 'leads',
});

await client.databases.createDocument(db.id, leads.id, {
  data: {
    company: 'Acme',
    stage: 'qualified',
    owner: 'agent',
  },
});

const vault = await client.secrets.create({
  name: 'production-secrets',
});

await client.secrets.createSecret(vault.id, {
  name: 'SENDGRID_API_KEY',
  value: process.env.SENDGRID_API_KEY!,
});

await client.functions.upsertBinding(fn.id, 'database', {
  targetId: db.id,
  alias: 'appDatabase',
});

await client.functions.upsertBinding(fn.id, 'secrets', {
  targetId: vault.id,
  alias: 'productionSecrets',
});
```

## Runtime Helpers for Deployed Resources

Inside deployed Node Functions and server-rendered Web Apps, import native helpers from the SDK. This is the supported replacement for local runtime shims.

```ts
import {
  createDatabaseDocument,
  getSecretValue,
  startAgentRun,
} from 'computer-agents/runtime/server';

export default async function handler(request: Request) {
  const sendgridKey = await getSecretValue('SENDGRID_API_KEY');

  await createDatabaseDocument('contact_submissions', {
    email: 'ada@example.com',
    source: 'website',
  });

  const run = await startAgentRun({
    content: 'Summarize today\\'s contact submissions.',
  });

  return Response.json({
    ok: Boolean(sendgridKey),
    runId: run?.run?.id || run?.id,
  });
}
```

Runtime helper exports include:

- Runtime metadata: `getComputerAgentsRuntime`, `getConnectedDatabase`, `getConnectedAuth`, `getConnectedAgentRuntime`, `getConnectedSecrets`
- Secrets: `listSecrets`, `getSecret`, `getSecretValue`
- Databases: `createDatabaseCollection`, `listDatabaseCollections`, `listDatabaseDocuments`, `getDatabaseDocument`, `createDatabaseDocument`, `putDatabaseDocument`, `deleteDatabaseDocument`
- Auth: `signUpWithAuthModule`, `signInWithAuthModule`, `getAuthModuleUser`
- Agent runs: `createAgentRun`, `startAgentRun`, `listAgentRuns`, `getAgentRun`, `sendAgentRunInput`, `waitForAgentRun`, `streamAgentRun`, `getAgentRunEvents`, `cancelAgentRun`

## Schedules, Triggers, and Orchestrations

```ts
await client.schedules.create({
  name: 'Daily competitor brief',
  type: 'cron',
  cronExpression: '0 9 * * *',
  task: 'Research competitors and write a concise Markdown brief.',
  environmentId: computer.id,
});

await client.triggers.create({
  name: 'New lead enrichment',
  eventType: 'webhook',
  task: 'Enrich the new lead and update the CRM database.',
});

await client.orchestrations.create({
  name: 'Research and build landing page',
  objective: 'Research the market, write copy, and deploy a landing page.',
});
```

## Agents and Models

```ts
const models = await client.agents.listModels();

const agent = await client.agents.create({
  name: 'Senior Product Engineer',
  model: 'deepseek-v4-pro',
  instructions: 'Build carefully, test changes, and explain tradeoffs.',
  reasoningEffort: 'high',
});
```

Computer Agents supports built-in models from Anthropic, OpenAI, Gemini, DeepSeek, Kimi, and connected external models on supported plans. Use `client.agents.listModels()` to read the current catalog instead of hard-coding model availability.

## Budget and Usage

```ts
const budget = await client.budget.getStatus();
const canRun = await client.budget.canExecute();
const usage = await client.billing.getStats({ days: 30 });

console.log({ budget, canRun, usage });
```

## Error Handling

```ts
import { ApiClientError } from 'computer-agents';

try {
  await client.run('Ship the dashboard');
} catch (error) {
  if (error instanceof ApiClientError) {
    console.error(error.status, error.code, error.message);
  }
}
```

## SDK Surface

| Manager | Scope |
| --- | --- |
| `client.threads` | Messages, logs, diffs, research, feedback, permission requests, and thread lifecycle. |
| `client.computers` / `client.environments` | Persistent cloud computers, runtimes, packages, snapshots, GUI, analytics, local sync. |
| `client.files` | Workspace files and directories. |
| `client.git` | Git status, diffs, commits, branches, clone, push. |
| `client.projects` | Project lifecycle, project files, schedules, computers, sync. |
| `client.tasks` | Tasks, comments, releases, sprints, and task-linked threads. |
| `client.agents` | Agent profiles, models, analytics. |
| `client.webApps`, `client.functions`, `client.auth`, `client.databases`, `client.runtimes`, `client.secrets` | Product resources. |
| `client.resources` | Generic server resource operations. |
| `client.skills` | Custom skills. |
| `client.schedules`, `client.triggers`, `client.orchestrations` | Recurring, event-driven, and multi-agent work. |
| `client.notifications` | In-app notifications and push tokens. |
| `client.budget` / `client.billing` | Budget checks, checkout, usage, and transactions. |

## Links

- [Website](https://computer-agents.com)
- [Documentation](https://computer-agents.com/developers)
- [API Reference](https://computer-agents.com/api-reference)
- [npm](https://www.npmjs.com/package/computer-agents)
- [GitHub](https://github.com/computer-agents/computer-agents-sdk)

## License

MIT
