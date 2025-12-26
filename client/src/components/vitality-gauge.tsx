import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { Zap, Moon, Sun, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useCallback, useMemo } from "react";
import type { EnergyLevel, EnergyTask } from "@shared/schema";

const energyTasks: Record<EnergyLevel, EnergyTask[]> = {
  low: [
    { label: "Meditate / Rest", duration: "10 min" },
    { label: "Nap", duration: "20-30 min" },
    { label: "Hydrate & Eat", duration: "5-10 min" },
    { label: "Listen to Podcast", duration: "20 min" },
  ],
  medium: [
    { label: "Light Cleanup", duration: "15-20 min" },
    { label: "Reply to Messages", duration: "15 min" },
    { label: "Laundry Prep", duration: "10 min" },
    { label: "Meal Prep", duration: "30 min" },
  ],
  high: [
    { label: "Fix Sunroom Shelving", duration: "1-2 hours" },
    { label: "Paint Accent Wall", duration: "2-3 hours" },
    { label: "Deep Project Work", duration: "2+ hours" },
    { label: "Deep Clean", duration: "45 min - 1 hour" },
  ],
};

const energyConfig = {
  low: {
    color: "text-nebula-cyan",
    bgGlow: "bg-nebula-cyan/30",
    borderGlow: "border-nebula-cyan/40",
    shadowGlow: "shadow-[0_0_30px_rgba(34,211,238,0.25)]",
    gradientColor: "radial-gradient(circle at 50% 50%, rgba(34, 211, 238, 0.3) 0%, transparent 70%)",
    icon: Moon,
    label: "Low",
    message: "Rest is productive.",
  },
  medium: {
    color: "text-nebula-blue",
    bgGlow: "bg-nebula-blue/30",
    borderGlow: "border-nebula-blue/40",
    shadowGlow: "shadow-[0_0_30px_rgba(59,130,246,0.25)]",
    gradientColor: "radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.3) 0%, transparent 70%)",
    icon: Sun,
    label: "Medium",
    message: "Steady progress.",
  },
  high: {
    color: "text-glow-purple",
    bgGlow: "bg-glow-purple/30",
    borderGlow: "border-glow-purple/40",
    shadowGlow: "shadow-[0_0_30px_rgba(139,92,246,0.25)]",
    gradientColor: "radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.4) 0%, transparent 70%)",
    icon: Zap,
    label: "High",
    message: "You're unstoppable.",
  },
};

const identityAffirmations: Record<EnergyLevel, string> = {
  low: "You're grounded. You're present. Rest is productive.",
  medium: "You're steady. You're capable. Progress builds momentum.",
  high: "You're unstoppable. You're focused. This is your time.",
};

const breathingVariants = {
  low: { scale: [1, 1.05, 1], opacity: [0.5, 0.8, 0.5] },
  medium: { scale: [1, 1.02, 1], opacity: [0.8, 1, 0.8] },
  high: { scale: [1, 1.1, 1], opacity: [0.9, 1, 0.9] },
};

