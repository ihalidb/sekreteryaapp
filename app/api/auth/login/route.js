import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma.js';
import bcrypt from 'bcryptjs';
import { getSession } from '../../../../lib/auth.js';
import crypto from 'crypto';

export const POST = async (request) => {
  try {
    const { username, password } = await request.json();

    // Input validation
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Kullanıcı adı ve şifre gereklidir' },
        { status: 400 }
      );
    }

    // Admin kullanıcıyı bul
    const admin = await prisma.admin.findUnique({
      where: { username }
    });

    if (!admin) {
      return NextResponse.json(
        { error: 'Kullanıcı adı veya şifre hatalı' },
        { status: 401 }
      );
    }

    // Aktif mi kontrol et
    if (!admin.active) {
      return NextResponse.json(
        { error: 'Hesabınız deaktif edilmiş' },
        { status: 401 }
      );
    }

    // Şifre kontrolü
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Kullanıcı adı veya şifre hatalı' },
        { status: 401 }
      );
    }

    // Benzersiz session token oluştur
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const sessionExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 gün

    // Admin'i güncelle: yeni session token kaydet (eski session geçersiz olacak)
    await prisma.admin.update({
      where: { id: admin.id },
      data: { 
        lastLogin: new Date(),
        sessionToken: sessionToken,
        sessionExpiry: sessionExpiry
      }
    });

    // Session oluştur
    console.log('🔐 Creating session for user:', admin.username);
    const session = await getSession();
    session.user = {
      id: admin.id,
      username: admin.username,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      sessionToken: sessionToken // Token'ı session'a da ekle
    };
    
    // Session'ı kaydet
    console.log('💾 Saving session...');
    await session.save();
    
    console.log('✅ Session saved successfully:', session.user);
    console.log('🍪 Cookie should be set with name: sekreteryaapp_session');

    // Response oluştur - Session save() otomatik olarak cookie'yi set eder
    // Ancak Route Handler'da cookie'nin düzgün set edildiğinden emin olmak için
    // response'ı doğrudan döndürüyoruz
    const response = NextResponse.json({
      success: true,
      message: 'Giriş başarılı',
      user: {
        id: admin.id,
        username: admin.username,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });

    console.log('📤 Sending response with success=true');
    
    // Iron-session cookies() ile çalıştığı için cookie otomatik set edilmeli
    // Ancak emin olmak için biraz bekleme ekleyelim
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Giriş yapılırken hata oluştu', details: error.message },
      { status: 500 }
    );
  }
};

