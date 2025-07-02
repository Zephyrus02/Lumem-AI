"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Settings, Save, RotateCcw, Info } from "lucide-react";

interface ModelConfig {
  temperature: number;
  top_p: number;
  top_k: number;
  repeat_penalty: number;
  num_ctx: number;
  stop: string[];
}

interface ModelConfigFormProps {
  provider: string;
  model: string;
}

const defaultConfigs: Record<string, ModelConfig> = {
  ollama: {
    temperature: 0.7,
    top_p: 0.9,
    top_k: 40,
    repeat_penalty: 1.1,
    num_ctx: 2048,
    stop: [],
  },
  lmstudio: {
    temperature: 0.7,
    top_p: 0.9,
    top_k: 40,
    repeat_penalty: 1.1,
    num_ctx: 2048,
    stop: [],
  },
  openai: {
    temperature: 0.7,
    top_p: 0.9,
    top_k: 40,
    repeat_penalty: 1.1,
    num_ctx: 4096,
    stop: [],
  },
  anthropic: {
    temperature: 0.7,
    top_p: 0.9,
    top_k: 40,
    repeat_penalty: 1.1,
    num_ctx: 8192,
    stop: [],
  },
  google: {
    temperature: 0.7,
    top_p: 0.9,
    top_k: 40,
    repeat_penalty: 1.1,
    num_ctx: 2048,
    stop: [],
  },
};

const parameterInfo = {
  temperature:
    "Controls randomness in responses. Lower values (0.1-0.3) for focused/deterministic output, higher values (0.7-1.0) for creative/varied responses.",
  top_p:
    "Nucleus sampling. Only considers tokens with cumulative probability up to this value. Lower values focus on more likely tokens.",
  top_k:
    "Limits the model to consider only the top K most likely tokens at each step. Lower values make output more focused.",
  repeat_penalty:
    "Penalizes repetition in the output. Values > 1.0 reduce repetition, values < 1.0 encourage it.",
  num_ctx:
    "Context window size - how many tokens of conversation history to consider.",
  stop: "Sequences that will cause the model to stop generating. Enter one per line.",
};

