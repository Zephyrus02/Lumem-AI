'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

// Cloud model providers and their models
const cloudProviders = [
  { id: 'openai', name: 'OpenAI', models: ['gpt-3.5-turbo', 'gpt-4o', 'gpt-4-turbo'] },
  { id: 'anthropic', name: 'Anthropic', models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'] },
  { id: 'google', name: 'Google', models: ['gemini-pro', 'gemini-flash', 'gemini-ultra'] },
  { id: 'mistral', name: 'Mistral AI', models: ['mistral-large', 'mistral-medium', 'mistral-small'] },
];

export const ConnectCloudModelsForm = () => {
  const [selectedProvider, setSelectedProvider] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  const models = cloudProviders.find(p => p.id === selectedProvider)?.models || [];
  
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
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/[0.03] to-indigo-500/[0.03] rounded-xl -z-10" />
      
      <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-white/10 p-6">
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-300">Cloud Provider</label>
            <div className="relative">
              <select 
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                className="w-full bg-black/60 border border-white/10 rounded-md px-3 py-2.5 text-white/80 
                  appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent
                  transition-all duration-200"
              >
                <option value="" disabled>Select provider</option>
                {cloudProviders.map(provider => (
                  <option key={provider.id} value={provider.id}>{provider.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
            </div>
            <p className="text-xs text-neutral-500 mt-1">Choose your cloud AI provider</p>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-300">Model</label>
            <div className="relative">
              <select 
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                disabled={!selectedProvider}
                className="w-full bg-black/60 border border-white/10 rounded-md px-3 py-2.5 text-white/80 
                  appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent
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
            <label className="block text-sm font-medium text-neutral-300">API Key</label>
            <div className="relative">
              <input 
                type={showApiKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your API key"
                className="w-full bg-black/60 border border-white/10 rounded-md px-3 py-2.5 text-white/80 pr-10
                  focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent
                  transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-200"
              >
                {showApiKey ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            <p className="text-xs text-neutral-500 mt-1">Your API key for authentication</p>
          </div>
          
          <button 
            onClick={handleConnect}
            disabled={!selectedProvider || !selectedModel || !apiKey || isConnecting}
            className="mt-4 w-full relative overflow-hidden group bg-gradient-to-r from-purple-500 to-indigo-600 
              hover:from-purple-600 hover:to-indigo-700 text-white font-medium py-2.5 px-4 rounded-md 
              transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-400/0 via-white/20 to-purple-400/0 
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