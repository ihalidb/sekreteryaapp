import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';

export const sessionOptions = {
  password: process.env.SESSION_SECRET || 'complex_password_at_least_32_characters_long_for_security',
  cookieName: 'sekreteryaapp_session',
  cookieOptions: {
    secure: false, // HTTP için false (IP adresi ile erişim için)
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 gün
  },
};

export const getSession = async () => {
  const cookieStore = await cookies();
  const session = await getIronSession(cookieStore, sessionOptions);
  return session;
};

export const getCurrentUser = async () => {
  const session = await getSession();
  return session.user || null;
};

export const isAuthenticated = async () => {
  const user = await getCurrentUser();
  return !!user;
};

