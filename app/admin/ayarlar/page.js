'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Shield, Eye, EyeOff, User, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

const ROLES = ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'VIEWER'];
const ROLE_LABELS = { SUPER_ADMIN: 'Süper Admin', ADMIN: 'Admin', EDITOR: 'Editör', VIEWER: 'Görüntüleyici' };
const ROLE_COLORS = {
  SUPER_ADMIN: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-800',
  ADMIN: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 border border-blue-200 dark:border-blue-800',
  EDITOR: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800',
  VIEWER: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600',
};

const MODULES = [
  { key: 'mahalleler', label: 'Mahalleler' },
  { key: 'uyeler', label: 'Üyeler & Yönetim Kurulu' },
  { key: 'etkinlikler', label: 'Etkinlikler & Yoklama' },
  { key: 'komisyonlar', label: 'Komisyonlar & Görevler' },
];

const PERMISSION_LEVELS = [
  { value: 'none', label: 'Erişim Yok' },
  { value: 'read', label: 'Görüntüle' },
  { value: 'write', label: 'Düzenle' },
];

const inputCls = 'w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-500';
const labelCls = 'block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1';

const defaultIzinler = { mahalleler: 'none', uyeler: 'none', etkinlikler: 'none', komisyonlar: 'none' };
const defaultForm = { username: '', password: '', name: '', email: '', role: 'ADMIN', active: true, izinler: { ...defaultIzinler } };

