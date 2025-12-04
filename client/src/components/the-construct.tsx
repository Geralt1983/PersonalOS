import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Check, Circle, Trash2, Hammer } from "lucide-react";
import { SpotlightCard } from "@/components/ui/spotlight-card";

interface MicroStep {
  id: string;
  title: string;
  completed: boolean;
  effort: "quick" | "medium" | "heavy";
}

const STORAGE_KEY = "sanctuary-construct";

const defaultSteps: MicroStep[] = [
  { id: "1", title: "Clear room debris", completed: true, effort: "medium" },
  { id: "2", title: "Measure for shelving", completed: false, effort: "quick" },
];

export function TheConstruct() {
  const [steps, setSteps] = useState<MicroStep[]>(defaultSteps);
  const [newStep, setNewStep] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          setSteps(JSON.parse(saved));
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
        localStorage.setItem(STORAGE_KEY, JSON.stringify(steps));
      } catch (e) {
        // Silently fail
      }
    }
  }, [steps, isLoaded]);

  const handleAddStep = () => {
    if (newStep.trim()) {
      const step: MicroStep = {
        id: Date.now().toString(),
        title: newStep.trim(),
        completed: false,
        effort: "medium",
      };
      setSteps([...steps, step]);
      setNewStep("");

      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(10);
      }
    }
  };

  const toggleStep = (id: string) => {
    setSteps(steps.map(step => 
      step.id === id ? { ...step, completed: !step.completed } : step
    ));

    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  const deleteStep = (id: string) => {
    setSteps(steps.filter(step => step.id !== id));
  };

  const completedCount = steps.filter(s => s.completed).length;
  const completionPercentage = steps.length > 0 ? (completedCount / steps.length) * 100 : 0;

  return (
    <SpotlightCard className="overflow-hidden relative backdrop-blur-xl flex flex-col h-full">
      {/* Header */}
      <div className="p-5 pb-4 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <motion.div
              initial={{ rotate: -20, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.6, type: "spring" }}
              className="text-purple-400"
            >
              <Hammer className="w-5 h-5" />
            </motion.div>
            <h2 className="text-sm font-mono font-bold tracking-[0.15em] text-purple-400 uppercase">
              The_Construct
            </h2>
          </div>
          <motion.div
            key={completedCount}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="text-sm font-mono text-purple-400 border border-purple-400/30 rounded px-3 py-1 bg-purple-400/5"
            data-testid="text-construct-progress"
          >
            {completedCount}/{steps.length}
          </motion.div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 via-purple-400 to-cyan-400"
            initial={{ width: 0 }}
            animate={{ width: `${completionPercentage}%` }}
            transition={{ duration: 0.4, type: "spring" }}
          />
        </div>
        <div className="text-right text-xs text-muted-foreground mt-1">
          {Math.round(completionPercentage)}% Complete
        </div>
      </div>

      {/* Add Step Input */}
      <div className="px-5 pb-4 relative z-10">
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-4 py-3">
          <input
            type="text"
            placeholder="Add micro-step..."
            value={newStep}
            onChange={(e) => setNewStep(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAddStep()}
            className="flex-1 bg-transparent outline-none placeholder-muted-foreground text-sm text-foreground"
            data-testid="input-add-step"
          />
          <motion.button
            onClick={handleAddStep}
            className="p-2 hover:bg-white/10 rounded-lg transition text-purple-400"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            data-testid="button-add-step"
          >
            <Plus className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Steps List */}
      <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-2 relative z-10">
        <AnimatePresence mode="popLayout">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20, scale: 0.9 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              className={`relative p-4 rounded-lg border cursor-pointer transition-all duration-300 group ${
                step.completed
                  ? "bg-purple-500/10 border-purple-500/30"
                  : "border-white/10 bg-white/5 hover:bg-white/10"
              }`}
              onClick={() => toggleStep(step.id)}
              data-testid={`card-step-${step.id}`}
            >
              {/* Left accent border for completed */}
              {step.completed && (
                <motion.div
                  className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-400 to-purple-600 rounded-l"
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 0.3 }}
                  style={{ originY: 0 }}
                />
              )}

              <div className="flex items-center gap-3">
                <motion.div
                  className="flex-shrink-0"
                  animate={{ scale: step.completed ? 1.1 : 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  {step.completed ? (
                    <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  ) : (
                    <Circle className="w-5 h-5 text-muted-foreground" />
                  )}
                </motion.div>

                <p className={`flex-1 text-sm transition-all ${
                  step.completed ? "text-muted-foreground line-through" : "text-foreground"
                }`}>
                  {step.title}
                </p>

                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteStep(step.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-all"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  data-testid={`button-delete-step-${step.id}`}
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {steps.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No steps yet. Add one above.
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 pb-4 pt-2 border-t border-white/5 relative z-10">
        <div className="text-xs font-mono text-muted-foreground/60 tracking-wide">
          SANCTUARY_OS • PROJECT_TRACKER_ACTIVE
        </div>
      </div>
    </SpotlightCard>
  );
}

export default TheConstruct;
