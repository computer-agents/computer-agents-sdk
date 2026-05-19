import { Buffer } from 'node:buffer';

type RuntimeRecord = Record<string, any>;

const runtimeJson = String(process.env.COMPUTER_AGENTS_RUNTIME_JSON_B64 || process.env.TESTBASE_RUNTIME_JSON_B64 || '');

const runtime: RuntimeRecord = (() => {
  if (!runtimeJson) {
    return {};
  }
  try {
    return JSON.parse(Buffer.from(runtimeJson, 'base64').toString('utf8'));
  } catch {
    return {};
  }
})();

async function readJson(target: string, init: RequestInit = {}): Promise<any> {
  const response = await fetch(target, init);
  const payload = (await response.json().catch(() => ({}))) as RuntimeRecord;
  if (!response.ok) {
    throw new Error(payload?.message || payload?.error || response.statusText || 'Request failed');
  }
  return payload;
}

function getRuntimeApiBaseUrl(): string {
  return String(
    process.env.COMPUTER_AGENTS_PLATFORM_API_URL ||
      process.env.TESTBASE_PLATFORM_API_URL ||
      runtime?.platform?.apiBaseUrl ||
      '',
  ).replace(/\/+$/, '');
}

function getRuntimeToken(): string {
  return String(process.env.COMPUTER_AGENTS_RUNTIME_TOKEN || process.env.TESTBASE_RUNTIME_TOKEN || '');
}

function getRuntimeServerId(): string {
  return String(process.env.COMPUTER_AGENTS_SERVER_ID || process.env.TESTBASE_SERVER_ID || runtime?.server?.id || '');
}

async function requestRuntime(pathname: string, init: RequestInit = {}): Promise<any> {
  const apiBaseUrl = getRuntimeApiBaseUrl();
  const runtimeToken = getRuntimeToken();
  const serverId = getRuntimeServerId();
  if (!apiBaseUrl || !runtimeToken || !serverId) {
    throw new Error('Missing Computer Agents runtime API configuration.');
  }
  return readJson(`${apiBaseUrl}/servers/${encodeURIComponent(serverId)}/runtime${pathname}`, {
    ...init,
    headers: {
      ...(init.headers || {}),
      'X-Computer-Agents-Runtime-Token': runtimeToken,
      'X-Testbase-Runtime-Token': runtimeToken,
      'Content-Type': 'application/json',
    },
  });
}

export function getComputerAgentsRuntime(): RuntimeRecord {
  return runtime;
}

export function getConnectedDatabase(): RuntimeRecord | null {
  return runtime?.connections?.database || null;
}

export function getConnectedAuth(): RuntimeRecord | null {
  return runtime?.connections?.auth || null;
}

export function getConnectedAgentRuntime(): RuntimeRecord | null {
  return runtime?.connections?.agentRuntime || null;
}

export function getConnectedSecrets(): RuntimeRecord | null {
  return runtime?.connections?.secrets || null;
}

export async function listSecrets(): Promise<any> {
  return requestRuntime('/secrets');
}

export async function getSecret(secretIdOrName: string): Promise<any> {
  return requestRuntime(`/secrets/${encodeURIComponent(String(secretIdOrName || ''))}`);
}

export async function getSecretValue(secretIdOrName: string): Promise<string | null> {
  const payload = await getSecret(secretIdOrName);
  return payload?.secret?.value ?? payload?.value ?? null;
}

export async function createDatabaseCollection(name: string, description = ''): Promise<any> {
  return requestRuntime('/database/collections', {
    method: 'POST',
    body: JSON.stringify({ name, description }),
  });
}

export async function listDatabaseCollections(): Promise<any> {
  return requestRuntime('/database/collections');
}

export async function listDatabaseDocuments(collectionId: string): Promise<any> {
  return requestRuntime(`/database/collections/${encodeURIComponent(String(collectionId || ''))}/documents`);
}

export async function getDatabaseDocument(collectionId: string, documentId: string): Promise<any> {
  return requestRuntime(
    `/database/collections/${encodeURIComponent(String(collectionId || ''))}/documents/${encodeURIComponent(
      String(documentId || ''),
    )}`,
  );
}

export async function createDatabaseDocument(collectionId: string, data: Record<string, unknown>, documentId = ''): Promise<any> {
  return requestRuntime(`/database/collections/${encodeURIComponent(String(collectionId || ''))}/documents`, {
    method: 'POST',
    body: JSON.stringify({
      documentId,
      data: data && typeof data === 'object' ? data : {},
    }),
  });
}

export async function putDatabaseDocument(collectionId: string, documentId: string, data: Record<string, unknown>): Promise<any> {
  return requestRuntime(
    `/database/collections/${encodeURIComponent(String(collectionId || ''))}/documents/${encodeURIComponent(
      String(documentId || ''),
    )}`,
    {
      method: 'PUT',
      body: JSON.stringify({
        data: data && typeof data === 'object' ? data : {},
      }),
    },
  );
}

