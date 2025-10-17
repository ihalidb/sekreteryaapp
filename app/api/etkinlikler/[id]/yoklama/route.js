import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';

// Etkinliğe kayıtlı tüm üyeleri ve yoklama durumlarını getir
export async function GET(request, { params }) {
  try {
    const { id: paramId } = await params;
    const etkinlikId = parseInt(paramId);

    // Etkinlik bilgisini al
    const etkinlik = await prisma.etkinlik.findUnique({
      where: { id: etkinlikId },
      include: {
        komisyonlar: {
          include: {
            komisyon: {
              include: {
                uyeler: {
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
              },
            },
          },
        },
      },
    });

    if (!etkinlik) {
      return NextResponse.json({ error: 'Etkinlik bulunamadı' }, { status: 404 });
    }

    // Etkinliğe davet edilen tüm üyeleri topla (Set kullanarak tekrar eden üyeleri engelle)
    const uyeIds = new Set();
    const uyelerMap = new Map();

    // Komisyonlardan üyeleri ekle
    etkinlik.komisyonlar.forEach((ek) => {
      ek.komisyon.uyeler.forEach((uk) => {
        if (!uyeIds.has(uk.uye.id)) {
          uyeIds.add(uk.uye.id);
          uyelerMap.set(uk.uye.id, uk.uye);
        }
      });
    });

    // İlçe Yönetim Kurulu üyelerini ekle (eğer seçilmişse)
    if (etkinlik.ilceYonetimKuruluEkle) {
      const yonetimKuruluUyeleri = await prisma.uye.findMany({
        where: {
          ilceGorev: {
            ad: {
              in: ['İlçe Başkanı', 'Yürütme Kurulu', 'Yönetim Kurulu'],
            },
          },
        },
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

      yonetimKuruluUyeleri.forEach((uye) => {
        if (!uyeIds.has(uye.id)) {
          uyeIds.add(uye.id);
          uyelerMap.set(uye.id, uye);
        }
      });
    }

    // Tüm yoklama kayıtlarını al
    const yoklamalar = await prisma.etkinlikYoklama.findMany({
      where: {
        etkinlikId: etkinlikId,
        uyeId: {
          in: Array.from(uyeIds),
        },
      },
    });

    // Yoklama haritası oluştur
    const yoklamaMap = new Map();
    yoklamalar.forEach((yoklama) => {
      yoklamaMap.set(yoklama.uyeId, {
        id: yoklama.id,
        katildi: yoklama.katildi,
        durum: yoklama.notlar || 'Belirsiz',
        updatedAt: yoklama.updatedAt,
      });
    });

    // Üyeleri ve yoklama durumlarını birleştir
    const uyelerWithYoklama = Array.from(uyelerMap.values()).map((uye) => ({
      ...uye,
      yoklama: yoklamaMap.get(uye.id) || null,
    }));

    // İsme göre sırala (Türkçe karakterlere uygun)
    uyelerWithYoklama.sort((a, b) => {
      const nameA = `${a.ad} ${a.soyad}`;
      const nameB = `${b.ad} ${b.soyad}`;
      return nameA.localeCompare(nameB, 'tr');
    });

    // İstatistikler
    const stats = {
      toplam: uyelerWithYoklama.length,
      geldi: yoklamalar.filter((y) => y.katildi || y.notlar === 'Geldi').length,
      mazeretli: yoklamalar.filter((y) => y.notlar?.startsWith('Mazeretli')).length,
      gelmedi: yoklamalar.filter((y) => y.notlar === 'Gelmedi').length,
      belirsiz: uyelerWithYoklama.length - yoklamalar.length,
    };

    stats.katilimOrani = stats.toplam > 0 ? Math.round((stats.geldi / stats.toplam) * 100) : 0;

    return NextResponse.json({
      etkinlik: {
        id: etkinlik.id,
        ad: etkinlik.ad,
        tarih: etkinlik.tarih,
        konum: etkinlik.konum,
        aciklama: etkinlik.aciklama,
      },
      uyeler: uyelerWithYoklama,
      stats,
    });
  } catch (error) {
    console.error('Yoklama listesi hatası:', error);
    return NextResponse.json({ error: 'Yoklama listesi getirilemedi', details: error.message }, { status: 500 });
  }
}

// Tekil veya toplu yoklama kaydet/güncelle
export async function POST(request, { params }) {
  try {
    const { id: paramId } = await params;
    const etkinlikId = parseInt(paramId);
    const body = await request.json();

    // Toplu işlem mi tekil mi kontrol et
    if (Array.isArray(body)) {
      // Toplu işlem
      const results = await Promise.all(
        body.map(async ({ uyeId, durum }) => {
          const katildi = durum === 'Geldi';
          return prisma.etkinlikYoklama.upsert({
            where: {
              etkinlikId_uyeId: {
                etkinlikId,
                uyeId: parseInt(uyeId),
              },
            },
            update: {
              katildi,
              notlar: durum,
            },
            create: {
              etkinlikId,
              uyeId: parseInt(uyeId),
              katildi,
              notlar: durum,
            },
          });
        })
      );

      return NextResponse.json({
        message: `${results.length} üye için yoklama kaydedildi`,
        count: results.length,
      });
    } else {
      // Tekil işlem
      const { uyeId, durum } = body;

      if (!uyeId) {
        return NextResponse.json({ error: 'Üye ID gereklidir' }, { status: 400 });
      }

      if (!durum) {
        return NextResponse.json({ error: 'Durum gereklidir' }, { status: 400 });
      }

      const katildi = durum === 'Geldi';

      const yoklama = await prisma.etkinlikYoklama.upsert({
        where: {
          etkinlikId_uyeId: {
            etkinlikId,
            uyeId: parseInt(uyeId),
          },
        },
        update: {
          katildi,
          notlar: durum,
        },
        create: {
          etkinlikId,
          uyeId: parseInt(uyeId),
          katildi,
          notlar: durum,
        },
        include: {
          uye: {
            include: {
              ilceGorev: true,
            },
          },
        },
      });

      return NextResponse.json(yoklama);
    }
  } catch (error) {
    console.error('Yoklama kaydetme hatası:', error);
    return NextResponse.json({ error: 'Yoklama kaydedilemedi', details: error.message }, { status: 500 });
  }
}

// Yoklama kaydını sil
export async function DELETE(request, { params }) {
  try {
    const { id: paramId } = await params;
    const etkinlikId = parseInt(paramId);
    const { searchParams } = new URL(request.url);
    const uyeId = searchParams.get('uyeId');

    if (!uyeId) {
      return NextResponse.json({ error: 'Üye ID gereklidir' }, { status: 400 });
    }

    await prisma.etkinlikYoklama.delete({
      where: {
        etkinlikId_uyeId: {
          etkinlikId,
          uyeId: parseInt(uyeId),
        },
      },
    });

    return NextResponse.json({ message: 'Yoklama kaydı silindi' });
  } catch (error) {
    console.error('Yoklama silme hatası:', error);
    return NextResponse.json({ error: 'Yoklama silinemedi' }, { status: 500 });
  }
}
