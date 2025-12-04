import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Mic, Filter, Lightbulb, FileText, Trash2, Brain } from "lucide-react";
import { SpotlightCard } from "@/components/ui/spotlight-card";

type Category = "idea" | "task" | "note" | "reminder";

interface Thought {
  id: string;
  text: string;
  category: Category;
  timestamp: string;
  createdAt: number;
}

const STORAGE_KEY = "sanctuary-dump";

const categoryIcons: Record<Category, typeof Lightbulb> = {
  idea: Lightbulb,
  task: FileText,
  note: FileText,
  reminder: FileText,
};

const categoryColors: Record<Category, string> = {
  idea: "text-amber-400",
  task: "text-blue-400",
  note: "text-slate-400",
  reminder: "text-cyan-400",
};

const defaultThoughts: Thought[] = [];

function formatTimestamp(createdAt: number): string {
  const now = Date.now();
  const diff = now - createdAt;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export function BrainDump() {
  const [thoughts, setThoughts] = useState<Thought[]>(defaultThoughts);
  const [newThought, setNewThought] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          setThoughts(JSON.parse(saved));
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
        localStorage.setItem(STORAGE_KEY, JSON.stringify(thoughts));
      } catch (e) {
        // Silently fail
      }
    }
  }, [thoughts, isLoaded]);

  const detectCategory = (text: string): Category => {
    const lower = text.toLowerCase();
    if (lower.includes("idea") || lower.includes("maybe") || lower.includes("what if")) return "idea";
    if (lower.includes("todo") || lower.includes("need to") || lower.includes("must")) return "task";
    if (lower.includes("remember") || lower.includes("don't forget")) return "reminder";
    return "note";
  };

  const handleAddThought = () => {
    if (newThought.trim()) {
      const thought: Thought = {
        id: Date.now().toString(),
        text: newThought.trim(),
        category: detectCategory(newThought),
        timestamp: "just now",
        createdAt: Date.now(),
      };
      setThoughts([thought, ...thoughts]);
      setNewThought("");

      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(10);
      }
    }
  };

  const deleteThought = (id: string) => {
    setThoughts(thoughts.filter(t => t.id !== id));
  };

  return (
    <SpotlightCard className="overflow-hidden relative backdrop-blur-xl flex flex-col h-full">
      {/* Header */}
      <div className="p-5 pb-4 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div
              initial={{ rotate: -20, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.6, type: "spring" }}
              className="text-blue-400"
            >
              <Brain className="w-5 h-5" />
            </motion.div>
            <div>
              <h2 className="text-sm font-mono font-bold tracking-[0.15em] text-blue-400 uppercase">
                Brain_Dump
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">Unload your mind</p>
            </div>
          </div>
          <motion.button
            className="p-2 hover:bg-white/10 rounded-lg transition text-muted-foreground"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Filter className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Input Area */}
      <div className="px-5 pb-4 relative z-10">
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-4 py-3">
          <input
            type="text"
            placeholder="Add thought..."
            value={newThought}
            onChange={(e) => setNewThought(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAddThought()}
            className="flex-1 bg-transparent outline-none placeholder-muted-foreground text-sm text-foreground"
            data-testid="input-add-thought"
          />
          <div className="flex items-center gap-1">
            <motion.button
              className="p-2 hover:bg-white/10 rounded-lg transition text-muted-foreground"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Mic className="w-4 h-4" />
            </motion.button>
            <motion.button
              onClick={handleAddThought}
              className="p-2 hover:bg-white/10 rounded-lg transition text-blue-400"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              data-testid="button-add-thought"
            >
              <Plus className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Thoughts List */}
      <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-2 relative z-10">
        <AnimatePresence mode="popLayout">
          {thoughts.map((thought, index) => {
            const Icon = categoryIcons[thought.category];
            const colorClass = categoryColors[thought.category];

            return (
              <motion.div
                key={thought.id}
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20, scale: 0.9 }}
                transition={{ delay: index * 0.03, duration: 0.3 }}
                className="relative p-4 border border-white/10 rounded-lg bg-white/5 hover:bg-white/10 transition group"
                data-testid={`card-thought-${thought.id}`}
              >
                <div className="flex items-start gap-3">
                  <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${colorClass}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground break-words">
                      {thought.text}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-2 py-0.5 text-xs rounded border ${
                        thought.category === "idea" 
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                          : thought.category === "task"
                          ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                          : thought.category === "reminder"
                          ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                          : "bg-slate-500/10 text-slate-400 border-slate-500/30"
                      }`}>
                        {thought.category}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatTimestamp(thought.createdAt)}
                      </span>
                    </div>
                  </div>
                  <motion.button
                    onClick={() => deleteThought(thought.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-all"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    data-testid={`button-delete-thought-${thought.id}`}
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {thoughts.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No thoughts yet. Add one above.
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 pb-4 pt-2 border-t border-white/5 relative z-10">
        <div className="text-xs font-mono text-muted-foreground/60 tracking-wide">
          {thoughts.length} thoughts captured
        </div>
      </div>
    </SpotlightCard>
  );
}

export default BrainDump;
