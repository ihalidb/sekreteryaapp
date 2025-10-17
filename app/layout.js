import AppLayout from './layout/AppLayout';
import './globals.css';

export const metadata = {
  title: 'AK Parti Fatih',
  description: 'AK Parti Fatih İlçe Teşkilatı Yönetim Sistemi',
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <head>
        <link rel="icon" type="image/png" href="/favicon.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className="dark:bg-gray-900">
        <AppLayout>
          {children}
        </AppLayout>
      </body>
    </html>
  );
}