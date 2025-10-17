import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function GET(request, { params }) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    const gorev = await prisma.ilceGorev.findUnique({
      where: { id },
      include: {
        uyeler: true,
      },
    });

    if (!gorev) {
      return NextResponse.json({ error: 'Görev bulunamadı' }, { status: 404 });
    }

    return NextResponse.json(gorev);
  } catch (error) {
    console.error('İlçe görevi getirme hatası:', error);
    return NextResponse.json({ error: 'İlçe görevi getirilemedi' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    const body = await request.json();
    const { ad, aciklama, sira } = body;

    if (!ad || ad.trim() === '') {
      return NextResponse.json({ error: 'Görev adı gereklidir' }, { status: 400 });
    }

    const gorev = await prisma.ilceGorev.update({
      where: { id },
      data: {
        ad: ad.trim(),
        aciklama: aciklama?.trim() || null,
        sira: sira !== undefined ? sira : undefined,
      },
    });

    return NextResponse.json(gorev);
  } catch (error) {
    console.error('İlçe görevi güncelleme hatası:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Bu görev adı zaten mevcut' }, { status: 400 });
    }
    return NextResponse.json({ error: 'İlçe görevi güncellenemedi' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    await prisma.ilceGorev.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'İlçe görevi silindi' });
  } catch (error) {
    console.error('İlçe görevi silme hatası:', error);
    return NextResponse.json({ error: 'İlçe görevi silinemedi' }, { status: 500 });
  }
}

