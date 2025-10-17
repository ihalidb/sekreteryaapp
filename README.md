# Sekreterya App - Yönetim Sistemi

Modern bir sekreterya yönetim sistemi. Mahalleler, komisyonlar, üyeler ve etkinlik yönetimi için tam özellikli admin paneli.

## 🚀 Özellikler

- **Mahalle Yönetimi**: Mahalle ekleme, düzenleme, silme
- **Komisyon Yönetimi**: Mahallelere bağlı komisyon yönetimi
- **Üye Yönetimi**: 
  - Birden fazla komisyona üyelik
  - Her komisyonda farklı görev tanımlama
  - İlçe düzeyinde görev atama (İlçe Başkanı, Yönetim Kurulu, vb.)
- **İlçe Görevleri**: Dinamik görev listesi yönetimi
- **Etkinlik Yönetimi**: Etkinlik oluşturma ve yoklama sistemi
- **Yoklama Sistemi**: Etkinliklerde üye katılım takibi
- **Local Network Desteği**: Aynı ağdaki farklı bilgisayarlardan erişim

## 🛠️ Teknolojiler

- **Frontend**: Next.js 15, React 19
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL
- **ORM**: Prisma
- **State Management**: TanStack Query (React Query)
- **Styling**: TailwindCSS
- **Icons**: Lucide React

## 📦 Kurulum

### Gereksinimler
- Node.js 18+
- PostgreSQL 12+

### Adımlar

1. **Bağımlılıkları yükleyin:**
   ```bash
   npm install
   ```

2. **Çevre değişkenlerini yapılandırın:**
   `.env.example` dosyasını `.env` olarak kopyalayın ve değerleri düzenleyin:
   ```bash
   cp .env.example .env
   ```
   
   `.env` dosyasında kendi database bilgilerinizi girin:
   ```
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
   ```

3. **Prisma Client'ı oluşturun:**
   ```bash
   npx prisma generate
   ```

4. **Database'i oluşturun:**
   ```bash
   npx prisma db push
   ```

5. **Development server'ı başlatın:**
   ```bash
   npm run dev
   ```

6. **Tarayıcıda açın:**
   - Local: http://localhost:3000
   - Network: http://[YOUR_LOCAL_IP]:3000

## 🌐 Local Network'ten Erişim

Aynı local ağda bulunan diğer bilgisayarlardan erişim için:

