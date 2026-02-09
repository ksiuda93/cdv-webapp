import './globals.css'
import { AuthProvider } from '@/lib/auth'

export const metadata = {
  title: 'CDV Banking — System Zarządzania',
  description: 'Profesjonalny system zarządzania klientami banku CDV',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
