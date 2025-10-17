# 🗄️ Sekreterya App - Database Şeması

## 📊 Güncel Database Mimarisi

### Önemli Değişiklikler (v2.0)
- ✅ **Komisyonlardan mahalle ilişkisi kaldırıldı** - Komisyonlar artık bağımsız
- ✅ **Tüm tablolara `createdBy` alanı eklendi** - Audit trail için
- ✅ **Üye-Mahalle ilişkisi eklendi** - Üyeler birden fazla mahallede sorumlu olabilir
- ✅ **Mahalle lokal yeri ve başkan ataması** - Mahalle yönetimi güçlendirildi

---

## 📋 Tablo Detayları

### 1. MAHALLELER (`mahalleler`)

```sql
CREATE TABLE mahalleler (
  id              SERIAL PRIMARY KEY,
  ad              VARCHAR NOT NULL,
  aciklama        TEXT,
  lokalYeri       VARCHAR,
  mahalleBaskanId INTEGER UNIQUE REFERENCES uyeler(id) ON DELETE SET NULL,
  createdBy       INTEGER,
  createdAt       TIMESTAMP DEFAULT NOW(),
  updatedAt       TIMESTAMP DEFAULT NOW()
);
```

**Açıklama:** Mahalle bilgileri ve lokal yeri yönetimi

**Kolonlar:**
- `id`: Benzersiz mahalle ID'si
- `ad`: Mahalle adı (zorunlu)
- `aciklama`: Mahalle hakkında açıklama
- `lokalYeri`: Mahalle lokal fiziksel adresi
- `mahalleBaskanId`: Mahalle başkanı üye ID'si (UNIQUE - bir üye sadece bir mahallenin başkanı)
- `createdBy`: Kaydı oluşturan kullanıcı ID'si
- `createdAt`, `updatedAt`: Timestamp alanları

**İlişkiler:**
- `1:1` → Üye (Mahalle Başkanı)
- `M:N` → Üyeler (Sorumlu Üyeler, via `uye_mahalle`)

---

### 2. KOMISYONLAR (`komisyonlar`)

```sql
CREATE TABLE komisyonlar (
  id         SERIAL PRIMARY KEY,
  ad         VARCHAR NOT NULL,
  aciklama   TEXT,
  createdBy  INTEGER,
  createdAt  TIMESTAMP DEFAULT NOW(),
  updatedAt  TIMESTAMP DEFAULT NOW()
);
```

**Açıklama:** Bağımsız komisyon yönetimi

**Kolonlar:**
- `id`: Benzersiz komisyon ID'si
- `ad`: Komisyon adı (zorunlu)
- `aciklama`: Komisyon açıklaması
- `createdBy`: Kaydı oluşturan kullanıcı ID'si
- `createdAt`, `updatedAt`: Timestamp alanları

**İlişkiler:**
- `M:N` → Üyeler (via `uye_komisyon`)

**Not:** Mahalle ilişkisi kaldırıldı. Komisyonlar artık mahalleden bağımsız.

---

### 3. İLÇE GÖREVLERİ (`ilce_gorevler`)

```sql
CREATE TABLE ilce_gorevler (
  id         SERIAL PRIMARY KEY,
  ad         VARCHAR NOT NULL UNIQUE,
  aciklama   TEXT,
  sira       INTEGER DEFAULT 0,
  createdBy  INTEGER,
  createdAt  TIMESTAMP DEFAULT NOW(),
  updatedAt  TIMESTAMP DEFAULT NOW()
);
```

**Açıklama:** İlçe düzeyinde görev tanımları

**Kolonlar:**
- `id`: Benzersiz görev ID'si
- `ad`: Görev adı (UNIQUE - her görev bir kez tanımlanır)
- `aciklama`: Görev açıklaması
- `sira`: Görevlerin sıralanması için
- `createdBy`: Kaydı oluşturan kullanıcı ID'si
- `createdAt`, `updatedAt`: Timestamp alanları

**Varsayılan Görevler:**
1. İlçe Başkanı
2. Yönetim Kurulu
3. Yürütme Kurulu
4. Meclis Üyesi
5. İlçe İdari İşler

**İlişkiler:**
- `1:N` → Üyeler

---

### 4. ÜYELER (`uyeler`)

```sql
CREATE TABLE uyeler (
  id          SERIAL PRIMARY KEY,
  ad          VARCHAR NOT NULL,
  soyad       VARCHAR NOT NULL,
  telefon     VARCHAR,
  email       VARCHAR,
  adres       TEXT,
  ilceGorevId INTEGER REFERENCES ilce_gorevler(id) ON DELETE SET NULL,
  createdBy   INTEGER,
  createdAt   TIMESTAMP DEFAULT NOW(),
  updatedAt   TIMESTAMP DEFAULT NOW()
);
```

