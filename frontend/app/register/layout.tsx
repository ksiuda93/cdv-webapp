import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Rejestracja — CDV Banking',
  description: 'Utwórz nowe konto w systemie CDV Banking',
  robots: 'noindex, nofollow',
}

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
