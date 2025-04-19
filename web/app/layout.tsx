import './globals.css';
import './fonts.css';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';
import { ApiProvider } from '@/components/api/ApiProvider'; // Import ApiProvider

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
        <AuthProvider>
          <ApiProvider> {/* Wrap children with ApiProvider */}
            {children}
          </ApiProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
