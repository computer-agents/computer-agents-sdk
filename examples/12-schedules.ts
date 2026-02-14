/**
 * Scheduled Tasks
 *
 * Schedule agents to run automatically on a cron schedule.
 * Great for recurring tasks like daily reports, monitoring, or backups.
 *
 * Usage:
 *   COMPUTER_AGENTS_API_KEY=your-key npx tsx examples/12-schedules.ts
 */

import { ComputerAgentsClient } from 'computer-agents';

const client = new ComputerAgentsClient({
  apiKey: process.env.COMPUTER_AGENTS_API_KEY,
});

// Create a schedule that runs daily at 9am UTC
const schedule = await client.schedules.create({
  name: 'Daily Code Review',
  type: 'cron',
  cronExpression: '0 9 * * *',
  task: 'Review all uncommitted changes and write a summary of what changed',
  environmentId: process.env.ENVIRONMENT_ID || 'env_xxx',
});

console.log(`Schedule created: ${schedule.id}`);
console.log(`  Name: ${schedule.name}`);
console.log(`  Cron: ${schedule.cronExpression}`);

// List all schedules
const schedules = await client.schedules.list();
console.log(`\nAll schedules (${schedules.length}):`);
for (const s of schedules) {
  console.log(`  - ${s.name} (${s.cronExpression})`);
}

// Trigger a schedule manually
await client.schedules.trigger(schedule.id);
console.log(`\nManually triggered: ${schedule.name}`);

// Disable a schedule
await client.schedules.disable(schedule.id);
console.log(`Disabled: ${schedule.name}`);
