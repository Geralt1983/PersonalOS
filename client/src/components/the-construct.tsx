import { useState, useEffect, useCallback } from "react";
import { Plus, Check, Circle, Trash2, Hammer } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

interface Task {
  id: number;
  text: string;
  completed: boolean;
}

export function TheConstruct() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. Load from Memory on Mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem("sanctuary-construct");
      if (saved) {
        try {
          setTasks(JSON.parse(saved));
        } catch (e) {
          // Silently fail if parse error
        }
      } else {
        // Default starter if empty
        setTasks([
          { id: 1, text: "Clear room debris", completed: true },
          { id: 2, text: "Measure for shelving", completed: false },
        ]);
      }
      setIsLoaded(true);
    }
  }, []);

  // 2. Auto-Save on Change
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      try {
        localStorage.setItem("sanctuary-construct", JSON.stringify(tasks));
      } catch (e) {
        // Silently fail if localStorage is unavailable
      }
    }
  }, [tasks, isLoaded]);

  const addTask = useCallback((e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim()) return;

    const newTask = {
      id: Date.now(),
      text: inputValue,
      completed: false,
    };
    
    // Add to end of list
    setTasks(prev => [...prev, newTask]);
    setInputValue("");
  }, [inputValue]);

  const toggleTask = useCallback((id: number) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  }, []);

  const deleteTask = useCallback((id: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent toggling when clicking delete
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  // Calculate Progress
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

  // Show loading skeleton while data loads from localStorage
  if (!isLoaded) {
    return (
      <div className="flex-1 border border-white/10 rounded-lg p-6 bg-zinc-950/50 backdrop-blur flex flex-col min-h-0 h-full">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <Skeleton className="w-5 h-5" />
            <Skeleton className="h-6 w-32" />
          </div>
          <Skeleton className="h-1 w-full rounded-full mb-2" />
          <div className="flex justify-end">
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
        <div className="mb-6">
          <Skeleton className="h-12 w-full rounded" />
        </div>
        <div className="flex-1 space-y-3">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-14 w-full rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 border border-white/10 rounded-lg p-6 bg-zinc-950/50 backdrop-blur flex flex-col min-h-0 h-full">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <Hammer className="w-5 h-5 text-purple-400" />
          <h1 className="text-xl font-mono font-semibold text-purple-400" data-testid="text-construct-title">
            THE_CONSTRUCT
          </h1>
        </div>

        {/* Progress Bar */}
        <div className="mb-2">
          <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 via-purple-400 to-cyan-400"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ type: "spring", stiffness: 50, damping: 20 }}
            />
          </div>
        </div>

        <div className="text-right text-xs text-zinc-400" data-testid="text-construct-progress">
          {progress}% Complete
        </div>
      </div>

      {/* Add Step Input */}
      <div className="mb-6">
        <form onSubmit={addTask} className="flex items-center gap-2 bg-zinc-900/50 border border-white/10 rounded px-4 py-3">
          <input
            type="text"
            placeholder="Add micro-step..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1 bg-transparent outline-none placeholder-zinc-600 text-sm"
            data-testid="input-construct-step"
          />
          <button 
            type="submit"
            className="p-1.5 hover:bg-white/10 rounded transition"
            data-testid="button-add-construct-step"
          >
            <Plus className="w-4 h-4 text-zinc-400" />
          </button>
        </form>
      </div>

      {/* Steps List */}
      <div className="flex-1 overflow-y-auto space-y-3 scrollbar-hide">
        <AnimatePresence mode="popLayout">
          {tasks.map((task) => (
            <motion.div
              key={task.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={() => toggleTask(task.id)}
              className={`p-4 border rounded cursor-pointer transition-all group ${
                task.completed
                  ? "bg-purple-600/20 border-purple-500/30 hover:bg-purple-600/30"
                  : "border-white/10 bg-zinc-900/30 hover:bg-zinc-900/50"
              }`}
              data-testid={`card-construct-task-${task.id}`}
            >
              <div className="flex items-center gap-3">
                <button className="flex-shrink-0">
                  {task.completed ? (
                    <motion.div 
                      className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      <Check className="w-3 h-3 text-white" />
                    </motion.div>
                  ) : (
                    <Circle className="w-5 h-5 text-zinc-600" />
                  )}
                </button>
                <p className={`text-sm transition-all flex-1 ${
                  task.completed ? "text-zinc-400 line-through" : "text-white"
                }`}>
                  {task.text}
                </p>
                
                {/* Delete Button (Visible on Hover) */}
                <button 
                  onClick={(e) => deleteTask(task.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-2 text-zinc-500 hover:text-red-400 transition-all"
                  data-testid={`button-delete-construct-${task.id}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {tasks.length === 0 && (
          <div className="text-center py-8 text-xs text-zinc-500 italic" data-testid="text-construct-empty">
            Project Initialized. Awaiting input.
          </div>
        )}
      </div>
    </div>
  );
}
