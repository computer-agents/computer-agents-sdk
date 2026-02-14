# Task Control

Control running agent executions with pause, resume, abort, and messaging capabilities.

## Overview

The task control feature allows you to control agent executions at runtime:

- **Pause**: Interrupt a running agent (can be resumed later)
- **Resume**: Continue a paused agent
- **Abort**: Permanently stop an agent
- **Send Message**: Queue messages for running agents
- **Get Status**: Check agent status and queued messages

## Local Control (Same Process)

Control agents running in the same Node.js process.

### Basic Usage

```typescript
import { Agent, run, LocalRuntime } from 'computer-agents';

const agent = new Agent({
  name: 'MyAgent',
  agentType: 'computer',
  runtime: new LocalRuntime(),
  workspace: './my-repo',
});

// Start a long-running task
const taskPromise = run(agent, 'Analyze all TypeScript files');

// Pause after 5 seconds
setTimeout(async () => {
  await agent.pause();
  console.log('Agent paused');
}, 5000);
```

### Control Methods

#### `pause()` - Pause Execution

Interrupts the current execution. The agent can be resumed later.

```typescript
await agent.pause();
console.log('Status:', agent.getStatus());
// { status: 'paused', threadId: 'thread-123', queuedMessages: 0 }
```

#### `resume()` - Resume Execution

Resumes a paused agent. You need to call `run()` again to continue.

```typescript
await agent.resume();
const result = await run(agent, 'Continue with the analysis');
```

#### `abort()` - Abort Permanently

Stops the agent permanently. Cannot be resumed.

```typescript
await agent.abort();
// Agent is now in 'aborted' state and cannot be used again
```

#### `sendMessage()` - Queue Messages

Queue messages that will be processed when the agent is ready.

```typescript
await agent.sendMessage('Focus on performance issues');
await agent.sendMessage('Also check for memory leaks');
```

#### `getStatus()` - Check Status

Get the current agent status and queued message count.

```typescript
const status = agent.getStatus();
console.log(status);
// {
//   status: 'running',
//   threadId: 'thread-abc-123',
//   queuedMessages: 2
// }
```

### Complete Example

```typescript
import { Agent, run, runStreamed, LocalRuntime } from 'computer-agents';

const agent = new Agent({
  name: 'CodeAnalyzer',
  agentType: 'computer',
  runtime: new LocalRuntime({ debug: true }),
  workspace: './my-project',
});

// Start analysis
const taskPromise = run(agent, 'Analyze code quality');

// Check status periodically
const interval = setInterval(() => {
  const status = agent.getStatus();
  console.log('Agent status:', status.status);

  if (status.status === 'idle') {
    clearInterval(interval);
  }
}, 1000);

// Pause if taking too long
setTimeout(async () => {
  if (agent.getStatus().status === 'running') {
    await agent.pause();
    console.log('Analysis taking too long, paused');

    // User can decide to resume or abort
    await agent.resume();
    await run(agent, 'Continue analysis but focus on critical files only');
  }
}, 30000); // 30 seconds

try {
  const result = await taskPromise;
  console.log('Analysis complete:', result.finalOutput);
} catch (error) {
  if (error.message === 'Agent execution paused') {
    console.log('Agent was paused');
  }
}
```

### Streaming with Control

Control works with streaming execution too:

```typescript
const agent = new Agent({
  agentType: 'computer',
  runtime: new LocalRuntime(),
  workspace: './repo',
});

// Start streaming
const events = runStreamed(agent, 'Run comprehensive tests');

// Pause after 10 seconds
setTimeout(async () => {
  await agent.pause();
}, 10000);

try {
  for await (const event of events) {
    console.log(`Event: ${event.type}`);

    if (event.type === 'item.completed') {
      console.log('Completed:', event.item.type);
    }
  }
} catch (error) {
  if (error.message === 'Agent execution paused') {
    console.log('Streaming paused successfully');
  }
}
```

## Cloud Control (Remote)

Control agents running in cloud containers via HTTP API.

### Prerequisites

- Cloud infrastructure deployed and running
- Valid API key

### Control Endpoints

#### `GET /control/status/:threadId`

Get execution status.

```bash
curl -X GET https://api.example.com/control/status/thread-abc-123 \
  -H "X-API-Key: your-api-key"
```

Response:
```json
{
  "threadId": "thread-abc-123",
  "status": "running",
  "queuedMessages": 0
}
```

#### `POST /control/pause/:threadId`

Pause a running execution.

```bash
curl -X POST https://api.example.com/control/pause/thread-abc-123 \
  -H "X-API-Key: your-api-key"
```

Response:
```json
{
  "success": true,
  "message": "Execution paused successfully",
  "threadId": "thread-abc-123"
}
```

#### `POST /control/resume/:threadId`

Resume a paused execution.

```bash
curl -X POST https://api.example.com/control/resume/thread-abc-123 \
  -H "X-API-Key: your-api-key"
```

Response:
```json
{
  "success": true,
  "message": "Execution resumed. Call /execute again with the same threadId to continue.",
  "threadId": "thread-abc-123"
}
```

#### `POST /control/abort/:threadId`

Abort an execution.

```bash
curl -X POST https://api.example.com/control/abort/thread-abc-123 \
  -H "X-API-Key: your-api-key"
```

Response:
```json
{
  "success": true,
  "message": "Execution aborted successfully",
  "threadId": "thread-abc-123"
}
```

#### `POST /control/message/:threadId`

Send a message to a running execution.

