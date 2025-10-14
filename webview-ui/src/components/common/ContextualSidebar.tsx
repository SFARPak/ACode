import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Tab } from "../../types/app"
import { Button } from "../ui/button"
import { Separator } from "../ui/separator"
import { Badge } from "../ui/badge"
import { useExtensionState } from "../../context/ExtensionStateContext"
import { Settings, History, Code, Bug, Layout, FlaskConical, ChevronLeft, ChevronRight } from "lucide-react"

interface ContextualSidebarProps {
	activeTab: Tab
	onTabChange: (tab: Tab) => void
	isCollapsed?: boolean
	onToggleCollapse?: () => void
	className?: string
}

interface QuickAction {
	id: string
	label: string
	icon: React.ComponentType<{ className?: string }>
	action: () => void
	badge?: string | number
	disabled?: boolean
}

export const ContextualSidebar: React.FC<ContextualSidebarProps> = ({
	activeTab,
	onTabChange,
	isCollapsed = false,
	onToggleCollapse,
	className = "",
}) => {
	const [hoveredAction, setHoveredAction] = useState<string | null>(null)
	const { mode, customModes } = useExtensionState()

	const sidebarVariants = {
		expanded: {
			width: 280,
			transition: { type: "spring", stiffness: 300, damping: 30 },
		},
		collapsed: {
			width: 64,
			transition: { type: "spring", stiffness: 300, damping: 30 },
		},
	}

	const contentVariants = {
		expanded: {
			opacity: 1,
			x: 0,
			transition: { delay: 0.1, duration: 0.2 },
		},
		collapsed: {
			opacity: 0,
			x: -20,
			transition: { duration: 0.15 },
		},
	}

	// Get quick actions based on current mode and context
	const getQuickActions = (): QuickAction[] => {
		const actions: QuickAction[] = []

		// Mode-specific actions
		switch (activeTab) {
			case "architect":
				actions.push({
					id: "new-project",
					label: "New Project Structure",
					icon: Layout,
					action: () => onTabChange("architect"),
				})
				break
			case "code":
				actions.push({
					id: "format-code",
					label: "Format Code",
					icon: Code,
					action: () => onTabChange("code"),
				})
				break
			case "debug":
				actions.push({
					id: "run-debugger",
					label: "Run Debugger",
					icon: Bug,
					action: () => onTabChange("debug"),
				})
				break
			case "test":
				actions.push({
					id: "run-tests",
					label: "Run All Tests",
					icon: FlaskConical,
					action: () => onTabChange("test"),
				})
				break
		}

		// Common actions
		actions.push({
			id: "modes",
			label: "Mode Settings",
			icon: Settings,
			action: () => onTabChange("modes"),
		})

		actions.push({
			id: "history",
			label: "Task History",
			icon: History,
			action: () => onTabChange("history"),
			badge: "3", // Example badge for recent tasks
		})

		return actions
	}

	const quickActions = getQuickActions()

	// Get recent modes for quick access
	const getRecentModes = () => {
		const recentModes = ["code", "architect", "debug", "orchestrate", "test"]
		return recentModes.filter((m) => m !== activeTab).slice(0, 3)
	}

	const recentModes = getRecentModes()

	return (
		<motion.div
			className={`fixed left-0 top-14 h-[calc(100vh-3.5rem)] glass-panel border-r border-white/10 z-40 ${className}`}
			variants={sidebarVariants}
			initial="expanded"
			animate={isCollapsed ? "collapsed" : "expanded"}>
			{/* Header */}
			<div className="p-4 border-b border-white/10">
				<div className="flex items-center justify-between">
					<AnimatePresence>
						{!isCollapsed && (
							<motion.div
								variants={contentVariants}
								initial="collapsed"
								animate="expanded"
								exit="collapsed"
								className="flex-1">
								<h3 className="text-white font-semibold text-sm">Quick Actions</h3>
								<p className="text-white/60 text-xs mt-1">Contextual shortcuts</p>
							</motion.div>
						)}
					</AnimatePresence>

					<Button
						variant="ghost"
						size="sm"
						className="h-8 w-8 p-0 hover:bg-white/10"
						onClick={onToggleCollapse}
						aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}>
						{isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
					</Button>
				</div>
			</div>

			{/* Current Mode Status */}
			<div className="p-4 border-b border-white/10">
				<AnimatePresence>
					{!isCollapsed && (
						<motion.div variants={contentVariants} initial="collapsed" animate="expanded" exit="collapsed">
							<div className="flex items-center space-x-3">
								<div className="p-2 rounded-lg bg-white/10">
									<span className={`codicon codicon-${getModeIcon(activeTab)} text-lg text-white`} />
								</div>
								<div className="min-w-0 flex-1">
									<div className="flex items-center space-x-2">
										<span className="text-white font-medium text-sm truncate">
											{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
										</span>
										<Badge variant="secondary" className="text-xs px-1.5 py-0.5">
											Active
										</Badge>
									</div>
									<p className="text-white/60 text-xs mt-0.5">
										{mode && customModes?.find((m) => m.slug === mode)?.name}
									</p>
								</div>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>

			{/* Quick Actions */}
			<div className="flex-1 overflow-y-auto p-2">
				<AnimatePresence>
					{!isCollapsed && (
						<motion.div
							variants={contentVariants}
							initial="collapsed"
							animate="expanded"
							exit="collapsed"
							className="space-y-1">
							{quickActions.map((action) => (
								<motion.div key={action.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
									<Button
										variant="ghost"
										className="w-full justify-start h-10 px-3 hover:bg-white/10 transition-colors relative"
										onClick={action.action}
										disabled={action.disabled}
										onMouseEnter={() => setHoveredAction(action.id)}
										onMouseLeave={() => setHoveredAction(null)}
										aria-label={action.label}>
										<action.icon className="h-4 w-4 mr-3 flex-shrink-0" />
										<span className="text-sm truncate">{action.label}</span>
										{action.badge && (
											<Badge
												variant="secondary"
												className="ml-auto text-xs px-1.5 py-0.5 min-w-[20px] h-5 flex items-center justify-center">
												{action.badge}
											</Badge>
										)}
										{hoveredAction === action.id && (
											<motion.div
												className="absolute right-2 top-1/2 -translate-y-1/2 w-1 h-6 bg-white/30 rounded-full"
												initial={{ scale: 0 }}
												animate={{ scale: 1 }}
												transition={{ type: "spring", stiffness: 500, damping: 25 }}
											/>
										)}
									</Button>
								</motion.div>
							))}
						</motion.div>
					)}
				</AnimatePresence>

				{/* Collapsed state icons */}
				{isCollapsed && (
					<div className="space-y-1">
						{quickActions.map((action) => (
							<Button
								key={action.id}
								variant="ghost"
								size="icon"
								className="w-full h-10 hover:bg-white/10 transition-colors relative"
								onClick={action.action}
								disabled={action.disabled}
								title={action.label}
								aria-label={action.label}>
								<action.icon className="h-4 w-4" />
								{action.badge && (
									<div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full" />
								)}
							</Button>
						))}
					</div>
				)}
			</div>

			{/* Recent Modes */}
			{!isCollapsed && recentModes.length > 0 && (
				<>
					<Separator className="bg-white/10" />
					<div className="p-4">
						<AnimatePresence>
							<motion.div
								variants={contentVariants}
								initial="collapsed"
								animate="expanded"
								exit="collapsed">
								<h4 className="text-white/80 font-medium text-xs mb-3">Recent Modes</h4>
								<div className="space-y-2">
									{recentModes.map((modeSlug) => {
										const modeIcon = getModeIcon(modeSlug as Tab)
										return (
											<Button
												key={modeSlug}
												variant="ghost"
												className="w-full justify-start h-8 px-2 hover:bg-white/10 transition-colors"
												onClick={() => onTabChange(modeSlug as Tab)}
												aria-label={`Switch to ${modeSlug} mode`}>
												<span className={`codicon codicon-${modeIcon} text-sm mr-2`} />
												<span className="text-xs capitalize">{modeSlug}</span>
											</Button>
										)
									})}
								</div>
							</motion.div>
						</AnimatePresence>
					</div>
				</>
			)}
		</motion.div>
	)
}

// Helper function for mode icons
function getModeIcon(tab: Tab): string {
	const iconMap: Record<Tab, string> = {
		architect: "layout",
		code: "code",
		debug: "debug",
		orchestrate: "sparkles",
		test: "flask-conical",
		chat: "comment",
		settings: "settings-gear",
		history: "history",
		mcp: "server",
		marketplace: "extensions",
		cloud: "cloud",
		modes: "settings",
	}
	return iconMap[tab] || "circle-filled"
}

export default ContextualSidebar
