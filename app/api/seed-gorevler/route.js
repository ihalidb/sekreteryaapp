import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export async function POST() {
  try {
    const varsayilanGorevler = [
      { ad: 'İlçe Başkanı', aciklama: 'İlçe yönetiminin başkanı', sira: 1 },
      { ad: 'Yönetim Kurulu', aciklama: 'İlçe yönetim kurulu üyesi', sira: 2 },
      { ad: 'Yürütme Kurulu', aciklama: 'İlçe yürütme kurulu üyesi', sira: 3 },
      { ad: 'Meclis Üyesi', aciklama: 'İlçe meclis üyesi', sira: 4 },
      { ad: 'İlçe İdari İşler', aciklama: 'İlçe idari işler sorumlusu', sira: 5 },
    ];

    const results = [];
    for (const gorev of varsayilanGorevler) {
      try {
        const created = await prisma.ilceGorev.upsert({
          where: { ad: gorev.ad },
          update: {},
          create: gorev,
        });
        results.push(created);
      } catch (error) {
        console.error(`Görev oluşturma hatası (${gorev.ad}):`, error);
      }
    }

    return NextResponse.json({
      message: 'Varsayılan görevler oluşturuldu',
      gorevler: results,
    });
  } catch (error) {
    console.error('Seed hatası:', error);
    return NextResponse.json({ error: 'Görevler oluşturulamadı' }, { status: 500 });
  }
}

