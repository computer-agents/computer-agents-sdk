/**
 * High-Level Local Computer Flow
 *
 * This example uses the public `client.computers` facade instead of the
 * lower-level bridge substrate. It creates or connects a computer with local
 * directory metadata, creates a canonical ACP thread, and opens a local
 * execution session.
 *
 * Usage:
 *   COMPUTER_AGENTS_API_KEY=your-key \
 *   ACP_LOCAL_COMPUTER_PATH=/Users/me/project \
 *   npx tsx examples/17-local-computers.ts
 *
 * Optional:
 *   ACP_LOCAL_COMPUTER_NAME=Marketing Site
 *   ACP_LOCAL_PROJECT_ID=proj_xxx
 *   ACP_LOCAL_COMPUTER_ID=env_xxx
 */

import { ComputerAgentsClient } from 'computer-agents';

const client = new ComputerAgentsClient({
  apiKey: process.env.COMPUTER_AGENTS_API_KEY,
});

const path = process.env.ACP_LOCAL_COMPUTER_PATH;
if (!path) {
  throw new Error('Set ACP_LOCAL_COMPUTER_PATH to a local directory first.');
}

const selectedComputerId = process.env.ACP_LOCAL_COMPUTER_ID;
const projectId = process.env.ACP_LOCAL_PROJECT_ID ?? undefined;
const name = process.env.ACP_LOCAL_COMPUTER_NAME ?? undefined;

const computer = selectedComputerId
  ? await client.computers.update(selectedComputerId, {
      ...(name !== undefined ? { name } : {}),
      ...(projectId !== undefined ? { projectId } : {}),
      local: {
        path,
        syncMode: 'manual',
        executionMode: 'legacy_remote',
      },
    })
  : await client.computers.create({
      name,
      projectId,
      local: {
        path,
        syncMode: 'manual',
        executionMode: 'legacy_remote',
      },
    });

console.log(`Local computer: ${computer.name} (${computer.id})`);
console.log(`- local path: ${computer.local.localPath}`);
console.log(`- device: ${computer.device.name} (${computer.device.id})`);

const thread = await client.threads.create({ environmentId: computer.id });

const localSession = await client.computers.createLocalSession(thread.id, {
  computerId: computer.id,
  status: 'created',
});

console.log(`Thread: ${thread.id}`);
console.log(`Local execution session: ${localSession.id}`);

const pushes = await client.computers.listPushSessions(computer.id, { limit: 10 });
const pulls = await client.computers.listPullSessions(computer.id, { limit: 10 });

console.log(`Push sessions: ${pushes.total}`);
console.log(`Pull sessions: ${pulls.total}`);
