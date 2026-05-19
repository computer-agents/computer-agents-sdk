import type { ApiClient } from '../ApiClient';
import type {
  Device,
  DeviceStatus,
  CreateDeviceParams,
  UpdateDeviceParams,
  HeartbeatDeviceParams,
  WorkspaceBinding,
  CreateWorkspaceBindingParams,
  UpdateWorkspaceBindingParams,
  WorkspacePushSession,
  WorkspacePushSessionStatus,
  PrepareWorkspacePushSessionParams,
  PrepareWorkspacePushSessionResult,
  WorkspacePullSession,
  WorkspacePullSessionStatus,
  PrepareWorkspacePullSessionParams,
  PrepareWorkspacePullSessionResult,
  AttachPullSessionApplyPreviewParams,
  AttachPullSessionApplyPreviewResult,
  AttachPullSessionApplyResultParams,
  AttachPullSessionApplyResultResult,
  LocalExecutionSession,
  LocalExecutionSessionStatus,
  CreateLocalExecutionSessionParams,
  HeartbeatLocalExecutionSessionParams,
  CompleteLocalExecutionSessionParams,
  LocalSessionCommand,
  EnqueueLocalSessionCommandParams,
  AcknowledgeLocalSessionCommandParams,
  LocalBridgeThreadEvent,
  LocalBridgeIngestEventsResult,
} from '../types';

export interface LocalBridgeListResult<T> {
  data: T[];
  total: number;
}

export interface ListDevicesParams {
  status?: DeviceStatus;
  limit?: number;
  offset?: number;
}

export interface ListWorkspaceBindingsParams {
  deviceId?: string;
  environmentId?: string;
  projectId?: string | null;
  limit?: number;
  offset?: number;
}

export interface ListWorkspacePushSessionsParams {
  status?: WorkspacePushSessionStatus;
  limit?: number;
  offset?: number;
}

export interface ListWorkspacePullSessionsParams {
  status?: WorkspacePullSessionStatus;
  limit?: number;
  offset?: number;
}

export interface ListLocalExecutionSessionsParams {
  deviceId?: string;
  status?: LocalExecutionSessionStatus;
  limit?: number;
  offset?: number;
}

export interface PollLocalSessionCommandsParams {
  limit?: number;
}

interface ListEnvelope<T> {
  data: T[];
  total_count: number;
}

export class LocalBridgeResource {
  constructor(private readonly client: ApiClient) {}

  private normalizeList<T>(response: ListEnvelope<T>): LocalBridgeListResult<T> {
    return {
      data: response.data,
      total: response.total_count,
    };
  }

  private normalizeProjectId(projectId: string | null | undefined): string | undefined {
    if (projectId === null) {
      return 'none';
    }
    return projectId ?? undefined;
  }

  async listDevices(params: ListDevicesParams = {}): Promise<LocalBridgeListResult<Device>> {
    const response = await this.client.get<ListEnvelope<Device>>('/devices', {
      status: params.status,
      limit: params.limit,
      offset: params.offset,
    });
    return this.normalizeList(response);
  }

  async createDevice(params: CreateDeviceParams): Promise<Device> {
    const response = await this.client.post<{ device: Device }>('/devices', params);
    return response.device;
  }

  async getDevice(deviceId: string): Promise<Device> {
    const response = await this.client.get<{ device: Device }>(`/devices/${deviceId}`);
    return response.device;
  }

  async updateDevice(deviceId: string, params: UpdateDeviceParams): Promise<Device> {
    const response = await this.client.patch<{ device: Device }>(`/devices/${deviceId}`, params);
    return response.device;
  }

  async heartbeatDevice(deviceId: string, params: HeartbeatDeviceParams = {}): Promise<Device> {
    const response = await this.client.post<{ device: Device }>(`/devices/${deviceId}/heartbeat`, params);
    return response.device;
  }

  async deleteDevice(deviceId: string): Promise<void> {
    await this.client.delete(`/devices/${deviceId}`);
  }

