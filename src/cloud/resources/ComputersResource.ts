import type { ApiClient } from '../ApiClient';
import type {
  Computer,
  CreateComputerParams,
  UpdateComputerParams,
  CreateLocalComputerParams,
  ConnectLocalComputerParams,
  ListLocalComputersParams,
  LocalComputer,
  LocalComputerDevice,
  LocalComputerDeviceHint,
  Device,
  WorkspaceBinding,
  WorkspacePushSession,
  WorkspacePullSession,
  PrepareComputerPushParams,
  PrepareWorkspacePushSessionResult,
  PrepareComputerPullParams,
  PrepareWorkspacePullSessionResult,
  AttachComputerPullPreviewParams,
  AttachPullSessionApplyPreviewResult,
  AttachComputerPullResultParams,
  AttachPullSessionApplyResultResult,
  CreateLocalComputerSessionParams,
  LocalExecutionSession,
  HeartbeatLocalExecutionSessionParams,
  CompleteLocalExecutionSessionParams,
  LocalSessionCommand,
  EnqueueLocalSessionCommandParams,
  AcknowledgeLocalSessionCommandParams,
  LocalBridgeThreadEvent,
  LocalBridgeIngestEventsResult,
} from '../types';
import { EnvironmentsResource } from './EnvironmentsResource';
import {
  LocalBridgeResource,
  type ListWorkspacePushSessionsParams,
  type ListWorkspacePullSessionsParams,
} from './LocalBridgeResource';

