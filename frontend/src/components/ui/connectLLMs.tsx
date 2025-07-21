"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Cpu, Cloud, ArrowLeft, Server, Settings, Globe } from "lucide-react";
import { AppDock } from "./dock";
import { ConnectLocalModelsForm } from "@/components/forms/connect-local-model-form";
import { ConnectCloudModelsForm } from "@/components/forms/connect-cloud-model-form";
import { ModelConfigForm } from "@/components/forms/model-config-form";
import { useChatContext } from "@/contexts/ChatContext";

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

// Content for the Connect LLMs topic with interactive buttons
const ConnectLLMsContent = ({
  onModelConnected,
}: {
  onModelConnected: (provider: string, model: string) => void;
}) => {
  const [activeForm, setActiveForm] = useState<"local" | "cloud" | null>(null);
  const { setSelectedModel, navigateToChat } = useChatContext();

  const handleChatWithModel = (provider: string, model: string) => {
    console.log("ConnectLLMs: Navigating to chat with", provider, model);
    // Set the selected model in context
    setSelectedModel(provider, model);
    // Navigate to chat page
    navigateToChat();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Connect Language Models</h2>

      <p className="mb-6 text-white/60">
        Choose how you want to connect to language models. You can either
        connect to local models running on your machine or connect to cloud API
        services.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <motion.button
          onClick={() => setActiveForm(activeForm === "local" ? null : "local")}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
          className={cn(
            "flex flex-col items-center p-6 rounded-lg border border-white/10",
            "bg-gradient-to-br from-indigo-500/10 to-transparent backdrop-blur-sm",
            "hover:from-indigo-500/20 transition-all duration-300",
            activeForm === "local" ? "ring-2 ring-indigo-500/50" : ""
          )}
        >
          <div
            className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center mb-4",
              "bg-gradient-to-br from-indigo-500/20 to-transparent border border-indigo-400/20"
            )}
          >
            <Cpu className="w-8 h-8 text-indigo-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Connect Local Models</h3>
          <p className="text-sm text-center text-white/60">
            Use models running locally on your machine through services like
            Ollama or LM Studio.
          </p>
        </motion.button>

        <motion.button
          onClick={() => setActiveForm(activeForm === "cloud" ? null : "cloud")}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
          className={cn(
            "flex flex-col items-center p-6 rounded-lg border border-white/10",
            "bg-gradient-to-br from-purple-500/10 to-transparent backdrop-blur-sm",
            "hover:from-purple-500/20 transition-all duration-300",
            activeForm === "cloud" ? "ring-2 ring-purple-500/50" : ""
          )}
        >
          <div
            className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center mb-4",
              "bg-gradient-to-br from-purple-500/20 to-transparent border border-purple-400/20"
            )}
          >
            <Cloud className="w-8 h-8 text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2">
            Connect Cloud API Models
          </h3>
          <p className="text-sm text-center text-white/60">
            Connect to cloud-based models like GPT-4, Claude, or Gemini using
            API keys.
          </p>
        </motion.button>
      </div>

      {activeForm === "local" && (
        <ConnectLocalModelsForm
          onModelConnected={onModelConnected}
          onChatWithModel={handleChatWithModel}
        />
      )}
      {activeForm === "cloud" && <ConnectCloudModelsForm />}
    </div>
  );
};

// Content for the Configure LLMs topic
const ConfigureLLMsContent = ({
  connectedModel,
}: {
  connectedModel: { provider: string; model: string } | null;
}) => {
  const { setSelectedModel, navigateToChat } = useChatContext();

  const handleChatWithModel = (provider: string, model: string) => {
    // Set the selected model in context
    setSelectedModel(provider, model);
    // Navigate to chat page
    navigateToChat();
  };

  if (!connectedModel) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-4">Configure Language Models</h2>

        <div className="text-center py-12">
          <Settings className="w-16 h-16 text-neutral-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-neutral-300 mb-2">
            No Model Connected
          </h3>
          <p className="text-neutral-500 mb-6">
            Please connect a model first to configure its parameters.
          </p>
          <div className="text-sm text-neutral-600">
            Go to "Connect LLMs" → "Connect Models" to get started.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Configure Language Models</h2>

      <p className="mb-6 text-white/60">
        Adjust the parameters below to customize how your connected model
        behaves. These settings control aspects like creativity, consistency,
        and response length.
      </p>

      <ModelConfigForm
        provider={connectedModel.provider}
        model={connectedModel.model}
        onChatWithModel={handleChatWithModel}
      />

      <div className="mt-8 space-y-6">
        <div className="bg-black/30 rounded-lg p-6 border border-white/10">
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <Server className="w-5 h-5 mr-2 text-indigo-400" />
            Parameter Guidelines
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-white/70">
            <div>
              <h4 className="font-medium text-white/90 mb-2">
                For Creative Tasks:
              </h4>
              <ul className="space-y-1">
                <li>• Temperature: 0.8-1.2</li>
                <li>• Top P: 0.9-0.95</li>
                <li>• Lower repeat penalty</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-white/90 mb-2">
                For Analytical Tasks:
              </h4>
              <ul className="space-y-1">
                <li>• Temperature: 0.1-0.3</li>
                <li>• Top P: 0.7-0.8</li>
                <li>• Higher repeat penalty</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-black/30 rounded-lg p-6 border border-white/10">
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <Globe className="w-5 h-5 mr-2 text-indigo-400" />
            Model Compatibility
          </h3>
          <p className="text-white/60 text-sm mb-3">
            These parameters work with both Ollama and LM Studio models. Some
            parameters may have different effects depending on the specific
            model architecture.
          </p>
          <div className="text-xs text-neutral-500">
            Configuration is automatically saved and will be applied to your
            conversations with this model.
          </div>
        </div>
      </div>
    </div>
  );
};

