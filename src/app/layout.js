import './globals.css'
import { Inter } from 'next/font/google'
import MyNavBar from '../components/MyNavBar.component'
const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Compare App',
  description: 'Compare your file xlsx and generate the differences',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <MyNavBar />
        <main>{children}</main>
      </body>
    </html>
  )
}
