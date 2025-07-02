"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Send,
  ChevronDown,
  Settings,
  Bot,
  User,
  Cpu,
  Cloud,
  Check,
  Copy,
  MessageSquare,
  Paperclip,
  X,
  File,
  Image as ImageIcon,
  RefreshCw,
} from "lucide-react";
import { AppDock } from "./dock";

// Define types locally
type Message = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  files?: AttachedFile[];
};

type AttachedFile = {
  id: string;
  name: string;
  size: number;
  type: string;
  content?: string;
  url?: string;
};

type Conversation = {
  id: string;
  title: string;
  messages: Message[];
  model: string;
  provider: string;
  createdAt: Date;
  updatedAt: Date;
};

interface Model {
  name: string;
  size?: string;
  modified?: string;
}

interface AvailableModel {
  id: string;
  name: string;
  provider: string;
  providerName: string;
  size?: string;
}

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

// Provider list with their info
const providers = [
  { id: "ollama", name: "Ollama", type: "local" },
  { id: "lmstudio", name: "LM Studio", type: "local" },
  { id: "openai", name: "OpenAI", type: "cloud" },
  { id: "anthropic", name: "Anthropic", type: "cloud" },
  { id: "google", name: "Google", type: "cloud" },
];

// Elegant decorative shape component from hero
function ElegantShape({
  className,
  delay = 0,
  width = 400,
  height = 100,
  rotate = 0,
  gradient = "from-white/[0.08]",
}: {
  className?: string;
  delay?: number;
  width?: number;
  height?: number;
  rotate?: number;
  gradient?: string;
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: -150,
        rotate: rotate - 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
        rotate: rotate,
      }}
      transition={{
        duration: 2.4,
        delay,
        ease: [0.23, 0.86, 0.39, 0.96],
        opacity: { duration: 1.2 },
      }}
      className={cn("absolute", className)}
    >
      <motion.div
        animate={{
          y: [0, 15, 0],
        }}
        transition={{
          duration: 12,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        style={{
          width,
          height,
        }}
        className="relative"
      >
        <div
          className={cn(
            "absolute inset-0 rounded-full",
            "bg-gradient-to-r to-transparent",
            gradient,
            "backdrop-blur-[2px] border-2 border-white/[0.15]",
            "shadow-[0_8px_32px_0_rgba(255,255,255,0.1)]",
            "after:absolute after:inset-0 after:rounded-full",
            "after:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_70%)]"
          )}
        />
      </motion.div>
    </motion.div>
  );
}

