import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Plus, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Conversation } from "./types";

interface ChatSidebarProps {
  conversations: Conversation[];
  activeConversation: string | null;
  setActiveConversation: (id: string | null) => void;
  createNewConversation: () => void;
  isSidebarVisible: boolean;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  conversations,
  activeConversation,
  setActiveConversation,
  createNewConversation,
  isSidebarVisible,
}) => {
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays <= 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString();
  };

  const truncateTitle = (title: string, maxLength: number = 30) => {
    return title.length > maxLength ? `${title.substring(0, maxLength)}...` : title;
  };

  return (
    <AnimatePresence>
      {isSidebarVisible && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 320, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="flex-shrink-0 h-full bg-black/20 backdrop-blur-sm border-r border-white/10 overflow-hidden"
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-white/10">
              <button
                onClick={createNewConversation}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-white/10 hover:border-white/20 hover:from-indigo-500/20 hover:to-purple-500/20 transition-all text-white/80 hover:text-white"
              >
                <Plus className="h-4 w-4" />
                <span className="font-medium">New Chat</span>
              </button>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="p-6 text-center">
                  <MessageSquare className="h-8 w-8 text-white/30 mx-auto mb-3" />
                  <p className="text-white/50 text-sm">No conversations yet</p>
                  <p className="text-white/30 text-xs mt-1">Create a new chat to get started</p>
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {conversations.map((conversation) => (
                    <motion.div
                      key={conversation.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group relative"
                    >
                      <button
                        onClick={() => setActiveConversation(conversation.id)}
                        className={cn(
                          "w-full text-left p-3 rounded-lg transition-all relative overflow-hidden",
                          activeConversation === conversation.id
                            ? "bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-white/20 text-white"
                            : "hover:bg-white/5 text-white/70 hover:text-white/90 border border-transparent"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-0.5">
                            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm mb-1 truncate">
                              {truncateTitle(conversation.title)}
                            </h3>
                            <p className="text-xs text-white/50 mb-1">
                              {conversation.messages.length} message{conversation.messages.length !== 1 ? 's' : ''}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-white/40">
                              <span>{conversation.provider}</span>
                              <span>•</span>
                              <span>{formatDate(conversation.updatedAt)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Hover actions */}
                        <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle delete or more actions
                            }}
                            className="p-1 rounded hover:bg-white/10 text-white/60 hover:text-white/80"
                          >
                            <MoreHorizontal className="h-3 w-3" />
                          </button>
                        </div>
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/10">
              <div className="text-xs text-white/40 text-center">
                <p className="mb-1">💡 Tip: Use Cmd/Ctrl + N for new chat</p>
                <p>Press Esc to toggle sidebar</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};