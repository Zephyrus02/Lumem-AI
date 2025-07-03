"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Paperclip,
  MessageSquare,
  Bot,
  ArrowLeft,
} from "lucide-react";
import { ChatMessage } from "./chat/ChatMessage";
import { ModelSelector } from "./chat/ModelSelector";
import { FileAttachment } from "./chat/FileAttachment";
import { ElegantShape } from "./ElegantShape";
import { ChatSettings } from "./chat/ChatSettings";
import { ChatSidebar } from "./chat/ChatSidebar";
import { Message, AttachedFile, Conversation } from "./chat/types";

// Safe context hook that provides defaults
const useChatContextSafe = () => {
  try {
    const { useChatContext } = require("@/contexts/ChatContext");
    const context = useChatContext();

    return {
      selectedProvider: context.selectedProvider || "ollama",
      selectedModel: context.selectedModel || "",
      setSelectedModel: context.setSelectedModel,
      navigateToChat: context.navigateToChat,
    };
  } catch {
    return {
      selectedProvider: "ollama",
      selectedModel: "",
      setSelectedModel: () => {},
      navigateToChat: () => {},
    };
  }
};

// Sample conversations data
const sampleConversations: Conversation[] = [
  {
    id: "conv-1",
    title: "Code Optimization Help",
    messages: [
      {
        id: "msg-1",
        role: "user",
        content: "How can I optimize my React components to reduce rerenders?",
        timestamp: new Date(Date.now() - 86400000),
      },
    ],
    model: "gpt-4o",
    provider: "openai",
    createdAt: new Date(Date.now() - 86400000),
    updatedAt: new Date(Date.now() - 86400000),
  },
];

