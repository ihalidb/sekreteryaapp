import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

const MEMBERS = [
  { ad: 'Alparslan', soyad: 'Avşaroğlu', gorev: 'Yönetim Kurulu' },
  { ad: 'Hatice', soyad: 'Bozkurt', gorev: 'Yönetim Kurulu' },
  { ad: 'Levent', soyad: 'Özerdem', gorev: 'Yönetim Kurulu' },
  { ad: 'Mert', soyad: 'Karaer', gorev: 'Yönetim Kurulu' },
  { ad: 'İlyas', soyad: 'Yıldız', gorev: 'Yönetim Kurulu' },
  { ad: 'Ahmet', soyad: 'Çalbay', gorev: 'Yönetim Kurulu' },
  { ad: 'Birgül', soyad: 'Nuhut', gorev: 'Yönetim Kurulu' },
  { ad: 'Arif', soyad: 'Kararoğlu', gorev: 'Yönetim Kurulu' },
  { ad: 'Fuat', soyad: 'Güney', gorev: 'Yönetim Kurulu' },
  { ad: 'İdris', soyad: 'Bastık', gorev: 'Yönetim Kurulu' },
  { ad: 'Turgut', soyad: 'Ağaya', gorev: 'Yönetim Kurulu' },
  { ad: 'Abdurrahim', soyad: 'Esen', gorev: 'Yönetim Kurulu' },
  { ad: 'Fırat', soyad: 'Barış', gorev: 'Yönetim Kurulu' },
  { ad: 'Ertuğrul', soyad: 'Müyesseroğlu', gorev: 'Yönetim Kurulu' },
  { ad: 'İbrahim Halid', soyad: 'Bayrak', gorev: 'Yönetim Kurulu' },
  { ad: 'Elif Burcu', soyad: 'Taş', gorev: 'Yönetim Kurulu' },
  { ad: 'Serdal', soyad: 'Güvercin', gorev: 'Yönetim Kurulu' },
  { ad: 'Ayşe Nevin', soyad: 'Dikol', gorev: 'Yönetim Kurulu' },
  { ad: 'Adem', soyad: 'Gök', gorev: 'Yönetim Kurulu' },
  { ad: 'Bedirhan', soyad: 'Çelik', gorev: 'Yönetim Kurulu' },
  { ad: 'Cihangir Bilal', soyad: 'Can', gorev: 'Yönetim Kurulu' },
  { ad: 'Ekrem', soyad: 'İnal', gorev: 'Yönetim Kurulu' },
  { ad: 'Faysal', soyad: 'Yılmaz', gorev: 'Yönetim Kurulu' },
  { ad: 'Fikret', soyad: 'Oğur', gorev: 'Yönetim Kurulu' },
  { ad: 'Hediye', soyad: 'Aray', gorev: 'Yönetim Kurulu' },
  { ad: 'İbrahim', soyad: 'Hacısalihoğlu', gorev: 'Yönetim Kurulu' },
  { ad: 'İbrahim Kerim', soyad: 'Narin', gorev: 'Yönetim Kurulu' },
  { ad: 'Kadir', soyad: 'Musaoğlu', gorev: 'Yönetim Kurulu' },
  { ad: 'Kemal', soyad: 'Duranoğlu', gorev: 'Yönetim Kurulu' },
  { ad: 'Mahmut', soyad: 'Şirin', gorev: 'Yönetim Kurulu' },
  { ad: 'Mehmet', soyad: 'Dağseven', gorev: 'Yönetim Kurulu' },
  { ad: 'Mehmet', soyad: 'Mazı', gorev: 'Yönetim Kurulu' },
  { ad: 'Muhittin', soyad: 'Bingöl', gorev: 'Yönetim Kurulu' },
  { ad: 'Nebahat', soyad: 'Uysal', gorev: 'Yönetim Kurulu' },
  { ad: 'Fatih', soyad: 'Karaismailoğlu', gorev: 'İlçe Başkanı' },
  { ad: 'Yaşar Kemal', soyad: 'Küçükdoğan', gorev: 'Yürütme Kurulu' },
  { ad: 'Osman', soyad: 'Yıldız', gorev: 'Yürütme Kurulu' },
  { ad: 'Kadir', soyad: 'Onat', gorev: 'Yürütme Kurulu' },
  { ad: 'Ayşe', soyad: 'Yardım', gorev: 'Yürütme Kurulu' },
  { ad: 'Mücahit', soyad: 'Pehlivan', gorev: 'Yürütme Kurulu' },
  { ad: 'Ramazan', soyad: 'Memiş', gorev: 'Yürütme Kurulu' },
  { ad: 'Mehmet Şefik', soyad: 'Seven', gorev: 'Yürütme Kurulu' },
  { ad: 'Esra', soyad: 'Tüken', gorev: 'Yürütme Kurulu' },
  { ad: 'Burak', soyad: 'Aykut', gorev: 'Yürütme Kurulu' },
  { ad: 'Neslişah Tuğba', soyad: 'Vural', gorev: 'Yürütme Kurulu' },
];

export async function POST() {
  try {
    // Ensure roles exist and build a cache map
    const uniqueRoles = Array.from(new Set(MEMBERS.map(m => m.gorev)));
    const roleMap = new Map();

    for (const roleName of uniqueRoles) {
      const role = await prisma.ilceGorev.upsert({
        where: { ad: roleName },
        update: {},
        create: { ad: roleName },
      });
      roleMap.set(roleName, role.id);
    }

    const created = [];
    for (const m of MEMBERS) {
      const existing = await prisma.uye.findFirst({
        where: { ad: m.ad, soyad: m.soyad },
      });

      if (existing) {
        const updated = await prisma.uye.update({
          where: { id: existing.id },
          data: { ilceGorevId: roleMap.get(m.gorev) },
        });
        created.push(updated);
      } else {
        const user = await prisma.uye.create({
          data: {
            ad: m.ad,
            soyad: m.soyad,
            ilceGorevId: roleMap.get(m.gorev),
          },
        });
        created.push(user);
      }
    }

    return NextResponse.json({ message: 'Üyeler seed edildi', count: created.length });
  } catch (error) {
    console.error('Seed üyeler hatası:', error);
    return NextResponse.json({ error: 'Üyeler seed edilemedi' }, { status: 500 });
  }
}