**Açıklama:** Üye bilgileri ve kişisel detaylar

**Kolonlar:**
- `id`: Benzersiz üye ID'si
- `ad`: Üye adı (zorunlu)
- `soyad`: Üye soyadı (zorunlu)
- `telefon`: Telefon numarası
- `email`: E-posta adresi
- `adres`: Posta adresi
- `ilceGorevId`: İlçe görevi referansı (opsiyonel)
- `createdBy`: Kaydı oluşturan kullanıcı ID'si
- `createdAt`, `updatedAt`: Timestamp alanları

**İlişkiler:**
- `N:1` → İlçe Görev
- `M:N` → Komisyonlar (via `uye_komisyon`)
- `M:N` → Mahalleler (via `uye_mahalle`)
- `1:N` → Yoklamalar
- `1:1` ← Mahalle (Mahalle Başkanlığı)

---

### 5. ÜYE-KOMİSYON İLİŞKİSİ (`uye_komisyon`)

```sql
CREATE TABLE uye_komisyon (
  id          SERIAL PRIMARY KEY,
  uyeId       INTEGER NOT NULL REFERENCES uyeler(id) ON DELETE CASCADE,
  komisyonId  INTEGER NOT NULL REFERENCES komisyonlar(id) ON DELETE CASCADE,
  gorev       VARCHAR,
  createdBy   INTEGER,
  createdAt   TIMESTAMP DEFAULT NOW(),
  updatedAt   TIMESTAMP DEFAULT NOW(),
  UNIQUE(uyeId, komisyonId)
);
```

**Açıklama:** Üyeler ile komisyonlar arası many-to-many junction table

**Kolonlar:**
- `id`: Benzersiz kayıt ID'si
- `uyeId`: Üye referansı
- `komisyonId`: Komisyon referansı
- `gorev`: Komisyondaki görevi (örn: "Başkan", "Sekreter", "Üye")
- `createdBy`: Kaydı oluşturan kullanıcı ID'si
- `createdAt`, `updatedAt`: Timestamp alanları

**Constraints:**
- `UNIQUE(uyeId, komisyonId)`: Bir üye aynı komisyonda bir kez olabilir

**Cascade Delete:** Üye veya komisyon silinirse bu kayıtlar da silinir

---

### 6. ÜYE-MAHALLE İLİŞKİSİ (`uye_mahalle`)

```sql
CREATE TABLE uye_mahalle (
  id         SERIAL PRIMARY KEY,
  uyeId      INTEGER NOT NULL REFERENCES uyeler(id) ON DELETE CASCADE,
  mahalleId  INTEGER NOT NULL REFERENCES mahalleler(id) ON DELETE CASCADE,
  createdBy  INTEGER,
  createdAt  TIMESTAMP DEFAULT NOW(),
  updatedAt  TIMESTAMP DEFAULT NOW(),
  UNIQUE(uyeId, mahalleId)
);
```

**Açıklama:** Üyeler ile mahalleler arası many-to-many junction table (sorumluluk ilişkisi)

**Kolonlar:**
- `id`: Benzersiz kayıt ID'si
- `uyeId`: Üye referansı
- `mahalleId`: Mahalle referansı
- `createdBy`: Kaydı oluşturan kullanıcı ID'si
- `createdAt`, `updatedAt`: Timestamp alanları

**Constraints:**
- `UNIQUE(uyeId, mahalleId)`: Bir üye bir mahallede bir kez sorumlu olabilir

**Cascade Delete:** Üye veya mahalle silinirse bu kayıtlar da silinir

**Kullanım:** Üyelerin sorumlu oldukları mahalleler

---

### 7. ETKİNLİKLER (`etkinlikler`)

```sql
CREATE TABLE etkinlikler (
  id         SERIAL PRIMARY KEY,
  ad         VARCHAR NOT NULL,
  aciklama   TEXT,
  tarih      TIMESTAMP NOT NULL,
  konum      VARCHAR,
  createdBy  INTEGER,
  createdAt  TIMESTAMP DEFAULT NOW(),
  updatedAt  TIMESTAMP DEFAULT NOW()
);
```

**Açıklama:** Düzenlenen etkinlik bilgileri

**Kolonlar:**
- `id`: Benzersiz etkinlik ID'si
- `ad`: Etkinlik adı (zorunlu)
- `aciklama`: Etkinlik açıklaması
- `tarih`: Etkinlik tarihi ve saati (zorunlu)
- `konum`: Etkinlik konumu
- `createdBy`: Kaydı oluşturan kullanıcı ID'si
- `createdAt`, `updatedAt`: Timestamp alanları

**İlişkiler:**
- `1:N` → Yoklamalar

---

### 8. ETKİNLİK YOKLAMA (`etkinlik_yoklama`)