function stableSerialize(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableSerialize(item)).join(',')}]`;
  }
  const entries = Object.entries(value as Record<string, unknown>)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, nested]) => `${JSON.stringify(key)}:${stableSerialize(nested)}`);
  return `{${entries.join(',')}}`;
}

function signatureFor(value: unknown): string {
  const serialized = stableSerialize(value);
  let hash = 2166136261;
  for (let i = 0; i < serialized.length; i += 1) {
    hash ^= serialized.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `sig_${(hash >>> 0).toString(16)}`;
}

function deriveNameFromPath(path: string): string {
  const parts = path.split(/[\\/]/).filter(Boolean);
  return parts[parts.length - 1] || 'Local Computer';
}

function toLocalComputerDevice(device: Device): LocalComputerDevice {
  return {
    id: device.id,
    name: device.name,
    platform: device.platform,
    hostname: device.hostname,
    status: device.status,
    lastSeenAt: device.lastSeenAt,
  };
}

export class ComputersResource extends EnvironmentsResource {
  private readonly localBridge: LocalBridgeResource;

  constructor(client: ApiClient) {
    super(client);
    this.localBridge = new LocalBridgeResource(client);
  }

  private hydrateLocalComputer(
    computer: Computer,
    binding: WorkspaceBinding,
    device: Device,
  ): LocalComputer {
    return {
      ...computer,
      device: toLocalComputerDevice(device),
      local: {
        bindingId: binding.id,
        localPath: binding.localPath,
        syncRoot: binding.syncRoot,
        ignorePatterns: binding.ignorePatterns,
        syncMode: binding.syncMode,
        executionMode: binding.executionMode,
        lastPushedSnapshotId: binding.lastPushedSnapshotId,
        lastPulledSnapshotId: binding.lastPulledSnapshotId,
      },
    };
  }

  private selectBinding(bindings: WorkspaceBinding[]): WorkspaceBinding | null {
    if (bindings.length === 0) {
      return null;
    }
    return [...bindings].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
  }

  private async resolveDevice(
    deviceHint: LocalComputerDeviceHint | undefined,
    fallbackName: string,
  ): Promise<Device> {
    if (deviceHint?.id) {
      return this.localBridge.getDevice(deviceHint.id);
    }

    const desiredName = deviceHint?.name?.trim() || fallbackName;
    const desiredPlatform = deviceHint?.platform ?? null;
    const desiredHostname = deviceHint?.hostname ?? null;
    const devices = await this.localBridge.listDevices({ limit: 100 });
    const existing = devices.data.find((device) => {
      if (device.name !== desiredName) {
        return false;
      }
      if (desiredPlatform !== null && device.platform !== desiredPlatform) {
        return false;
      }
      if (desiredHostname !== null && device.hostname !== desiredHostname) {
        return false;
      }
      return true;
    });

    if (existing) {
      return this.localBridge.heartbeatDevice(existing.id, {
        appVersion: deviceHint?.appVersion,
        daemonVersion: deviceHint?.daemonVersion,
        capabilities: deviceHint?.capabilities,
      });
    }

    return this.localBridge.createDevice({
      name: desiredName,
      platform: desiredPlatform,
      hostname: desiredHostname,
      appVersion: deviceHint?.appVersion,
      daemonVersion: deviceHint?.daemonVersion,
      capabilities: deviceHint?.capabilities,
      status: deviceHint?.status,
    });
  }

  private async resolveLocalBinding(computerId: string): Promise<WorkspaceBinding | null> {
    const bindings = await this.localBridge.listBindings({
      environmentId: computerId,
      limit: 100,
    });
    return this.selectBinding(bindings.data);
  }

  private async requireLocalBinding(computerId: string): Promise<WorkspaceBinding> {
    const binding = await this.resolveLocalBinding(computerId);
    if (!binding) {
      throw new Error(`Computer ${computerId} is not connected to a local directory.`);
    }
    return binding;
  }

  private async hydrateIfLocal(computer: Computer): Promise<Computer | LocalComputer> {
    const binding = await this.resolveLocalBinding(computer.id);
    if (!binding) {
      return computer;
    }
    const device = await this.localBridge.getDevice(binding.deviceId);
    return this.hydrateLocalComputer(computer, binding, device);
  }

  private async createWithLocalBinding(
    params: Omit<CreateComputerParams, 'local'>,
    local: NonNullable<CreateComputerParams['local']>,
  ): Promise<LocalComputer> {
    const derivedName = params.name?.trim() || deriveNameFromPath(local.path);
    const device = await this.resolveDevice(local.device, derivedName);

    const computer = await super.create({
      ...params,
      name: derivedName,
    });

    try {
      const binding = await this.localBridge.createBinding({
        deviceId: device.id,
        environmentId: computer.id,
        projectId: params.projectId,
        name: derivedName,
        localPath: local.path,
        syncRoot: local.syncRoot ?? local.path,
        ignorePatterns: local.ignorePatterns,
        syncMode: local.syncMode,
        executionMode: local.executionMode,
      });
      return this.hydrateLocalComputer(computer, binding, device);
    } catch (error) {
      try {
        await super.delete(computer.id);
      } catch {
        // Best effort cleanup for newly created remote state.
      }
      throw error;
    }
  }

  private async updateLocalBinding(
    computerId: string,
    currentComputer: Computer,
    local: NonNullable<UpdateComputerParams['local']>,
  ): Promise<LocalComputer> {
    const existingBinding = await this.resolveLocalBinding(computerId);
    const derivedName =
      currentComputer.name?.trim()
      || (local.path ? deriveNameFromPath(local.path) : 'Local Computer');

    if (existingBinding) {
      if (local.device?.id && local.device.id !== existingBinding.deviceId) {
        throw new Error(
          `Computer ${computerId} is already attached to a different local device. ` +
          'Changing the device for an existing local computer is not supported yet.',
        );
      }

      const updatedBinding = await this.localBridge.updateBinding(existingBinding.id, {
        localPath: local.path,
        syncRoot: local.syncRoot,
        ignorePatterns: local.ignorePatterns,
        syncMode: local.syncMode,
        executionMode: local.executionMode,
      });
      const device = await this.localBridge.getDevice(updatedBinding.deviceId);
      return this.hydrateLocalComputer(currentComputer, updatedBinding, device);
    }

    const path = local.path?.trim();
    if (!path) {
      throw new Error(
        `Computer ${computerId} is not connected locally yet. ` +
        'Set local.path when attaching a local directory.',
      );
    }

    const device = await this.resolveDevice(local.device, derivedName);
    const binding = await this.localBridge.createBinding({
      deviceId: device.id,
      environmentId: currentComputer.id,
      projectId: currentComputer.projectId ?? null,
      name: derivedName,
      localPath: path,
      syncRoot: local.syncRoot ?? path,
      ignorePatterns: local.ignorePatterns,
      syncMode: local.syncMode,
      executionMode: local.executionMode,
    });
    return this.hydrateLocalComputer(currentComputer, binding, device);
  }

  async create(params: CreateComputerParams & { local: NonNullable<CreateComputerParams['local']> }): Promise<LocalComputer>;
  async create(params: CreateComputerParams): Promise<Computer>;
  async create(params: CreateComputerParams): Promise<Computer> {
    if (params.local) {
      const { local, ...baseParams } = params;
      return this.createWithLocalBinding(baseParams, local);
    }
    return super.create(params);
  }

  async get(computerId: string): Promise<Computer>;
  async get(computerId: string): Promise<Computer> {
    const computer = await super.get(computerId);
    return this.hydrateIfLocal(computer);
  }

  async update(
    computerId: string,
    params: UpdateComputerParams & { local: NonNullable<UpdateComputerParams['local']> },
  ): Promise<LocalComputer>;
  async update(computerId: string, params: UpdateComputerParams): Promise<Computer>;
  async update(computerId: string, params: UpdateComputerParams): Promise<Computer> {
    const { local, ...baseParams } = params;
    const hasBaseUpdates = Object.values(baseParams).some((value) => value !== undefined);
    const currentComputer = hasBaseUpdates
      ? await super.update(computerId, baseParams)
      : await super.get(computerId);

    if (!local) {
      return this.hydrateIfLocal(currentComputer);
    }

    return this.updateLocalBinding(computerId, currentComputer, local);
  }

  async createLocal(params: CreateLocalComputerParams): Promise<LocalComputer> {
    const { path, syncRoot, ignorePatterns, syncMode, executionMode, device, ...computerParams } = params;
    return this.create({
      ...computerParams,
      name: params.name?.trim() || deriveNameFromPath(path),
      local: {
        path,
        syncRoot,
        ignorePatterns,
        syncMode,
        executionMode,
        device,
      },
    });
  }

  async connectLocal(
    computerId: string,
    params: ConnectLocalComputerParams,
  ): Promise<LocalComputer> {
    return this.update(computerId, {
      ...(params.name !== undefined ? { name: params.name ?? undefined } : {}),
      ...(params.projectId !== undefined ? { projectId: params.projectId } : {}),
      local: {
        path: params.path,
        syncRoot: params.syncRoot,
        ignorePatterns: params.ignorePatterns,
        syncMode: params.syncMode,
        executionMode: params.executionMode,
        device: params.device,
      },
    });
  }

  async listLocal(params: ListLocalComputersParams = {}): Promise<LocalComputer[]> {
    const bindings = await this.localBridge.listBindings({
      deviceId: params.deviceId,
      projectId: params.projectId,
      limit: params.limit,
      offset: params.offset,
    });

    const filteredBindings = bindings.data.filter((binding) => {
      if (params.syncMode && binding.syncMode !== params.syncMode) {
        return false;
      }
      if (params.executionMode && binding.executionMode !== params.executionMode) {
        return false;
      }
      return true;
    });

    const hydrated = await Promise.all(
      filteredBindings.map(async (binding) => {
        try {
          const [computer, device] = await Promise.all([
            super.get(binding.environmentId),
            this.localBridge.getDevice(binding.deviceId),
          ]);
          return this.hydrateLocalComputer(computer, binding, device);
        } catch {
          return null;
        }
      }),
    );

    return hydrated.filter((computer): computer is LocalComputer => computer !== null);
  }

  async getLocal(computerId: string): Promise<LocalComputer | null> {
    const binding = await this.resolveLocalBinding(computerId);
    if (!binding) {
      return null;
    }
    const [computer, device] = await Promise.all([
      super.get(computerId),
      this.localBridge.getDevice(binding.deviceId),
    ]);
    return this.hydrateLocalComputer(computer, binding, device);
  }

  async listPushSessions(
    computerId: string,
    params: ListWorkspacePushSessionsParams = {},
  ): Promise<{ data: WorkspacePushSession[]; total: number }> {
    const binding = await this.requireLocalBinding(computerId);
    return this.localBridge.listPushSessions(binding.id, params);
  }

  async getPushSession(computerId: string, pushSessionId: string): Promise<WorkspacePushSession> {
    const binding = await this.requireLocalBinding(computerId);
    return this.localBridge.getPushSession(binding.id, pushSessionId);
  }

  async previewPush(
    computerId: string,
    params: PrepareComputerPushParams,
  ): Promise<PrepareWorkspacePushSessionResult> {
    const binding = await this.requireLocalBinding(computerId);
    return this.localBridge.preparePushSession(binding.id, {
      plan: params.plan,
      planSignature: signatureFor(params.plan),
      metadata: params.metadata,
    });
  }

  async preparePush(
    computerId: string,
    params: PrepareComputerPushParams,
  ): Promise<PrepareWorkspacePushSessionResult> {
    return this.previewPush(computerId, params);
  }

  async listPullSessions(
    computerId: string,
    params: ListWorkspacePullSessionsParams = {},
  ): Promise<{ data: WorkspacePullSession[]; total: number }> {
    const binding = await this.requireLocalBinding(computerId);
    return this.localBridge.listPullSessions(binding.id, params);
  }

  async getPullSession(computerId: string, pullSessionId: string): Promise<WorkspacePullSession> {
    const binding = await this.requireLocalBinding(computerId);
    return this.localBridge.getPullSession(binding.id, pullSessionId);
  }

  async previewPull(
    computerId: string,
    params: PrepareComputerPullParams,
  ): Promise<PrepareWorkspacePullSessionResult> {
    const binding = await this.requireLocalBinding(computerId);
    return this.localBridge.preparePullSession(binding.id, {
      plan: params.plan,
      planSignature: signatureFor(params.plan),
      metadata: params.metadata,
    });
  }

  async preparePull(
    computerId: string,
    params: PrepareComputerPullParams,
  ): Promise<PrepareWorkspacePullSessionResult> {
    return this.previewPull(computerId, params);
  }

  async attachPullPreview(
    computerId: string,
    pullSessionId: string,
    params: AttachComputerPullPreviewParams,
  ): Promise<AttachPullSessionApplyPreviewResult> {
    const binding = await this.requireLocalBinding(computerId);
    return this.localBridge.attachPullSessionApplyPreview(binding.id, pullSessionId, {
      preview: params.preview,
      previewSignature: signatureFor(params.preview),
      metadata: params.metadata,
    });
  }

  async attachPullResult(
    computerId: string,
    pullSessionId: string,
    params: AttachComputerPullResultParams,
  ): Promise<AttachPullSessionApplyResultResult> {
    return this.applyPull(computerId, pullSessionId, params);
  }

  async applyPull(
    computerId: string,
    pullSessionId: string,
    params: AttachComputerPullResultParams,
  ): Promise<AttachPullSessionApplyResultResult> {
    const binding = await this.requireLocalBinding(computerId);
    return this.localBridge.attachPullSessionApplyResult(binding.id, pullSessionId, {
      result: params.result,
      resultSignature: signatureFor(params.result),
      metadata: params.metadata,
    });
  }

  async listLocalSessions(
    threadId: string,
    params: { computerId?: string; limit?: number; offset?: number } = {},
  ): Promise<{ data: LocalExecutionSession[]; total: number }> {
    if (!params.computerId) {
      return this.localBridge.listLocalSessions(threadId, {
        limit: params.limit,
        offset: params.offset,
      });
    }
    const localComputer = await this.getLocal(params.computerId);
    if (!localComputer) {
      return { data: [], total: 0 };
    }
    return this.localBridge.listLocalSessions(threadId, {
      deviceId: localComputer.device.id,
      limit: params.limit,
      offset: params.offset,
    });
  }

  async getLocalSession(threadId: string, localSessionId: string): Promise<LocalExecutionSession> {
    return this.localBridge.getLocalSession(threadId, localSessionId);
  }

  async createLocalSession(
    threadId: string,
    params: CreateLocalComputerSessionParams,
  ): Promise<LocalExecutionSession> {
    const localComputer = await this.getLocal(params.computerId);
    if (!localComputer) {
      throw new Error(`Computer ${params.computerId} is not connected to a local directory.`);
    }

    const { computerId: _computerId, ...sessionParams } = params;
    return this.localBridge.createLocalSession(threadId, {
      ...sessionParams,
      deviceId: localComputer.device.id,
      workspaceBindingId: localComputer.local.bindingId,
    });
  }

  async heartbeatLocalSession(
    threadId: string,
    localSessionId: string,
    params: HeartbeatLocalExecutionSessionParams = {},
  ): Promise<LocalExecutionSession> {
    return this.localBridge.heartbeatLocalSession(threadId, localSessionId, params);
  }

  async completeLocalSession(
    threadId: string,
    localSessionId: string,
    params: CompleteLocalExecutionSessionParams = {},
  ): Promise<LocalExecutionSession> {
    return this.localBridge.completeLocalSession(threadId, localSessionId, params);
  }

  async pollLocalSessionCommands(
    threadId: string,
    localSessionId: string,
    params: { limit?: number } = {},
  ): Promise<{ data: LocalSessionCommand[]; total: number }> {
    return this.localBridge.pollLocalSessionCommands(threadId, localSessionId, params);
  }

  async enqueueLocalSessionCommand(
    threadId: string,
    localSessionId: string,
    params: EnqueueLocalSessionCommandParams,
  ): Promise<LocalSessionCommand> {
    return this.localBridge.enqueueLocalSessionCommand(threadId, localSessionId, params);
  }

  async acknowledgeLocalSessionCommand(
    threadId: string,
    localSessionId: string,
    commandId: string,
    params: AcknowledgeLocalSessionCommandParams = {},
  ): Promise<LocalSessionCommand> {
    return this.localBridge.acknowledgeLocalSessionCommand(
      threadId,
      localSessionId,
      commandId,
      params,
    );
  }

  async ingestThreadEvents(
    threadId: string,
    events: LocalBridgeThreadEvent[],
  ): Promise<LocalBridgeIngestEventsResult> {
    return this.localBridge.ingestThreadEvents(threadId, events);
  }
}
