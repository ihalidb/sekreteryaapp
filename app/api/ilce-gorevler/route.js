import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export async function GET() {
  try {
    const gorevler = await prisma.ilceGorev.findMany({
      orderBy: {
        sira: 'asc',
      },
    });
    return NextResponse.json(gorevler);
  } catch (error) {
    console.error('İlçe görevleri listesi hatası:', error);
    return NextResponse.json({ error: 'İlçe görevleri listelenemedi' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { ad, aciklama, sira } = body;

    if (!ad || ad.trim() === '') {
      return NextResponse.json({ error: 'Görev adı gereklidir' }, { status: 400 });
    }

    const gorev = await prisma.ilceGorev.create({
      data: {
        ad: ad.trim(),
        aciklama: aciklama?.trim() || null,
        sira: sira || 0,
      },
    });

    return NextResponse.json(gorev, { status: 201 });
  } catch (error) {
    console.error('İlçe görevi oluşturma hatası:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Bu görev adı zaten mevcut' }, { status: 400 });
    }
    return NextResponse.json({ error: 'İlçe görevi oluşturulamadı' }, { status: 500 });
  }
}

