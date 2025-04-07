'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ChevronRight, ChevronDown, Cpu, Cloud, ArrowLeft, Search, X, Server, Settings, Globe } from 'lucide-react';
import { AppDock } from './dock';

// Types for our data structure
type Chapter = {
  id: string;
  title: string;
  topics: Topic[];
};

type Topic = {
  id: string;
  title: string;
  content: React.ReactNode;
};

// Local model providers and their models
const localProviders = [
  { id: 'ollama', name: 'Ollama', models: ['llama2', 'llama3', 'mistral', 'vicuna', 'orca-mini'] },
  { id: 'localai', name: 'LocalAI', models: ['phi-2', 'tinyllama', 'gemma', 'neural-chat'] },
  { id: 'text-generation-webui', name: 'Text Generation WebUI', models: ['llama2', 'llama3', 'mistral', 'falcon'] },
];

// Cloud model providers and their models
const cloudProviders = [
  { id: 'openai', name: 'OpenAI', models: ['gpt-3.5-turbo', 'gpt-4o', 'gpt-4-turbo'] },
  { id: 'anthropic', name: 'Anthropic', models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'] },
  { id: 'google', name: 'Google', models: ['gemini-pro', 'gemini-flash', 'gemini-ultra'] },
  { id: 'mistral', name: 'Mistral AI', models: ['mistral-large', 'mistral-medium', 'mistral-small'] },
];

// Component for Connect Local Models form
const ConnectLocalModelsForm = () => {
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

// Component for Connect Cloud Models form
const ConnectCloudModelsForm = () => {
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
      className="mt-6 w-full md:w-5/6 lg:w-4/5 mx-auto relative"
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

// Content for the Connect LLMs topic with interactive buttons
const ConnectLLMsContent = () => {
  const [activeForm, setActiveForm] = useState<'local' | 'cloud' | null>(null);
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Connect Language Models</h2>
      
      <p className="mb-6 text-white/60">
        Choose how you want to connect to language models. You can either connect to local models running on your machine or connect to cloud API services.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <motion.button 
          onClick={() => setActiveForm(activeForm === 'local' ? null : 'local')}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
          className={cn(
            "flex flex-col items-center p-6 rounded-lg border border-white/10",
            "bg-gradient-to-br from-indigo-500/10 to-transparent backdrop-blur-sm",
            "hover:from-indigo-500/20 transition-all duration-300",
            activeForm === 'local' ? "ring-2 ring-indigo-500/50" : ""
          )}
        >
          <div className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center mb-4",
            "bg-gradient-to-br from-indigo-500/20 to-transparent border border-indigo-400/20"
          )}>
            <Cpu className="w-8 h-8 text-indigo-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Connect Local Models</h3>
          <p className="text-sm text-center text-white/60">
            Use models running locally on your machine through services like Ollama or LocalAI.
          </p>
        </motion.button>
        
        <motion.button 
          onClick={() => setActiveForm(activeForm === 'cloud' ? null : 'cloud')}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
          className={cn(
            "flex flex-col items-center p-6 rounded-lg border border-white/10",
            "bg-gradient-to-br from-purple-500/10 to-transparent backdrop-blur-sm",
            "hover:from-purple-500/20 transition-all duration-300",
            activeForm === 'cloud' ? "ring-2 ring-purple-500/50" : ""
          )}
        >
          <div className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center mb-4",
            "bg-gradient-to-br from-purple-500/20 to-transparent border border-purple-400/20"
          )}>
            <Cloud className="w-8 h-8 text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Connect Cloud API Models</h3>
          <p className="text-sm text-center text-white/60">
            Connect to cloud-based models like GPT-4, Claude, or Gemini using API keys.
          </p>
        </motion.button>
      </div>
      
      {activeForm === 'local' && <ConnectLocalModelsForm />}
      {activeForm === 'cloud' && <ConnectCloudModelsForm />}
    </div>
  );
};

// Content for the Configure LLMs topic
const ConfigureLLMsContent = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Configure Language Models</h2>
      
      <p className="mb-4 text-white/60">
        After connecting your language models, you can configure various parameters to customize their behavior and performance.
      </p>
      
      <div className="mt-6 space-y-8">
        <div className="bg-black/30 rounded-lg p-6 border border-white/10">
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <Settings className="w-5 h-5 mr-2 text-indigo-400" />
            Model Parameters
          </h3>
          <p className="text-white/60 mb-4">
            Adjust settings like temperature, top_p, and max tokens to control the creativity and length of responses.
          </p>
          <div className="bg-black/40 p-4 rounded-md mb-2">
            <pre className="text-sm text-white/80 whitespace-pre-wrap">
              {`{
  "temperature": 0.7,
  "top_p": 0.9,
  "max_tokens": 2048,
  "frequency_penalty": 0,
  "presence_penalty": 0
}`}
            </pre>
          </div>
        </div>
        
        <div className="bg-black/30 rounded-lg p-6 border border-white/10">
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <Server className="w-5 h-5 mr-2 text-indigo-400" />
            System Prompts
          </h3>
          <p className="text-white/60 mb-4">
            Define system prompts to set the behavior and context for your conversations with the model.
          </p>
        </div>
        
        <div className="bg-black/30 rounded-lg p-6 border border-white/10">
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <Globe className="w-5 h-5 mr-2 text-indigo-400" />
            Context Window
          </h3>
          <p className="text-white/60">
            Configure how much conversation history to include in each request to the model. This affects how well the model can maintain context throughout longer conversations.
          </p>
        </div>
      </div>
    </div>
  );
};

