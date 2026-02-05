"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Phone, Menu, X } from "lucide-react"

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-shadow">
            <Phone className="h-4.5 w-4.5 text-white" size={18} />
            <div className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="text-lg font-bold tracking-tight">
            CallMate<span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent"> AI</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Features
          </Link>
          <Link href="#demo" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Demo
          </Link>
          <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Pricing
          </Link>
          <Link href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Testimonials
          </Link>
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">Sign In</Button>
          </Link>
          <Link href="/book">
            <Button variant="gradient" size="sm">
              Book a Meeting
            </Button>
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 text-muted-foreground hover:text-foreground"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden border-t border-white/5 bg-background/95 backdrop-blur-xl"
          >
            <div className="flex flex-col gap-1 p-4">
              <Link href="#features" onClick={() => setMobileOpen(false)} className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-white/5 transition-colors">
                Features
              </Link>
              <Link href="#demo" onClick={() => setMobileOpen(false)} className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-white/5 transition-colors">
                Demo
              </Link>
              <Link href="#pricing" onClick={() => setMobileOpen(false)} className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-white/5 transition-colors">
                Pricing
              </Link>
              <div className="flex gap-2 pt-3 border-t border-white/5 mt-2">
                <Link href="/login" className="flex-1">
                  <Button variant="outline" className="w-full" size="sm">Sign In</Button>
                </Link>
                <Link href="/login?register=true" className="flex-1">
                  <Button variant="gradient" className="w-full" size="sm">Start Free</Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
