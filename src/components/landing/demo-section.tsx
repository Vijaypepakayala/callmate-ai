"use client"

import { motion } from "framer-motion"
import { Phone, Play, Pause, Volume2, Waves, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState, useRef, useCallback } from "react"

const conversationSteps = [
  {
    role: "ai" as const,
    text: "Good afternoon! Thanks for calling Sunrise Dental. This is Sarah. How can I help you today?",
    emotion: "cheerful",
    ambient: null,
    voice: "Azure.en-US-JennyNeural",
  },
  {
    role: "caller" as const,
    text: "Hi, I'd like to schedule a teeth cleaning appointment.",
    emotion: null,
    ambient: null,
    voice: "Azure.en-US-DavisNeural",
  },
  {
    role: "ai" as const,
    text: "Of course! I'd love to help you with that. Let me check our availability.",
    emotion: "friendly",
    ambient: "typing",
    voice: "Azure.en-US-JennyNeural",
  },
  {
    role: "ai" as const,
    text: "I have openings this Thursday at 2pm and Friday at 10am. Which works better for you?",
    emotion: "friendly",
    ambient: null,
    voice: "Azure.en-US-JennyNeural",
  },
  {
    role: "caller" as const,
    text: "Thursday at 2 works great!",
    emotion: null,
    ambient: null,
    voice: "Azure.en-US-DavisNeural",
  },
  {
    role: "ai" as const,
    text: "Perfect! And may I have your name and phone number for the appointment?",
    emotion: "cheerful",
    ambient: null,
    voice: "Azure.en-US-JennyNeural",
  },
  {
    role: "caller" as const,
    text: "It's Michael Chen, 555-0123.",
    emotion: null,
    ambient: null,
    voice: "Azure.en-US-DavisNeural",
  },
  {
    role: "ai" as const,
    text: "Wonderful, Michael! You're all set for Thursday at 2pm. I'll send you a confirmation text right now. Is there anything else I can help with?",
    emotion: "cheerful",
    ambient: "typing",
    voice: "Azure.en-US-JennyNeural",
  },
]

function WaveformVisualizer({ active }: { active: boolean }) {
  return (
    <div className="flex items-center gap-[3px] h-8">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="w-[3px] rounded-full bg-indigo-500"
          animate={{
            height: active
              ? [8, Math.random() * 28 + 4, 8]
              : 4,
          }}
          transition={{
            duration: 0.4 + Math.random() * 0.3,
            repeat: active ? Infinity : 0,
            repeatType: "reverse",
            delay: i * 0.05,
          }}
        />
      ))}
    </div>
  )
}

