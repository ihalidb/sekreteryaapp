import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma.js';
import { getCurrentUser } from '../../../lib/auth.js';
import { createAdminForPerson } from '../../../lib/userHelper.js';

const ykInclude = {
  ilceGorev: true,
  sorumluMahalleler: { include: { mahalle: true } },
  komisyonlar: true,
  admin: { select: { id: true, username: true, active: true } },
};

export const GET = async () => {
  try {
    const uyeler = await prisma.yonetimKuruluUyesi.findMany({
      include: ykInclude,
      orderBy: [{ sira: 'asc' }, { id: 'asc' }],
    });
    return NextResponse.json(uyeler);
  } catch (error) {
    console.error('Yönetim kurulu üyeleri getirme hatası:', error);
    return NextResponse.json({ error: 'Yönetim kurulu üyeleri getirilemedi' }, { status: 500 });
  }
};

export const POST = async (request) => {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Oturum gerekli' }, { status: 401 });

    const data = await request.json();
    const { ad, soyad, ilceGorevId, telefon, email, adres, sira, sorumluMahalleler, sifre } = data;

    if (!ad || !soyad || !ilceGorevId) return NextResponse.json({ error: 'Ad, soyad ve İlçe Görevi zorunludur' }, { status: 400 });
    if (!sifre || sifre.length < 6) return NextResponse.json({ error: 'Şifre en az 6 karakter olmalıdır' }, { status: 400 });

    // Admin hesabı oluştur
    const adminHesap = await createAdminForPerson({ ad, soyad, email, password: sifre, createdBy: user.id });

    const uye = await prisma.yonetimKuruluUyesi.create({
      data: {
        ad: ad.trim(),
        soyad: soyad.trim(),
        ilceGorevId: parseInt(ilceGorevId),
        telefon: telefon?.trim() || null,
        email: email?.trim() || null,
        adres: adres?.trim() || null,
        sira: sira || 0,
        adminId: adminHesap.id,
        createdBy: user.id,
        sorumluMahalleler: {
          create: sorumluMahalleler?.map(mahalleId => ({ mahalleId: parseInt(mahalleId) })) || [],
        },
      },
      include: ykInclude,
    });

    return NextResponse.json({ ...uye, _username: adminHesap.username }, { status: 201 });
  } catch (error) {
    console.error('Yönetim kurulu üyesi ekleme hatası:', error);
    return NextResponse.json({ error: 'Yönetim kurulu üyesi eklenemedi' }, { status: 500 });
  }
};
