'use client';

import { useState } from 'react';
import { X, MessageSquare, Clock, MapPin, User, Tag, AlertCircle, Send } from 'lucide-react';
import { useEkleTalepNot, useUpdateTalep, useYonetimKurulu, useTalepKategoriler } from '../hooks/useData';

const DURUM_RENK = {
  YENI: 'bg-gray-100 text-gray-700',
  ATANDI: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  ISLEMDE: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
  COZULDU: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  KAPALI: 'bg-gray-200 text-gray-500',
  REDDEDILDI: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
};

const DURUM_ETIKET = {
  YENI: 'Yeni', ATANDI: 'Atandı', ISLEMDE: 'İşlemde',
  COZULDU: 'Çözüldü', KAPALI: 'Kapalı', REDDEDILDI: 'Reddedildi',
};

const ONCELIK_RENK = {
  DUSUK: 'bg-gray-100 text-gray-600',
  NORMAL: 'bg-blue-50 text-blue-600',
  YUKSEK: 'bg-orange-100 text-orange-700',
  ACIL: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
};

const ONCELIK_ETIKET = { DUSUK: 'Düşük', NORMAL: 'Normal', YUKSEK: 'Yüksek', ACIL: 'Acil' };

// YK için izinli geçişler
const YK_GECISLER = {
  ATANDI: [{ durum: 'ISLEMDE', label: 'İşleme Al' }, { durum: 'REDDEDILDI', label: 'Reddet' }],
  ISLEMDE: [{ durum: 'COZULDU', label: 'Çözüldü' }, { durum: 'REDDEDILDI', label: 'Reddet' }],
  COZULDU: [{ durum: 'KAPALI', label: 'Kapat' }],
};

export default function TalepDetayModal({ talep, onClose, currentUser, adminDetay }) {
  const [not, setNot] = useState('');
  const [notEkleniyor, setNotEkleniyor] = useState(false);

  const ekleTalepNot = useEkleTalepNot();
  const updateTalep = useUpdateTalep();
  const { data: ykListesi } = useYonetimKurulu();
  const { data: kategorilerData } = useTalepKategoriler();

  if (!talep) return null;

  const isAdmin = currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'ADMIN';
  const isYK = adminDetay?.yonetimKuruluUyesiId && talep.atananYKId === adminDetay.yonetimKuruluUyesiId;
  const gecisler = isYK ? (YK_GECISLER[talep.durum] || []) : [];
  const notlar = Array.isArray(talep.notlar) ? talep.notlar : [];

  const handleNotEkle = async () => {
    if (!not.trim()) return;
    setNotEkleniyor(true);
    try {
      await ekleTalepNot.mutateAsync({ id: talep.id, icerik: not });
      setNot('');
    } catch (e) {
      alert(e.message);
    } finally {
      setNotEkleniyor(false);
    }
  };

  const handleDurumGuncelle = async (yeniDurum) => {
    try {
      await updateTalep.mutateAsync({ id: talep.id, durum: yeniDurum });
    } catch (e) {
      alert(e.message);
    }
  };

  const handleAdminGuncelle = async (field, value) => {
    try {
      await updateTalep.mutateAsync({ id: talep.id, [field]: value });
    } catch (e) {
      alert(e.message);
    }
  };

  const kategoriRenk = talep.kategori?.renk || '#6366f1';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex-1 pr-4">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {talep.kategori && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  style={{ backgroundColor: kategoriRenk + '25', color: kategoriRenk, border: `1px solid ${kategoriRenk}50` }}>
                  <Tag className="h-3 w-3 mr-1" />{talep.kategori.ad}
                </span>
              )}
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${DURUM_RENK[talep.durum]}`}>
                {DURUM_ETIKET[talep.durum]}
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ONCELIK_RENK[talep.oncelik]}`}>
                <AlertCircle className="h-3 w-3 mr-1" />{ONCELIK_ETIKET[talep.oncelik]}
              </span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{talep.baslik}</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {/* Açıklama */}
          {talep.aciklama && (
            <p className="text-sm text-gray-700 bg-gray-50 rounded-lg px-4 py-3">{talep.aciklama}</p>
          )}

          {/* Bilgi grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span>{talep.mahalle?.ad || 'Mahalle yok'}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span>{talep.atananYK ? `${talep.atananYK.ad} ${talep.atananYK.soyad}` : 'Atanmamış'}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span>{new Date(talep.createdAt).toLocaleDateString('tr-TR')}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span>Açan: {talep.olusturan?.name || talep.olusturan?.username}</span>
            </div>
          </div>

          {/* Admin kontrolleri */}
          {isAdmin && (
            <div className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Yönetim</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Durum</label>
                  <select
                    value={talep.durum}
                    onChange={(e) => handleAdminGuncelle('durum', e.target.value)}
                    className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-accent-500"
                  >
                    {Object.entries(DURUM_ETIKET).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Öncelik</label>
                  <select
                    value={talep.oncelik}
                    onChange={(e) => handleAdminGuncelle('oncelik', e.target.value)}
                    className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-accent-500"
                  >
                    {Object.entries(ONCELIK_ETIKET).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Atanan YK</label>
                  <select
                    value={talep.atananYKId || ''}
                    onChange={(e) => handleAdminGuncelle('atananYKId', e.target.value || null)}
                    className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-accent-500"
                  >
                    <option value="">Atanmamış</option>
                    {(ykListesi || []).map((yk) => (
                      <option key={yk.id} value={yk.id}>{yk.ad} {yk.soyad}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Kategori</label>
                  <select
                    value={talep.kategoriId || ''}
                    onChange={(e) => handleAdminGuncelle('kategoriId', e.target.value || null)}
                    className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-accent-500"
                  >
                    <option value="">Kategori yok</option>
                    {(kategorilerData?.kategoriler || []).map((k) => (
                      <option key={k.id} value={k.id}>{k.ad}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* YK geçiş butonları */}
          {isYK && gecisler.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {gecisler.map((g) => (
                <button
                  key={g.durum}
                  onClick={() => handleDurumGuncelle(g.durum)}
                  disabled={updateTalep.isPending}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                    g.durum === 'REDDEDILDI'
                      ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                      : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          )}

          {/* Notlar */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-semibold text-gray-700">Notlar ({notlar.length})</span>
            </div>
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {notlar.length === 0 && <p className="text-sm text-gray-400 italic">Henüz not yok</p>}
              {notlar.map((n, i) => (
                <div key={i} className={`rounded-lg px-4 py-3 text-sm ${n.yazarId === 0 ? 'bg-gray-50 border border-gray-100' : 'bg-blue-50 border border-blue-100'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-medium text-xs ${n.yazarId === 0 ? 'text-gray-500' : 'text-blue-700'}`}>{n.yazarAdi}</span>
                    <span className="text-xs text-gray-400">{new Date(n.tarih).toLocaleString('tr-TR')}</span>
                  </div>
                  <p className="text-gray-800">{n.icerik}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Not Ekle */}
        {(talep.durum !== 'KAPALI' && talep.durum !== 'REDDEDILDI') && (
          <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={not}
                onChange={(e) => setNot(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleNotEkle()}
                placeholder="Not ekle... (Enter ile gönder)"
                className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-500"
              />
              <button
                onClick={handleNotEkle}
                disabled={notEkleniyor || !not.trim()}
                className="px-3 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
