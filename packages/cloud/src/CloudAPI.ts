import { z } from "zod"

import { type AuthService, type ShareVisibility, type ShareResponse, shareResponseSchema } from "@acode/types"

import { getRooCodeApiUrl } from "./config.js"
import { getUserAgent } from "./utils.js"
import {
	AuthenticationError,
	ClerkAuthorizationError,
	CloudAPIError,
	NetworkError,
	TaskNotFoundError,
} from "./errors.js"

interface CloudAPIRequestOptions extends Omit<RequestInit, "headers"> {
	timeout?: number
	headers?: Record<string, string>
}

export class CloudAPI {
	private authService: AuthService
	private log: (...args: unknown[]) => void
	private baseUrl: string

	constructor(authService: AuthService, log?: (...args: unknown[]) => void) {
		this.authService = authService
		this.log = log || console.log
		this.baseUrl = getRooCodeApiUrl()
	}

	private async request<T>(
		endpoint: string,
		options: CloudAPIRequestOptions & {
			parseResponse?: (data: unknown) => T
		} = {},
	): Promise<T> {
		const { timeout = 30_000, parseResponse, headers = {}, ...fetchOptions } = options

		const sessionToken = this.authService.getSessionToken()

		if (!sessionToken) {
			throw new AuthenticationError()
		}

		const url = `${this.baseUrl}${endpoint}`

		const requestHeaders = {
			"Content-Type": "application/json",
			Authorization: `Bearer ${sessionToken}`,
			"User-Agent": getUserAgent(),
			...headers,
		}

		try {
			const response = await fetch(url, {
				...fetchOptions,
				headers: requestHeaders,
				signal: AbortSignal.timeout(timeout),
			})

			if (!response.ok) {
				await this.handleErrorResponse(response, endpoint)
			}

			const data = await response.json()

			if (parseResponse) {
				return parseResponse(data)
			}

			return data as T
		} catch (error) {
			if (error instanceof TypeError && error.message.includes("fetch")) {
				throw new NetworkError(`Network error while calling ${endpoint}`)
			}

			if (error instanceof CloudAPIError) {
				throw error
			}

			if (error instanceof Error && error.name === "AbortError") {
				throw new CloudAPIError(`Request to ${endpoint} timed out`, undefined, undefined)
			}

			throw new CloudAPIError(
				`Unexpected error while calling ${endpoint}: ${error instanceof Error ? error.message : String(error)}`,
			)
		}
	}

	private async handleErrorResponse(response: Response, endpoint: string): Promise<never> {
		let responseBody: unknown

		try {
			responseBody = await response.json()
		} catch {
			responseBody = await response.text()
		}

		// Log detailed error information for troubleshooting
		this.log(`[CloudAPI] Error response from ${endpoint}:`, {
			status: response.status,
			statusText: response.statusText,
			responseBody,
		})

		switch (response.status) {
			case 401:
				const clerkError = this.extractClerkError(responseBody)
				if (clerkError) {
					throw clerkError
				}
				throw new AuthenticationError(this.extractErrorMessage(responseBody))
			case 404:
				if (endpoint.includes("/share")) {
					throw new TaskNotFoundError()
				}
				throw new CloudAPIError(`Resource not found: ${endpoint}`, 404, responseBody)
			default:
				throw new CloudAPIError(
					`HTTP ${response.status}: ${response.statusText}`,
					response.status,
					responseBody,
				)
		}
	}

	private extractClerkError(responseBody: unknown): ClerkAuthorizationError | null {
		if (responseBody && typeof responseBody === "object" && "errors" in responseBody) {
			const errors = (responseBody as any).errors
			if (Array.isArray(errors) && errors.length > 0) {
				const error = errors[0]
				if (error && typeof error === "object" && "code" in error && error.code === "authorization_invalid") {
					const message = error.message || "Unauthorized request"
					const longMessage = error.long_message || message
					const clerkTraceId = (responseBody as any).clerk_trace_id
					return new ClerkAuthorizationError(`${message}: ${longMessage}`, clerkTraceId)
				}
			}
		}
		return null
	}

	private extractErrorMessage(responseBody: unknown): string {
		if (responseBody && typeof responseBody === "object" && "errors" in responseBody) {
			const errors = (responseBody as any).errors
			if (Array.isArray(errors) && errors.length > 0) {
				const error = errors[0]
				if (error && typeof error === "object" && "message" in error) {
					return error.message
				}
			}
		}
		return "Authentication required"
	}

	async shareTask(taskId: string, visibility: ShareVisibility = "organization"): Promise<ShareResponse> {
		this.log(`[CloudAPI] Sharing task ${taskId} with visibility: ${visibility}`)

		const response = await this.request("/api/extension/share", {
			method: "POST",
			body: JSON.stringify({ taskId, visibility }),
			parseResponse: (data) => shareResponseSchema.parse(data),
		})

		this.log("[CloudAPI] Share response:", response)
		return response
	}

	async bridgeConfig() {
		return this.request("/api/extension/bridge/config", {
			method: "GET",
			parseResponse: (data) =>
				z
					.object({
						userId: z.string(),
						socketBridgeUrl: z.string(),
						token: z.string(),
					})
					.parse(data),
		})
	}
}
