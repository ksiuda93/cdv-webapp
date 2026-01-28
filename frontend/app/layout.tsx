export const metadata = {
  title: 'CDV Webapp',
  description: 'CDV Webapp Frontend',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pl">
      <body>{children}</body>
    </html>
  )
}
