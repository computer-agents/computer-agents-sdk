/**
 * Cloud API Types
 *
 * These types mirror the cloud infrastructure API exactly.
 * Base URL: https://api.computer-agents.com
 */

// ============================================================================
// Common Types
// ============================================================================

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

export interface ApiError {
  error: string;
  message?: string;
  code?: string;
  details?: Record<string, unknown>;
}

// ============================================================================
// Project Types
// ============================================================================

export type ProjectType = 'cloud' | 'local' | 'synced';

export interface ProjectSource {
  type: 'github' | 'gitlab' | 'local';
  url?: string;
  branch?: string;
  path?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  type: ProjectType;
  sources?: ProjectSource[];
  userId?: string;
  metadata?: Record<string, unknown>;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface CreateProjectParams {
  id?: string;
  name: string;
  description?: string;
  type?: ProjectType;
  sources?: ProjectSource[];
  metadata?: Record<string, unknown>;
  tags?: string[];
}

export interface UpdateProjectParams {
  name?: string;
  description?: string;
  metadata?: Record<string, unknown>;
  tags?: string[];
}

export interface ProjectStats {
  threadCount: number;
  runCount: number;
  totalTokens: number;
  totalCost: number;
  storageBytes: number;
}

// ============================================================================
// Environment Types
// ============================================================================

export type EnvironmentStatus = 'stopped' | 'building' | 'running' | 'error';
export type BuildStatus = 'pending' | 'building' | 'ready' | 'failed';

export interface EnvironmentVariable {
  key: string;
  value: string;
}

export interface McpServer {
  type: 'stdio' | 'http';
  name: string;
  command?: string;
  args?: string[];
  url?: string;
  bearerToken?: string;
  env?: Record<string, string>;
  enabled?: boolean;
}

/**
 * Runtime version configuration
 * Keys are runtime names (python, nodejs, go, etc.)
 * Values are version strings
 */
export interface RuntimeConfig {
  python?: string;
  nodejs?: string;
  go?: string;
  php?: string;
  java?: string;
  ruby?: string;
  rust?: string;
}

/**
 * Package configuration by type
 */
export interface PackagesConfig {
  system?: string[];  // apt packages
  python?: string[];  // pip packages
  node?: string[];    // npm packages
}

/**
 * Available runtimes with their supported versions
 */
export interface AvailableRuntimes {
  python: string[];
  nodejs: string[];
  go: string[];
  php: string[];
  java: string[];
  ruby: string[];
  rust: string[];
}

export interface Environment {
  id: string;
  userId: string;
  name: string;
  description?: string;
  status: EnvironmentStatus;

  // Runtime & Package Configuration
  baseImage?: string;
  dockerfileExtensions?: string;
  runtimes?: RuntimeConfig;
  packages?: PackagesConfig;

  // Environment Configuration
  environmentVariables?: EnvironmentVariable[];
  secrets?: EnvironmentVariable[];
  setupScripts?: string[];
  mcpServers?: McpServer[];
  documentation?: string[];
  internetAccess?: boolean;

  // Build Status
  buildStatus?: BuildStatus;
  buildHash?: string;
  buildError?: string;
  buildLogs?: string;
  lastBuildAt?: string;
  imageTag?: string;

  // Metadata
  isDefault?: boolean;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;

