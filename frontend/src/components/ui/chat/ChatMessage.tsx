import React, { useState } from "react";
import { motion } from "framer-motion";
import { User, Bot, Check, Copy, File, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Message } from "./types";
import { highlightCode } from "./syntax-highlighter";

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const copyCodeBlock = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeIndex(index);
    setTimeout(() => setCopiedCodeIndex(null), 2000);
  };

  const formatMessageContent = (content: string) => {
    const parts = content.split(/(```[\s\S]*?```|`[^`\n]+`)/);

    return parts.map((part, index) => {
      if (part.startsWith("```") && part.endsWith("```")) {
        const codeContent = part.slice(3, -3);
        const lines = codeContent.split("\n");
        const language = lines[0].trim();
        const code = lines.slice(language ? 1 : 0).join("\n").trim();

        return (
          <div key={index} className="my-4 relative group">
            <div className="bg-[#0f0f0f] border border-white/20 rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 bg-[#1a1a1a] border-b border-white/10">
                <span className="text-xs text-white/60 font-mono">
                  {language || "code"}
                </span>
                <button
                  onClick={() => copyCodeBlock(code, index)}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                    copiedCodeIndex === index
                      ? "bg-emerald-500/20 text-emerald-300"
                      : "hover:bg-white/10 text-white/60 hover:text-white/80"
                  }`}
                >
                  {copiedCodeIndex === index ? (
                    <>
                      <Check className="h-3 w-3" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 overflow-x-auto bg-[#0f0f0f]">
                <code className="text-sm leading-relaxed font-mono">
                  {highlightCode(code, language)}
                </code>
              </pre>
            </div>
          </div>
        );
      }

      if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
        const inlineCode = part.slice(1, -1);
        return (
          <code
            key={index}
            className="bg-black/40 text-indigo-300 px-1.5 py-0.5 rounded text-sm font-mono border border-white/10"
          >
            {inlineCode}
          </code>
        );
      }

      return (
        <span key={index} className="whitespace-pre-wrap">
          {part}
        </span>
      );
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "py-6 px-4 sm:px-6 border-b border-white/10",
        message.role === "assistant" ? "bg-black/20" : ""
      )}
    >
      <div className="max-w-4xl mx-auto flex gap-4">
        <div className="flex-shrink-0 mt-1">
          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-indigo-500/30 to-purple-500/30 border border-white/10 flex items-center justify-center">
            {message.role === "user" ? (
              <User className="h-4 w-4 text-white/70" />
            ) : (
              <Bot className="h-4 w-4 text-white/70" />
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          {message.files && message.files.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {message.files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-2 bg-black/20 border border-white/5 rounded-md p-2"
                >
                  {file.type.startsWith("image/") ? (
                    <ImageIcon className="h-4 w-4 text-blue-400" />
                  ) : (
                    <File className="h-4 w-4 text-green-400" />
                  )}
                  <span className="text-xs text-white/60">{file.name}</span>
                </div>
              ))}
            </div>
          )}

          <div className="mb-2 text-white/80 leading-relaxed">
            {formatMessageContent(message.content)}
          </div>

          {message.role === "assistant" && (
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={copyToClipboard}
                className={`text-xs flex items-center gap-1 px-2 py-1 rounded-md transition-colors ${
                  isCopied
                    ? "bg-emerald-500/20 text-emerald-300"
                    : "hover:bg-white/10 text-neutral-400 hover:text-white"
                }`}
              >
                {isCopied ? (
                  <>
                    <Check className="h-3 w-3" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    Copy All
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
