import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function GET(request, { params }) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    const komisyon = await prisma.komisyon.findUnique({
      where: { id },
      include: {
        uyeler: {
          include: {
            uye: {
              include: {
                ilceGorev: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
        etkinlikler: {
          include: {
            etkinlik: {
              include: {
                yoklamalar: {
                  where: {
                    katildi: true,
                  },
                },
              },
            },
          },
          orderBy: {
            etkinlik: {
              tarih: 'desc',
            },
          },
        },
      },
    });

    if (!komisyon) {
      return NextResponse.json({ error: 'Komisyon bulunamadı' }, { status: 404 });
    }

    return NextResponse.json(komisyon);
  } catch (error) {
    console.error('Komisyon getirme hatası:', error);
    return NextResponse.json({ error: 'Komisyon getirilemedi' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    const body = await request.json();
    const { ad, aciklama } = body;

    if (!ad || ad.trim() === '') {
      return NextResponse.json({ error: 'Komisyon adı gereklidir' }, { status: 400 });
    }

    const komisyon = await prisma.komisyon.update({
      where: { id },
      data: {
        ad: ad.trim(),
        aciklama: aciklama?.trim() || null,
      },
    });

    return NextResponse.json(komisyon);
  } catch (error) {
    console.error('Komisyon güncelleme hatası:', error);
    return NextResponse.json({ error: 'Komisyon güncellenemedi' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    await prisma.komisyon.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Komisyon silindi' });
  } catch (error) {
    console.error('Komisyon silme hatası:', error);
    return NextResponse.json({ error: 'Komisyon silinemedi' }, { status: 500 });
  }
}