```sql
CREATE TABLE etkinlik_yoklama (
  id          SERIAL PRIMARY KEY,
  etkinlikId  INTEGER NOT NULL REFERENCES etkinlikler(id) ON DELETE CASCADE,
  uyeId       INTEGER NOT NULL REFERENCES uyeler(id) ON DELETE CASCADE,
  katildi     BOOLEAN DEFAULT FALSE,
  notlar      TEXT,
  createdBy   INTEGER,
  createdAt   TIMESTAMP DEFAULT NOW(),
  updatedAt   TIMESTAMP DEFAULT NOW(),
  UNIQUE(etkinlikId, uyeId)
);
```

**Açıklama:** Etkinliklerde üye katılım takibi junction table

**Kolonlar:**
- `id`: Benzersiz yoklama kayıt ID'si
- `etkinlikId`: Etkinlik referansı
- `uyeId`: Üye referansı
- `katildi`: Katılım durumu (true/false)
- `notlar`: Yoklama notları
- `createdBy`: Kaydı oluşturan kullanıcı ID'si
- `createdAt`, `updatedAt`: Timestamp alanları

**Constraints:**
- `UNIQUE(etkinlikId, uyeId)`: Bir üye bir etkinlikte bir kez yoklama alınır

**Cascade Delete:** Etkinlik veya üye silinirse yoklamalar da silinir

---

## 🔗 İlişki Matrisi

| Tablo | One-to-One | One-to-Many | Many-to-Many |
|-------|------------|-------------|--------------|
| **Mahalleler** | Mahalle Başkanı (Üye) | - | Sorumlu Üyeler (via uye_mahalle) |
| **Komisyonlar** | - | - | Üyeler (via uye_komisyon) |
| **İlçe Görevleri** | - | Üyeler | - |
| **Üyeler** | Mahalle Başkanlığı | Yoklamalar | Komisyonlar, Mahalleler |
| **Etkinlikler** | - | Yoklamalar | - |

---

## 🔐 Veri Bütünlüğü Kuralları

### CASCADE DELETE (Sil)
- Mahalle silinirse → Üye-Mahalle ilişkileri silinir
- Komisyon silinirse → Üye-Komisyon ilişkileri silinir
- Üye silinirse → Tüm komisyon, mahalle ve yoklama ilişkileri silinir
- Etkinlik silinirse → Tüm yoklamalar silinir

### SET NULL (Boşalt)
- İlçe görevi silinirse → Üyenin `ilceGorevId` NULL olur
- Mahalle başkanı silinirse → Mahalle başkansız kalır (`mahalleBaskanId` NULL)

### UNIQUE CONSTRAINTS
- İlçe görev adı benzersiz
- Mahalle başkanı benzersiz (bir üye sadece bir mahallenin başkanı)
- Üye-Komisyon çifti benzersiz (bir üye aynı komisyonda bir kez)
- Üye-Mahalle çifti benzersiz (bir üye bir mahallede bir kez sorumlu)
- Etkinlik-Üye çifti benzersiz (bir üye bir etkinlikte bir kez yoklama)

---

## 🎯 Kullanım Senaryoları

### Senaryo 1: Tam Yetkili Üye
**Mehmet Yılmaz:**
- **İlçe Görevi:** Yönetim Kurulu
- **Mahalle Başkanlığı:** Merkez Mahalle (başkan)
- **Sorumlu Mahalleler:** Merkez Mahalle, Yeni Mahalle, Cumhuriyet Mahalle
- **Komisyonlar:**
  - Eğitim Komisyonu (Başkan)
  - Kültür Komisyonu (Üye)
  - Gençlik Komisyonu (Koordinatör)

### Senaryo 2: Komisyon Üyesi
**Ayşe Demir:**
- **İlçe Görevi:** Yok
- **Mahalle Başkanlığı:** Yok
- **Sorumlu Mahalleler:** Yeni Mahalle
- **Komisyonlar:**
  - Kadın Komisyonu (Başkan)
  - Sosyal Yardım Komisyonu (Üye)

### Senaryo 3: Sadece İlçe Görevi
**Ali Kaya:**
- **İlçe Görevi:** İlçe Başkanı
- **Mahalle Başkanlığı:** Yok
- **Sorumlu Mahalleler:** Tüm mahalleler (çoklu seçim)
- **Komisyonlar:** Yok

---

## 📈 İndeks Önerileri

