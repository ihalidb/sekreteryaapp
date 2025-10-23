const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrateUyeler() {
  try {
    console.log('🚀 Üyeler tablosundan veri taşıma başlıyor...\n');

    // Tüm üyeleri al
    const allUyeler = await prisma.uye.findMany({
      include: {
        mahalleBaskanlik: true,
      },
    });

    console.log(`📊 Toplam ${allUyeler.length} üye bulundu.\n`);

    let mahalleBaskanCount = 0;
    let yonetimKuruluCount = 0;
    let skippedCount = 0;

    for (const uye of allUyeler) {
      // Mahalle başkanı mı kontrol et (mahalleBaskanlik relation'ı varsa)
      if (uye.mahalleBaskanlik) {
        const mahalleId = uye.mahalleBaskanlik.id;
        
        // Mahalle başkanı tablosunda zaten var mı kontrol et
        const existingBaskan = await prisma.mahalleBaskan.findUnique({
          where: { mahalleId: mahalleId },
        });

        if (!existingBaskan) {
          // Mahalle başkanı olarak ekle
          await prisma.mahalleBaskan.create({
            data: {
              ad: uye.ad,
              soyad: uye.soyad,
              mahalleId: mahalleId,
              telefon: uye.telefon,
              email: uye.email,
              adres: uye.adres,
              createdBy: uye.createdBy,
            },
          });
          console.log(`✅ Mahalle Başkanı: ${uye.ad} ${uye.soyad} → ${uye.mahalleBaskanlik.ad}`);
          mahalleBaskanCount++;
        } else {
          console.log(`⏭️  Atlandı (Mahalle başkanı zaten var): ${uye.ad} ${uye.soyad}`);
          skippedCount++;
        }
      } else {
        // Yönetim kurulu üyesi olarak ekle
        await prisma.yonetimKuruluUyesi.create({
          data: {
            ad: uye.ad,
            soyad: uye.soyad,
            gorev: 'Üye', // Varsayılan görev
            telefon: uye.telefon,
            email: uye.email,
            adres: uye.adres,
            sira: 999, // En sona ekle
            createdBy: uye.createdBy,
          },
        });
        console.log(`✅ Yönetim Kurulu Üyesi: ${uye.ad} ${uye.soyad}`);
        yonetimKuruluCount++;
      }
    }

    console.log('\n📊 Özet:');
    console.log(`   - Mahalle Başkanları: ${mahalleBaskanCount}`);
    console.log(`   - Yönetim Kurulu Üyeleri: ${yonetimKuruluCount}`);
    console.log(`   - Atlanan: ${skippedCount}`);
    console.log(`   - Toplam: ${mahalleBaskanCount + yonetimKuruluCount + skippedCount}`);

    // Tüm üyeleri sil
    console.log('\n🗑️  Üyeler tablosu temizleniyor...');
    const deleted = await prisma.uye.deleteMany({});
    console.log(`✅ ${deleted.count} üye silindi.\n`);

    console.log('✅ Veri taşıma işlemi tamamlandı!');
  } catch (error) {
    console.error('❌ Hata:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrateUyeler();

