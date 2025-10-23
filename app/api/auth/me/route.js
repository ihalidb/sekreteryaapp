import { NextResponse } from 'next/server';
import { getCurrentUser, getSession } from '../../../../lib/auth.js';
import { prisma } from '../../../../lib/prisma.js';

export const GET = async () => {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Oturum bulunamadı' },
        { status: 401 }
      );
    }

    // Session token kontrolü - database'deki token ile eşleşmeli
    if (user.sessionToken) {
      const admin = await prisma.admin.findUnique({
        where: { id: user.id }
      });

      // Admin bulunamadı
      if (!admin) {
        const session = await getSession();
        session.destroy();
        
        return NextResponse.json(
          { error: 'Oturum bulunamadı' },
          { status: 401 }
        );
      }

      // Database'de token null ise (logout yapılmış)
      if (!admin.sessionToken) {
        const session = await getSession();
        session.destroy();
        
        return NextResponse.json(
          { error: 'Oturumunuz sonlandırıldı' },
          { status: 401 }
        );
      }

      // Token uyuşmuyor - başka yerden giriş yapılmış
      if (admin.sessionToken !== user.sessionToken) {
        const session = await getSession();
        session.destroy();
        
        return NextResponse.json(
          { error: 'Oturumunuz başka bir cihazdan sonlandırıldı' },
          { status: 401 }
        );
      }

      // Token süresi dolmuş mu?
      if (admin.sessionExpiry && new Date() > admin.sessionExpiry) {
        // Token süresi dolmuş
        await prisma.admin.update({
          where: { id: admin.id },
          data: { sessionToken: null, sessionExpiry: null }
        });

        const session = await getSession();
        session.destroy();
        
        return NextResponse.json(
          { error: 'Oturumunuz sona erdi' },
          { status: 401 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Kullanıcı bilgisi alınırken hata oluştu' },
      { status: 500 }
    );
  }
};

