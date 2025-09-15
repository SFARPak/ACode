import React from "react"
import { Settings, History, Sparkles } from "lucide-react"
import { Button } from "./ui/button"
import { vscode } from "../utils/vscode"

import { Tab } from "../types/app"

interface TopNavBarProps {
	activeTab: Tab
	onTabChange: (tab: Tab) => void
}

const tabConfig = [
	{ id: "settings" as Tab, icon: Settings, label: "Settings" },
]

export const TopNavBar: React.FC<TopNavBarProps> = ({ activeTab, onTabChange }) => {

	return (
		<div className="glass-nav-bar sticky top-0 z-50 w-full border-b border-white/10 bg-white/5 backdrop-blur-xl backdrop-saturate-150">
			<div className="flex h-14 items-center justify-between px-4">
				{/* Left side icons */}
				<div className="flex items-center space-x-2">
					<button
						className="flex items-center justify-center w-8 h-8 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors"
						onClick={() => onTabChange("chat" as Tab)}
						title="New Chat"
					>
						<Sparkles className="h-4 w-4" />
					</button>
					<button className="flex items-center justify-center w-8 h-8 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors">
						<span className="codicon codicon-history text-lg"></span>
					</button>
				</div>

				{/* Logo/Brand */}
				<div className="flex items-center space-x-3">
					<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
						<span className="text-sm font-bold text-white">A</span>
					</div>
				</div>

				{/* Right side icons */}
				<div className="flex items-center space-x-2">
					<button
						className="flex items-center justify-center w-8 h-8 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors"
						onClick={() => vscode.postCommand("workbench.action.openSettings", "acode.settings")}
						title="Extension Settings"
					>
						<Settings className="h-4 w-4" />
					</button>
				</div>
			</div>

			{/* Navigation Tabs */}
			<nav className="flex items-center justify-center space-x-1 px-4 py-2">
				{tabConfig.map(({ id, icon: Icon, label }) => (
					<Button
						key={id}
						variant={activeTab === id ? "default" : "ghost"}
						size="sm"
						onClick={() => onTabChange(id)}
						className={`
							relative flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200
							${
								activeTab === id
									? "bg-white/30 text-white shadow-lg backdrop-blur-md border border-white/30"
									: "text-white/70 hover:text-white hover:bg-white/15 hover:backdrop-blur-sm"
							}
							${activeTab === id ? "glass-active-tab" : "glass-tab"}
						`}
					>
						<Icon className="h-4 w-4" />
						<span className="text-sm font-medium">{label}</span>
						{activeTab === id && (
							<div className="absolute bottom-0 left-1/2 h-0.5 w-8 -translate-x-1/2 translate-y-1 bg-gradient-to-r from-transparent via-white to-transparent rounded-full" />
						)}
					</Button>
				))}
			</nav>

		</div>
	)
}

export default TopNavBar