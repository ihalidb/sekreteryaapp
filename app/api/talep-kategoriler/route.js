import { NextResponse } from 'next/server';
import { getCurrentUser } from '../../../lib/auth.js';
import { prisma } from '../../../lib/prisma.js';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 });

    const kategoriler = await prisma.talepKategori.findMany({
      where: { active: true },
      orderBy: [{ sira: 'asc' }, { ad: 'asc' }],
    });
    return NextResponse.json({ success: true, kategoriler });
  } catch (error) {
    console.error('Talep kategorileri hatası:', error);
    return NextResponse.json({ error: 'Kategoriler alınırken hata oluştu' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 });
    if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetersiz yetki' }, { status: 403 });
    }

    const { ad, aciklama, renk, sira } = await request.json();
    if (!ad?.trim()) return NextResponse.json({ error: 'Kategori adı zorunludur' }, { status: 400 });

    const kategori = await prisma.talepKategori.create({
      data: {
        ad: ad.trim(),
        aciklama: aciklama?.trim() || null,
        renk: renk || '#6366f1',
        sira: sira ?? 0,
        createdBy: user.id,
      },
    });
    return NextResponse.json({ success: true, kategori }, { status: 201 });
  } catch (error) {
    console.error('Kategori oluşturma hatası:', error);
    return NextResponse.json({ error: 'Kategori oluşturulurken hata oluştu' }, { status: 500 });
  }
}
