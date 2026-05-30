import { NextResponse } from 'next/server';
import { getCurrentUser } from '../../../../../lib/auth.js';
import { prisma } from '../../../../../lib/prisma.js';

export async function GET(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 });

    const { id } = await params;
    const targetId = parseInt(id);

    if (user.id !== targetId && user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetersiz yetki' }, { status: 403 });
    }

    const kullanici = await prisma.admin.findUnique({
      where: { id: targetId },
      select: {
        id: true, username: true, name: true, role: true,
        mahalleBaskan: {
          select: { id: true, ad: true, soyad: true, mahalleId: true, mahalle: { select: { id: true, ad: true } } }
        },
        ykUyesi: { select: { id: true, ad: true, soyad: true } },
      },
    });

    if (!kullanici) return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });

    return NextResponse.json({
      success: true,
      kullanici: {
        ...kullanici,
        mahalleBaskanId: kullanici.mahalleBaskan?.id ?? null,
        yonetimKuruluUyesiId: kullanici.ykUyesi?.id ?? null,
      },
    });
  } catch (error) {
    console.error('Kullanıcı detay hatası:', error);
    return NextResponse.json({ error: 'Kullanıcı bilgisi alınırken hata oluştu' }, { status: 500 });
  }
}
