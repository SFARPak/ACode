import React, { useState } from "react"
import { Sparkles, Settings, ChevronDown, X } from "lucide-react"
import { Button } from "./ui/button"
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
	Command,
	CommandInput,
	CommandList,
	CommandEmpty,
	CommandGroup,
	CommandItem,
} from "./ui"

import { Tab } from "../types/app"
import { getAllModes } from "@roo/modes"
import { ModeConfig } from "@acode/types"

interface TopNavBarProps {
	activeTab: Tab
	onTabChange: (tab: Tab) => void
}

const getAllModesData = (): ModeConfig[] => getAllModes()

export const TopNavBar: React.FC<TopNavBarProps> = ({ activeTab, onTabChange }) => {
	const [open, setOpen] = useState(false)
	const [searchValue, setSearchValue] = useState("")

	const getCurrentTabLabel = () => {
		const currentTab = getAllModesData().find((mode) => mode.slug === activeTab)
		return currentTab?.name || "Select Mode"
	}

	const onOpenChange = (isOpen: boolean) => {
		setOpen(isOpen)
		if (!isOpen) {
			setTimeout(() => setSearchValue(""), 100)
		}
	}

	const onClearSearch = () => {
		setSearchValue("")
	}

	return (
		<div className="glass-nav-bar sticky top-0 z-50 w-full border-b border-white/10 bg-white/5 backdrop-blur-xl backdrop-saturate-150">
			<div className="flex h-14 items-center justify-between px-2 sm:px-4">
				{/* Left side icons */}
				<div className="flex items-center space-x-1 sm:space-x-2">
					<button
						className="flex items-center justify-center w-8 h-8 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors"
						onClick={() => onTabChange("chat" as Tab)}
						title="New Chat">
						<Sparkles className="h-4 w-4" />
					</button>
					<button className="flex items-center justify-center w-8 h-8 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors">
						<span className="codicon codicon-history text-lg"></span>
					</button>
				</div>

				{/* Right side icons */}
				<div className="flex items-center space-x-1 sm:space-x-2">
					<button className="flex items-center justify-center w-8 h-8 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors">
						<Settings className="h-4 w-4" />
					</button>
				</div>
			</div>

			{/* Modes Dropdown */}
			<div className="flex items-center justify-center px-2 sm:px-4 py-2">
				<Popover open={open} onOpenChange={onOpenChange}>
					<PopoverTrigger asChild>
						<Button
							variant="combobox"
							role="combobox"
							aria-expanded={open}
							className="justify-between w-full max-w-md"
							data-testid="tab-select-trigger">
							<div className="truncate">{getCurrentTabLabel()}</div>
							<ChevronDown className="opacity-50" />
						</Button>
					</PopoverTrigger>
					<PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]">
						<Command>
							<div className="relative">
								<CommandInput
									value={searchValue}
									onValueChange={setSearchValue}
									placeholder="Select mode..."
									className="h-9 mr-4"
									data-testid="tab-search-input"
								/>
								{searchValue.length > 0 && (
									<div className="absolute right-2 top-0 bottom-0 flex items-center justify-center">
										<X
											className="text-white/50 opacity-50 hover:opacity-100 size-4 p-0.5 cursor-pointer"
											onClick={onClearSearch}
										/>
									</div>
								)}
							</div>
							<CommandList>
								<CommandEmpty>
									{searchValue && <div className="py-2 px-1 text-sm">No mode found.</div>}
								</CommandEmpty>
								<CommandGroup>
									{getAllModesData()
										.filter((mode) =>
											searchValue
												? mode.name.toLowerCase().includes(searchValue.toLowerCase()) ||
													mode.slug.toLowerCase().includes(searchValue.toLowerCase())
												: true,
										)
										.map((mode) => (
											<CommandItem
												key={mode.slug}
												value={mode.slug}
												onSelect={() => {
													onTabChange(mode.slug as Tab)
													setOpen(false)
												}}
												data-testid={`tab-option-${mode.slug}`}
												className="navbar-mode-item">
												<div className="flex items-center justify-between w-full">
													<div className="flex items-center space-x-2 flex-1 min-w-0">
														<span className="text-sm font-medium truncate">
															{mode.name}
														</span>
													</div>
													<span
														className="text-white/70 text-xs font-mono bg-white/5 px-1.5 py-0.5 rounded"
														style={{
															whiteSpace: "nowrap",
															overflow: "hidden",
															textOverflow: "ellipsis",
															flex: 0,
															marginLeft: "0.5em",
														}}>
														{mode.slug}
													</span>
												</div>
											</CommandItem>
										))}
								</CommandGroup>
							</CommandList>
						</Command>
					</PopoverContent>
				</Popover>
			</div>

			{/* Version number */}
			<div className="flex justify-center px-2 sm:px-4 py-1">
				<span className="text-xs text-white/60">v0.9.2</span>
			</div>
		</div>
	)
}

export default TopNavBar
