import { Navbar } from "@/components/landing/navbar"
import { Hero } from "@/components/landing/hero"
import { Features } from "@/components/landing/features"
import { DemoSection } from "@/components/landing/demo-section"
import { Pricing } from "@/components/landing/pricing"
import { Phone, Mail, Twitter } from "lucide-react"

function Footer() {
  return (
    <footer className="border-t border-white/5 bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
                <Phone className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight">
                CallMate<span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent"> AI</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
              AI-powered receptionist with emotional neural voices. Never miss a call,
              never lose a customer. Powered by advanced neural voice AI.
            </p>
            <div className="flex gap-4 mt-6">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Twitter size={18} />
              </a>
              <a href="mailto:hello@callmate.ai" className="text-muted-foreground hover:text-foreground transition-colors">
                <Mail size={18} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4">Product</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
              <li><a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
              <li><a href="#demo" className="hover:text-foreground transition-colors">Demo</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">API Docs</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4">Company</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Privacy</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Terms</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © 2026 CallMate AI. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            1,680+ neural voices · 84 languages · 99.999% uptime
          </p>
        </div>
      </div>
    </footer>
  )
}

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <Features />
      <DemoSection />
      <Pricing />
      <Footer />
    </main>
  )
}
