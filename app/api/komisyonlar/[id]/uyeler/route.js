import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';

// Komisyona üye ekle veya görevini güncelle
export async function POST(request, { params }) {
  try {
    const { id: paramId } = await params;
    const komisyonId = parseInt(paramId);
    const body = await request.json();
    const { uyeId, gorev } = body;

    if (!uyeId) {
      return NextResponse.json({ error: 'Üye seçimi gereklidir' }, { status: 400 });
    }

    const uyeKomisyon = await prisma.uyeKomisyon.upsert({
      where: {
        uyeId_komisyonId: {
          uyeId: parseInt(uyeId),
          komisyonId,
        },
      },
      update: {
        gorev: gorev?.trim() || null,
      },
      create: {
        uyeId: parseInt(uyeId),
        komisyonId,
        gorev: gorev?.trim() || null,
      },
      include: {
        uye: true,
      },
    });

    return NextResponse.json(uyeKomisyon, { status: 201 });
  } catch (error) {
    console.error('Komisyona üye ekleme hatası:', error);
    return NextResponse.json({ error: 'Üye eklenemedi' }, { status: 500 });
  }
}

// Komisyon üyesinin görevini güncelle
export async function PUT(request, { params }) {
  try {
    const { id: paramId } = await params;
    const komisyonId = parseInt(paramId);
    const body = await request.json();
    const { uyeKomisyonId, gorev } = body;

    if (!uyeKomisyonId) {
      return NextResponse.json({ error: 'UyeKomisyon ID gereklidir' }, { status: 400 });
    }

    // Önce güvenlik kontrolü yap
    const existing = await prisma.uyeKomisyon.findUnique({
      where: {
        id: parseInt(uyeKomisyonId),
      },
    });

    if (!existing || existing.komisyonId !== komisyonId) {
      return NextResponse.json({ error: 'Yetkisiz işlem' }, { status: 403 });
    }

    const uyeKomisyon = await prisma.uyeKomisyon.update({
      where: {
        id: parseInt(uyeKomisyonId),
      },
      data: {
        gorev: gorev?.trim() || null,
      },
      include: {
        uye: {
          include: {
            ilceGorev: true,
          },
        },
      },
    });

    return NextResponse.json(uyeKomisyon);
  } catch (error) {
    console.error('Komisyon üyesi güncelleme hatası:', error);
    return NextResponse.json({ error: 'Üye görevi güncellenemedi' }, { status: 500 });
  }
}

// Komisyondan üye çıkar
export async function DELETE(request, { params }) {
  try {
    const { id: paramId } = await params;
    const komisyonId = parseInt(paramId);
    
    const { searchParams } = new URL(request.url);
    const uyeKomisyonId = searchParams.get('uyeKomisyonId');

    if (!uyeKomisyonId) {
      return NextResponse.json({ error: 'UyeKomisyon ID gereklidir' }, { status: 400 });
    }

    // Önce güvenlik kontrolü yap
    const existing = await prisma.uyeKomisyon.findUnique({
      where: {
        id: parseInt(uyeKomisyonId),
      },
    });

    if (!existing || existing.komisyonId !== komisyonId) {
      return NextResponse.json({ error: 'Yetkisiz işlem' }, { status: 403 });
    }

    await prisma.uyeKomisyon.delete({
      where: {
        id: parseInt(uyeKomisyonId),
      },
    });

    return NextResponse.json({ message: 'Üye komisyondan çıkarıldı' });
  } catch (error) {
    console.error('Komisyondan üye çıkarma hatası:', error);
    return NextResponse.json({ error: 'Üye çıkarılamadı' }, { status: 500 });
  }
}

