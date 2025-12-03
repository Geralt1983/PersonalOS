import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { Anchor as AnchorIcon, Droplets, Smartphone, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const anchorIcons: Record<number, typeof Droplets> = {
  1: Droplets,
  2: Smartphone,
  3: BookOpen,
};

interface AnchorItem {
  id: number;
  label: string;
  active: boolean;
}

interface TheAnchorProps {
  anchors: AnchorItem[];
  onToggle: (id: number) => void;
}

export function TheAnchor({ anchors, onToggle }: TheAnchorProps) {
  const activeCount = anchors.filter((a) => a.active).length;

  const handleToggle = (id: number) => {
    onToggle(id);
    
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  return (
    <SpotlightCard className="overflow-hidden relative backdrop-blur-xl">
      <div className="subtle-grid absolute inset-0 pointer-events-none" />
      
      <CardHeader className="pb-3 relative z-10">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-xs font-mono font-bold tracking-[0.2em] text-nebula-cyan uppercase flex items-center gap-2">
            <AnchorIcon className="w-4 h-4" />
            The_Anchor
          </CardTitle>
          <motion.span 
            className="text-xs font-semibold text-nebula-cyan px-2 py-1 rounded-full bg-nebula-cyan/10 border border-nebula-cyan/30"
            data-testid="text-anchor-progress"
            key={activeCount}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
          >
            {activeCount}/{anchors.length}
          </motion.span>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-3 relative z-10">
        {anchors.map((anchor) => {
          const Icon = anchorIcons[anchor.id] || Droplets;
          
          return (
            <motion.div 
              key={anchor.id} 
              onClick={() => handleToggle(anchor.id)} 
              className="group cursor-pointer relative"
              data-testid={`toggle-anchor-${anchor.id}`}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <motion.div
                className={`
                  relative h-14 rounded-xl flex items-center px-4 gap-3 border
                  ${anchor.active 
                    ? "bg-nebula-blue/10 border-nebula-blue/30" 
                    : "bg-white/5 border-white/5 hover:bg-white/10"
                  }
                `}
                animate={{
                  borderColor: anchor.active ? "rgba(59, 130, 246, 0.3)" : "rgba(255, 255, 255, 0.05)"
                }}
                transition={{ duration: 0.3 }}
              >
                <AnimatePresence>
                  {anchor.active && (
                    <motion.div 
                      className="absolute inset-0 bg-nebula-blue/10 blur-xl rounded-xl"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </AnimatePresence>

                <motion.div
                  className={`
                    absolute left-0 top-0 bottom-0 w-1 rounded-l-xl
                    ${anchor.active ? "bg-nebula-cyan glow-bar" : "bg-transparent"}
                  `}
                  animate={{
                    opacity: anchor.active ? 1 : 0,
                    scaleY: anchor.active ? 1 : 0.5
                  }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />

                <motion.div
                  className={`w-5 h-5 flex-shrink-0 ${anchor.active ? "text-cyan-400" : "text-gray-400"}`}
                  animate={{
                    scale: anchor.active ? 1.1 : 1
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  <Icon className="w-5 h-5" />
                </motion.div>

                <span
                  className={`flex-1 font-medium z-10 transition-colors duration-200 ${anchor.active ? "text-foreground" : "text-muted-foreground"}`}
                >
                  {anchor.label}
                </span>

                <div className="physics-toggle-track relative">
                  <motion.div 
                    className={`w-5 h-5 rounded-full shadow-lg ${anchor.active ? "bg-cyan-400" : "bg-gray-600"}`}
                    animate={{ 
                      x: anchor.active ? 20 : 0,
                      backgroundColor: anchor.active ? "#22d3ee" : "#4b5563"
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30
                    }}
                  />
                </div>
              </motion.div>
            </motion.div>
          );
        })}
        
        <AnimatePresence>
          {activeCount === anchors.length && (
            <motion.div 
              className="text-center text-xs text-nebula-cyan/80 italic mt-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              All anchors set. You're grounded.
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </SpotlightCard>
  );
}
