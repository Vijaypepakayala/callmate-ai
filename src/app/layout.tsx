import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Telnyx Voice AI — 8 Industries, One Platform",
  description:
    "Experience AI voice agents that sound human across 8 industries. Pick a use case, enter your number, and get called in seconds.",
  openGraph: {
    title: "Telnyx Voice AI — 8 Industries, One Platform",
    description:
      "Experience AI voice agents that sound human across 8 industries. Real phone calls, sub-second latency.",
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
