import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Settings, 
  Palette, 
  Bell, 
  Shield, 
  Download,
  Info,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatSettingsProps {
  className?: string;
}

export const ChatSettings: React.FC<ChatSettingsProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [settings, setSettings] = useState({
    theme: "dark",
    soundEnabled: true,
    notifications: true,
    autoSave: true,
    compactMode: false,
    showTimestamps: true,
    enableMarkdown: true,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const exportChats = () => {
    // Implementation for exporting chats
    console.log("Exporting chats...");
  };

  const importChats = () => {
    // Implementation for importing chats
    console.log("Importing chats...");
  };

  const clearAllChats = () => {
    if (confirm("Are you sure you want to delete all conversations? This action cannot be undone.")) {
      console.log("Clearing all chats...");
    }
  };

  const settingSections = [
    {
      id: "appearance",
      title: "Appearance",
      icon: Palette,
      items: [
        {
          key: "compactMode",
          label: "Compact Mode",
          description: "Reduce spacing between messages",
          type: "toggle",
        },
        {
          key: "showTimestamps",
          label: "Show Timestamps",
          description: "Display message timestamps",
          type: "toggle",
        },
        {
          key: "enableMarkdown",
          label: "Enable Markdown",
          description: "Render markdown in messages",
          type: "toggle",
        },
      ],
    },
    {
      id: "notifications",
      title: "Notifications",
      icon: Bell,
      items: [
        {
          key: "notifications",
          label: "Push Notifications",
          description: "Get notified of new messages",
          type: "toggle",
        },
        {
          key: "soundEnabled",
          label: "Sound Effects",
          description: "Play sounds for interactions",
          type: "toggle",
        },
      ],
    },
    {
      id: "privacy",
      title: "Privacy & Data",
      icon: Shield,
      items: [
        {
          key: "autoSave",
          label: "Auto-save Conversations",
          description: "Automatically save chat history",
          type: "toggle",
        },
      ],
    },
    {
      id: "data",
      title: "Data Management",
      icon: Download,
      items: [
        {
          key: "export",
          label: "Export Chats",
          description: "Download all conversations",
          type: "action",
          action: exportChats,
        },
        {
          key: "import",
          label: "Import Chats",
          description: "Upload conversation backup",
          type: "action",
          action: importChats,
        },
        {
          key: "clear",
          label: "Clear All Chats",
          description: "Delete all conversations",
          type: "action",
          action: clearAllChats,
          destructive: true,
        },
      ],
    },
  ];

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-md text-white/60 hover:text-white hover:bg-white/10 transition-colors"
        title="Settings"
      >
        <Settings className="h-4 w-4" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Settings Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-full mt-2 w-80 max-h-96 bg-black/90 backdrop-blur-xl border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden"
            >
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Settings</h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 rounded-md text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {settingSections.map((section) => {
                  const Icon = section.icon;
                  const isExpanded = activeSection === section.id;

                  return (
                    <div key={section.id} className="border-b border-white/5 last:border-b-0">
                      <button
                        onClick={() => setActiveSection(isExpanded ? null : section.id)}
                        className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="h-4 w-4 text-white/60" />
                          <span className="text-white/80 font-medium">{section.title}</span>
                        </div>
                        <ChevronRight 
                          className={cn(
                            "h-4 w-4 text-white/40 transition-transform",
                            isExpanded && "rotate-90"
                          )} 
                        />
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: "auto" }}
                            exit={{ height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4">
                              {section.items.map((item) => (
                                <div key={item.key} className="py-2 first:pt-0">
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <div className="text-sm font-medium text-white/80">
                                        {item.label}
                                      </div>
                                      <div className="text-xs text-white/50 mt-0.5">
                                        {item.description}
                                      </div>
                                    </div>

                                    {item.type === "toggle" && (
                                      <button
                                        onClick={() => toggleSetting(item.key as keyof typeof settings)}
                                        className={cn(
                                          "relative w-10 h-6 rounded-full transition-colors",
                                          settings[item.key as keyof typeof settings]
                                            ? "bg-indigo-500"
                                            : "bg-white/20"
                                        )}
                                      >
                                        <div
                                          className={cn(
                                            "absolute top-1 w-4 h-4 bg-white rounded-full transition-transform",
                                            settings[item.key as keyof typeof settings]
                                              ? "translate-x-5"
                                              : "translate-x-1"
                                          )}
                                        />
                                      </button>
                                    )}

                                    {item.type === "action" && 'action' in item && (
                                      <button
                                        onClick={item.action}
                                        className={cn(
                                          "px-3 py-1 rounded-md text-xs font-medium transition-colors",
                                          'destructive' in item && item.destructive
                                            ? "bg-red-500/20 text-red-300 hover:bg-red-500/30"
                                            : "bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30"
                                        )}
                                      >
                                        {item.label.split(" ")[0]}
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-white/10 bg-black/50">
                <div className="flex items-center justify-between text-xs text-white/40">
                  <span>Lumen v1.0.0</span>
                  <button
                    onClick={() => window.open("https://github.com/lumen", "_blank")}
                    className="flex items-center gap-1 hover:text-white/60 transition-colors"
                  >
                    <Info className="h-3 w-3" />
                    About
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
