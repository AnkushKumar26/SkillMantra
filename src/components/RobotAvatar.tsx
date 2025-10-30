import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Mic, Volume2, Zap } from "lucide-react";

interface RobotAvatarProps {
  state: "idle" | "listening" | "speaking" | "thinking";
  currentText?: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  delay: number;
}

export const RobotAvatar = ({ state, currentText }: RobotAvatarProps) => {
  const [blinkEyes, setBlinkEyes] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setBlinkEyes(true);
      setTimeout(() => setBlinkEyes(false), 200);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (state === "thinking" || state === "speaking") {
      const newParticles = Array.from({ length: 8 }, (_, i) => ({
        id: Date.now() + i,
        x: Math.random() * 280,
        y: Math.random() * 320,
        delay: Math.random() * 0.5,
      }));
      setParticles(newParticles);
    } else {
      setParticles([]);
    }
  }, [state]);

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

  const getStateIcon = () => {
    switch (state) {
      case "speaking": return <Volume2 className="w-6 h-6" />;
      case "listening": return <Mic className="w-6 h-6" />;
      case "thinking": return <Brain className="w-6 h-6" />;
      default: return <Zap className="w-6 h-6" />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-6 py-8 relative">
      {/* Floating Particles */}
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-2 h-2 rounded-full"
            style={{
              left: particle.x,
              top: particle.y,
              backgroundColor: getAuraColor(),
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
              y: [0, -50],
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 2,
              delay: particle.delay,
              repeat: Infinity,
            }}
          />
        ))}
      </AnimatePresence>

      {/* Robot Container */}
      <div className="relative">
        {/* Multiple Aura Layers */}
        <motion.div
          className="absolute inset-0 rounded-full blur-3xl opacity-40"
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, 180, 360],
          }}
          transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
          style={{ 
            background: `radial-gradient(circle, ${getAuraColor()}, transparent)`,
          }}
        />
        <motion.div
          className="absolute inset-0 rounded-full blur-2xl"
          animate={{
            scale: state === "speaking" ? [1, 1.2, 1] : [1, 1.1, 1],
            opacity: state === "idle" ? 0.3 : 0.6,
          }}
          transition={{ repeat: Infinity, duration: 2 }}
          style={{ backgroundColor: getAuraColor() }}
        />
        <motion.div
          className="absolute inset-0 rounded-full blur-xl opacity-50"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          style={{ backgroundColor: getAuraColor() }}
        />

        {/* Robot Body */}
        <svg
          width="280"
          height="320"
          viewBox="0 0 280 320"
          className="relative z-10 drop-shadow-2xl"
        >
          <defs>
            <linearGradient id="robotGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
              <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.3" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Head */}
          <motion.g animate={getHeadAnimation()}>
            {/* Head Base with gradient */}
            <rect
              x="90"
              y="40"
              width="100"
              height="90"
              rx="15"
              fill="url(#robotGradient)"
              stroke="hsl(var(--primary))"
              strokeWidth="3"
              filter="url(#glow)"
            />
            <rect
              x="90"
              y="40"
              width="100"
              height="90"
              rx="15"
              fill="hsl(var(--card))"
              fillOpacity="0.9"
            />

            {/* Antenna */}
            <motion.g
              animate={state === "thinking" ? { rotate: [0, 15, -15, 0] } : {}}
              transition={{ repeat: Infinity, duration: 1 }}
              style={{ originX: "140px", originY: "40px" }}
            >
              <line
                x1="140"
                y1="40"
                x2="140"
                y2="20"
                stroke="hsl(var(--primary))"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <motion.circle
                cx="140"
                cy="15"
                r="6"
                fill={state === "thinking" ? "hsl(var(--accent))" : "hsl(var(--primary))"}
                animate={{
                  scale: state === "thinking" ? [1, 1.3, 1] : 1,
                }}
                transition={{ repeat: Infinity, duration: 0.5 }}
              />
              <motion.circle
                cx="140"
                cy="15"
                r="8"
                fill={state === "thinking" ? "hsl(var(--accent))" : "hsl(var(--primary))"}
                opacity="0.3"
                animate={{
                  scale: state === "thinking" ? [1, 1.5, 1] : 1,
                  opacity: state === "thinking" ? [0.3, 0, 0.3] : 0.3,
                }}
                transition={{ repeat: Infinity, duration: 0.5 }}
              />
            </motion.g>

            {/* Eyes with glow effect */}
            <motion.g>
              {/* Eye glow */}
              <ellipse
                cx="115"
                cy="75"
                rx="16"
                ry="16"
                fill={state === "listening" ? "hsl(var(--accent))" : "hsl(var(--primary))"}
                opacity="0.3"
                filter="url(#glow)"
              />
              <ellipse
                cx="165"
                cy="75"
                rx="16"
                ry="16"
                fill={state === "listening" ? "hsl(var(--accent))" : "hsl(var(--primary))"}
                opacity="0.3"
                filter="url(#glow)"
              />
              {/* Main eyes */}
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
              {/* Eye highlights */}
              <ellipse cx="118" cy="72" rx="4" ry="5" fill="white" opacity="0.6" />
              <ellipse cx="168" cy="72" rx="4" ry="5" fill="white" opacity="0.6" />
            </motion.g>

            {/* Mouth with animation bars */}
            <motion.g>
              <motion.rect
                x="120"
                y="105"
                width="40"
                height="10"
                rx="5"
                fill="hsl(var(--foreground))"
                animate={getMouthAnimation()}
              />
              {state === "speaking" && (
                <>
                  <motion.rect
                    x="125"
                    y="107"
                    width="4"
                    height="6"
                    rx="2"
                    fill="hsl(var(--primary))"
                    animate={{ scaleY: [1, 1.8, 1] }}
                    transition={{ repeat: Infinity, duration: 0.3, delay: 0 }}
                  />
                  <motion.rect
                    x="133"
                    y="107"
                    width="4"
                    height="6"
                    rx="2"
                    fill="hsl(var(--accent))"
                    animate={{ scaleY: [1, 1.5, 1] }}
                    transition={{ repeat: Infinity, duration: 0.3, delay: 0.1 }}
                  />
                  <motion.rect
                    x="141"
                    y="107"
                    width="4"
                    height="6"
                    rx="2"
                    fill="hsl(var(--primary))"
                    animate={{ scaleY: [1, 1.6, 1] }}
                    transition={{ repeat: Infinity, duration: 0.3, delay: 0.2 }}
                  />
                  <motion.rect
                    x="149"
                    y="107"
                    width="4"
                    height="6"
                    rx="2"
                    fill="hsl(var(--accent))"
                    animate={{ scaleY: [1, 1.7, 1] }}
                    transition={{ repeat: Infinity, duration: 0.3, delay: 0.15 }}
                  />
                </>
              )}
            </motion.g>
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

          {/* Body with gradient */}
          <rect
            x="80"
            y="150"
            width="120"
            height="100"
            rx="20"
            fill="url(#robotGradient)"
            stroke="hsl(var(--primary))"
            strokeWidth="3"
            filter="url(#glow)"
          />
          <rect
            x="80"
            y="150"
            width="120"
            height="100"
            rx="20"
            fill="hsl(var(--card))"
            fillOpacity="0.9"
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
            opacity="0.5"
          />

          {/* Animated Chest Circles */}
          <motion.circle
            cx="140"
            cy="185"
            r="3"
            fill={getAuraColor()}
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1, delay: 0 }}
          />
          <motion.circle
            cx="150"
            cy="190"
            r="2"
            fill={getAuraColor()}
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
          />
          <motion.circle
            cx="130"
            cy="190"
            r="2"
            fill={getAuraColor()}
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
          />

          {/* Status Indicator */}
          <motion.circle
            cx="140"
            cy="200"
            r="10"
            fill={getAuraColor()}
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          />
          <motion.circle
            cx="140"
            cy="200"
            r="8"
            fill={getAuraColor()}
            animate={{ scale: [1, 1.2, 1] }}
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

      {/* Status Text with Icon */}
      <div className="text-center space-y-4">
        <motion.div
          className="flex items-center justify-center gap-3"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <motion.div
            className="p-3 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30"
            animate={{
              scale: [1, 1.1, 1],
              rotate: state === "thinking" ? [0, 360] : 0,
            }}
            transition={{
              scale: { repeat: Infinity, duration: 2 },
              rotate: { repeat: Infinity, duration: 2, ease: "linear" },
            }}
            style={{ color: getAuraColor() }}
          >
            {getStateIcon()}
          </motion.div>
          <div>
            <motion.div
              className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
              animate={{ opacity: [0.8, 1, 0.8] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              {state === "idle" && "Ready to debate"}
              {state === "listening" && "Listening to you..."}
              {state === "speaking" && "Presenting argument"}
              {state === "thinking" && "Analyzing your points..."}
            </motion.div>
            <div className="text-xs text-muted-foreground mt-1">
              {state === "idle" && "Press 'Start Speaking' to begin"}
              {state === "listening" && "Speak clearly into your microphone"}
              {state === "speaking" && "AI opponent is responding"}
              {state === "thinking" && "Processing your argument"}
            </div>
          </div>
        </motion.div>

        {/* Enhanced Speech Bubble */}
        <AnimatePresence>
          {currentText && state === "speaking" && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="max-w-2xl mx-auto"
            >
              <div className="relative p-6 bg-gradient-to-br from-primary/10 via-accent/10 to-primary/10 rounded-2xl border-2 border-primary/30 shadow-2xl backdrop-blur-sm">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-gradient-to-br from-primary/10 to-accent/10 border-t-2 border-l-2 border-primary/30 rotate-45" />
                <motion.div
                  className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/5 to-accent/5"
                  animate={{
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{ repeat: Infinity, duration: 2 }}
                />
                <div className="relative">
                  <div className="flex items-start gap-3 mb-2">
                    <Volume2 className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-base leading-relaxed font-medium">{currentText}</p>
                    </div>
                  </div>
                  <motion.div
                    className="h-1 bg-gradient-to-r from-primary via-accent to-primary rounded-full"
                    animate={{
                      scaleX: [0, 1],
                    }}
                    transition={{
                      duration: currentText.length * 0.05,
                      ease: "linear",
                    }}
                    style={{ originX: 0 }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
