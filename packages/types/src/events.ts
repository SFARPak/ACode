import { z } from "zod"

import { clineMessageSchema, tokenUsageSchema } from "./message.js"
import { toolNamesSchema, toolUsageSchema } from "./tool.js"

/**
 * ACodeEventName
 */

export enum ACodeEventName {
	// Task Provider Lifecycle
	TaskCreated = "taskCreated",

	// Task Lifecycle
	TaskStarted = "taskStarted",
	TaskCompleted = "taskCompleted",
	TaskAborted = "taskAborted",
	TaskFocused = "taskFocused",
	TaskUnfocused = "taskUnfocused",
	TaskActive = "taskActive",
	TaskInteractive = "taskInteractive",
	TaskResumable = "taskResumable",
	TaskIdle = "taskIdle",

	// Subtask Lifecycle
	TaskPaused = "taskPaused",
	TaskUnpaused = "taskUnpaused",
	TaskSpawned = "taskSpawned",

	// Task Execution
	Message = "message",
	TaskModeSwitched = "taskModeSwitched",
	TaskAskResponded = "taskAskResponded",
	TaskUserMessage = "taskUserMessage",

	// Task Analytics
	TaskTokenUsageUpdated = "taskTokenUsageUpdated",
	TaskToolFailed = "taskToolFailed",

	// Configuration Changes
	ModeChanged = "modeChanged",
	ProviderProfileChanged = "providerProfileChanged",

	// Evals
	EvalPass = "evalPass",
	EvalFail = "evalFail",
}

/**
 * ACodeEvents
 */

export const rooCodeEventsSchema = z.object({
	[ACodeEventName.TaskCreated]: z.tuple([z.string()]),

	[ACodeEventName.TaskStarted]: z.tuple([z.string()]),
	[ACodeEventName.TaskCompleted]: z.tuple([
		z.string(),
		tokenUsageSchema,
		toolUsageSchema,
		z.object({
			isSubtask: z.boolean(),
		}),
	]),
	[ACodeEventName.TaskAborted]: z.tuple([z.string()]),
	[ACodeEventName.TaskFocused]: z.tuple([z.string()]),
	[ACodeEventName.TaskUnfocused]: z.tuple([z.string()]),
	[ACodeEventName.TaskActive]: z.tuple([z.string()]),
	[ACodeEventName.TaskInteractive]: z.tuple([z.string()]),
	[ACodeEventName.TaskResumable]: z.tuple([z.string()]),
	[ACodeEventName.TaskIdle]: z.tuple([z.string()]),

	[ACodeEventName.TaskPaused]: z.tuple([z.string()]),
	[ACodeEventName.TaskUnpaused]: z.tuple([z.string()]),
	[ACodeEventName.TaskSpawned]: z.tuple([z.string(), z.string()]),

	[ACodeEventName.Message]: z.tuple([
		z.object({
			taskId: z.string(),
			action: z.union([z.literal("created"), z.literal("updated")]),
			message: clineMessageSchema,
		}),
	]),
	[ACodeEventName.TaskModeSwitched]: z.tuple([z.string(), z.string()]),
	[ACodeEventName.TaskAskResponded]: z.tuple([z.string()]),
	[ACodeEventName.TaskUserMessage]: z.tuple([z.string()]),

	[ACodeEventName.TaskToolFailed]: z.tuple([z.string(), toolNamesSchema, z.string()]),
	[ACodeEventName.TaskTokenUsageUpdated]: z.tuple([z.string(), tokenUsageSchema]),

	[ACodeEventName.ModeChanged]: z.tuple([z.string()]),
	[ACodeEventName.ProviderProfileChanged]: z.tuple([z.object({ name: z.string(), provider: z.string() })]),
})

export type ACodeEvents = z.infer<typeof rooCodeEventsSchema>

/**
 * TaskEvent
 */

