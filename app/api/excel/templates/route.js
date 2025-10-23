import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

// Excel şablonları için alan tanımları
const templates = {
  kisiler: {
    name: 'Kişiler',
    columns: ['Ad', 'Soyad', 'Telefon', 'Görev', 'Sorumlu Mahalle'],
    sampleData: [
      ['Ahmet', 'Yılmaz', '0555 123 4567', 'İlçe Başkanı', 'Merkez Mahalle, Yeni Mahalle'],
      ['Mehmet', 'Demir', '0555 987 6543', 'Genel Sekreter', 'Kuzey Mahalle'],
      ['Ayşe', 'Kara', '0555 111 2233', 'Mali İşler Müdürü', 'Güney Mahalle, Doğu Mahalle'],
      ['Fatma', 'Şahin', '0555 444 5566', 'Halkla İlişkiler', 'Merkez Mahalle'],
      ['Ali', 'Çelik', '0555 777 8899', 'Mahalle Başkanı', 'Yeni Mahalle'],
    ]
  },
  mahalleler: {
    name: 'Mahalleler',
    columns: ['Ad', 'Açıklama', 'Lokal Yeri'],
    sampleData: [
      ['Merkez Mahalle', 'Merkez bölge mahallesi', 'Merkez Lokal'],
      ['Yeni Mahalle', 'Şehir merkezine yakın', 'Yeni Lokal'],
      ['Kuzey Mahalle', 'Kuzey bölgesinde', 'Kuzey Lokal'],
      ['Güney Mahalle', 'Güney bölgesinde', 'Güney Lokal'],
      ['Doğu Mahalle', 'Doğu bölgesinde', ''],
    ]
  },
  ilce_gorevler: {
    name: 'İlçe Görevleri',
    columns: ['Ad', 'Açıklama', 'Sıra'],
    sampleData: [
      ['İlçe Başkanı', 'İlçe yönetiminden sorumlu', '1'],
      ['Genel Sekreter', 'İdari işlerden sorumlu', '2'],
      ['Mali İşler Müdürü', 'Mali işlerden sorumlu', '3'],
      ['Halkla İlişkiler', 'İletişimden sorumlu', '4'],
      ['Eğitim Koordinatörü', 'Eğitim faaliyetlerinden sorumlu', '5'],
    ]
  },
  uyeler: {
    name: 'Üyeler',
    columns: ['Ad', 'Soyad', 'Telefon', 'Email', 'Adres', 'İlçe Görevi'],
    sampleData: [
      ['Ahmet', 'Yılmaz', '0555 123 4567', 'ahmet@example.com', 'Merkez Mah. No:1', 'İlçe Başkanı'],
      ['Mehmet', 'Demir', '0555 987 6543', 'mehmet@example.com', 'Yeni Mah. No:5', 'Genel Sekreter'],
      ['Ayşe', 'Kara', '0555 111 2233', 'ayse@example.com', 'Kuzey Mah. No:12', ''],
      ['Fatma', 'Şahin', '0555 444 5566', 'fatma@example.com', 'Güney Mah. No:8', ''],
      ['Ali', 'Çelik', '0555 777 8899', '', 'Doğu Mah. No:20', 'Mali İşler Müdürü'],
    ]
  },
  komisyonlar: {
    name: 'Komisyonlar',
    columns: ['Ad', 'Açıklama'],
    sampleData: [
      ['Eğitim Komisyonu', 'Eğitim faaliyetlerinden sorumlu'],
      ['Spor Komisyonu', 'Spor etkinliklerinden sorumlu'],
      ['Kültür Sanat Komisyonu', 'Kültür ve sanat etkinliklerinden sorumlu'],
      ['Sosyal Yardım Komisyonu', 'Sosyal yardım faaliyetlerinden sorumlu'],
      ['Gençlik Komisyonu', 'Gençlik çalışmalarından sorumlu'],
    ]
  },
  etkinlikler: {
    name: 'Etkinlikler',
    columns: ['Ad', 'Açıklama', 'Tarih (YYYY-MM-DD)', 'Konum', 'Zorunlu (EVET/HAYIR)'],
    sampleData: [
      ['Genel Kurul Toplantısı', 'Aylık genel kurul', '2025-11-01', 'Merkez Lokal', 'EVET'],
      ['Piknik Etkinliği', 'Bahar piknigi', '2025-11-15', 'Şehir Parkı', 'HAYIR'],
      ['Eğitim Semineri', 'Liderlik eğitimi', '2025-11-20', 'Konferans Salonu', 'EVET'],
      ['Spor Turnuvası', 'Futbol turnuvası', '2025-11-25', 'Spor Tesisi', 'HAYIR'],
      ['Yılbaşı Gecesi', 'Yılbaşı kutlaması', '2025-12-31', 'Merkez Lokal', 'HAYIR'],
    ]
  },
  uye_komisyon: {
    name: 'Üye-Komisyon İlişkileri',
    columns: ['Üye Ad', 'Üye Soyad', 'Komisyon Ad', 'Görev'],
    sampleData: [
      ['Ahmet', 'Yılmaz', 'Eğitim Komisyonu', 'Başkan'],
      ['Mehmet', 'Demir', 'Spor Komisyonu', 'Başkan'],
      ['Ayşe', 'Kara', 'Eğitim Komisyonu', 'Üye'],
      ['Fatma', 'Şahin', 'Kültür Sanat Komisyonu', 'Başkan'],
      ['Ali', 'Çelik', 'Sosyal Yardım Komisyonu', 'Üye'],
    ]
  },
  uye_mahalle: {
    name: 'Üye-Mahalle İlişkileri',
    columns: ['Üye Ad', 'Üye Soyad', 'Mahalle Ad'],
    sampleData: [
      ['Ahmet', 'Yılmaz', 'Merkez Mahalle'],
      ['Mehmet', 'Demir', 'Yeni Mahalle'],
      ['Ayşe', 'Kara', 'Kuzey Mahalle'],
      ['Fatma', 'Şahin', 'Güney Mahalle'],
      ['Ali', 'Çelik', 'Doğu Mahalle'],
    ]
  }
};

