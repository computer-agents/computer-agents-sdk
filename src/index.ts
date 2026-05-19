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
 *   computerId: 'env_xxx',
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
  ComputersResource,
  ThreadsResource,
  TasksResource,
  NotificationsResource,
  AgentsResource,
  ResourcesResource,
  WebAppsResource,
  FunctionsResource,
  AuthResource,
  AgentRuntimesResource,
  RuntimesResource,
  SecretsResource,
  DatabasesResource,
  SkillsResource,
  BudgetResource,
  BillingResource,
  SchedulesResource,
  TriggersResource,
  OrchestrationsResource,
  GitResource,
  FilesResource,
  LocalBridgeResource,
} from './cloud/resources';

export type {
  StreamEventCallback,
  SendMessageOptions,
  SendMessageResult,
  ListEnvironmentsParams,
  ListEnvironmentChangesParams,
  ListResourcesParams,
  ResourceInvokeParams,
  ResourceFileUploadParams,
  ListDatabasesParams,
  CreateDatabaseCollectionParams,
  CreateDatabaseDocumentParams,
  UpdateDatabaseDocumentParams,
  ListSkillsParams,
  LocalBridgeListResult,
  ListDevicesParams,
  ListWorkspaceBindingsParams,
  ListWorkspacePushSessionsParams,
  ListWorkspacePullSessionsParams,
  ListLocalExecutionSessionsParams,
  PollLocalSessionCommandsParams,
  EnvironmentFile,
  ListFilesResult,
  UploadFileResult,
  MoveFileParams,
  MoveFileResult,
  DeleteFileResult,
  CreateDirectoryResult,
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
  ProjectSummary,
  ProjectListParams,
  ProjectListResult,
  ProjectDetailResult,

  // Environments
  Environment,
  Computer,
  CreateEnvironmentParams,
  CreateComputerParams,
  UpdateEnvironmentParams,
  UpdateComputerParams,
  EnvironmentStatus,
  EnvironmentVariable,
  EnvironmentComputeProfileId,
  EnvironmentComputeResources,
  EnvironmentPricingMetadata,
  EnvironmentMetadata,
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
  EnvironmentSnapshot,
  EnvironmentChangeKind,
  EnvironmentChangeOperation,
  EnvironmentChangeSourceKind,
  EnvironmentChangeFileRecord,
  EnvironmentChangeEntry,
  EnvironmentChangeListResponse,
  SnapshotFileEntry,
  EnvironmentSnapshotFilesResponse,
  EnvironmentSnapshotDiffResponse,
  EnvironmentSnapshotFileResponse,
  EnvironmentForkFromSnapshotResponse,

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
  ThreadFeedbackRating,
  ThreadFeedbackReportType,
  ThreadFeedbackSummary,
  ThreadFeedbackReportCreate,
  ThreadFeedbackReport,
  ThreadPermissionRequest,
  ThreadPermissionDecisionParams,
  ThreadPermissionDecisionResponse,

  // Tasks
  Task,
  TaskStatus,
  TaskPriority,
  TaskType,
  TaskCommentAuthorType,
  TaskSprintStatus,
  TaskReleaseStatus,
  TaskListParams,
  CreateTaskParams,
  UpdateTaskParams,
  TaskListResult,
  TaskDetails,
  TaskDetailResult,
  TaskComment,
  TaskCommentCreateParams,
  TaskCommentListParams,
  TaskCommentListResult,
  TaskSprint,
  TaskSprintCreateParams,
  TaskSprintUpdateParams,
  TaskSprintListParams,
  TaskSprintListResult,
  TaskSprintDetailResult,
  TaskRelease,
  TaskReleaseCreateParams,
  TaskReleaseUpdateParams,
  TaskReleaseListParams,
  TaskReleaseListResult,
  TaskReleaseDetailResult,
  TaskWorkspaceParams,
  TaskWorkspaceResult,
  TaskStartThreadParams,
  TaskStartThreadResult,
  TaskRunThreadParams,
  TaskRunThreadResult,

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
  BuiltinAgentModel,
  AgentModel,
  ReasoningEffort,
  DeepResearchModel,
  AgentBinary,
  PermissionAccessLevel,
  PermissionResourceType,
  PermissionSetSubjectType,
  PermissionRule,
  PermissionResourcePolicy,
  PermissionSet,
  AgentModelCatalogEntry,
  AgentAnalyticsResponse,

  // Resources / Databases / Skills
  Resource,
  CreateResourceParams,
  UpdateResourceParams,
  ResourceKind,
  ResourceAuthMode,
  ResourceStatus,
  ResourceAnalyticsResponse,
  ResourceLogEntry,
  ResourceBinding,
  Database,
  CreateDatabaseParams,
  UpdateDatabaseParams,
  DatabaseCollection,
  DatabaseDocument,
  Skill,
  SkillFile,
  SkillCategory,
  CreateSkillParams,
  UpdateSkillParams,

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
  InAppNotification,
  PushTokenRegistration,
  PushTokenRegistrationResponse,
  PushTokenDeleteResponse,
  PushTokenDescriptor,

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

  // Local Bridge
  Device,
  DeviceStatus,
  CreateDeviceParams,
  UpdateDeviceParams,
  HeartbeatDeviceParams,
  WorkspaceBinding,
  WorkspaceBindingSyncMode,
  WorkspaceBindingExecutionMode,
  LocalComputer,
  LocalComputerDevice,
  LocalComputerDeviceHint,
  CreateLocalComputerParams,
  ConnectLocalComputerParams,
  ListLocalComputersParams,
  PrepareComputerPushParams,
  PrepareComputerPullParams,
  AttachComputerPullPreviewParams,
  AttachComputerPullResultParams,
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
  CreateLocalComputerSessionParams,
  CreateLocalExecutionSessionParams,
  HeartbeatLocalExecutionSessionParams,
  CompleteLocalExecutionSessionParams,
  LocalSessionCommand,
  LocalSessionCommandType,
  LocalSessionCommandStatus,
  EnqueueLocalSessionCommandParams,
  AcknowledgeLocalSessionCommandParams,
  LocalBridgeThreadEvent,
  LocalBridgeIngestEventsResult,

  // Health
  HealthCheck,
  Metrics,
} from './cloud/types';

// ============================================================================
// Low-level API Client (for advanced usage)
// ============================================================================

export { ApiClient } from './cloud/ApiClient';
