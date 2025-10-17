import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export async function GET() {
  try {
    const etkinlikler = await prisma.etkinlik.findMany({
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
      orderBy: {
        tarih: 'desc',
      },
    });
    return NextResponse.json(etkinlikler);
  } catch (error) {
    console.error('Etkinlikler listesi hatası:', error);
    return NextResponse.json({ error: 'Etkinlikler listelenemedi' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { ad, aciklama, tarih, konum, zorunlu, komisyonlar, ilceYonetimKuruluEkle } = body;

    if (!ad || ad.trim() === '') {
      return NextResponse.json({ error: 'Etkinlik adı gereklidir' }, { status: 400 });
    }

    if (!tarih) {
      return NextResponse.json({ error: 'Tarih gereklidir' }, { status: 400 });
    }

    // Etkinlik oluştur
    const etkinlik = await prisma.etkinlik.create({
      data: {
        ad: ad.trim(),
        aciklama: aciklama?.trim() || null,
        tarih: new Date(tarih),
        konum: konum?.trim() || null,
        zorunlu: zorunlu !== undefined ? zorunlu : true,
        ilceYonetimKuruluEkle: ilceYonetimKuruluEkle || false,
      },
    });

    // Seçilen komisyonları ekle
    if (komisyonlar && komisyonlar.length > 0) {
      await Promise.all(
        komisyonlar.map((komisyonId) =>
          prisma.etkinlikKomisyon.create({
            data: {
              etkinlikId: etkinlik.id,
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
          // Duplicate kontrolü
          const existing = await prisma.etkinlikYoklama.findUnique({
            where: {
              etkinlikId_uyeId: {
                etkinlikId: etkinlik.id,
                uyeId: uyeId,
              },
            },
          });

          if (!existing) {
            await prisma.etkinlikYoklama.create({
              data: {
                etkinlikId: etkinlik.id,
                uyeId: uyeId,
                katildi: false,
              },
            });
          }
        }
      }
    }

    // İlçe Yönetim Kurulu üyelerini ekle (Başkan, Yürütme, Yönetim Kurulu)
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
              etkinlikId: etkinlik.id,
              uyeId: uyeId,
            },
          },
        });

        if (!existing) {
          await prisma.etkinlikYoklama.create({
            data: {
              etkinlikId: etkinlik.id,
              uyeId: uyeId,
              katildi: false,
            },
          });
        }
      }
    }

    // Tam veri ile geri dön
    const etkinlikWithRelations = await prisma.etkinlik.findUnique({
      where: { id: etkinlik.id },
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

    return NextResponse.json(etkinlikWithRelations, { status: 201 });
  } catch (error) {
    console.error('Etkinlik oluşturma hatası:', error);
    return NextResponse.json({ error: 'Etkinlik oluşturulamadı' }, { status: 500 });
  }
}

