import { useEffect } from "react"
import { Tab } from "../../../types/app"

interface KeyboardNavigationOptions {
	onTabChange?: (tab: Tab) => void
	onToggleSidebar?: () => void
	onToggleModeTabBar?: () => void
	enabled?: boolean
}

export const useKeyboardNavigation = ({
	onTabChange,
	onToggleSidebar,
	onToggleModeTabBar,
	enabled = true,
}: KeyboardNavigationOptions) => {
	useEffect(() => {
		if (!enabled) return

		const handleKeyDown = (event: KeyboardEvent) => {
			// Prevent handling shortcuts when user is typing in input fields
			const target = event.target as HTMLElement
			if (
				target.tagName === "INPUT" ||
				target.tagName === "TEXTAREA" ||
				target.contentEditable === "true" ||
				target.closest('[role="combobox"]')
			) {
				return
			}

			const isCtrlOrCmd = event.ctrlKey || event.metaKey

			// Mode switching shortcuts (Ctrl/Cmd + 1-5)
			if (isCtrlOrCmd && event.key >= "1" && event.key <= "5") {
				event.preventDefault()
				const modeIndex = parseInt(event.key) - 1
				const modes: Tab[] = ["architect", "code", "debug", "orchestrate", "test"]
				if (modes[modeIndex] && onTabChange) {
					onTabChange(modes[modeIndex])
				}
			}

			// Sidebar toggle (Ctrl/Cmd + B)
			if (isCtrlOrCmd && event.key === "b") {
				event.preventDefault()
				onToggleSidebar?.()
			}

			// Mode tab bar toggle (Ctrl/Cmd + Shift + T)
			if (isCtrlOrCmd && event.shiftKey && event.key === "T") {
				event.preventDefault()
				onToggleModeTabBar?.()
			}

			// Navigation shortcuts
			if (isCtrlOrCmd) {
				switch (event.key) {
					case "ArrowLeft":
						event.preventDefault()
						// Navigate to previous mode
						break
					case "ArrowRight":
						event.preventDefault()
						// Navigate to next mode
						break
					case "Home":
						event.preventDefault()
						if (onTabChange) onTabChange("chat")
						break
					case "End":
						event.preventDefault()
						if (onTabChange) onTabChange("settings")
						break
				}
			}

			// Escape key handling
			if (event.key === "Escape") {
				// Close modals, dropdowns, etc.
				const activeElement = document.activeElement as HTMLElement
				if (
					activeElement?.closest('[role="dialog"]') ||
					activeElement?.closest('[role="menu"]') ||
					activeElement?.closest('[role="listbox"]')
				) {
					// Let the component handle escape
					return
				}
			}
		}

		document.addEventListener("keydown", handleKeyDown)
		return () => document.removeEventListener("keydown", handleKeyDown)
	}, [enabled, onTabChange, onToggleSidebar, onToggleModeTabBar])
}

export default useKeyboardNavigation
