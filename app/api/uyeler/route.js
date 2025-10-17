import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

const ROLE_PRIORITY = {
  'İlçe Başkanı': 1,
  'Yürütme Kurulu': 2,
  'Yönetim Kurulu': 3,
};

const trCollator = new Intl.Collator('tr', { sensitivity: 'base' });

export async function GET() {
  try {
    const uyelerRaw = await prisma.uye.findMany({
      include: {
        ilceGorev: true,
        komisyonlar: {
          include: {
            komisyon: true,
          },
        },
        sorumluMahalleler: {
          include: {
            mahalle: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const uyeler = [...uyelerRaw].sort((a, b) => {
      const ra = ROLE_PRIORITY[a.ilceGorev?.ad || ''] || 999;
      const rb = ROLE_PRIORITY[b.ilceGorev?.ad || ''] || 999;
      if (ra !== rb) return ra - rb;
      const nameA = `${a.ad} ${a.soyad}`.trim();
      const nameB = `${b.ad} ${b.soyad}`.trim();
      return trCollator.compare(nameA, nameB);
    });

    return NextResponse.json(uyeler);
  } catch (error) {
    console.error('Üyeler listesi hatası:', error);
    return NextResponse.json({ error: 'Üyeler listelenemedi' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { ad, soyad, telefon, email, adres, ilceGorevId, mahalleler } = body;

    if (!ad || ad.trim() === '') {
      return NextResponse.json({ error: 'Ad gereklidir' }, { status: 400 });
    }

    if (!soyad || soyad.trim() === '') {
      return NextResponse.json({ error: 'Soyad gereklidir' }, { status: 400 });
    }

    // Üye oluştur
    const uye = await prisma.uye.create({
      data: {
        ad: ad.trim(),
        soyad: soyad.trim(),
        telefon: telefon?.trim() || null,
        email: email?.trim() || null,
        adres: adres?.trim() || null,
        ilceGorevId: ilceGorevId ? parseInt(ilceGorevId) : null,
      },
    });

    // Sorumlu mahalleleri ekle
    if (mahalleler && mahalleler.length > 0) {
      await Promise.all(
        mahalleler.map((mahalleId) =>
          prisma.uyeMahalle.create({
            data: {
              uyeId: uye.id,
              mahalleId: parseInt(mahalleId),
            },
          })
        )
      );
    }

    // Tam veri ile geri dön
    const uyeWithRelations = await prisma.uye.findUnique({
      where: { id: uye.id },
      include: {
        ilceGorev: true,
        komisyonlar: {
          include: {
            komisyon: true,
          },
        },
        sorumluMahalleler: {
          include: {
            mahalle: true,
          },
        },
      },
    });

    return NextResponse.json(uyeWithRelations, { status: 201 });
  } catch (error) {
    console.error('Üye oluşturma hatası:', error);
    return NextResponse.json({ error: 'Üye oluşturulamadı' }, { status: 500 });
  }
}

