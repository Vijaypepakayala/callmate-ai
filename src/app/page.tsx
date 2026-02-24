"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Phone, X, Loader2, CheckCircle, Sparkles, Zap } from "lucide-react"

const USE_CASES = [
  {
    id: "clinicmate",
    emoji: "🏥",
    name: "ClinicMate",
    tagline: "Medical Receptionist",
    description: "Warm, professional medical receptionist that handles appointments, prescriptions, and triage. Meet Sarah from Sunrise Family Clinic.",
    expect: "Sarah will greet you as a patient calling the clinic. Try booking an appointment or asking about prescription refills.",
    gradient: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    glow: "shadow-emerald-500/20",
  },
  {
    id: "orderai",
    emoji: "🍕",
    name: "OrderAI",
    tagline: "Restaurant Ordering",
    description: "Friendly, upbeat restaurant order-taker at Bella Napoli Pizzeria. Marco will take your order with enthusiasm.",
    expect: "Marco will help you order pizza, salads, and desserts. Try ordering a pepperoni pizza with garlic knots!",
    gradient: "from-orange-500 to-red-500",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    glow: "shadow-orange-500/20",
  },
  {
    id: "debtshield",
    emoji: "🛡️",
    name: "DebtShield",
    tagline: "Bill Negotiator",
    description: "Confident bill negotiator who analyzes your charges and gives you strategies to save money on any bill.",
    expect: "Marcus will ask about your bill and give you a personalized negotiation strategy with expected savings.",
    gradient: "from-violet-500 to-purple-600",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    glow: "shadow-violet-500/20",
  },
  {
    id: "propbot",
    emoji: "🏠",
    name: "PropBot",
    tagline: "Real Estate Agent",
    description: "Enthusiastic real estate agent who paints vivid pictures of properties and knows every neighborhood.",
    expect: "Jessica will ask about your dream home and describe matching properties. Try saying you want a 3-bedroom with a garden.",
    gradient: "from-sky-500 to-blue-600",
    bg: "bg-sky-500/10",
    border: "border-sky-500/20",
    glow: "shadow-sky-500/20",
  },
  {
    id: "tutorcall",
    emoji: "🌍",
    name: "TutorCall",
    tagline: "Language Tutor",
    description: "Patient, encouraging language tutor who teaches through natural conversation practice.",
    expect: "Sofia will ask which language you'd like to practice and adapt to your level. Try learning some Spanish phrases!",
    gradient: "from-amber-500 to-yellow-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    glow: "shadow-amber-500/20",
  },
  {
    id: "recruitai",
    emoji: "🎯",
    name: "RecruitAI",
    tagline: "Candidate Screening",
    description: "Professional recruiter who conducts structured phone interviews with helpful feedback.",
    expect: "David will screen you for a role. Try saying you're interested in a Software Engineer position.",
    gradient: "from-rose-500 to-pink-600",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
    glow: "shadow-rose-500/20",
  },
  {
    id: "fitcall",
    emoji: "💪",
    name: "FitCall",
    tagline: "Personal Trainer",
    description: "High-energy personal trainer who creates workout plans and nutrition advice on the spot.",
    expect: "Jake will pump you up and design a workout plan based on your goals. Try saying you want to build muscle!",
    gradient: "from-lime-500 to-green-600",
    bg: "bg-lime-500/10",
    border: "border-lime-500/20",
    glow: "shadow-lime-500/20",
  },
  {
    id: "legalease",
    emoji: "⚖️",
    name: "LegalEase",
    tagline: "Legal Intake",
    description: "Calm, thorough legal intake assistant who collects case details with empathy and professionalism.",
    expect: "Amanda will gather information about your legal matter. Try describing a personal injury case.",
    gradient: "from-indigo-500 to-blue-700",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/20",
    glow: "shadow-indigo-500/20",
  },
]

type CallState = "idle" | "loading" | "success" | "error"

