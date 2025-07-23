import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TGV MAX Checker - Vérifiez la disponibilité',
  description: 'Vérifiez rapidement la disponibilité des places TGV MAX sur les trains SNCF',
  keywords: 'TGV MAX, SNCF, trains, disponibilité, réservation',
  authors: [{ name: 'TGV MAX Checker' }],
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  themeColor: '#C1002A',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={`${inter.className} bg-gray-50 text-gray-900`}>
        <header className="bg-sncf-red text-white p-4 shadow-lg">
          <div className="container mx-auto">
            <h1 className="text-2xl font-bold">TGV MAX Checker</h1>
            <p className="text-sm opacity-90">Vérifiez la disponibilité des places TGV MAX</p>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8 min-h-[calc(100vh-180px)]">
          {children}
        </main>
        <footer className="bg-gray-800 text-white p-4 mt-8">
          <div className="container mx-auto text-center text-sm">
            <p>© 2025 TGV MAX Checker - Application prototype</p>
            <p className="opacity-75 mt-1">Non affilié à la SNCF</p>
          </div>
        </footer>
      </body>
    </html>
  )
}