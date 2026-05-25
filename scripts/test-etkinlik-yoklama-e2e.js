/**
 * Etkinlik + yoklama API uçtan uca doğrulama.
 * Çalıştırma: npm run test:e2e  (önce npm run seed:etkinlik önerilir)
 */
const BASE = process.env.TEST_BASE_URL || 'http://127.0.0.1:3000';

const assert = (cond, msg) => {
  if (!cond) throw new Error(msg);
};

async function fetchJson(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  return { res, data };
}

async function run() {
  console.log('🧪 Etkinlik + yoklama E2E testi\n');
  console.log(`   Base URL: ${BASE}\n`);

  const { res: listRes, data: etkinlikler } = await fetchJson('/api/etkinlikler');
  assert(listRes.ok, `GET /api/etkinlikler → ${listRes.status}`);
  assert(Array.isArray(etkinlikler), 'Etkinlik listesi dizi olmalı');
  console.log(`✅ Etkinlik listesi (${etkinlikler.length} kayıt)`);

  const demo = etkinlikler.find((e) => e.ad?.includes('Demo: İlçe Toplantısı'));
  assert(demo, 'Demo etkinlik bulunamadı — önce: npm run seed:etkinlik');
  console.log(`✅ Demo etkinlik bulundu (id: ${demo.id})`);

  const { res: yokRes, data: yokData } = await fetchJson(`/api/etkinlikler/${demo.id}/yoklama`);
  assert(yokRes.ok, `GET yoklama → ${yokRes.status}`);
  assert(yokData.uyeler?.length > 0, 'Yoklama listesinde üye olmalı');
  assert(yokData.stats?.toplam > 0, 'İstatistik toplam > 0 olmalı');
  console.log(`✅ Yoklama listesi (${yokData.uyeler.length} üye, katılım %${yokData.stats.katilimOrani})`);

  const hedefUye = yokData.uyeler[0];
  const { res: postRes, data: postData } = await fetchJson(`/api/etkinlikler/${demo.id}/yoklama`, {
    method: 'POST',
    body: JSON.stringify({ uyeId: hedefUye.id, durum: 'Geldi' }),
  });
  assert(postRes.ok, `POST yoklama → ${postRes.status}`);
  assert(postData.uyeId === hedefUye.id || postData.uye?.id === hedefUye.id, 'Yoklama kaydı dönmeli');
  console.log('✅ Tekil yoklama güncellendi');

  const { res: list2, data: yok2 } = await fetchJson(`/api/etkinlikler/${demo.id}/yoklama`);
  const kayit = yok2.uyeler.find((u) => u.id === hedefUye.id);
  const durum = kayit?.yoklama?.durum || kayit?.yoklama?.notlar;
  assert(durum === 'Geldi', 'Güncellenmiş durum okunmalı');
  console.log('✅ Yoklama kalıcılığı doğrulandı');

  console.log('\n✅ Tüm E2E kontrolleri geçti.\n');
}

run().catch((e) => {
  console.error('\n❌ Test başarısız:', e.message);
  process.exit(1);
});
