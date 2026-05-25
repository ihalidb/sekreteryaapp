# Sekreterya App - Yönetim Sistemi

AK Parti ilçe teşkilatı için mahalle, komisyon, yönetim kurulu, mahalle başkanları ve etkinlik/yoklama yönetim paneli.

## Özellikler

- **Kimlik doğrulama**: Oturum tabanlı giriş (`iron-session`), admin kullanıcıları
- **Dashboard**: Özet istatistikler, katılım oranları
- **İlçe Teşkilatı**
  - Yönetim Kurulu üye yönetimi
  - Mahalle Başkanları havuzu (kişi kayıtları)
- **Ayarlar**
  - Mahalleler (başkan ataması havuzdan seçim)
  - Komisyonlar
  - İlçe görevleri
  - Excel veri yükleme
- **Etkinlikler & yoklama**: Komisyon bazlı katılımcı listesi, toplu/tekil yoklama
- **Ağ erişimi**: `0.0.0.0` üzerinden yerel ağ; nginx ile HTTPS (Raspberry Pi)

## Teknolojiler

- Next.js 15 (App Router), React 19
- PostgreSQL + Prisma 6
- TanStack Query, TailwindCSS, Lucide React

## Kurulum

### Gereksinimler

- Node.js 18+
- PostgreSQL 12+

### Adımlar

```bash
npm install
cp .env.example .env   # DATABASE_URL ve oturum ayarlarını düzenleyin
npx prisma generate
npx prisma db push
npm run dev
```

- Yerel: http://localhost:3000
- Ağ: http://[YEREL_IP]:3000 veya https://sekreterya.local (nginx kuruluysa)

Detaylı erişim: [ERISIM.md](./ERISIM.md)

## Menü yapısı

| Bölüm | Sayfa |
|--------|--------|
| Dashboard | `/admin` |
| İlçe Teşkilatı → Yönetim Kurulu | `/admin/yonetim-kurulu` |
| İlçe Teşkilatı → Mahalle Başkanları | `/admin/mahalle-baskanlari` |
| Etkinlikler | `/admin/etkinlikler` |
| Ayarlar → Mahalleler | `/admin/mahalleler` |
| Ayarlar → Komisyonlar | `/admin/komisyonlar` |
| Ayarlar → İlçe Görevleri | `/admin/ilce-gorevler` |
| Ayarlar → Veri Yükleme | `/admin/veri-yukleme` |

Eski `/admin/uyeler` adresi otomatik olarak yönetim kuruluna yönlendirilir.

### Mahalle başkanı iş akışı

1. **İlçe Teşkilatı → Mahalle Başkanları**: Kişi havuzuna ad/soyad ve iletişim ekleyin.
2. **Ayarlar → Mahalleler**: Mahalle düzenlerken listeden başkan seçin (manuel bilgi girişi gerekmez).

## Geliştirme komutları

```bash
npm run dev          # Geliştirme (Turbopack, 0.0.0.0:3000)
npm run dev:http     # TLS uyarısı olmadan dev
./start-http.sh      # Port 3000 temizleyip dev:http başlatır
npm run build
npm run start
npm run lint
npx prisma studio

# Örnek etkinlik + yoklama verisi
npm run seed:etkinlik

# API uçtan uca test (sunucu çalışıyor olmalı)
npm run test:e2e
```

## Production (systemd + nginx)

```bash
npm run build
sudo systemctl restart sekreteryaapp
sudo systemctl status sekreteryaapp nginx prisma-studio
```

Yardımcı: `./service-commands.sh`

## API özeti

| Modül | Endpoint |
|--------|-----------|
| Auth | `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me` |
| Mahalleler | `GET/POST /api/mahalleler`, `GET/PUT/DELETE /api/mahalleler/[id]` |
| Mahalle başkanları | `GET/POST /api/mahalle-baskanlari`, `GET/PUT/DELETE /api/mahalle-baskanlari/[id]` |
| Komisyonlar | `GET/POST /api/komisyonlar`, `.../[id]`, `.../[id]/uyeler` |
| Yönetim kurulu | `GET/POST /api/yonetim-kurulu`, `GET/PUT/DELETE /api/yonetim-kurulu/[id]` |
| İlçe görevleri | `GET/POST /api/ilce-gorevler`, `.../[id]` |
| Etkinlikler | `GET/POST /api/etkinlikler`, `.../[id]` |
| Yoklama | `GET/POST /api/etkinlikler/[id]/yoklama` |
| Excel | `GET /api/excel/templates`, `POST /api/excel/upload` |

Mahalle güncellemede başkan ataması: `PUT /api/mahalleler/[id]` gövdesinde `mahalleBaskanAssign: { baskanId }` veya `{ remove: true }`.

## Veri modeli (özet)

- `mahalleler` — mahalle bilgisi; başkan `mahalle_baskanlari` üzerinden (opsiyonel `mahalleId`)
- `mahalle_baskanlari` — teşkilat havuzu + mahalle ataması
- `yonetim_kurulu_uyeleri` — ilçe yönetim kurulu
- `komisyonlar` / `uye_komisyon` — komisyon üyelikleri (`uyeler` tablosu)
- `etkinlikler` / `etkinlik_yoklama` — etkinlik ve katılım

## Güvenlik

- Middleware ile `/admin` rotalarında oturum kontrolü
- API giriş doğrulaması (kritik mutasyonlar)
- Üretimde HTTPS (nginx) önerilir

## Lisans

Özel kullanım.

---

**Versiyon:** 0.1.0  
**Son güncelleme:** Mayıs 2026
