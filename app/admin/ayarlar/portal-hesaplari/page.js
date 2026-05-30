'use client';

import { useState, useEffect, useCallback } from 'react';
import { Users, RefreshCw, Eye, EyeOff, CheckCircle, XCircle, Search, KeyRound } from 'lucide-react';

export default function PortalHesaplariPage() {
  const [hesaplar, setHesaplar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [arama, setArama] = useState('');
  const [tip, setTip] = useState('');
  const [sifreModal, setSifreModal] = useState(null); // { id, username }
  const [yeniSifre, setYeniSifre] = useState('');
  const [showSifre, setShowSifre] = useState(false);
  const [sifreSaving, setSifreSaving] = useState(false);
  const [sifreHata, setSifreHata] = useState(null);

  const fetchHesaplar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/portal-hesaplari');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Yüklenemedi');
      setHesaplar(data.hesaplar || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHesaplar(); }, [fetchHesaplar]);

  const toggleAktif = async (adminId, aktif) => {
    try {
      const res = await fetch(`/api/portal-hesaplari/${adminId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: aktif }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setHesaplar(prev => prev.map(h => h.admin?.id === adminId ? { ...h, admin: { ...h.admin, active: aktif } } : h));
    } catch (e) { alert(e.message); }
  };

  const handleSifreSifirla = async () => {
    setSifreHata(null);
    if (!yeniSifre || yeniSifre.length < 6) { setSifreHata('En az 6 karakter olmalıdır'); return; }
    setSifreSaving(true);
    try {
      const res = await fetch(`/api/portal-hesaplari/${sifreModal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ yeniSifre }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setSifreModal(null);
      setYeniSifre('');
    } catch (e) {
      setSifreHata(e.message);
    } finally {
      setSifreSaving(false);
    }
  };

  const filtered = hesaplar.filter(h => {
    const aramaOk = !arama || `${h.ad} ${h.soyad} ${h.admin?.username || ''} ${h.bilgi}`.toLowerCase().includes(arama.toLowerCase());
    const tipOk = !tip || h.tip === tip;
    return aramaOk && tipOk;
  });

  const mbSayisi = hesaplar.filter(h => h.tip === 'MB').length;
  const ykSayisi = hesaplar.filter(h => h.tip === 'YK').length;
  const aktifSayisi = hesaplar.filter(h => h.admin?.active).length;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="h-7 w-7 text-accent-600" /> Portal Hesapları
          </h1>
          <p className="mt-1 text-sm text-gray-500">Mahalle başkanı ve YK üyelerinin sistem hesapları</p>
        </div>
        <button onClick={fetchHesaplar} className="p-2 text-gray-500 hover:text-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400 transition">
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Özet */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Mahalle Başkanı', value: mbSayisi, color: 'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' },
          { label: 'YK Üyesi', value: ykSayisi, color: 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' },
          { label: 'Aktif Hesap', value: aktifSayisi, color: 'text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border px-5 py-4 ${s.color}`}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs font-medium opacity-80 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filtreler */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <input type="text" value={arama} onChange={e => setArama(e.target.value)} placeholder="Ad, soyad veya kullanıcı adı..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-500" />
        </div>
        <select value={tip} onChange={e => setTip(e.target.value)}
          className="text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-accent-500">
          <option value="">Tümü</option>
          <option value="MB">Mahalle Başkanları</option>
          <option value="YK">YK Üyeleri</option>
        </select>
      </div>

      {/* Tablo */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-600" />
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">{error}</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-100 dark:border-gray-600">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Kişi</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase hidden sm:table-cell">Tür / Görev</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Kullanıcı Adı</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase hidden md:table-cell">Son Giriş</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Durum</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filtered.map((h, i) => (
                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="font-medium text-gray-900 dark:text-white">{h.ad} {h.soyad}</div>
                    <div className="text-xs text-gray-400 sm:hidden">{h.bilgi}</div>
                  </td>
                  <td className="px-5 py-3.5 hidden sm:table-cell">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${h.tip === 'MB' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400'}`}>
                      {h.tip === 'MB' ? 'Mahalle Başkanı' : 'YK Üyesi'}
                    </span>
                    <div className="text-xs text-gray-400 mt-0.5">{h.bilgi}</div>
                  </td>
                  <td className="px-5 py-3.5">
                    {h.admin ? (
                      <span className="font-mono text-sm text-gray-900 dark:text-white">{h.admin.username}</span>
                    ) : (
                      <span className="text-xs text-red-500 italic">Hesap yok</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell text-xs text-gray-400">
                    {h.admin?.lastLogin ? new Date(h.admin.lastLogin).toLocaleString('tr-TR') : '—'}
                  </td>
                  <td className="px-5 py-3.5">
                    {h.admin ? (
                      <button
                        onClick={() => toggleAktif(h.admin.id, !h.admin.active)}
                        className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full transition ${h.admin.active ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-green-50 hover:text-green-700'}`}
                        title={h.admin.active ? 'Pasife al' : 'Aktife al'}
                      >
                        {h.admin.active ? <><CheckCircle className="h-3 w-3" /> Aktif</> : <><XCircle className="h-3 w-3" /> Pasif</>}
                      </button>
                    ) : '—'}
                  </td>
                  <td className="px-5 py-3.5">
                    {h.admin && (
                      <button
                        onClick={() => { setSifreModal({ id: h.admin.id, username: h.admin.username }); setYeniSifre(''); setSifreHata(null); setShowSifre(false); }}
                        className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-md transition"
                        title="Şifre Sıfırla"
                      >
                        <KeyRound className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">Sonuç bulunamadı</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Şifre Sıfırlama Modalı */}
      {sifreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-accent-600" /> Şifre Sıfırla
              </h3>
              <p className="text-sm text-gray-500 mt-0.5">
                <span className="font-mono font-semibold">{sifreModal.username}</span> için yeni şifre
              </p>
            </div>
            {sifreHata && <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 text-sm rounded-lg px-3 py-2">{sifreHata}</div>}
            <div className="relative">
              <input
                type={showSifre ? 'text' : 'password'}
                value={yeniSifre}
                onChange={e => setYeniSifre(e.target.value)}
                placeholder="En az 6 karakter"
                className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 pr-10 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-accent-500"
                autoFocus
              />
              <button type="button" onClick={() => setShowSifre(!showSifre)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showSifre ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setSifreModal(null)} className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                İptal
              </button>
              <button onClick={handleSifreSifirla} disabled={sifreSaving}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-accent-600 rounded-lg hover:bg-accent-700 transition disabled:opacity-60">
                {sifreSaving ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
