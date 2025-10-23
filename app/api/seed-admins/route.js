import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma.js';
import bcrypt from 'bcryptjs';

export const POST = async () => {
  try {
    // Admin kullanıcıları var mı kontrol et
    const existingAdmins = await prisma.admin.count();
    
    if (existingAdmins > 0) {
      return NextResponse.json(
        { message: 'Admin kullanıcıları zaten mevcut' },
        { status: 400 }
      );
    }

    // Admin kullanıcılarını oluştur
    const admins = [
      {
        username: 'admin',
        password: await bcrypt.hash('admin123', 10),
        name: 'Admin Kullanıcı',
        email: 'admin@sekreteryaapp.com',
        active: true,
        role: 'admin'
      },
      {
        username: 'admin2',
        password: await bcrypt.hash('admin123', 10),
        name: 'Admin Kullanıcı 2',
        email: 'admin2@sekreteryaapp.com',
        active: true,
        role: 'admin'
      }
    ];

    const createdAdmins = await Promise.all(
      admins.map(admin => prisma.admin.create({ data: admin }))
    );

    return NextResponse.json({
      message: 'Admin kullanıcıları başarıyla oluşturuldu',
      admins: createdAdmins.map(({ password, ...admin }) => admin) // Şifre olmadan döndür
    });
  } catch (error) {
    console.error('Admin seed error:', error);
    return NextResponse.json(
      { error: 'Admin kullanıcıları oluşturulurken hata oluştu', details: error.message },
      { status: 500 }
    );
  }
};

