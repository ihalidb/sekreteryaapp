import { NextResponse } from 'next/server';
import { getCurrentUser } from '../../../../lib/auth.js';
import { prisma } from '../../../../lib/prisma.js';
import { canManageUsers } from '../../../../lib/permissions.js';
import bcrypt from 'bcryptjs';

async function requireSuperAdmin() {
  const user = await getCurrentUser();
  if (!user) return { error: 'Oturum bulunamadı', status: 401 };
  if (!canManageUsers(user)) return { error: 'Bu işlem için Süper Admin yetkisi gereklidir', status: 403 };
  return { user };
}

export async function GET(request, { params }) {
  try {
    const check = await requireSuperAdmin();
    if (check.error) return NextResponse.json({ error: check.error }, { status: check.status });

    const { id } = await params;
    const kullanici = await prisma.admin.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        active: true,
        role: true,
        lastLogin: true,
        createdAt: true,
        izinler: true,
      },
    });

    if (!kullanici) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    return NextResponse.json({ success: true, kullanici });
  } catch (error) {
    console.error('Kullanıcı getirme hatası:', error);
    return NextResponse.json({ error: 'Kullanıcı alınırken hata oluştu' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const check = await requireSuperAdmin();
    if (check.error) return NextResponse.json({ error: check.error }, { status: check.status });

    const { id } = await params;
    const kullaniciId = parseInt(id);
    const body = await request.json();
    const { username, password, name, email, role, active, izinler } = body;

    const mevcutKullanici = await prisma.admin.findUnique({ where: { id: kullaniciId } });
    if (!mevcutKullanici) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    // Kendini super_admin'den düşürmeye çalışıyorsa engelle
    if (mevcutKullanici.id === check.user.id && role && role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Kendi rolünüzü değiştiremezsiniz' }, { status: 400 });
    }

    // Kullanıcı adı değişiyorsa benzersizlik kontrolü
    if (username && username !== mevcutKullanici.username) {
      const var1 = await prisma.admin.findUnique({ where: { username } });
      if (var1) return NextResponse.json({ error: 'Bu kullanıcı adı zaten kullanılıyor' }, { status: 400 });
    }

    const updateData = {};
    if (username) updateData.username = username;
    if (name !== undefined) updateData.name = name || null;
    if (email !== undefined) updateData.email = email || null;
    if (role) updateData.role = role;
    if (active !== undefined) updateData.active = active;

    if (password) {
      if (password.length < 6) {
        return NextResponse.json({ error: 'Şifre en az 6 karakter olmalıdır' }, { status: 400 });
      }
      updateData.password = await bcrypt.hash(password, 12);
      // Şifre değiştiğinde mevcut oturumu sonlandır
      updateData.sessionToken = null;
      updateData.sessionExpiry = null;
    }

    const guncellendi = await prisma.admin.update({
      where: { id: kullaniciId },
      data: {
        ...updateData,
        ...(izinler ? {
          izinler: {
            upsert: {
              create: {
                mahalleler: izinler.mahalleler || 'none',
                uyeler: izinler.uyeler || 'none',
                etkinlikler: izinler.etkinlikler || 'none',
                komisyonlar: izinler.komisyonlar || 'none',
              },
              update: {
                mahalleler: izinler.mahalleler || 'none',
                uyeler: izinler.uyeler || 'none',
                etkinlikler: izinler.etkinlikler || 'none',
                komisyonlar: izinler.komisyonlar || 'none',
              },
            },
          },
        } : {}),
      },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        active: true,
        role: true,
        lastLogin: true,
        createdAt: true,
        izinler: true,
      },
    });

    return NextResponse.json({ success: true, kullanici: guncellendi });
  } catch (error) {
    console.error('Kullanıcı güncelleme hatası:', error);
    return NextResponse.json({ error: 'Kullanıcı güncellenirken hata oluştu' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const check = await requireSuperAdmin();
    if (check.error) return NextResponse.json({ error: check.error }, { status: check.status });

    const { id } = await params;
    const kullaniciId = parseInt(id);

    if (kullaniciId === check.user.id) {
      return NextResponse.json({ error: 'Kendi hesabınızı silemezsiniz' }, { status: 400 });
    }

    const kullanici = await prisma.admin.findUnique({ where: { id: kullaniciId } });
    if (!kullanici) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    await prisma.admin.delete({ where: { id: kullaniciId } });

    return NextResponse.json({ success: true, message: 'Kullanıcı silindi' });
  } catch (error) {
    console.error('Kullanıcı silme hatası:', error);
    return NextResponse.json({ error: 'Kullanıcı silinirken hata oluştu' }, { status: 500 });
  }
}
