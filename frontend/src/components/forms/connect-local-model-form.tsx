'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

// Local model providers and their models
const localProviders = [
  { id: 'ollama', name: 'Ollama', models: ['llama2', 'llama3', 'mistral', 'vicuna', 'orca-mini'] },
  { id: 'localai', name: 'LocalAI', models: ['phi-2', 'tinyllama', 'gemma', 'neural-chat'] },
  { id: 'text-generation-webui', name: 'Text Generation WebUI', models: ['llama2', 'llama3', 'mistral', 'falcon'] },
];

export const ConnectLocalModelsForm = () => {
  const [selectedProvider, setSelectedProvider] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [endpoint, setEndpoint] = useState('http://localhost:11434');
  const [isConnecting, setIsConnecting] = useState(false);

  const models = localProviders.find(p => p.id === selectedProvider)?.models || [];

  const handleConnect = () => {
    setIsConnecting(true);
    // Simulate connection process
    setTimeout(() => {
      setIsConnecting(false);
    }, 1500);
  };

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
            <label className="block text-sm font-medium text-neutral-300">Local Provider</label>
            <div className="relative">
              <select 
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                className="w-full bg-black/60 border border-white/10 rounded-md px-3 py-2.5 text-white/80 
                  appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent
                  transition-all duration-200"
              >
                <option value="" disabled>Select provider</option>
                {localProviders.map(provider => (
                  <option key={provider.id} value={provider.id}>{provider.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
            </div>
            <p className="text-xs text-neutral-500 mt-1">Choose your local LLM provider</p>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-300">Model</label>
            <div className="relative">
              <select 
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                disabled={!selectedProvider}
                className="w-full bg-black/60 border border-white/10 rounded-md px-3 py-2.5 text-white/80 
                  appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent
                  disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <option value="" disabled>Select model</option>
                {models.map(model => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
            </div>
            <p className="text-xs text-neutral-500 mt-1">Select the specific model to use</p>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-300">Endpoint URL</label>
            <input 
              type="text"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              placeholder="http://localhost:11434"
              className="w-full bg-black/60 border border-white/10 rounded-md px-3 py-2.5 text-white/80 
                focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent
                transition-all duration-200"
            />
            <p className="text-xs text-neutral-500 mt-1">The API endpoint where your model is hosted</p>
          </div>
          
          <button 
            onClick={handleConnect}
            disabled={!selectedProvider || !selectedModel || !endpoint || isConnecting}
            className="mt-4 w-full relative overflow-hidden group bg-gradient-to-r from-indigo-500 to-purple-600 
              hover:from-indigo-600 hover:to-purple-700 text-white font-medium py-2.5 px-4 rounded-md 
              transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-400/0 via-white/20 to-indigo-400/0 
              opacity-0 group-hover:opacity-100 transform translate-x-[-100%] group-hover:translate-x-[100%] 
              transition-all duration-1000"></div>
            
            {isConnecting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Connecting...
              </span>
            ) : (
              <span>Connect Model</span>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};