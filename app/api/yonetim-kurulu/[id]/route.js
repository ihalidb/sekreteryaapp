import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma.js';
import { getCurrentUser } from '../../../../lib/auth.js';

// GET - Tek bir yönetim kurulu üyesini getir
export const GET = async (request, { params }) => {
  try {
    const id = parseInt(params.id);

    const uye = await prisma.yonetimKuruluUyesi.findUnique({
      where: { id },
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

    if (!uye) {
      return NextResponse.json(
        { error: 'Yönetim kurulu üyesi bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json(uye);
  } catch (error) {
    console.error('Yönetim kurulu üyesi getirme hatası:', error);
    return NextResponse.json(
      { error: 'Yönetim kurulu üyesi getirilemedi' },
      { status: 500 }
    );
  }
};

// PUT - Yönetim kurulu üyesini güncelle
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
    const { ad, soyad, ilceGorevId, telefon, email, adres, sira, sorumluMahalleler } = data;

    if (!ad || !soyad || !ilceGorevId) {
      return NextResponse.json(
        { error: 'Ad, soyad ve İlçe Görevi zorunludur' },
        { status: 400 }
      );
    }

    // Önce mevcut mahalle ilişkilerini sil
    await prisma.yonetimKuruluMahalle.deleteMany({
      where: { yonetimKuruluUyesiId: id }
    });

    const uye = await prisma.yonetimKuruluUyesi.update({
      where: { id },
      data: {
        ad: ad.trim(),
        soyad: soyad.trim(),
        ilceGorevId: parseInt(ilceGorevId),
        telefon: telefon?.trim() || null,
        email: email?.trim() || null,
        adres: adres?.trim() || null,
        sira: sira || 0,
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

    return NextResponse.json(uye);
  } catch (error) {
    console.error('Yönetim kurulu üyesi güncelleme hatası:', error);
    return NextResponse.json(
      { error: 'Yönetim kurulu üyesi güncellenemedi' },
      { status: 500 }
    );
  }
};

// DELETE - Yönetim kurulu üyesini sil
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

    await prisma.yonetimKuruluUyesi.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Yönetim kurulu üyesi silindi' });
  } catch (error) {
    console.error('Yönetim kurulu üyesi silme hatası:', error);
    return NextResponse.json(
      { error: 'Yönetim kurulu üyesi silinemedi' },
      { status: 500 }
    );
  }
};

