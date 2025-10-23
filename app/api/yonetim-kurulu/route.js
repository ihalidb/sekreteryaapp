import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma.js';
import { getCurrentUser } from '../../../lib/auth.js';

// GET - Tüm yönetim kurulu üyelerini getir
export const GET = async () => {
  try {
    const uyeler = await prisma.yonetimKuruluUyesi.findMany({
      include: {
        ilceGorev: true,
        sorumluMahalleler: {
          include: {
            mahalle: true
          }
        },
        komisyonlar: true
      },
      orderBy: [
        { sira: 'asc' },
        { id: 'asc' }
      ]
    });

    return NextResponse.json(uyeler);
  } catch (error) {
    console.error('Yönetim kurulu üyeleri getirme hatası:', error);
    return NextResponse.json(
      { error: 'Yönetim kurulu üyeleri getirilemedi' },
      { status: 500 }
    );
  }
};

// POST - Yeni yönetim kurulu üyesi ekle
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
    const { ad, soyad, ilceGorevId, telefon, email, adres, sira, sorumluMahalleler } = data;

    if (!ad || !soyad || !ilceGorevId) {
      return NextResponse.json(
        { error: 'Ad, soyad ve İlçe Görevi zorunludur' },
        { status: 400 }
      );
    }

    const uye = await prisma.yonetimKuruluUyesi.create({
      data: {
        ad: ad.trim(),
        soyad: soyad.trim(),
        ilceGorevId: parseInt(ilceGorevId),
        telefon: telefon?.trim() || null,
        email: email?.trim() || null,
        adres: adres?.trim() || null,
        sira: sira || 0,
        createdBy: user.id,
        sorumluMahalleler: {
          create: sorumluMahalleler?.map(mahalleId => ({
            mahalleId: parseInt(mahalleId)
          })) || []
        }
      },
      include: {
        ilceGorev: true,
        sorumluMahalleler: {
          include: {
            mahalle: true
          }
        },
        komisyonlar: true
      }
    });

    return NextResponse.json(uye, { status: 201 });
  } catch (error) {
    console.error('Yönetim kurulu üyesi ekleme hatası:', error);
    return NextResponse.json(
      { error: 'Yönetim kurulu üyesi eklenemedi' },
      { status: 500 }
    );
  }
};

