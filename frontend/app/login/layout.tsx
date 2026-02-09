import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Logowanie — CDV Banking',
  description: 'Zaloguj się do systemu CDV Banking',
  robots: 'noindex, nofollow',
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
