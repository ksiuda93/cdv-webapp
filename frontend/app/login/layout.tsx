import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Logowanie - Bank CDV',
  description: 'Zaloguj się do systemu zarządzania klientami banku CDV',
  robots: 'noindex, nofollow',
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
