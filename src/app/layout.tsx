import type { Metadata } from "next"
import "@/styles/globals.css"
import Providers from "./providers"

export const metadata: Metadata = {
  title: "MINDBLOOM · Personal Habit Analytics",
  description: "Track habits, journal, and understand your patterns with data-driven insights.",
  icons: { icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🌱</text></svg>" },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-canvas">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