```bash
curl -X POST https://api.example.com/control/message/thread-abc-123 \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"message": "Focus on performance issues"}'
```

Response:
```json
{
  "success": true,
  "message": "Message queued successfully",
  "threadId": "thread-abc-123"
}
```

#### `GET /control/executions`

List all your running executions.

```bash
curl -X GET https://api.example.com/control/executions \
  -H "X-API-Key: your-api-key"
```

Response:
```json
{
  "count": 2,
  "executions": [
    {
      "threadId": "thread-abc-123",
      "workspaceId": "workspace-456",
      "status": "running",
      "queuedMessages": 0,
      "startedAt": "2025-10-23T10:00:00.000Z"
    },
    {
      "threadId": "thread-xyz-789",
      "workspaceId": "workspace-789",
      "status": "paused",
      "queuedMessages": 2,
      "startedAt": "2025-10-23T09:30:00.000Z"
    }
  ]
}
```

### Cloud Control Example

```typescript
import { Agent, run, CloudRuntime } from 'computer-agents';

const agent = new Agent({
  agentType: 'computer',
  runtime: new CloudRuntime({
    apiUrl: 'https://api.example.com',
    apiKey: process.env.TESTBASE_API_KEY,
  }),
  workspace: 'workspace-123',
});

// Start cloud execution
const result = await run(agent, 'Deploy application');
const threadId = agent.currentThreadId;

// Control from another process or machine:
const response = await fetch(`https://api.example.com/control/pause/${threadId}`, {
  method: 'POST',
  headers: {
    'X-API-Key': process.env.TESTBASE_API_KEY,
  },
});

console.log(await response.json());
// { success: true, message: "Execution paused successfully", threadId: "..." }
```

## Architecture

### How It Works

#### Local Control
1. `Agent` creates `AbortController` when execution starts
2. `run()` / `runStreamed()` pass `AbortController.signal` to runtime
3. Runtime checks signal in event loop
4. When `pause()` is called, `AbortController.abort()` is triggered
5. Event loop detects abort and throws error
6. Generator `finally` block kills Codex subprocess

#### Cloud Control
1. Executor registers execution with `ControlState` manager
2. Manager tracks `AbortController` for each thread ID
3. API endpoints receive control requests
4. Manager calls `abort()` on corresponding `AbortController`
5. Execution detects abort and stops
6. Executor unregisters execution on completion

### State Machine

```
      ┌─────┐
      │idle │ ◄───────────────────┐
      └──┬──┘                     │
         │ run()                  │
         ▼                        │
    ┌─────────┐                  │
    │running  │                  │
    └────┬────┘                  │
         │                       │
    ┌────┴────┐                  │
    │         │                  │
pause()    abort()               │
    │         │                  │
    ▼         ▼                  │
┌────────┐  ┌────────┐           │
│paused  │  │aborted │           │
└───┬────┘  └────────┘           │
    │          (final)           │
resume()                         │
    └──────────────────────────►─┘
```

## Error Handling

### Pause Errors

```typescript
try {
  await run(agent, 'Long task');
} catch (error) {
  if (error.message === 'Agent execution paused') {
    // Agent was paused - can resume
    console.log('Paused, resuming...');
    await agent.resume();
    await run(agent, 'Continue task');
  }
}
```

### Abort Errors

```typescript
try {
  await run(agent, 'Task');
} catch (error) {
  if (error.message === 'Cannot execute: agent is aborted') {
    // Agent was aborted - cannot resume
    console.log('Agent aborted, creating new instance');
    const newAgent = new Agent({ ...config });
  }
}
```

### Status Checks

Always check status before running:

```typescript
const status = agent.getStatus();

if (status.status === 'aborted') {
  throw new Error('Cannot use aborted agent');
}

if (status.status === 'paused') {
  await agent.resume();
}

await run(agent, 'New task');
```

## Best Practices

### 1. Always Check Status Before Running

```typescript
if (agent.getStatus().status !== 'idle') {
  await agent.resume(); // or handle appropriately
}
```

### 2. Handle Pause Errors Gracefully

```typescript
try {
  await run(agent, task);
} catch (error) {
  if (error.message === 'Agent execution paused') {
    // Save state, notify user, etc.
    await handlePause(agent);
  } else {
    throw error;
  }
}
```

### 3. Clean Up Aborted Agents

```typescript
if (agent.getStatus().status === 'aborted') {
  agent = null; // Let GC clean up
  agent = new Agent(config); // Create fresh instance
}
```

### 4. Use Timeouts for Long Tasks

```typescript
const timeout = setTimeout(async () => {
  if (agent.getStatus().status === 'running') {
    await agent.pause();
    console.log('Task timeout - paused');
  }
}, 5 * 60 * 1000); // 5 minutes

try {
  await run(agent, task);
} finally {
  clearTimeout(timeout);
}
```

### 5. Monitor Queue Length

```typescript
const status = agent.getStatus();
if (status.queuedMessages > 10) {
  console.warn('Large message queue - agent may be stuck');
}
```

## Limitations

1. **Local scope only** - Local control only works within the same Node.js process
2. **Thread continuity** - Pausing/resuming maintains thread ID but starts fresh execution
3. **Message queue** - Messages are queued but not automatically processed (future feature)
4. **Cloud state** - Cloud control state is stored in memory (not persisted across restarts)
5. **No rollback** - Pausing doesn't undo work already completed

## Future Enhancements

- Automatic message processing
- Persistent cloud control state
- Execution checkpoints and rollback
- Control webhooks for real-time notifications
- Web dashboard for managing cloud executions
