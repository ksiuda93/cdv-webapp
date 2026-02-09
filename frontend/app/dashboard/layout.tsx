import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard — CDV Banking',
  description: 'Panel zarządzania kontem w systemie CDV Banking',
  robots: 'noindex, nofollow',
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
