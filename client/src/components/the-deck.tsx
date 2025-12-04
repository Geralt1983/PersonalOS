import { motion } from "framer-motion";
import { Activity, Anchor, Brain, Hammer, BarChart3, Trophy, FileText } from "lucide-react";

export type DeckView = "gauge" | "anchor" | "brain" | "construct" | "history" | "momentum" | "reflection";

interface DeckItem {
  id: DeckView;
  icon: typeof Activity;
  label: string;
  color: string;
}

const deckItems: DeckItem[] = [
  { id: "gauge", icon: Activity, label: "Vitality", color: "text-purple-400" },
  { id: "anchor", icon: Anchor, label: "Anchor", color: "text-cyan-400" },
  { id: "brain", icon: Brain, label: "Brain Dump", color: "text-blue-400" },
  { id: "construct", icon: Hammer, label: "Construct", color: "text-orange-400" },
  { id: "history", icon: BarChart3, label: "History", color: "text-green-400" },
  { id: "momentum", icon: Trophy, label: "Momentum", color: "text-yellow-400" },
  { id: "reflection", icon: FileText, label: "Reflect", color: "text-pink-400" },
];

interface TheDeckProps {
  currentView: DeckView;
  onChangeView: (view: DeckView) => void;
}

export function TheDeck({ currentView, onChangeView }: TheDeckProps) {
  return (
    <motion.nav
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.2 }}
      data-testid="the-deck"
    >
      <div className="flex items-end gap-1 px-3 py-2 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/50">
        {deckItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <motion.button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className={`
                relative flex flex-col items-center justify-center p-2 md:p-3 rounded-xl transition-colors
                ${isActive ? "bg-white/10" : "hover:bg-white/5"}
              `}
              whileHover={{ scale: 1.15, y: -4 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              data-testid={`deck-item-${item.id}`}
            >
              <motion.div
                animate={{
                  scale: isActive ? 1.1 : 1,
                }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                <Icon
                  className={`w-5 h-5 md:w-6 md:h-6 ${isActive ? item.color : "text-gray-500"}`}
                  strokeWidth={isActive ? 2 : 1.5}
                />
              </motion.div>

              {isActive && (
                <motion.div
                  className="absolute -bottom-1 w-1 h-1 rounded-full bg-white"
                  layoutId="deck-indicator"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}

              <span
                className={`
                  hidden md:block text-[10px] mt-1 font-medium
                  ${isActive ? "text-gray-200" : "text-gray-600"}
                `}
              >
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </motion.nav>
  );
}