export default function AyarlarPage() {
  const [kullanicilar, setKullanicilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchKullanicilar = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch('/api/kullanicilar');
      if (!res.ok) throw new Error((await res.json()).error || 'Kullanıcılar alınamadı');
      setKullanicilar((await res.json()).kullanicilar || []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchKullanicilar(); }, [fetchKullanicilar]);

  const openCreate = () => { setEditingId(null); setForm(defaultForm); setFormError(null); setShowPassword(false); setModalOpen(true); };
  const openEdit = (k) => {
    setEditingId(k.id);
    setForm({
      username: k.username, password: '', name: k.name || '', email: k.email || '',
      role: k.role, active: k.active,
      izinler: k.izinler ? { mahalleler: k.izinler.mahalleler, uyeler: k.izinler.uyeler, etkinlikler: k.izinler.etkinlikler, komisyonlar: k.izinler.komisyonlar } : { ...defaultIzinler },
    });
    setFormError(null); setShowPassword(false); setModalOpen(true);
  };
  const closeModal = () => { setModalOpen(false); setEditingId(null); };

  const handleSave = async () => {
    setFormError(null);
    if (!form.username.trim()) { setFormError('Kullanıcı adı zorunludur'); return; }
    if (!editingId && !form.password) { setFormError('Şifre zorunludur'); return; }
    if (form.password && form.password.length < 6) { setFormError('Şifre en az 6 karakter olmalıdır'); return; }
    setSaving(true);
    try {
      const body = { username: form.username.trim(), name: form.name.trim() || null, email: form.email.trim() || null, role: form.role, active: form.active, izinler: form.izinler };
      if (form.password) body.password = form.password;
      const res = await fetch(editingId ? `/api/kullanicilar/${editingId}` : '/api/kullanicilar', {
        method: editingId ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'İşlem başarısız');
      closeModal(); fetchKullanicilar();
    } catch (e) { setFormError(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/kullanicilar/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error((await res.json()).error || 'Silinemedi');
      setDeleteConfirm(null); fetchKullanicilar();
    } catch (e) { alert(e.message); }
  };

  const showIzinler = form.role === 'EDITOR' || form.role === 'VIEWER';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Başlık */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Shield className="h-7 w-7 text-accent-600" /> Kullanıcı Yönetimi
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Admin kullanıcılarını ve yetkilerini yönetin</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-accent-600 hover:bg-accent-700 text-white text-sm font-medium rounded-lg transition">
          <Plus className="h-4 w-4" /> Yeni Kullanıcı
        </button>
      </div>

      {/* Hata */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg px-4 py-3 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchKullanicilar} className="ml-3 text-red-500 hover:text-red-400"><RefreshCw className="h-4 w-4" /></button>
        </div>
      )}

      {/* Tablo */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-600" />
          </div>
        ) : kullanicilar.length === 0 ? (
          <div className="text-center py-16 text-gray-400 dark:text-gray-500">
            <User className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p>Henüz kullanıcı yok</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-100 dark:border-gray-600">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Kullanıcı</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Rol</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide hidden md:table-cell">Modül İzinleri</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide hidden sm:table-cell">Durum</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide hidden lg:table-cell">Son Giriş</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {kullanicilar.map((k) => (
                <tr key={k.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-accent-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                        {(k.name || k.username).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{k.name || k.username}</div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">@{k.username}</div>
                        {k.email && <div className="text-xs text-gray-400 dark:text-gray-500">{k.email}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[k.role]}`}>
                      {ROLE_LABELS[k.role]}
                    </span>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    {k.role === 'SUPER_ADMIN' || k.role === 'ADMIN' ? (
                      <span className="text-xs text-gray-400 dark:text-gray-500 italic">Tüm modüller</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {MODULES.map((m) => {
                          const perm = k.izinler?.[m.key] || 'none';
                          if (perm === 'none') return null;
                          return (
                            <span key={m.key} className={`text-xs px-2 py-0.5 rounded-full ${
                              perm === 'write'
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                            }`}>
                              {m.label.split(' ')[0]}
                            </span>
                          );
                        })}
                        {MODULES.every((m) => (k.izinler?.[m.key] || 'none') === 'none') && (
                          <span className="text-xs text-gray-400 dark:text-gray-500 italic">Erişim yok</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-4 hidden sm:table-cell">
                    {k.active ? (
                      <span className="inline-flex items-center gap-1 text-xs text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">
                        <CheckCircle className="h-3 w-3" /> Aktif
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                        <XCircle className="h-3 w-3" /> Pasif
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 hidden lg:table-cell text-xs text-gray-400 dark:text-gray-500">
                    {k.lastLogin ? new Date(k.lastLogin).toLocaleString('tr-TR') : '—'}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => openEdit(k)} className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-md transition" title="Düzenle">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => setDeleteConfirm(k)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-md transition" title="Sil">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Kullanıcı Ekleme/Düzenleme Modalı */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingId ? 'Kullanıcıyı Düzenle' : 'Yeni Kullanıcı Oluştur'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Kullanıcı bilgilerini ve yetkilerini ayarlayın</p>
            </div>

            <div className="px-6 py-5 space-y-4">
              {formError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm rounded-lg px-4 py-2">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Kullanıcı Adı *</label>
                  <input type="text" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className={inputCls} placeholder="kullanici_adi" />
                </div>
                <div>
                  <label className={labelCls}>{editingId ? 'Şifre (boş = değiştirme)' : 'Şifre *'}</label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className={`${inputCls} pr-9`} placeholder="••••••" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Ad Soyad</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} placeholder="Ad Soyad" />
                </div>
                <div>
                  <label className={labelCls}>E-posta</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} placeholder="ornek@mail.com" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Rol *</label>
                  <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className={inputCls}>
                    {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Durum</label>
                  <div className="flex items-center gap-3 pt-2">
                    <button type="button" onClick={() => setForm({ ...form, active: !form.active })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.active ? 'bg-green-500' : 'bg-gray-500 dark:bg-gray-600'}`}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.active ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                    <span className="text-sm text-gray-600 dark:text-gray-300">{form.active ? 'Aktif' : 'Pasif'}</span>
                  </div>
                </div>
              </div>

              {/* Rol açıklaması */}
              <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600 rounded-lg px-4 py-3 text-xs space-y-1">
                <div className="text-gray-600 dark:text-gray-300"><span className="font-semibold text-red-600 dark:text-red-400">Süper Admin:</span> Tüm sisteme tam erişim + kullanıcı yönetimi</div>
                <div className="text-gray-600 dark:text-gray-300"><span className="font-semibold text-blue-600 dark:text-blue-400">Admin:</span> Tüm içeriklere erişim, kullanıcı yönetemez</div>
                <div className="text-gray-600 dark:text-gray-300"><span className="font-semibold text-yellow-600 dark:text-yellow-400">Editör:</span> Belirlenen modüllerde okuma ve yazma</div>
                <div className="text-gray-600 dark:text-gray-300"><span className="font-semibold text-gray-500 dark:text-gray-400">Görüntüleyici:</span> Belirlenen modüllerde sadece görüntüleme</div>
              </div>

              {/* Modül İzinleri */}
              {showIzinler && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">Modül Bazlı İzinler</label>
                  <div className="space-y-3 border border-gray-200 dark:border-gray-600 rounded-xl p-4 bg-gray-50 dark:bg-gray-700/50">
                    {MODULES.map((m) => (
                      <div key={m.key} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{m.label}</span>
                        <div className="flex items-center gap-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-0.5">
                          {PERMISSION_LEVELS.map((p) => (
                            <button key={p.value} type="button"
                              onClick={() => setForm({ ...form, izinler: { ...form.izinler, [m.key]: p.value } })}
                              className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                                form.izinler[m.key] === p.value
                                  ? p.value === 'write' ? 'bg-green-500 text-white shadow'
                                    : p.value === 'read' ? 'bg-blue-500 text-white shadow'
                                    : 'bg-gray-300 dark:bg-gray-500 text-gray-700 dark:text-gray-200 shadow'
                                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'
                              }`}>
                              {p.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-end gap-3">
              <button onClick={closeModal} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                İptal
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-accent-600 hover:bg-accent-700 rounded-lg transition disabled:opacity-60">
                {saving ? <><div className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Kaydediliyor...</> : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Silme Onay Modalı */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Kullanıcıyı Sil</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Bu işlem geri alınamaz</p>
              </div>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-6">
              <span className="font-semibold">{deleteConfirm.name || deleteConfirm.username}</span> adlı kullanıcıyı silmek istediğinizden emin misiniz?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                İptal
              </button>
              <button onClick={() => handleDelete(deleteConfirm.id)} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition">
                Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
