import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Cpu, Cloud, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { AvailableModel, Model, Provider } from "./types";

interface ModelSelectorProps {
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  selectedProvider: string;
  setSelectedProvider: (provider: string) => void;
}

const providers: Provider[] = [
  { id: "ollama", name: "Ollama", type: "local" },
  { id: "lmstudio", name: "LM Studio", type: "local" },
  { id: "openai", name: "OpenAI", type: "cloud" },
  { id: "anthropic", name: "Anthropic", type: "cloud" },
  { id: "google", name: "Google", type: "cloud" },
];

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModel,
  setSelectedModel,
  selectedProvider,
  setSelectedProvider,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [availableModels, setAvailableModels] = useState<AvailableModel[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [lastLoadTime, setLastLoadTime] = useState<number>(0);

  const loadAvailableModels = async (forceRefresh = false) => {
    const now = Date.now();
    if (!forceRefresh && now - lastLoadTime < 30000) {
      return;
    }

    setIsLoadingModels(true);
    const models: AvailableModel[] = [];

    try {
      if (
        typeof window !== "undefined" &&
        window.go &&
        window.go.main &&
        window.go.main.App
      ) {
        for (const provider of providers) {
          if (provider.type === "local") {
            try {
              const result = await window.go.main.App.ScanLocalModels(provider.id);
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
            }
          } else {
            const cloudModels = getCloudModels(provider.id);
            models.push(...cloudModels);
          }
        }
      } else {
        models.push(...getFallbackModels());
      }

      setAvailableModels(models);
      setLastLoadTime(now);
    } catch (error) {
      console.error("Error loading models:", error);
    } finally {
      setIsLoadingModels(false);
    }
  };

  const getCloudModels = (providerId: string): AvailableModel[] => {
    const cloudModels: Record<string, AvailableModel[]> = {
      openai: [
        { id: "gpt-4o", name: "GPT-4o", provider: "openai", providerName: "OpenAI" },
        { id: "gpt-4o-mini", name: "GPT-4o Mini", provider: "openai", providerName: "OpenAI" },
        { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", provider: "openai", providerName: "OpenAI" },
      ],
      anthropic: [
        { id: "claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet", provider: "anthropic", providerName: "Anthropic" },
        { id: "claude-3-haiku-20240307", name: "Claude 3 Haiku", provider: "anthropic", providerName: "Anthropic" },
      ],
      google: [
        { id: "gemini-2.0-flash-exp", name: "Gemini 2.0 Flash", provider: "google", providerName: "Google" },
        { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", provider: "google", providerName: "Google" },
      ],
    };
    return cloudModels[providerId] || [];
  };

  const getFallbackModels = (): AvailableModel[] => [
    { id: "llama3.2", name: "Llama 3.2", provider: "ollama", providerName: "Ollama" },
    { id: "codellama", name: "Code Llama", provider: "ollama", providerName: "Ollama" },
    { id: "mistral", name: "Mistral", provider: "ollama", providerName: "Ollama" },
  ];

  useEffect(() => {
    loadAvailableModels();
  }, []);

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
  const currentModel = availableModels.find((m) => m.id === selectedModel);
  const currentModelName = currentModel
    ? `${currentModel.name}${currentModel.size ? ` (${currentModel.size})` : ""}`
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
          <span className={cn("text-white/80", !selectedModel && "text-yellow-400")}>
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
              <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 mb-2">
                <span className="text-xs font-medium text-white/70 uppercase tracking-wider">
                  Available Models
                </span>
                <button
                  onClick={() => loadAvailableModels(true)}
                  disabled={isLoadingModels}
                  className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <RefreshCw className={`h-3 w-3 ${isLoadingModels ? "animate-spin" : ""}`} />
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
                  <div className="text-white/40 text-sm mb-2">No models found</div>
                  <div className="text-white/30 text-xs">
                    Make sure your local providers (Ollama, LM Studio) are running
                  </div>
                </div>
              ) : (
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
