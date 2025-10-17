import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function GET(request, { params }) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    const uye = await prisma.uye.findUnique({
      where: { id },
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
        yoklamalar: {
          include: {
            etkinlik: {
              include: {
                komisyonlar: {
                  include: {
                    komisyon: true,
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

    if (!uye) {
      return NextResponse.json({ error: 'Üye bulunamadı' }, { status: 404 });
    }

    // Etkinlik istatistikleri hesapla
    const stats = {
      toplam: uye.yoklamalar.length,
      katildi: uye.yoklamalar.filter(y => y.katildi || y.notlar === 'Geldi').length,
      mazeretli: uye.yoklamalar.filter(y => y.notlar?.startsWith('Mazeretli')).length,
      gelmedi: uye.yoklamalar.filter(y => y.notlar === 'Gelmedi').length,
    };

    // Katılım oranı hesabında sadece zorunlu etkinlikleri dikkate al
    const zorunluYoklamalar = uye.yoklamalar.filter(y => y.etkinlik.zorunlu);
    stats.zorunluToplam = zorunluYoklamalar.length;
    stats.zorunluKatildi = zorunluYoklamalar.filter(y => y.katildi || y.notlar === 'Geldi').length;
    stats.katilimOrani = stats.zorunluToplam > 0 ? Math.round((stats.zorunluKatildi / stats.zorunluToplam) * 100) : 0;

    return NextResponse.json({
      ...uye,
      stats,
    });
  } catch (error) {
    console.error('Üye getirme hatası:', error);
    return NextResponse.json({ error: 'Üye getirilemedi' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    const body = await request.json();
    const { ad, soyad, telefon, email, adres, ilceGorevId, mahalleler } = body;

    if (!ad || ad.trim() === '') {
      return NextResponse.json({ error: 'Ad gereklidir' }, { status: 400 });
    }

    if (!soyad || soyad.trim() === '') {
      return NextResponse.json({ error: 'Soyad gereklidir' }, { status: 400 });
    }

    // Üye bilgilerini güncelle
    await prisma.uye.update({
      where: { id },
      data: {
        ad: ad.trim(),
        soyad: soyad.trim(),
        telefon: telefon?.trim() || null,
        email: email?.trim() || null,
        adres: adres?.trim() || null,
        ilceGorevId: ilceGorevId ? parseInt(ilceGorevId) : null,
      },
    });

    // Mevcut mahalle ilişkilerini sil
    await prisma.uyeMahalle.deleteMany({
      where: { uyeId: id },
    });

    // Yeni mahalle ilişkilerini ekle
    if (mahalleler && mahalleler.length > 0) {
      await Promise.all(
        mahalleler.map((mahalleId) =>
          prisma.uyeMahalle.create({
            data: {
              uyeId: id,
              mahalleId: parseInt(mahalleId),
            },
          })
        )
      );
    }

    // Güncellenmiş veriyi getir
    const uyeWithRelations = await prisma.uye.findUnique({
      where: { id },
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

    return NextResponse.json(uyeWithRelations);
  } catch (error) {
    console.error('Üye güncelleme hatası:', error);
    return NextResponse.json({ error: 'Üye güncellenemedi' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    await prisma.uye.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Üye silindi' });
  } catch (error) {
    console.error('Üye silme hatası:', error);
    return NextResponse.json({ error: 'Üye silinemedi' }, { status: 500 });
  }
}

