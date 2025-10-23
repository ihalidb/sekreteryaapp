'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import './globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <head>
        <link rel="icon" type="image/png" href="/favicon.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Sekreterya App</title>
      </head>
      <body className="dark:bg-gray-900">
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </body>
    </html>
  );
}