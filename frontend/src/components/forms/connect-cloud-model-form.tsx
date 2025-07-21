"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ChevronDown,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react";

// Cloud model providers
const cloudProviders = [
  { id: "openai", name: "OpenAI" },
  { id: "anthropic", name: "Anthropic" },
  { id: "google", name: "Google" },
];

export const ConnectCloudModelsForm = () => {
  const [selectedProvider, setSelectedProvider] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [isTesting, setIsTesting] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  // Load existing API key when provider changes
  useEffect(() => {
    const loadKey = async () => {
      if (selectedProvider && window.go?.main?.App) {
        try {
          // @ts-ignore
          const existingKey = await window.go.main.App.GetAPIKey(
            selectedProvider
          );
          if (existingKey) {
            setApiKey(existingKey);
            setStatus({ type: "info", message: "Loaded existing API key." });
          } else {
            setApiKey(""); // Reset if no key is found for the new provider
          }
        } catch (error) {
          // This will error if no key is found, which is expected.
          setApiKey("");
          setStatus(null);
        }
      }
    };
    loadKey();
  }, [selectedProvider]);

  // Debounced save of API key
  useEffect(() => {
    if (!selectedProvider) return;

    const handler = setTimeout(() => {
      if (apiKey && window.go?.main?.App) {
        // @ts-ignore
        window.go.main.App.SaveAPIKey(selectedProvider, apiKey);
      }
    }, 500); // 500ms debounce

    return () => {
      clearTimeout(handler);
    };
  }, [apiKey, selectedProvider]);

  const handleProviderChange = (providerId: string) => {
    setSelectedProvider(providerId);
    setStatus(null); // Clear status on provider change
  };

  const handleTestConnection = async () => {
    if (!selectedProvider || !apiKey) return;
    setIsTesting(true);
    setStatus(null);
    try {
      // @ts-ignore
      const models = await window.go.main.App.ListCloudModels(
        selectedProvider,
        apiKey
      );
      // @ts-ignore
      setStatus({
        type: "success",
        message: `Connection successful! Found ${models.length} models.`,
      });
    } catch (error: any) {
      setStatus({
        type: "error",
        message:
          error.message || "Connection failed. Check API Key and provider.",
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mt-6 w-full md:w-6/6 lg:w-6/6 mx-auto relative"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/[0.03] to-indigo-500/[0.03] rounded-xl -z-10" />

      <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-white/10 p-6">
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-300">
              Cloud Provider
            </label>
            <div className="relative">
              <select
                value={selectedProvider}
                onChange={(e) => handleProviderChange(e.target.value)}
                className="w-full bg-black/60 border border-white/10 rounded-md px-3 py-2.5 text-white/80 
                  appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent
                  transition-all duration-200"
              >
                <option value="" disabled>
                  Select provider
                </option>
                {cloudProviders.map((provider) => (
                  <option key={provider.id} value={provider.id}>
                    {provider.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Choose your cloud AI provider.
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-300">
              API Key
            </label>
            <div className="relative">
              <input
                type={showApiKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your API key"
                disabled={!selectedProvider}
                className="w-full bg-black/60 border border-white/10 rounded-md px-3 py-2.5 text-white/80 pr-10
                  focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent
                  transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-200"
              >
                {showApiKey ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Your key is saved automatically as you type.
            </p>
          </div>

          <button
            onClick={handleTestConnection}
            disabled={!selectedProvider || !apiKey || isTesting}
            className="mt-4 w-full relative overflow-hidden group bg-gradient-to-r from-indigo-500 to-purple-600 
              hover:from-indigo-600 hover:to-purple-700 text-white font-medium py-2.5 px-4 rounded-md 
              transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none"
          >
            <div
              className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-400/0 via-white/20 to-purple-400/0 
              opacity-0 group-hover:opacity-100 transform translate-x-[-100%] group-hover:translate-x-[100%] 
              transition-all duration-1000"
            ></div>

            {isTesting ? (
              <span className="flex items-center justify-center">
                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                Testing Connection...
              </span>
            ) : (
              <span>Test Connection</span>
            )}
          </button>

          {status && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-4 text-sm p-3 rounded-md flex items-center gap-2 ${
                status.type === "success"
                  ? "bg-green-500/20 text-green-300 border border-green-500/30"
                  : status.type === "error"
                  ? "bg-red-500/20 text-red-300 border border-red-500/30"
                  : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
              }`}
            >
              {status.type === "success" && <CheckCircle className="h-5 w-5" />}
              {status.type === "error" && <XCircle className="h-5 w-5" />}
              {status.message}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
