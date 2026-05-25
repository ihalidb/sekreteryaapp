import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma.js';
import { assignMahalleBaskan } from '../../../lib/mahalleBaskan.js';

export async function GET() {
  try {
    const mahalleler = await prisma.mahalle.findMany({
      include: {
        mahalleBaskan: true,
        mahalleBaskanDetay: true,
        sorumluUyeler: {
          include: {
            uye: true,
          },
        },
        sorumluYonetimKurulu: {
          include: {
            yonetimKuruluUyesi: true,
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
    const { ad, aciklama, lokalYeri, mahalleBaskanId, mahalleBaskan, mahalleBaskanAssign } = body;

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
    });

    const assignment = mahalleBaskanAssign ?? mahalleBaskan;
    if (assignment) {
      try {
        await assignMahalleBaskan(prisma, mahalle.id, assignment);
      } catch (err) {
        return NextResponse.json(
          { error: err.message || 'Başkan ataması yapılamadı' },
          { status: 400 }
        );
      }
    }

    const result = await prisma.mahalle.findUnique({
      where: { id: mahalle.id },
      include: {
        mahalleBaskan: true,
        mahalleBaskanDetay: true,
      },
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Mahalle oluşturma hatası:', error);
    return NextResponse.json({ error: 'Mahalle oluşturulamadı' }, { status: 500 });
  }
}