export async function deleteDatabaseDocument(collectionId: string, documentId: string): Promise<any> {
  return requestRuntime(
    `/database/collections/${encodeURIComponent(String(collectionId || ''))}/documents/${encodeURIComponent(
      String(documentId || ''),
    )}`,
    { method: 'DELETE' },
  );
}

export async function signUpWithAuthModule(input: Record<string, unknown>): Promise<any> {
  const auth = getConnectedAuth();
  if (!auth?.endpoints?.signUp) {
    throw new Error('No auth module is connected.');
  }
  return readJson(auth.endpoints.signUp, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input || {}),
  });
}

export async function signInWithAuthModule(input: Record<string, unknown>): Promise<any> {
  const auth = getConnectedAuth();
  if (!auth?.endpoints?.signIn) {
    throw new Error('No auth module is connected.');
  }
  return readJson(auth.endpoints.signIn, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input || {}),
  });
}

export async function getAuthModuleUser(idToken?: string): Promise<any> {
  const auth = getConnectedAuth();
  if (!auth?.endpoints?.me) {
    throw new Error('No auth module is connected.');
  }
  return readJson(auth.endpoints.me, {
    headers: idToken ? { Authorization: `Bearer ${String(idToken)}` } : {},
  });
}

export async function createAgentRun(input: Record<string, unknown>): Promise<any> {
  return requestRuntime('/agent/runs', {
    method: 'POST',
    body: JSON.stringify(input || {}),
  });
}

export const startAgentRun = createAgentRun;

export async function listAgentRuns(): Promise<any> {
  return requestRuntime('/agent/runs');
}

export async function getAgentRun(runId: string): Promise<any> {
  return requestRuntime(`/agent/runs/${encodeURIComponent(String(runId || ''))}`);
}

export async function sendAgentRunInput(runId: string, input: Record<string, unknown> | string): Promise<any> {
  const payload = input && typeof input === 'object' && !Array.isArray(input) ? input : { content: String(input || '') };
  return requestRuntime(`/agent/runs/${encodeURIComponent(String(runId || ''))}/input`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function isAgentRunTerminal(runOrPayload: RuntimeRecord): boolean {
  const run = runOrPayload?.run || runOrPayload || null;
  const status = String(run?.status || '');
  return status === 'completed' || status === 'failed' || status === 'cancelled';
}

async function sleepAgentRunPoll(intervalMs: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, intervalMs));
}

export async function waitForAgentRun(
  runId: string,
  options: { intervalMs?: number; timeoutMs?: number; signal?: AbortSignal; onUpdate?: (payload: any) => void | Promise<void> } = {},
): Promise<any> {
  const intervalMs = Math.max(100, Number(options?.intervalMs || 1000));
  const timeoutMs = Math.max(0, Number(options?.timeoutMs || 120000));
  const startedAt = Date.now();
  for (;;) {
    if (options?.signal?.aborted) {
      throw options.signal.reason || new Error('Aborted');
    }
    const payload = await getAgentRun(runId);
    if (typeof options?.onUpdate === 'function') {
      await options.onUpdate(payload);
    }
    if (isAgentRunTerminal(payload)) {
      return payload;
    }
    if (timeoutMs > 0 && Date.now() - startedAt >= timeoutMs) {
      throw new Error('Timed out waiting for agent run to finish.');
    }
    await sleepAgentRunPoll(intervalMs);
  }
}

export async function* streamAgentRun(
  runId: string,
  options: { intervalMs?: number; signal?: AbortSignal } = {},
): AsyncGenerator<any, any, unknown> {
  const intervalMs = Math.max(100, Number(options?.intervalMs || 1000));
  const seenEventKeys = new Set<string>();
  for (;;) {
    if (options?.signal?.aborted) {
      throw options.signal.reason || new Error('Aborted');
    }
    const payload = await getAgentRunEvents(runId);
    const events = Array.isArray(payload?.events) ? payload.events : [];
    for (const event of events) {
      const eventKey =
        String(event?.id || '') ||
        JSON.stringify([event?.createdAt || null, event?.role || null, event?.content || null]);
      if (seenEventKeys.has(eventKey)) {
        continue;
      }
      seenEventKeys.add(eventKey);
      yield event;
    }
    if (isAgentRunTerminal(payload)) {
      return payload;
    }
    await sleepAgentRunPoll(intervalMs);
  }
}

export async function getAgentRunEvents(runId: string): Promise<any> {
  return requestRuntime(`/agent/runs/${encodeURIComponent(String(runId || ''))}/events`);
}

export async function cancelAgentRun(runId: string): Promise<any> {
  return requestRuntime(`/agent/runs/${encodeURIComponent(String(runId || ''))}/cancel`, {
    method: 'POST',
  });
}
