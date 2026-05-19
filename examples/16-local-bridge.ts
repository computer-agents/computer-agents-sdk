/**
 * Low-Level Local Bridge Control Plane
 *
 * Inspect registered devices, workspace bindings, and optional local sessions.
 * Most developers should prefer the higher-level `client.computers` local
 * computer flow instead of starting here directly.
 *
 * Usage:
 *   COMPUTER_AGENTS_API_KEY=your-key npx tsx examples/16-local-bridge.ts
 *
 * Optional:
 *   ACP_LOCAL_BRIDGE_DEVICE_ID=device_xxx
 *   ACP_LOCAL_BRIDGE_THREAD_ID=thread_xxx
 *   ACP_LOCAL_BRIDGE_BINDING_ID=wb_xxx
 */

import { ComputerAgentsClient } from 'computer-agents';

const client = new ComputerAgentsClient({
  apiKey: process.env.COMPUTER_AGENTS_API_KEY,
});

const selectedDeviceId = process.env.ACP_LOCAL_BRIDGE_DEVICE_ID;
const selectedThreadId = process.env.ACP_LOCAL_BRIDGE_THREAD_ID;
const selectedBindingId = process.env.ACP_LOCAL_BRIDGE_BINDING_ID;

const devices = await client.localBridge.listDevices({ limit: 20 });
console.log(`Devices (${devices.total})`);
for (const device of devices.data) {
  console.log(`- ${device.name} (${device.id}) [${device.status}]`);
}

const bindings = await client.localBridge.listBindings({
  deviceId: selectedDeviceId,
  limit: 20,
});
console.log(`\nWorkspace bindings (${bindings.total})`);
for (const binding of bindings.data) {
  console.log(
    `- ${binding.name || binding.localPath} (${binding.id}) -> ${binding.environmentId} [${binding.executionMode}/${binding.syncMode}]`,
  );
}

if (selectedBindingId) {
  const pullSessions = await client.localBridge.listPullSessions(selectedBindingId, { limit: 10 });
  console.log(`\nPull sessions for ${selectedBindingId} (${pullSessions.total})`);
  for (const session of pullSessions.data) {
    console.log(`- ${session.id} [${session.status}]`);
  }
}

if (selectedThreadId) {
  const sessions = await client.localBridge.listLocalSessions(selectedThreadId, { limit: 10 });
  console.log(`\nLocal execution sessions for ${selectedThreadId} (${sessions.total})`);
  for (const session of sessions.data) {
    console.log(`- ${session.id} [${session.status}] on device ${session.deviceId}`);
  }
}
