import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma.js';
import { getCurrentUser } from '../../../lib/auth.js';

// GET - Tüm mahalle başkanlarını getir
export const GET = async () => {
  try {
    const baskanlar = await prisma.mahalleBaskan.findMany({
      include: {
        mahalle: true,
      },
      orderBy: {
        mahalle: {
          ad: 'asc'
        }
      }
    });

    return NextResponse.json(baskanlar);
  } catch (error) {
    console.error('Mahalle başkanları getirme hatası:', error);
    return NextResponse.json(
      { error: 'Mahalle başkanları getirilemedi' },
      { status: 500 }
    );
  }
};

// POST - Yeni mahalle başkanı ekle
export const POST = async (request) => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Oturum gerekli' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { ad, soyad, mahalleId, telefon, email, adres } = data;

    if (!ad || !soyad || !mahalleId) {
      return NextResponse.json(
        { error: 'Ad, soyad ve mahalle zorunludur' },
        { status: 400 }
      );
    }

    // Bu mahalle için zaten başkan var mı kontrol et
    const existing = await prisma.mahalleBaskan.findUnique({
      where: { mahalleId: parseInt(mahalleId) }
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Bu mahalle için zaten bir başkan atanmış' },
        { status: 400 }
      );
    }

    const baskan = await prisma.mahalleBaskan.create({
      data: {
        ad: ad.trim(),
        soyad: soyad.trim(),
        mahalleId: parseInt(mahalleId),
        telefon: telefon?.trim() || null,
        email: email?.trim() || null,
        adres: adres?.trim() || null,
        createdBy: user.id,
      },
      include: {
        mahalle: true,
      }
    });

    return NextResponse.json(baskan, { status: 201 });
  } catch (error) {
    console.error('Mahalle başkanı ekleme hatası:', error);
    return NextResponse.json(
      { error: 'Mahalle başkanı eklenemedi' },
      { status: 500 }
    );
  }
};

