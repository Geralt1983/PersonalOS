"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface BrainDumpEntry {
  id: number
  text: string
  timestamp: string
}

export function BrainDump() {
  const [entries, setEntries] = useState<BrainDumpEntry[]>([
    { id: 1, text: "Order new sheets for sunroom", timestamp: "11:32 PM" },
    { id: 2, text: "Check paint humidity levels tomorrow", timestamp: "10:15 PM" },
    { id: 3, text: "Call contractor about shelving install", timestamp: "9:08 PM" },
  ])
  const [isListening, setIsListening] = useState(false)
  const [textInput, setTextInput] = useState("")
  const recognitionRef = useRef<any>(null)

  const handleAddEntry = () => {
    if (!textInput.trim()) return

    const newEntry: BrainDumpEntry = {
      id: Date.now(),
      text: textInput,
      timestamp: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    }

    setEntries([newEntry, ...entries])
    setTextInput("")
  }

  const handleVoiceCapture = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Speech recognition not supported in this browser")
      return
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition

    if (!recognitionRef.current) {
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.onstart = () => setIsListening(true)
      recognitionRef.current.onend = () => setIsListening(false)
      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join("")
        setTextInput(transcript)
      }
    }

    if (isListening) {
      recognitionRef.current.stop()
    } else {
      recognitionRef.current.start()
    }
  }

  const deleteEntry = (id: number) => {
    setEntries(entries.filter((e) => e.id !== id))
  }

  return (
    <Card className="steel-card border-primary/20 h-fit flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Brain Dump</CardTitle>
        <CardDescription className="text-xs">Capture before it disappears</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddEntry()}
            placeholder="Add thought..."
            className="flex-1 px-2.5 py-1.5 text-xs bg-steel-light/50 border border-border/50 rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
          />
          <button
            onClick={handleVoiceCapture}
            className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
              isListening
                ? "bg-destructive/70 text-destructive-foreground"
                : "bg-steel-light/50 hover:bg-steel-light/70 text-foreground border border-border/50"
            }`}
            title="Voice capture"
          >
            🎤
          </button>
        </div>

        {/* Entries - Compact */}
        <div className="space-y-1.5 max-h-32 overflow-y-auto">
          {entries.length === 0 ? (
            <div className="text-center py-4 text-xs text-muted-foreground">No thoughts yet.</div>
          ) : (
            entries.slice(0, 5).map((entry) => (
              <div
                key={entry.id}
                className="flex items-start gap-2 p-1.5 rounded-md bg-steel-light/20 border border-border/30 hover:border-primary/30 transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-foreground">{entry.text}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{entry.timestamp}</p>
                </div>
                <button
                  onClick={() => deleteEntry(entry.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100 text-xs"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
