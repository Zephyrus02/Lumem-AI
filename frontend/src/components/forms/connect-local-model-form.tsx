"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ChevronDown,
  AlertCircle,
  RefreshCw,
  Settings,
  MessageSquare,
} from "lucide-react";

// Local model providers with their default endpoints
const localProviders = [
  {
    id: "ollama",
    name: "Ollama",
    defaultEndpoint: "http://localhost:11434",
    apiPath: "/api/tags",
  },
  {
    id: "lmstudio",
    name: "LM Studio",
    defaultEndpoint: "http://localhost:1234",
    apiPath: "/v1/models",
  },
  {
    id: "huggingface",
    name: "Hugging Face Transformers",
    defaultEndpoint: "http://localhost:8000",
    apiPath: "/models",
  },
];

interface Model {
  name: string;
  size?: string;
  modified?: string;
}

interface ScanResult {
  models: Model[];
  error?: string;
  success: boolean;
  isLoading?: boolean;
}

interface ConnectLocalModelsFormProps {
  onModelConnected?: (provider: string, model: string) => void;
  onChatWithModel?: (provider: string, model: string) => void;
}

export const ConnectLocalModelsForm = ({
  onModelConnected,
  onChatWithModel,
}: ConnectLocalModelsFormProps) => {
  const [selectedProvider, setSelectedProvider] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isStartingChat, setIsStartingChat] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult>({
    models: [],
    success: false,
    isLoading: false,
  });

  // Scan for models when provider changes
  useEffect(() => {
    if (selectedProvider) {
      scanForModels();
    }
  }, [selectedProvider]);

  const scanForModels = async () => {
    if (!selectedProvider) return;

    setScanResult({ models: [], success: false, isLoading: true });
    setSelectedModel("");

    try {
      // Call the backend Go function with just the provider
      const result = await window.go.main.App.ScanLocalModels(selectedProvider);

      setScanResult({
        models: result.models || [],
        error: result.error,
        success: result.success,
        isLoading: false,
      });
    } catch (error) {
      console.error("Error scanning models:", error);
      setScanResult({
        models: [],
        error: `Failed to scan for models: ${error}`,
        success: false,
        isLoading: false,
      });
    }
  };

  const handleConfigureModel = () => {
    setIsConnecting(true);
    // Simulate connection process
    setTimeout(() => {
      setIsConnecting(false);
      console.log("Configuring:", {
        selectedProvider,
        selectedModel,
      });

      // Navigate to configure tab and pass the connected model info
      if (onModelConnected) {
        onModelConnected(selectedProvider, selectedModel);
      }
    }, 1500);
  };

  const handleChatWithModel = () => {
    setIsStartingChat(true);
    // Simulate starting chat process
    setTimeout(() => {
      setIsStartingChat(false);
      console.log("Starting chat with:", {
        selectedProvider,
        selectedModel,
      });

      // Navigate to chat interface
      if (onChatWithModel) {
        onChatWithModel(selectedProvider, selectedModel);
      }
    }, 1000);
  };

  const handleRefreshModels = () => {
    scanForModels();
  };

  const isButtonDisabled =
    !selectedProvider || !selectedModel || scanResult.isLoading;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mt-6 w-full md:w-6/6 lg:w-6/6 mx-auto relative"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.03] to-purple-500/[0.03] rounded-xl -z-10" />

      <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-white/10 p-6">
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-300">
              Local Provider
            </label>
            <div className="relative">
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                className="w-full bg-black/60 border border-white/10 rounded-md px-3 py-2.5 text-white/80 
                  appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent
                  transition-all duration-200"
              >
                <option value="" disabled>
                  Select provider
                </option>
                {localProviders.map((provider) => (
                  <option key={provider.id} value={provider.id}>
                    {provider.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Choose your local LLM provider
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-neutral-300">
                Available Models
              </label>
              {selectedProvider && (
                <button
                  onClick={handleRefreshModels}
                  disabled={scanResult.isLoading}
                  className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 
                    disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <RefreshCw
                    className={`h-3 w-3 ${
                      scanResult.isLoading ? "animate-spin" : ""
                    }`}
                  />
                  Refresh
                </button>
              )}
            </div>

            <div className="relative">
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                disabled={
                  !selectedProvider ||
                  scanResult.isLoading ||
                  scanResult.models.length === 0
                }
                className="w-full bg-black/60 border border-white/10 rounded-md px-3 py-2.5 text-white/80 
                  appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent
                  disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {scanResult.isLoading ? (
                  <option value="" disabled>
                    Scanning for models...
                  </option>
                ) : scanResult.error ? (
                  <option value="" disabled>
                    Error scanning models
                  </option>
                ) : scanResult.models.length === 0 && selectedProvider ? (
                  <option value="" disabled>
                    No models available locally
                  </option>
                ) : (
                  <>
                    <option value="" disabled>
                      Select model
                    </option>
                    {scanResult.models.map((model) => (
                      <option key={model.name} value={model.name}>
                        {model.name} {model.size && `(${model.size})`}
                      </option>
                    ))}
                  </>
                )}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
            </div>

            {scanResult.isLoading && (
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <div className="animate-spin h-3 w-3 border border-neutral-400 border-t-transparent rounded-full"></div>
                Scanning for locally available models...
              </div>
            )}

            {scanResult.error && (
              <div className="flex items-start gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-md p-2">
                <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                <span>{scanResult.error}</span>
              </div>
            )}

            {!scanResult.isLoading &&
              !scanResult.error &&
              scanResult.models.length === 0 &&
              selectedProvider && (
                <div className="flex items-center gap-2 text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded-md p-2">
                  <AlertCircle className="h-3 w-3" />
                  No models found. Make sure {selectedProvider} is running and
                  has models installed.
                </div>
              )}

            {scanResult.models.length > 0 && (
              <p className="text-xs text-neutral-500 mt-1">
                Found {scanResult.models.length} model
                {scanResult.models.length !== 1 ? "s" : ""} available locally
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleConfigureModel}
              disabled={isButtonDisabled || isConnecting}
              className="flex-1 relative overflow-hidden group bg-gradient-to-r from-indigo-500 to-purple-600 
                hover:from-indigo-600 hover:to-purple-700 text-white font-medium py-2.5 px-4 rounded-md 
                transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none"
            >
              <div
                className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-400/0 via-white/20 to-indigo-400/0 
                opacity-0 group-hover:opacity-100 transform translate-x-[-100%] group-hover:translate-x-[100%] 
                transition-all duration-1000"
              ></div>

              {isConnecting ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Connecting...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <Settings className="w-4 h-4 mr-2" />
                  Configure Model
                </span>
              )}
            </button>

            <button
              onClick={handleChatWithModel}
              disabled={isButtonDisabled || isStartingChat}
              className="flex-1 relative overflow-hidden group bg-gradient-to-r from-emerald-500 to-teal-600 
                hover:from-emerald-600 hover:to-teal-700 text-white font-medium py-2.5 px-4 rounded-md 
                transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none"
            >
              <div
                className="absolute inset-0 w-full h-full bg-gradient-to-r from-emerald-400/0 via-white/20 to-emerald-400/0 
                opacity-0 group-hover:opacity-100 transform translate-x-[-100%] group-hover:translate-x-[100%] 
                transition-all duration-1000"
              ></div>

              {isStartingChat ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Starting Chat...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Chat with Model
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
