'use client';

import { useState } from 'react';
import { Plus, Edit2, Trash2, Check, X } from 'lucide-react';
import { useTalepKategoriler, useCreateTalepKategori, useUpdateTalepKategori, useDeleteTalepKategori } from '../hooks/useData';

const RENK_SECENEKLERI = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316',
  '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#64748b',
];

const defaultForm = { ad: '', aciklama: '', renk: '#6366f1' };

export default function TalepKategoriYonetimi() {
  const [formAcik, setFormAcik] = useState(false);
  const [duzenleId, setDuzenleId] = useState(null);
  const [form, setForm] = useState(defaultForm);

  const { data, isLoading } = useTalepKategoriler();
  const createKategori = useCreateTalepKategori();
  const updateKategori = useUpdateTalepKategori();
  const deleteKategori = useDeleteTalepKategori();

  const kategoriler = data?.kategoriler || [];

  const openCreate = () => { setDuzenleId(null); setForm(defaultForm); setFormAcik(true); };
  const openEdit = (k) => { setDuzenleId(k.id); setForm({ ad: k.ad, aciklama: k.aciklama || '', renk: k.renk }); setFormAcik(true); };
  const closeForm = () => { setFormAcik(false); setDuzenleId(null); };

  const handleSave = async () => {
    if (!form.ad.trim()) return;
    try {
      if (duzenleId) {
        await updateKategori.mutateAsync({ id: duzenleId, ...form });
      } else {
        await createKategori.mutateAsync({ ...form, sira: kategoriler.length });
      }
      closeForm();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) return;
    try { await deleteKategori.mutateAsync(id); } catch (e) { alert(e.message); }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Talep Kategorileri</h3>
        <button onClick={openCreate} className="flex items-center gap-1 text-xs px-3 py-1.5 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition">
          <Plus className="h-3.5 w-3.5" /> Ekle
        </button>
      </div>

      {/* Form */}
      {formAcik && (
        <div className="border border-gray-200 dark:border-gray-600 rounded-xl p-4 bg-gray-50 dark:bg-gray-700/50 space-y-3">
          <input
            type="text"
            value={form.ad}
            onChange={(e) => setForm({ ...form, ad: e.target.value })}
            placeholder="Kategori adı *"
            className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-500"
          />
          <input
            type="text"
            value={form.aciklama}
            onChange={(e) => setForm({ ...form, aciklama: e.target.value })}
            placeholder="Açıklama (opsiyonel)"
            className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-500"
          />
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Renk</p>
            <div className="flex flex-wrap gap-2">
              {RENK_SECENEKLERI.map((r) => (
                <button
                  key={r}
                  onClick={() => setForm({ ...form, renk: r })}
                  style={{ backgroundColor: r }}
                  className={`w-7 h-7 rounded-full transition ${form.renk === r ? 'ring-2 ring-offset-2 ring-offset-gray-700 ring-white' : 'opacity-80 hover:opacity-100'}`}
                />
              ))}
              <input type="color" value={form.renk} onChange={(e) => setForm({ ...form, renk: e.target.value })}
                className="w-7 h-7 rounded-full border border-gray-200 dark:border-gray-600 cursor-pointer p-0.5 bg-transparent" title="Özel renk" />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={closeForm} className="flex items-center gap-1 text-sm px-3 py-1.5 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition">
              <X className="h-3.5 w-3.5" /> İptal
            </button>
            <button onClick={handleSave} disabled={createKategori.isPending || updateKategori.isPending}
              className="flex items-center gap-1 text-sm px-3 py-1.5 bg-accent-600 text-white rounded-lg hover:bg-accent-700 disabled:opacity-60 transition">
              <Check className="h-3.5 w-3.5" /> Kaydet
            </button>
          </div>
        </div>
      )}

      {/* Liste */}
      {isLoading ? (
        <div className="text-sm text-gray-400 py-2">Yükleniyor...</div>
      ) : kategoriler.length === 0 ? (
        <div className="text-sm text-gray-400 dark:text-gray-500 py-2 italic">Henüz kategori yok</div>
      ) : (
        <div className="space-y-2">
          {kategoriler.map((k) => (
            <div key={k.id} className="flex items-center justify-between px-3 py-2.5 bg-white dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: k.renk }} />
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{k.ad}</p>
                  {k.aciklama && <p className="text-xs text-gray-400 dark:text-gray-500">{k.aciklama}</p>}
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(k)} className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 dark:hover:bg-blue-500/20 rounded transition">
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => handleDelete(k.id)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 dark:hover:bg-red-500/20 rounded transition">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