function CallModal({
  useCase,
  onClose,
}: {
  useCase: (typeof USE_CASES)[0]
  onClose: () => void
}) {
  const [phone, setPhone] = useState("")
  const [state, setState] = useState<CallState>("idle")
  const [error, setError] = useState("")

  const handleCall = async () => {
    if (!phone.startsWith("+") || phone.length < 11) {
      setError("Enter a valid phone number with country code (e.g. +27821234567)")
      return
    }
    setState("loading")
    setError("")
    try {
      const res = await fetch("/api/call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: phone, useCase: useCase.id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to initiate call")
      setState("success")
    } catch (e: unknown) {
      setState("error")
      setError(e instanceof Error ? e.message : "Something went wrong")
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center mb-6">
          <span className="text-4xl">{useCase.emoji}</span>
          <h3 className="text-xl font-bold text-white mt-2">{useCase.name}</h3>
          <p className="text-sm text-zinc-400 mt-1">{useCase.tagline}</p>
        </div>

        <div className={`rounded-lg ${useCase.bg} border ${useCase.border} p-4 mb-6`}>
          <p className="text-sm text-zinc-300 font-medium mb-1">What to expect:</p>
          <p className="text-sm text-zinc-400">{useCase.expect}</p>
        </div>

        {state === "success" ? (
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="text-center py-6"
          >
            <CheckCircle className="h-12 w-12 text-emerald-400 mx-auto mb-3" />
            <p className="text-lg font-semibold text-white">Calling you now!</p>
            <p className="text-sm text-zinc-400 mt-1">Pick up your phone 📞</p>
          </motion.div>
        ) : (
          <>
            <div className="space-y-3">
              <label className="text-sm font-medium text-zinc-300">
                Your phone number
              </label>
              <input
                type="tel"
                placeholder="+27 82 123 4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
              {error && (
                <p className="text-sm text-red-400">{error}</p>
              )}
            </div>
            <button
              onClick={handleCall}
              disabled={state === "loading"}
              className={`mt-4 w-full rounded-lg bg-gradient-to-r ${useCase.gradient} px-4 py-3 font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2`}
            >
              {state === "loading" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Initiating call...
                </>
              ) : (
                <>
                  <Phone className="h-4 w-4" />
                  Call Me Now
                </>
              )}
            </button>
          </>
        )}
      </motion.div>
    </motion.div>
  )
}

export default function Home() {
  const [selected, setSelected] = useState<(typeof USE_CASES)[0] | null>(null)

  return (
    <main className="min-h-screen bg-zinc-950">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/30 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px]" />

        <div className="relative max-w-6xl mx-auto px-4 pt-20 pb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-sm text-indigo-300 mb-6">
              <Sparkles className="h-3.5 w-3.5" />
              Powered by Telnyx Voice AI
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight">
              8 Industries.{" "}
              <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                One Platform.
              </span>
            </h1>

            <p className="mt-4 text-lg text-zinc-400 max-w-2xl mx-auto">
              Experience AI voice agents that sound human, understand context, and handle
              real conversations. Pick a use case, enter your number, and get called in seconds.
            </p>

            <div className="mt-8 flex items-center justify-center gap-6 text-sm text-zinc-500">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-indigo-400" />
                Sub-second latency
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-indigo-400" />
                Real phone calls
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Use Case Grid */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {USE_CASES.map((uc, i) => (
            <motion.div
              key={uc.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <div
                className={`group relative rounded-xl border ${uc.border} ${uc.bg} p-5 transition-all duration-300 hover:shadow-lg hover:${uc.glow} hover:border-opacity-40 cursor-pointer h-full flex flex-col`}
                onClick={() => setSelected(uc)}
              >
                <div className="text-3xl mb-3">{uc.emoji}</div>
                <h3 className="text-lg font-semibold text-white">{uc.name}</h3>
                <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mt-0.5">
                  {uc.tagline}
                </p>
                <p className="text-sm text-zinc-400 mt-2 flex-1">
                  {uc.description}
                </p>
                <button
                  className={`mt-4 w-full rounded-lg bg-gradient-to-r ${uc.gradient} px-3 py-2 text-sm font-semibold text-white opacity-80 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2`}
                >
                  <Phone className="h-3.5 w-3.5" />
                  Try It Live
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-4 pb-20 text-center">
        <h2 className="text-2xl font-bold text-white mb-8">How It Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            { step: "1", title: "Pick a Use Case", desc: "Choose from 8 AI voice agents across different industries" },
            { step: "2", title: "Enter Your Number", desc: "Type your phone number with country code" },
            { step: "3", title: "Get Called", desc: "Our AI calls you in seconds — have a real conversation" },
          ].map((s) => (
            <div key={s.step} className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-sm mb-3">
                {s.step}
              </div>
              <h3 className="font-semibold text-white">{s.title}</h3>
              <p className="text-sm text-zinc-500 mt-1">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-8 text-center">
        <p className="text-sm text-zinc-500">
          Powered by{" "}
          <a
            href="https://telnyx.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Telnyx
          </a>{" "}
          Voice AI · Built with ❤️
        </p>
      </footer>

      {/* Modal */}
      <AnimatePresence>
        {selected && (
          <CallModal useCase={selected} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>
    </main>
  )
}
