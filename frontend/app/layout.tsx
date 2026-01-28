import './globals.css'
import { AuthProvider } from '@/lib/auth'

export const metadata = {
  title: 'Bank CDV - System zarządzania',
  description: 'System zarządzania klientami banku CDV',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pl">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
