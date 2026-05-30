import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma.js';
import { getCurrentUser } from '../../../../lib/auth.js';
import bcrypt from 'bcryptjs';

export const GET = async (request, { params }) => {
  try {
    const id = parseInt(params.id);
    const baskan = await prisma.mahalleBaskan.findUnique({
      where: { id },
      include: { mahalle: true, admin: { select: { id: true, username: true, active: true } } },
    });
    if (!baskan) return NextResponse.json({ error: 'Mahalle başkanı bulunamadı' }, { status: 404 });
    return NextResponse.json(baskan);
  } catch (error) {
    console.error('Mahalle başkanı getirme hatası:', error);
    return NextResponse.json({ error: 'Mahalle başkanı getirilemedi' }, { status: 500 });
  }
};

export const PUT = async (request, { params }) => {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Oturum gerekli' }, { status: 401 });

    const id = parseInt(params.id);
    const data = await request.json();
    const { ad, soyad, mahalleId, telefon, email, adres, yeniSifre } = data;

    if (!ad || !soyad) return NextResponse.json({ error: 'Ad ve soyad zorunludur' }, { status: 400 });

    const updateData = {
      ad: ad.trim(),
      soyad: soyad.trim(),
      telefon: telefon?.trim() || null,
      email: email?.trim() || null,
      adres: adres?.trim() || null,
    };

    if (mahalleId !== undefined) {
      const parsedMahalleId = mahalleId ? parseInt(mahalleId, 10) : null;
      if (parsedMahalleId) {
        const existing = await prisma.mahalleBaskan.findFirst({ where: { mahalleId: parsedMahalleId } });
        if (existing && existing.id !== id) return NextResponse.json({ error: 'Bu mahalle için zaten bir başkan atanmış' }, { status: 400 });
      }
      updateData.mahalleId = parsedMahalleId;
    }

    // Bağlı admin hesabını güncelle
    const mevcutBaskan = await prisma.mahalleBaskan.findUnique({ where: { id }, select: { adminId: true } });
    if (mevcutBaskan?.adminId) {
      const adminUpdate = { name: `${ad.trim()} ${soyad.trim()}`, email: email?.trim() || null };
      if (yeniSifre) {
        if (yeniSifre.length < 6) return NextResponse.json({ error: 'Şifre en az 6 karakter olmalıdır' }, { status: 400 });
        adminUpdate.password = await bcrypt.hash(yeniSifre, 12);
        adminUpdate.sessionToken = null;
        adminUpdate.sessionExpiry = null;
      }
      await prisma.admin.update({ where: { id: mevcutBaskan.adminId }, data: adminUpdate });
    }

    const baskan = await prisma.mahalleBaskan.update({
      where: { id },
      data: updateData,
      include: { mahalle: true, admin: { select: { id: true, username: true, active: true } } },
    });
    return NextResponse.json(baskan);
  } catch (error) {
    console.error('Mahalle başkanı güncelleme hatası:', error);
    return NextResponse.json({ error: 'Mahalle başkanı güncellenemedi' }, { status: 500 });
  }
};

export const DELETE = async (request, { params }) => {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Oturum gerekli' }, { status: 401 });

    const id = parseInt(params.id);
    const baskan = await prisma.mahalleBaskan.findUnique({ where: { id }, select: { adminId: true } });

    await prisma.mahalleBaskan.delete({ where: { id } });

    // Bağlı admin hesabını da sil
    if (baskan?.adminId) {
      await prisma.admin.delete({ where: { id: baskan.adminId } }).catch(() => {});
    }

    return NextResponse.json({ message: 'Mahalle başkanı silindi' });
  } catch (error) {
    console.error('Mahalle başkanı silme hatası:', error);
    return NextResponse.json({ error: 'Mahalle başkanı silinemedi' }, { status: 500 });
  }
};
