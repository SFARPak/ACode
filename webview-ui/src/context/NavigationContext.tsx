import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react"
import { Tab } from "../types/app"
import { useExtensionState } from "./ExtensionStateContext"

interface NavigationState {
	activeTab: Tab
	activeMode?: string
	breadcrumbHistory: Array<{ tab: Tab; label: string }>
	isSidebarCollapsed: boolean
	isModeTabBarCollapsed: boolean
	navigationStack: Tab[]
}

interface NavigationActions {
	setActiveTab: (tab: Tab) => void
	toggleSidebar: () => void
	toggleModeTabBar: () => void
	navigateToMode: (tab: Tab, modeName?: string) => void
	goBack: () => void
	canGoBack: boolean
	resetNavigation: () => void
	updateBreadcrumb: (tab: Tab, label: string) => void
}

interface NavigationContextValue extends NavigationState, NavigationActions {}

const NavigationContext = createContext<NavigationContextValue | undefined>(undefined)

interface NavigationProviderProps {
	children: ReactNode
	initialTab?: Tab
}

export const NavigationProvider: React.FC<NavigationProviderProps> = ({ children, initialTab = "chat" }) => {
	const { mode } = useExtensionState()

	const [state, setState] = useState<NavigationState>({
		activeTab: initialTab,
		activeMode: mode,
		breadcrumbHistory: [],
		isSidebarCollapsed: false,
		isModeTabBarCollapsed: false,
		navigationStack: [initialTab],
	})

	// Update active mode when extension state changes
	useEffect(() => {
		setState((prev) => ({
			...prev,
			activeMode: mode,
		}))
	}, [mode])

	const setActiveTab = useCallback((tab: Tab) => {
		setState((prev) => ({
			...prev,
			activeTab: tab,
			navigationStack: [...prev.navigationStack.filter((t) => t !== tab), tab],
		}))
	}, [])

	const toggleSidebar = useCallback(() => {
		setState((prev) => ({
			...prev,
			isSidebarCollapsed: !prev.isSidebarCollapsed,
		}))
	}, [])

	const toggleModeTabBar = useCallback(() => {
		setState((prev) => ({
			...prev,
			isModeTabBarCollapsed: !prev.isModeTabBarCollapsed,
		}))
	}, [])

	const navigateToMode = useCallback((tab: Tab, modeName?: string) => {
		setState((prev) => ({
			...prev,
			activeTab: tab,
			activeMode: modeName,
			navigationStack: [...prev.navigationStack, tab],
		}))
	}, [])

	const goBack = useCallback(() => {
		setState((prev) => {
			if (prev.navigationStack.length <= 1) return prev

			const newStack = [...prev.navigationStack]
			newStack.pop() // Remove current
			const previousTab = newStack[newStack.length - 1] // Get previous

			return {
				...prev,
				activeTab: previousTab,
				navigationStack: newStack,
			}
		})
	}, [])

	const resetNavigation = useCallback(() => {
		setState((prev) => ({
			...prev,
			activeTab: initialTab,
			activeMode: mode,
			breadcrumbHistory: [],
			navigationStack: [initialTab],
		}))
	}, [initialTab, mode])

	const updateBreadcrumb = useCallback((tab: Tab, label: string) => {
		setState((prev) => ({
			...prev,
			breadcrumbHistory: [...prev.breadcrumbHistory.filter((item) => item.tab !== tab), { tab, label }],
		}))
	}, [])

	const canGoBack = state.navigationStack.length > 1

	const value: NavigationContextValue = {
		...state,
		setActiveTab,
		toggleSidebar,
		toggleModeTabBar,
		navigateToMode,
		goBack,
		canGoBack,
		resetNavigation,
		updateBreadcrumb,
	}

	return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>
}

export const useNavigation = (): NavigationContextValue => {
	const context = useContext(NavigationContext)
	if (!context) {
		throw new Error("useNavigation must be used within a NavigationProvider")
	}
	return context
}

// Helper hook for keyboard navigation
export const useKeyboardNavigation = () => {
	const { setActiveTab, toggleSidebar } = useNavigation()

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			// Ctrl/Cmd + number for mode switching
			if ((event.ctrlKey || event.metaKey) && event.key >= "1" && event.key <= "5") {
				event.preventDefault()
				const modeIndex = parseInt(event.key) - 1
				const modes: Tab[] = ["architect", "code", "debug", "orchestrate", "test"]
				if (modes[modeIndex]) {
					setActiveTab(modes[modeIndex])
				}
			}

			// Ctrl/Cmd + B for sidebar toggle
			if ((event.ctrlKey || event.metaKey) && event.key === "b") {
				event.preventDefault()
				toggleSidebar()
			}
		}

		document.addEventListener("keydown", handleKeyDown)
		return () => document.removeEventListener("keydown", handleKeyDown)
	}, [setActiveTab, toggleSidebar])
}

export default NavigationContext
