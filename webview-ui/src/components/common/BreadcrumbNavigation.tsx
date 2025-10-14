import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Tab } from "../../types/app"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { ChevronRight, Home, Settings } from "lucide-react"

interface BreadcrumbItem {
	label: string
	tab: Tab
	isActive?: boolean
	isEllipsis?: boolean
	icon?: React.ComponentType<{ className?: string }>
}

interface BreadcrumbNavigationProps {
	items: BreadcrumbItem[]
	onNavigate: (tab: Tab) => void
	maxItems?: number
	className?: string
}

export const BreadcrumbNavigation: React.FC<BreadcrumbNavigationProps> = ({
	items,
	onNavigate,
	maxItems = 3,
	className = "",
}) => {
	const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

	// If we have more items than maxItems, show ellipsis for middle items
	const displayItems =
		items.length > maxItems
			? [items[0], { label: "...", tab: "chat" as Tab, isEllipsis: true }, ...items.slice(-2)]
			: items

	const breadcrumbVariants = {
		initial: { opacity: 0, x: -10 },
		animate: { opacity: 1, x: 0 },
		exit: { opacity: 0, x: 10 },
		transition: { duration: 0.2 },
	}

	const getItemIcon = (item: BreadcrumbItem) => {
		if (item.icon) return item.icon
		if (item.tab === "modes") return Settings
		if (item.tab === "chat") return Home
		return () => null
	}

	return (
		<motion.nav
			className={`flex items-center space-x-1 text-sm ${className}`}
			initial="initial"
			animate="animate"
			transition={{ staggerChildren: 0.1 }}>
			{displayItems.map((item, index) => {
				const Icon = getItemIcon(item)
				const isLast = index === displayItems.length - 1
				const actualIndex = items.indexOf(item)

				return (
					<React.Fragment key={`${item.tab}-${index}`}>
						{/* Breadcrumb item */}
						<motion.div
							variants={breadcrumbVariants}
							className="flex items-center"
							onHoverStart={() => setHoveredIndex(actualIndex)}
							onHoverEnd={() => setHoveredIndex(null)}>
							{item.isEllipsis ? (
								<span className="text-white/50 px-2">...</span>
							) : (
								<Button
									variant="ghost"
									size="sm"
									className={`
										h-8 px-2 rounded-md transition-all duration-200 relative
										${item.isActive ? "bg-white/20 text-white border border-white/30" : "text-white/70 hover:text-white hover:bg-white/10"}
										${isLast ? "pointer-events-none" : "cursor-pointer"}
									`}
									onClick={() => !isLast && !item.isActive && onNavigate(item.tab)}
									disabled={item.isActive}
									aria-current={item.isActive ? "page" : undefined}
									aria-label={`Navigate to ${item.label}`}>
									{Icon && <Icon className="h-3 w-3 mr-1.5 flex-shrink-0" />}
									<span className="truncate max-w-24">{item.label}</span>

									{/* Hover indicator */}
									{hoveredIndex === actualIndex && !isLast && (
										<motion.div
											className="absolute inset-0 bg-white/5 rounded-md"
											layoutId="breadcrumbHover"
											transition={{ type: "spring", stiffness: 300, damping: 30 }}
										/>
									)}
								</Button>
							)}
						</motion.div>

						{/* Separator */}
						{!isLast && (
							<motion.div variants={breadcrumbVariants} className="flex items-center">
								<ChevronRight className="h-3 w-3 text-white/40 flex-shrink-0" />
							</motion.div>
						)}
					</React.Fragment>
				)
			})}

			{/* Current mode indicator */}
			{items.length > 0 && (
				<AnimatePresence>
					<motion.div
						initial={{ opacity: 0, scale: 0.8 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.8 }}
						className="ml-2">
						<Badge
							variant="secondary"
							className="text-xs px-2 py-0.5 bg-white/10 border-white/20 text-white/80">
							{items[items.length - 1]?.label || "Unknown"}
						</Badge>
					</motion.div>
				</AnimatePresence>
			)}
		</motion.nav>
	)
}

// Context-aware breadcrumb generator
export const generateBreadcrumbs = (currentTab: Tab, modeName?: string): BreadcrumbItem[] => {
	const baseItems: BreadcrumbItem[] = [
		{
			label: "Home",
			tab: "chat",
			icon: Home,
		},
	]

	// Add current tab
	const currentItem: BreadcrumbItem = {
		label: modeName || getTabDisplayName(currentTab),
		tab: currentTab,
		isActive: true,
		icon: getTabIcon(currentTab),
	}

	return [...baseItems, currentItem]
}

// Helper functions
function getTabDisplayName(tab: Tab): string {
	const nameMap: Record<Tab, string> = {
		architect: "Architect",
		code: "Code",
		debug: "Debug",
		orchestrate: "Orchestrate",
		test: "Test",
		chat: "Chat",
		settings: "Settings",
		history: "History",
		mcp: "MCP",
		marketplace: "Marketplace",
		cloud: "Cloud",
		modes: "Modes",
	}
	return nameMap[tab] || tab
}

function getTabIcon(tab: Tab): React.ComponentType<{ className?: string }> | undefined {
	const iconMap: Partial<Record<Tab, React.ComponentType<{ className?: string }>>> = {
		architect: () => <span className="codicon codicon-layout" />,
		code: () => <span className="codicon codicon-code" />,
		debug: () => <span className="codicon codicon-debug" />,
		orchestrate: () => <span className="codicon codicon-sparkles" />,
		test: () => <span className="codicon codicon-flask-conical" />,
		chat: () => <span className="codicon codicon-comment" />,
		settings: Settings,
		history: () => <span className="codicon codicon-history" />,
		mcp: () => <span className="codicon codicon-server" />,
		marketplace: () => <span className="codicon codicon-extensions" />,
		cloud: () => <span className="codicon codicon-cloud" />,
		modes: Settings,
	}
	return iconMap[tab]
}

export default BreadcrumbNavigation
