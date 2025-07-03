export type Message = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  files?: AttachedFile[];
};

export type AttachedFile = {
  id: string;
  name: string;
  size: number;
  type: string;
  content?: string;
  url?: string;
};

export type Conversation = {
  id: string;
  title: string;
  messages: Message[];
  model: string;
  provider: string;
  createdAt: Date;
  updatedAt: Date;
};

export interface Model {
  name: string;
  size?: string;
  modified?: string;
}

export interface AvailableModel {
  id: string;
  name: string;
  provider: string;
  providerName: string;
  size?: string;
}

export interface Provider {
  id: string;
  name: string;
  type: "local" | "cloud";
}