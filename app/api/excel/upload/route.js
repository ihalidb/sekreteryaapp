import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { prisma } from '../../../../lib/prisma.js';
import { getCurrentUser } from '../../../../lib/auth.js';

const parseExcelBuffer = (buffer) => {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  
  // İlk satırı (açıklama satırını) atla, 2. satırdan başla (header)
  const data = XLSX.utils.sheet_to_json(firstSheet, { 
    range: 1, // 2. satırdan başla (0-indexed)
    defval: null 
  });
  
  return data;
};

const uploadHandlers = {
  kisiler: async (data, userId) => {
    const results = { success: 0, failed: 0, errors: [], skipped: 0 };
    
    for (const row of data) {
      try {
        // Zorunlu alanları kontrol et - Ad, Soyad, Telefon zorunlu
        if (!row['Ad'] || row['Ad'].toString().trim() === '' ||
            !row['Soyad'] || row['Soyad'].toString().trim() === '' ||
            !row['Telefon'] || row['Telefon'].toString().trim() === '') {
          results.skipped++;
          continue;
        }

        const ad = row['Ad'].toString().trim();
        const soyad = row['Soyad'].toString().trim();
        const telefon = row['Telefon'].toString().trim();
        const gorev = row['Görev'] ? row['Görev'].toString().trim() : '';
        const sorumluMahalle = row['Sorumlu Mahalle'] ? row['Sorumlu Mahalle'].toString().trim() : '';

        // Duplicate kontrolü - Ad + Soyad + Telefon kombinasyonu
        const existingYonetimKurulu = await prisma.yonetimKuruluUyesi.findFirst({
          where: {
            ad: ad,
            soyad: soyad,
            telefon: telefon
          }
        });

        const existingMahalleBaskan = await prisma.mahalleBaskan.findFirst({
          where: {
            ad: ad,
            soyad: soyad,
            telefon: telefon
          }
        });

        if (existingYonetimKurulu || existingMahalleBaskan) {
          results.skipped++;
          continue;
        }

        // Görev tipine göre dağıtım yap
        if (gorev.toLowerCase().includes('mahalle başkanı')) {
          // Mahalle Başkanı olarak ekle
          if (sorumluMahalle) {
            // Mahalle adını bul
            const mahalle = await prisma.mahalle.findFirst({
              where: { ad: sorumluMahalle.split(',')[0].trim() }
            });

            if (mahalle) {
              await prisma.mahalleBaskan.create({
                data: {
                  ad: ad,
                  soyad: soyad,
                  telefon: telefon,
                  email: row['Email'] ? row['Email'].toString().trim() : null,
                  adres: row['Adres'] ? row['Adres'].toString().trim() : null,
                  mahalleId: mahalle.id,
                  createdBy: userId,
                },
              });
              results.success++;
            } else {
              results.failed++;
              results.errors.push(`${ad} ${soyad} - Mahalle bulunamadı: ${sorumluMahalle}`);
            }
          } else {
            results.failed++;
            results.errors.push(`${ad} ${soyad} - Mahalle Başkanı için mahalle belirtilmeli`);
          }
        } else {
          // Yönetim Kurulu üyesi olarak ekle
          let ilceGorevId = null;
          
          if (gorev) {
            const ilceGorev = await prisma.ilceGorev.findFirst({
              where: { ad: gorev }
            });
            if (ilceGorev) {
              ilceGorevId = ilceGorev.id;
            }
          }

          const yonetimKuruluUyesi = await prisma.yonetimKuruluUyesi.create({
            data: {
              ad: ad,
              soyad: soyad,
              ilceGorevId: ilceGorevId,
              telefon: telefon,
              email: row['Email'] ? row['Email'].toString().trim() : null,
              adres: row['Adres'] ? row['Adres'].toString().trim() : null,
              sira: 0,
              createdBy: userId,
            },
          });

          // Sorumlu mahalleleri ekle
          if (sorumluMahalle) {
            const mahalleAdlari = sorumluMahalle.split(',').map(m => m.trim());
            for (const mahalleAdi of mahalleAdlari) {
              const mahalle = await prisma.mahalle.findFirst({
                where: { ad: mahalleAdi }
              });
              
              if (mahalle) {
                await prisma.yonetimKuruluMahalle.create({
                  data: {
                    yonetimKuruluUyesiId: yonetimKuruluUyesi.id,
                    mahalleId: mahalle.id
                  }
                });
              }
            }
          }

          results.success++;
        }
      } catch (error) {
        results.failed++;
        results.errors.push(`${row['Ad'] || 'Bilinmeyen'} ${row['Soyad'] || ''} - ${error.message}`);
      }
    }
    
    return results;
  },
  mahalleler: async (data, userId) => {
    const results = { success: 0, failed: 0, errors: [], skipped: 0 };
    
    for (const row of data) {
      try {
        // Boş satırları atla - Ad zorunlu
        if (!row['Ad'] || row['Ad'].toString().trim() === '') {
          continue;
        }

        const ad = row['Ad'].toString().trim();

        // Aynı ada sahip mahalle var mı kontrol et
        const existing = await prisma.mahalle.findFirst({
          where: { ad: ad },
        });

        if (existing) {
          results.skipped++;
          continue;
        }

        await prisma.mahalle.create({
          data: {
            ad: ad,
            aciklama: row['Açıklama'] ? row['Açıklama'].toString().trim() : null,
            lokalYeri: row['Lokal Yeri'] ? row['Lokal Yeri'].toString().trim() : null,
            createdBy: userId,
          },
        });
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(`${row['Ad'] || 'Bilinmeyen'}: ${error.message}`);
      }
    }
    return results;
  },

  ilce_gorevler: async (data, userId) => {
    const results = { success: 0, failed: 0, errors: [], skipped: 0 };
    
    for (const row of data) {
      try {
        // Boş satırları atla - Ad zorunlu
        if (!row['Ad'] || row['Ad'].toString().trim() === '') {
          continue;
        }

        const ad = row['Ad'].toString().trim();

        // Aynı ada sahip görev var mı kontrol et
        const existing = await prisma.ilceGorev.findFirst({
          where: { ad: ad },
        });

        if (existing) {
          results.skipped++;
          continue;
        }

        await prisma.ilceGorev.create({
          data: {
            ad: ad,
            aciklama: row['Açıklama'] ? row['Açıklama'].toString().trim() : null,
            sira: parseInt(row['Sıra']) || 0,
            createdBy: userId,
          },
        });
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(`${row['Ad'] || 'Bilinmeyen'}: ${error.message}`);
      }
    }
    return results;
  },

  // NOT: Üye tablosu kaldırıldı - Yönetim Kurulu veya Mahalle Başkanları'ndan yükleyin
  // uyeler: async (data, userId) => {
  //   ...
  // },

  komisyonlar: async (data, userId) => {
    const results = { success: 0, failed: 0, errors: [], skipped: 0 };
    
    for (const row of data) {
      try {
        // Boş satırları atla - Ad zorunlu
        if (!row['Ad'] || row['Ad'].toString().trim() === '') {
          continue;
        }

        const ad = row['Ad'].toString().trim();

        // Aynı ada sahip komisyon var mı kontrol et
        const existing = await prisma.komisyon.findFirst({
          where: { ad: ad },
        });

        if (existing) {
          results.skipped++;
          continue;
        }

        await prisma.komisyon.create({
          data: {
            ad: ad,
            aciklama: row['Açıklama'] ? row['Açıklama'].toString().trim() : null,
            createdBy: userId,
          },
        });
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(`${row['Ad'] || 'Bilinmeyen'}: ${error.message}`);
      }
    }
    return results;
  },

  etkinlikler: async (data, userId) => {
    const results = { success: 0, failed: 0, errors: [], skipped: 0 };
    
    for (const row of data) {
      try {
        // Boş satırları atla - Ad ve Tarih zorunlu
        if (!row['Ad'] || row['Ad'].toString().trim() === '' || !row['Tarih (YYYY-MM-DD)']) {
          continue;
        }

        const ad = row['Ad'].toString().trim();

        // Tarih parse et
        let tarih = new Date(row['Tarih (YYYY-MM-DD)']);
        if (isNaN(tarih.getTime())) {
          // Excel tarih formatı deneme
          const excelDate = parseFloat(row['Tarih (YYYY-MM-DD)']);
          if (!isNaN(excelDate)) {
            tarih = new Date((excelDate - 25569) * 86400 * 1000);
          } else {
            throw new Error('Geçersiz tarih formatı');
          }
        }

        // Aynı ad ve tarihe sahip etkinlik var mı kontrol et
        const existing = await prisma.etkinlik.findFirst({
          where: {
            ad: ad,
            tarih: tarih,
          },
        });

        if (existing) {
          results.skipped++;
          continue;
        }

        await prisma.etkinlik.create({
          data: {
            ad: ad,
            aciklama: row['Açıklama'] ? row['Açıklama'].toString().trim() : null,
            tarih: tarih,
            konum: row['Konum'] ? row['Konum'].toString().trim() : null,
            zorunlu: row['Zorunlu (EVET/HAYIR)']?.toString().toUpperCase() === 'EVET',
            createdBy: userId,
          },
        });
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(`${row['Ad'] || 'Bilinmeyen'}: ${error.message}`);
      }
    }
    return results;
  },

  uye_komisyon: async (data, userId) => {
    const results = { success: 0, failed: 0, errors: [] };
    
    for (const row of data) {
      try {
        // Boş satırları atla - Üye bilgileri ve Komisyon zorunlu
        const uyeAd = row['Üye Ad'] ? row['Üye Ad'].toString().trim() : '';
        const uyeSoyad = row['Üye Soyad'] ? row['Üye Soyad'].toString().trim() : '';
        const komisyonAd = row['Komisyon Ad'] ? row['Komisyon Ad'].toString().trim() : '';
        
        if (!uyeAd || !uyeSoyad || !komisyonAd) {
          continue;
        }

        // Üyeyi bul
        const uye = await prisma.uye.findFirst({
          where: {
            ad: uyeAd,
            soyad: uyeSoyad,
          },
        });

        if (!uye) {
          throw new Error('Üye bulunamadı');
        }

        // Komisyonu bul
        const komisyon = await prisma.komisyon.findFirst({
          where: { ad: komisyonAd },
        });

        if (!komisyon) {
          throw new Error('Komisyon bulunamadı');
        }

        await prisma.uyeKomisyon.create({
          data: {
            uyeId: uye.id,
            komisyonId: komisyon.id,
            gorev: row['Görev'] ? row['Görev'].toString().trim() : null,
            createdBy: userId,
          },
        });
        results.success++;
      } catch (error) {
        results.failed++;
        const displayName = `${row['Üye Ad'] || ''} ${row['Üye Soyad'] || ''} - ${row['Komisyon Ad'] || ''}`.trim() || 'Bilinmeyen';
        results.errors.push(`${displayName}: ${error.message}`);
      }
    }
    return results;
  },

  uye_mahalle: async (data, userId) => {
    const results = { success: 0, failed: 0, errors: [] };
    
    for (const row of data) {
      try {
        // Boş satırları atla - Üye bilgileri ve Mahalle zorunlu
        const uyeAd = row['Üye Ad'] ? row['Üye Ad'].toString().trim() : '';
        const uyeSoyad = row['Üye Soyad'] ? row['Üye Soyad'].toString().trim() : '';
        const mahalleAd = row['Mahalle Ad'] ? row['Mahalle Ad'].toString().trim() : '';
        
        if (!uyeAd || !uyeSoyad || !mahalleAd) {
          continue;
        }

        // Üyeyi bul
        const uye = await prisma.uye.findFirst({
          where: {
            ad: uyeAd,
            soyad: uyeSoyad,
          },
        });

        if (!uye) {
          throw new Error('Üye bulunamadı');
        }

        // Mahalleyi bul
        const mahalle = await prisma.mahalle.findFirst({
          where: { ad: mahalleAd },
        });

        if (!mahalle) {
          throw new Error('Mahalle bulunamadı');
        }

        await prisma.uyeMahalle.create({
          data: {
            uyeId: uye.id,
            mahalleId: mahalle.id,
            createdBy: userId,
          },
        });
        results.success++;
      } catch (error) {
        results.failed++;
        const displayName = `${row['Üye Ad'] || ''} ${row['Üye Soyad'] || ''} - ${row['Mahalle Ad'] || ''}`.trim() || 'Bilinmeyen';
        results.errors.push(`${displayName}: ${error.message}`);
      }
    }
    return results;
  },
};

