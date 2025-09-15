import { GlobalState, ClineMessage, ClineAsk } from "@acode/types"
import { getApiMetrics } from "../../shared/getApiMetrics"
import { ClineAskResponse } from "../../shared/WebviewMessage"

export interface AutoApprovalResult {
	shouldProceed: boolean
	requiresApproval: boolean
	approvalType?: "requests" | "cost"
	approvalCount?: number | string
}

interface TaskComplexityMetrics {
	toolUsageCount: number
	errorCount: number
	fileOperationCount: number
	terminalCommandCount: number
	totalMessageLength: number
	messageCount: number
	averageMessageLength: number
}

interface RiskAssessment {
	riskLevel: "low" | "medium" | "high"
	confidence: number
	riskScore: number
}

interface OperationPattern {
	operationType: string
	successCount: number
	failureCount: number
	averageExecutionTime: number
	lastExecuted: number
	riskLevel: "low" | "medium" | "high"
	confidence: number
}

export class AutoApprovalHandler {
	private consecutiveAutoApprovedRequestsCount: number = 0
	private consecutiveAutoApprovedCost: number = 0
	private autonomousModeEnabled: boolean = true
	private confidenceThreshold: number = 0.8 // Confidence threshold for autonomous decisions
	private operationHistory: Map<string, OperationPattern> = new Map()
	private autonomousSuccessRate: number = 0.95 // Track success rate of autonomous operations
	private lastAutonomousDecision: number = 0
	private autonomousCooldownMs: number = 1000 // 1 second cooldown between autonomous decisions

	/**
	 * Enable or disable autonomous mode
	 */
	setAutonomousMode(enabled: boolean): void {
		this.autonomousModeEnabled = enabled
	}

	/**
	 * Set confidence threshold for autonomous decisions
	 */
	setConfidenceThreshold(threshold: number): void {
		this.confidenceThreshold = Math.max(0.1, Math.min(1.0, threshold))
	}

	/**
	 * Check if auto-approval limits have been reached and handle user approval if needed
	 * Enhanced with autonomous decision making
	 */
	async checkAutoApprovalLimits(
		state: GlobalState | undefined,
		messages: ClineMessage[],
		askForApproval: (
			type: ClineAsk,
			data: string,
		) => Promise<{ response: ClineAskResponse; text?: string; images?: string[] }>,
	): Promise<AutoApprovalResult> {
		// If autonomous mode is enabled, use enhanced logic
		if (this.autonomousModeEnabled) {
			return this.checkAutonomousLimits(state, messages, askForApproval)
		}

		// Fallback to original logic
		const requestResult = await this.checkRequestLimit(state, askForApproval)
		if (!requestResult.shouldProceed || requestResult.requiresApproval) {
			return requestResult
		}

		const costResult = await this.checkCostLimit(state, messages, askForApproval)
		return costResult
	}

	/**
	 * Enhanced autonomous approval logic
	 */
	private async checkAutonomousLimits(
		state: GlobalState | undefined,
		messages: ClineMessage[],
		askForApproval: (
			type: ClineAsk,
			data: string,
		) => Promise<{ response: ClineAskResponse; text?: string; images?: string[] }>,
	): Promise<AutoApprovalResult> {
		// Calculate task complexity and risk factors
		const taskMetrics = this.analyzeTaskComplexity(messages)
		const riskAssessment = this.assessRiskLevel(taskMetrics, state)

		// If risk is low and confidence is high, proceed autonomously
		if (riskAssessment.riskLevel === "low" && riskAssessment.confidence >= this.confidenceThreshold) {
			this.consecutiveAutoApprovedRequestsCount++
			return { shouldProceed: true, requiresApproval: false }
		}

		// If risk is medium and we haven't exceeded smart limits, proceed
		if (riskAssessment.riskLevel === "medium" && !this.hasExceededSmartLimits(taskMetrics, state)) {
			this.consecutiveAutoApprovedRequestsCount++
			return { shouldProceed: true, requiresApproval: false }
		}

		// For high risk or when smart limits are exceeded, ask for approval
		const requestResult = await this.checkRequestLimit(state, askForApproval)
		if (!requestResult.shouldProceed || requestResult.requiresApproval) {
			return requestResult
		}

		const costResult = await this.checkCostLimit(state, messages, askForApproval)
		return costResult
	}

