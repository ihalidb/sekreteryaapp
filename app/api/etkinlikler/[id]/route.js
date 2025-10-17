import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function GET(request, { params }) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    const etkinlik = await prisma.etkinlik.findUnique({
      where: { id },
      include: {
        yoklamalar: {
          include: {
            uye: {
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
            },
          },
        },
        komisyonlar: {
          include: {
            komisyon: true,
          },
        },
      },
    });

    if (!etkinlik) {
      return NextResponse.json({ error: 'Etkinlik bulunamadı' }, { status: 404 });
    }

    return NextResponse.json(etkinlik);
  } catch (error) {
    console.error('Etkinlik getirme hatası:', error);
    return NextResponse.json({ error: 'Etkinlik getirilemedi' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    const body = await request.json();
    const { ad, aciklama, tarih, konum, zorunlu, komisyonlar, ilceYonetimKuruluEkle } = body;

    if (!ad || ad.trim() === '') {
      return NextResponse.json({ error: 'Etkinlik adı gereklidir' }, { status: 400 });
    }

    // Etkinlik bilgilerini güncelle
    await prisma.etkinlik.update({
      where: { id },
      data: {
        ad: ad.trim(),
        aciklama: aciklama?.trim() || null,
        ...(tarih && { tarih: new Date(tarih) }),
        konum: konum?.trim() || null,
        zorunlu: zorunlu !== undefined ? zorunlu : true,
        ilceYonetimKuruluEkle: ilceYonetimKuruluEkle || false,
      },
    });

    // Mevcut komisyon ilişkilerini sil
    await prisma.etkinlikKomisyon.deleteMany({
      where: { etkinlikId: id },
    });

    // Mevcut yoklamaları sil (yeniden oluşturulacak)
    await prisma.etkinlikYoklama.deleteMany({
      where: { etkinlikId: id },
    });

    // Yeni komisyonları ekle
    if (komisyonlar && komisyonlar.length > 0) {
      await Promise.all(
        komisyonlar.map((komisyonId) =>
          prisma.etkinlikKomisyon.create({
            data: {
              etkinlikId: id,
              komisyonId: parseInt(komisyonId),
            },
          })
        )
      );

      // Her komisyondaki üyeleri yoklamaya ekle
      for (const komisyonId of komisyonlar) {
        const komisyonUyeleri = await prisma.uyeKomisyon.findMany({
          where: { komisyonId: parseInt(komisyonId) },
          select: { uyeId: true },
        });

        for (const { uyeId } of komisyonUyeleri) {
          const existing = await prisma.etkinlikYoklama.findUnique({
            where: {
              etkinlikId_uyeId: {
                etkinlikId: id,
                uyeId: uyeId,
              },
            },
          });

          if (!existing) {
            await prisma.etkinlikYoklama.create({
              data: {
                etkinlikId: id,
                uyeId: uyeId,
                katildi: false,
              },
            });
          }
        }
      }
    }

    // İlçe Yönetim Kurulu üyelerini ekle
    if (ilceYonetimKuruluEkle) {
      const yonetimKuruluUyeleri = await prisma.uye.findMany({
        where: {
          ilceGorev: {
            ad: {
              in: ['İlçe Başkanı', 'Yürütme Kurulu', 'Yönetim Kurulu'],
            },
          },
        },
        select: { id: true },
      });

      for (const { id: uyeId } of yonetimKuruluUyeleri) {
        const existing = await prisma.etkinlikYoklama.findUnique({
          where: {
            etkinlikId_uyeId: {
              etkinlikId: id,
              uyeId: uyeId,
            },
          },
        });

        if (!existing) {
          await prisma.etkinlikYoklama.create({
            data: {
              etkinlikId: id,
              uyeId: uyeId,
              katildi: false,
            },
          });
        }
      }
    }

    // Güncellenmiş veriyi getir
    const etkinlikWithRelations = await prisma.etkinlik.findUnique({
      where: { id },
      include: {
        komisyonlar: {
          include: {
            komisyon: true,
          },
        },
        yoklamalar: {
          include: {
            uye: {
              include: {
                ilceGorev: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(etkinlikWithRelations);
  } catch (error) {
    console.error('Etkinlik güncelleme hatası:', error);
    return NextResponse.json({ error: 'Etkinlik güncellenemedi' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    await prisma.etkinlik.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Etkinlik silindi' });
  } catch (error) {
    console.error('Etkinlik silme hatası:', error);
    return NextResponse.json({ error: 'Etkinlik silinemedi' }, { status: 500 });
  }
}

