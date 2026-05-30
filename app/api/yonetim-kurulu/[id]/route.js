import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma.js';
import { getCurrentUser } from '../../../../lib/auth.js';
import bcrypt from 'bcryptjs';

const ykInclude = {
  ilceGorev: true,
  sorumluMahalleler: { include: { mahalle: true } },
  komisyonlar: true,
  admin: { select: { id: true, username: true, active: true } },
};

export const GET = async (request, { params }) => {
  try {
    const id = parseInt(params.id);
    const uye = await prisma.yonetimKuruluUyesi.findUnique({ where: { id }, include: ykInclude });
    if (!uye) return NextResponse.json({ error: 'Yönetim kurulu üyesi bulunamadı' }, { status: 404 });
    return NextResponse.json(uye);
  } catch (error) {
    console.error('Yönetim kurulu üyesi getirme hatası:', error);
    return NextResponse.json({ error: 'Yönetim kurulu üyesi getirilemedi' }, { status: 500 });
  }
};

export const PUT = async (request, { params }) => {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Oturum gerekli' }, { status: 401 });

    const id = parseInt(params.id);
    const data = await request.json();
    const { ad, soyad, ilceGorevId, telefon, email, adres, sira, sorumluMahalleler, yeniSifre } = data;

    if (!ad || !soyad || !ilceGorevId) return NextResponse.json({ error: 'Ad, soyad ve İlçe Görevi zorunludur' }, { status: 400 });

    // Bağlı admin hesabını güncelle
    const mevcutUye = await prisma.yonetimKuruluUyesi.findUnique({ where: { id }, select: { adminId: true } });
    if (mevcutUye?.adminId) {
      const adminUpdate = { name: `${ad.trim()} ${soyad.trim()}`, email: email?.trim() || null };
      if (yeniSifre) {
        if (yeniSifre.length < 6) return NextResponse.json({ error: 'Şifre en az 6 karakter olmalıdır' }, { status: 400 });
        adminUpdate.password = await bcrypt.hash(yeniSifre, 12);
        adminUpdate.sessionToken = null;
        adminUpdate.sessionExpiry = null;
      }
      await prisma.admin.update({ where: { id: mevcutUye.adminId }, data: adminUpdate });
    }

    await prisma.yonetimKuruluMahalle.deleteMany({ where: { yonetimKuruluUyesiId: id } });

    const uye = await prisma.yonetimKuruluUyesi.update({
      where: { id },
      data: {
        ad: ad.trim(),
        soyad: soyad.trim(),
        ilceGorevId: parseInt(ilceGorevId),
        telefon: telefon?.trim() || null,
        email: email?.trim() || null,
        adres: adres?.trim() || null,
        sira: sira || 0,
        sorumluMahalleler: {
          create: sorumluMahalleler?.map(mahalleId => ({ mahalleId: parseInt(mahalleId) })) || [],
        },
      },
      include: ykInclude,
    });
    return NextResponse.json(uye);
  } catch (error) {
    console.error('Yönetim kurulu üyesi güncelleme hatası:', error);
    return NextResponse.json({ error: 'Yönetim kurulu üyesi güncellenemedi' }, { status: 500 });
  }
};

export const DELETE = async (request, { params }) => {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Oturum gerekli' }, { status: 401 });

    const id = parseInt(params.id);
    const uye = await prisma.yonetimKuruluUyesi.findUnique({ where: { id }, select: { adminId: true } });

    await prisma.yonetimKuruluUyesi.delete({ where: { id } });

    // Bağlı admin hesabını da sil
    if (uye?.adminId) {
      await prisma.admin.delete({ where: { id: uye.adminId } }).catch(() => {});
    }

    return NextResponse.json({ message: 'Yönetim kurulu üyesi silindi' });
  } catch (error) {
    console.error('Yönetim kurulu üyesi silme hatası:', error);
    return NextResponse.json({ error: 'Yönetim kurulu üyesi silinemedi' }, { status: 500 });
  }
};