	/**
	 * Analyze task complexity based on message patterns
	 */
	private analyzeTaskComplexity(messages: ClineMessage[]): TaskComplexityMetrics {
		let toolUsageCount = 0
		let errorCount = 0
		let fileOperationCount = 0
		let terminalCommandCount = 0
		let totalMessageLength = 0

		for (const message of messages) {
			if (message.type === "say") {
				totalMessageLength += (message.text || "").length

				// Count different types of operations based on actual ClineSay values
				if (message.say === "text") toolUsageCount++ // General tool usage
				if (message.say === "error") errorCount++
				if (message.say === "command_output") terminalCommandCount++
				if (message.say === "browser_action" || message.say === "browser_action_result") fileOperationCount++
			} else if (message.type === "ask") {
				// Count ask types that indicate tool usage
				if (message.ask === "tool") toolUsageCount++
				if (message.ask === "command") terminalCommandCount++
				if (message.ask === "browser_action_launch") fileOperationCount++
			}
		}

		return {
			toolUsageCount,
			errorCount,
			fileOperationCount,
			terminalCommandCount,
			totalMessageLength,
			messageCount: messages.length,
			averageMessageLength: totalMessageLength / Math.max(1, messages.length),
		}
	}

	/**
	 * Assess risk level based on task metrics and state
	 */
	private assessRiskLevel(metrics: TaskComplexityMetrics, state: GlobalState | undefined): RiskAssessment {
		let riskScore = 0
		let confidence = 0.5

		// Risk factors
		if (metrics.errorCount > 3) riskScore += 0.3
		if (metrics.toolUsageCount > 10) riskScore += 0.2
		if (metrics.fileOperationCount > 5) riskScore += 0.2
		if (metrics.terminalCommandCount > 8) riskScore += 0.3

		// Confidence factors (higher confidence = lower risk)
		if (metrics.messageCount > 20) confidence += 0.2 // Established pattern
		if (metrics.errorCount === 0) confidence += 0.3 // No errors = high confidence
		if (metrics.averageMessageLength > 100) confidence += 0.1 // Detailed responses

		// State-based adjustments
		if (state?.autoApprovalEnabled) confidence += 0.2

		const riskLevel = riskScore > 0.5 ? "high" : riskScore > 0.2 ? "medium" : "low"

		return { riskLevel, confidence: Math.min(1.0, confidence), riskScore }
	}

	/**
	 * Check if smart limits have been exceeded
	 */
	private hasExceededSmartLimits(metrics: TaskComplexityMetrics, state: GlobalState | undefined): boolean {
		const maxRequests = state?.allowedMaxRequests || 50 // Increased default
		const maxCost = state?.allowedMaxCost || 10.0 // Increased default

		// Smart limits based on task complexity
		const complexityMultiplier = Math.max(1, metrics.errorCount * 0.5 + metrics.toolUsageCount * 0.1)

		return (
			this.consecutiveAutoApprovedRequestsCount > maxRequests * complexityMultiplier ||
			this.consecutiveAutoApprovedCost > maxCost * complexityMultiplier
		)
	}

	/**
	 * Increment the request counter and check if limit is exceeded
	 */
	private async checkRequestLimit(
		state: GlobalState | undefined,
		askForApproval: (
			type: ClineAsk,
			data: string,
		) => Promise<{ response: ClineAskResponse; text?: string; images?: string[] }>,
	): Promise<AutoApprovalResult> {
		const maxRequests = state?.allowedMaxRequests || Infinity

		// Increment the counter for each new API request
		this.consecutiveAutoApprovedRequestsCount++

		if (this.consecutiveAutoApprovedRequestsCount > maxRequests) {
			const { response } = await askForApproval(
				"auto_approval_max_req_reached",
				JSON.stringify({ count: maxRequests, type: "requests" }),
			)

			// If we get past the promise, it means the user approved and did not start a new task
			if (response === "yesButtonClicked") {
				this.consecutiveAutoApprovedRequestsCount = 0
				return {
					shouldProceed: true,
					requiresApproval: true,
					approvalType: "requests",
					approvalCount: maxRequests,
				}
			}

			return {
				shouldProceed: false,
				requiresApproval: true,
				approvalType: "requests",
				approvalCount: maxRequests,
			}
		}

		return { shouldProceed: true, requiresApproval: false }
	}

