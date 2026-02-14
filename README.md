# Computer Agents SDK

[![npm version](https://img.shields.io/npm/v/computer-agents.svg?color=success)](https://www.npmjs.com/package/computer-agents)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Official TypeScript/JavaScript SDK for the [Computer Agents Cloud API](https://computer-agents.com). Execute Claude-powered AI agents in isolated cloud containers.

## Installation

```bash
npm install computer-agents
```

## Quick Start

```typescript
import { ComputerAgentsClient } from 'computer-agents';

const client = new ComputerAgentsClient({
  apiKey: process.env.COMPUTER_AGENTS_API_KEY
});

// Execute a task
const result = await client.run('Create a REST API with Flask', {
  onEvent: (event) => console.log(event.type)
});

console.log(result.content);
```

## Features

- **Claude-powered** — agents run on Claude Opus 4.6, Sonnet 4.5, or Haiku 4.5
- **Cloud execution** — isolated containers with persistent workspaces
- **SSE streaming** — real-time execution progress and tool calls
- **Session continuity** — multi-turn conversations via threads
- **MCP integration** — extend capabilities with Model Context Protocol servers
- **Skills** — web search, image generation, deep research
- **Zero dependencies** — uses native `fetch`
- **Full TypeScript support** — complete type definitions

## Supported Models

| Model | ID | Use Case |
|-------|-----|----------|
| Claude 4.6 Opus | `claude-opus-4-6` | Most capable, complex tasks |
| Claude 4.5 Sonnet | `claude-sonnet-4-5` | Balanced (default) |
| Claude 4.5 Haiku | `claude-haiku-4-5` | Fast, efficient |

## API Reference

### Client

```typescript
const client = new ComputerAgentsClient({
  apiKey: 'your-api-key',                         // Required
  baseUrl: 'https://api.computer-agents.com',     // Optional (default)
  timeout: 60000,                                  // Optional (default: 60s)
  debug: false                                     // Optional
});
```

### Running Tasks

```typescript
// One-shot execution
const result = await client.run('Fix the TypeScript errors', {
  environmentId: 'env_xxx'
});

// With streaming
const result = await client.run('Build a REST API', {
  onEvent: (event) => {
    if (event.type === 'response.item.completed') {
      console.log(event);
    }
  }
});
```

### Threads

Multi-turn conversations with persistent context:

```typescript
// Create a thread
const thread = await client.threads.create({
  environmentId: 'env_xxx'
});

// Send messages — the agent remembers the full context
await client.threads.sendMessage(thread.id, {
  content: 'Create a Python web server',
  onEvent: (event) => console.log(event)
});

await client.threads.sendMessage(thread.id, {
  content: 'Add authentication to it',
  onEvent: (event) => console.log(event)
});

// Copy a thread to fork the conversation
const copy = await client.threads.copy(thread.id, {
  title: 'Experiment v2'
});

// Search across threads
const results = await client.threads.search({
  query: 'REST API',
  limit: 10
});

// Get execution logs
const logs = await client.threads.getLogs(thread.id);

// List, get, update, delete
const threads = await client.threads.list();
const t = await client.threads.get('thread_xxx');
await client.threads.update('thread_xxx', { title: 'New title' });
await client.threads.delete('thread_xxx');
```

### Agents

Configure agent behavior with specific models and instructions:

```typescript
const agent = await client.agents.create({
  name: 'Senior Developer',
  model: 'claude-sonnet-4-5',
  instructions: 'You are a senior developer. Write clean, tested code.',
  reasoningEffort: 'high'
});

// Use the agent in a thread
const thread = await client.threads.create({
  environmentId: 'env_xxx',
  agentId: agent.id
});
```

### Environments

Isolated containers with custom runtimes, packages, and configuration:

```typescript
// Create an environment
const env = await client.environments.create({
  name: 'python-dev',
  internetAccess: true
});

// Configure runtimes
await client.environments.setRuntimes(env.id, {
  python: '3.12',
  nodejs: '20'
});

// Install packages
await client.environments.installPackages(env.id, {
  packages: [
    { type: 'python', name: 'flask' },
    { type: 'python', name: 'pytest' },
    { type: 'system', name: 'curl' }
  ]
});

// Add MCP servers
await client.environments.update(env.id, {
  mcpServers: [
    {
      type: 'stdio',
      name: 'filesystem',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-filesystem', '/workspace']
    },
    {
      type: 'http',
      name: 'notion',
      url: 'https://mcp.notion.com/mcp',
      bearerToken: process.env.NOTION_TOKEN
    }
  ]
});

// Trigger a build
await client.environments.build(env.id);
```

### Files

Manage files in environment workspaces:

```typescript
// Upload a file
await client.files.uploadFile({
  environmentId: 'env_xxx',
  path: 'src/app.py',
  content: 'print("hello")'
});

// Download file content
const content = await client.files.getFile('env_xxx', 'src/app.py');

// List files
const files = await client.files.listFiles('env_xxx');

// Delete a file
await client.files.deleteFile('env_xxx', 'src/app.py');
```

### Git

Version control on workspaces:

```typescript
// View uncommitted changes
const diff = await client.git.diff('env_xxx');

// Commit and push
await client.git.commit('env_xxx', { message: 'Add new feature' });
await client.git.push('env_xxx');
```

### Schedules

Automate recurring tasks:

```typescript
const schedule = await client.schedules.create({
  name: 'Daily Code Review',
  type: 'cron',
  cronExpression: '0 9 * * *',
  task: 'Review all uncommitted changes',
  environmentId: 'env_xxx'
});

// Trigger manually
await client.schedules.trigger(schedule.id);
```

### Budget

Monitor spending and control execution:

```typescript
const status = await client.budget.getStatus();
console.log(`Balance: $${(status.balance / 100).toFixed(2)}`);

const canRun = await client.budget.canExecute();
if (!canRun.canExecute) {
  console.log('Budget exceeded:', canRun.reason);
}
```

## Streaming Events

```typescript
await client.threads.sendMessage(threadId, {
  content: 'Build a REST API',
  onEvent: (event) => {
    switch (event.type) {
      case 'response.started':
        console.log('Execution started');
        break;
      case 'response.item.completed':
        console.log('Item:', event);
        break;
      case 'response.completed':
        console.log('Response finished');
        break;
      case 'stream.completed':
        console.log('Done');
        break;
      case 'stream.error':
        console.error('Error:', event);
        break;
    }
  }
});
```

## Error Handling

```typescript
import { ComputerAgentsClient, ApiClientError } from 'computer-agents';

try {
  await client.run('Task');
} catch (error) {
  if (error instanceof ApiClientError) {
    console.error(`API Error: ${error.message}`);
    console.error(`Status: ${error.status}`);
    console.error(`Code: ${error.code}`);
  }
}
```

## Examples

See the [`examples/`](./examples) directory for complete, runnable examples:

| Example | Description |
|---------|-------------|
| [Hello World](./examples/01-hello-world.ts) | Simplest possible usage |
| [Multi-turn Conversation](./examples/02-multi-turn-conversation.ts) | Thread-based conversations |
| [Streaming](./examples/03-streaming.ts) | Real-time SSE event handling |
| [Custom Agent](./examples/04-custom-agent.ts) | Agent configuration with models and instructions |
| [Environments](./examples/05-environments.ts) | Environment management |
| [File Operations](./examples/06-file-operations.ts) | Upload, download, and manage files |
| [Copy Thread](./examples/07-copy-thread.ts) | Fork conversations |
| [Search Threads](./examples/08-search-threads.ts) | Full-text search across threads |
| [MCP Servers](./examples/09-mcp-servers.ts) | Model Context Protocol integration |
| [Git Operations](./examples/10-git-operations.ts) | Diffs, commits, and pushes |
| [Budget Management](./examples/11-budget-management.ts) | Monitor spending |
| [Schedules](./examples/12-schedules.ts) | Automate recurring tasks |
| [Execution Logs](./examples/13-execution-logs.ts) | Logs and deep research sessions |

Run any example:

```bash
COMPUTER_AGENTS_API_KEY=your-key npx tsx examples/01-hello-world.ts
```

## TypeScript

Full type definitions are included:

```typescript
import type {
  Thread,
  Environment,
  CloudAgent,
  Schedule,
  Run,
  AgentModel,
  ReasoningEffort,
  MessageStreamEvent,
  McpServer,
  BudgetStatus,
  CopyThreadParams,
  SearchThreadsResponse,
  ThreadLogEntry,
  ResearchSession,
} from 'computer-agents';
```

## License

MIT

## Links

- [Website](https://computer-agents.com)
- [npm](https://www.npmjs.com/package/computer-agents)
- [GitHub](https://github.com/computer-agents/computer-agents-sdk)
