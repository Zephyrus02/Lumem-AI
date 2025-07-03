import React from "react";
import { X, File, ImageIcon } from "lucide-react";
import { AttachedFile } from "./types";

interface FileAttachmentProps {
  file: AttachedFile;
  onRemove: () => void;
}

export const FileAttachment: React.FC<FileAttachmentProps> = ({ file, onRemove }) => {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="flex items-center gap-2 bg-black/30 border border-white/10 rounded-md p-2 max-w-xs">
      <div className="flex-shrink-0">
        {file.type.startsWith("image/") ? (
          <ImageIcon className="h-4 w-4 text-blue-400" />
        ) : (
          <File className="h-4 w-4 text-green-400" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-white/80 truncate">{file.name}</p>
        <p className="text-xs text-white/50">{formatFileSize(file.size)}</p>
      </div>
      <button
        onClick={onRemove}
        className="flex-shrink-0 p-1 hover:bg-white/10 rounded-sm transition-colors"
      >
        <X className="h-3 w-3 text-white/60 hover:text-white/80" />
      </button>
    </div>
  );
};