// Elegant decorative shape component (preserved from original)
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
  const [activeChapter, setActiveChapter] = useState<string>("connect-llms");
  const [activeTopic, setActiveTopic] = useState<string>("connect-models");
  const [isSidebarVisible, setSidebarVisible] = useState(true);
  const [connectedModel, setConnectedModel] = useState<{
    provider: string;
    model: string;
  } | null>(null);

  // Handle model connection and navigate to configure tab
  const handleModelConnected = (provider: string, model: string) => {
    setConnectedModel({ provider, model });
    setActiveChapter("configure-llms");
    setActiveTopic("configure-models");
  };

  // Create our data structure
  const connectLLMData: Chapter[] = [
    {
      id: "connect-llms",
      title: "Connect LLMs",
      topics: [
        {
          id: "connect-models",
          title: "Connect Models",
          content: (
            <ConnectLLMsContent onModelConnected={handleModelConnected} />
          ),
        },
      ],
    },
    {
      id: "configure-llms",
      title: "Configure LLMs",
      topics: [
        {
          id: "configure-models",
          title: "Configure Models",
          content: <ConfigureLLMsContent connectedModel={connectedModel} />,
        },
      ],
    },
  ];

  // Find current chapter and topic
  const currentChapter = connectLLMData.find(
    (chapter) => chapter.id === activeChapter
  );
  const currentTopic = currentChapter?.topics.find(
    (topic) => topic.id === activeTopic
  );

  // Handle chapter selection - directly sets the first topic of the selected chapter
  const handleChapterClick = (chapterId: string) => {
    setActiveChapter(chapterId);

    // Find the chapter and set its first topic as active
    const chapter = connectLLMData.find((c) => c.id === chapterId);
    if (chapter && chapter.topics.length > 0) {
      setActiveTopic(chapter.topics[0].id);
    }
  };

  // Animation variants
  const fadeInVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.4 },
    },
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col bg-[#030303] text-neutral-200 overflow-hidden">
      {/* Background gradients - PRESERVED */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-purple-500/[0.05] blur-3xl" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-[#030303]/80 pointer-events-none" />

      {/* Decorative shapes - PRESERVED */}
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
            width: isSidebarVisible ? "280px" : "0px",
          }}
          transition={{ duration: 0.3 }}
          className="h-full border-r border-white/10 bg-black/20 backdrop-blur-md flex flex-col"
        >
          <div className="p-4 border-b border-white/10 flex items-center">
            <Server className="h-5 w-5 mr-2 text-indigo-400" />
            <h2 className="font-semibold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-white/90 to-purple-300">
              Connect Models
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto pb-40">
            {/* Simplified Chapter List */}
            {connectLLMData.map((chapter, idx) => (
              <motion.div
                key={chapter.id}
                className="mb-1"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 1,
                  delay: 0.2 + idx * 0.1,
                  ease: "easeOut",
                }}
              >
                <button
                  onClick={() => handleChapterClick(chapter.id)}
                  className={cn(
                    "w-full text-left px-4 py-3 flex items-center justify-between",
                    "hover:bg-white/5 transition-colors",
                    chapter.id === activeChapter
                      ? "bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-l-2 border-indigo-500/50 text-white"
                      : "text-neutral-400"
                  )}
                >
                  <span className="font-medium">{chapter.title}</span>
                  {chapter.id === "configure-llms" && connectedModel && (
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  )}
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Main content */}
        <motion.div
          className="flex-1 overflow-auto h-full"
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
                <ArrowLeft
                  className={`h-5 w-5 transition-transform ${
                    !isSidebarVisible ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div className="flex-1">
                <div className="text-sm text-neutral-400">
                  {currentChapter?.title}
                </div>
                <h1 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-white/90 to-purple-300">
                  {currentTopic?.title}
                  {connectedModel && activeChapter === "configure-llms" && (
                    <span className="text-sm font-normal text-neutral-400 ml-2">
                      ({connectedModel.provider} - {connectedModel.model})
                    </span>
                  )}
                </h1>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8 max-w-5xl mx-auto pb-40">
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