// File attachment component
const FileAttachment = ({
  file,
  onRemove,
}: {
  file: AttachedFile;
  onRemove: () => void;
}) => {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="flex items-center gap-2 bg-black/30 border border-white/10 rounded-md p-2 max-w-xs">
      <div className="flex-shrink-0">
        {file.type.startsWith("image/") ? (
          <ImageIcon className="h-4 w-4 text-blue-400" />
        ) : (
          <File className="h-4 w-4 text-green-400" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-white/80 truncate">{file.name}</p>
        <p className="text-xs text-white/50">{formatFileSize(file.size)}</p>
      </div>
      <button
        onClick={onRemove}
        className="flex-shrink-0 p-1 hover:bg-white/10 rounded-sm transition-colors"
      >
        <X className="h-3 w-3 text-white/60 hover:text-white/80" />
      </button>
    </div>
  );
};

// Individual message component
const ChatMessage = ({ message }: { message: Message }) => {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "py-6 px-4 sm:px-6 border-b border-white/10",
        message.role === "assistant" ? "bg-black/20" : ""
      )}
    >
      <div className="max-w-4xl mx-auto flex gap-4">
        <div className="flex-shrink-0 mt-1">
          {message.role === "user" ? (
            <div className="w-8 h-8 rounded-md bg-gradient-to-br from-indigo-500/30 to-purple-500/30 border border-white/10 flex items-center justify-center">
              <User className="h-4 w-4 text-white/70" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-md bg-gradient-to-br from-indigo-500/30 to-purple-500/30 border border-white/10 flex items-center justify-center">
              <Bot className="h-4 w-4 text-white/70" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Show attached files */}
          {message.files && message.files.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {message.files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-2 bg-black/20 border border-white/5 rounded-md p-2"
                >
                  {file.type.startsWith("image/") ? (
                    <ImageIcon className="h-4 w-4 text-blue-400" />
                  ) : (
                    <File className="h-4 w-4 text-green-400" />
                  )}
                  <span className="text-xs text-white/60">{file.name}</span>
                </div>
              ))}
            </div>
          )}

          <div className="prose prose-invert max-w-none mb-2 prose-p:text-white/80 prose-pre:bg-black/40 prose-pre:border prose-pre:border-white/10 prose-pre:rounded-md">
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>

          {message.role === "assistant" && (
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={copyToClipboard}
                className={`text-xs flex items-center gap-1 px-2 py-1 rounded-md transition-colors ${
                  isCopied
                    ? "bg-emerald-500/20 text-emerald-300"
                    : "hover:bg-white/10 text-neutral-400 hover:text-white"
                }`}
              >
                {isCopied ? (
                  <>
                    <Check className="h-3 w-3" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Updated Model selector component with dynamic loading
const ModelSelector = ({
  selectedModel,
  setSelectedModel,
  selectedProvider,
  setSelectedProvider,
}: {
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  selectedProvider: string;
  setSelectedProvider: (provider: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [availableModels, setAvailableModels] = useState<AvailableModel[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [lastLoadTime, setLastLoadTime] = useState<number>(0);

  // Load models when component mounts or when requested
  const loadAvailableModels = async (forceRefresh = false) => {
    // Prevent too frequent API calls
    const now = Date.now();
    if (!forceRefresh && now - lastLoadTime < 30000) {
      // 30 seconds cache
      return;
    }

    setIsLoadingModels(true);
    const models: AvailableModel[] = [];

    try {
      // Check if Wails is available
      if (
        typeof window !== "undefined" &&
        window.go &&
        window.go.main &&
        window.go.main.App
      ) {
        // Load models from all providers
        for (const provider of providers) {
          if (provider.type === "local") {
            try {
              const result = await window.go.main.App.ScanLocalModels(
                provider.id
              );
              if (result.success && result.models) {
                result.models.forEach((model: Model) => {
                  models.push({
                    id: model.name,
                    name: model.name,
                    provider: provider.id,
                    providerName: provider.name,
                    size: model.size,
                  });
                });
              }
            } catch (error) {
              console.log(`Failed to load models for ${provider.name}:`, error);
              // Continue with other providers
            }
          } else {
            // For cloud providers, add some common models
            const cloudModels = getCloudModels(provider.id);
            models.push(...cloudModels);
          }
        }
      } else {
        // Fallback models for development
        models.push(...getFallbackModels());
      }

      setAvailableModels(models);
      setLastLoadTime(now);
      console.log(`Loaded ${models.length} models from all providers`);
    } catch (error) {
      console.error("Error loading models:", error);
    } finally {
      setIsLoadingModels(false);
    }
  };

  // Get cloud models based on provider
  const getCloudModels = (providerId: string): AvailableModel[] => {
    const cloudModels: Record<string, AvailableModel[]> = {
      openai: [
        {
          id: "gpt-4o",
          name: "GPT-4o",
          provider: "openai",
          providerName: "OpenAI",
        },
        {
          id: "gpt-4o-mini",
          name: "GPT-4o Mini",
          provider: "openai",
          providerName: "OpenAI",
        },
        {
          id: "gpt-3.5-turbo",
          name: "GPT-3.5 Turbo",
          provider: "openai",
          providerName: "OpenAI",
        },
      ],
      anthropic: [
        {
          id: "claude-3-5-sonnet-20241022",
          name: "Claude 3.5 Sonnet",
          provider: "anthropic",
          providerName: "Anthropic",
        },
        {
          id: "claude-3-haiku-20240307",
          name: "Claude 3 Haiku",
          provider: "anthropic",
          providerName: "Anthropic",
        },
      ],
      google: [
        {
          id: "gemini-2.0-flash-exp",
          name: "Gemini 2.0 Flash",
          provider: "google",
          providerName: "Google",
        },
        {
          id: "gemini-1.5-pro",
          name: "Gemini 1.5 Pro",
          provider: "google",
          providerName: "Google",
        },
      ],
    };
    return cloudModels[providerId] || [];
  };

  // Fallback models for development
  const getFallbackModels = (): AvailableModel[] => [
    {
      id: "llama3.2",
      name: "Llama 3.2",
      provider: "ollama",
      providerName: "Ollama",
    },
    {
      id: "codellama",
      name: "Code Llama",
      provider: "ollama",
      providerName: "Ollama",
    },
    {
      id: "mistral",
      name: "Mistral",
      provider: "ollama",
      providerName: "Ollama",
    },
  ];

  // Load models on component mount
  useEffect(() => {
    loadAvailableModels();
  }, []);

  // Organize models by provider
  const modelsByProvider = availableModels.reduce((acc, model) => {
    if (!acc[model.provider]) {
      acc[model.provider] = {
        id: model.provider,
        name: model.providerName,
        models: [],
      };
    }
    acc[model.provider].models.push(model);
    return acc;
  }, {} as Record<string, { id: string; name: string; models: AvailableModel[] }>);

  const organizedProviders = Object.values(modelsByProvider);

  // Find current model info
  const currentModel = availableModels.find((m) => m.id === selectedModel);
  const currentModelName = currentModel
    ? `${currentModel.name}${
        currentModel.size ? ` (${currentModel.size})` : ""
      }`
    : selectedModel || "Select a model";

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 rounded-full pl-3 pr-2 py-1.5 bg-black/30 backdrop-blur-sm border border-white/10 hover:bg-black/40 transition-colors text-sm",
          !selectedModel && "border-yellow-400/50 bg-yellow-400/5"
        )}
      >
        <span className="flex items-center gap-1.5">
          {selectedProvider === "openai" ||
          selectedProvider === "anthropic" ||
          selectedProvider === "google" ? (
            <Cloud className="h-3.5 w-3.5 text-purple-400" />
          ) : (
            <Cpu className="h-3.5 w-3.5 text-indigo-400" />
          )}
          <span
            className={cn("text-white/80", !selectedModel && "text-yellow-400")}
          >
            {currentModelName}
          </span>
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-white/60" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 mt-2 w-80 rounded-lg border border-white/10 bg-black/80 backdrop-blur-xl shadow-xl z-50"
          >
            <div className="p-2 max-h-96 overflow-y-auto">
              {/* Header with refresh button */}
              <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 mb-2">
                <span className="text-xs font-medium text-white/70 uppercase tracking-wider">
                  Available Models
                </span>
                <button
                  onClick={() => loadAvailableModels(true)}
                  disabled={isLoadingModels}
                  className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <RefreshCw
                    className={`h-3 w-3 ${
                      isLoadingModels ? "animate-spin" : ""
                    }`}
                  />
                  Refresh
                </button>
              </div>

              {isLoadingModels ? (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center gap-2 text-white/60">
                    <div className="animate-spin h-4 w-4 border border-indigo-400 border-t-transparent rounded-full"></div>
                    <span className="text-sm">Loading models...</span>
                  </div>
                </div>
              ) : organizedProviders.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-white/40 text-sm mb-2">
                    No models found
                  </div>
                  <div className="text-white/30 text-xs">
                    Make sure your local providers (Ollama, LM Studio) are
                    running
                  </div>
                </div>
              ) : (
                /* Group by provider */
                organizedProviders.map((provider) => (
                  <div key={provider.id} className="mb-2">
                    <div className="px-3 py-1.5 text-xs font-medium text-white/50 uppercase tracking-wider">
                      {provider.name} ({provider.models.length})
                    </div>

                    {provider.models.map((model) => (
                      <button
                        key={`${model.provider}-${model.id}`}
                        onClick={() => {
                          setSelectedProvider(model.provider);
                          setSelectedModel(model.id);
                          setIsOpen(false);
                          console.log(
                            `Selected model: ${model.provider}/${model.id}`
                          );
                        }}
                        className={cn(
                          "w-full text-left px-3 py-2 text-sm rounded-md flex items-center justify-between gap-2",
                          selectedModel === model.id
                            ? "bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-white"
                            : "hover:bg-white/5 text-white/70"
                        )}
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {model.provider === "openai" ||
                          model.provider === "anthropic" ||
                          model.provider === "google" ? (
                            <Cloud className="h-3.5 w-3.5 text-purple-400 flex-shrink-0" />
                          ) : (
                            <Cpu className="h-3.5 w-3.5 text-indigo-400 flex-shrink-0" />
                          )}
                          <span className="truncate">{model.name}</span>
                        </div>
                        {model.size && (
                          <span className="text-xs text-white/40 flex-shrink-0">
                            {model.size}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                ))
              )}

              {/* Footer note */}
              <div className="px-3 py-2 text-xs text-white/40 border-t border-white/10 mt-2">
                💡 Local models require Ollama or LM Studio to be running
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Chat settings menu
const ChatSettings = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-md text-white/60 hover:text-white hover:bg-white/10 transition-colors"
      >
        <Settings className="h-5 w-5" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-72 rounded-lg border border-white/10 bg-black/80 backdrop-blur-xl shadow-xl z-50"
          >
            <div className="p-4">
              <h3 className="text-sm font-medium text-white/90 mb-3">
                Chat Settings
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-white/60 mb-1.5">
                    Temperature
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    defaultValue="0.7"
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <div className="flex justify-between text-xs text-white/40 mt-1">
                    <span>Precise</span>
                    <span>Creative</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-white/60 mb-1.5">
                    Maximum Length
                  </label>
                  <select className="w-full bg-black/60 text-white/80 text-sm rounded-md border border-white/10 px-3 py-1.5 appearance-none focus:outline-none focus:ring-1 focus:ring-indigo-500/50">
                    <option>1,000 tokens</option>
                    <option>2,000 tokens</option>
                    <option selected>4,000 tokens</option>
                    <option>8,000 tokens</option>
                  </select>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <label className="text-xs text-white/60">
                    Save Chat History
                  </label>
                  <div className="relative inline-block w-10 align-middle select-none transition duration-200 ease-in">
                    <input
                      type="checkbox"
                      name="save-history"
                      id="save-history"
                      defaultChecked
                      className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 border-gray-300 appearance-none cursor-pointer"
                    />
                    <label
                      htmlFor="save-history"
                      className="toggle-label block overflow-hidden h-5 rounded-full bg-gray-300 cursor-pointer"
                    ></label>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Main Chat component
export function ChatPage() {
  const chatContext = useChatContextSafe();
  const { selectedProvider, selectedModel } = chatContext;

  // States
  const [activeConversation, setActiveConversation] = useState<string | null>(
    null
  );
  const [conversations, setConversations] =
    useState<Conversation[]>(sampleConversations);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Initialize with context values or use defaults
  const [localSelectedProvider, setLocalSelectedProvider] = useState(
    selectedProvider || "ollama"
  );
  const [localSelectedModel, setLocalSelectedModel] = useState(
    selectedModel || ""
  );

  const [isSidebarVisible, setSidebarVisible] = useState(true);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [isDockVisible, setIsDockVisible] = useState(false);

  const messageEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update local state when context changes
  useEffect(() => {
    if (selectedProvider) {
      setLocalSelectedProvider(selectedProvider);
    }
    if (selectedModel) {
      setLocalSelectedModel(selectedModel);
    }
  }, [selectedProvider, selectedModel]);

  // Set a default model if none is selected
  useEffect(() => {
    if (!localSelectedModel && localSelectedProvider === "ollama") {
      // Don't set a default - let the user select
      console.log("No model selected. User needs to select a model first.");
    }
  }, [localSelectedModel, localSelectedProvider]);

  // Scroll to bottom of messages
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load conversation when active changes
  useEffect(() => {
    if (activeConversation) {
      const conversation = conversations.find(
        (c) => c.id === activeConversation
      );
      if (conversation) {
        setMessages(conversation.messages);
        setLocalSelectedModel(conversation.model);
        setLocalSelectedProvider(conversation.provider);
      }
    } else {
      setMessages([]);
    }
  }, [activeConversation, conversations]);

  // Setup mouse position tracking for dock
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const threshold = 50;
      const bottomPosition = window.innerHeight - e.clientY;
      setIsDockVisible(bottomPosition < threshold);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Send message handler
  const handleSendMessage = async () => {
    if ((!inputMessage.trim() && attachedFiles.length === 0) || isGenerating)
      return;

    // Check if we have a model selected
    if (!localSelectedModel) {
      alert("Please select a model first from the dropdown above.");
      return;
    }

    // Create new user message
    const userMessage: Message = {
      id: `msg-${Date.now()}-user`,
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
      files: attachedFiles.length > 0 ? [...attachedFiles] : undefined,
    };

    // Add user message to chat
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setAttachedFiles([]);
    setIsGenerating(true);

    try {
      // Prepare the message with file content for the backend
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

      console.log(
        `Sending message to ${localSelectedProvider}/${localSelectedModel}`
      );

      // Check if Wails is available
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

        // Create new assistant message
        const assistantMessage: Message = {
          id: `msg-${Date.now()}-assistant`,
          role: "assistant",
          content: response,
          timestamp: new Date(),
        };

        // Add assistant message to chat
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        // Fallback for development/testing
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

      // Provide specific suggestions based on error type
      if (
        String(error).includes("timeout") ||
        String(error).includes("deadline exceeded")
      ) {
        errorMessage +=
          "\n\n💡 Suggestions:\n" +
          "• Try using a smaller/faster model\n" +
          "• Reduce the context size in model configuration\n" +
          "• Restart Ollama: `ollama serve`\n" +
          "• Check if your system has enough RAM";
      } else if (String(error).includes("connection refused")) {
        errorMessage +=
          "\n\n💡 Please start Ollama first:\n" +
          "• Run `ollama serve` in terminal\n" +
          "• Make sure the model is pulled: `ollama pull " +
          localSelectedModel +
          "`";
      } else if (
        String(error).includes("model") &&
        String(error).includes("not found")
      ) {
        errorMessage +=
          "\n\n💡 The model might not be available:\n" +
          "• Run `ollama pull " +
          localSelectedModel +
          "` to download it\n" +
          "• Check available models: `ollama list`";
      }

      // Create error message
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

  // Remove an attached file by id
  const removeAttachedFile = (fileId: string) => {
    setAttachedFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  // Create new conversation
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

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>): void {
    const files = event.target.files;
    if (!files) return;

    const fileArray: AttachedFile[] = [];
    let filesProcessed = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();

      reader.onload = (e) => {
        const content =
          typeof e.target?.result === "string" ? e.target.result : undefined;

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

      // Only read as text for text files, otherwise skip content
      if (file.type.startsWith("text/") || file.type === "application/json") {
        reader.readAsText(file);
      } else {
        // For non-text files, just add metadata (no content)
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

    // Reset the input so the same file can be selected again if needed
    event.target.value = "";
  }
  return (
    <div className="relative min-h-screen w-full flex flex-col bg-[#030303] text-neutral-200 overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-purple-500/[0.05] blur-3xl" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-[#030303]/80 pointer-events-none" />

      {/* Decorative shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <ElegantShape
          delay={0.3}
          width={600}
          height={140}
          rotate={12}
          gradient="from-indigo-500/[0.08]"
          className="left-[-10%] md:left-[-5%] top-[10%] md:top-[15%]"
        />
        <ElegantShape
          delay={0.5}
          width={400}
          height={100}
          rotate={-15}
          gradient="from-purple-500/[0.08]"
          className="right-[-5%] md:right-[0%] top-[70%] md:top-[75%]"
        />
        <ElegantShape
          delay={0.4}
          width={200}
          height={60}
          rotate={-8}
          gradient="from-violet-500/[0.08]"
          className="left-[5%] md:left-[10%] bottom-[20%] md:bottom-[25%]"
        />
      </div>

      <div className="flex-1 flex relative z-10 overflow-hidden">
        {/* Sidebar with conversation history */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{
            x: isSidebarVisible ? 0 : -280,
            opacity: isSidebarVisible ? 1 : 0,
            width: isSidebarVisible ? "280px" : "0px",
          }}
          transition={{ duration: 0.3 }}
          className="h-full border-r border-white/10 bg-black/20 backdrop-blur-md flex flex-col"
        >
          <div className="p-4 border-b border-white/10 flex items-center">
            <MessageSquare className="h-5 w-5 mr-2 text-indigo-400" />
            <h2 className="font-semibold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-white/90 to-purple-300">
              Chat History
            </h2>
          </div>

          {/* New chat button */}
          <div className="p-3">
            <button
              onClick={createNewConversation}
              className="w-full py-2 px-3 rounded-md border border-white/10 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 hover:from-indigo-500/20 hover:to-purple-500/20 text-white/80 flex items-center justify-center gap-2 transition-all duration-200"
            >
              <span className="text-sm">New Chat</span>
            </button>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto">
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => setActiveConversation(conversation.id)}
                className={cn(
                  "w-full text-left p-3 border-b border-white/5 hover:bg-white/5 transition-colors",
                  activeConversation === conversation.id
                    ? "bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-l-2 border-indigo-500/50"
                    : ""
                )}
              >
                <div className="flex items-start">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-white/80 truncate">
                      {conversation.title}
                    </h3>
                    <p className="text-xs text-white/40 mt-1 truncate">
                      {
                        conversation.messages[conversation.messages.length - 1]
                          .content
                      }
                    </p>
                    <div className="flex items-center mt-2">
                      <span className="text-xs text-white/30">
                        {new Date(conversation.updatedAt).toLocaleDateString()}
                      </span>
                      <span className="mx-1 text-white/20">·</span>
                      <span className="text-xs bg-white/10 px-1.5 py-0.5 rounded text-white/40">
                        {conversation.model}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Main chat area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Chat header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/30 backdrop-blur-sm">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarVisible(!isSidebarVisible)}
                className="p-2 rounded-md hover:bg-white/10 mr-2 text-white/60 hover:text-white/80 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="14"
                  viewBox="0 0 18 14"
                  fill="none"
                  className="transition-transform"
                  style={{
                    transform: isSidebarVisible ? "none" : "scaleX(-1)",
                  }}
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

            <div className="flex items-center">
              <button
                onClick={createNewConversation}
                className="p-2 rounded-md text-white/60 hover:text-white hover:bg-white/10 transition-colors mr-1"
                title="New Chat"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
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
                <h3 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-white/90 to-purple-300 mb-2">
                  Start a New Conversation
                </h3>
                <p className="text-white/50 max-w-sm mb-4">
                  Ask questions, get creative responses, or have a discussion
                  with your selected AI model.
                </p>
                <div className="text-sm text-white/40 bg-black/20 rounded-lg p-3 border border-white/10">
                  <p className="font-medium mb-1">Currently selected:</p>
                  <p>
                    {localSelectedProvider} -{" "}
                    {localSelectedModel || "No model selected"}
                  </p>
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
              {/* File attachments display */}
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
                  style={{
                    minHeight: "56px",
                    maxHeight: "200px",
                  }}
                />

                {/* File attachment button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute right-12 bottom-3 p-1.5 rounded-md text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                  title="Attach file"
                >
                  <Paperclip className="h-4 w-4" />
                </button>

                {/* Send button */}
                <button
                  onClick={handleSendMessage}
                  disabled={
                    (!inputMessage.trim() && attachedFiles.length === 0) ||
                    isGenerating
                  }
                  className="absolute right-3 bottom-3 p-1.5 rounded-md bg-gradient-to-r from-indigo-500 to-purple-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                accept="*/*"
              />

              <div className="mt-2 text-xs text-white/40 text-center">
                {localSelectedModel} may produce inaccurate information. Press
                Enter to send, Shift+Enter for new line.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dock glow indicator - only visible when dock is hidden */}
      <motion.div
        className="absolute left-0 right-0 h-[3px] mx-auto w-100 bg-gradient-to-r from-transparent via-white/70 to-transparent rounded-full z-40"
        initial={{ opacity: 0, bottom: 0 }}
        animate={{
          opacity: isDockVisible ? 0 : 1,
          bottom: isDockVisible ? 0 : 4,
        }}
        transition={{
          opacity: { duration: 0.2 },
          bottom: { duration: 0.2 },
        }}
        style={{
          boxShadow: "0 0 8px 2px rgba(255, 255, 255, 0.2)",
          filter: "blur(1px)",
        }}
      />

      {/* Updated dock with macOS-like behavior */}
      <motion.div
        className="absolute left-0 right-0 z-50"
        initial={{ bottom: -100 }}
        animate={{ bottom: isDockVisible ? 8 : -100 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
          mass: 1,
        }}
      >
        <AppDock />
      </motion.div>
    </div>
  );
}
