import { z } from "zod"

import { ACodeEventName } from "./events.js"
import type { ACodeSettings } from "./global-settings.js"
import type { ClineMessage, QueuedMessage, TokenUsage } from "./message.js"
import type { ToolUsage, ToolName } from "./tool.js"
import type { StaticAppProperties, GitProperties, TelemetryProperties } from "./telemetry.js"
import type { TodoItem } from "./todo.js"

/**
 * TaskProviderLike
 */

export interface TaskProviderLike {
	// Tasks
	getCurrentTask(): TaskLike | undefined
	getRecentTasks(): string[]
	createTask(
		text?: string,
		images?: string[],
		parentTask?: TaskLike,
		options?: CreateTaskOptions,
		configuration?: ACodeSettings,
	): Promise<TaskLike>
	cancelTask(): Promise<void>
	clearTask(): Promise<void>
	resumeTask(taskId: string): void

	// Modes
	getModes(): Promise<{ slug: string; name: string }[]>
	getMode(): Promise<string>
	setMode(mode: string): Promise<void>

	// Provider Profiles
	getProviderProfiles(): Promise<{ name: string; provider?: string }[]>
	getProviderProfile(): Promise<string>
	setProviderProfile(providerProfile: string): Promise<void>

	// Telemetry
	readonly appProperties: StaticAppProperties
	readonly gitProperties: GitProperties | undefined
	getTelemetryProperties(): Promise<TelemetryProperties>
	readonly cwd: string

	// Event Emitter
	on<K extends keyof TaskProviderEvents>(
		event: K,
		listener: (...args: TaskProviderEvents[K]) => void | Promise<void>,
	): this

	off<K extends keyof TaskProviderEvents>(
		event: K,
		listener: (...args: TaskProviderEvents[K]) => void | Promise<void>,
	): this

	// @TODO: Find a better way to do this.
	postStateToWebview(): Promise<void>
}

export type TaskProviderEvents = {
	[ACodeEventName.TaskCreated]: [task: TaskLike]
	[ACodeEventName.TaskStarted]: [taskId: string]
	[ACodeEventName.TaskCompleted]: [taskId: string, tokenUsage: TokenUsage, toolUsage: ToolUsage]
	[ACodeEventName.TaskAborted]: [taskId: string]
	[ACodeEventName.TaskFocused]: [taskId: string]
	[ACodeEventName.TaskUnfocused]: [taskId: string]
	[ACodeEventName.TaskActive]: [taskId: string]
	[ACodeEventName.TaskInteractive]: [taskId: string]
	[ACodeEventName.TaskResumable]: [taskId: string]
	[ACodeEventName.TaskIdle]: [taskId: string]

	[ACodeEventName.TaskPaused]: [taskId: string]
	[ACodeEventName.TaskUnpaused]: [taskId: string]
	[ACodeEventName.TaskSpawned]: [taskId: string]

	[ACodeEventName.TaskUserMessage]: [taskId: string]

	[ACodeEventName.TaskTokenUsageUpdated]: [taskId: string, tokenUsage: TokenUsage]

	[ACodeEventName.ModeChanged]: [mode: string]
	[ACodeEventName.ProviderProfileChanged]: [config: { name: string; provider?: string }]
}

/**
 * TaskLike
 */

export interface CreateTaskOptions {
	enableDiff?: boolean
	enableCheckpoints?: boolean
	fuzzyMatchThreshold?: number
	consecutiveMistakeLimit?: number
	experiments?: Record<string, boolean>
	initialTodos?: TodoItem[]
}

export enum TaskStatus {
	Running = "running",
	Interactive = "interactive",
	Resumable = "resumable",
	Idle = "idle",
	None = "none",
}

export const taskMetadataSchema = z.object({
	task: z.string().optional(),
	images: z.array(z.string()).optional(),
})

export type TaskMetadata = z.infer<typeof taskMetadataSchema>

export interface TaskLike {
	readonly taskId: string
	readonly rootTaskId?: string
	readonly parentTaskId?: string
	readonly childTaskId?: string
	readonly metadata: TaskMetadata
	readonly taskStatus: TaskStatus
	readonly taskAsk: ClineMessage | undefined
	readonly queuedMessages: QueuedMessage[]
	readonly tokenUsage: TokenUsage | undefined

	on<K extends keyof TaskEvents>(event: K, listener: (...args: TaskEvents[K]) => void | Promise<void>): this
	off<K extends keyof TaskEvents>(event: K, listener: (...args: TaskEvents[K]) => void | Promise<void>): this

	approveAsk(options?: { text?: string; images?: string[] }): void
	denyAsk(options?: { text?: string; images?: string[] }): void
	submitUserMessage(text: string, images?: string[], mode?: string, providerProfile?: string): Promise<void>
	abortTask(): void
}

export type TaskEvents = {
	// Task Lifecycle
	[ACodeEventName.TaskStarted]: []
	[ACodeEventName.TaskCompleted]: [taskId: string, tokenUsage: TokenUsage, toolUsage: ToolUsage]
	[ACodeEventName.TaskAborted]: []
	[ACodeEventName.TaskFocused]: []
	[ACodeEventName.TaskUnfocused]: []
	[ACodeEventName.TaskActive]: [taskId: string]
	[ACodeEventName.TaskInteractive]: [taskId: string]
	[ACodeEventName.TaskResumable]: [taskId: string]
	[ACodeEventName.TaskIdle]: [taskId: string]

	// Subtask Lifecycle
	[ACodeEventName.TaskPaused]: [taskId: string]
	[ACodeEventName.TaskUnpaused]: [taskId: string]
	[ACodeEventName.TaskSpawned]: [taskId: string]

	// Task Execution
	[ACodeEventName.Message]: [{ action: "created" | "updated"; message: ClineMessage }]
	[ACodeEventName.TaskModeSwitched]: [taskId: string, mode: string]
	[ACodeEventName.TaskAskResponded]: []
	[ACodeEventName.TaskUserMessage]: [taskId: string]

	// Task Analytics
	[ACodeEventName.TaskToolFailed]: [taskId: string, tool: ToolName, error: string]
	[ACodeEventName.TaskTokenUsageUpdated]: [taskId: string, tokenUsage: TokenUsage]
}
