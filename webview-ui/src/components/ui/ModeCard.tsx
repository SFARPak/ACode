import React, { useState } from "react"
import { motion } from "framer-motion"
import { ModeConfig } from "@acode/types"
import { getDescription, getWhenToUse } from "@roo/modes"
import { Button } from "./button"
import { Badge } from "./badge"

interface ModeCardProps {
	mode: ModeConfig
	isActive?: boolean
	isCustom?: boolean
	onClick: () => void
	onEdit?: () => void
	onDelete?: () => void
	className?: string
}

export const ModeCard: React.FC<ModeCardProps> = ({
	mode,
	isActive = false,
	isCustom = false,
	onClick,
	onEdit,
	onDelete,
	className = "",
}) => {
	const [isHovered, setIsHovered] = useState(false)

	const cardVariants = {
		initial: { scale: 1, y: 0 },
		hover: {
			scale: 1.02,
			y: -2,
			transition: { type: "spring", stiffness: 300, damping: 25 },
		},
		active: {
			scale: 0.98,
			transition: { type: "spring", stiffness: 300, damping: 25 },
		},
	}

	const glowVariants = {
		initial: { opacity: 0, scale: 0.95 },
		hover: {
			opacity: 0.6,
			scale: 1.05,
			transition: { duration: 0.3 },
		},
	}

	return (
		<motion.div
			className={`relative group ${className}`}
			variants={cardVariants}
			initial="initial"
			whileHover="hover"
			whileTap="active"
			onHoverStart={() => setIsHovered(true)}
			onHoverEnd={() => setIsHovered(false)}>
			{/* Glow effect for active state */}
			{isActive && (
				<motion.div
					className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-xl"
					variants={glowVariants}
					initial="initial"
					animate="hover"
				/>
			)}

			{/* Main card */}
			<div
				className={`
					relative glass-card p-4 rounded-xl cursor-pointer border transition-all duration-300
					${isActive ? "border-white/30 bg-white/15 shadow-lg shadow-white/10" : "border-white/10 bg-white/5 hover:bg-white/8"}
					backdrop-blur-xl
				`}
				onClick={onClick}
				role="button"
				tabIndex={0}
				aria-label={`Select ${mode.name} mode`}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault()
						onClick()
					}
				}}>
				{/* Header */}
				<div className="flex items-start justify-between mb-3">
					<div className="flex items-center space-x-3">
						<div className={`p-2 rounded-lg ${isActive ? "bg-white/20" : "bg-white/10"}`}>
							<span className={`codicon codicon-${getModeIcon(mode.slug)} text-lg`} />
						</div>
						<div>
							<h3 className="font-semibold text-white text-sm">{mode.name}</h3>
							<div className="flex items-center space-x-2 mt-1">
								{isCustom && (
									<Badge variant="secondary" className="text-xs px-1.5 py-0.5">
										Custom
									</Badge>
								)}
								{isActive && (
									<Badge
										variant="default"
										className="text-xs px-1.5 py-0.5 bg-green-500/20 text-green-300 border-green-500/30">
										Active
									</Badge>
								)}
							</div>
						</div>
					</div>

					{/* Action buttons */}
					{isCustom && (
						<div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
							{onEdit && (
								<Button
									variant="ghost"
									size="sm"
									className="h-6 w-6 p-0 hover:bg-white/10"
									onClick={(e) => {
										e.stopPropagation()
										onEdit()
									}}
									aria-label={`Edit ${mode.name} mode`}>
									<span className="codicon codicon-edit text-xs" />
								</Button>
							)}
							{onDelete && (
								<Button
									variant="ghost"
									size="sm"
									className="h-6 w-6 p-0 hover:bg-red-500/20 text-red-400"
									onClick={(e) => {
										e.stopPropagation()
										onDelete()
									}}
									aria-label={`Delete ${mode.name} mode`}>
									<span className="codicon codicon-trash text-xs" />
								</Button>
							)}
						</div>
					)}
				</div>

				{/* Description */}
				<p className="text-white/70 text-xs leading-relaxed mb-3 line-clamp-2">
					{mode.description || getDescription(mode.slug)}
				</p>

				{/* When to use */}
				<div className="text-white/60 text-xs mb-3">
					<strong>When to use:</strong> {mode.whenToUse || getWhenToUse(mode.slug)}
				</div>

				{/* Tools count */}
				{mode.groups && mode.groups.length > 0 && (
					<div className="flex items-center justify-between">
						<div className="text-white/50 text-xs">
							{mode.groups.length} tool{mode.groups.length !== 1 ? "s" : ""}
						</div>
						<motion.div
							className="flex -space-x-1"
							initial={{ opacity: 0 }}
							animate={{ opacity: isHovered ? 1 : 0.7 }}
							transition={{ duration: 0.2 }}>
							{mode.groups.slice(0, 3).map((group, index) => {
								const groupName = Array.isArray(group) ? group[0] : group
								return (
									<div
										key={index}
										className="w-5 h-5 rounded-full bg-white/10 border border-white/20 flex items-center justify-center"
										title={groupName}>
										<span className="text-[8px] text-white/60">{getToolIcon(groupName)}</span>
									</div>
								)
							})}
							{mode.groups.length > 3 && (
								<div className="w-5 h-5 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
									<span className="text-[8px] text-white/60 font-medium">
										+{mode.groups.length - 3}
									</span>
								</div>
							)}
						</motion.div>
					</div>
				)}
			</div>
		</motion.div>
	)
}

// Helper functions for icons
function getModeIcon(slug: string): string {
	const iconMap: Record<string, string> = {
		architect: "layout",
		code: "code",
		debug: "debug",
		orchestrate: "sparkles",
		test: "flask",
		chat: "comment",
		settings: "settings-gear",
		history: "history",
		mcp: "server",
		marketplace: "extensions",
		cloud: "cloud",
	}
	return iconMap[slug] || "circle-filled"
}

function getToolIcon(groupName: string): string {
	const iconMap: Record<string, string> = {
		read: "file",
		edit: "edit",
		run: "run",
		browser: "globe",
		mcp: "server",
	}
	return iconMap[groupName]?.charAt(0).toUpperCase() || "T"
}

export default ModeCard
