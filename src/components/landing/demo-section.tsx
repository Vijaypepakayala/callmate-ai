"use client"

import { motion } from "framer-motion"
import { Phone, Play, Pause, Volume2, Waves, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState, useRef, useCallback, useEffect } from "react"

const conversationSteps = [
  {
    role: "ai" as const,
    text: "Good afternoon! Thanks for calling Sunrise Dental. This is Sarah. How can I help you today?",
    emotion: "cheerful",
    ambient: false,
    audio: "/demo/step-0.mp3",
  },
  {
    role: "caller" as const,
    text: "Hi, I'd like to schedule a teeth cleaning appointment.",
    emotion: null,
    ambient: false,
    audio: "/demo/step-1.mp3",
  },
  {
    role: "ai" as const,
    text: "Of course! I'd love to help you with that. Let me check our availability.",
    emotion: "friendly",
    ambient: true,
    audio: "/demo/step-2.mp3",
  },
  {
    role: "ai" as const,
    text: "I have openings this Thursday at 2pm and Friday at 10am. Which works better for you?",
    emotion: "helpful",
    ambient: false,
    audio: "/demo/step-3.mp3",
  },
  {
    role: "caller" as const,
    text: "Thursday at 2 works great!",
    emotion: null,
    ambient: false,
    audio: "/demo/step-4.mp3",
  },
  {
    role: "ai" as const,
    text: "Perfect! And may I have your name and phone number for the appointment?",
    emotion: "cheerful",
    ambient: false,
    audio: "/demo/step-5.mp3",
  },
  {
    role: "caller" as const,
    text: "It's Michael Chen, 555-0123.",
    emotion: null,
    ambient: false,
    audio: "/demo/step-6.mp3",
  },
  {
    role: "ai" as const,
    text: "Wonderful, Michael! You're all set for Thursday at 2pm. I'll send you a confirmation text right now. Is there anything else I can help with?",
    emotion: "warm",
    ambient: true,
    audio: "/demo/step-7.mp3",
  },
]

function WaveformVisualizer({ active }: { active: boolean }) {
  return (
    <div className="flex items-center gap-[3px] h-8">
      {Array.from({ length: 24 }).map((_, i) => (
        <motion.div
          key={i}
          className="w-[3px] rounded-full bg-gradient-to-t from-indigo-500 to-purple-400"
          animate={{
            height: active
              ? [6, Math.random() * 30 + 4, 6]
              : 3,
          }}
          transition={{
            duration: 0.3 + Math.random() * 0.3,
            repeat: active ? Infinity : 0,
            repeatType: "reverse",
            delay: i * 0.04,
          }}
        />
      ))}
    </div>
  )
}

