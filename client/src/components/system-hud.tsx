import { useState, useEffect } from "react";
import { Battery, Wifi, Signal } from "lucide-react";
import { motion } from "framer-motion";

interface SystemHUDProps {
  streak?: number;
}

export function SystemHUD({ streak = 0 }: SystemHUDProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
  };

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 h-12 px-4 md:px-6 flex items-center justify-between backdrop-blur-xl bg-black/40 border-b border-white/5"
      initial={{ y: -48, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      data-testid="system-hud"
    >
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
        <span className="font-mono text-xs text-gray-400 tracking-wider" data-testid="text-system-title">
          Sanctuary_OS <span className="text-gray-600">v1.0</span>
        </span>
      </div>

      <div className="flex items-center gap-4">
        {streak > 0 && (
          <motion.div
            className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-nebula-cyan/10 border border-nebula-cyan/20"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            data-testid="text-hud-streak"
          >
            <span className="text-xs font-mono text-nebula-cyan">{streak}</span>
            <span className="text-[10px] text-gray-500">streak</span>
          </motion.div>
        )}

        <div className="hidden md:flex items-center gap-3 text-gray-500">
          <Signal className="w-3.5 h-3.5" />
          <Wifi className="w-3.5 h-3.5" />
          <Battery className="w-4 h-4" />
        </div>

        <div className="text-right">
          <div className="font-mono text-xs text-gray-300" data-testid="text-hud-time">
            {formatTime(time)}
          </div>
          <div className="font-mono text-[10px] text-gray-600 hidden md:block">
            {formatDate(time)}
          </div>
        </div>
      </div>
    </motion.header>
  );
}
