"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Sparkles } from "lucide-react"
import { PRICING_TIERS } from "@/types"
import Link from "next/link"

export function Pricing() {
  return (
    <section id="pricing" className="relative py-32">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
        <div className="absolute bottom-1/3 left-1/4 h-[400px] w-[400px] rounded-full bg-indigo-500/5 blur-[100px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Simple, transparent pricing.
            <br />
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Cheaper than a part-time hire.
            </span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Every plan includes a 14-day free trial. No credit card required.
            Cancel anytime — no questions asked.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {PRICING_TIERS.map((tier, idx) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className={`relative rounded-2xl border ${
                tier.highlighted
                  ? "border-indigo-500/50 bg-gradient-to-b from-indigo-500/10 to-transparent shadow-lg shadow-indigo-500/10"
                  : "border-white/5 bg-zinc-900/50"
              } p-8 flex flex-col`}
            >
              {/* Popular badge */}
              {tier.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0 px-4 py-1 shadow-lg shadow-indigo-500/25">
                    <Sparkles size={10} className="mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-bold">{tier.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{tier.description}</p>
              </div>

              <div className="mb-8">
                <span className="text-5xl font-bold">${tier.price}</span>
                <span className="text-muted-foreground">{tier.period}</span>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <Check size={16} className="mt-0.5 shrink-0 text-indigo-400" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link href="/login?register=true" className="block">
                <Button
                  variant={tier.highlighted ? "gradient" : "outline"}
                  className="w-full"
                  size="lg"
                >
                  {tier.cta}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center text-sm text-muted-foreground mt-12"
        >
          All plans include free setup assistance. Need a custom plan?{" "}
          <a href="mailto:hello@callmate.ai" className="text-indigo-400 hover:underline">
            Talk to us
          </a>
          .
        </motion.p>
      </div>
    </section>
  )
}