export const GET = async (request) => {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (!type || !templates[type]) {
      return NextResponse.json(
        { error: 'Geçersiz şablon tipi. Geçerli tipler: ' + Object.keys(templates).join(', ') },
        { status: 400 }
      );
    }

    const template = templates[type];

    // Workbook oluştur
    const workbook = XLSX.utils.book_new();

    // Açıklama satırı + Header + sample data
    const data = [
      ['ℹ️ BU SATIRI SİLİN! Aşağıdaki örnekleri düzenleyebilir veya yeni satırlar ekleyebilirsiniz. İlk satırdaki başlıkları değiştirmeyin!'],
      template.columns,
      ...template.sampleData
    ];

    // Worksheet oluştur
    const worksheet = XLSX.utils.aoa_to_sheet(data);

    // Kolon genişliklerini ayarla
    const colWidths = template.columns.map(() => ({ wch: 25 }));
    worksheet['!cols'] = colWidths;

    // Açıklama satırını sarı yap (1. satır)
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_col(C) + "1";
      if (!worksheet[address]) continue;
      worksheet[address].s = {
        font: { bold: true, color: { rgb: "FF6B00" } },
        fill: { fgColor: { rgb: "FFF4E6" } },
        alignment: { horizontal: "left" }
      };
    }

    // Header stilini ayarla (2. satır - kalın ve mavi)
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_col(C) + "2";
      if (!worksheet[address]) continue;
      worksheet[address].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "4F46E5" } },
        alignment: { horizontal: "center" }
      };
    }

    // Workbook'a worksheet ekle
    XLSX.utils.book_append_sheet(workbook, worksheet, template.name);

    // Excel dosyasını buffer olarak oluştur
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Response oluştur
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${type}_sablonu.xlsx"`,
      },
    });
  } catch (error) {
    console.error('Template oluşturma hatası:', error);
    return NextResponse.json(
      { error: 'Şablon oluşturulurken hata oluştu', details: error.message },
      { status: 500 }
    );
  }
};