  async listBindings(params: ListWorkspaceBindingsParams = {}): Promise<LocalBridgeListResult<WorkspaceBinding>> {
    const response = await this.client.get<ListEnvelope<WorkspaceBinding>>('/workspace-bindings', {
      deviceId: params.deviceId,
      environmentId: params.environmentId,
      projectId: this.normalizeProjectId(params.projectId),
      limit: params.limit,
      offset: params.offset,
    });
    return this.normalizeList(response);
  }

  async createBinding(params: CreateWorkspaceBindingParams): Promise<WorkspaceBinding> {
    const response = await this.client.post<{ binding: WorkspaceBinding }>('/workspace-bindings', params);
    return response.binding;
  }

  async getBinding(bindingId: string): Promise<WorkspaceBinding> {
    const response = await this.client.get<{ binding: WorkspaceBinding }>(`/workspace-bindings/${bindingId}`);
    return response.binding;
  }

  async updateBinding(bindingId: string, params: UpdateWorkspaceBindingParams): Promise<WorkspaceBinding> {
    const response = await this.client.patch<{ binding: WorkspaceBinding }>(`/workspace-bindings/${bindingId}`, params);
    return response.binding;
  }

  async deleteBinding(bindingId: string): Promise<void> {
    await this.client.delete(`/workspace-bindings/${bindingId}`);
  }

  async listPushSessions(
    bindingId: string,
    params: ListWorkspacePushSessionsParams = {},
  ): Promise<LocalBridgeListResult<WorkspacePushSession>> {
    const response = await this.client.get<ListEnvelope<WorkspacePushSession>>(
      `/workspace-bindings/${bindingId}/push-sessions`,
      {
        status: params.status,
        limit: params.limit,
        offset: params.offset,
      },
    );
    return this.normalizeList(response);
  }

  async getPushSession(bindingId: string, pushSessionId: string): Promise<WorkspacePushSession> {
    const response = await this.client.get<{ pushSession: WorkspacePushSession }>(
      `/workspace-bindings/${bindingId}/push-sessions/${pushSessionId}`,
    );
    return response.pushSession;
  }

  async preparePushSession(
    bindingId: string,
    params: PrepareWorkspacePushSessionParams,
  ): Promise<PrepareWorkspacePushSessionResult> {
    return this.client.post<PrepareWorkspacePushSessionResult>(
      `/workspace-bindings/${bindingId}/push-sessions`,
      params,
    );
  }

  async listPullSessions(
    bindingId: string,
    params: ListWorkspacePullSessionsParams = {},
  ): Promise<LocalBridgeListResult<WorkspacePullSession>> {
    const response = await this.client.get<ListEnvelope<WorkspacePullSession>>(
      `/workspace-bindings/${bindingId}/pull-sessions`,
      {
        status: params.status,
        limit: params.limit,
        offset: params.offset,
      },
    );
    return this.normalizeList(response);
  }

  async getPullSession(bindingId: string, pullSessionId: string): Promise<WorkspacePullSession> {
    const response = await this.client.get<{ pullSession: WorkspacePullSession }>(
      `/workspace-bindings/${bindingId}/pull-sessions/${pullSessionId}`,
    );
    return response.pullSession;
  }

  async preparePullSession(
    bindingId: string,
    params: PrepareWorkspacePullSessionParams,
  ): Promise<PrepareWorkspacePullSessionResult> {
    return this.client.post<PrepareWorkspacePullSessionResult>(
      `/workspace-bindings/${bindingId}/pull-sessions`,
      params,
    );
  }

  async attachPullSessionApplyPreview(
    bindingId: string,
    pullSessionId: string,
    params: AttachPullSessionApplyPreviewParams,
  ): Promise<AttachPullSessionApplyPreviewResult> {
    return this.client.post<AttachPullSessionApplyPreviewResult>(
      `/workspace-bindings/${bindingId}/pull-sessions/${pullSessionId}/apply-preview`,
      params,
    );
  }

