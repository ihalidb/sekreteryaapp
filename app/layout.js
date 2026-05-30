'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import './globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="tr" className="dark">
      <head>
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/images/logo/ak-parti-logo.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#0059AC" />
        <title>AK Parti Fatih — Sekreterya</title>
      </head>
      <body className="dark:bg-gray-900">
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </body>
    </html>
  );
}