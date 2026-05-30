import { NextResponse } from 'next/server';
import { getCurrentUser } from '../../../lib/auth.js';
import { prisma } from '../../../lib/prisma.js';
import { canManageUsers, ROLES } from '../../../lib/permissions.js';
import bcrypt from 'bcryptjs';

async function requireSuperAdmin() {
  const user = await getCurrentUser();
  if (!user) return { error: 'Oturum bulunamadı', status: 401 };
  if (!canManageUsers(user)) return { error: 'Bu işlem için Süper Admin yetkisi gereklidir', status: 403 };
  return { user };
}

export async function GET() {
  try {
    const check = await requireSuperAdmin();
    if (check.error) return NextResponse.json({ error: check.error }, { status: check.status });

    const kullanicilar = await prisma.admin.findMany({
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        active: true,
        role: true,
        lastLogin: true,
        createdAt: true,
        createdBy: true,
        izinler: true,
      },
    });

    return NextResponse.json({ success: true, kullanicilar });
  } catch (error) {
    console.error('Kullanıcı listesi hatası:', error);
    return NextResponse.json({ error: 'Kullanıcılar alınırken hata oluştu' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const check = await requireSuperAdmin();
    if (check.error) return NextResponse.json({ error: check.error }, { status: check.status });

    const body = await request.json();
    const { username, password, name, email, role, izinler } = body;

    if (!username || !password) {
      return NextResponse.json({ error: 'Kullanıcı adı ve şifre zorunludur' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Şifre en az 6 karakter olmalıdır' }, { status: 400 });
    }

    const mevcutKullanici = await prisma.admin.findUnique({ where: { username } });
    if (mevcutKullanici) {
      return NextResponse.json({ error: 'Bu kullanıcı adı zaten kullanılıyor' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const yeniKullanici = await prisma.admin.create({
      data: {
        username,
        password: hashedPassword,
        name: name || null,
        email: email || null,
        role: role || ROLES.ADMIN,
        active: true,
        createdBy: check.user.id,
        izinler: {
          create: {
            mahalleler: izinler?.mahalleler || 'none',
            uyeler: izinler?.uyeler || 'none',
            etkinlikler: izinler?.etkinlikler || 'none',
            komisyonlar: izinler?.komisyonlar || 'none',
          },
        },
      },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        active: true,
        role: true,
        createdAt: true,
        izinler: true,
      },
    });

    return NextResponse.json({ success: true, kullanici: yeniKullanici }, { status: 201 });
  } catch (error) {
    console.error('Kullanıcı oluşturma hatası:', error);
    return NextResponse.json({ error: 'Kullanıcı oluşturulurken hata oluştu' }, { status: 500 });
  }
}
