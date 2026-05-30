'use client';

import { useState } from 'react';
import { Ticket, Filter, Search, Tag, RefreshCw } from 'lucide-react';
import { useTalepler, useTalepKategoriler, useMahalleler } from '../../hooks/useData';
import TalepDetayModal from '../../components/TalepDetayModal';
import TalepKategoriYonetimi from '../../components/TalepKategoriYonetimi';

const DURUM_RENK = {
  YENI: 'bg-gray-100 text-gray-700',
  ATANDI: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  ISLEMDE: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
  COZULDU: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  KAPALI: 'bg-gray-200 text-gray-500',
  REDDEDILDI: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
};
const DURUM_ETIKET = { YENI: 'Yeni', ATANDI: 'Atandı', ISLEMDE: 'İşlemde', COZULDU: 'Çözüldü', KAPALI: 'Kapalı', REDDEDILDI: 'Reddedildi' };
const ONCELIK_RENK = { DUSUK: 'text-gray-500', NORMAL: 'text-blue-600', YUKSEK: 'text-orange-600', ACIL: 'text-red-600' };
const ONCELIK_ETIKET = { DUSUK: 'Düşük', NORMAL: 'Normal', YUKSEK: 'Yüksek', ACIL: 'Acil' };

export default function TaleplerPage() {
  const [seciliTalep, setSeciliTalep] = useState(null);
  const [kategorilerAcik, setKategorilerAcik] = useState(false);
  const [filtreDurum, setFiltreDurum] = useState('');
  const [filtreOncelik, setFiltreOncelik] = useState('');
  const [filtreKategori, setFiltreKategori] = useState('');
  const [arama, setArama] = useState('');

  const { data: taleplerData, isLoading, refetch } = useTalepler();
  const { data: kategorilerData } = useTalepKategoriler();

  const talepler = (taleplerData?.talepler || []).filter((t) => {
    if (filtreDurum && t.durum !== filtreDurum) return false;
    if (filtreOncelik && t.oncelik !== filtreOncelik) return false;
    if (filtreKategori && String(t.kategoriId) !== filtreKategori) return false;
    if (arama && !t.baslik.toLowerCase().includes(arama.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Başlık */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Ticket className="h-7 w-7 text-accent-600" /> Talepler
          </h1>
          <p className="mt-1 text-sm text-gray-500">Tüm mahalle talepleri</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setKategorilerAcik(!kategorilerAcik)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition ${kategorilerAcik ? 'bg-accent-50 border-accent-300 text-accent-700 dark:text-accent-300' : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'}`}>
            <Tag className="h-4 w-4" /> Kategoriler
          </button>
          <button onClick={() => refetch()} className="p-2 text-gray-500 hover:text-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400 transition">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex gap-6 items-start">
        {/* Ana içerik */}
        <div className="flex-1 space-y-4">
          {/* Filtreler */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex items-center gap-2 text-gray-500">
                <Filter className="h-4 w-4" />
                <span className="text-sm font-medium">Filtrele:</span>
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <input type="text" value={arama} onChange={(e) => setArama(e.target.value)} placeholder="Başlık ara..."
                  className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-500 w-44" />
              </div>
              <select value={filtreDurum} onChange={(e) => setFiltreDurum(e.target.value)}
                className="text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-accent-500">
                <option value="">Tüm Durumlar</option>
                {Object.entries(DURUM_ETIKET).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <select value={filtreOncelik} onChange={(e) => setFiltreOncelik(e.target.value)}
                className="text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-accent-500">
                <option value="">Tüm Öncelikler</option>
                {Object.entries(ONCELIK_ETIKET).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <select value={filtreKategori} onChange={(e) => setFiltreKategori(e.target.value)}
                className="text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-accent-500">
                <option value="">Tüm Kategoriler</option>
                {(kategorilerData?.kategoriler || []).map((k) => <option key={k.id} value={k.id}>{k.ad}</option>)}
              </select>
              {(filtreDurum || filtreOncelik || filtreKategori || arama) && (
                <button onClick={() => { setFiltreDurum(''); setFiltreOncelik(''); setFiltreKategori(''); setArama(''); }}
                  className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 underline">Temizle</button>
              )}
            </div>
          </div>

          {/* Tablo */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-600" />
              </div>
            ) : talepler.length === 0 ? (
              <div className="text-center py-16 text-gray-400 dark:text-gray-500">
                <Ticket className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p>Talep bulunamadı</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-100 dark:border-gray-600">
                  <tr>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Talep</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase hidden md:table-cell">Mahalle</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase hidden lg:table-cell">Atanan YK</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Durum</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase hidden sm:table-cell">Öncelik</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase hidden lg:table-cell">Tarih</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {talepler.map((t) => (
                    <tr key={t.id} onClick={() => setSeciliTalep(t)}
                      className="hover:bg-gray-50 cursor-pointer transition-colors">
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{t.baslik}</p>
                          {t.kategori && (
                            <span className="inline-flex items-center mt-0.5 px-2 py-0.5 rounded-full text-xs font-medium"
                              style={{ backgroundColor: t.kategori.renk + '20', color: t.kategori.renk }}>
                              {t.kategori.ad}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell text-gray-600 dark:text-gray-400">{t.mahalle?.ad || '—'}</td>
                      <td className="px-5 py-4 hidden lg:table-cell text-gray-600 dark:text-gray-400">
                        {t.atananYK ? `${t.atananYK.ad} ${t.atananYK.soyad}` : <span className="text-gray-400 dark:text-gray-500 italic">Atanmamış</span>}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${DURUM_RENK[t.durum]}`}>
                          {DURUM_ETIKET[t.durum]}
                        </span>
                      </td>
                      <td className="px-5 py-4 hidden sm:table-cell">
                        <span className={`text-xs font-medium ${ONCELIK_RENK[t.oncelik]}`}>{ONCELIK_ETIKET[t.oncelik]}</span>
                      </td>
                      <td className="px-5 py-4 hidden lg:table-cell text-xs text-gray-400 dark:text-gray-500">
                        {new Date(t.createdAt).toLocaleDateString('tr-TR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <p className="text-xs text-gray-400 dark:text-gray-500 text-right">{talepler.length} talep gösteriliyor</p>
        </div>

        {/* Kategoriler paneli */}
        {kategorilerAcik && (
          <div className="w-72 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4 flex-shrink-0">
            <TalepKategoriYonetimi />
          </div>
        )}
      </div>

      {/* Detay modalı */}
      {seciliTalep && (
        <TalepDetayModal
          talep={seciliTalep}
          onClose={() => setSeciliTalep(null)}
          currentUser={{ role: 'SUPER_ADMIN' }}
          adminDetay={{}}
        />
      )}
    </div>
  );
}
