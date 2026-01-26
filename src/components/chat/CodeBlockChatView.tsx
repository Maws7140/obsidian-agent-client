import * as React from "react";
const { useRef, useMemo } = React;
import { createRoot } from "react-dom/client";
import { parseYaml } from "obsidian";

import type AgentClientPlugin from "../../plugin";

// Component imports
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";
import { InlineHeader } from "./InlineHeader";

// Hooks imports
import { useChatController } from "../../hooks/useChatController";

interface CodeBlockConfig {
	image?: string;
	agent?: string;
	model?: string;
	height?: string;
}

interface CodeBlockChatComponentProps {
	plugin: AgentClientPlugin;
	config: CodeBlockConfig;
	el: HTMLElement;
}

function CodeBlockChatComponent({
	plugin,
	config,
	el,
}: CodeBlockChatComponentProps) {
	// ============================================================
	// Component ID (View-Specific)
	// ============================================================
	const componentId = useMemo(() => "code-block-" + Math.random().toString(36).substring(2, 9), []);

	// ============================================================
	// Chat Controller Hook (Centralized Logic)
	// ============================================================
	const controller = useChatController({
		plugin,
		viewId: componentId,
		workingDirectory: undefined, // Let hook determine from vault
		config: {
			agent: config.agent,
			model: config.model,
		},
	});

	const {
		acpAdapter,
		settings,
		session,
		isSessionReady,
		messages,
		isSending,
		isUpdateAvailable,
		permission,
		mentions,
		autoMention,
		slashCommands,
		sessionHistory,
		activeAgentLabel,
		availableAgents,
		errorInfo,
		handleSendMessage,
		handleStopGeneration,
		handleNewChat,
		handleExportChat,
		handleSwitchAgent,
		handleRestartAgent,
		handleClearError,
		handleOpenHistory,
		handleSetMode,
		handleSetModel,
		inputValue,
		setInputValue,
		attachedImages,
		setAttachedImages,
		restoredMessage,
		handleRestoredMessageConsumed,
	} = controller;

	const acpClientRef = useRef(acpAdapter);

	// Mock View for ChatInput/ChatMessages
	const mockView = useMemo(() => {
		return {
			app: plugin.app,
			registerDomEvent: (
				target: EventTarget,
				type: string,
				callback: EventListenerOrEventListenerObject,
			) => {
				target.addEventListener(type, callback);
			},
		};
	}, [plugin.app]);

	// Code block image source
	const codeBlockImageSrc = useMemo(() => {
		const img = config.image;
		if (!img) return null;
		if (img.startsWith("http://") || img.startsWith("https://") || img.startsWith("data:")) {
			return img;
		}
		// Treat as local path
		interface VaultAdapterWithResourcePath {
			getResourcePath?: (path: string) => string;
		}
		return (plugin.app.vault.adapter as VaultAdapterWithResourcePath).getResourcePath?.(img);
	}, [config.image, plugin.app.vault.adapter]);


	// ============================================================
	// Render
	// ============================================================
	return (
		<div className="agent-client-code-block-container">
			{codeBlockImageSrc && (
				<div className="agent-client-code-block-image-container">
					<img
						src={codeBlockImageSrc}
						alt="Agent"
						className="agent-client-code-block-image"
					/>
				</div>
			)}

			<div className="agent-client-code-block-content">
				<InlineHeader
					variant="codeblock"
					agentLabel={activeAgentLabel}
					availableAgents={availableAgents}
					currentAgentId={session.agentId}
					isUpdateAvailable={isUpdateAvailable}
					canShowSessionHistory={sessionHistory.canShowSessionHistory}
					hasMessages={messages.length > 0}
					onAgentChange={(agentId) => void handleSwitchAgent(agentId)}
					onNewSession={() => void handleNewChat()}
					onOpenHistory={() => void handleOpenHistory()}
					onExportChat={() => void handleExportChat()}
					onRestartAgent={() => void handleRestartAgent()}
				/>
				{messages.length > 0 && (
					<div className="agent-client-code-block-messages">
						<ChatMessages
							messages={messages}
							isSending={isSending}
							isSessionReady={isSessionReady}
							isRestoringSession={sessionHistory.loading}
							agentLabel={activeAgentLabel}
							plugin={plugin}
							view={mockView as any}
							acpClient={acpClientRef.current}
							onApprovePermission={permission.approvePermission}
						/>
					</div>
				)}

				<ChatInput
					isSending={isSending}
					isSessionReady={isSessionReady}
					isRestoringSession={sessionHistory.loading}
					agentLabel={activeAgentLabel}
					availableCommands={session.availableCommands || []}
					autoMentionEnabled={settings.autoMentionActiveNote}
					restoredMessage={restoredMessage}
					mentions={mentions}
					slashCommands={slashCommands}
					autoMention={autoMention}
					plugin={plugin}
					view={mockView as any}
					onSendMessage={handleSendMessage}
					onStopGeneration={handleStopGeneration}
					onRestoredMessageConsumed={handleRestoredMessageConsumed}
					modes={session.modes}
					onModeChange={(modeId) => void handleSetMode(modeId)}
					models={session.models}
					onModelChange={(modelId) => void handleSetModel(modelId)}
					supportsImages={session.promptCapabilities?.image ?? false}
					agentId={session.agentId}
					inputValue={inputValue}
					onInputChange={setInputValue}
					attachedImages={attachedImages}
					onAttachedImagesChange={setAttachedImages}
					errorInfo={errorInfo}
					onClearError={handleClearError}
				/>			</div>
		</div>
	);
}

export function mountCodeBlockChat(
	plugin: AgentClientPlugin,
	el: HTMLElement,
	source: string,
) {
	let config: CodeBlockConfig = {};
	try {
		config = (parseYaml(source) as CodeBlockConfig) || {};
	} catch (e) {
		console.warn("Failed to parse code block YAML:", e);
	}

    const container = el.createDiv();
	const root = createRoot(container);
	root.render(
		<CodeBlockChatComponent plugin={plugin} config={config} el={el} />,
	);

	return root;
}