export function DemoSection() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(-1)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const abortRef = useRef(false)

  const playAudio = useCallback(async (text: string, voice: string): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      try {
        const res = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, voice }),
        })

        if (!res.ok) {
          console.error('TTS failed:', res.status)
          // Fallback: just wait based on text length
          await new Promise(r => setTimeout(r, text.length * 40))
          resolve()
          return
        }

        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const audio = new Audio(url)
        audioRef.current = audio

        audio.onended = () => {
          URL.revokeObjectURL(url)
          resolve()
        }
        audio.onerror = () => {
          URL.revokeObjectURL(url)
          resolve()
        }

        await audio.play()
      } catch (err) {
        console.error('Audio playback error:', err)
        await new Promise(r => setTimeout(r, text.length * 40))
        resolve()
      }
    })
  }, [])

  const playDemo = useCallback(async () => {
    if (isPlaying) {
      abortRef.current = true
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      setIsPlaying(false)
      setCurrentStep(-1)
      return
    }

    abortRef.current = false
    setIsPlaying(true)
    setIsLoading(true)

    for (let i = 0; i < conversationSteps.length; i++) {
      if (abortRef.current) break

      setCurrentStep(i)
      const step = conversationSteps[i]

      // Small pause before each message
      if (i > 0) await new Promise(r => setTimeout(r, 600))

      setIsLoading(false)

      // Play the audio for this step
      await playAudio(step.text, step.voice)

      if (abortRef.current) break

      // Brief pause between messages
      await new Promise(r => setTimeout(r, 400))
    }

    if (!abortRef.current) {
      // Show completion badge
      setCurrentStep(conversationSteps.length)
      await new Promise(r => setTimeout(r, 3000))
    }

    setIsPlaying(false)
    setCurrentStep(-1)
  }, [isPlaying, playAudio])

  return (
    <section id="demo" className="relative py-32">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
        <div className="absolute top-1/3 right-0 h-[400px] w-[400px] rounded-full bg-purple-500/5 blur-[100px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left — Demo Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="outline" className="mb-6 border-purple-500/30 text-purple-400 px-4 py-1.5">
              <Waves size={12} className="mr-1.5" />
              Live Demo with Real Neural Voices
            </Badge>

            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Hear it in action.
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                It&apos;s uncanny.
              </span>
            </h2>

            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              Listen to a real conversation powered by Telnyx neural voices.
              Notice the emotional tone, natural pacing, and how the AI handles
              booking an appointment seamlessly.
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500/15 text-indigo-400">
                  <Volume2 size={12} />
                </div>
                <div>
                  <p className="font-medium text-sm">Emotional Neural Voice</p>
                  <p className="text-sm text-muted-foreground">Cheerful greetings, empathetic when sensing frustration</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-500/15 text-purple-400">
                  <Phone size={12} />
                </div>
                <div>
                  <p className="font-medium text-sm">Natural Conversation Flow</p>
                  <p className="text-sm text-muted-foreground">Interruption-friendly — just talk over it like a real person</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-pink-500/15 text-pink-400">
                  <Waves size={12} />
                </div>
                <div>
                  <p className="font-medium text-sm">Office Ambiance</p>
                  <p className="text-sm text-muted-foreground">Listen for the subtle keyboard clicks and background sounds</p>
                </div>
              </div>
            </div>

            <div className="mt-10">
              <Button variant="gradient" size="lg" onClick={playDemo} className="group">
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="mr-2 animate-spin" />
                    Loading Voice...
                  </>
                ) : isPlaying ? (
                  <>
                    <Pause size={18} className="mr-2" />
                    Stop Demo
                  </>
                ) : (
                  <>
                    <Play size={18} className="mr-2" />
                    Play Sample Conversation
                  </>
                )}
              </Button>
              <p className="mt-3 text-xs text-muted-foreground">
                🔊 Turn your volume up — real AI voices powered by Telnyx
              </p>
            </div>
          </motion.div>

          {/* Right — Conversation Viewer */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="relative rounded-2xl border border-white/10 bg-zinc-900/80 backdrop-blur-sm overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600">
                    <Phone size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Sunrise Dental</p>
                    <p className="text-xs text-muted-foreground">AI Receptionist Demo</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isPlaying && (
                    <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Live
                    </span>
                  )}
                </div>
              </div>

              {/* Waveform */}
              <div className="flex justify-center py-4 border-b border-white/5 bg-zinc-950/50">
                <WaveformVisualizer active={isPlaying} />
              </div>

              {/* Conversation */}
              <div className="p-6 space-y-4 min-h-[400px]">
                {conversationSteps.map((step, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{
                      opacity: idx <= currentStep ? 1 : 0.15,
                      y: idx <= currentStep ? 0 : 10,
                    }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${step.role === "ai" ? "justify-start" : "justify-end"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                        step.role === "ai"
                          ? "rounded-tl-sm bg-indigo-500/10 border border-indigo-500/20"
                          : "rounded-tr-sm bg-zinc-800"
                      } ${idx === currentStep && isPlaying ? "ring-1 ring-indigo-500/50" : ""}`}
                    >
                      {step.role === "ai" && (
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[10px] font-medium text-indigo-400">
                            AI Receptionist
                          </span>
                          {step.emotion && (
                            <Badge variant="info" className="text-[9px] px-1.5 py-0">
                              {step.emotion}
                            </Badge>
                          )}
                          {step.ambient && idx <= currentStep && (
                            <Badge variant="warning" className="text-[9px] px-1.5 py-0">
                              🎵 {step.ambient}
                            </Badge>
                          )}
                        </div>
                      )}
                      {step.role === "caller" && (
                        <p className="text-[10px] font-medium text-zinc-500 mb-1">Caller</p>
                      )}
                      <p className="text-sm leading-relaxed">{step.text}</p>
                    </div>
                  </motion.div>
                ))}

                {currentStep >= conversationSteps.length && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-4"
                  >
                    <Badge variant="success" className="text-xs">
                      ✅ Appointment booked · SMS confirmation sent
                    </Badge>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
