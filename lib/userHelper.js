import bcrypt from 'bcryptjs';
import { prisma } from './prisma.js';

function normalizeTr(str) {
  const map = { 'Ç':'C','ç':'c','Ğ':'G','ğ':'g','İ':'I','ı':'i','Ö':'O','ö':'o','Ş':'S','ş':'s','Ü':'U','ü':'u' };
  return str.split('').map(c => map[c] || c).join('').toUpperCase().replace(/[^A-Z]/g, '');
}

export function generateUsername(ad, soyad) {
  const ilkHarf = normalizeTr(ad.trim().split(/\s+/)[0]).charAt(0);
  return ilkHarf + normalizeTr(soyad);
}

export async function uniqueUsername(base) {
  let username = base;
  let i = 2;
  while (await prisma.admin.findUnique({ where: { username } })) {
    username = base + i++;
  }
  return username;
}

export async function createAdminForPerson({ ad, soyad, email, password, createdBy }) {
  const base = generateUsername(ad, soyad);
  const username = await uniqueUsername(base);
  const hashed = await bcrypt.hash(password, 12);
  return prisma.admin.create({
    data: {
      username,
      password: hashed,
      name: `${ad} ${soyad}`,
      email: email || null,
      role: 'VIEWER',
      active: true,
      createdBy: createdBy || null,
    },
  });
}
