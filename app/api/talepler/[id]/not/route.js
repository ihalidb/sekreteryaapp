import { NextResponse } from 'next/server';
import { getCurrentUser } from '../../../../../lib/auth.js';
import { prisma } from '../../../../../lib/prisma.js';

export async function POST(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 });

    const { id } = await params;
    const talepId = parseInt(id);
    const { icerik } = await request.json();
    if (!icerik?.trim()) return NextResponse.json({ error: 'Not içeriği zorunludur' }, { status: 400 });

    const talep = await prisma.talep.findUnique({ where: { id: talepId } });
    if (!talep) return NextResponse.json({ error: 'Talep bulunamadı' }, { status: 404 });

    const isAdmin = user.role === 'SUPER_ADMIN' || user.role === 'ADMIN';
    const yk = await prisma.yonetimKuruluUyesi.findUnique({ where: { adminId: user.id }, select: { id: true } });
    const isYK = yk && talep.atananYKId === yk.id;
    const isMB = talep.olusturanId === user.id;

    if (!isAdmin && !isYK && !isMB) {
      return NextResponse.json({ error: 'Bu talebe not ekleme yetkiniz yok' }, { status: 403 });
    }

    const mevcutNotlar = Array.isArray(talep.notlar) ? talep.notlar : [];
    const yeniNot = {
      icerik: icerik.trim(),
      yazarId: user.id,
      yazarAdi: user.name || user.username,
      tarih: new Date().toISOString(),
    };

    const guncellendi = await prisma.talep.update({
      where: { id: talepId },
      data: { notlar: [...mevcutNotlar, yeniNot] },
      include: {
        kategori: true,
        mahalle: { select: { id: true, ad: true } },
        olusturan: { select: { id: true, name: true, username: true } },
        atananYK: { select: { id: true, ad: true, soyad: true, ilceGorev: { select: { ad: true } } } },
      },
    });

    return NextResponse.json({ success: true, talep: guncellendi });
  } catch (error) {
    console.error('Not ekleme hatası:', error);
    return NextResponse.json({ error: 'Not eklenirken hata oluştu' }, { status: 500 });
  }
}
