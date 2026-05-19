/**
 * Projects Resource Manager
 *
 * Handles project-related API operations including file management.
 *
 * Note: With the simplified API, each API key is bound to exactly one project.
 * The project is determined automatically from the API key, so no projectId
 * parameter is needed in method calls.
 */

import type { ApiClient } from '../ApiClient';
import type {
  Project,
  CreateProjectParams,
  UpdateProjectParams,
  ProjectStats,
  ProjectDetailResult,
  ProjectListParams,
  ProjectListResult,
  FileEntry,
  ListFilesParams,
  UploadFileParams,
  CreateDirectoryParams,
} from '../types';

export class ProjectsResource {
  constructor(private readonly client: ApiClient) {}

  private toQuery(params: object): Record<string, string | number | boolean | undefined> {
    const query: Record<string, string | number | boolean | undefined> = {};
    for (const [key, value] of Object.entries(params as Record<string, unknown>)) {
      if (value === undefined || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        query[key] = value;
      }
    }
    return query;
  }

  /**
   * List planning projects for the authenticated user.
   */
  async list(params: ProjectListParams = {}): Promise<ProjectListResult> {
    const response = await this.client.get<{
      data: Array<Project & { summary?: Record<string, unknown> }>;
      has_more?: boolean;
      total_count?: number;
    }>(`/projects`, this.toQuery(params));
    return {
      data: response.data,
      hasMore: response.has_more ?? false,
      total: response.total_count ?? response.data.length,
    };
  }

  /**
   * Create a planning project.
   */
  async create(params: CreateProjectParams): Promise<Project> {
    const response = await this.client.post<{ project: Project }>(
      `/projects`,
      params
    );
    return response.project;
  }

  /**
   * Get a planning project by ID.
   */
  async getById(projectId: string): Promise<ProjectDetailResult> {
    return this.client.get<ProjectDetailResult>(`/projects/${projectId}`);
  }

  /**
   * Update a planning project by ID.
   */
  async updateById(projectId: string, params: UpdateProjectParams): Promise<Project> {
    const response = await this.client.patch<{ project: Project }>(
      `/projects/${projectId}`,
      params
    );
    return response.project;
  }

  /**
   * Delete a planning project by ID.
   */
  async deleteById(projectId: string): Promise<Record<string, unknown>> {
    return this.client.delete(`/projects/${projectId}`);
  }

  /**
   * List schedules attached to a planning project.
   */
  async listSchedules(projectId: string, params: { rangeStart?: string; rangeEnd?: string } = {}): Promise<{
    data: Array<Record<string, unknown>>;
    hasMore: boolean;
    total: number;
  }> {
    const response = await this.client.get<{
      data: Array<Record<string, unknown>>;
      has_more?: boolean;
      total_count?: number;
    }>(`/projects/${projectId}/schedules`, this.toQuery(params));
    return {
      data: response.data,
      hasMore: response.has_more ?? false,
      total: response.total_count ?? response.data.length,
    };
  }

  /**
   * Get the current project (bound to this API key)
   *
   * Project is determined automatically from the API key.
   */
  async get(): Promise<Project & { stats?: ProjectStats }> {
    const response = await this.client.get<{ project: Project & { stats?: ProjectStats } }>(
      `/project`
    );
    return response.project;
  }

  /**
   * Update the current project
   *
   * Project is determined automatically from the API key.
   */
  async update(params: UpdateProjectParams): Promise<Project> {
    const response = await this.client.patch<{ project: Project }>(
      `/project`,
      params
    );
    return response.project;
  }

  /**
   * Sync project with cloud storage
   *
   * Project is determined automatically from the API key.
   */
  async sync(
    changes?: {
      added?: string[];
      modified?: string[];
      deleted?: string[];
    }
  ): Promise<{ synced: boolean; fileCount: number }> {
    const response = await this.client.post<{ synced: boolean; fileCount: number }>(
      `/project/sync`,
      { changes }
    );
    return response;
  }

  // =========================================================================
  // File Operations
  // =========================================================================

  /**
   * List files in the project
   *
   * Project is determined automatically from the API key.
   */
  async listFiles(params: ListFilesParams = {}): Promise<FileEntry[]> {
    const response = await this.client.get<{ files: FileEntry[] }>(
      `/files`,
      {
        path: params.path,
        environmentId: params.environmentId,
        recursive: params.recursive,
      }
    );
    return response.files;
  }

  /**
   * Get a file's content
   *
   * Project is determined automatically from the API key.
   */
  async getFile(
    filePath: string,
    environmentId?: string
  ): Promise<string> {
    const encodedPath = encodeURIComponent(filePath);
    const response = await this.client.get<string>(
      `/files/${encodedPath}`,
      { environmentId }
    );
    return response;
  }

  /**
   * Upload a file
   *
   * Project is determined automatically from the API key.
   */
  async uploadFile(
    params: UploadFileParams
  ): Promise<FileEntry> {
    // For single file upload, we use the PUT endpoint
    const encodedPath = encodeURIComponent(params.path);
    const response = await this.client.put<{ file: FileEntry }>(
      `/files/${encodedPath}`,
      {
        content: typeof params.content === 'string'
          ? params.content
          : params.content.toString('base64'),
        contentType: params.contentType,
        environmentId: params.environmentId,
      }
    );
    return response.file;
  }

  /**
   * Delete a file or directory
   *
   * Project is determined automatically from the API key.
   */
  async deleteFile(
    filePath: string,
    recursive: boolean = false
  ): Promise<void> {
    const encodedPath = encodeURIComponent(filePath);
    await this.client.delete(
      `/files/${encodedPath}${recursive ? '?recursive=true' : ''}`
    );
  }

  /**
   * Move or rename a file
   *
   * Project is determined automatically from the API key.
   */
  async moveFile(
    sourcePath: string,
    destinationPath: string
  ): Promise<FileEntry> {
    const response = await this.client.post<{ file: FileEntry }>(
      `/files/move`,
      { source: sourcePath, destination: destinationPath }
    );
    return response.file;
  }

  /**
   * Create a directory
   *
   * Project is determined automatically from the API key.
   */
  async createDirectory(
    params: CreateDirectoryParams
  ): Promise<FileEntry> {
    const response = await this.client.post<{ directory: FileEntry }>(
      `/directories`,
      params
    );
    return response.directory;
  }
}
