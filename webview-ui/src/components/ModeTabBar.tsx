import React from "react"
import { Button } from "./ui/button"
import { Tab } from "../types/app"
import { Layout, Code, Bug, Sparkles, FlaskConical } from "lucide-react"

interface ModeTabBarProps {
	activeTab: Tab
	onTabChange: (tab: Tab) => void
}

const modeTabConfig = [
	{ id: "architect" as Tab, icon: Layout, label: "Architect" },
	{ id: "code" as Tab, icon: Code, label: "Code" },
	{ id: "debug" as Tab, icon: Bug, label: "Debug" },
	{ id: "orchestrate" as Tab, icon: Sparkles, label: "Orchestrate" },
	{ id: "test" as Tab, icon: FlaskConical, label: "Test" },
]

export const ModeTabBar: React.FC<ModeTabBarProps> = ({ activeTab, onTabChange }) => {
	return (
		<div className="glass-mode-bar sticky top-14 z-40 w-full border-b border-white/10 bg-white/5 backdrop-blur-xl backdrop-saturate-150">
			<nav className="flex items-center justify-center space-x-1 px-4 py-2">
				{modeTabConfig.map(({ id, icon: Icon, label }) => (
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

export default ModeTabBar