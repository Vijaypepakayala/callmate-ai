"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Phone, Sparkles, ArrowRight, Volume2 } from "lucide-react"
import Link from "next/link"

function PhoneMockup() {
  return (
    <motion.div
      initial={{ y: 40, opacity: 0, rotateY: -5 }}
      animate={{ y: 0, opacity: 1, rotateY: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className="relative mx-auto w-[280px] sm:w-[320px]"
    >
      {/* Glow effect */}
      <div className="absolute -inset-4 rounded-[3rem] bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-2xl" />

      {/* Phone frame */}
      <div className="relative rounded-[2.5rem] border border-white/10 bg-gradient-to-b from-zinc-800 to-zinc-900 p-3 shadow-2xl">
        {/* Notch */}
        <div className="absolute left-1/2 top-2 h-6 w-24 -translate-x-1/2 rounded-full bg-black" />

        {/* Screen */}
        <div className="rounded-[2rem] bg-gradient-to-b from-zinc-950 to-black p-6 pt-10">
          {/* Call UI */}
          <div className="space-y-6 text-center">
            {/* Caller avatar */}
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30"
            >
              <Phone className="h-8 w-8 text-white" />
            </motion.div>

            <div>
              <p className="text-lg font-semibold text-white">CallMate AI</p>
              <p className="text-sm text-green-400 mt-1">Active Call · 2:34</p>
            </div>

            {/* Live transcript */}
            <div className="space-y-3 text-left">
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.0 }}
                className="rounded-xl rounded-tl-sm bg-zinc-800/80 px-3 py-2"
              >
                <p className="text-xs text-zinc-400 mb-0.5">Caller</p>
                <p className="text-sm text-white">&ldquo;Hi, I&apos;d like to book an appointment for Thursday.&rdquo;</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.8 }}
                className="rounded-xl rounded-tr-sm bg-indigo-500/20 border border-indigo-500/30 px-3 py-2"
              >
                <p className="text-xs text-indigo-400 mb-0.5 flex items-center gap-1">
                  <Volume2 size={10} /> AI Receptionist
                </p>
                <p className="text-sm text-white">&ldquo;Of course! I have a 2pm and a 4pm slot available. Which works better for you?&rdquo;</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 2.6 }}
                className="rounded-xl rounded-tl-sm bg-zinc-800/80 px-3 py-2"
              >
                <p className="text-xs text-zinc-400 mb-0.5">Caller</p>
                <p className="text-sm text-white">&ldquo;2pm works great!&rdquo;</p>
              </motion.div>
            </div>

            {/* Status indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3.2 }}
              className="flex items-center justify-center gap-2 text-xs text-emerald-400"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Booking confirmed · SMS sent
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
      {/* Background effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 h-[500px] w-[500px] rounded-full bg-indigo-500/8 blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-purple-500/8 blur-[100px]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left — Copy */}
          <div className="text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge variant="outline" className="mb-6 border-indigo-500/30 text-indigo-400 px-4 py-1.5">
                <Sparkles size={12} className="mr-1.5" />
                Powered by Neural AI Voices
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]"
            >
              Your AI receptionist
              <br />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                that never misses a call
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed"
            >
              CallMate AI answers every call with emotional, human-like voices.
              It books appointments, takes messages, and answers questions — so natural
              that callers can&apos;t tell the difference.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Link href="/book">
                <Button variant="gradient" size="xl" className="w-full sm:w-auto group">
                  Book a Meeting
                  <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="#demo">
                <Button variant="outline" size="xl" className="w-full sm:w-auto">
                  <Phone size={18} className="mr-2" />
                  Call Our Demo
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-8 flex items-center gap-6 justify-center lg:justify-start text-sm text-muted-foreground"
            >
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                No credit card required
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Setup in 5 minutes
              </span>
              <span className="flex items-center gap-1.5 hidden sm:flex">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Cancel anytime
              </span>
            </motion.div>
          </div>

          {/* Right — Phone Mockup */}
          <div className="relative flex justify-center lg:justify-end">
            <PhoneMockup />
          </div>
        </div>
      </div>
    </section>
  )
}