export function DemoSection() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentStep, setCurrentStep] = useState(-1)
  const [currentSpeaker, setCurrentSpeaker] = useState<"ai" | "caller" | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const typingRef = useRef<HTMLAudioElement | null>(null)
  const abortRef = useRef(false)

  // Pre-load typing sound
  useEffect(() => {
    const typing = new Audio("/demo/typing.mp3")
    typing.loop = true
    typing.volume = 0.12  // subtle background
    typingRef.current = typing
    return () => { typing.pause() }
  }, [])

  const playStep = useCallback(async (step: typeof conversationSteps[0]): Promise<void> => {
    return new Promise((resolve) => {
      const audio = new Audio(step.audio)
      audioRef.current = audio

      // Start typing ambient if this step has it
      if (step.ambient && typingRef.current) {
        typingRef.current.currentTime = 0
        typingRef.current.play().catch(() => {})
      }

      audio.onended = () => {
        // Stop typing sound
        if (typingRef.current) {
          typingRef.current.pause()
        }
        resolve()
      }

      audio.onerror = () => {
        if (typingRef.current) typingRef.current.pause()
        resolve()
      }

      audio.play().catch(() => {
        // If autoplay blocked, resolve after estimated duration
        setTimeout(resolve, 2000)
      })
    })
  }, [])

  const playDemo = useCallback(async () => {
    if (isPlaying) {
      abortRef.current = true
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      if (typingRef.current) {
        typingRef.current.pause()
      }
      setIsPlaying(false)
      setCurrentStep(-1)
      setCurrentSpeaker(null)
      return
    }

    abortRef.current = false
    setIsPlaying(true)

    for (let i = 0; i < conversationSteps.length; i++) {
      if (abortRef.current) break

      setCurrentStep(i)
      setCurrentSpeaker(conversationSteps[i].role)

      // Natural pause between turns (longer between different speakers)
      if (i > 0) {
        const prevRole = conversationSteps[i - 1].role
        const thisRole = conversationSteps[i].role
        const pauseMs = prevRole !== thisRole ? 800 : 400
        await new Promise(r => setTimeout(r, pauseMs))
      }

      if (abortRef.current) break

      // Play the pre-generated audio
      await playStep(conversationSteps[i])

      if (abortRef.current) break
    }

    if (!abortRef.current) {
      setCurrentSpeaker(null)
      setCurrentStep(conversationSteps.length)
      await new Promise(r => setTimeout(r, 3000))
    }

    setIsPlaying(false)
    setCurrentStep(-1)
    setCurrentSpeaker(null)
  }, [isPlaying, playStep])

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
              Live Demo with Neural Voices
            </Badge>

            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Hear it in action.
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                It&apos;s uncanny.
              </span>
            </h2>

            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              Listen to a real conversation powered by neural voices.
              Notice the natural pacing, emotional tone shifts, and subtle office ambiance
              as the AI books an appointment seamlessly.
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500/15 text-indigo-400">
                  <Volume2 size={12} />
                </div>
                <div>
                  <p className="font-medium text-sm">Emotional Neural Voice</p>
                  <p className="text-sm text-muted-foreground">Cheerful greetings, warm and natural delivery</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-500/15 text-purple-400">
                  <Phone size={12} />
                </div>
                <div>
                  <p className="font-medium text-sm">Natural Conversation Flow</p>
                  <p className="text-sm text-muted-foreground">Real turn-taking with natural pauses between speakers</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-pink-500/15 text-pink-400">
                  <Waves size={12} />
                </div>
                <div>
                  <p className="font-medium text-sm">Office Ambiance</p>
                  <p className="text-sm text-muted-foreground">Subtle keyboard sounds when the AI &ldquo;checks the system&rdquo;</p>
                </div>
              </div>
            </div>

            <div className="mt-10">
              <Button variant="gradient" size="lg" onClick={playDemo} className="group">
                {isPlaying ? (
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
                  {currentSpeaker && (
                    <Badge variant={currentSpeaker === "ai" ? "info" : "outline"} className="text-[10px]">
                      {currentSpeaker === "ai" ? "🤖 AI Speaking" : "🎤 Caller"}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Waveform */}
              <div className="flex justify-center py-4 border-b border-white/5 bg-zinc-950/50">
                <WaveformVisualizer active={isPlaying && currentStep >= 0} />
              </div>

              {/* Conversation */}
              <div className="p-6 space-y-4 min-h-[400px] max-h-[500px] overflow-y-auto">
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
                      } ${idx === currentStep && isPlaying ? "ring-1 ring-indigo-500/50 shadow-lg shadow-indigo-500/5" : ""}`}
                    >
                      {step.role === "ai" && (
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[10px] font-medium text-indigo-400">
                            Sarah · AI Receptionist
                          </span>
                          {step.emotion && idx <= currentStep && (
                            <Badge variant="info" className="text-[9px] px-1.5 py-0">
                              {step.emotion}
                            </Badge>
                          )}
                          {step.ambient && idx <= currentStep && (
                            <Badge variant="warning" className="text-[9px] px-1.5 py-0 animate-pulse">
                              ⌨️ typing
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
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-4"
                  >
                    <Badge variant="success" className="text-xs px-4 py-1.5">
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
