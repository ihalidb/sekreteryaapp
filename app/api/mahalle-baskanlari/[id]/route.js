import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma.js';
import { getCurrentUser } from '../../../../lib/auth.js';

// GET - Tek bir mahalle başkanını getir
export const GET = async (request, { params }) => {
  try {
    const id = parseInt(params.id);

    const baskan = await prisma.mahalleBaskan.findUnique({
      where: { id },
      include: {
        mahalle: true,
      }
    });

    if (!baskan) {
      return NextResponse.json(
        { error: 'Mahalle başkanı bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json(baskan);
  } catch (error) {
    console.error('Mahalle başkanı getirme hatası:', error);
    return NextResponse.json(
      { error: 'Mahalle başkanı getirilemedi' },
      { status: 500 }
    );
  }
};

// PUT - Mahalle başkanını güncelle
export const PUT = async (request, { params }) => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Oturum gerekli' },
        { status: 401 }
      );
    }

    const id = parseInt(params.id);
    const data = await request.json();
    const { ad, soyad, mahalleId, telefon, email, adres } = data;

    if (!ad || !soyad || !mahalleId) {
      return NextResponse.json(
        { error: 'Ad, soyad ve mahalle zorunludur' },
        { status: 400 }
      );
    }

    // Mevcut başkanı al
    const current = await prisma.mahalleBaskan.findUnique({
      where: { id }
    });

    // Mahalle değiştiyse, yeni mahalle için başka başkan var mı kontrol et
    if (current && current.mahalleId !== parseInt(mahalleId)) {
      const existing = await prisma.mahalleBaskan.findUnique({
        where: { mahalleId: parseInt(mahalleId) }
      });

      if (existing) {
        return NextResponse.json(
          { error: 'Bu mahalle için zaten bir başkan atanmış' },
          { status: 400 }
        );
      }
    }

    const baskan = await prisma.mahalleBaskan.update({
      where: { id },
      data: {
        ad: ad.trim(),
        soyad: soyad.trim(),
        mahalleId: parseInt(mahalleId),
        telefon: telefon?.trim() || null,
        email: email?.trim() || null,
        adres: adres?.trim() || null,
      },
      include: {
        mahalle: true,
      }
    });

    return NextResponse.json(baskan);
  } catch (error) {
    console.error('Mahalle başkanı güncelleme hatası:', error);
    return NextResponse.json(
      { error: 'Mahalle başkanı güncellenemedi' },
      { status: 500 }
    );
  }
};

// DELETE - Mahalle başkanını sil
export const DELETE = async (request, { params }) => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Oturum gerekli' },
        { status: 401 }
      );
    }

    const id = parseInt(params.id);

    await prisma.mahalleBaskan.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Mahalle başkanı silindi' });
  } catch (error) {
    console.error('Mahalle başkanı silme hatası:', error);
    return NextResponse.json(
      { error: 'Mahalle başkanı silinemedi' },
      { status: 500 }
    );
  }
};

