import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Trading Position Grader',
  description: 'The Trading Position Grader is designed to eliminate emotional trading decisions by providing a systematic approach to evaluating trade setups. It combines technical analysis factors, risk management principles, and automated logging to create a complete trading workflow.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
