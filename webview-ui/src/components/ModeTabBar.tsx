import React, { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Tab } from "../types/app"
import { useExtensionState } from "../context/ExtensionStateContext"
import { Layout, Code, Bug, Sparkles, FlaskConical, ChevronLeft, ChevronRight } from "lucide-react"

interface ModeTabBarProps {
	activeTab: Tab
	onTabChange: (tab: Tab) => void
	isCollapsed?: boolean
	onToggleCollapse?: () => void
}

const modeTabConfig = [
	{
		id: "architect" as Tab,
		icon: Layout,
		label: "Architect",
		description: "Design system architecture and project structure",
		shortcut: "Ctrl+1",
	},
	{
		id: "code" as Tab,
		icon: Code,
		label: "Code",
		description: "Write, edit, and refactor code",
		shortcut: "Ctrl+2",
	},
	{
		id: "debug" as Tab,
		icon: Bug,
		label: "Debug",
		description: "Debug and troubleshoot issues",
		shortcut: "Ctrl+3",
	},
	{
		id: "orchestrate" as Tab,
		icon: Sparkles,
		label: "Orchestrate",
		description: "Coordinate complex multi-step tasks",
		shortcut: "Ctrl+4",
	},
	{
		id: "test" as Tab,
		icon: FlaskConical,
		label: "Test",
		description: "Write and run tests",
		shortcut: "Ctrl+5",
	},
]

export const ModeTabBar: React.FC<ModeTabBarProps> = ({
	activeTab,
	onTabChange,
	isCollapsed = false,
	onToggleCollapse,
}) => {
	const [hoveredTab, setHoveredTab] = useState<Tab | null>(null)
	const { mode } = useExtensionState()
	const navRef = useRef<HTMLDivElement>(null)

	const tabVariants = {
		initial: { scale: 1, y: 0 },
		hover: {
			scale: 1.05,
			y: -1,
			transition: { type: "spring", stiffness: 400, damping: 25 },
		},
		active: {
			scale: 0.95,
			transition: { type: "spring", stiffness: 400, damping: 25 },
		},
	}

	const tooltipVariants = {
		initial: { opacity: 0, y: 10, scale: 0.95 },
		animate: {
			opacity: 1,
			y: 0,
			scale: 1,
			transition: { type: "spring", stiffness: 300, damping: 25 },
		},
		exit: {
			opacity: 0,
			y: 5,
			scale: 0.95,
			transition: { duration: 0.15 },
		},
	}

	const handleTabClick = (tabId: Tab, event: React.MouseEvent) => {
		// Add ripple effect
		const button = event.currentTarget as HTMLElement
		const ripple = document.createElement("div")
		const rect = button.getBoundingClientRect()
		const size = Math.max(rect.width, rect.height)
		const x = event.clientX - rect.left - size / 2
		const y = event.clientY - rect.top - size / 2

		ripple.style.width = ripple.style.height = size + "px"
		ripple.style.left = x + "px"
		ripple.style.top = y + "px"
		ripple.className = "absolute rounded-full bg-white/20 animate-ping pointer-events-none"
		button.appendChild(ripple)

		setTimeout(() => ripple.remove(), 600)

		onTabChange(tabId)
	}

	return (
		<div className="glass-nav-bar sticky top-14 z-40 w-full border-b border-white/10 bg-white/5 backdrop-blur-xl backdrop-saturate-150">
			<div className="flex items-center justify-between px-2 sm:px-4 py-2">
				{/* Collapse toggle */}
				{onToggleCollapse && (
					<Button
						variant="ghost"
						size="sm"
						className="h-8 w-8 p-0 hover:bg-white/10 mr-2"
						onClick={onToggleCollapse}
						aria-label={isCollapsed ? "Show mode tabs" : "Hide mode tabs"}>
						{isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
					</Button>
				)}

				{/* Mode Tabs */}
				<AnimatePresence>
					{!isCollapsed && (
						<motion.nav
							ref={navRef}
							className="flex items-center space-x-1 overflow-x-auto flex-1"
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: -20 }}
							transition={{ duration: 0.3 }}>
							{modeTabConfig.map(({ id, icon: Icon, label, description, shortcut }) => {
								const isActive = activeTab === id

								return (
									<motion.div
										key={id}
										variants={tabVariants}
										initial="initial"
										whileHover="hover"
										whileTap="active"
										className="relative"
										onHoverStart={() => setHoveredTab(id)}
										onHoverEnd={() => setHoveredTab(null)}>
										<Button
											variant={isActive ? "default" : "ghost"}
											size="sm"
											onClick={(e) => handleTabClick(id, e)}
											className={`
												relative flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg transition-all duration-300 ease-in-out
												${
													isActive
														? "bg-white/30 text-white shadow-lg backdrop-blur-md border border-white/30"
														: "text-white/70 hover:text-white hover:bg-white/15 hover:backdrop-blur-sm hover:shadow-md"
												}
												${isActive ? "glass-active-tab" : "glass-tab"}
												glass-focus
												min-w-max
											`}
											aria-label={`${label} mode${isActive ? " (active)" : ""}`}
											aria-describedby={hoveredTab === id ? `tooltip-${id}` : undefined}>
											<Icon className="h-4 w-4 flex-shrink-0" />
											<span className="text-sm font-medium hidden sm:inline">{label}</span>

											{/* Status indicator */}
											{isActive && mode === id && (
												<motion.div
													className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full"
													initial={{ scale: 0 }}
													animate={{ scale: 1 }}
													transition={{ type: "spring", stiffness: 500, damping: 25 }}
												/>
											)}

											{/* Active indicator bar */}
											{isActive && (
												<motion.div
													className="absolute bottom-0 left-1/2 h-0.5 w-8 -translate-x-1/2 translate-y-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"
													layoutId="activeTabIndicator"
													transition={{ type: "spring", stiffness: 300, damping: 30 }}
												/>
											)}
										</Button>

										{/* Enhanced tooltip */}
										<AnimatePresence>
											{hoveredTab === id && !isCollapsed && (
												<motion.div
													id={`tooltip-${id}`}
													variants={tooltipVariants}
													initial="initial"
													animate="animate"
													exit="exit"
													className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
													<div className="glass-tooltip p-3 rounded-lg shadow-lg border max-w-xs">
														<div className="flex items-center space-x-2 mb-1">
															<Icon className="h-4 w-4" />
															<span className="font-medium text-sm">{label}</span>
															{shortcut && (
																<Badge
																	variant="secondary"
																	className="text-xs px-1.5 py-0.5">
																	{shortcut}
																</Badge>
															)}
														</div>
														<p className="text-xs text-white/80">{description}</p>
													</div>
												</motion.div>
											)}
										</AnimatePresence>
									</motion.div>
								)
							})}
						</motion.nav>
					)}
				</AnimatePresence>

				{/* Status badge */}
				<div className="flex items-center ml-2">
					<Badge variant="secondary" className="hidden sm:flex text-xs px-2 py-1 bg-white/10 border-white/20">
						{modeTabConfig.find((c) => c.id === activeTab)?.label || "Unknown"}
					</Badge>
				</div>
			</div>
		</div>
	)
}

export default ModeTabBar
