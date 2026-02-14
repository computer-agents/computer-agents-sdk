/**
 * Git Resource Manager
 *
 * Handles git operations on cloud workspaces including
 * diff, commit, and push.
 */

import type { ApiClient } from '../ApiClient';
import type {
  GitDiffResult,
  GitCommitParams,
  GitCommitResult,
  GitPushParams,
  GitPushResult,
} from '../types';

export class GitResource {
  constructor(private readonly client: ApiClient) {}

  /**
   * Get uncommitted changes in a workspace
   */
  async diff(workspaceId: string): Promise<GitDiffResult> {
    const response = await this.client.get<GitDiffResult>(
      `/git/${workspaceId}/diff`
    );
    return response;
  }

  /**
   * Create a git commit
   */
  async commit(
    workspaceId: string,
    params: GitCommitParams
  ): Promise<GitCommitResult> {
    const response = await this.client.post<GitCommitResult>(
      `/git/${workspaceId}/commit`,
      params
    );
    return response;
  }

  /**
   * Push commits to remote
   */
  async push(
    workspaceId: string,
    params: GitPushParams = {}
  ): Promise<GitPushResult> {
    const response = await this.client.post<GitPushResult>(
      `/git/${workspaceId}/push`,
      params
    );
    return response;
  }

  /**
   * Get diff for a specific commit
   */
  async getCommitDiff(workspaceId: string, commitSha: string): Promise<GitDiffResult> {
    const response = await this.client.get<GitDiffResult>(
      `/git/${workspaceId}/commits/${commitSha}/diff`
    );
    return response;
  }
}
