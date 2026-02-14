/**
 * Runs Resource Manager
 *
 * Handles execution tracking including CRUD operations,
 * logs retrieval, and file diffs.
 *
 * Note: projectId is now embedded in the API key, so routes use
 * simplified paths without /projects/:projectId prefix.
 */

import type { ApiClient } from '../ApiClient';
import type {
  Run,
  CreateRunParams,
  UpdateRunParams,
  ListRunsParams,
  RunLogEntry,
  RunDiff,
} from '../types';

export class RunsResource {
  constructor(private readonly client: ApiClient) {}

  /**
   * Create a new run
   *
   * Project is determined automatically from the API key.
   */
  async create(params: CreateRunParams): Promise<Run> {
    const response = await this.client.post<{ run: Run }>(
      `/runs`,
      params
    );
    return response.run;
  }

  /**
   * List runs
   *
   * Project is determined automatically from the API key.
   */
  async list(params: ListRunsParams = {}): Promise<{
    runs: Run[];
    pagination: { total: number; limit: number; offset: number };
  }> {
    const response = await this.client.get<{
      runs: Run[];
      pagination: { total: number; limit: number; offset: number };
    }>(`/runs`, {
      limit: params.limit,
      offset: params.offset,
      threadId: params.threadId,
      status: params.status,
      since: params.since,
    });
    return response;
  }

  /**
   * Get a run by ID
   */
  async get(runId: string): Promise<Run> {
    const response = await this.client.get<{ run: Run }>(
      `/runs/${runId}`
    );
    return response.run;
  }

  /**
   * Update a run
   */
  async update(
    runId: string,
    params: UpdateRunParams
  ): Promise<Run> {
    const response = await this.client.patch<{ run: Run }>(
      `/runs/${runId}`,
      params
    );
    return response.run;
  }

  /**
   * Delete a run
   */
  async delete(runId: string): Promise<void> {
    await this.client.delete(`/runs/${runId}`);
  }

  /**
   * Get logs for a run
   */
  async getLogs(
    runId: string,
    options?: { level?: 'all' | 'info' | 'error'; format?: 'json' | 'text' }
  ): Promise<RunLogEntry[]> {
    const response = await this.client.get<{ logs: RunLogEntry[] }>(
      `/runs/${runId}/logs`,
      options
    );
    return response.logs;
  }

  /**
   * Append a log entry to a run
   */
  async appendLog(
    runId: string,
    entry: Omit<RunLogEntry, 'timestamp'>
  ): Promise<void> {
    await this.client.post(`/runs/${runId}/logs`, entry);
  }

  /**
   * Get file diffs for a run
   */
  async getDiffs(runId: string): Promise<RunDiff[]> {
    const response = await this.client.get<{ diffs: RunDiff[] }>(
      `/threads/${runId}/diffs`
    );
    return response.diffs;
  }
}
