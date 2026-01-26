import * as React from "react";
import { HeaderButton } from "./HeaderButton";

// Agent info for display
interface AgentInfo {
	id: string;
	displayName: string;
}

/**
 * Props for InlineHeader component
 */
export interface InlineHeaderProps {
	/** Display name of the active agent */
	agentLabel: string;
	/** Available agents for switching */
	availableAgents: AgentInfo[];
	/** Current agent ID */
	currentAgentId: string;
	/** Whether a plugin update is available */
	isUpdateAvailable: boolean;
	/** Whether session history is supported (show History button) */
	canShowSessionHistory: boolean;
	/** Whether there are messages to export */
	hasMessages: boolean;
	/** Callback to switch agent */
	onAgentChange: (agentId: string) => void;
	/** Callback to create a new chat session */
	onNewSession: () => void;
	/** Callback to open session history */
	onOpenHistory: () => void;
	/** Callback to export the chat */
	onExportChat: () => void;
	/** Callback to restart agent */
	onRestartAgent: () => void;
	/** View variant */
	variant: "floating" | "codeblock";
	/** Callback to close window (floating only) */
	onClose?: () => void;
}

/**
 * Inline header component for Floating and CodeBlock chat views.
 *
 * Features:
 * - Agent selector
 * - Update notification (if available)
 * - Action buttons with Lucide icons (new chat, history, export, restart)
 * - Close button (floating variant only)
 */
export function InlineHeader({
	agentLabel,
	availableAgents,
	currentAgentId,
	isUpdateAvailable,
	canShowSessionHistory,
	hasMessages,
	onAgentChange,
	onNewSession,
	onOpenHistory,
	onExportChat,
	onRestartAgent,
	variant,
	onClose,
}: InlineHeaderProps) {
	return (
		<div className={`agent-client-inline-header agent-client-inline-header-${variant}`}>
			<div className="agent-client-inline-header-main">
				<select
					className="agent-client-agent-selector"
					value={currentAgentId}
					onChange={(e) => onAgentChange(e.target.value)}
				>
					{availableAgents.map((agent) => (
						<option key={agent.id} value={agent.id}>
							{agent.displayName}
						</option>
					))}
				</select>
			</div>
			{isUpdateAvailable && (
				<p className="agent-client-chat-view-header-update">
					Update available!
				</p>
			)}
			<div className="agent-client-inline-header-actions">
				<HeaderButton
					iconName="plus"
					tooltip="New session"
					onClick={onNewSession}
				/>
				{canShowSessionHistory ? (
					<HeaderButton
						iconName="history"
						tooltip="Session history"
						onClick={onOpenHistory}
					/>
				) : (
					<span style={{ width: "20px", height: "20px", flexShrink: 0 }} />
				)}
				<HeaderButton
					iconName="save"
					tooltip="Export chat to Markdown"
					onClick={onExportChat}
				/>
				<HeaderButton
					iconName="rotate-cw"
					tooltip="Restart agent"
					onClick={onRestartAgent}
				/>
				{variant === "floating" && onClose && (
					<HeaderButton
						iconName="x"
						tooltip="Close"
						onClick={onClose}
					/>
				)}
			</div>
		</div>
	);
}
