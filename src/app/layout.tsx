import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '@/contexts/language-context';
import { Toaster } from '@/components/ui/toaster';
import AppShell from '@/components/app-shell';

export const metadata: Metadata = {
  title: 'KhetAI',
  description: 'An AI-powered personal farming assistant for Indian farmers.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,701&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <LanguageProvider>
          <AppShell>{children}</AppShell>
          <Toaster />
        </LanguageProvider>
      </body>
    </html>
  );
}
