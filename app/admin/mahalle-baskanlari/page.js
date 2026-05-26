'use client';

import { useState } from 'react';
import Link from 'next/link';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import { PlusIcon, PencilIcon, TrashBinIcon } from '../../icons';
import { Phone, Mail, MapPin, MapPinned } from 'lucide-react';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import {
  useMahalleBaskanlar,
  useCreateMahalleBaskan,
  useUpdateMahalleBaskan,
  useDeleteMahalleBaskan,
} from '../../hooks/useData';

export default function MahalleBaskanlarPage() {
  const [showModal, setShowModal] = useState(false);
  const [editingBaskan, setEditingBaskan] = useState(null);
  const [formData, setFormData] = useState({
    ad: '',
    soyad: '',
    telefon: '',
    email: '',
    adres: '',
  });

  const { data: baskanlar, isLoading } = useMahalleBaskanlar();
  const createBaskan = useCreateMahalleBaskan();
  const updateBaskan = useUpdateMahalleBaskan();
  const deleteBaskan = useDeleteMahalleBaskan();

  const handleOpenModal = (baskan = null) => {
    if (baskan) {
      setEditingBaskan(baskan);
      setFormData({
        ad: baskan.ad || '',
        soyad: baskan.soyad || '',
        telefon: baskan.telefon || '',
        email: baskan.email || '',
        adres: baskan.adres || '',
      });
    } else {
      setEditingBaskan(null);
      setFormData({ ad: '', soyad: '', telefon: '', email: '', adres: '' });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingBaskan(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBaskan) {
        await updateBaskan.mutateAsync({
          id: editingBaskan.id,
          ...formData,
        });
      } else {
        await createBaskan.mutateAsync(formData);
      }
      handleCloseModal();
    } catch (error) {
      console.error('Hata:', error);
      alert(error.message || 'İşlem sırasında bir hata oluştu');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bu mahalle başkanını silmek istediğinizden emin misiniz?')) {
      try {
        await deleteBaskan.mutateAsync(id);
      } catch (error) {
        console.error('Hata:', error);
        alert(error.message || 'Silme işlemi başarısız oldu');
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  const atanmis = baskanlar?.filter((b) => b.mahalleId).length ?? 0;
  const havuz = baskanlar?.length ?? 0;

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">Mahalle Başkanları</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          İlçe teşkilatı mahalle başkanı havuzunu yönetin. Mahalle ataması için{' '}
          <Link href="/admin/mahalleler" className="text-brand-500 hover:underline">
            Ayarlar → Mahalleler
          </Link>
          .
        </p>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">Başkan Havuzu</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Toplam {havuz} kişi · {atanmis} mahalleye atanmış
            </p>
          </div>
          <Button onClick={() => handleOpenModal()}>
            <PlusIcon className="w-4 h-4 mr-2" />
            Yeni Başkan Ekle
          </Button>
        </div>

        <div className="hidden lg:block">
          <Table>
            <TableHeader>
              <TableHeaderCell>Ad Soyad</TableHeaderCell>
              <TableHeaderCell>Atandığı Mahalle</TableHeaderCell>
              <TableHeaderCell>İletişim</TableHeaderCell>
              <TableHeaderCell>İşlemler</TableHeaderCell>
            </TableHeader>
            <TableBody>
              {baskanlar?.map((baskan) => (
                <TableRow key={baskan.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-accent-50 rounded-full dark:bg-accent-900/20">
                        <MapPinned className="w-5 h-5 text-accent-600 dark:text-accent-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white/90">
                          {baskan.ad} {baskan.soyad}
                        </p>
                        {baskan.email && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">{baskan.email}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {baskan.mahalle ? (
                      <Badge color="success">{baskan.mahalle.ad}</Badge>
                    ) : (
                      <Badge color="warning">Atanmamış</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {baskan.telefon && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {baskan.telefon}
                        </p>
                      )}
                      {baskan.adres && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {baskan.adres}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleOpenModal(baskan)} aria-label="Düzenle">
                        <PencilIcon className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(baskan.id)} aria-label="Sil">
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
          {baskanlar?.map((baskan) => (
            <div
              key={baskan.id}
              className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white/90">
                    {baskan.ad} {baskan.soyad}
                  </h3>
                  {baskan.mahalle ? (
                    <Badge color="success" className="mt-1 text-xs">
                      {baskan.mahalle.ad}
                    </Badge>
                  ) : (
                    <Badge color="warning" className="mt-1 text-xs">
                      Atanmamış
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => handleOpenModal(baskan)}>
                    <PencilIcon className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(baskan.id)}>
                    <TrashBinIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              {baskan.telefon && (
                <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {baskan.telefon}
                </p>
              )}
              {baskan.email && (
                <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2 mt-1">
                  <Mail className="w-4 h-4" />
                  {baskan.email}
                </p>
              )}
            </div>
          ))}
        </div>

        {baskanlar?.length === 0 && (
          <div className="text-center py-12">
            <MapPinned className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">Henüz mahalle başkanı eklenmemiş</p>
          </div>
        )}
      </Card>

      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingBaskan ? 'Mahalle Başkanı Düzenle' : 'Yeni Mahalle Başkanı'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Ad" name="ad" value={formData.ad} onChange={handleInputChange} required />
            <Input label="Soyad" name="soyad" value={formData.soyad} onChange={handleInputChange} required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Telefon" name="telefon" value={formData.telefon} onChange={handleInputChange} />
            <Input label="E-posta" name="email" type="email" value={formData.email} onChange={handleInputChange} />
          </div>
          <Input label="Adres" name="adres" value={formData.adres} onChange={handleInputChange} />

          {editingBaskan?.mahalle && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Atandığı mahalle: <strong>{editingBaskan.mahalle.ad}</strong> — değiştirmek için{' '}
              <Link href="/admin/mahalleler" className="text-brand-500 hover:underline">
                Mahalleler
              </Link>
              .
            </p>
          )}

          <div className="p-3 bg-accent-50 dark:bg-accent-900/20 rounded-lg">
            <p className="text-sm text-accent-700 dark:text-accent-400">
              Mahalle ataması bu ekrandan yapılmaz. Kişiyi kaydettikten sonra Ayarlar → Mahalleler üzerinden
              mahalleye atayın.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={handleCloseModal}>
              İptal
            </Button>
            <Button type="submit">{editingBaskan ? 'Güncelle' : 'Kaydet'}</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
