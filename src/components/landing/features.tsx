"use client"

import { motion } from "framer-motion"
import {
  Brain,
  Mic,
  MessageSquare,
  Calendar,
  BarChart3,
  Shield,
  Smile,
  Volume2,
  Headphones,
  Zap,
  Building2,
  Clock,
} from "lucide-react"

const features = [
  {
    icon: Brain,
    title: "Emotional AI Voices",
    description:
      "Neural voices with real emotions — cheerful for greetings, empathetic for complaints, professional for business. Not your typical robot.",
    gradient: "from-indigo-500 to-blue-500",
  },
  {
    icon: Volume2,
    title: "Smart Barge-In",
    description:
      "Callers can interrupt mid-sentence, just like talking to a real person. Natural conversation flow with intelligent pausing.",
    gradient: "from-purple-500 to-indigo-500",
  },
  {
    icon: Headphones,
    title: "Office Ambiance",
    description:
      "Subtle typing sounds when \"looking something up\" and soft office background noise. Callers genuinely think they're talking to a human.",
    gradient: "from-pink-500 to-purple-500",
  },
  {
    icon: Calendar,
    title: "Appointment Booking",
    description:
      "Books appointments through natural conversation. Confirms details, sends SMS reminders, handles cancellations and rescheduling.",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    icon: MessageSquare,
    title: "Smart Messages",
    description:
      "Takes detailed messages when you're unavailable. Gets caller name, number, and reason — delivered instantly via SMS and email.",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    icon: Mic,
    title: "FAQ Knowledge Base",
    description:
      "Train your AI with your business FAQs. It answers common questions about hours, pricing, services, and more — no human needed.",
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    icon: BarChart3,
    title: "Call Analytics",
    description:
      "Full dashboard with call logs, transcripts, sentiment analysis, and trends. Know what your callers want before they tell you.",
    gradient: "from-violet-500 to-purple-500",
  },
  {
    icon: Shield,
    title: "Always On",
    description:
      "24/7 availability. After-hours, weekends, holidays — your AI receptionist never takes a break, never calls in sick.",
    gradient: "from-rose-500 to-pink-500",
  },
  {
    icon: Zap,
    title: "Instant Setup",
    description:
      "Get a phone number, configure your greeting, and go live in under 5 minutes. No technical knowledge required.",
    gradient: "from-yellow-500 to-amber-500",
  },
  {
    icon: Smile,
    title: "Custom Personality",
    description:
      "Choose from warm & friendly, professional & calm, or energetic & cheerful. Match your brand's voice perfectly.",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    icon: Building2,
    title: "Multi-Location",
    description:
      "Multiple phone numbers with different greetings and settings. Perfect for businesses with several locations.",
    gradient: "from-blue-500 to-indigo-500",
  },
  {
    icon: Clock,
    title: "Business Hours",
    description:
      "Configurable schedules with different greetings for open hours, after hours, and holidays. Seamless transitions.",
    gradient: "from-teal-500 to-cyan-500",
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export function Features() {
  return (
    <section id="features" className="relative py-32">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-indigo-500/5 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Everything your receptionist does.
            <br />
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Minus the salary.
            </span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Three breakthrough features make CallMate AI indistinguishable from a real human receptionist.
            Plus everything else you need to never miss another call.
          </p>
        </motion.div>

        {/* Feature Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="group relative rounded-2xl border border-white/5 bg-zinc-900/50 p-6 hover:border-white/10 transition-all duration-300 hover:bg-zinc-900/80"
            >
              {/* Hover glow */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg mb-4`}>
                <feature.icon className="h-5 w-5 text-white" />
              </div>

              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
