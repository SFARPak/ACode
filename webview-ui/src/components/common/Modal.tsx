interface ModalProps {
	isOpen: boolean
	onClose: () => void
	children: React.ReactNode
	className?: string
}

export function Modal({ isOpen, onClose, children, className = "" }: ModalProps) {
	if (!isOpen) return null

	return (
		<div
			className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[1000]"
			onClick={onClose}>
			<div
				className={`glass-nav-bar rounded-lg w-[90%] h-[90%] max-w-[1200px] flex flex-col shadow-[0_8px_32px_rgba(0,0,0,0.4)] border border-white/20 relative ${className}`}
				onClick={(e) => e.stopPropagation()}>
				{children}
			</div>
		</div>
	)
}
