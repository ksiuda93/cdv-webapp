import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard - Bank CDV',
  description: 'Panel zarządzania kontem w systemie Bank CDV',
  robots: 'noindex, nofollow',
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