export function ChatPage() {
  const chatContext = useChatContextSafe();
  const { selectedProvider, selectedModel } = chatContext;

  // States
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>(sampleConversations);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [localSelectedProvider, setLocalSelectedProvider] = useState(selectedProvider || "ollama");
  const [localSelectedModel, setLocalSelectedModel] = useState(selectedModel || "");
  const [isSidebarVisible, setSidebarVisible] = useState(true);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);

  const messageEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update local state when context changes
  useEffect(() => {
    if (selectedProvider) setLocalSelectedProvider(selectedProvider);
    if (selectedModel) setLocalSelectedModel(selectedModel);
  }, [selectedProvider, selectedModel]);

  // Scroll to bottom of messages
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load conversation when active changes
  useEffect(() => {
    if (activeConversation) {
      const conversation = conversations.find((c) => c.id === activeConversation);
      if (conversation) {
        setMessages(conversation.messages);
        setLocalSelectedModel(conversation.model);
        setLocalSelectedProvider(conversation.provider);
      }
    } else {
      setMessages([]);
    }
  }, [activeConversation, conversations]);

  const handleSendMessage = async () => {
    if ((!inputMessage.trim() && attachedFiles.length === 0) || isGenerating) return;

    if (!localSelectedModel) {
      alert("Please select a model first from the dropdown above.");
      return;
    }

    const userMessage: Message = {
      id: `msg-${Date.now()}-user`,
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
      files: attachedFiles.length > 0 ? [...attachedFiles] : undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setAttachedFiles([]);
    setIsGenerating(true);

    try {
      let messageWithFiles = inputMessage;
      if (attachedFiles.length > 0) {
        const fileContents = attachedFiles
          .map((file) => {
            if (file.content) {
              return `\n\nFile: ${file.name}\nContent:\n${file.content}`;
            } else {
              return `\n\nFile: ${file.name} (${file.type})`;
            }
          })
          .join("");
        messageWithFiles += fileContents;
      }

      if (
        typeof window !== "undefined" &&
        window.go &&
        window.go.main &&
        window.go.main.App
      ) {
        const response = await window.go.main.App.ChatWithModel(
          localSelectedProvider,
          localSelectedModel,
          messageWithFiles
        );

        const assistantMessage: Message = {
          id: `msg-${Date.now()}-assistant`,
          role: "assistant",
          content: response,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        const assistantMessage: Message = {
          id: `msg-${Date.now()}-assistant`,
          role: "assistant",
          content: `This is a demo response from ${localSelectedProvider}/${localSelectedModel}. In a real implementation, this would connect to your configured model.`,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error("Error sending message:", error);

      let errorMessage = `Sorry, I encountered an error: ${error}`;

      if (String(error).includes("timeout") || String(error).includes("deadline exceeded")) {
        errorMessage += "\n\n💡 Suggestions:\n• Try using a smaller/faster model\n• Reduce the context size in model configuration\n• Restart Ollama: `ollama serve`\n• Check if your system has enough RAM";
      } else if (String(error).includes("connection refused")) {
        errorMessage += "\n\n💡 Please start Ollama first:\n• Run `ollama serve` in terminal\n• Make sure the model is pulled: `ollama pull " + localSelectedModel + "`";
      } else if (String(error).includes("model") && String(error).includes("not found")) {
        errorMessage += "\n\n💡 The model might not be available:\n• Run `ollama pull " + localSelectedModel + "` to download it\n• Check available models: `ollama list`";
      }

      const errorMsg: Message = {
        id: `msg-${Date.now()}-error`,
        role: "assistant",
        content: errorMessage,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsGenerating(false);
      messageInputRef.current?.focus();
    }
  };

  const removeAttachedFile = (fileId: string) => {
    setAttachedFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  const createNewConversation = () => {
    const newConversation: Conversation = {
      id: `conv-${Date.now()}`,
      title: "New Conversation",
      messages: [],
      model: localSelectedModel,
      provider: localSelectedProvider,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setConversations((prev) => [newConversation, ...prev]);
    setActiveConversation(newConversation.id);
    setMessages([]);
    setInputMessage("");
    setAttachedFiles([]);
    messageInputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const fileArray: AttachedFile[] = [];
    let filesProcessed = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();

      reader.onload = (e) => {
        const content = typeof e.target?.result === "string" ? e.target.result : undefined;

        fileArray.push({
          id: `${file.name}-${file.size}-${Date.now()}`,
          name: file.name,
          size: file.size,
          type: file.type,
          content,
        });

        filesProcessed++;
        if (filesProcessed === files.length) {
          setAttachedFiles((prev) => [...prev, ...fileArray]);
        }
      };

      if (file.type.startsWith("text/") || file.type === "application/json") {
        reader.readAsText(file);
      } else {
        fileArray.push({
          id: `${file.name}-${file.size}-${Date.now()}`,
          name: file.name,
          size: file.size,
          type: file.type,
        });
        filesProcessed++;
        if (filesProcessed === files.length) {
          setAttachedFiles((prev) => [...prev, ...fileArray]);
        }
      }
    }

    event.target.value = "";
  };

  const handleBackNavigation = () => {
    // Navigate back to home page
    if (typeof window !== "undefined") {
      window.history.back();
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col bg-[#030303] text-neutral-200 overflow-hidden">
      {/* Background gradients - matching hero page */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-rose-500/[0.05] blur-3xl" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-[#030303]/80 pointer-events-none" />

      {/* Decorative shapes - matching hero page */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <ElegantShape
          delay={0.3}
          width={600}
          height={140}
          rotate={12}
          gradient="from-indigo-500/[0.15]"
          className="left-[-10%] md:left-[-5%] top-[15%] md:top-[20%]"
        />
        <ElegantShape
          delay={0.5}
          width={500}
          height={120}
          rotate={-15}
          gradient="from-rose-500/[0.15]"
          className="right-[-5%] md:right-[0%] top-[70%] md:top-[75%]"
        />
        <ElegantShape
          delay={0.4}
          width={300}
          height={80}
          rotate={-8}
          gradient="from-violet-500/[0.15]"
          className="left-[5%] md:left-[10%] bottom-[5%] md:bottom-[10%]"
        />
        <ElegantShape
          delay={0.6}
          width={200}
          height={60}
          rotate={20}
          gradient="from-amber-500/[0.15]"
          className="right-[15%] md:right-[20%] top-[10%] md:top-[15%]"
        />
        <ElegantShape
          delay={0.7}
          width={150}
          height={40}
          rotate={-25}
          gradient="from-cyan-500/[0.15]"
          className="left-[20%] md:left-[25%] top-[5%] md:top-[10%]"
        />
      </div>

      <div className="flex-1 flex relative z-10 overflow-hidden">
        {/* Sidebar */}
        <ChatSidebar
          conversations={conversations}
          activeConversation={activeConversation}
          setActiveConversation={setActiveConversation}
          createNewConversation={createNewConversation}
          isSidebarVisible={isSidebarVisible}
        />

        {/* Main chat area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Chat header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/30 backdrop-blur-sm">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarVisible(!isSidebarVisible)}
                className="p-2 rounded-md hover:bg-white/10 mr-2 text-white/60 hover:text-white/80 transition-colors"
                title="Toggle Sidebar"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="14"
                  viewBox="0 0 18 14"
                  fill="none"
                  className="transition-transform"
                  style={{ transform: isSidebarVisible ? "none" : "scaleX(-1)" }}
                >
                  <path
                    d="M1 1H17M1 7H17M1 13H17"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>

              <ModelSelector
                selectedModel={localSelectedModel}
                setSelectedModel={setLocalSelectedModel}
                selectedProvider={localSelectedProvider}
                setSelectedProvider={setLocalSelectedProvider}
              />
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleBackNavigation}
                className="p-2 rounded-md text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                title="Back to Home"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>

              <button
                onClick={createNewConversation}
                className="p-2 rounded-md text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                title="New Chat"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M8 3.33334V12.6667M3.33333 8H12.6667"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              <ChatSettings />
            </div>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center mb-4">
                  <MessageSquare className="h-8 w-8 text-white/30" />
                </div>
                <h3 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-white/90 to-rose-300 mb-2">
                  Start a New Conversation
                </h3>
                <p className="text-white/50 max-w-sm mb-4">
                  Ask questions, get creative responses, or have a discussion with your selected AI model.
                </p>
                <div className="text-sm text-white/40 bg-black/20 rounded-lg p-3 border border-white/10">
                  <p className="font-medium mb-1">Currently selected:</p>
                  <p>{localSelectedProvider} - {localSelectedModel || "No model selected"}</p>
                  {!localSelectedModel && (
                    <p className="text-yellow-400 text-xs mt-2">
                      ⚠️ Please select a model from the dropdown above
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div>
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}

                {isGenerating && (
                  <div className="py-6 px-4 sm:px-6 border-b border-white/10 bg-black/20">
                    <div className="max-w-4xl mx-auto flex gap-4">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-8 h-8 rounded-md bg-gradient-to-br from-indigo-500/30 to-purple-500/30 border border-white/10 flex items-center justify-center">
                          <Bot className="h-4 w-4 text-white/70" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex space-x-2">
                          <div className="w-2 h-2 rounded-full bg-indigo-400/50 animate-pulse"></div>
                          <div
                            className="w-2 h-2 rounded-full bg-indigo-400/50 animate-pulse"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                          <div
                            className="w-2 h-2 rounded-full bg-indigo-400/50 animate-pulse"
                            style={{ animationDelay: "0.4s" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messageEndRef} />
              </div>
            )}
          </div>

          {/* Input area */}
          <div className="p-4 md:p-6 border-t border-white/10 bg-black/30 backdrop-blur-sm">
            <div className="max-w-4xl mx-auto">
              {attachedFiles.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {attachedFiles.map((file) => (
                    <FileAttachment
                      key={file.id}
                      file={file}
                      onRemove={() => removeAttachedFile(file.id)}
                    />
                  ))}
                </div>
              )}

              <div className="relative">
                <textarea
                  ref={messageInputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Send a message..."
                  rows={1}
                  className="w-full bg-black/30 border border-white/10 rounded-lg py-3 pl-4 pr-20 text-white/80 placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 resize-none"
                  style={{ minHeight: "56px", maxHeight: "200px" }}
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute right-12 bottom-3 p-1.5 rounded-md text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                  title="Attach file"
                >
                  <Paperclip className="h-4 w-4" />
                </button>

                <button
                  onClick={handleSendMessage}
                  disabled={(!inputMessage.trim() && attachedFiles.length === 0) || isGenerating}
                  className="absolute right-3 bottom-3 p-1.5 rounded-md bg-gradient-to-r from-indigo-500 to-purple-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                accept="*/*"
              />

              <div className="mt-2 text-xs text-white/40 text-center">
                {localSelectedModel} may produce inaccurate information. Press Enter to send, Shift+Enter for new line.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
