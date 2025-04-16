import './globals.css';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { ApiProvider } from '@/components/api/ApiProvider';

const inter = Inter({ subsets: ['latin'] });

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
      <body className={inter.className}>
        <AuthProvider>
          <ApiProvider>
            {children}
          </ApiProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