```sql
-- Performans için önerilen indeksler

-- Mahalleler
CREATE INDEX idx_mahalleler_mahalleBaskanId ON mahalleler(mahalleBaskanId);

-- Üyeler
CREATE INDEX idx_uyeler_ilceGorevId ON uyeler(ilceGorevId);
CREATE INDEX idx_uyeler_ad_soyad ON uyeler(ad, soyad);

-- Üye-Komisyon
CREATE INDEX idx_uye_komisyon_uyeId ON uye_komisyon(uyeId);
CREATE INDEX idx_uye_komisyon_komisyonId ON uye_komisyon(komisyonId);

-- Üye-Mahalle
CREATE INDEX idx_uye_mahalle_uyeId ON uye_mahalle(uyeId);
CREATE INDEX idx_uye_mahalle_mahalleId ON uye_mahalle(mahalleId);

-- Etkinlik Yoklama
CREATE INDEX idx_etkinlik_yoklama_etkinlikId ON etkinlik_yoklama(etkinlikId);
CREATE INDEX idx_etkinlik_yoklama_uyeId ON etkinlik_yoklama(uyeId);
CREATE INDEX idx_etkinlik_yoklama_katildi ON etkinlik_yoklama(katildi);

-- Etkinlikler
CREATE INDEX idx_etkinlikler_tarih ON etkinlikler(tarih DESC);
```

---

## 🔄 Migration Notları

### v1.0 → v2.0 Değişiklikleri

**Kaldırılan:**
- `komisyonlar.mahalleId` (FK)
- `komisyonlar.mahalle` (relation)

**Eklenen:**
- `mahalleler.lokalYeri`
- `mahalleler.mahalleBaskanId` (FK, UNIQUE)
- `mahalleler.createdBy`
- `komisyonlar.createdBy`
- `ilce_gorevler.createdBy`
- `uyeler.createdBy`
- `uye_komisyon.createdBy`
- `uye_mahalle` (yeni tablo)
- `etkinlikler.createdBy`
- `etkinlik_yoklama.createdBy`

**Veri Kaybı:** 
- ⚠️ Mevcut komisyon-mahalle ilişkileri kayboldu
- ✅ Junction table üzerinden yeniden kurgulandı

---

## 📊 İstatistik Sorguları

### Mahalle Başına Sorumlu Üye Sayısı
```sql
SELECT m.ad as mahalle, COUNT(um.id) as sorumlu_uye_sayisi
FROM mahalleler m
LEFT JOIN uye_mahalle um ON m.id = um.mahalleId
GROUP BY m.id, m.ad
ORDER BY sorumlu_uye_sayisi DESC;
```

### Komisyon Başına Üye Sayısı
```sql
SELECT k.ad as komisyon, COUNT(uk.id) as uye_sayisi
FROM komisyonlar k
LEFT JOIN uye_komisyon uk ON k.id = uk.komisyonId
GROUP BY k.id, k.ad
ORDER BY uye_sayisi DESC;
```

### En Aktif Üyeler (Çoklu Komisyon ve Mahalle)
```sql
SELECT 
  u.ad, 
  u.soyad,
  COUNT(DISTINCT uk.komisyonId) as komisyon_sayisi,
  COUNT(DISTINCT um.mahalleId) as mahalle_sayisi,
  ig.ad as ilce_gorevi
FROM uyeler u
LEFT JOIN uye_komisyon uk ON u.id = uk.uyeId
LEFT JOIN uye_mahalle um ON u.id = um.uyeId
LEFT JOIN ilce_gorevler ig ON u.ilceGorevId = ig.id
GROUP BY u.id, u.ad, u.soyad, ig.ad
ORDER BY komisyon_sayisi DESC, mahalle_sayisi DESC;
```

### Etkinlik Katılım Oranı
```sql
SELECT 
  e.ad as etkinlik,
  COUNT(ey.id) as toplam_yoklama,
  SUM(CASE WHEN ey.katildi = true THEN 1 ELSE 0 END) as katilan,
  ROUND(
    100.0 * SUM(CASE WHEN ey.katildi = true THEN 1 ELSE 0 END) / 
    NULLIF(COUNT(ey.id), 0), 
    2
  ) as katilim_orani
FROM etkinlikler e
LEFT JOIN etkinlik_yoklama ey ON e.id = ey.etkinlikId
GROUP BY e.id, e.ad
ORDER BY e.tarih DESC;
```

---

## 🎨 ER Diagram (ASCII)

```
                    ┌──────────────┐
                    │ IlceGorevler │
                    └──────┬───────┘
                           │ 1:N
                           ▼
    ┌──────────┐      ┌────────┐      ┌────────────┐
    │ Mahalle  │◄─────│  Üye   │─────►│ Komisyon   │
    │          │ M:N  │        │ M:N  │            │
    │          │      └────┬───┘      └────────────┘
    │          │◄─┐       │
    └──────────┘  │       │ 1:N
         ▲        │       ▼
         │ 1:1    │  ┌──────────────┐
         └────────┘  │ Etkinlik     │
    Mahalle Başkanı │ Yoklama      │
                    └──────────────┘
```

---

**Versiyon:** 2.0  
**Son Güncelleme:** Ekim 2025  
**Toplam Tablo:** 8 (5 ana + 3 junction)


