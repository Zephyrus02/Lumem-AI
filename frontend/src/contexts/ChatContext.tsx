"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface ChatContextType {
  selectedProvider: string;
  selectedModel: string;
  setSelectedModel: (provider: string, model: string) => void;
  navigateToChat: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
  onNavigateToChat?: () => void;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({
  children,
  onNavigateToChat,
}) => {
  // Don't set defaults here - let the components handle it
  const [selectedProvider, setSelectedProvider] = useState("");
  const [selectedModel, setSelectedModelState] = useState("");

  const setSelectedModel = (provider: string, model: string) => {
    console.log("ChatContext: Setting model to", provider, model);
    setSelectedProvider(provider);
    setSelectedModelState(model);
  };

  const navigateToChat = () => {
    if (onNavigateToChat) {
      onNavigateToChat();
    }
  };

  return (
    <ChatContext.Provider
      value={{
        selectedProvider,
        selectedModel,
        setSelectedModel,
        navigateToChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