export const ModelConfigForm = ({ provider, model }: ModelConfigFormProps) => {
  const [config, setConfig] = useState<ModelConfig>(
    defaultConfigs[provider] || defaultConfigs.ollama
  );
  const [stopSequencesText, setStopSequencesText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    // Load saved config for this model if it exists
    const savedConfig = localStorage.getItem(
      `model-config-${provider}-${model}`
    );
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setConfig(parsed);
        setStopSequencesText(parsed.stop.join("\n"));
      } catch (error) {
        console.error("Failed to load saved config:", error);
      }
    } else {
      // Use provider-specific defaults
      const defaultConfig = defaultConfigs[provider] || defaultConfigs.ollama;
      setConfig(defaultConfig);
      setStopSequencesText(defaultConfig.stop.join("\n"));
    }
  }, [provider, model]);

  const handleConfigChange = (
    key: keyof ModelConfig,
    value: number | string[]
  ) => {
    setConfig((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleStopSequencesChange = (text: string) => {
    setStopSequencesText(text);
    const sequences = text
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    handleConfigChange("stop", sequences);
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      // Save to localStorage (you could also save to backend)
      localStorage.setItem(
        `model-config-${provider}-${model}`,
        JSON.stringify(config)
      );

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSavedMessage("Configuration saved successfully!");
      setTimeout(() => setSavedMessage(""), 3000);
    } catch (error) {
      console.error("Failed to save config:", error);
      setSavedMessage("Failed to save configuration");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    const defaultConfig = defaultConfigs[provider] || defaultConfigs.ollama;
    setConfig(defaultConfig);
    setStopSequencesText(defaultConfig.stop.join("\n"));
    localStorage.removeItem(`model-config-${provider}-${model}`);
  };

  const ParameterInput = ({
    label,
    value,
    onChange,
    min,
    max,
    step,
    info,
  }: {
    label: string;
    value: number;
    onChange: (value: number) => void;
    min: number;
    max: number;
    step: number;
    info: string;
  }) => (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <label className="block text-sm font-medium text-neutral-300">
          {label}
        </label>
        <div className="group relative">
          <Info className="h-4 w-4 text-neutral-500 hover:text-neutral-300 transition-colors cursor-help" />
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black/95 border border-white/30 rounded-lg p-3 text-xs text-white/90 w-64 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-xl">
            {info}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black/95"></div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="custom-slider w-full h-2 bg-black/60 rounded-lg appearance-none cursor-pointer border border-white/10"
            style={{
              background: `linear-gradient(to right, 
                #6366f1 0%, 
                #6366f1 ${((value - min) / (max - min)) * 100}%, 
                rgba(0,0,0,0.6) ${((value - min) / (max - min)) * 100}%, 
                rgba(0,0,0,0.6) 100%)`,
            }}
          />
        </div>
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || min)}
          className="w-24 bg-black/70 border border-white/20 rounded-md px-3 py-2 text-white/90 text-sm
            focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
        />
      </div>
      <div className="flex justify-between text-xs text-neutral-500">
        <span>{min}</span>
        <span className="text-white/70 font-medium">{value}</span>
        <span>{max}</span>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full mx-auto relative"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.03] to-purple-500/[0.03] rounded-xl -z-10" />

      <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-white/10 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-400/20 flex items-center justify-center">
              <Settings className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                Model Configuration
              </h3>
              <p className="text-sm text-neutral-400">
                {provider.charAt(0).toUpperCase() + provider.slice(1)} - {model}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="px-3 py-1.5 text-sm border border-white/20 rounded-md hover:bg-white/5 transition-colors flex items-center gap-1 text-neutral-300 hover:text-white"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-3 py-1.5 text-sm bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 
                rounded-md transition-all duration-300 disabled:opacity-50 flex items-center gap-1 text-white font-medium"
            >
              <Save className="w-4 h-4" />
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>

        {savedMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-md text-green-400 text-sm"
          >
            {savedMessage}
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-8">
            <ParameterInput
              label="Temperature"
              value={config.temperature}
              onChange={(value) => handleConfigChange("temperature", value)}
              min={0}
              max={2}
              step={0.1}
              info={parameterInfo.temperature}
            />

            <ParameterInput
              label="Top P"
              value={config.top_p}
              onChange={(value) => handleConfigChange("top_p", value)}
              min={0}
              max={1}
              step={0.05}
              info={parameterInfo.top_p}
            />

            <ParameterInput
              label="Top K"
              value={config.top_k}
              onChange={(value) => handleConfigChange("top_k", value)}
              min={1}
              max={100}
              step={1}
              info={parameterInfo.top_k}
            />
          </div>

          <div className="space-y-8">
            <ParameterInput
              label="Repeat Penalty"
              value={config.repeat_penalty}
              onChange={(value) => handleConfigChange("repeat_penalty", value)}
              min={0.5}
              max={2}
              step={0.1}
              info={parameterInfo.repeat_penalty}
            />

            <ParameterInput
              label="Context Size"
              value={config.num_ctx}
              onChange={(value) => handleConfigChange("num_ctx", value)}
              min={512}
              max={8192}
              step={256}
              info={parameterInfo.num_ctx}
            />

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <label className="block text-sm font-medium text-neutral-300">
                  Stop Sequences
                </label>
                <div className="group relative">
                  <Info className="h-4 w-4 text-neutral-500 hover:text-neutral-300 transition-colors cursor-help" />
                  <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black/95 border border-white/30 rounded-lg p-3 text-xs text-white/90 w-64 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-xl">
                    {parameterInfo.stop}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black/95"></div>
                  </div>
                </div>
              </div>
              <textarea
                value={stopSequencesText}
                onChange={(e) => handleStopSequencesChange(e.target.value)}
                placeholder="Enter stop sequences (one per line)&#10;e.g.:&#10;Human:&#10;Assistant:&#10;###"
                className="w-full h-28 bg-black/70 border border-white/20 rounded-md px-3 py-2 text-white/90 text-sm
                  placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 resize-none transition-all"
              />
              {config.stop.length > 0 && (
                <p className="text-xs text-neutral-400">
                  {config.stop.length} stop sequence
                  {config.stop.length !== 1 ? "s" : ""} configured
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 p-4 bg-black/40 rounded-lg border border-white/10">
          <h4 className="text-sm font-medium text-white mb-3 flex items-center">
            <div className="w-2 h-2 bg-indigo-400 rounded-full mr-2"></div>
            Configuration Preview
          </h4>
          <pre className="text-xs text-white/70 overflow-x-auto font-mono bg-black/30 p-3 rounded border border-white/5">
            {JSON.stringify(config, null, 2)}
          </pre>
        </div>
      </div>

      <style>{`
        .custom-slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(45deg, #6366f1, #8b5cf6);
          cursor: pointer;
          border: 2px solid #1f2937;
          box-shadow: 0 2px 6px rgba(99, 102, 241, 0.3);
          transition: all 0.2s ease;
        }

        .custom-slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.5);
        }

        .custom-slider::-webkit-slider-thumb:active {
          transform: scale(0.95);
        }

        .custom-slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(45deg, #6366f1, #8b5cf6);
          cursor: pointer;
          border: 2px solid #1f2937;
          box-shadow: 0 2px 6px rgba(99, 102, 241, 0.3);
          transition: all 0.2s ease;
        }

        .custom-slider::-moz-range-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.5);
        }

        .custom-slider::-webkit-slider-track {
          height: 8px;
          border-radius: 4px;
          background: transparent;
        }

        .custom-slider::-moz-range-track {
          height: 8px;
          border-radius: 4px;
          background: transparent;
          border: none;
        }
      `}</style>
    </motion.div>
  );
};
