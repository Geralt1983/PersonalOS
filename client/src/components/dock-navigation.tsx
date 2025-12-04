"use client"

import { Activity, Anchor, Brain, Wrench, BarChart3, Trophy } from "lucide-react"

interface DockNavProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

const dockItems = [
  { id: "vitality", label: "Vitality", icon: Activity },
  { id: "anchor", label: "Anchor", icon: Anchor },
  { id: "brain", label: "Brain Dump", icon: Brain },
  { id: "construct", label: "Construct", icon: Wrench },
  { id: "history", label: "History", icon: BarChart3 },
  { id: "momentum", label: "Momentum", icon: Trophy },
]

export default function DockNavigation({ activeTab, setActiveTab }: DockNavProps) {
  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2">
      <div className="flex items-center gap-2 bg-zinc-900/70 backdrop-blur border border-white/10 rounded-full px-2 py-2">
        {dockItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 px-4 py-3 rounded-full transition-all ${
                isActive ? "bg-purple-500/30 border border-purple-500/50" : "hover:bg-white/10"
              }`}
              title={item.label}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-purple-400" : "text-zinc-400"}`} />
              <span className={`text-xs ${isActive ? "text-purple-400" : "text-zinc-400"}`}>{item.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
