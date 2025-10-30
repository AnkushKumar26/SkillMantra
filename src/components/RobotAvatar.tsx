import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface RobotAvatarProps {
  state: "idle" | "listening" | "speaking" | "thinking";
  currentText?: string;
}

export const RobotAvatar = ({ state, currentText }: RobotAvatarProps) => {
  const [blinkEyes, setBlinkEyes] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setBlinkEyes(true);
      setTimeout(() => setBlinkEyes(false), 200);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const getHeadAnimation = () => {
    switch (state) {
      case "speaking":
        return { rotate: [0, -5, 5, 0], transition: { repeat: Infinity, duration: 0.8 } };
      case "listening":
        return { rotate: [0, 10, 0], transition: { repeat: Infinity, duration: 2 } };
      case "thinking":
        return { rotate: [0, -10, 0], transition: { repeat: Infinity, duration: 1.5 } };
      default:
        return { rotate: 0 };
    }
  };

  const getMouthAnimation = () => {
    if (state === "speaking") {
      return { scaleY: [1, 1.5, 1], transition: { repeat: Infinity, duration: 0.3 } };
    }
    return { scaleY: 1 };
  };

  const getAuraColor = () => {
    switch (state) {
      case "speaking": return "hsl(var(--primary))";
      case "listening": return "hsl(var(--accent))";
      case "thinking": return "hsl(var(--secondary))";
      default: return "hsl(var(--muted))";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-6 py-8">
      {/* Robot Container */}
      <div className="relative">
        {/* Animated Aura */}
        <motion.div
          className="absolute inset-0 rounded-full blur-2xl"
          animate={{
            scale: state === "speaking" ? [1, 1.2, 1] : [1, 1.1, 1],
            opacity: state === "idle" ? 0.3 : 0.6,
          }}
          transition={{ repeat: Infinity, duration: 2 }}
          style={{ backgroundColor: getAuraColor() }}
        />

        {/* Robot Body */}
        <svg
          width="280"
          height="320"
          viewBox="0 0 280 320"
          className="relative z-10"
        >
          {/* Head */}
          <motion.g animate={getHeadAnimation()}>
            {/* Head Base */}
            <rect
              x="90"
              y="40"
              width="100"
              height="90"
              rx="15"
              fill="hsl(var(--card))"
              stroke="hsl(var(--primary))"
              strokeWidth="3"
            />

            {/* Antenna */}
            <motion.g
              animate={state === "thinking" ? { rotate: [0, 15, -15, 0] } : {}}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              <line
                x1="140"
                y1="40"
                x2="140"
                y2="20"
                stroke="hsl(var(--primary))"
                strokeWidth="3"
              />
              <circle
                cx="140"
                cy="15"
                r="6"
                fill={state === "thinking" ? "hsl(var(--accent))" : "hsl(var(--primary))"}
              />
            </motion.g>

            {/* Eyes */}
            <motion.g>
              <motion.ellipse
                cx="115"
                cy="75"
                rx="12"
                ry={blinkEyes ? 2 : 12}
                fill={state === "listening" ? "hsl(var(--accent))" : "hsl(var(--primary))"}
              />
              <motion.ellipse
                cx="165"
                cy="75"
                rx="12"
                ry={blinkEyes ? 2 : 12}
                fill={state === "listening" ? "hsl(var(--accent))" : "hsl(var(--primary))"}
              />
            </motion.g>

            {/* Mouth */}
            <motion.rect
              x="120"
              y="105"
              width="40"
              height="10"
              rx="5"
              fill="hsl(var(--foreground))"
              animate={getMouthAnimation()}
              style={{ originX: "50%", originY: "50%" }}
            />
          </motion.g>

          {/* Neck */}
          <rect
            x="125"
            y="130"
            width="30"
            height="20"
            fill="hsl(var(--muted))"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
          />

          {/* Body */}
          <rect
            x="80"
            y="150"
            width="120"
            height="100"
            rx="20"
            fill="hsl(var(--card))"
            stroke="hsl(var(--primary))"
            strokeWidth="3"
          />

          {/* Chest Panel */}
          <rect
            x="110"
            y="170"
            width="60"
            height="60"
            rx="8"
            fill="hsl(var(--muted))"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
          />

          {/* Status Indicator */}
          <motion.circle
            cx="140"
            cy="200"
            r="8"
            fill={getAuraColor()}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          />

          {/* Arms */}
          <motion.g
            animate={
              state === "speaking"
                ? { rotate: [0, 10, -10, 0] }
                : state === "listening"
                ? { rotate: [0, 5, 0] }
                : {}
            }
            transition={{ repeat: Infinity, duration: 2 }}
            style={{ originX: "60px", originY: "180px" }}
          >
            <rect
              x="50"
              y="160"
              width="25"
              height="70"
              rx="12"
              fill="hsl(var(--card))"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
            />
          </motion.g>

          <motion.g
            animate={
              state === "speaking"
                ? { rotate: [0, -10, 10, 0] }
                : state === "listening"
                ? { rotate: [0, -5, 0] }
                : {}
            }
            transition={{ repeat: Infinity, duration: 2 }}
            style={{ originX: "220px", originY: "180px" }}
          >
            <rect
              x="205"
              y="160"
              width="25"
              height="70"
              rx="12"
              fill="hsl(var(--card))"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
            />
          </motion.g>

          {/* Legs */}
          <rect
            x="100"
            y="250"
            width="30"
            height="60"
            rx="12"
            fill="hsl(var(--card))"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
          />
          <rect
            x="150"
            y="250"
            width="30"
            height="60"
            rx="12"
            fill="hsl(var(--card))"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
          />
        </svg>
      </div>

      {/* Status Text */}
      <div className="text-center space-y-2">
        <motion.div
          className="text-lg font-semibold"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          {state === "idle" && "Ready to debate"}
          {state === "listening" && "Listening to you..."}
          {state === "speaking" && "Presenting argument"}
          {state === "thinking" && "Thinking..."}
        </motion.div>

        {/* Speech Bubble */}
        {currentText && state === "speaking" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md p-4 bg-primary/10 rounded-lg border border-primary/30 relative"
          >
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-primary/10 border-t border-l border-primary/30 rotate-45" />
            <p className="text-sm leading-relaxed">{currentText}</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};
