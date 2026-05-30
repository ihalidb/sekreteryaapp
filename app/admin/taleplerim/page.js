'use client';

import { useState, useEffect } from 'react';
import { Plus, Inbox, RefreshCw, AlertCircle } from 'lucide-react';
import { useTalepler, useCreateTalep, useTalepKategoriler } from '../../hooks/useData';
import TalepDetayModal from '../../components/TalepDetayModal';

const DURUM_RENK = {
  YENI: 'bg-gray-100 text-gray-700',
  ATANDI: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  ISLEMDE: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
  COZULDU: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  KAPALI: 'bg-gray-200 text-gray-500',
  REDDEDILDI: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
};
const DURUM_ETIKET = { YENI: 'Yeni', ATANDI: 'Atandı', ISLEMDE: 'İşlemde', COZULDU: 'Çözüldü', KAPALI: 'Kapalı', REDDEDILDI: 'Reddedildi' };
const ONCELIK_ETIKET = { DUSUK: 'Düşük', NORMAL: 'Normal', YUKSEK: 'Yüksek', ACIL: 'Acil' };

const defaultForm = { baslik: '', aciklama: '', kategoriId: '', oncelik: 'NORMAL' };

export default function TaleplerimPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [adminDetay, setAdminDetay] = useState(null);
  const [seciliTalep, setSeciliTalep] = useState(null);
  const [yeniTalepAcik, setYeniTalepAcik] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [formHata, setFormHata] = useState(null);

  const { data: taleplerData, isLoading, refetch } = useTalepler();
  const { data: kategorilerData } = useTalepKategoriler();
  const createTalep = useCreateTalep();

  // Mevcut kullanıcı + hesap bağlantısı bilgisini çek
  useEffect(() => {
    const fetchMe = async () => {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
      }
    };
    fetchMe();
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    const fetchDetay = async () => {
      const res = await fetch(`/api/kullanicilar/${currentUser.id}/detay`);
      if (res.ok) {
        const data = await res.json();
        setAdminDetay(data.kullanici);
      }
    };
    fetchDetay();
  }, [currentUser]);

  const talepler = taleplerData?.talepler || [];
  const isMB = !!adminDetay?.mahalleBaskanId;
  const isYK = !!adminDetay?.yonetimKuruluUyesiId;

  const handleYeniTalep = async () => {
    setFormHata(null);
    if (!form.baslik.trim()) { setFormHata('Başlık zorunludur'); return; }
    try {
      await createTalep.mutateAsync(form);
      setYeniTalepAcik(false);
      setForm(defaultForm);
    } catch (e) {
      setFormHata(e.message);
    }
  };

  const baslik = isMB ? 'Taleplerim' : isYK ? 'Atanan Talepler' : 'Taleplerim';
  const aciklama = isMB
    ? 'Mahallenizle ilgili açtığınız talepler'
    : isYK ? 'Size atanan mahalle talepleri' : 'Talepleriniz';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Başlık */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Inbox className="h-7 w-7 text-accent-600" /> {baslik}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{aciklama}</p>
        </div>
        <div className="flex gap-2">
          {isMB && (
            <button onClick={() => setYeniTalepAcik(true)}
              className="flex items-center gap-2 px-4 py-2 bg-accent-600 hover:bg-accent-700 text-white text-sm font-medium rounded-lg transition">
              <Plus className="h-4 w-4" /> Yeni Talep
            </button>
          )}
          <button onClick={() => refetch()} className="p-2 text-gray-500 hover:text-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400 transition">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Hesap bağlantısı uyarısı */}
      {currentUser && !isMB && !isYK && adminDetay && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl px-5 py-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-800">Hesap bağlantısı bulunamadı</p>
            <p className="text-sm text-yellow-700 mt-0.5">
              Bu sayfayı kullanmak için hesabınızın bir mahalle başkanı veya YK üyesiyle eşleştirilmesi gerekiyor. Lütfen yöneticinizle iletişime geçin.
            </p>
          </div>
        </div>
      )}

      {/* Talepler */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-600" />
          </div>
        ) : talepler.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm text-center py-16 text-gray-400">
            <Inbox className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p>{isMB ? 'Henüz talep açmadınız' : 'Size atanan talep yok'}</p>
          </div>
        ) : (
          talepler.map((t) => (
            <div key={t.id} onClick={() => setSeciliTalep(t)}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm px-5 py-4 cursor-pointer hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${DURUM_RENK[t.durum]}`}>
                      {DURUM_ETIKET[t.durum]}
                    </span>
                    {t.kategori && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ backgroundColor: t.kategori.renk + '20', color: t.kategori.renk }}>
                        {t.kategori.ad}
                      </span>
                    )}
                    <span className="text-xs text-gray-400 dark:text-gray-500">{ONCELIK_ETIKET[t.oncelik]}</span>
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white truncate">{t.baslik}</p>
                  {t.aciklama && <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 truncate">{t.aciklama}</p>}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-gray-400 dark:text-gray-500">{new Date(t.createdAt).toLocaleDateString('tr-TR')}</p>
                  {t.mahalle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t.mahalle.ad}</p>}
                  {Array.isArray(t.notlar) && t.notlar.length > 0 && (
                    <p className="text-xs text-blue-400 mt-0.5">{t.notlar.length} not</p>
                  )}
                </div>
              </div>
              {isYK && t.atananYK && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                  Açan: {t.olusturan?.name || t.olusturan?.username} · {t.mahalle?.ad}
                </p>
              )}
            </div>
          ))
        )}
      </div>

      {/* Yeni Talep Modalı */}
      {yeniTalepAcik && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Yeni Talep Aç</h2>
              <p className="text-sm text-gray-500 mt-0.5">Mahallenizle ilgili talebinizi iletin</p>
            </div>
            <div className="px-6 py-5 space-y-4">
              {formHata && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 text-sm rounded-lg px-4 py-2">{formHata}</div>
              )}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Başlık *</label>
                <input type="text" value={form.baslik} onChange={(e) => setForm({ ...form, baslik: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
                  placeholder="Talebinizi kısaca özetleyin" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Açıklama</label>
                <textarea value={form.aciklama} onChange={(e) => setForm({ ...form, aciklama: e.target.value })} rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 resize-none"
                  placeholder="Detaylı açıklama..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Kategori</label>
                  <select value={form.kategoriId} onChange={(e) => setForm({ ...form, kategoriId: e.target.value })}
                    className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-accent-500">
                    <option value="">Seçin</option>
                    {(kategorilerData?.kategoriler || []).map((k) => (
                      <option key={k.id} value={k.id}>{k.ad}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Öncelik</label>
                  <select value={form.oncelik} onChange={(e) => setForm({ ...form, oncelik: e.target.value })}
                    className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-accent-500">
                    {Object.entries(ONCELIK_ETIKET).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
              <button onClick={() => { setYeniTalepAcik(false); setForm(defaultForm); setFormHata(null); }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
                İptal
              </button>
              <button onClick={handleYeniTalep} disabled={createTalep.isPending}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-accent-600 hover:bg-accent-700 rounded-lg transition disabled:opacity-60">
                {createTalep.isPending ? <><div className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Gönderiliyor...</> : 'Gönder'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detay modalı */}
      {seciliTalep && (
        <TalepDetayModal
          talep={seciliTalep}
          onClose={() => setSeciliTalep(null)}
          currentUser={currentUser}
          adminDetay={adminDetay}
        />
      )}
    </div>
  );
}