	/**
	 * Calculate current cost and check if limit is exceeded
	 */
	private async checkCostLimit(
		state: GlobalState | undefined,
		messages: ClineMessage[],
		askForApproval: (
			type: ClineAsk,
			data: string,
		) => Promise<{ response: ClineAskResponse; text?: string; images?: string[] }>,
	): Promise<AutoApprovalResult> {
		const maxCost = state?.allowedMaxCost || Infinity

		// Calculate total cost from messages
		this.consecutiveAutoApprovedCost = getApiMetrics(messages).totalCost

		// Use epsilon for floating-point comparison to avoid precision issues
		const EPSILON = 0.0001
		if (this.consecutiveAutoApprovedCost > maxCost + EPSILON) {
			const { response } = await askForApproval(
				"auto_approval_max_req_reached",
				JSON.stringify({ count: maxCost.toFixed(2), type: "cost" }),
			)

			// If we get past the promise, it means the user approved and did not start a new task
			if (response === "yesButtonClicked") {
				// Note: We don't reset the cost to 0 here because the actual cost
				// is calculated from the messages. This is different from the request count.
				return {
					shouldProceed: true,
					requiresApproval: true,
					approvalType: "cost",
					approvalCount: maxCost.toFixed(2),
				}
			}

			return {
				shouldProceed: false,
				requiresApproval: true,
				approvalType: "cost",
				approvalCount: maxCost.toFixed(2),
			}
		}

		return { shouldProceed: true, requiresApproval: false }
	}

	/**
	 * Reset the request counter (typically called when starting a new task)
	 */
	resetRequestCount(): void {
		this.consecutiveAutoApprovedRequestsCount = 0
	}

	/**
	 * Get current approval state for debugging/testing
	 */
	getApprovalState(): { requestCount: number; currentCost: number } {
		return {
			requestCount: this.consecutiveAutoApprovedRequestsCount,
			currentCost: this.consecutiveAutoApprovedCost,
		}
	}

	/**
	 * Record the result of an autonomous operation for learning
	 */
	recordAutonomousOperation(operationType: string, success: boolean, executionTime: number = 0): void {
		const pattern = this.operationHistory.get(operationType) || {
			operationType,
			successCount: 0,
			failureCount: 0,
			averageExecutionTime: 0,
			lastExecuted: Date.now(),
			riskLevel: "medium" as const,
			confidence: 0.5,
		}

		if (success) {
			pattern.successCount++
		} else {
			pattern.failureCount++
		}

		// Update average execution time
		const totalOperations = pattern.successCount + pattern.failureCount
		pattern.averageExecutionTime =
			(pattern.averageExecutionTime * (totalOperations - 1) + executionTime) / totalOperations
		pattern.lastExecuted = Date.now()

		// Update confidence based on success rate
		const successRate = pattern.successCount / totalOperations
		pattern.confidence = Math.min(1.0, successRate * 0.8 + 0.2) // Base confidence of 0.2

		// Update risk level based on failure rate
		const failureRate = pattern.failureCount / totalOperations
		if (failureRate < 0.1) {
			pattern.riskLevel = "low"
		} else if (failureRate < 0.3) {
			pattern.riskLevel = "medium"
		} else {
			pattern.riskLevel = "high"
		}

		this.operationHistory.set(operationType, pattern)

		// Update overall autonomous success rate
		const totalSuccesses = Array.from(this.operationHistory.values()).reduce((sum, p) => sum + p.successCount, 0)
		const totalFailures = Array.from(this.operationHistory.values()).reduce((sum, p) => sum + p.failureCount, 0)
		const totalOperationsAll = totalSuccesses + totalFailures
		if (totalOperationsAll > 0) {
			this.autonomousSuccessRate = totalSuccesses / totalOperationsAll
		}
	}

