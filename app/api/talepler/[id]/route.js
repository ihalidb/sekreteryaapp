import { NextResponse } from 'next/server';
import { getCurrentUser } from '../../../../lib/auth.js';
import { prisma } from '../../../../lib/prisma.js';

const talepInclude = {
  kategori: true,
  mahalle: { select: { id: true, ad: true } },
  olusturan: { select: { id: true, name: true, username: true } },
  atananYK: { select: { id: true, ad: true, soyad: true, ilceGorev: { select: { ad: true } } } },
};

const DURUM_ETIKET = {
  YENI: 'Yeni', ATANDI: 'Atandı', ISLEMDE: 'İşlemde',
  COZULDU: 'Çözüldü', KAPALI: 'Kapalı', REDDEDILDI: 'Reddedildi',
};

const YK_GECISLER = {
  ATANDI: ['ISLEMDE', 'REDDEDILDI'],
  ISLEMDE: ['COZULDU', 'REDDEDILDI'],
  COZULDU: ['KAPALI'],
};

async function getYKId(adminId) {
  const yk = await prisma.yonetimKuruluUyesi.findUnique({ where: { adminId }, select: { id: true } });
  return yk?.id ?? null;
}

export async function GET(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 });

    const { id } = await params;
    const talep = await prisma.talep.findUnique({ where: { id: parseInt(id) }, include: talepInclude });
    if (!talep) return NextResponse.json({ error: 'Talep bulunamadı' }, { status: 404 });

    if (user.role === 'VIEWER') {
      const ykId = await getYKId(user.id);
      const kendisiOlusturdu = talep.olusturanId === user.id;
      const kendisineAtandi = ykId && talep.atananYKId === ykId;
      if (!kendisiOlusturdu && !kendisineAtandi) {
        return NextResponse.json({ error: 'Bu talebe erişim yetkiniz yok' }, { status: 403 });
      }
    }

    return NextResponse.json({ success: true, talep });
  } catch (error) {
    console.error('Talep getirme hatası:', error);
    return NextResponse.json({ error: 'Talep alınırken hata oluştu' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 });

    const { id } = await params;
    const talepId = parseInt(id);
    const body = await request.json();

    const mevcutTalep = await prisma.talep.findUnique({ where: { id: talepId } });
    if (!mevcutTalep) return NextResponse.json({ error: 'Talep bulunamadı' }, { status: 404 });

    const isAdmin = user.role === 'SUPER_ADMIN' || user.role === 'ADMIN';
    const ykId = await getYKId(user.id);
    const isYK = !!ykId && mevcutTalep.atananYKId === ykId;
    const isMB = mevcutTalep.olusturanId === user.id;

    if (!isAdmin && !isYK && !isMB) {
      return NextResponse.json({ error: 'Bu talep üzerinde işlem yapma yetkiniz yok' }, { status: 403 });
    }

    const mevcutNotlar = Array.isArray(mevcutTalep.notlar) ? mevcutTalep.notlar : [];
    let updateData = {};

    if (isAdmin) {
      if (body.baslik !== undefined) updateData.baslik = body.baslik.trim();
      if (body.aciklama !== undefined) updateData.aciklama = body.aciklama?.trim() || null;
      if (body.kategoriId !== undefined) updateData.kategoriId = body.kategoriId ? parseInt(body.kategoriId) : null;
      if (body.oncelik !== undefined) updateData.oncelik = body.oncelik;
      if (body.atananYKId !== undefined) updateData.atananYKId = body.atananYKId ? parseInt(body.atananYKId) : null;
      if (body.durum !== undefined && body.durum !== mevcutTalep.durum) {
        updateData.durum = body.durum;
        updateData.notlar = [...mevcutNotlar, {
          icerik: `Durum "${DURUM_ETIKET[mevcutTalep.durum]}" → "${DURUM_ETIKET[body.durum]}" olarak güncellendi.`,
          yazarId: 0, yazarAdi: 'Sistem', tarih: new Date().toISOString(),
        }];
      }
    } else if (isYK) {
      if (body.durum !== undefined && body.durum !== mevcutTalep.durum) {
        const izinliGecisler = YK_GECISLER[mevcutTalep.durum] || [];
        if (!izinliGecisler.includes(body.durum)) {
          return NextResponse.json({ error: `Bu durumdan "${DURUM_ETIKET[body.durum]}"e geçiş yapılamaz` }, { status: 400 });
        }
        updateData.durum = body.durum;
        updateData.notlar = [...mevcutNotlar, {
          icerik: `Durum "${DURUM_ETIKET[mevcutTalep.durum]}" → "${DURUM_ETIKET[body.durum]}" olarak güncellendi.`,
          yazarId: 0, yazarAdi: 'Sistem', tarih: new Date().toISOString(),
        }];
      }
    }

    if (Object.keys(updateData).length === 0) return NextResponse.json({ success: true, talep: mevcutTalep });

    const talep = await prisma.talep.update({ where: { id: talepId }, data: updateData, include: talepInclude });
    return NextResponse.json({ success: true, talep });
  } catch (error) {
    console.error('Talep güncelleme hatası:', error);
    return NextResponse.json({ error: 'Talep güncellenirken hata oluştu' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 });
    if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetersiz yetki' }, { status: 403 });
    }
    const { id } = await params;
    await prisma.talep.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ success: true, message: 'Talep silindi' });
  } catch (error) {
    console.error('Talep silme hatası:', error);
    return NextResponse.json({ error: 'Talep silinirken hata oluştu' }, { status: 500 });
  }
}
