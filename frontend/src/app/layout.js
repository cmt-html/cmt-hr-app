import './globals.css';
import { Outfit, Inter } from 'next/font/google';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import AppLayoutContent from '../components/AppLayoutContent';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-outfit',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata = {
  title: 'CloudMojo HRMS Portal',
  description: 'State of the art HR management ecosystem.',
};

export default function RootLayout({ children }) {
  return (
    // `dark` class is managed dynamically by ThemeContext via document.documentElement
    <html lang="en" className={`${outfit.variable} ${inter.variable}`} suppressHydrationWarning>
      <body
        className="bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 antialiased overflow-hidden transition-colors duration-300"
        style={{ fontFamily: 'var(--font-outfit), var(--font-inter), sans-serif' }}
      >
        <ThemeProvider>
          <AuthProvider>
            <AppLayoutContent>{children}</AppLayoutContent>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}