	/**
	 * Check if an operation can be performed autonomously based on learned patterns
	 */
	canPerformAutonomously(operationType: string): boolean {
		// Check cooldown
		const now = Date.now()
		if (now - this.lastAutonomousDecision < this.autonomousCooldownMs) {
			return false
		}

		const pattern = this.operationHistory.get(operationType)
		if (!pattern) {
			// New operation - be conservative
			return false
		}

		// Check if operation has been performed recently and successfully
		const timeSinceLastExecution = now - pattern.lastExecuted
		const recentExecution = timeSinceLastExecution < 300000 // 5 minutes

		// Allow autonomous execution if:
		// 1. High confidence (> 0.8)
		// 2. Low risk level
		// 3. Recent successful execution
		// 4. Overall autonomous success rate is good
		const autonomousCriteria =
			pattern.confidence >= this.confidenceThreshold &&
			pattern.riskLevel === "low" &&
			recentExecution &&
			this.autonomousSuccessRate >= 0.85

		if (autonomousCriteria) {
			this.lastAutonomousDecision = now
		}

		return autonomousCriteria
	}

	/**
	 * Get operation pattern statistics for debugging
	 */
	getOperationPatterns(): Record<string, OperationPattern> {
		return Object.fromEntries(this.operationHistory)
	}

	/**
	 * Reset operation history (useful for testing or when user preferences change)
	 */
	resetOperationHistory(): void {
		this.operationHistory.clear()
		this.autonomousSuccessRate = 0.95
		this.lastAutonomousDecision = 0
	}

	/**
	 * Get autonomous mode statistics
	 */
	getAutonomousStats(): {
		overallSuccessRate: number
		totalOperations: number
		autonomousModeEnabled: boolean
		confidenceThreshold: number
		cooldownMs: number
	} {
		const totalSuccesses = Array.from(this.operationHistory.values()).reduce((sum, p) => sum + p.successCount, 0)
		const totalFailures = Array.from(this.operationHistory.values()).reduce((sum, p) => sum + p.failureCount, 0)

		return {
			overallSuccessRate: this.autonomousSuccessRate,
			totalOperations: totalSuccesses + totalFailures,
			autonomousModeEnabled: this.autonomousModeEnabled,
			confidenceThreshold: this.confidenceThreshold,
			cooldownMs: this.autonomousCooldownMs,
		}
	}

	/**
	 * Adjust confidence threshold based on user feedback
	 */
	adjustConfidenceThreshold(feedback: "too_many_approvals" | "too_few_approvals"): void {
		const adjustment = 0.05 // 5% adjustment

		if (feedback === "too_many_approvals") {
			// User thinks we're approving too much - increase threshold (be more conservative)
			this.confidenceThreshold = Math.min(0.95, this.confidenceThreshold + adjustment)
		} else if (feedback === "too_few_approvals") {
			// User thinks we're asking for approval too often - decrease threshold (be more permissive)
			this.confidenceThreshold = Math.max(0.3, this.confidenceThreshold - adjustment)
		}
	}

	/**
	 * Enhanced risk assessment with pattern recognition
	 */
	private assessRiskWithPatterns(operationType: string, baseRisk: RiskAssessment): RiskAssessment {
		const pattern = this.operationHistory.get(operationType)

		if (!pattern) {
			return baseRisk
		}

		// Adjust risk based on operation history
		let adjustedRiskScore = baseRisk.riskScore
		let adjustedConfidence = baseRisk.confidence

		// If operation has high success rate, reduce risk
		if (pattern.confidence > 0.9) {
			adjustedRiskScore *= 0.7 // Reduce risk by 30%
			adjustedConfidence += 0.1
		}

		// If operation has been recently successful, increase confidence
		const timeSinceLastExecution = Date.now() - pattern.lastExecuted
		if (timeSinceLastExecution < 60000 && pattern.successCount > pattern.failureCount) {
			// Last minute and more successes
			adjustedConfidence += 0.15
		}

		// Recalculate risk level
		const newRiskLevel = adjustedRiskScore > 0.5 ? "high" : adjustedRiskScore > 0.2 ? "medium" : "low"

		return {
			riskLevel: newRiskLevel as "low" | "medium" | "high",
			confidence: Math.min(1.0, adjustedConfidence),
			riskScore: adjustedRiskScore,
		}
	}
}