export const POST = async (request) => {
  try {
    // Auth kontrolü
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Oturum gerekli' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const type = formData.get('type');

    if (!file) {
      return NextResponse.json(
        { error: 'Dosya yüklenmedi' },
        { status: 400 }
      );
    }

    if (!type || !uploadHandlers[type]) {
      return NextResponse.json(
        { error: 'Geçersiz yükleme tipi. Geçerli tipler: ' + Object.keys(uploadHandlers).join(', ') },
        { status: 400 }
      );
    }

    // Dosyayı buffer olarak oku
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Excel'i parse et
    const data = parseExcelBuffer(buffer);

    if (data.length === 0) {
      return NextResponse.json(
        { error: 'Excel dosyası boş veya geçersiz' },
        { status: 400 }
      );
    }

    // İlgili handler'ı çağır
    const results = await uploadHandlers[type](data, user.id);

    // Mesaj oluştur
    let message = `${results.success} kayıt başarıyla yüklendi`;
    if (results.skipped > 0) {
      message += `, ${results.skipped} kayıt zaten mevcut (atlandı)`;
    }
    if (results.failed > 0) {
      message += `, ${results.failed} kayıt başarısız`;
    }

    return NextResponse.json({
      success: true,
      message: message,
      results: results,
    });
  } catch (error) {
    console.error('Excel yükleme hatası:', error);
    return NextResponse.json(
      { error: 'Excel dosyası yüklenirken hata oluştu', details: error.message },
      { status: 500 }
    );
  }
};

