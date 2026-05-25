# Sekreterya App — Erişim Rehberi

## HTTPS (önerilen)

```
https://sekreterya.local
```

İlk erişimde self-signed sertifika uyarısı normaldir: **Gelişmiş → Devam**.

| Sayfa | Adres |
|--------|--------|
| Giriş | https://sekreterya.local/login |
| Admin | https://sekreterya.local/admin |
| Prisma Studio | https://sekreterya.local:5556 |

HTTP (`http://sekreterya.local`) nginx üzerinden HTTPS’e yönlendirilir.

### IP ile erişim

- Uygulama: https://192.168.1.133
- Doğrudan Next.js (geliştirme): http://192.168.1.133:3000

---

## Giriş bilgileri

| Kullanıcı | Şifre |
|-----------|--------|
| admin | admin123 |
| admin2 | admin123 |

---

## Admin menüsü

1. **Dashboard** — özet
2. **İlçe Teşkilatı**
   - Yönetim Kurulu
   - Mahalle Başkanları (kişi havuzu)
3. **Etkinlikler** — etkinlik ve yoklama
4. **Ayarlar**
   - Mahalleler (başkan ataması havuzdan)
   - Komisyonlar
   - İlçe Görevleri
   - Veri Yükleme

`/admin/uyeler` eski bağlantıdır; otomatik **Yönetim Kurulu** sayfasına gider.

---

## Mahalle başkanı

| Adım | Nerede |
|------|--------|
| Kişi ekle/düzenle | İlçe Teşkilatı → Mahalle Başkanları |
| Mahalleye ata | Ayarlar → Mahalleler → mahalle düzenle → listeden seç |

---

## Servisler (Raspberry Pi)

```bash
sudo systemctl status sekreteryaapp nginx prisma-studio
sudo systemctl restart sekreteryaapp
```

| Servis | Port | Açıklama |
|--------|------|----------|
| sekreteryaapp | 3000 | Next.js production |
| nginx | 443, 80 | HTTPS reverse proxy |
| prisma-studio | 5555 (HTTPS 5556) | Veritabanı arayüzü |
| PostgreSQL | 5432 | Sadece localhost |

Geliştirme:

```bash
cd /home/ihb/Desktop/projeler/sekreteryaapp
./start-http.sh          # veya: npm run dev:http
```

---

## Örnek veri ve test

```bash
npm run seed:etkinlik    # Demo etkinlik + yoklama
npm run test:e2e         # API doğrulama (sunucu açık olmalı)
```

---

## Sorun giderme

### sekreterya.local açılmıyor

- Aynı WiFi/ağda olun
- Windows: Bonjour veya `hosts` dosyasına `192.168.1.133 sekreterya.local`
- Geçici: https://192.168.1.133

### Uygulama yanıt vermiyor

```bash
ping sekreterya.local
ssh ihb@sekreterya.local
sudo systemctl restart sekreteryaapp nginx
curl -sk -o /dev/null -w "%{http_code}\n" https://127.0.0.1/login
```

### Yeni IP

- `sekreterya.local` (mDNS) genelde otomatik güncellenir
- Sabit IP kullanıyorsanız: `hostname -I` ile yeni adresi alın

---

**Hostname:** sekreterya  
**mDNS:** sekreterya.local  
**Son güncelleme:** Mayıs 2026
