import { NextResponse } from 'next/server';
import { getCurrentUser } from '../../../../lib/auth.js';
import { prisma } from '../../../../lib/prisma.js';
import { canManageUsers } from '../../../../lib/permissions.js';
import bcrypt from 'bcryptjs';

export async function PUT(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 });
    if (!canManageUsers(user)) return NextResponse.json({ error: 'Yetersiz yetki' }, { status: 403 });

    const { id } = await params;
    const adminId = parseInt(id);
    const { active, yeniSifre } = await request.json();

    const updateData = {};
    if (active !== undefined) updateData.active = active;
    if (yeniSifre) {
      if (yeniSifre.length < 6) return NextResponse.json({ error: 'Şifre en az 6 karakter olmalıdır' }, { status: 400 });
      updateData.password = await bcrypt.hash(yeniSifre, 12);
      updateData.sessionToken = null;
      updateData.sessionExpiry = null;
    }

    const admin = await prisma.admin.update({
      where: { id: adminId },
      data: updateData,
      select: { id: true, username: true, active: true, lastLogin: true },
    });

    return NextResponse.json({ success: true, admin });
  } catch (error) {
    console.error('Portal hesabı güncelleme hatası:', error);
    return NextResponse.json({ error: 'Hesap güncellenirken hata oluştu' }, { status: 500 });
  }
}
