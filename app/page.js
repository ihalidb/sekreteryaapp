'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLogo from './components/AppLogo';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Hızlı yönlendirme - middleware'i beklemeden
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          // Giriş yapmış, admin'e yönlendir
          router.replace('/admin');
        } else {
          // Giriş yapmamış, login'e yönlendir
          router.replace('/login');
        }
      } catch (error) {
        // Hata durumunda login'e yönlendir
        router.replace('/login');
      }
    };

    checkAuth();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-accent-50 via-white to-brand-50">
      <div className="text-center">
        <AppLogo
          asLink={false}
          href={null}
          size="lg"
          iconOnly
          priority
          className="justify-center mx-auto mb-6 animate-pulse"
        />
        <p className="text-gray-600">Yönlendiriliyor...</p>
        <div className="mt-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-600 mx-auto"></div>
        </div>
      </div>
    </div>
  );
}