const breathingTransition = {
  low: { duration: 6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
  medium: { duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
  high: { duration: 0.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
};

interface VitalityGaugeProps {
  energyLevel: EnergyLevel;
  streak: number;
  onEnergyChange: (level: EnergyLevel) => void;
  isUpdating?: boolean;
}

export function VitalityGauge({ energyLevel, streak, onEnergyChange, isUpdating }: VitalityGaugeProps) {
  const config = useMemo(() => energyConfig[energyLevel], [energyLevel]);
  const Icon = config.icon;
  const currentTasks = useMemo(() => energyTasks[energyLevel], [energyLevel]);
  const affirmation = useMemo(() => identityAffirmations[energyLevel], [energyLevel]);

  // Persist energy level to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("sanctuary-energy", energyLevel);
      } catch (e) {
        // Silently fail if localStorage is unavailable
      }
    }
  }, [energyLevel]);

  const handleCycle = useCallback(() => {
    const nextLevel: EnergyLevel = energyLevel === "low" ? "medium" : energyLevel === "medium" ? "high" : "low";
    onEnergyChange(nextLevel);

    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(15);
    }
  }, [energyLevel, onEnergyChange]);

  return (
    <SpotlightCard className="h-full flex flex-col transition-all duration-500 relative overflow-hidden backdrop-blur-xl">
      <motion.div
        className="absolute inset-0 opacity-20 pointer-events-none"
        animate={{
          background: config.gradientColor,
        }}
        transition={{ duration: 1.5 }}
      />

      <CardHeader className="pb-4 z-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle
              className="text-xl md:text-2xl font-mono tracking-tight text-gray-200"
              data-testid="text-vitality-title"
            >
              Vitality_Gauge
            </CardTitle>
            <CardDescription className="text-sm md:text-base mt-1 font-mono">System_State</CardDescription>
          </div>
          <motion.div
            className="text-right"
            key={streak}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <div className={`text-2xl md:text-3xl font-black ${config.color}`} data-testid="text-streak-count">
              {streak}
            </div>
            <div className="text-xs text-muted-foreground font-medium">day streak</div>
          </motion.div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4 md:gap-6 z-10 items-center justify-center">
        <motion.div
          onClick={handleCycle}
          className="relative cursor-pointer"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <div className="w-40 h-40 md:w-56 md:h-56 rounded-full relative">
            {/* Outer atmospheric glow layer */}
            <motion.div
              className={`absolute inset-0 rounded-full blur-3xl ${
                energyLevel === "low"
                  ? "bg-cyan-500/15"
                  : energyLevel === "medium"
                    ? "bg-blue-500/15"
                    : "bg-purple-500/20"
              }`}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            />

            {/* Primary outer ring with glow */}
            <div
              className="absolute inset-0 rounded-full border border-white/10 shadow-[0_0_40px_rgba(255,255,255,0.08),inset_0_0_40px_rgba(0,0,0,0.3)]"
            />

            {/* Secondary depth ring */}
            <div
              className="absolute inset-1 rounded-full border border-white/5 shadow-[inset_0_0_30px_rgba(0,0,0,0.4)]"
            />

            {/* Breathing glow layer */}
            <motion.div
              className={`absolute inset-2 rounded-full blur-2xl ${
                energyLevel === "low"
                  ? "bg-cyan-500/20"
                  : energyLevel === "medium"
                    ? "bg-blue-500/20"
                    : "bg-purple-500/30"
              }`}
              variants={breathingVariants}
              animate={energyLevel}
              transition={breathingTransition[energyLevel]}
            />

            <motion.button
              data-testid="button-energy-cycle"
              className={`
                absolute inset-4 rounded-full 
                border-[6px] border-steel-light/40 
                bg-gradient-to-br from-steel-medium/80 to-steel-dark/90 
                flex flex-col items-center justify-center 
                cursor-pointer transition-colors duration-300
                hover:border-steel-light/60
                shadow-[
                  0_20px_40px_rgba(0,0,0,0.5),
                  inset_-8px_-8px_16px_rgba(0,0,0,0.4),
                  inset_8px_8px_16px_rgba(255,255,255,0.05),
                  inset_0_-12px_20px_rgba(0,0,0,0.3)
                ]
              `}
            >
              {/* Highlight gradient overlay */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/8 via-transparent to-transparent pointer-events-none" />

              <motion.div
                key={energyLevel}
                initial={{ y: 20, opacity: 0, scale: 0.8 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className={`mb-2 ${config.color} relative z-10`}
              >
                <Icon className="w-12 h-12" strokeWidth={1.5} />
              </motion.div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={energyLevel}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className={`text-4xl font-black capitalize ${config.color} relative z-10`}
                >
                  {config.label}
                </motion.div>
              </AnimatePresence>
              <div className="text-xs text-muted-foreground font-medium mt-2 relative z-10">Click to cycle</div>
            </motion.button>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={energyLevel}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            <div className="text-xs text-gray-500 font-mono uppercase tracking-widest mb-2">Current_Protocol</div>
            <div className="text-lg font-light text-cyan-100">
              {energyLevel === "low" && "Disconnect. Hydrate. Breathe."}
              {energyLevel === "medium" && "Maintain flow. Clear small tasks."}
              {energyLevel === "high" && "Execute heavy lift. Build Sunroom."}
            </div>
          </motion.div>
        </AnimatePresence>

        <motion.div
          className={`w-full text-center px-4 py-3 rounded-lg steel-surface border ${config.borderGlow}`}
          animate={{
            borderColor:
              energyLevel === "low"
                ? "rgba(34, 211, 238, 0.4)"
                : energyLevel === "medium"
                  ? "rgba(59, 130, 246, 0.4)"
                  : "rgba(139, 92, 246, 0.4)",
          }}
          transition={{ duration: 0.5 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={energyLevel}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`text-sm italic ${config.color}/80`}
              data-testid="text-affirmation"
            >
              {affirmation}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        <div className="space-y-3 flex-1 w-full">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Suggested Activities
          </div>
          <motion.div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-hide" layout>
            <AnimatePresence mode="popLayout">
              {currentTasks.map((task, idx) => (
                <motion.div
                  key={`${energyLevel}-${idx}`}
                  data-testid={`card-task-${idx}`}
                  className="flex items-center gap-3 p-3 rounded-lg steel-surface border border-border/40 hover:border-border/60 transition-all group cursor-pointer"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 25,
                    delay: idx * 0.05,
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ArrowRight className={`w-4 h-4 ${config.color} flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground">{task.label}</div>
                    <div className="text-xs text-muted-foreground">{task.duration}</div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </CardContent>
    </SpotlightCard>
  );
}
