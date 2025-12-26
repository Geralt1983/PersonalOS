import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Droplet, Smartphone, BookOpen, Anchor as AnchorIcon } from "lucide-react";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { Skeleton } from "@/components/ui/skeleton";

interface Habit {
  id: string;
  label: string;
  value: string;
  icon: typeof Droplet;
  completed: boolean;
}

const defaultHabits: Habit[] = [
  {
    id: "hydrate",
    label: "HYDRATE_PROTOCOL",
    value: "(32oz)",
    icon: Droplet,
    completed: false,
  },
  {
    id: "phone",
    label: "NO_PHONE_IN_BED",
    value: "",
    icon: Smartphone,
    completed: false,
  },
  {
    id: "read",
    label: "READ_PHYSICS",
    value: "(10m)",
    icon: BookOpen,
    completed: false,
  },
];

export function TheAnchor() {
  const [habits, setHabits] = useState<Habit[]>(defaultHabits);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("sanctuary-anchors");
        if (saved) {
          const savedStates = JSON.parse(saved) as { id: string; completed: boolean }[];
          setHabits(prev => prev.map(habit => {
            const savedHabit = savedStates.find(s => s.id === habit.id);
            return savedHabit ? { ...habit, completed: savedHabit.completed } : habit;
          }));
        }
      } catch (e) {
        // Silently fail
      }
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (isLoaded && typeof window !== "undefined") {
      try {
        const states = habits.map(h => ({ id: h.id, completed: h.completed }));
        localStorage.setItem("sanctuary-anchors", JSON.stringify(states));
      } catch (e) {
        // Silently fail
      }
    }
  }, [habits, isLoaded]);

  const toggleHabit = useCallback((id: string) => {
    setHabits(prev => prev.map(h => (h.id === id ? { ...h, completed: !h.completed } : h)));
    
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(10);
    }
  }, []);

  const completedCount = habits.filter(h => h.completed).length;

  // Show loading skeleton while data loads from localStorage
  if (!isLoaded) {
    return (
      <SpotlightCard className="overflow-hidden relative backdrop-blur-xl">
        <div className="p-5 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Skeleton className="w-5 h-5 rounded" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-6 w-12 rounded" />
          </div>
          <Skeleton className="h-1 w-full rounded-full" />
        </div>
        <div className="px-5 pb-5 space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
        <div className="px-5 pb-4 pt-2 border-t border-white/5">
          <Skeleton className="h-3 w-48" />
        </div>
      </SpotlightCard>
    );
  }

  return (
    <SpotlightCard className="overflow-hidden relative backdrop-blur-xl">
      {/* Header */}
      <div className="p-5 pb-4 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <motion.div
              initial={{ rotate: -20, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.6, type: "spring" }}
              className="text-nebula-cyan"
            >
              <AnchorIcon className="w-5 h-5" />
            </motion.div>
            <h2 className="text-sm font-mono font-bold tracking-[0.15em] text-nebula-cyan uppercase">
              The_Anchor
            </h2>
          </div>
          <motion.div
            key={completedCount}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="text-sm font-mono text-nebula-cyan border border-nebula-cyan/30 rounded px-3 py-1 bg-nebula-cyan/5"
            data-testid="text-anchor-progress"
          >
            {completedCount}/3
          </motion.div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-nebula-cyan to-cyan-300"
            initial={{ width: 0 }}
            animate={{ width: `${(completedCount / 3) * 100}%` }}
            transition={{ duration: 0.4, type: "spring" }}
          />
        </div>
      </div>

      {/* Habits List */}
      <div className="px-5 pb-5 space-y-3 relative z-10">
        {habits.map((habit, index) => {
          const Icon = habit.icon;
          
          return (
            <motion.div
              key={habit.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              className={`relative p-4 rounded-lg border transition-all duration-300 ${
                habit.completed
                  ? "border-nebula-cyan/50 bg-gradient-to-r from-slate-800/50 to-slate-900/50 shadow-lg shadow-nebula-cyan/10"
                  : "border-white/10 bg-white/5 hover:border-white/20"
              }`}
              data-testid={`card-anchor-${habit.id}`}
            >
              {/* Left accent border for completed items */}
              {habit.completed && (
                <motion.div
                  className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-nebula-cyan to-cyan-500 rounded-l"
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: index * 0.1 + 0.2, duration: 0.3 }}
                  style={{ originY: 0 }}
                />
              )}

              <div className="flex items-center justify-between gap-4">
                {/* Icon and Label */}
                <div className="flex items-center gap-4 flex-1">
                  <motion.div
                    className={`transition-colors duration-300 ${habit.completed ? "text-nebula-cyan" : "text-muted-foreground"}`}
                    animate={habit.completed ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    <Icon className="w-5 h-5" />
                  </motion.div>
                  <div className="flex-1">
                    <div className="font-mono text-sm font-semibold text-foreground tracking-wider">
                      {habit.label}
                    </div>
                    {habit.value && (
                      <div className="font-sans text-xs text-muted-foreground">{habit.value}</div>
                    )}
                  </div>
                </div>

                {/* Custom Toggle Switch */}
                <motion.button
                  onClick={() => toggleHabit(habit.id)}
                  className="relative w-14 h-8 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-nebula-cyan/50 flex-shrink-0"
                  style={{
                    background: habit.completed
                      ? "linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)"
                      : "#1e293b",
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  data-testid={`toggle-anchor-${habit.id}`}
                >
                  {/* Toggle inner shadow effect */}
                  <motion.div
                    className="absolute inset-0 rounded-full pointer-events-none"
                    style={{
                      boxShadow: habit.completed
                        ? "inset 0 2px 4px rgba(0,0,0,0.3), 0 0 12px rgba(6,182,212,0.4)"
                        : "inset 0 2px 4px rgba(0,0,0,0.8)",
                    }}
                  />

                  {/* Slider thumb */}
                  <motion.div
                    className="absolute top-1 left-1 rounded-full w-6 h-6 bg-slate-900 shadow-lg"
                    animate={{ x: habit.completed ? 24 : 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    style={{
                      boxShadow: habit.completed
                        ? "0 0 8px rgba(6,182,212,0.6), inset 0 1px 2px rgba(0,0,0,0.5)"
                        : "0 2px 4px rgba(0,0,0,0.6)",
                    }}
                  />
                </motion.button>
              </div>
            </motion.div>
          );
        })}

        {/* Completion message */}
        {completedCount === 3 && (
          <motion.div
            className="text-center text-xs text-nebula-cyan/80 italic pt-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            All anchors set. You're grounded.
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 pb-4 pt-2 border-t border-white/5 relative z-10">
        <div className="text-xs font-mono text-muted-foreground/60 tracking-wide">
          SANCTUARY_OS • GROUNDING_PROTOCOL_ACTIVE
        </div>
      </div>
    </SpotlightCard>
  );
}
