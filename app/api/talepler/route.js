import { NextResponse } from 'next/server';
import { getCurrentUser } from '../../../lib/auth.js';
import { prisma } from '../../../lib/prisma.js';

const talepInclude = {
  kategori: true,
  mahalle: { select: { id: true, ad: true } },
  olusturan: { select: { id: true, name: true, username: true } },
  atananYK: { select: { id: true, ad: true, soyad: true, ilceGorev: { select: { ad: true } } } },
};

// Admin'in MB veya YK bağlantısını MB/YK tablolarından çek
async function getPersonBaglanti(adminId) {
  const mb = await prisma.mahalleBaskan.findUnique({ where: { adminId }, select: { id: true, mahalleId: true } });
  if (mb) return { tip: 'mb', mbId: mb.id, mahalleId: mb.mahalleId };
  const yk = await prisma.yonetimKuruluUyesi.findUnique({ where: { adminId }, select: { id: true } });
  if (yk) return { tip: 'yk', ykId: yk.id };
  return null;
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 });

    let where = {};

    if (user.role === 'VIEWER') {
      const baglanti = await getPersonBaglanti(user.id);
      if (!baglanti) return NextResponse.json({ success: true, talepler: [] });
      if (baglanti.tip === 'mb') {
        where = { olusturanId: user.id };
      } else {
        where = { atananYKId: baglanti.ykId };
      }
    }

    const talepler = await prisma.talep.findMany({ where, include: talepInclude, orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ success: true, talepler });
  } catch (error) {
    console.error('Talepler listesi hatası:', error);
    return NextResponse.json({ error: 'Talepler alınırken hata oluştu' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 });

    const baglanti = await getPersonBaglanti(user.id);
    if (!baglanti || baglanti.tip !== 'mb') {
      return NextResponse.json({ error: 'Talep oluşturmak için mahalle başkanı hesabı gereklidir' }, { status: 403 });
    }

    const mahalleId = baglanti.mahalleId ?? null;

    let atananYKId = null;
    if (mahalleId) {
      const ykAtama = await prisma.yonetimKuruluMahalle.findFirst({ where: { mahalleId } });
      atananYKId = ykAtama?.yonetimKuruluUyesiId ?? null;
    }

    const durum = atananYKId ? 'ATANDI' : 'YENI';
    const { baslik, aciklama, kategoriId, oncelik } = await request.json();
    if (!baslik?.trim()) return NextResponse.json({ error: 'Başlık zorunludur' }, { status: 400 });

    const ilkNot = [{
      icerik: atananYKId ? 'Talep oluşturuldu ve sorumlu YK üyesine otomatik atandı.' : 'Talep oluşturuldu. Atama bekliyor.',
      yazarId: 0, yazarAdi: 'Sistem', tarih: new Date().toISOString(),
    }];

    const talep = await prisma.talep.create({
      data: {
        baslik: baslik.trim(),
        aciklama: aciklama?.trim() || null,
        kategoriId: kategoriId ? parseInt(kategoriId) : null,
        mahalleId,
        olusturanId: user.id,
        atananYKId,
        durum,
        oncelik: oncelik || 'NORMAL',
        notlar: ilkNot,
        createdBy: user.id,
      },
      include: talepInclude,
    });

    return NextResponse.json({ success: true, talep }, { status: 201 });
  } catch (error) {
    console.error('Talep oluşturma hatası:', error);
    return NextResponse.json({ error: 'Talep oluşturulurken hata oluştu' }, { status: 500 });
  }
}
