import { NextResponse } from 'next/server';
import { getCurrentUser } from '../../../lib/auth.js';
import { prisma } from '../../../lib/prisma.js';
import { canManageUsers } from '../../../lib/permissions.js';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 });
    if (!canManageUsers(user)) return NextResponse.json({ error: 'Yetersiz yetki' }, { status: 403 });

    const [mbs, yks] = await Promise.all([
      prisma.mahalleBaskan.findMany({
        include: {
          mahalle: { select: { ad: true } },
          admin: { select: { id: true, username: true, active: true, lastLogin: true } },
        },
        orderBy: { ad: 'asc' },
      }),
      prisma.yonetimKuruluUyesi.findMany({
        include: {
          ilceGorev: { select: { ad: true } },
          admin: { select: { id: true, username: true, active: true, lastLogin: true } },
        },
        orderBy: { sira: 'asc' },
      }),
    ]);

    const hesaplar = [
      ...mbs.map(mb => ({
        tip: 'MB',
        kisiId: mb.id,
        ad: mb.ad,
        soyad: mb.soyad,
        bilgi: mb.mahalle?.ad || 'Mahalle atanmamış',
        admin: mb.admin,
      })),
      ...yks.map(yk => ({
        tip: 'YK',
        kisiId: yk.id,
        ad: yk.ad,
        soyad: yk.soyad,
        bilgi: yk.ilceGorev?.ad || '—',
        admin: yk.admin,
      })),
    ];

    return NextResponse.json({ success: true, hesaplar });
  } catch (error) {
    console.error('Portal hesapları hatası:', error);
    return NextResponse.json({ error: 'Portal hesapları alınırken hata oluştu' }, { status: 500 });
  }
}
