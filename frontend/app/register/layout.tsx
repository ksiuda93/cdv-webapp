import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Rejestracja - Bank CDV',
  description: 'Utwórz nowe konto w systemie zarządzania Bank CDV',
  robots: 'noindex, nofollow',
}

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
