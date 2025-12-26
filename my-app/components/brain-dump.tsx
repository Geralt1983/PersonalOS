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

    setEntries((prev) => [newEntry, ...prev])
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
    setEntries((prev) => prev.filter((entry) => entry.id !== id))
  }

  return (
    <Card className="steel-card relative flex flex-col overflow-hidden border border-primary/20 bg-gradient-to-br from-steel-medium/70 via-steel-dark/85 to-steel-dark shadow-[0_32px_90px_-52px_rgba(56,189,248,0.45)]">
      <div className="pointer-events-none absolute -top-20 left-6 h-36 w-36 rounded-full bg-accent/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 right-0 h-32 w-32 rounded-full bg-nebula-cyan/22 blur-3xl" />

      <CardHeader className="relative z-10 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="text-[0.65rem] uppercase tracking-[0.35em] text-muted-foreground/70">Brain dump</div>
            <CardTitle className="text-lg font-semibold">Release valve</CardTitle>
            <CardDescription className="text-xs text-muted-foreground/70">
              Catch fleeting thoughts so you can rest easier.
            </CardDescription>
          </div>
          <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-primary/80">
            {entries.length} logged
          </span>
        </div>
      </CardHeader>

      <CardContent className="relative z-10 space-y-4 pb-5">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 shadow-[0_22px_60px_rgba(15,23,42,0.45)]">
          <label className="flex flex-col gap-2 text-xs text-muted-foreground/70" htmlFor="brain-dump-input">
            <span className="uppercase tracking-[0.35em]">Capture</span>
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.08] px-3 py-2">
              <input
                id="brain-dump-input"
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddEntry()}
                placeholder="What thought wants a safe shelf?"
                className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/80 focus:outline-none"
              />
              <button
                onClick={handleVoiceCapture}
                type="button"
                className={`inline-flex h-9 w-9 items-center justify-center rounded-full border text-sm transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${
                  isListening
                    ? "border-destructive/60 bg-destructive/80 text-destructive-foreground"
                    : "border-white/15 bg-white/5 text-foreground hover:border-primary/40 hover:text-primary"
                }`}
                title="Voice capture"
                aria-pressed={isListening}
              >
                🎤
              </button>
            </div>
          </label>
          <button
            onClick={handleAddEntry}
            type="button"
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-primary/40 bg-primary/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-primary/90 transition-all duration-300 hover:border-primary/60 hover:bg-primary/20"
          >
            Log thought
          </button>
        </div>

        <div className="space-y-2">
          {entries.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-5 text-center text-xs text-muted-foreground/70">
              No thoughts yet. Your mind is clear.
            </div>
          ) : (
            entries.slice(0, 6).map((entry) => (
              <div
                key={entry.id}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 transition-all duration-300 hover:border-primary/40 hover:bg-white/[0.07]"
              >
                <div className="pointer-events-none absolute inset-y-0 right-0 w-14 translate-x-6 bg-gradient-to-l from-primary/15 to-transparent opacity-0 transition-opacity duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                <div className="relative z-10 flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground/90">{entry.text}</p>
                    <p className="text-[0.65rem] uppercase tracking-[0.3em] text-muted-foreground/60">Logged {entry.timestamp}</p>
                  </div>
                  <button
                    onClick={() => deleteEntry(entry.id)}
                    className="text-xs text-muted-foreground transition-colors hover:text-destructive"
                    title="Delete thought"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
