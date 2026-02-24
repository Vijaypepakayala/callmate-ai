"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Phone, X, Loader2, CheckCircle, Sparkles, Zap, ChevronLeft, ChevronRight, Volume2 } from "lucide-react"

type ChatMessage = { role: "ai" | "caller"; name: string; text: string }

const USE_CASES = [
  {
    id: "clinicmate",
    emoji: "🏥",
    name: "ClinicMate",
    tagline: "Medical Receptionist",
    aiName: "Sarah",
    description: "Warm, professional medical receptionist that handles appointments, prescriptions, and triage. Meet Sarah from Sunrise Family Clinic.",
    expect: "Sarah will greet you as a patient calling the clinic. Try booking an appointment or asking about prescription refills.",
    gradient: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    glow: "shadow-emerald-500/20",
    textColor: "text-emerald-400",
    chat: [
      { role: "ai" as const, name: "Sarah", text: "Good morning! Thanks for calling Sunrise Family Clinic. This is Sarah, how can I help you today?" },
      { role: "caller" as const, name: "Caller", text: "Hi, I need to schedule a checkup with Dr. Patel." },
      { role: "ai" as const, name: "Sarah", text: "Of course! Dr. Patel has openings Thursday at 10am and Friday at 2pm. Which works better?" },
      { role: "caller" as const, name: "Caller", text: "Thursday at 10 works great." },
      { role: "ai" as const, name: "Sarah", text: "Perfect! You're booked for Thursday at 10am with Dr. Patel. I'll send you a confirmation text now. Anything else?" },
    ],
  },
  {
    id: "orderai",
    emoji: "🍕",
    name: "OrderAI",
    tagline: "Restaurant Ordering",
    aiName: "Marco",
    description: "Friendly, upbeat restaurant order-taker at Bella Napoli Pizzeria. Marco will take your order with enthusiasm.",
    expect: "Marco will help you order pizza, salads, and desserts. Try ordering a pepperoni pizza with garlic knots!",
    gradient: "from-orange-500 to-red-500",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    glow: "shadow-orange-500/20",
    textColor: "text-orange-400",
    chat: [
      { role: "ai" as const, name: "Marco", text: "Bella Napoli! This is Marco — what can I get started for you today?" },
      { role: "caller" as const, name: "Caller", text: "I'd like a large pepperoni pizza and some garlic knots." },
      { role: "ai" as const, name: "Marco", text: "Great taste! Large pepperoni and garlic knots — you want any dipping sauces? Marinara or ranch?" },
      { role: "caller" as const, name: "Caller", text: "Marinara please. And a 2-liter Coke." },
      { role: "ai" as const, name: "Marco", text: "You got it! That'll be $24.50. Ready in about 20 minutes. Want delivery or pickup?" },
    ],
  },
  {
    id: "debtshield",
    emoji: "🛡️",
    name: "DebtShield",
    tagline: "Bill Negotiator",
    aiName: "Marcus",
    description: "Confident bill negotiator who analyzes your charges and gives you strategies to save money on any bill.",
    expect: "Marcus will ask about your bill and give you a personalized negotiation strategy with expected savings.",
    gradient: "from-violet-500 to-purple-600",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    glow: "shadow-violet-500/20",
    textColor: "text-violet-400",
    chat: [
      { role: "ai" as const, name: "Marcus", text: "Hey there! I'm Marcus from DebtShield. Tell me about the bill you'd like me to help negotiate." },
      { role: "caller" as const, name: "Caller", text: "My internet bill jumped from $60 to $95 this month." },
      { role: "ai" as const, name: "Marcus", text: "Classic post-promo price hike. Here's what I'd do: call retention, mention competitor rates at $55, and ask for the loyalty discount. I'd estimate we can get you down to $65." },
      { role: "caller" as const, name: "Caller", text: "That sounds great! Can you walk me through what to say?" },
      { role: "ai" as const, name: "Marcus", text: "Absolutely. Start with: 'I've been a customer for X years and I noticed my rate increased significantly. I'm considering switching to [competitor]...' That opens the door to retention offers." },
    ],
  },
  {
    id: "propbot",
    emoji: "🏠",
    name: "PropBot",
    tagline: "Real Estate Agent",
    aiName: "Jessica",
    description: "Enthusiastic real estate agent who paints vivid pictures of properties and knows every neighborhood.",
    expect: "Jessica will ask about your dream home and describe matching properties. Try saying you want a 3-bedroom with a garden.",
    gradient: "from-sky-500 to-blue-600",
    bg: "bg-sky-500/10",
    border: "border-sky-500/20",
    glow: "shadow-sky-500/20",
    textColor: "text-sky-400",
    chat: [
      { role: "ai" as const, name: "Jessica", text: "Hi! Jessica from Prestige Properties. Are you looking to buy or rent today?" },
      { role: "caller" as const, name: "Caller", text: "Looking to buy. 3-bedroom with a garden, under $450K." },
      { role: "ai" as const, name: "Jessica", text: "I've got just the thing! There's a charming 3-bed in Oakwood — open-plan kitchen, mature garden with a patio, and it's listed at $425K. Shall I book a viewing?" },
      { role: "caller" as const, name: "Caller", text: "Yes! This weekend if possible." },
      { role: "ai" as const, name: "Jessica", text: "Saturday at 11am works! I'll text you the address and some photos. You're going to love the natural light in the living room." },
    ],
  },
  {
    id: "tutorcall",
    emoji: "🌍",
    name: "TutorCall",
    tagline: "Language Tutor",
    aiName: "Sofia",
    description: "Patient, encouraging language tutor who teaches through natural conversation practice.",
    expect: "Sofia will ask which language you'd like to practice and adapt to your level. Try learning some Spanish phrases!",
    gradient: "from-amber-500 to-yellow-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    glow: "shadow-amber-500/20",
    textColor: "text-amber-400",
    chat: [
      { role: "ai" as const, name: "Sofia", text: "¡Hola! I'm Sofia, your language tutor. Which language would you like to practice today?" },
      { role: "caller" as const, name: "Caller", text: "I want to learn some Spanish for my trip to Mexico." },
      { role: "ai" as const, name: "Sofia", text: "¡Perfecto! Let's start with essentials. Repeat after me: '¿Dónde está el restaurante?' — Where is the restaurant?" },
      { role: "caller" as const, name: "Caller", text: "Dónde está el restaurante?" },
      { role: "ai" as const, name: "Sofia", text: "¡Muy bien! Your pronunciation is great. Now try: 'La cuenta, por favor' — The check, please. You'll use this one a lot!" },
    ],
  },
  {
    id: "recruitai",
    emoji: "🎯",
    name: "RecruitAI",
    tagline: "Candidate Screening",
    aiName: "David",
    description: "Professional recruiter who conducts structured phone interviews with helpful feedback.",
    expect: "David will screen you for a role. Try saying you're interested in a Software Engineer position.",
    gradient: "from-rose-500 to-pink-600",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
    glow: "shadow-rose-500/20",
    textColor: "text-rose-400",
    chat: [
      { role: "ai" as const, name: "David", text: "Hi, this is David from TalentFirst. Thanks for your interest in the Senior Engineer role. Ready for a quick screen?" },
      { role: "caller" as const, name: "Caller", text: "Yes, I'm ready!" },
      { role: "ai" as const, name: "David", text: "Great! Tell me about your experience with distributed systems and what scale you've worked at." },
      { role: "caller" as const, name: "Caller", text: "I've built microservices handling 50K requests per second at my current company." },
      { role: "ai" as const, name: "David", text: "Impressive! That aligns perfectly with what we need. Next question: how do you approach debugging a production performance issue?" },
    ],
  },
  {
    id: "fitcall",
    emoji: "💪",
    name: "FitCall",
    tagline: "Personal Trainer",
    aiName: "Jake",
    description: "High-energy personal trainer who creates workout plans and nutrition advice on the spot.",
    expect: "Jake will pump you up and design a workout plan based on your goals. Try saying you want to build muscle!",
    gradient: "from-lime-500 to-green-600",
    bg: "bg-lime-500/10",
    border: "border-lime-500/20",
    glow: "shadow-lime-500/20",
    textColor: "text-lime-400",
    chat: [
      { role: "ai" as const, name: "Jake", text: "Hey! Jake here from FitCall. Ready to crush some goals? What are you looking to work on?" },
      { role: "caller" as const, name: "Caller", text: "I want to build muscle but I only have 30 minutes a day." },
      { role: "ai" as const, name: "Jake", text: "30 minutes is MORE than enough! We'll do compound movements — squats, deadlifts, bench press. 3 days on, 1 rest. You'll see gains in 4 weeks." },
      { role: "caller" as const, name: "Caller", text: "What about nutrition?" },
      { role: "ai" as const, name: "Jake", text: "Key thing: 1 gram of protein per pound of bodyweight. Chicken, eggs, Greek yogurt — and don't skip carbs before your workout. They're your fuel!" },
    ],
  },
  {
    id: "legalease",
    emoji: "⚖️",
    name: "LegalEase",
    tagline: "Legal Intake",
    aiName: "Amanda",
    description: "Calm, thorough legal intake assistant who collects case details with empathy and professionalism.",
    expect: "Amanda will gather information about your legal matter. Try describing a personal injury case.",
    gradient: "from-indigo-500 to-blue-700",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/20",
    glow: "shadow-indigo-500/20",
    textColor: "text-indigo-400",
    chat: [
      { role: "ai" as const, name: "Amanda", text: "Thank you for calling Mitchell & Associates. I'm Amanda. How can I assist you today?" },
      { role: "caller" as const, name: "Caller", text: "I was in a car accident last week and I think I need a lawyer." },
      { role: "ai" as const, name: "Amanda", text: "I'm sorry to hear that. First, are you okay? Have you received medical treatment?" },
      { role: "caller" as const, name: "Caller", text: "Yes, I went to the ER. Got some whiplash and a bruised rib." },
      { role: "ai" as const, name: "Amanda", text: "I'm glad you got checked out. I'll need a few details — the date, location, and whether a police report was filed. Then we'll schedule a free consultation with one of our attorneys." },
    ],
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

function ChatCarousel({ useCases, onTryLive }: { useCases: typeof USE_CASES; onTryLive: (uc: typeof USE_CASES[0]) => void }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 10)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    checkScroll()
    el.addEventListener("scroll", checkScroll, { passive: true })
    window.addEventListener("resize", checkScroll)
    return () => { el.removeEventListener("scroll", checkScroll); window.removeEventListener("resize", checkScroll) }
  }, [checkScroll])

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -380 : 380, behavior: "smooth" })
  }

  return (
    <div className="relative">
      {/* Scroll buttons */}
      {canScrollLeft && (
        <button onClick={() => scroll("left")} className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-zinc-800/90 border border-zinc-700 flex items-center justify-center text-white hover:bg-zinc-700 transition-colors shadow-lg">
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}
      {canScrollRight && (
        <button onClick={() => scroll("right")} className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-zinc-800/90 border border-zinc-700 flex items-center justify-center text-white hover:bg-zinc-700 transition-colors shadow-lg">
          <ChevronRight className="h-5 w-5" />
        </button>
      )}

      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-zinc-950 to-transparent z-[5] pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-zinc-950 to-transparent z-[5] pointer-events-none" />

      <div ref={scrollRef} className="flex gap-5 overflow-x-auto scrollbar-hide px-[max(1rem,calc((100vw-72rem)/2+1rem))] snap-x snap-mandatory pb-4" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
        {useCases.map((uc) => (
          <div key={uc.id} className="snap-start flex-shrink-0 w-[340px] sm:w-[380px]">
            <div className={`rounded-2xl border ${uc.border} bg-zinc-900/80 backdrop-blur overflow-hidden`}>
              {/* Chat header */}
              <div className={`flex items-center justify-between px-4 py-3 bg-gradient-to-r ${uc.gradient} bg-opacity-10`}>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{uc.emoji}</span>
                  <div>
                    <p className="text-sm font-semibold text-white">{uc.name}</p>
                    <p className="text-[10px] text-white/70">{uc.tagline}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live
                </div>
              </div>

              {/* Chat messages */}
              <div className="p-4 space-y-3 min-h-[300px]">
                {uc.chat.map((msg: ChatMessage, i: number) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15 }}
                    className={`flex ${msg.role === "ai" ? "justify-start" : "justify-end"}`}
                  >
                    <div className={`max-w-[85%] rounded-2xl px-3 py-2 ${msg.role === "ai" ? `rounded-tl-sm ${uc.bg} border ${uc.border}` : "rounded-tr-sm bg-zinc-800"}`}>
                      <p className={`text-[10px] font-medium mb-0.5 ${msg.role === "ai" ? uc.textColor : "text-zinc-500"}`}>
                        {msg.role === "ai" && <Volume2 size={8} className="inline mr-1" />}
                        {msg.name}
                      </p>
                      <p className="text-sm text-zinc-200 leading-relaxed">{msg.text}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* CTA */}
              <div className="px-4 pb-4">
                <button
                  onClick={() => onTryLive(uc)}
                  className={`w-full rounded-lg bg-gradient-to-r ${uc.gradient} px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity flex items-center justify-center gap-2`}
                >
                  <Phone className="h-3.5 w-3.5" />
                  Try {uc.name} Live
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
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

      {/* Scrollable Chat Previews */}
      <section className="pb-20">
        <div className="max-w-6xl mx-auto px-4 mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center">
            Live Conversation Previews
          </h2>
          <p className="text-zinc-400 text-center mt-2">Scroll through to see each AI agent in action →</p>
        </div>
        <ChatCarousel useCases={USE_CASES} onTryLive={setSelected} />
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
