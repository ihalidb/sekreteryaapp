#!/bin/bash

# Sekreterya App - HTTP Başlatma Script'i
# Sertifika hatası olmadan HTTP üzerinden çalışır

echo "🚀 Sekreterya App HTTP Server Başlatılıyor..."
echo "📍 URL: http://localhost:3000"
echo "🌐 Network: http://192.168.1.133:3000"
echo ""

# Port kontrolü
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port 3000 kullanımda. Mevcut process durduruluyor..."
    kill -9 $(lsof -ti:3000) 2>/dev/null || true
    sleep 2
fi

# Environment variables
export NODE_TLS_REJECT_UNAUTHORIZED=0
export NODE_ENV=development

# Next.js development server'ı başlat
echo "🔄 Server başlatılıyor..."
npm run dev:http
