import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { safeParseJSON, errorResponse, successResponse } from '../../../lib/api-utils';

export async function GET() {
  try {
    const komisyonlar = await prisma.komisyon.findMany({
      include: {
        uyeler: {
          include: {
            uye: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return successResponse(komisyonlar);
  } catch (error) {
    console.error('Komisyonlar listesi hatası:', error);
    return errorResponse('Komisyonlar listelenemedi', 500);
  }
}

export async function POST(request) {
  try {
    const body = await safeParseJSON(request);
    const { ad, aciklama } = body;

    if (!ad || ad.trim() === '') {
      return errorResponse('Komisyon adı gereklidir', 400);
    }

    const komisyon = await prisma.komisyon.create({
      data: {
        ad: ad.trim(),
        aciklama: aciklama?.trim() || null,
      },
    });

    return successResponse(komisyon, 201);
  } catch (error) {
    console.error('Komisyon oluşturma hatası:', error);
    
    // JSON parse hatası için özel mesaj
    if (error.message.includes('JSON')) {
      return errorResponse(`JSON Hatası: ${error.message}`, 400);
    }
    
    return errorResponse('Komisyon oluşturulamadı', 500);
  }
}

