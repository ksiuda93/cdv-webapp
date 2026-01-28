import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Zarządzanie klientami - Bank CDV',
  description: 'Panel zarządzania klientami banku CDV',
  robots: 'noindex, nofollow',
}

export default function UsersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
