import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CallMate AI — AI Receptionist That Never Misses a Call",
  description:
    "AI-powered receptionist with emotional neural voices, smart conversation, and office ambiance. Books appointments, takes messages, answers questions — so natural callers can't tell the difference.",
  openGraph: {
    title: "CallMate AI — AI Receptionist That Never Misses a Call",
    description:
      "AI-powered receptionist with emotional neural voices. Books appointments, takes messages, answers questions.",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
