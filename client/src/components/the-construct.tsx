import { useState, useEffect } from "react";
import { Plus, Trash2, Hammer } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SpotlightCard } from "@/components/ui/spotlight-card";

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

  const addTask = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim()) return;

    const newTask = {
      id: Date.now(),
      text: inputValue,
      completed: false,
    };
    
    // Add to top of list
    setTasks([newTask, ...tasks]);
    setInputValue("");
  };

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent toggling when clicking delete
    setTasks(tasks.filter(t => t.id !== id));
  };

  // Calculate Progress
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <SpotlightCard className="h-full flex flex-col relative overflow-hidden">
      <div className="p-5 flex-1 flex flex-col h-full">
        
        {/* Header & Progress */}
        <div className="mb-6">
          <div className="flex justify-between items-end mb-2">
            <div className="flex items-center gap-2 text-glow-purple">
              <Hammer size={16} />
              <span className="text-xs font-bold tracking-[0.2em] uppercase font-mono">The_Construct</span>
            </div>
            <span className="text-xs font-mono text-muted-foreground">{progress}% Complete</span>
          </div>
          
          {/* Progress Bar */}
          <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-glow-purple to-nebula-cyan"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ type: "spring", stiffness: 50, damping: 20 }}
            />
          </div>
        </div>

        {/* Input Area */}
        <form onSubmit={addTask} className="relative mb-4 group">
          <input 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Add micro-step..."
            className="w-full bg-black/40 border border-white/10 rounded-lg py-3 pl-4 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-glow-purple/50 focus:ring-1 focus:ring-glow-purple/20 transition-all"
            data-testid="input-construct-step"
          />
          <button 
            type="button"
            onClick={() => addTask()}
            className="absolute right-2 top-2 p-1 rounded-md text-muted-foreground hover:text-glow-purple hover:bg-white/10 transition-colors"
            data-testid="button-add-construct-step"
          >
            <Plus size={18} />
          </button>
        </form>

        {/* Dynamic List */}
        <div className="flex-1 overflow-y-auto pr-1 scrollbar-hide space-y-2">
          <AnimatePresence mode="popLayout">
            {tasks.map(task => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleTask(task.id)}
                className={`
                  group relative p-3 rounded-lg border transition-all duration-300 cursor-pointer select-none flex items-center gap-3
                  ${task.completed 
                    ? 'bg-glow-purple/10 border-glow-purple/10 opacity-60' 
                    : 'bg-white/5 border-white/5 hover:border-white/20'
                  }
                `}
                data-testid={`card-construct-task-${task.id}`}
              >
                {/* Checkbox Graphic */}
                <div className={`
                  w-5 h-5 rounded-full border flex items-center justify-center transition-colors flex-shrink-0
                  ${task.completed ? 'bg-glow-purple border-glow-purple' : 'border-muted-foreground group-hover:border-glow-purple'}
                `}>
                  {task.completed && (
                    <motion.div 
                      initial={{ scale: 0 }} 
                      animate={{ scale: 1 }}
                      className="text-white text-xs font-bold"
                    >
                      ✓
                    </motion.div>
                  )}
                </div>

                {/* Text */}
                <span className={`text-sm flex-1 transition-all ${task.completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                  {task.text}
                </span>

                {/* Delete Button (Visible on Hover/Touch) */}
                <button 
                  onClick={(e) => deleteTask(task.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-2 text-muted-foreground hover:text-destructive transition-all"
                  data-testid={`button-delete-construct-${task.id}`}
                >
                  <Trash2 size={14} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {tasks.length === 0 && (
            <div className="text-center py-8 text-xs text-muted-foreground italic" data-testid="text-construct-empty">
              Project Initialized. Awaiting input.
            </div>
          )}
        </div>
      </div>
    </SpotlightCard>
  );
}
