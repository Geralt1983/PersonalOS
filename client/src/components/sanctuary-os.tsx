import { useState } from "react"
import BrainDump from "./brain-dump"
import TheConstruct from "./the-construct"
import DockNavigation from "./dock-navigation"

export default function SanctuaryOS() {
  const [activeTab, setActiveTab] = useState("vitality")

  return (
    <div className="min-h-screen w-full bg-zinc-950 text-white overflow-hidden flex flex-col relative">
      {/* Status Bar */}
      <div className="h-10 border-b border-white/10 px-6 flex items-center justify-between text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span className="font-mono">Sanctuary_OS v1.0</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <span className="bg-cyan-400 text-cyan-950 px-2 py-1 rounded text-xs font-semibold">8 streak</span>
          </div>
          <span>📶</span>
          <span>🔋</span>
          <span className="ml-2">10:53 PM</span>
          <span className="text-zinc-600">Wed, Dec 3</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex px-6 py-6 gap-6 overflow-hidden">
        <BrainDump />
        <TheConstruct />
      </div>

      {/* Floating Dock */}
      <DockNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  )
}
