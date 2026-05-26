'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import { PlusIcon, PencilIcon, TrashBinIcon } from '../../icons';
import { MapPin, User, Users } from 'lucide-react';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import {
  useMahalleler,
  useMahalleBaskanlar,
  useCreateMahalle,
  useUpdateMahalle,
  useDeleteMahalle,
} from '../../hooks/useData';

const emptyMahalleForm = () => ({
  ad: '',
  aciklama: '',
  lokalYeri: '',
  baskanId: '',
  baskanKaldir: false,
});

export default function MahallelerPage() {
  const [showModal, setShowModal] = useState(false);
  const [editingMahalle, setEditingMahalle] = useState(null);
  const [formData, setFormData] = useState(emptyMahalleForm());

  const { data: mahalleler, isLoading: mahallelerLoading } = useMahalleler();
  const { data: baskanlar, isLoading: baskanlarLoading } = useMahalleBaskanlar();
  const createMahalle = useCreateMahalle();
  const updateMahalle = useUpdateMahalle();
  const deleteMahalle = useDeleteMahalle();

  const atamaSecenekleri = useMemo(() => baskanlar ?? [], [baskanlar]);

  const handleOpenModal = (mahalle = null) => {
    if (mahalle) {
      setEditingMahalle(mahalle);
      setFormData({
        ad: mahalle.ad || '',
        aciklama: mahalle.aciklama || '',
        lokalYeri: mahalle.lokalYeri || '',
        baskanId: mahalle.mahalleBaskanDetay?.id?.toString() || '',
        baskanKaldir: false,
      });
    } else {
      setEditingMahalle(null);
      setFormData(emptyMahalleForm());
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingMahalle(null);
    setFormData(emptyMahalleForm());
  };

  const buildPayload = () => {
    const { ad, aciklama, lokalYeri, baskanId, baskanKaldir } = formData;
    const payload = { ad, aciklama, lokalYeri };

    if (baskanKaldir) {
      payload.mahalleBaskanAssign = { remove: true };
    } else if (baskanId) {
      payload.mahalleBaskanAssign = { baskanId: parseInt(baskanId, 10) };
    } else if (editingMahalle?.mahalleBaskanDetay) {
      payload.mahalleBaskanAssign = { remove: true };
    }

    return payload;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = buildPayload();
      if (editingMahalle) {
        await updateMahalle.mutateAsync({ id: editingMahalle.id, ...payload });
      } else {
        await createMahalle.mutateAsync(payload);
      }
      handleCloseModal();
    } catch (error) {
      console.error('Hata:', error);
      alert(error.message || 'İşlem sırasında bir hata oluştu');
    }
  };

  const handleDelete = async (id) => {
    if (
      window.confirm(
        'Bu mahalleyi silmek istediğinizden emin misiniz? Mahalle başkanı ataması kaldırılır, kişi havuzda kalır.'
      )
    ) {
      try {
        await deleteMahalle.mutateAsync(id);
      } catch (error) {
        console.error('Hata:', error);
        alert(error.message || 'Silme işlemi başarısız oldu');
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'baskanId' && value ? { baskanKaldir: false } : {}),
    }));
  };

  const baskanEtiketi = (b) => {
    const adSoyad = `${b.ad} ${b.soyad}`;
    if (!b.mahalle) return `${adSoyad} (Atanmamış)`;
    if (editingMahalle && b.mahalleId === editingMahalle.id) {
      return `${adSoyad} (Mevcut başkan)`;
    }
    return `${adSoyad} — ${b.mahalle.ad}`;
  };

  if (mahallelerLoading || baskanlarLoading) {
    return <LoadingSkeleton />;
  }

  const havuzBos = !baskanlar?.length;

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">Mahalleler</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Mahalle bilgilerini yönetin; başkan atamasını ilçe teşkilatı havuzundan seçin
        </p>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">Mahalle Listesi</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Toplam {mahalleler?.length || 0} mahalle
            </p>
          </div>
          <Button onClick={() => handleOpenModal()}>
            <PlusIcon className="w-4 h-4 mr-2" />
            Yeni Mahalle
          </Button>
        </div>

        <div className="hidden lg:block">
          <Table>
            <TableHeader>
              <TableHeaderCell>Mahalle Adı</TableHeaderCell>
              <TableHeaderCell>Açıklama</TableHeaderCell>
              <TableHeaderCell>Lokal Yeri</TableHeaderCell>
              <TableHeaderCell>Mahalle Başkanı</TableHeaderCell>
              <TableHeaderCell>Sorumlu Üyeler</TableHeaderCell>
              <TableHeaderCell>İşlemler</TableHeaderCell>
            </TableHeader>
            <TableBody>
              {mahalleler?.map((mahalle) => (
                <TableRow key={mahalle.id}>
                  <TableCell>
                    <p className="font-medium text-gray-800 dark:text-white/90">{mahalle.ad}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{mahalle.aciklama || '-'}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{mahalle.lokalYeri || '-'}</p>
                  </TableCell>
                  <TableCell>
                    {mahalle.mahalleBaskanDetay ? (
                      <div>
                        <Badge color="brand">
                          {mahalle.mahalleBaskanDetay.ad} {mahalle.mahalleBaskanDetay.soyad}
                        </Badge>
                        {mahalle.mahalleBaskanDetay.telefon && (
                          <p className="text-xs text-gray-500 mt-1">{mahalle.mahalleBaskanDetay.telefon}</p>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500 dark:text-gray-400">Atanmamış</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {mahalle.sorumluUyeler?.map((su) => (
                        <Badge key={su.id} color="success" className="text-xs">
                          {su.uye.ad} {su.uye.soyad}
                        </Badge>
                      ))}
                      {(!mahalle.sorumluUyeler || mahalle.sorumluUyeler.length === 0) && (
                        <span className="text-sm text-gray-500 dark:text-gray-400">Yok</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleOpenModal(mahalle)} aria-label="Düzenle">
                        <PencilIcon className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(mahalle.id)} aria-label="Sil">
                        <TrashBinIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:hidden">
          {mahalleler?.map((mahalle) => (
            <div
              key={mahalle.id}
              className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex items-center justify-center w-10 h-10 bg-success-50 rounded-full dark:bg-success-500/10">
                    <MapPin className="w-5 h-5 text-success-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-white/90">{mahalle.ad}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {mahalle.aciklama || 'Açıklama yok'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => handleOpenModal(mahalle)}>
                    <PencilIcon className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(mahalle.id)}>
                    <TrashBinIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              {mahalle.mahalleBaskanDetay ? (
                <Badge color="brand">
                  Başkan: {mahalle.mahalleBaskanDetay.ad} {mahalle.mahalleBaskanDetay.soyad}
                </Badge>
              ) : (
                <p className="text-sm text-gray-500">Başkan atanmamış</p>
              )}
            </div>
          ))}
        </div>
      </Card>

      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingMahalle ? 'Mahalle Düzenle' : 'Yeni Mahalle Ekle'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white/90 uppercase tracking-wide">
              Mahalle Bilgileri
            </h3>
            <Input label="Mahalle Adı" name="ad" value={formData.ad} onChange={handleInputChange} required />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Açıklama</label>
              <textarea
                name="aciklama"
                value={formData.aciklama}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2.5 text-sm text-gray-800 focus:border-brand-500 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white/90"
                rows={3}
              />
            </div>
            <Input label="Lokal Yeri" name="lokalYeri" value={formData.lokalYeri} onChange={handleInputChange} />
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div>
              <h3 className="text-sm font-semibold text-gray-800 dark:text-white/90 uppercase tracking-wide">
                Mahalle Başkanı Ataması
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                <Link href="/admin/mahalle-baskanlari" className="text-brand-500 hover:underline">
                  İlçe Teşkilatı → Mahalle Başkanları
                </Link>
                {' '}
                havuzundan seçin. Başka mahalledeki başkan seçilirse önceki mahalleden alınır.
              </p>
            </div>

            {editingMahalle?.mahalleBaskanDetay && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="baskanKaldir"
                  checked={formData.baskanKaldir}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Başkan atamasını kaldır</span>
              </label>
            )}

            {!formData.baskanKaldir && (
              <>
                {havuzBos ? (
                  <div className="p-3 bg-accent-50 dark:bg-accent-900/20 rounded-lg">
                    <p className="text-sm text-accent-800 dark:text-accent-300">
                      Henüz havuzda başkan yok. Önce{' '}
                      <Link href="/admin/mahalle-baskanlari" className="font-medium underline">
                        Mahalle Başkanları
                      </Link>
                      {' '}
                      ekranından kişi ekleyin.
                    </p>
                  </div>
                ) : (
                  <Select
                    label="Mahalle Başkanı"
                    name="baskanId"
                    value={formData.baskanId}
                    onChange={handleInputChange}
                  >
                    <option value="">Başkan seçin (isteğe bağlı)</option>
                    {atamaSecenekleri.map((b) => (
                      <option key={b.id} value={b.id}>
                        {baskanEtiketi(b)}
                      </option>
                    ))}
                  </Select>
                )}

                {baskanlar?.some(
                  (b) => b.mahalleId && b.mahalleId !== editingMahalle?.id && String(b.id) === formData.baskanId
                ) && (
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    Bu kişi başka bir mahallede kayıtlı; kayıtla birlikte bu mahalleye taşınır.
                  </p>
                )}
              </>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={handleCloseModal}>
              İptal
            </Button>
            <Button type="submit">{editingMahalle ? 'Güncelle' : 'Kaydet'}</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