1. **Firewall Ayarı**: Port 3000'i açmanız gerekebilir
2. **Server Yapılandırması**: Uygulama 0.0.0.0 adresinde dinliyor (tüm network interface'leri)
3. **Local IP Adresinizi Bulun**: 
   - Windows: `ipconfig` komutu ile
   - Linux/Mac: `ifconfig` veya `ip addr` komutu ile
4. **Erişim**: `http://[YOUR_LOCAL_IP]:3000` adresini kullanın

Diğer bilgisayarlardan bu adresi kullanarak uygulamaya erişebilirsiniz.

## 📱 Kullanım

### Ana Modüller

#### 1. Dashboard
- Sistem özeti ve istatistikler
- Hızlı erişim kartları

#### 2. Mahalleler
- Yeni mahalle ekleme
- Mahalle düzenleme ve silme
- Komisyon sayısı görüntüleme

#### 3. Komisyonlar
- Bağımsız komisyon oluşturma
- Komisyon düzenleme ve silme
- Üye sayısı takibi

#### 4. Üyeler
- Birden fazla komisyona üye ekleme
- Her komisyonda farklı görev tanımlama (Başkan, Üye, Sekreter, vb.)
- Birden fazla mahallede sorumluluk atama
- İlçe düzeyinde görev atama
- Üye bilgileri (Ad, Soyad, Telefon, Email, Adres)
- Üye düzenleme ve silme

#### 5. İlçe Görevleri
- Dinamik görev listesi
- Varsayılan görevler (İlçe Başkanı, Yönetim Kurulu, Yürütme, Meclis Üyesi, İdari İşler)
- Görev ekleme, düzenleme, silme
- Sıralama desteği

#### 6. Etkinlikler
- Etkinlik oluşturma (Ad, Tarih, Konum, Açıklama)
- Etkinlik düzenleme ve silme
- Yoklama sayfasına erişim
- Katılımcı sayısı görüntüleme

#### 7. Yoklama Sistemi
- Etkinliklere üye katılım takibi
- Toplu kayıt özelliği
- Üye bazlı notlar
- Katılım istatistikleri

## 🗄️ Database Yapısı

### Mahalleler (mahalleler)
- id, ad, aciklama, lokalYeri, mahalleBaskanId (FK, UNIQUE), createdBy, createdAt, updatedAt
- **İlişkiler:** Mahalle Başkanı (1:1 Üye), Sorumlu Üyeler (M:N via UyeMahalle)

### Komisyonlar (komisyonlar)
- id, ad, aciklama, createdBy, createdAt, updatedAt
- **İlişkiler:** Üyeler (M:N via UyeKomisyon)
- **Not:** Mahalle ilişkisi kaldırıldı (komisyonlar artık bağımsız)

### Üyeler (uyeler)
- id, ad, soyad, telefon, email, adres, ilceGorevId (FK), createdBy, createdAt, updatedAt
- **İlişkiler:** İlçe Görev (N:1), Komisyonlar (M:N), Sorumlu Mahalleler (M:N), Yoklamalar (1:N)

### Üye-Komisyon İlişkisi (uye_komisyon)
- id, uyeId (FK), komisyonId (FK), gorev, createdBy, createdAt, updatedAt
- **Constraint:** UNIQUE(uyeId, komisyonId)
- **Many-to-many:** Bir üye birden fazla komisyonda olabilir

### Üye-Mahalle İlişkisi (uye_mahalle)
- id, uyeId (FK), mahalleId (FK), createdBy, createdAt, updatedAt
- **Constraint:** UNIQUE(uyeId, mahalleId)
- **Many-to-many:** Bir üye birden fazla mahallede sorumlu olabilir

### İlçe Görevleri (ilce_gorevler)
- id, ad (UNIQUE), aciklama, sira, createdBy, createdAt, updatedAt
- **İlişkiler:** Üyeler (1:N)

### Etkinlikler (etkinlikler)
- id, ad, aciklama, tarih, konum, createdBy, createdAt, updatedAt
- **İlişkiler:** Yoklamalar (1:N)

### Yoklama (etkinlik_yoklama)
- id, etkinlikId (FK), uyeId (FK), katildi, notlar, createdBy, createdAt, updatedAt
- **Constraint:** UNIQUE(etkinlikId, uyeId)

## 🔒 Güvenlik

- Input validasyonu tüm API endpoint'lerinde mevcut
- Cascade delete ile ilişkili verilerin tutarlılığı sağlanıyor
- PostgreSQL ile güvenli veri saklama

## 📝 API Endpoints

### Mahalleler
- `GET /api/mahalleler` - Tüm mahalleleri listele
- `POST /api/mahalleler` - Yeni mahalle oluştur
- `GET /api/mahalleler/[id]` - Mahalle detayı
- `PUT /api/mahalleler/[id]` - Mahalle güncelle
- `DELETE /api/mahalleler/[id]` - Mahalle sil

### Komisyonlar
- `GET /api/komisyonlar` - Tüm komisyonları listele
- `POST /api/komisyonlar` - Yeni komisyon oluştur
- `GET /api/komisyonlar/[id]` - Komisyon detayı
- `PUT /api/komisyonlar/[id]` - Komisyon güncelle
- `DELETE /api/komisyonlar/[id]` - Komisyon sil

### Üyeler
- `GET /api/uyeler` - Tüm üyeleri listele (komisyonlar ve ilçe görevi ile birlikte)
- `POST /api/uyeler` - Yeni üye oluştur (birden fazla komisyon ataması ile)
- `GET /api/uyeler/[id]` - Üye detayı
- `PUT /api/uyeler/[id]` - Üye güncelle (komisyon atamaları ile)
- `DELETE /api/uyeler/[id]` - Üye sil

### İlçe Görevleri
- `GET /api/ilce-gorevler` - Tüm görevleri listele
- `POST /api/ilce-gorevler` - Yeni görev oluştur
- `GET /api/ilce-gorevler/[id]` - Görev detayı
- `PUT /api/ilce-gorevler/[id]` - Görev güncelle
- `DELETE /api/ilce-gorevler/[id]` - Görev sil
- `POST /api/seed-gorevler` - Varsayılan görevleri oluştur

### Etkinlikler
- `GET /api/etkinlikler` - Tüm etkinlikleri listele
- `POST /api/etkinlikler` - Yeni etkinlik oluştur
- `GET /api/etkinlikler/[id]` - Etkinlik detayı
- `PUT /api/etkinlikler/[id]` - Etkinlik güncelle
- `DELETE /api/etkinlikler/[id]` - Etkinlik sil

### Yoklama
- `GET /api/etkinlikler/[id]/yoklama` - Etkinlik yoklamalarını getir
- `POST /api/etkinlikler/[id]/yoklama` - Yoklama kaydet/güncelle

## 🎨 UI/UX Özellikleri

- **Responsive Design**: Tüm cihazlarda uyumlu
- **TailwindCSS**: Modern ve özelleştirilebilir arayüz
- **Dark/Light Theme**: Otomatik tema desteği
- **Modal Forms**: Hızlı veri girişi
- **Real-time Validation**: Anlık form doğrulama
- **Success/Error Notifications**: Kullanıcı geri bildirimleri
- **Loading States**: İşlem durumu göstergeleri ve skeleton screens
- **Badge System**: Görsel veri gösterimi
- **Icon Library**: Lucide React ile modern ikonlar

## 🔧 Geliştirme

```bash
# Development mode
npm run dev

# Production build
npm run build

# Production start
npm start

# Database migration
npx prisma db push

# Prisma Studio (Database GUI)
npx prisma studio
```

## 📄 Lisans

Bu proje özel kullanım içindir.

## 👨‍💻 Geliştirici Notları

- Login/Authenticate sistemi henüz eklenmedi (geliştirme kolaylığı için)
- Tüm API endpoint'leri client-side ve server-side validation ile korunuyor
- Cascade delete aktif, ilişkili veriler otomatik siliniyor
- TanStack Query (React Query) ile efficient data fetching ve caching
- Next.js 15'in App Router yapısı kullanılıyor
- Prisma ORM ile type-safe database işlemleri

---

**Versiyon**: 1.0.0  
**Son Güncelleme**: Ekim 2025
