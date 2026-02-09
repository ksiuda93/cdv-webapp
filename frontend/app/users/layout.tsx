import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Klienci — CDV Banking',
  description: 'Panel zarządzania klientami CDV Banking',
  robots: 'noindex, nofollow',
}

export default function UsersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
