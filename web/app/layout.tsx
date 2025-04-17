import './globals.css';
import './fonts.css';
import './themes.css';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { ApiProvider } from '@/components/api/ApiProvider';
import { ThemeProvider } from '@/components/theme/ThemeProvider';

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
          <ApiProvider>
            <ThemeProvider defaultTheme="escape">
              {children}
            </ThemeProvider>
          </ApiProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
