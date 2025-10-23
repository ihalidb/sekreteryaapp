# 🌐 Sekreterya App - Erişim Rehberi

## ✨ HTTPS ile Güvenli Erişim (ÖNERİLEN)

### 🔒 Güvenli Erişim (HTTPS):
```
https://sekreterya.local
```

### Neden HTTPS?
- 🔒 Şifreli bağlantı (SSL/TLS)
- ✅ Güvenli cookie yönetimi
- ✅ Modern browser uyumluluğu
- ✅ IP adresi değişse bile çalışır
- ✅ Kolay hatırlanır
- ✅ Profesyonel görünüm

### ⚠️ İlk Erişimde Sertifika Uyarısı:
Self-signed sertifika kullanıldığı için tarayıcı uyarı verecek:
- **"Gelişmiş"** veya **"Advanced"** tıklayın
- **"Devam Et"** veya **"Proceed"** seçin
- Bu normal ve güvenlidir (lokal ağ)

---

## 📱 Erişim Adresleri

### 🔒 Ana Uygulama (HTTPS - ÖNERİLEN):
- **Hostname:** https://sekreterya.local
- **IP Adresi:** https://192.168.1.133
- **Login Sayfası:** https://sekreterya.local/login
- **Admin Panel:** https://sekreterya.local/admin

### 🔒 Prisma Studio (HTTPS):
- **Hostname:** https://sekreterya.local:5556
- **IP Adresi:** https://192.168.1.133:5556

### ⚡ HTTP Erişimi:
- **Not:** HTTP erişimi otomatik olarak HTTPS'e yönlendirilir
- http://sekreterya.local → https://sekreterya.local

---

## 🔐 Giriş Bilgileri

### Admin Kullanıcıları:
| Kullanıcı Adı | Şifre |
|--------------|-------|
| admin | admin123 |
| admin2 | admin123 |

---

## ⚠️ Önemli Notlar

### Windows'ta ".local" Sorunları:
Eğer `sekreterya.local` çalışmazsa:

1. **Bonjour kurulu mu kontrol edin:**
   - iTunes yüklüyse Bonjour zaten vardır
   - Yoksa: https://support.apple.com/kb/DL999?locale=en_US

2. **Alternatif: IP Adresi kullanın:**
   ```
   http://192.168.1.133:3000
   ```

3. **hosts dosyasına manuel ekleyin:**
   - `C:\Windows\System32\drivers\etc\hosts` dosyasını Notepad (Yönetici) ile açın
   - Ekleyin: `192.168.1.133  sekreterya.local`
   - Kaydedin

---

## 🔄 IP Adresi Değişirse Ne Olur?

### Hostname Kullanıyorsanız:
✅ **Hiçbir şey yapmanız gerekmez!**
- `sekreterya.local` otomatik olarak yeni IP'yi bulur

### IP Adresi Kullanıyorsanız:
❌ **Yeni IP'yi öğrenip değiştirmeniz gerekir**

**Yeni IP'yi öğrenmek için:**
1. Raspberry Pi'ye SSH ile bağlanın
2. Komutu çalıştırın: `hostname -I`
3. Yeni IP'yi kullanın

---

## 🧪 Test Etme

### 1. Windows Bilgisayarınızdan:
```
ping sekreterya.local
```

**Başarılı çıktı:**
```
Reply from 192.168.1.133: bytes=32 time<1ms TTL=64
```

### 2. Tarayıcıdan:
```
http://sekreterya.local:3000
```

**Görecekleriniz:**
- Login sayfası veya
- Admin paneli (eğer daha önce giriş yaptıysanız)

---

## 📊 Sistem Bilgileri

- **Hostname:** sekreterya
- **mDNS Adresi:** sekreterya.local
- **Mevcut IP:** 192.168.1.133
- **Port 3000:** Sekreterya App (Production)
- **Port 5555:** Prisma Studio (Database UI)
- **Port 5432:** PostgreSQL (Sadece localhost)

---

## 🔧 Sorun Giderme

### "sekreterya.local" bulunamıyor hatası:

**Windows'ta:**
1. Bonjour kurulu mu? → iTunes yükle veya Bonjour indir
2. Firewall blokluyor mu? → 5353/UDP portunu aç
3. Aynı ağda mısınız? → WiFi/Ethernet kontrolü

**Hızlı Çözüm:**
```
http://192.168.1.133:3000
```

### Raspberry Pi'ye Bağlanamıyorum:

1. **Raspberry Pi açık mı?**
   ```bash
   ping sekreterya.local
   ```

2. **Servisler çalışıyor mu?**
   ```bash
   ssh ihb@sekreterya.local
   sudo systemctl status sekreteryaapp
   ```

3. **Aynı ağda mısınız?**
   - İki cihaz da aynı WiFi/ağa bağlı olmalı

---

## 🚀 Hızlı Başlangıç

1. **Tarayıcıyı açın**
2. **Adres çubuğuna yazın:** `sekreterya.local:3000`
3. **Enter'a basın**
4. **Giriş yapın:** admin / admin123
5. **Admin panelini kullanın!**

---

**Son Güncelleme:** Ekim 2025  
**Raspberry Pi Hostname:** sekreterya  
**mDNS:** Aktif ✅