export const taskEventSchema = z.discriminatedUnion("eventName", [
	// Task Provider Lifecycle
	z.object({
		eventName: z.literal(ACodeEventName.TaskCreated),
		payload: rooCodeEventsSchema.shape[ACodeEventName.TaskCreated],
		taskId: z.number().optional(),
	}),

	// Task Lifecycle
	z.object({
		eventName: z.literal(ACodeEventName.TaskStarted),
		payload: rooCodeEventsSchema.shape[ACodeEventName.TaskStarted],
		taskId: z.number().optional(),
	}),
	z.object({
		eventName: z.literal(ACodeEventName.TaskCompleted),
		payload: rooCodeEventsSchema.shape[ACodeEventName.TaskCompleted],
		taskId: z.number().optional(),
	}),
	z.object({
		eventName: z.literal(ACodeEventName.TaskAborted),
		payload: rooCodeEventsSchema.shape[ACodeEventName.TaskAborted],
		taskId: z.number().optional(),
	}),
	z.object({
		eventName: z.literal(ACodeEventName.TaskFocused),
		payload: rooCodeEventsSchema.shape[ACodeEventName.TaskFocused],
		taskId: z.number().optional(),
	}),
	z.object({
		eventName: z.literal(ACodeEventName.TaskUnfocused),
		payload: rooCodeEventsSchema.shape[ACodeEventName.TaskUnfocused],
		taskId: z.number().optional(),
	}),
	z.object({
		eventName: z.literal(ACodeEventName.TaskActive),
		payload: rooCodeEventsSchema.shape[ACodeEventName.TaskActive],
		taskId: z.number().optional(),
	}),
	z.object({
		eventName: z.literal(ACodeEventName.TaskInteractive),
		payload: rooCodeEventsSchema.shape[ACodeEventName.TaskInteractive],
		taskId: z.number().optional(),
	}),
	z.object({
		eventName: z.literal(ACodeEventName.TaskResumable),
		payload: rooCodeEventsSchema.shape[ACodeEventName.TaskResumable],
		taskId: z.number().optional(),
	}),
	z.object({
		eventName: z.literal(ACodeEventName.TaskIdle),
		payload: rooCodeEventsSchema.shape[ACodeEventName.TaskIdle],
		taskId: z.number().optional(),
	}),

	// Subtask Lifecycle
	z.object({
		eventName: z.literal(ACodeEventName.TaskPaused),
		payload: rooCodeEventsSchema.shape[ACodeEventName.TaskPaused],
		taskId: z.number().optional(),
	}),
	z.object({
		eventName: z.literal(ACodeEventName.TaskUnpaused),
		payload: rooCodeEventsSchema.shape[ACodeEventName.TaskUnpaused],
		taskId: z.number().optional(),
	}),
	z.object({
		eventName: z.literal(ACodeEventName.TaskSpawned),
		payload: rooCodeEventsSchema.shape[ACodeEventName.TaskSpawned],
		taskId: z.number().optional(),
	}),

	// Task Execution
	z.object({
		eventName: z.literal(ACodeEventName.Message),
		payload: rooCodeEventsSchema.shape[ACodeEventName.Message],
		taskId: z.number().optional(),
	}),
	z.object({
		eventName: z.literal(ACodeEventName.TaskModeSwitched),
		payload: rooCodeEventsSchema.shape[ACodeEventName.TaskModeSwitched],
		taskId: z.number().optional(),
	}),
	z.object({
		eventName: z.literal(ACodeEventName.TaskAskResponded),
		payload: rooCodeEventsSchema.shape[ACodeEventName.TaskAskResponded],
		taskId: z.number().optional(),
	}),

	// Task Analytics
	z.object({
		eventName: z.literal(ACodeEventName.TaskToolFailed),
		payload: rooCodeEventsSchema.shape[ACodeEventName.TaskToolFailed],
		taskId: z.number().optional(),
	}),
	z.object({
		eventName: z.literal(ACodeEventName.TaskTokenUsageUpdated),
		payload: rooCodeEventsSchema.shape[ACodeEventName.TaskTokenUsageUpdated],
		taskId: z.number().optional(),
	}),

	// Evals
	z.object({
		eventName: z.literal(ACodeEventName.EvalPass),
		payload: z.undefined(),
		taskId: z.number(),
	}),
	z.object({
		eventName: z.literal(ACodeEventName.EvalFail),
		payload: z.undefined(),
		taskId: z.number(),
	}),
])

export type TaskEvent = z.infer<typeof taskEventSchema>
