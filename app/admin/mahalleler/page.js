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
import { MapPin, User, Users } from 'lucide-react';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import { useMahalleler, useUyeler, useCreateMahalle, useUpdateMahalle, useDeleteMahalle } from '../../hooks/useData';

export default function MahallelerPage() {
  const [showModal, setShowModal] = useState(false);
  const [editingMahalle, setEditingMahalle] = useState(null);
  const [formData, setFormData] = useState({
    ad: '',
    aciklama: '',
    lokalYeri: '',
    mahalleBaskanId: ''
  });

  const { data: mahalleler, isLoading: mahallelerLoading } = useMahalleler();
  const { data: uyeler, isLoading: uyelerLoading } = useUyeler();
  const createMahalle = useCreateMahalle();
  const updateMahalle = useUpdateMahalle();
  const deleteMahalle = useDeleteMahalle();

  const handleOpenModal = (mahalle = null) => {
    if (mahalle) {
      setEditingMahalle(mahalle);
      setFormData({
        ad: mahalle.ad || '',
        aciklama: mahalle.aciklama || '',
        lokalYeri: mahalle.lokalYeri || '',
        mahalleBaskanId: mahalle.mahalleBaskanId || ''
      });
    } else {
      setEditingMahalle(null);
      setFormData({
        ad: '',
        aciklama: '',
        lokalYeri: '',
        mahalleBaskanId: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingMahalle(null);
    setFormData({
      ad: '',
      aciklama: '',
      lokalYeri: '',
      mahalleBaskanId: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingMahalle) {
        await updateMahalle.mutateAsync({ id: editingMahalle.id, ...formData });
      } else {
        await createMahalle.mutateAsync(formData);
      }
      handleCloseModal();
    } catch (error) {
      console.error('Hata:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bu mahalleyi silmek istediğinizden emin misiniz?')) {
      try {
        await deleteMahalle.mutateAsync(id);
      } catch (error) {
        console.error('Hata:', error);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (mahallelerLoading || uyelerLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
          Mahalleler
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Mahalle bilgilerini yönetin
        </p>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Mahalle Listesi
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Toplam {mahalleler?.length || 0} mahalle
            </p>
          </div>
          <Button onClick={() => handleOpenModal()}>
            <PlusIcon className="w-4 h-4 mr-2" />
            Yeni Mahalle
          </Button>
        </div>

        {/* Desktop Table View */}
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
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white/90">
                        {mahalle.ad}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {mahalle.aciklama || '-'}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {mahalle.lokalYeri || '-'}
                    </p>
                  </TableCell>
                  <TableCell>
                    {mahalle.mahalleBaskan ? (
                      <Badge color="brand">
                        {mahalle.mahalleBaskan.ad} {mahalle.mahalleBaskan.soyad}
                      </Badge>
                    ) : (
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Atanmamış
                      </span>
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
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Yok
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenModal(mahalle)}
                      >
                        <PencilIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(mahalle.id)}
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

        {/* Mobile Card View */}
        <div className="grid grid-cols-1 gap-4 lg:hidden">
          {mahalleler?.map((mahalle) => (
            <div
              key={mahalle.id}
              className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex items-center justify-center w-10 h-10 bg-success-50 rounded-full dark:bg-success-500/10">
                    <MapPin className="w-5 h-5 text-success-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 dark:text-white/90">
                      {mahalle.ad}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {mahalle.aciklama || 'Açıklama yok'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenModal(mahalle)}
                  >
                    <PencilIcon className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(mahalle.id)}
                  >
                    <TrashBinIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                {mahalle.lokalYeri && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="w-4 h-4" />
                    <span>{mahalle.lokalYeri}</span>
                  </div>
                )}
                {mahalle.mahalleBaskan && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <Badge color="brand">
                      Başkan: {mahalle.mahalleBaskan.ad} {mahalle.mahalleBaskan.soyad}
                    </Badge>
                  </div>
                )}
                {mahalle.sorumluUyeler && mahalle.sorumluUyeler.length > 0 && (
                  <div className="flex items-start gap-2 text-sm">
                    <Users className="w-4 h-4 mt-0.5 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                    <div className="flex flex-wrap gap-1">
                      {mahalle.sorumluUyeler.map((su) => (
                        <Badge key={su.id} color="success">
                          {su.uye.ad} {su.uye.soyad}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Mahalle Adı"
            name="ad"
            value={formData.ad}
            onChange={handleInputChange}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Açıklama
            </label>
            <textarea
              name="aciklama"
              value={formData.aciklama}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-400"
              rows={3}
            />
          </div>

          <Input
            label="Lokal Yeri"
            name="lokalYeri"
            value={formData.lokalYeri}
            onChange={handleInputChange}
          />

          <Select
            label="Mahalle Başkanı"
            name="mahalleBaskanId"
            value={formData.mahalleBaskanId}
            onChange={handleInputChange}
          >
            <option value="">Başkan Seçin</option>
            {uyeler?.map((uye) => (
              <option key={uye.id} value={uye.id}>
                {uye.ad} {uye.soyad}
              </option>
            ))}
          </Select>

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={handleCloseModal}
            >
              İptal
            </Button>
            <Button type="submit">
              {editingMahalle ? 'Güncelle' : 'Kaydet'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}