import { motion } from "framer-motion";

interface RobotAvatarProps {
  state: "idle" | "listening" | "speaking" | "thinking";
  currentText?: string;
}

export const RobotAvatar = ({ state, currentText }: RobotAvatarProps) => {
  const getStateColor = () => {
    switch (state) {
      case "speaking": return "hsl(var(--primary))";
      case "listening": return "hsl(var(--accent))";
      case "thinking": return "hsl(var(--secondary))";
      default: return "hsl(var(--muted))";
    }
  };

  const getStateText = () => {
    switch (state) {
      case "speaking": return "AI is speaking...";
      case "listening": return "Listening...";
      case "thinking": return "Thinking...";
      default: return "Ready";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-8">
      {/* Simple Robot Icon */}
      <motion.div
        className="relative w-32 h-32 flex items-center justify-center"
        animate={{
          scale: state === "speaking" ? [1, 1.1, 1] : 1,
        }}
        transition={{
          repeat: state === "speaking" ? Infinity : 0,
          duration: 0.5,
        }}
      >
        {/* Outer circle with state color */}
        <motion.div
          className="absolute inset-0 rounded-full border-4"
          style={{ borderColor: getStateColor() }}
          animate={{
            opacity: state !== "idle" ? [0.3, 0.7, 0.3] : 0.3,
          }}
          transition={{
            repeat: Infinity,
            duration: 2,
          }}
        />
        
        {/* Inner robot icon */}
        <svg
          viewBox="0 0 100 100"
          className="w-20 h-20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          {/* Robot head */}
          <rect x="25" y="30" width="50" height="45" rx="5" />
          
          {/* Eyes */}
          <motion.circle
            cx="40"
            cy="50"
            r="5"
            fill="currentColor"
            animate={{
              scaleY: state === "listening" ? [1, 1.5, 1] : 1,
            }}
            transition={{
              repeat: Infinity,
              duration: 1,
            }}
          />
          <motion.circle
            cx="60"
            cy="50"
            r="5"
            fill="currentColor"
            animate={{
              scaleY: state === "listening" ? [1, 1.5, 1] : 1,
            }}
            transition={{
              repeat: Infinity,
              duration: 1,
            }}
          />
          
          {/* Mouth */}
          <motion.line
            x1="35"
            y1="65"
            x2="65"
            y2="65"
            strokeWidth="3"
            strokeLinecap="round"
            animate={{
              d: state === "speaking" 
                ? ["M35,65 L65,65", "M35,68 Q50,63 65,68", "M35,65 L65,65"]
                : "M35,65 L65,65",
            }}
            transition={{
              repeat: state === "speaking" ? Infinity : 0,
              duration: 0.4,
            }}
          />
          
          {/* Antenna */}
          <line x1="50" y1="30" x2="50" y2="20" />
          <motion.circle
            cx="50"
            cy="17"
            r="3"
            fill="currentColor"
            animate={{
              scale: state === "thinking" ? [1, 1.5, 1] : 1,
            }}
            transition={{
              repeat: state === "thinking" ? Infinity : 0,
              duration: 0.8,
            }}
          />
        </svg>
      </motion.div>

      {/* Status Text */}
      <motion.p
        className="text-sm font-medium"
        style={{ color: getStateColor() }}
        animate={{
          opacity: [0.7, 1, 0.7],
        }}
        transition={{
          repeat: Infinity,
          duration: 2,
        }}
      >
        {getStateText()}
      </motion.p>

      {/* Speech Text */}
      {currentText && state === "speaking" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="max-w-md p-4 bg-muted/50 rounded-lg border border-border"
        >
          <p className="text-sm">{currentText}</p>
        </motion.div>
      )}
    </div>
  );
};