// Create our data structure
const connectLLMData: Chapter[] = [
  {
    id: 'connect-llms',
    title: 'Connect LLMs',
    topics: [
      {
        id: 'connect-models',
        title: 'Connect Models',
        content: <ConnectLLMsContent />
      }
    ]
  },
  {
    id: 'configure-llms',
    title: 'Configure LLMs',
    topics: [
      {
        id: 'configure-models',
        title: 'Configure Models',
        content: <ConfigureLLMsContent />
      }
    ]
  }
];

type SearchResult = {
  chapterId: string;
  topicId: string;
  chapterTitle: string;
  topicTitle: string;
};

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

export function ConnectLLMPage() {
  const [activeChapter, setActiveChapter] = useState<string>(connectLLMData[0].id);
  const [activeTopic, setActiveTopic] = useState<string>(connectLLMData[0].topics[0].id);
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({
    [connectLLMData[0].id]: true,
  });
  const [isSidebarVisible, setSidebarVisible] = useState(true);
  
  // Search functionality
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Helper to toggle chapter expansion
  const toggleChapter = (chapterId: string) => {
    setExpandedChapters((prev) => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }));
  };

  // Find current chapter and topic
  const currentChapter = connectLLMData.find((chapter) => chapter.id === activeChapter);
  const currentTopic = currentChapter?.topics.find((topic) => topic.id === activeTopic);

  // Search functionality
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const query = searchQuery.toLowerCase();
    setIsSearching(true);

    // Search through all chapters and topics
    const results: SearchResult[] = [];
    connectLLMData.forEach(chapter => {
      // Search in chapter titles
      if (chapter.title.toLowerCase().includes(query)) {
        chapter.topics.forEach(topic => {
          results.push({
            chapterId: chapter.id,
            topicId: topic.id,
            chapterTitle: chapter.title,
            topicTitle: topic.title
          });
        });
      } else {
        // Search in topic titles
        chapter.topics.forEach(topic => {
          if (topic.title.toLowerCase().includes(query)) {
            results.push({
              chapterId: chapter.id,
              topicId: topic.id,
              chapterTitle: chapter.title,
              topicTitle: topic.title
            });
          }
        });
      }
    });

    setSearchResults(results);
  }, [searchQuery]);

  // Handle search result click
  const handleSearchResultClick = (result: SearchResult) => {
    setActiveChapter(result.chapterId);
    setActiveTopic(result.topicId);
    setExpandedChapters(prev => ({
      ...prev,
      [result.chapterId]: true
    }));
    setSearchQuery('');
    setIsSearching(false);
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
  };

  // Animation variants
  const fadeInVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.4 } 
    },
  };

  const fadeUpVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        delay: 0.2 + i * 0.1,
        ease: [0.25, 0.4, 0.25, 1],
      },
    }),
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col bg-[#030303] text-neutral-200">
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
        {/* Left Sidebar - Chapters */}
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ 
            x: isSidebarVisible ? 0 : -280,
            opacity: isSidebarVisible ? 1 : 0,
            width: isSidebarVisible ? '280px' : '0px',
          }}
          transition={{ duration: 0.3 }}
          className="h-full border-r border-white/10 bg-black/20 backdrop-blur-md"
        >
          <div className="p-4 border-b border-white/10 flex items-center">
            <Server className="h-5 w-5 mr-2 text-indigo-400" />
            <h2 className="font-semibold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-white/90 to-purple-300">Connect Models</h2>
          </div>
          
          {/* Search Bar */}
          <div className="p-3 border-b border-white/10">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-4 w-4 text-neutral-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full py-2 pl-10 pr-8 rounded-md bg-black/30 border border-white/10 text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400 hover:text-neutral-200"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          
          <div className="overflow-y-auto h-[calc(100vh-64px-128px-48px)] pb-4">
            {/* Search Results */}
            {isSearching ? (
              <div className="py-2">
                <div className="px-4 py-1 text-xs uppercase text-neutral-500 font-semibold">
                  Search Results ({searchResults.length})
                </div>
                {searchResults.length > 0 ? (
                  <div className="mt-1">
                    {searchResults.map((result, index) => (
                      <button
                        key={`${result.chapterId}-${result.topicId}-${index}`}
                        onClick={() => handleSearchResultClick(result)}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-white/5 transition-colors"
                      >
                        <div className="text-indigo-300">{result.topicTitle}</div>
                        <div className="text-xs text-neutral-500">in {result.chapterTitle}</div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-2 text-sm text-neutral-400">
                    No results found for "{searchQuery}"
                  </div>
                )}
              </div>
            ) : (
              // Regular Chapter/Topic List
              <>
                {connectLLMData.map((chapter, idx) => (
                  <motion.div 
                    key={chapter.id} 
                    className="mb-1"
                    custom={idx}
                    variants={fadeUpVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <button
                      onClick={() => toggleChapter(chapter.id)}
                      className={cn(
                        "w-full text-left px-4 py-2 flex items-center justify-between",
                        "hover:bg-white/5 transition-colors",
                        chapter.id === activeChapter 
                          ? "bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-l-2 border-indigo-500/50" 
                          : ""
                      )}
                    >
                      <span className="font-medium">{chapter.title}</span>
                      {expandedChapters[chapter.id] ? (
                        <ChevronDown className="h-4 w-4 text-neutral-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-neutral-400" />
                      )}
                    </button>
                    
                    {expandedChapters[chapter.id] && (
                      <div className="pl-4 py-1">
                        {chapter.topics.map((topic) => (
                          <button
                            key={topic.id}
                            onClick={() => {
                              setActiveChapter(chapter.id);
                              setActiveTopic(topic.id);
                            }}
                            className={cn(
                              "w-full text-left px-4 py-2 text-sm rounded-md",
                              "hover:bg-white/5 transition-colors",
                              topic.id === activeTopic
                                ? "bg-gradient-to-r from-indigo-500/20 to-transparent text-indigo-200"
                                : "text-neutral-400"
                            )}
                          >
                            {topic.title}
                          </button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </>
            )}
          </div>
        </motion.div>

        {/* Main content */}
        <motion.div 
          className="flex-1 overflow-auto h-[calc(100vh-128px)]"
          initial="hidden"
          animate="visible"
          variants={fadeInVariants}
        >
          <div className="sticky top-0 z-10 bg-black/50 backdrop-blur-md border-b border-white/10">
            {/* Main header row */}
            <div className="p-4 flex items-center">
              <button 
                onClick={() => setSidebarVisible(!isSidebarVisible)}
                className="p-2 rounded-md hover:bg-white/10 mr-2"
              >
                <ArrowLeft className={`h-5 w-5 transition-transform ${!isSidebarVisible ? 'rotate-180' : ''}`} />
              </button>
              <div className="flex-1">
                <div className="text-sm text-neutral-400">{currentChapter?.title}</div>
                <h1 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-white/90 to-purple-300">
                  {currentTopic?.title}
                </h1>
              </div>
            </div>
            
            {/* Top Search Bar - Only visible when sidebar is collapsed */}
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ 
                height: !isSidebarVisible ? 'auto' : 0,
                opacity: !isSidebarVisible ? 1 : 0
              }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 30,
                opacity: { duration: 0.2, delay: !isSidebarVisible ? 0.1 : 0 }
              }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="h-4 w-4 text-neutral-400" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="w-full py-2 pl-10 pr-8 rounded-md bg-black/30 border border-white/10 text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50"
                  />
                  {searchQuery && (
                    <button
                      onClick={clearSearch}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400 hover:text-neutral-200"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
              
              {/* Search Results Dropdown for top search */}
              {isSearching && !isSidebarVisible && searchResults.length > 0 && (
                <div className="absolute left-0 right-0 bg-black/80 backdrop-blur-md border-b border-white/10 max-h-[50vh] overflow-y-auto z-20">
                  <div className="p-4">
                    <div className="mb-2 text-xs uppercase text-neutral-500 font-semibold">
                      Search Results ({searchResults.length})
                    </div>
                    <div className="space-y-1">
                      {searchResults.map((result, index) => (
                        <button
                          key={`top-${result.chapterId}-${result.topicId}-${index}`}
                          onClick={() => handleSearchResultClick(result)}
                          className="w-full text-left p-2 rounded text-sm hover:bg-white/10 transition-colors"
                        >
                          <div className="text-indigo-300">{result.topicTitle}</div>
                          <div className="text-xs text-neutral-500">in {result.chapterTitle}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
          
          <div className="p-6 md:p-8 max-w-4xl mx-auto">
            <motion.div
              key={activeTopic}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="prose prose-invert max-w-none prose-headings:bg-clip-text prose-headings:text-transparent prose-headings:bg-gradient-to-r prose-headings:from-indigo-300 prose-headings:via-white/90 prose-headings:to-purple-300 prose-p:text-white/60"
            >
              {currentTopic?.content}
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Bottom dock */}
      <div className="absolute bottom-8 left-0 right-0 z-50">
        <AppDock />
      </div>
    </div>
  );
}