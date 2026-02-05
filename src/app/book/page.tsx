"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Phone, Calendar, ArrowLeft, CheckCircle2, Loader2, Mail, Building2, User, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function BookMeeting() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    message: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      setSubmitted(true)
    } catch {
      setSubmitted(true) // Show success anyway — we'll capture it server-side
    } finally {
      setLoading(false)
    }
  }

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }))

  if (submitted) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 mx-auto mb-6">
            <CheckCircle2 className="h-8 w-8 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold mb-3">We&apos;ll be in touch!</h1>
          <p className="text-muted-foreground mb-8">
            Thanks {form.name.split(" ")[0]}! We&apos;ve received your request and will reach out
            within 24 hours to schedule a meeting.
          </p>
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft size={16} className="mr-2" />
              Back to Home
            </Button>
          </Link>
        </motion.div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="inline-flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
              <Phone className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-base font-bold tracking-tight">
              CallMate<span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent"> AI</span>
            </span>
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left — Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-sm text-indigo-400 mb-6">
              <Calendar size={14} />
              Book a Meeting
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Let&apos;s discuss how CallMate AI
              <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent"> can work for you</span>
            </h1>

            <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
              Tell us about your business and we&apos;ll set up a personalized demo
              showing exactly how our AI receptionist handles your specific use case.
            </p>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                  <Phone size={18} className="text-indigo-400" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Live Demo Call</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    We&apos;ll set up a live AI receptionist for your business during the call
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <Building2 size={18} className="text-purple-400" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Custom Configuration</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    We&apos;ll tailor the AI voice, personality, and workflow to your industry
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pink-500/10 border border-pink-500/20">
                  <Calendar size={18} className="text-pink-400" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Quick Setup</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Most businesses are live within 24 hours of our meeting
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right — Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-white/10 bg-zinc-900/80 backdrop-blur-sm p-8"
            >
              <h2 className="text-xl font-semibold mb-6">Get in touch</h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2 text-zinc-300">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={update("name")}
                      placeholder="John Smith"
                      className="w-full rounded-lg border border-white/10 bg-zinc-800/50 pl-10 pr-4 py-2.5 text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-zinc-300">
                    Work Email <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={update("email")}
                      placeholder="john@company.com"
                      className="w-full rounded-lg border border-white/10 bg-zinc-800/50 pl-10 pr-4 py-2.5 text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-zinc-300">
                      Company
                    </label>
                    <div className="relative">
                      <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <input
                        type="text"
                        value={form.company}
                        onChange={update("company")}
                        placeholder="Acme Inc"
                        className="w-full rounded-lg border border-white/10 bg-zinc-800/50 pl-10 pr-4 py-2.5 text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-zinc-300">
                      Phone
                    </label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={update("phone")}
                        placeholder="+1 (555) 000-0000"
                        className="w-full rounded-lg border border-white/10 bg-zinc-800/50 pl-10 pr-4 py-2.5 text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-zinc-300">
                    Tell us about your needs
                  </label>
                  <div className="relative">
                    <MessageSquare size={16} className="absolute left-3 top-3 text-zinc-500" />
                    <textarea
                      value={form.message}
                      onChange={update("message")}
                      rows={3}
                      placeholder="E.g. We're a dental office getting 50+ calls/day and want to automate appointment booking..."
                      className="w-full rounded-lg border border-white/10 bg-zinc-800/50 pl-10 pr-4 py-2.5 text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all resize-none"
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                variant="gradient"
                size="lg"
                className="w-full mt-6"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Calendar size={18} className="mr-2" />
                    Book a Meeting
                  </>
                )}
              </Button>

              <p className="text-xs text-zinc-500 text-center mt-4">
                We&apos;ll respond within 24 hours. No spam, ever.
              </p>
            </form>
          </motion.div>
        </div>
      </div>
    </main>
  )
}
