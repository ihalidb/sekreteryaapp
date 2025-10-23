import { NextResponse } from 'next/server';
import { getSession, getCurrentUser } from '../../../../lib/auth.js';
import { prisma } from '../../../../lib/prisma.js';

export const POST = async () => {
  try {
    const user = await getCurrentUser();
    
    // Database'den session token'ı temizle
    if (user?.id) {
      await prisma.admin.update({
        where: { id: user.id },
        data: { 
          sessionToken: null,
          sessionExpiry: null
        }
      });
    }

    // Cookie session'ı yok et
    const session = await getSession();
    session.destroy();

    return NextResponse.json({
      success: true,
      message: 'Çıkış başarılı'
    });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Çıkış yapılırken hata oluştu' },
      { status: 500 }
    );
  }
};

