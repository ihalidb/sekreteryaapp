import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export async function GET() {
  try {
    const mahalleler = await prisma.mahalle.findMany({
      include: {
        mahalleBaskan: true,
        sorumluUyeler: {
          include: {
            uye: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(mahalleler);
  } catch (error) {
    console.error('Mahalleler listesi hatası:', error);
    return NextResponse.json({ error: 'Mahalleler listelenemedi' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { ad, aciklama, lokalYeri, mahalleBaskanId } = body;

    if (!ad || ad.trim() === '') {
      return NextResponse.json({ error: 'Mahalle adı gereklidir' }, { status: 400 });
    }

    const mahalle = await prisma.mahalle.create({
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

    return NextResponse.json(mahalle, { status: 201 });
  } catch (error) {
    console.error('Mahalle oluşturma hatası:', error);
    return NextResponse.json({ error: 'Mahalle oluşturulamadı' }, { status: 500 });
  }
}

