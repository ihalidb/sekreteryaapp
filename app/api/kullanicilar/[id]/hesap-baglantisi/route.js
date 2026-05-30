import { NextResponse } from 'next/server';
import { getCurrentUser } from '../../../../../lib/auth.js';
import { prisma } from '../../../../../lib/prisma.js';
import { canManageUsers } from '../../../../../lib/permissions.js';

export async function PUT(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 });
    if (!canManageUsers(user)) return NextResponse.json({ error: 'Süper Admin yetkisi gereklidir' }, { status: 403 });

    const { id } = await params;
    const adminId = parseInt(id);
    const { baglantiTuru, mahalleBaskanId, yonetimKuruluUyesiId } = await request.json();

    const hedefAdmin = await prisma.admin.findUnique({ where: { id: adminId } });
    if (!hedefAdmin) return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });

    let updateData = { mahalleBaskanId: null, yonetimKuruluUyesiId: null };

    if (baglantiTuru === 'mahalleBaskan' && mahalleBaskanId) {
      const mbId = parseInt(mahalleBaskanId);
      const mevcutBagli = await prisma.admin.findFirst({
        where: { mahalleBaskanId: mbId, NOT: { id: adminId } }
      });
      if (mevcutBagli) {
        return NextResponse.json({ error: 'Bu mahalle başkanı zaten başka bir kullanıcıya bağlı' }, { status: 400 });
      }
      updateData.mahalleBaskanId = mbId;
    } else if (baglantiTuru === 'yonetimKurulu' && yonetimKuruluUyesiId) {
      const ykId = parseInt(yonetimKuruluUyesiId);
      const mevcutBagli = await prisma.admin.findFirst({
        where: { yonetimKuruluUyesiId: ykId, NOT: { id: adminId } }
      });
      if (mevcutBagli) {
        return NextResponse.json({ error: 'Bu YK üyesi zaten başka bir kullanıcıya bağlı' }, { status: 400 });
      }
      updateData.yonetimKuruluUyesiId = ykId;
    }

    const guncellendi = await prisma.admin.update({
      where: { id: adminId },
      data: updateData,
      select: {
        id: true,
        mahalleBaskanId: true,
        mahalleBaskan: { select: { id: true, ad: true, soyad: true, mahalleId: true, mahalle: { select: { ad: true } } } },
        yonetimKuruluUyesiId: true,
        yonetimKuruluUyesi: { select: { id: true, ad: true, soyad: true } },
      },
    });

    return NextResponse.json({ success: true, kullanici: guncellendi });
  } catch (error) {
    console.error('Hesap bağlantısı hatası:', error);
    return NextResponse.json({ error: 'Hesap bağlantısı güncellenirken hata oluştu' }, { status: 500 });
  }
}
