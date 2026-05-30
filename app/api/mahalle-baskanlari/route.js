import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma.js';
import { getCurrentUser } from '../../../lib/auth.js';
import { createAdminForPerson } from '../../../lib/userHelper.js';

export const GET = async () => {
  try {
    const baskanlar = await prisma.mahalleBaskan.findMany({
      include: { mahalle: true, admin: { select: { id: true, username: true, active: true } } },
      orderBy: { mahalle: { ad: 'asc' } },
    });
    return NextResponse.json(baskanlar);
  } catch (error) {
    console.error('Mahalle başkanları getirme hatası:', error);
    return NextResponse.json({ error: 'Mahalle başkanları getirilemedi' }, { status: 500 });
  }
};

export const POST = async (request) => {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Oturum gerekli' }, { status: 401 });

    const data = await request.json();
    const { ad, soyad, mahalleId, telefon, email, adres, sifre } = data;

    if (!ad || !soyad) return NextResponse.json({ error: 'Ad ve soyad zorunludur' }, { status: 400 });
    if (!sifre || sifre.length < 6) return NextResponse.json({ error: 'Şifre en az 6 karakter olmalıdır' }, { status: 400 });

    const parsedMahalleId = mahalleId ? parseInt(mahalleId, 10) : null;

    if (parsedMahalleId) {
      const existing = await prisma.mahalleBaskan.findFirst({ where: { mahalleId: parsedMahalleId } });
      if (existing) return NextResponse.json({ error: 'Bu mahalle için zaten bir başkan atanmış.' }, { status: 400 });
    }

    // Admin hesabı oluştur
    const adminHesap = await createAdminForPerson({ ad, soyad, email, password: sifre, createdBy: user.id });

    const baskan = await prisma.mahalleBaskan.create({
      data: {
        ad: ad.trim(),
        soyad: soyad.trim(),
        mahalleId: parsedMahalleId,
        telefon: telefon?.trim() || null,
        email: email?.trim() || null,
        adres: adres?.trim() || null,
        adminId: adminHesap.id,
        createdBy: user.id,
      },
      include: { mahalle: true, admin: { select: { id: true, username: true, active: true } } },
    });

    return NextResponse.json({ ...baskan, _username: adminHesap.username }, { status: 201 });
  } catch (error) {
    console.error('Mahalle başkanı ekleme hatası:', error);
    return NextResponse.json({ error: 'Mahalle başkanı eklenemedi' }, { status: 500 });
  }
};
