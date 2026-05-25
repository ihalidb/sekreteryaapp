'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Eski /admin/uyeler adresi yönetim kuruluna yönlendirilir. */
export default function UyelerRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/yonetim-kurulu');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <p className="text-gray-500 dark:text-gray-400">Yönetim Kurulu sayfasına yönlendiriliyor…</p>
    </div>
  );
}
