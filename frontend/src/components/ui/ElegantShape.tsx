import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ElegantShapeProps {
  delay?: number;
  width?: number;
  height?: number;
  rotate?: number;
  gradient?: string;
  className?: string;
  duration?: number;
}

export const ElegantShape: React.FC<ElegantShapeProps> = ({
  delay = 0,
  width = 400,
  height = 100,
  rotate = 0,
  gradient = "from-indigo-500/[0.08]",
  className = "",
  duration = 20,
}) => {
  return (
    <motion.div
      className={cn("absolute", className)}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        delay,
        duration: 1,
        ease: "easeOut",
      }}
    >
      <motion.div
        className={cn(
          "relative rounded-full blur-3xl",
          `bg-gradient-to-r ${gradient} to-transparent`
        )}
        style={{
          width: `${width}px`,
          height: `${height}px`,
          transform: `rotate(${rotate}deg)`,
        }}
        animate={{
          rotate: [rotate, rotate + 360],
          scale: [1, 1.1, 1],
        }}
        transition={{
          rotate: {
            duration,
            repeat: Infinity,
            ease: "linear",
          },
          scale: {
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          },
        }}
      />
      
      {/* Inner glow */}
      <motion.div
        className={cn(
          "absolute inset-0 rounded-full blur-xl",
          `bg-gradient-to-r ${gradient.replace('[0.08]', '[0.12]')} to-transparent`
        )}
        style={{
          transform: `rotate(${rotate + 45}deg)`,
        }}
        animate={{
          rotate: [rotate + 45, rotate + 405],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          rotate: {
            duration: duration * 0.8,
            repeat: Infinity,
            ease: "linear",
          },
          opacity: {
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          },
        }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            style={{
              left: `${20 + i * 30}%`,
              top: `${30 + i * 20}%`,
            }}
            animate={{
              y: [-10, 10, -10],
              x: [-5, 5, -5],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
};
