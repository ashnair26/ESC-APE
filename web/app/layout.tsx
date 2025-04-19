import './globals.css';
import './fonts.css';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/providers/Providers'; // Import the new Providers component

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata = {
  title: 'ESCAPE Admin Dashboard',
  description: 'Admin dashboard for the ESCAPE Creator Engine',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${inter.className}`}>
        <Providers> {/* Use the Providers component to wrap children */}
          {children}
        </Providers>
      </body>
    </html>
  );
}
