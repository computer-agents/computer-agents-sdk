/**
 * Computer Agents SDK
 *
 * A simple, clean SDK for the Computer Agents Cloud API.
 *
 * @example
 * ```typescript
 * import { ComputerAgentsClient } from 'computer-agents';
 *
 * const client = new ComputerAgentsClient({
 *   apiKey: process.env.COMPUTER_AGENTS_API_KEY
 * });
 *
 * // Execute a task
 * const result = await client.run('Create a REST API', {
 *   environmentId: 'env_xxx',
 *   onEvent: (event) => console.log(event.type)
 * });
 *
 * console.log(result.content);
 * ```
 */

// ============================================================================
// Main Client
// ============================================================================

export {
  ComputerAgentsClient,
  // Backwards compatibility aliases
  CloudClient,
  TestbaseClient,
  // Error class
  ApiClientError,
} from './ComputerAgentsClient';

export type {
  ComputerAgentsClientConfig,
  RunOptions,
  RunResult,
  ApiClientConfig,
} from './ComputerAgentsClient';

// ============================================================================
// Resource Managers (for advanced usage)
// ============================================================================

export {
  ProjectsResource,
  EnvironmentsResource,
  ThreadsResource,
  RunsResource,
  AgentsResource,
  BudgetResource,
  BillingResource,
  SchedulesResource,
  TriggersResource,
  OrchestrationsResource,
  GitResource,
} from './cloud/resources';

export type {
  StreamEventCallback,
  SendMessageOptions,
  SendMessageResult,
  ListEnvironmentsParams,
} from './cloud/resources';

// ============================================================================
// API Types
// ============================================================================

export type {
  // Common
  PaginationParams,
  PaginatedResponse,
  ApiError,

  // Projects
  Project,
  CreateProjectParams,
  UpdateProjectParams,
  ProjectStats,
  ProjectType,
  ProjectSource,

  // Environments
  Environment,
  CreateEnvironmentParams,
  UpdateEnvironmentParams,
  EnvironmentStatus,
  EnvironmentVariable,
  McpServer,
  ContainerStatus,
  BuildResult,
  BuildStatus,
  BuildStatusResult,
  BuildLogsResult,
  TestBuildResult,
  DockerfileResult,
  ValidateDockerfileResult,
  RuntimeConfig,
  PackagesConfig,
  AvailableRuntimes,
  PackageType,
  InstallPackagesResult,
  StartContainerParams,
  StartContainerResult,

  // Threads
  Thread,
  CreateThreadParams,
  UpdateThreadParams,
  ListThreadsParams,
  SendMessageParams,
  ThreadMessage,
  ThreadStatus,
  AgentConfig,
  CopyThreadParams,
  SearchThreadsParams,
  SearchThreadResult,
  SearchThreadsResponse,
  ThreadLogEntry,
  ResearchSession,

  // Stream Events
  StreamEvent,
  MessageStreamEvent,
  ResponseStartedEvent,
  ResponseItemCompletedEvent,
  ResponseCompletedEvent,
  StreamCompletedEvent,
  StreamErrorEvent,

  // Runs
  Run,
  CreateRunParams,
  UpdateRunParams,
  ListRunsParams,
  RunStatus,
  RunLogEntry,
  RunDiff,
  TokenUsage,

  // Agents
  CloudAgent,
  CreateAgentParams,
  UpdateAgentParams,
  AgentModel,
  ReasoningEffort,
  DeepResearchModel,
  AgentBinary,

  // Budget & Billing
  BudgetStatus,
  CanExecuteResult,
  IncreaseBudgetParams,
  IncreaseBudgetResult,
  BillingRecord,
  ListBillingRecordsParams,
  BillingAccount,
  UsageStats,
  UsageStatsParams,

  // Files
  FileEntry,
  ListFilesParams,
  UploadFileParams,
  CreateDirectoryParams,

  // Git
  GitDiffFile,
  GitDiffResult,
  GitCommitParams,
  GitCommitResult,
  GitPushParams,
  GitPushResult,

  // Schedules
  Schedule,
  CreateScheduleParams,
  UpdateScheduleParams,
  ScheduleType,

  // Triggers
  TriggerSource,
  Trigger,
  TriggerAction,
  CreateTriggerParams,
  UpdateTriggerParams,
  TriggerExecution,

  // Orchestrations
  OrchestrationStrategy,
  OrchestrationStep,
  Orchestration,
  CreateOrchestrationParams,
  UpdateOrchestrationParams,
  OrchestrationRun,
  OrchestrationStepResult,

  // Health
  HealthCheck,
  Metrics,
} from './cloud/types';

// ============================================================================
// Low-level API Client (for advanced usage)
// ============================================================================

export { ApiClient } from './cloud/ApiClient';