  async attachPullSessionApplyResult(
    bindingId: string,
    pullSessionId: string,
    params: AttachPullSessionApplyResultParams,
  ): Promise<AttachPullSessionApplyResultResult> {
    return this.client.post<AttachPullSessionApplyResultResult>(
      `/workspace-bindings/${bindingId}/pull-sessions/${pullSessionId}/apply-result`,
      params,
    );
  }

  async listLocalSessions(
    threadId: string,
    params: ListLocalExecutionSessionsParams = {},
  ): Promise<LocalBridgeListResult<LocalExecutionSession>> {
    const response = await this.client.get<ListEnvelope<LocalExecutionSession>>(
      `/threads/${threadId}/local-sessions`,
      {
        deviceId: params.deviceId,
        status: params.status,
        limit: params.limit,
        offset: params.offset,
      },
    );
    return this.normalizeList(response);
  }

  async createLocalSession(
    threadId: string,
    params: CreateLocalExecutionSessionParams,
  ): Promise<LocalExecutionSession> {
    const response = await this.client.post<{ session: LocalExecutionSession }>(
      `/threads/${threadId}/local-sessions`,
      params,
    );
    return response.session;
  }

  async getLocalSession(threadId: string, localSessionId: string): Promise<LocalExecutionSession> {
    const response = await this.client.get<{ session: LocalExecutionSession }>(
      `/threads/${threadId}/local-sessions/${localSessionId}`,
    );
    return response.session;
  }

  async heartbeatLocalSession(
    threadId: string,
    localSessionId: string,
    params: HeartbeatLocalExecutionSessionParams = {},
  ): Promise<LocalExecutionSession> {
    const response = await this.client.post<{ session: LocalExecutionSession }>(
      `/threads/${threadId}/local-sessions/${localSessionId}/heartbeat`,
      params,
    );
    return response.session;
  }

  async completeLocalSession(
    threadId: string,
    localSessionId: string,
    params: CompleteLocalExecutionSessionParams = {},
  ): Promise<LocalExecutionSession> {
    const response = await this.client.post<{ session: LocalExecutionSession }>(
      `/threads/${threadId}/local-sessions/${localSessionId}/complete`,
      params,
    );
    return response.session;
  }

  async pollLocalSessionCommands(
    threadId: string,
    localSessionId: string,
    params: PollLocalSessionCommandsParams = {},
  ): Promise<LocalBridgeListResult<LocalSessionCommand>> {
    const response = await this.client.get<ListEnvelope<LocalSessionCommand>>(
      `/threads/${threadId}/local-sessions/${localSessionId}/control/poll`,
      {
        limit: params.limit,
      },
    );
    return this.normalizeList(response);
  }

  async enqueueLocalSessionCommand(
    threadId: string,
    localSessionId: string,
    params: EnqueueLocalSessionCommandParams,
  ): Promise<LocalSessionCommand> {
    const response = await this.client.post<{ command: LocalSessionCommand }>(
      `/threads/${threadId}/local-sessions/${localSessionId}/control`,
      params,
    );
    return response.command;
  }

  async acknowledgeLocalSessionCommand(
    threadId: string,
    localSessionId: string,
    commandId: string,
    params: AcknowledgeLocalSessionCommandParams = {},
  ): Promise<LocalSessionCommand> {
    const response = await this.client.post<{ command: LocalSessionCommand }>(
      `/threads/${threadId}/local-sessions/${localSessionId}/control/${commandId}/ack`,
      params,
    );
    return response.command;
  }

  async ingestThreadEvents(
    threadId: string,
    events: LocalBridgeThreadEvent[],
  ): Promise<LocalBridgeIngestEventsResult> {
    return this.client.post<LocalBridgeIngestEventsResult>(
      `/threads/${threadId}/events/ingest`,
      { events },
    );
  }
}
