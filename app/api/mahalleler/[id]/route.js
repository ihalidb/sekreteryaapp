import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function GET(request, { params }) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    const mahalle = await prisma.mahalle.findUnique({
      where: { id },
      include: {
        mahalleBaskan: true,
        sorumluUyeler: {
          include: {
            uye: true,
          },
        },
      },
    });

    if (!mahalle) {
      return NextResponse.json({ error: 'Mahalle bulunamadı' }, { status: 404 });
    }

    return NextResponse.json(mahalle);
  } catch (error) {
    console.error('Mahalle getirme hatası:', error);
    return NextResponse.json({ error: 'Mahalle getirilemedi' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    const body = await request.json();
    const { ad, aciklama, lokalYeri, mahalleBaskanId } = body;

    if (!ad || ad.trim() === '') {
      return NextResponse.json({ error: 'Mahalle adı gereklidir' }, { status: 400 });
    }

    const mahalle = await prisma.mahalle.update({
      where: { id },
      data: {
        ad: ad.trim(),
        aciklama: aciklama?.trim() || null,
        lokalYeri: lokalYeri?.trim() || null,
        mahalleBaskanId: mahalleBaskanId ? parseInt(mahalleBaskanId) : null,
      },
      include: {
        mahalleBaskan: true,
      },
    });

    return NextResponse.json(mahalle);
  } catch (error) {
    console.error('Mahalle güncelleme hatası:', error);
    return NextResponse.json({ error: 'Mahalle güncellenemedi' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    await prisma.mahalle.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Mahalle silindi' });
  } catch (error) {
    console.error('Mahalle silme hatası:', error);
    return NextResponse.json({ error: 'Mahalle silinemedi' }, { status: 500 });
  }
}

