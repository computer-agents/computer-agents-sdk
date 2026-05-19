/**
 * Tasks Resource Manager
 *
 * Handles planning tasks, comments, sprints, releases, workspace board payloads,
 * and task-to-thread execution.
 */

import type { ApiClient } from '../ApiClient';
import type {
  CreateTaskParams,
  Task,
  TaskComment,
  TaskCommentCreateParams,
  TaskCommentListParams,
  TaskCommentListResult,
  TaskDetailResult,
  TaskListParams,
  TaskListResult,
  TaskRelease,
  TaskReleaseCreateParams,
  TaskReleaseDetailResult,
  TaskReleaseListParams,
  TaskReleaseListResult,
  TaskReleaseUpdateParams,
  TaskRunThreadParams,
  TaskRunThreadResult,
  TaskSprint,
  TaskSprintCreateParams,
  TaskSprintDetailResult,
  TaskSprintListParams,
  TaskSprintListResult,
  TaskSprintUpdateParams,
  TaskStartThreadParams,
  TaskStartThreadResult,
  TaskWorkspaceParams,
  TaskWorkspaceResult,
  UpdateTaskParams,
} from '../types';

type ListResponse<T> = {
  data: T[];
  has_more?: boolean;
  total_count?: number;
};

function toListResult<T>(response: ListResponse<T>): { data: T[]; hasMore: boolean; total: number } {
  return {
    data: response.data,
    hasMore: response.has_more ?? false,
    total: response.total_count ?? response.data.length,
  };
}

function toQuery(params: object): Record<string, string | number | boolean | undefined> {
  const query: Record<string, string | number | boolean | undefined> = {};
  for (const [key, value] of Object.entries(params as Record<string, unknown>)) {
    if (value === null) {
      query[key] = 'none';
    } else if (value === undefined || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      query[key] = value;
    }
  }
  return query;
}

export class TasksResource {
  constructor(private readonly client: ApiClient) {}

  /**
   * List tasks across projects.
   */
  async list(params: TaskListParams = {}): Promise<TaskListResult> {
    const response = await this.client.get<ListResponse<Task>>('/tasks', toQuery(params));
    return toListResult(response);
  }

  /**
   * Create a task.
   */
  async create(params: CreateTaskParams): Promise<Task> {
    const response = await this.client.post<{ task: Task }>('/tasks', params);
    return response.task;
  }

  /**
   * Get a task with details, linked threads, and comments.
   */
  async get(taskId: string): Promise<TaskDetailResult> {
    return this.client.get<TaskDetailResult>(`/tasks/${taskId}`);
  }

  /**
   * Update a task.
   */
  async update(taskId: string, params: UpdateTaskParams): Promise<Task> {
    const response = await this.client.patch<{ task: Task }>(`/tasks/${taskId}`, params);
    return response.task;
  }

  /**
   * Delete a task.
   */
  async delete(taskId: string): Promise<Record<string, unknown>> {
    return this.client.delete(`/tasks/${taskId}`);
  }

  /**
   * Build the board-ready task workspace payload.
   */
  async workspace(params: TaskWorkspaceParams = {}): Promise<TaskWorkspaceResult> {
    return this.client.get<TaskWorkspaceResult>('/tasks/workspace', toQuery(params));
  }

  /**
   * List task comments.
   */
  async listComments(taskId: string, params: TaskCommentListParams = {}): Promise<TaskCommentListResult> {
    const response = await this.client.get<ListResponse<TaskComment>>(`/tasks/${taskId}/comments`, toQuery(params));
    return toListResult(response);
  }

  /**
   * Create a task comment.
   */
  async createComment(taskId: string, params: TaskCommentCreateParams): Promise<TaskComment> {
    const response = await this.client.post<{ comment: TaskComment }>(`/tasks/${taskId}/comments`, params);
    return response.comment;
  }

  /**
   * Create and link a new thread for a task.
   */
  async startThread(taskId: string, params: TaskStartThreadParams = {}): Promise<TaskStartThreadResult> {
    return this.client.post<TaskStartThreadResult>(`/tasks/${taskId}/start-thread`, params);
  }

  /**
   * Create, link, and synchronously execute a new thread for a task.
   */
  async runThread(taskId: string, params: TaskRunThreadParams = {}): Promise<TaskRunThreadResult> {
    return this.client.post<TaskRunThreadResult>(`/tasks/${taskId}/run-thread`, params);
  }

  /**
   * List sprints.
   */
  async listSprints(params: TaskSprintListParams = {}): Promise<TaskSprintListResult> {
    const response = await this.client.get<ListResponse<TaskSprint>>('/tasks/sprints', toQuery(params));
    return toListResult(response);
  }

  /**
   * Create a sprint.
   */
  async createSprint(params: TaskSprintCreateParams): Promise<TaskSprint> {
    const response = await this.client.post<{ sprint: TaskSprint }>('/tasks/sprints', params);
    return response.sprint;
  }

  /**
   * Get a sprint and its tasks.
   */
  async getSprint(sprintId: string): Promise<TaskSprintDetailResult> {
    return this.client.get<TaskSprintDetailResult>(`/tasks/sprints/${sprintId}`);
  }

  /**
   * Update a sprint.
   */
  async updateSprint(sprintId: string, params: TaskSprintUpdateParams): Promise<TaskSprint> {
    const response = await this.client.patch<{ sprint: TaskSprint }>(`/tasks/sprints/${sprintId}`, params);
    return response.sprint;
  }

  /**
   * Delete a sprint.
   */
  async deleteSprint(sprintId: string): Promise<Record<string, unknown>> {
    return this.client.delete(`/tasks/sprints/${sprintId}`);
  }

  /**
   * List releases.
   */
  async listReleases(params: TaskReleaseListParams = {}): Promise<TaskReleaseListResult> {
    const response = await this.client.get<ListResponse<TaskRelease>>('/tasks/releases', toQuery(params));
    return toListResult(response);
  }

  /**
   * Create a release.
   */
  async createRelease(params: TaskReleaseCreateParams): Promise<TaskRelease> {
    const response = await this.client.post<{ release: TaskRelease }>('/tasks/releases', params);
    return response.release;
  }

  /**
   * Get a release and its tasks.
   */
  async getRelease(releaseId: string): Promise<TaskReleaseDetailResult> {
    return this.client.get<TaskReleaseDetailResult>(`/tasks/releases/${releaseId}`);
  }

  /**
   * Update a release.
   */
  async updateRelease(releaseId: string, params: TaskReleaseUpdateParams): Promise<TaskRelease> {
    const response = await this.client.patch<{ release: TaskRelease }>(`/tasks/releases/${releaseId}`, params);
    return response.release;
  }

  /**
   * Delete a release.
   */
  async deleteRelease(releaseId: string): Promise<Record<string, unknown>> {
    return this.client.delete(`/tasks/releases/${releaseId}`);
  }
}
