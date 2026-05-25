/**
 * Örnek etkinlik + yoklama verisi (komisyon üyeleri + yoklama kayıtları).
 * Çalıştırma: npm run seed:etkinlik
 */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const DEMO_ETKINLIK_AD = 'Demo: İlçe Toplantısı (Test)';

async function ensureKomisyonUyeleri() {
  const komisyonlar = await prisma.komisyon.findMany({ take: 3, orderBy: { id: 'asc' } });
  if (komisyonlar.length === 0) {
    throw new Error('Komisyon bulunamadı. Önce komisyon ekleyin.');
  }

  const ykUyeler = await prisma.yonetimKuruluUyesi.findMany({
    take: 12,
    orderBy: { sira: 'asc' },
  });

  if (ykUyeler.length < 4) {
    throw new Error('Yeterli yönetim kurulu üyesi yok.');
  }

  const uyeIds = [];

  for (let i = 0; i < ykUyeler.length; i++) {
    const yk = ykUyeler[i];
    let uye = await prisma.uye.findFirst({
      where: { ad: yk.ad, soyad: yk.soyad },
    });

    if (!uye) {
      uye = await prisma.uye.create({
        data: {
          ad: yk.ad,
          soyad: yk.soyad,
          telefon: yk.telefon,
          email: yk.email,
          adres: yk.adres,
          ilceGorevId: yk.ilceGorevId,
        },
      });
    }

    uyeIds.push(uye.id);

    const komisyon = komisyonlar[i % komisyonlar.length];
    await prisma.uyeKomisyon.upsert({
      where: {
        uyeId_komisyonId: { uyeId: uye.id, komisyonId: komisyon.id },
      },
      update: { gorev: 'Üye' },
      create: {
        uyeId: uye.id,
        komisyonId: komisyon.id,
        gorev: 'Üye',
      },
    });
  }

  return { komisyonlar, uyeIds };
}

async function seedEtkinlikDemo() {
  console.log('🌱 Etkinlik demo verisi oluşturuluyor...\n');

  const existing = await prisma.etkinlik.findFirst({
    where: { ad: DEMO_ETKINLIK_AD },
  });

  if (existing) {
    console.log('⏭️  Demo etkinlik zaten var (id:', existing.id, ')');
    return existing;
  }

  const { komisyonlar, uyeIds } = await ensureKomisyonUyeleri();
  console.log(`✅ ${uyeIds.length} üye komisyonlara bağlandı`);

  const gecmisTarih = new Date();
  gecmisTarih.setDate(gecmisTarih.getDate() - 7);

  const etkinlik = await prisma.etkinlik.create({
    data: {
      ad: DEMO_ETKINLIK_AD,
      aciklama: 'Otomatik seed — yoklama uçtan uca test için',
      tarih: gecmisTarih,
      konum: 'İlçe Binası',
      zorunlu: true,
      ilceYonetimKuruluEkle: true,
    },
  });

  for (const k of komisyonlar) {
    await prisma.etkinlikKomisyon.create({
      data: { etkinlikId: etkinlik.id, komisyonId: k.id },
    });
  }

  let yoklamaSayisi = 0;
  for (const komisyon of komisyonlar) {
    const komisyonUyeleri = await prisma.uyeKomisyon.findMany({
      where: { komisyonId: komisyon.id },
    });

    for (const { uyeId } of komisyonUyeleri) {
      const katildi = yoklamaSayisi % 3 !== 2;
      const durum = katildi ? 'Geldi' : 'Mazeretli';
      await prisma.etkinlikYoklama.upsert({
        where: {
          etkinlikId_uyeId: { etkinlikId: etkinlik.id, uyeId },
        },
        update: { katildi, notlar: durum },
        create: { etkinlikId: etkinlik.id, uyeId, katildi, notlar: durum },
      });
      yoklamaSayisi++;
    }
  }

  const gelecekTarih = new Date();
  gelecekTarih.setDate(gelecekTarih.getDate() + 14);

  await prisma.etkinlik.create({
    data: {
      ad: 'Demo: Gelecek Etkinlik (Test)',
      aciklama: 'Yaklaşan etkinlik örneği',
      tarih: gelecekTarih,
      konum: 'Mahalle Lokali',
      zorunlu: false,
      ilceYonetimKuruluEkle: false,
      komisyonlar: {
        create: [{ komisyonId: komisyonlar[0].id }],
      },
    },
  });

  console.log(`✅ Etkinlik oluşturuldu (id: ${etkinlik.id})`);
  console.log(`✅ ${yoklamaSayisi} yoklama kaydı eklendi`);
  console.log('✅ Gelecek etkinlik örneği eklendi\n');

  return etkinlik;
}

seedEtkinlikDemo()
  .catch((e) => {
    console.error('❌ Seed hatası:', e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
