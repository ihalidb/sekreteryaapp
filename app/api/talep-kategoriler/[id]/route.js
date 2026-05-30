import { NextResponse } from 'next/server';
import { getCurrentUser } from '../../../../lib/auth.js';
import { prisma } from '../../../../lib/prisma.js';

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) return { error: 'Oturum bulunamadı', status: 401 };
  if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') return { error: 'Yetersiz yetki', status: 403 };
  return { user };
}

export async function PUT(request, { params }) {
  try {
    const check = await requireAdmin();
    if (check.error) return NextResponse.json({ error: check.error }, { status: check.status });

    const { id } = await params;
    const { ad, aciklama, renk, sira, active } = await request.json();
    if (!ad?.trim()) return NextResponse.json({ error: 'Kategori adı zorunludur' }, { status: 400 });

    const kategori = await prisma.talepKategori.update({
      where: { id: parseInt(id) },
      data: {
        ad: ad.trim(),
        aciklama: aciklama?.trim() || null,
        renk: renk || '#6366f1',
        sira: sira ?? 0,
        active: active ?? true,
      },
    });
    return NextResponse.json({ success: true, kategori });
  } catch (error) {
    console.error('Kategori güncelleme hatası:', error);
    return NextResponse.json({ error: 'Kategori güncellenirken hata oluştu' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const check = await requireAdmin();
    if (check.error) return NextResponse.json({ error: check.error }, { status: check.status });

    const { id } = await params;
    const kategoriId = parseInt(id);

    const talepSayisi = await prisma.talep.count({ where: { kategoriId } });
    if (talepSayisi > 0) {
      await prisma.talepKategori.update({ where: { id: kategoriId }, data: { active: false } });
      return NextResponse.json({ success: true, message: 'Kategori pasife alındı (aktif talepler mevcut)' });
    }

    await prisma.talepKategori.delete({ where: { id: kategoriId } });
    return NextResponse.json({ success: true, message: 'Kategori silindi' });
  } catch (error) {
    console.error('Kategori silme hatası:', error);
    return NextResponse.json({ error: 'Kategori silinirken hata oluştu' }, { status: 500 });
  }
}
