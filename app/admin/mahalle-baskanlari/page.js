'use client';

import { useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import { PlusIcon, PencilIcon, TrashBinIcon } from '../../icons';
import { User, Phone, Mail, MapPin, MapPinned } from 'lucide-react';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import {
  useMahalleBaskanlar,
  useMahalleler,
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
    mahalleId: '',
    telefon: '',
    email: '',
    adres: '',
  });

  const { data: baskanlar, isLoading: baskanlariLoading } = useMahalleBaskanlar();
  const { data: mahalleler, isLoading: mahallelerLoading } = useMahalleler();
  const createBaskan = useCreateMahalleBaskan();
  const updateBaskan = useUpdateMahalleBaskan();
  const deleteBaskan = useDeleteMahalleBaskan();

  const handleOpenModal = (baskan = null) => {
    if (baskan) {
      setEditingBaskan(baskan);
      setFormData({
        ad: baskan.ad || '',
        soyad: baskan.soyad || '',
        mahalleId: baskan.mahalleId || '',
        telefon: baskan.telefon || '',
        email: baskan.email || '',
        adres: baskan.adres || '',
      });
    } else {
      setEditingBaskan(null);
      setFormData({
        ad: '',
        soyad: '',
        mahalleId: '',
        telefon: '',
        email: '',
        adres: '',
      });
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
        await updateBaskan.mutateAsync({ id: editingBaskan.id, ...formData });
      } else {
        await createBaskan.mutateAsync(formData);
      }
      handleCloseModal();
    } catch (error) {
      console.error('Hata:', error);
      const errorMessage = error.message || 'İşlem sırasında bir hata oluştu';
      alert(errorMessage);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bu mahalle başkanını silmek istediğinizden emin misiniz?')) {
      try {
        await deleteBaskan.mutateAsync(id);
      } catch (error) {
        console.error('Hata:', error);
        alert('Silme işlemi başarısız oldu');
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Başkanı olmayan mahalleler
  const availableMahalleler = mahalleler?.filter((mahalle) => {
    // Düzenleme modundaysa, mevcut başkanın mahallesini de göster
    if (editingBaskan && mahalle.id === editingBaskan.mahalleId) {
      return true;
    }
    // Başka bir başkanı olmayan mahalleleri göster
    return !baskanlar?.some((baskan) => baskan.mahalleId === mahalle.id);
  });

  if (baskanlariLoading || mahallelerLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">Mahalle Başkanları</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Mahalle başkanlarını yönetin</p>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">Başkan Listesi</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Toplam {baskanlar?.length || 0} mahalle başkanı
            </p>
          </div>
          <Button onClick={() => handleOpenModal()}>
            <PlusIcon className="w-4 h-4 mr-2" />
            Yeni Başkan
          </Button>
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block">
          <Table>
            <TableHeader>
              <TableHeaderCell>Ad Soyad</TableHeaderCell>
              <TableHeaderCell>Mahalle</TableHeaderCell>
              <TableHeaderCell>İletişim</TableHeaderCell>
              <TableHeaderCell>İşlemler</TableHeaderCell>
            </TableHeader>
            <TableBody>
              {baskanlar?.map((baskan) => (
                <TableRow key={baskan.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-blue-50 rounded-full dark:bg-blue-900/20">
                        <MapPinned className="w-5 h-5 text-blue-600 dark:text-blue-400" />
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
                    <Badge color="success" className="font-medium">
                      {baskan.mahalle?.ad}
                    </Badge>
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenModal(baskan)}
                        title="Düzenle"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(baskan.id)}
                        title="Sil"
                      >
                        <TrashBinIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Cards */}
        <div className="grid grid-cols-1 gap-4 lg:hidden">
          {baskanlar?.map((baskan) => (
            <div
              key={baskan.id}
              className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-50 rounded-full dark:bg-blue-900/20">
                    <MapPinned className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-white/90">
                      {baskan.ad} {baskan.soyad}
                    </h3>
                    <Badge color="success" className="mt-1 text-xs">
                      {baskan.mahalle?.ad}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenModal(baskan)}
                    title="Düzenle"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(baskan.id)}
                    title="Sil"
                  >
                    <TrashBinIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                {baskan.telefon && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Phone className="w-4 h-4" />
                    <span>{baskan.telefon}</span>
                  </div>
                )}
                {baskan.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Mail className="w-4 h-4" />
                    <span>{baskan.email}</span>
                  </div>
                )}
                {baskan.adres && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="w-4 h-4" />
                    <span>{baskan.adres}</span>
                  </div>
                )}
              </div>
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
        title={editingBaskan ? 'Mahalle Başkanı Düzenle' : 'Yeni Mahalle Başkanı Ekle'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Ad" name="ad" value={formData.ad} onChange={handleInputChange} required />
            <Input
              label="Soyad"
              name="soyad"
              value={formData.soyad}
              onChange={handleInputChange}
              required
            />
          </div>

          <Select
            label="Mahalle"
            name="mahalleId"
            value={formData.mahalleId}
            onChange={handleInputChange}
            required
          >
            <option value="">Mahalle Seçin</option>
            {availableMahalleler?.map((mahalle) => (
              <option key={mahalle.id} value={mahalle.id}>
                {mahalle.ad}
              </option>
            ))}
          </Select>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Telefon"
              name="telefon"
              value={formData.telefon}
              onChange={handleInputChange}
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
            />
          </div>

          <Input label="Adres" name="adres" value={formData.adres} onChange={handleInputChange} />

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

