import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'VoxGuard — AI Voice Cloning Detection',
  description: 'Real-time voice cloning detection and prevention framework',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="antialiased">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--surface-elevated)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
            },
            duration: 4000,
          }}
        />
      </body>
    </html>
  );
}
