import './globals.css'
import { Inter } from 'next/font/google'
import MyNavBar from '../components/MyNavBar.component'
import styles from './page.module.css';

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
        <main className={styles.main}>
          {children}
        </main>
      </body>
    </html>
  )
}