  /** @deprecated Use userId instead */
  projectId?: string;
}

export interface CreateEnvironmentParams {
  name: string;
  description?: string;
  runtimes?: RuntimeConfig;
  packages?: PackagesConfig;
  dockerfileExtensions?: string;
  environmentVariables?: EnvironmentVariable[];
  secrets?: EnvironmentVariable[];
  setupScripts?: string[];
  mcpServers?: McpServer[];
  documentation?: string[];
  internetAccess?: boolean;
  isDefault?: boolean;
}

export interface UpdateEnvironmentParams {
  name?: string;
  description?: string;
  runtimes?: RuntimeConfig;
  packages?: PackagesConfig;
  dockerfileExtensions?: string;
  environmentVariables?: EnvironmentVariable[];
  secrets?: EnvironmentVariable[];
  setupScripts?: string[];
  mcpServers?: McpServer[];
  internetAccess?: boolean;
  isDefault?: boolean;
}

export interface ContainerStatus {
  status: EnvironmentStatus;
  uptime?: number;
  memory?: {
    used: number;
    limit: number;
  };
  cpu?: {
    usage: number;
  };
}

export interface BuildResult {
  success: boolean;
  imageTag: string;
  buildHash?: string;
  logs?: string;
  error?: string;
  duration?: number;
  environmentId?: string;
  environmentName?: string;
}

export interface BuildStatusResult {
  buildStatus: BuildStatus;
  buildHash?: string;
  imageTag?: string;
  lastBuildAt?: string;
  buildError?: string;
}

export interface BuildLogsResult {
  logs: string;
  buildStatus: BuildStatus;
}

export interface TestBuildResult {
  success: boolean;
  logs: string;
  duration: number;
  imageTag?: string;
}

export interface DockerfileResult {
  baseImage: string;
  dockerfileExtensions?: string;
  effectiveDockerfile: string;
}

export interface ValidateDockerfileResult {
  valid: boolean;
  warnings: string[];
  effectiveDockerfile: string;
}

export interface InstallPackagesResult {
  environment: Environment;
  installed: string[];
}

export type PackageType = 'system' | 'python' | 'node';

export interface StartContainerParams {
  workspaceId?: string;
  cpus?: number;
  memory?: string;
}

export interface StartContainerResult {
  success: boolean;
  containerName: string;
  containerId: string;
  imageTag: string;
  workspacePath: string;
}

// ============================================================================
// Thread Types
// ============================================================================

export type ThreadStatus = 'active' | 'running' | 'completed' | 'failed' | 'archived' | 'cancelled' | 'deleted';

export interface ThreadMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

export interface Thread {
  id: string;
  projectId: string;
  environmentId: string;
  agentId?: string;
  title?: string;
  status: ThreadStatus;
  messages?: ThreadMessage[];
  messageCount: number;
  totalTokens: number;
  totalCost: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface CreateThreadParams {
  environmentId: string;
  agentId?: string;
  title?: string;
}

export interface UpdateThreadParams {
  title?: string;
  status?: ThreadStatus;
}

export interface ListThreadsParams extends PaginationParams {
  environmentId?: string;
  status?: ThreadStatus;
}

export interface CopyThreadParams {
  /**
   * Custom title for the copied thread.
   * If not provided, defaults to "[Original Title] Copy"
   */
  title?: string;
}

export interface SearchThreadsParams {
  /** Search query (required) */
  query: string;
  /** Filter by environment */
  environmentId?: string;
  /** Filter by status */
  status?: ThreadStatus | 'all';
  /** Max results to return (default: 20, max: 100) */
  limit?: number;
  /** Offset for pagination */
  offset?: number;
  /** Include matching messages in results */
  includeMessages?: boolean;
}

export interface SearchThreadResult {
  thread: Thread & {
    environmentName?: string;
    agentName?: string | null;
  };
  score: number;
  highlights: string[];
  matchingMessages?: ThreadMessage[];
}

export interface SearchThreadsResponse {
  results: SearchThreadResult[];
  total: number;
  hasMore: boolean;
  searchMetadata: {
    query: string;
    queryType: string;
    processingTimeMs: number;
  };
}

export interface ThreadLogEntry {
  role: 'user' | 'assistant' | 'execution_log';
  content: string;
  timestamp?: string;
  relativeTime?: string;
}

export interface ResearchSession {
  id: string;
  threadId: string;
  status: string;
  progress?: number;
  query?: string;
  results?: unknown[];
  createdAt: string;
  updatedAt: string;
}

export interface SendMessageParams {
  content: string;
  mcpServers?: McpServer[];
  envVars?: Record<string, string>;
  secrets?: EnvironmentVariable[];
  setupScripts?: string[];
  agentConfig?: AgentConfig;
  internetAccess?: boolean;
  attachments?: unknown[];
  runId?: string;
}

export interface AgentConfig {
  model?: AgentModel;
  instructions?: string;
  reasoningEffort?: ReasoningEffort;
}

// SSE Event Types
export interface StreamEvent {
  type: string;
  timestamp?: string;
  [key: string]: unknown;
}

export interface ResponseStartedEvent extends StreamEvent {
  type: 'response.started';
}

export interface ResponseItemCompletedEvent extends StreamEvent {
  type: 'response.item.completed';
  item: {
    type: 'text' | 'tool_call' | 'reasoning' | 'file_change';
    content?: string;
    [key: string]: unknown;
  };
}

export interface ResponseCompletedEvent extends StreamEvent {
  type: 'response.completed';
  response: {
    content: string;
    [key: string]: unknown;
  };
}

export interface StreamCompletedEvent extends StreamEvent {
  type: 'stream.completed';
  run: {
    id: string;
    status: string;
    tokens?: {
      input: number;
      output: number;
    };
    [key: string]: unknown;
  };
}

export interface StreamErrorEvent extends StreamEvent {
  type: 'stream.error';
  error: string;
  message?: string;
}

export type MessageStreamEvent =
  | ResponseStartedEvent
  | ResponseItemCompletedEvent
  | ResponseCompletedEvent
  | StreamCompletedEvent
  | StreamErrorEvent;

// ============================================================================
// Run Types
// ============================================================================

export type RunStatus = 'pending' | 'running' | 'success' | 'failed' | 'cancelled';

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  cachedTokens?: number;
}

export interface Run {
  id: string;
  projectId: string;
  threadId?: string;
  environmentId?: string;
  agentId?: string;
  agentName?: string;
  name: string;
  task: string;
  prompt?: string;
  status: RunStatus;
  duration?: number;
  cost?: number;
  tokenUsage?: TokenUsage;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  deletedAt?: string;
}

export interface CreateRunParams {
  agentId?: string;
  agentName: string;
  name: string;
  task: string;
  prompt?: string;
  title?: string;
  workspaceName?: string;
  workspaceId?: string;
  contextId?: string;
  environmentId?: string;
  environmentName?: string;
  attachments?: unknown[];
  metadata?: Record<string, unknown>;
  threadId?: string;
}

export interface UpdateRunParams {
  name?: string;
  status?: RunStatus;
  duration?: number;
  cost?: number;
  logs?: unknown[];
  metadata?: Record<string, unknown>;
  tokenUsage?: TokenUsage;
  title?: string;
}

export interface ListRunsParams extends PaginationParams {
  threadId?: string;
  status?: RunStatus;
  since?: string;
}

export interface RunLogEntry {
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'debug';
  message: string;
  metadata?: Record<string, unknown>;
}

export interface RunDiff {
  path: string;
  type: 'created' | 'modified' | 'deleted' | 'renamed';
  diff: string;
  additions?: number;
  deletions?: number;
}

// ============================================================================
// Agent Types
// ============================================================================

/**
 * Supported Claude models for agent execution.
 * All agents run via Claude Code CLI in containers.
 */
export type AgentModel = 'claude-opus-4-6' | 'claude-sonnet-4-5' | 'claude-haiku-4-5';

/**
 * Reasoning effort level for extended thinking.
 */
export type ReasoningEffort = 'minimal' | 'low' | 'medium' | 'high';

/**
 * Deep research model options (for research skill).
 */
export type DeepResearchModel = 'gemini-3-flash-preview' | 'gemini-3-pro-preview';

export interface AgentBinary {
  path: string;
  args?: string[];
}

export interface CloudAgent {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  model: AgentModel;
  instructions?: string;
  binary?: AgentBinary;
  reasoningEffort?: ReasoningEffort;
  enabledSkills?: string[];
  deepResearchModel?: DeepResearchModel;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface CreateAgentParams {
  name: string;
  description?: string;
  model: AgentModel;
  instructions?: string;
  binary?: AgentBinary;
  reasoningEffort?: ReasoningEffort;
  enabledSkills?: string[];
  deepResearchModel?: DeepResearchModel;
  metadata?: Record<string, unknown>;
}

export interface UpdateAgentParams {
  name?: string;
  description?: string;
  model?: AgentModel;
  instructions?: string;
  reasoningEffort?: ReasoningEffort;
  enabledSkills?: string[];
  metadata?: Record<string, unknown>;
}

// ============================================================================
// Budget & Billing Types
// ============================================================================

export interface BudgetStatus {
  balance: number;
  spent: number;
  limit: number;
  remaining: number;
}

export interface CanExecuteResult {
  canExecute: boolean;
  reason?: string;
}

export interface IncreaseBudgetParams {
  amount: number;
  description?: string;
  stripePaymentIntentId?: string;
  stripeChargeId?: string;
  paymentMethod?: string;
}

export interface IncreaseBudgetResult {
  success: boolean;
  budget: {
    previousBalance: number;
    addedAmount: number;
    newBalance: number;
  };
}

export interface BillingRecord {
  id: string;
  type: 'execution' | 'credit' | 'mcp_usage' | 'adjustment';
  amount: number;
  runId?: string;
  description?: string;
  createdAt: string;
}

export interface ListBillingRecordsParams extends PaginationParams {
  since?: string;
  until?: string;
  type?: BillingRecord['type'];
}

export interface BillingAccount {
  apiKeyId: string;
  type: 'standard' | 'internal';
  status: 'active' | 'suspended';
  monthlyBudget?: number;
  currentBalance: number;
  billingEmail?: string;
  createdAt: string;
}

export interface UsageStats {
  period: 'day' | 'week' | 'month' | 'year';
  startDate: string;
  endDate: string;
  totalCost: number;
  totalTokens: number;
  totalRuns: number;
  breakdown?: Record<string, {
    cost: number;
    tokens: number;
    runs: number;
  }>;
}

export interface UsageStatsParams {
  period?: 'day' | 'week' | 'month' | 'year';
  breakdown?: 'project' | 'model' | 'agent';
}

// ============================================================================
// File Types
// ============================================================================

export interface FileEntry {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  mimeType?: string;
  modifiedAt: string;
}

export interface ListFilesParams {
  path?: string;
  environmentId?: string;
  recursive?: boolean;
}

export interface UploadFileParams {
  path: string;
  content: string | Buffer;
  contentType?: string;
  environmentId?: string;
}

export interface CreateDirectoryParams {
  path: string;
  environmentId?: string;
}

// ============================================================================
// Git Types
// ============================================================================

export interface GitDiffFile {
  path: string;
  additions: number;
  deletions: number;
  changes: string;
}

export interface GitDiffResult {
  diffs: GitDiffFile[];
  stats?: {
    filesChanged: number;
    insertions: number;
    deletions: number;
  };
}

export interface GitCommitParams {
  message: string;
  author?: {
    name: string;
    email: string;
  };
  files?: string[];
}

export interface GitCommitResult {
  success: boolean;
  commit: {
    sha: string;
    message: string;
    author: {
      name: string;
      email: string;
    };
    timestamp: string;
    filesChanged: number;
  };
}

export interface GitPushParams {
  remote?: string;
  branch?: string;
  force?: boolean;
}

export interface GitPushResult {
  success: boolean;
  push: {
    remote: string;
    branch: string;
    commits: number;
    url?: string;
  };
}

// ============================================================================
// Schedule Types
// ============================================================================

export type ScheduleType = 'one-time' | 'recurring';

export interface Schedule {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  agentId: string;
  agentName: string;
  task: string;
  workspaceId?: string;
  workspaceName?: string;
  contextId?: string;
  contextName?: string;
  environmentId?: string;
  environmentName?: string;
  scheduleType: ScheduleType;
  cronExpression?: string;
  scheduledTime?: string;
  timezone?: string;
  enabled: boolean;
  lastRunAt?: string;
  nextRunAt?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface CreateScheduleParams {
  name: string;
  description?: string;
  agentId: string;
  agentName: string;
  task: string;
  workspaceId?: string;
  workspaceName?: string;
  contextId?: string;
  contextName?: string;
  environmentId?: string;
  environmentName?: string;
  scheduleType: ScheduleType;
  cronExpression?: string;
  scheduledTime?: string;
  timezone?: string;
  enabled?: boolean;
  metadata?: Record<string, unknown>;
}

export interface UpdateScheduleParams {
  name?: string;
  description?: string;
  task?: string;
  cronExpression?: string;
  scheduledTime?: string;
  timezone?: string;
  enabled?: boolean;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// Trigger Types
// ============================================================================

export type TriggerSource = 'github' | 'slack' | 'email' | 'webhook' | 'cron' | 'custom';

export interface TriggerAction {
  type: 'send_message';
  message?: string;
  template?: string;
}

export interface Trigger {
  id: string;
  name: string;
  environmentId: string;
  agentId?: string;
  source: TriggerSource;
  event: string;
  filters?: Record<string, unknown>;
  action: TriggerAction;
  enabled: boolean;
  lastTriggeredAt?: number;
  createdAt: number;
  updatedAt: number;
}

export interface CreateTriggerParams {
  name: string;
  environmentId: string;
  agentId?: string;
  source: TriggerSource;
  event: string;
  filters?: Record<string, unknown>;
  action: TriggerAction;
  enabled?: boolean;
}

export interface UpdateTriggerParams {
  name?: string;
  agentId?: string;
  event?: string;
  filters?: Record<string, unknown>;
  action?: TriggerAction;
  enabled?: boolean;
}

export interface TriggerExecution {
  id: string;
  triggerId: string;
  threadId: string;
  event: Record<string, unknown>;
  status: 'pending' | 'running' | 'completed' | 'failed';
  createdAt: number;
}

// ============================================================================
// Orchestration Types
// ============================================================================

export type OrchestrationStrategy = 'parallel' | 'sequential' | 'conditional' | 'map_reduce';

export interface OrchestrationStep {
  id: string;
  agentId: string;
  name: string;
  instructions?: string;
  inputs?: Record<string, unknown>;
  dependsOn?: string[];
  condition?: string;
}

export interface Orchestration {
  id: string;
  name: string;
  environmentId: string;
  strategy: OrchestrationStrategy;
  coordinatorAgentId?: string;
  steps: OrchestrationStep[];
  status: 'draft' | 'active' | 'archived';
  createdAt: number;
  updatedAt: number;
}

export interface CreateOrchestrationParams {
  name: string;
  environmentId: string;
  strategy: OrchestrationStrategy;
  coordinatorAgentId?: string;
  steps: Omit<OrchestrationStep, 'id'>[];
}

export interface UpdateOrchestrationParams {
  name?: string;
  strategy?: OrchestrationStrategy;
  coordinatorAgentId?: string;
  steps?: Omit<OrchestrationStep, 'id'>[];
}

export interface OrchestrationStepResult {
  stepId: string;
  agentId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  output?: string;
  error?: string;
  durationMs?: number;
}

export interface OrchestrationRun {
  id: string;
  orchestrationId: string;
  threadId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  stepResults: OrchestrationStepResult[];
  createdAt: number;
  completedAt?: number;
}

// ============================================================================
// Health Types
// ============================================================================

export interface HealthCheck {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  checks: {
    gcsfuseMount: boolean;
    anthropicApiKey: boolean;
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
    disk: {
      used: string;
      available: string;
      percentage: string;
    };
  };
  metrics?: {
    activeSessions: number;
    recentErrors: number;
    successRate: number;
  };
}

export interface Metrics {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageDuration: number;
  totalTokensUsed: number;
  totalCost: number;
}
