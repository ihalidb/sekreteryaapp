'use client';

import { useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import { PlusIcon, PencilIcon, TrashBinIcon } from '../../icons';
import { Briefcase, Users, Hash } from 'lucide-react';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import { useIlceGorevler, useCreateIlceGorev, useUpdateIlceGorev, useDeleteIlceGorev, useSeedIlceGorevler } from '../../hooks/useData';

export default function IlceGorevlerPage() {
  const [showModal, setShowModal] = useState(false);
  const [editingGorev, setEditingGorev] = useState(null);
  const [formData, setFormData] = useState({
    ad: '',
    aciklama: '',
    sira: ''
  });

  const { data: gorevler, isLoading } = useIlceGorevler();
  const createGorev = useCreateIlceGorev();
  const updateGorev = useUpdateIlceGorev();
  const deleteGorev = useDeleteIlceGorev();
  const seedGorevler = useSeedIlceGorevler();

  const handleOpenModal = (gorev = null) => {
    if (gorev) {
      setEditingGorev(gorev);
      setFormData({
        ad: gorev.ad || '',
        aciklama: gorev.aciklama || '',
        sira: gorev.sira || ''
      });
    } else {
      setEditingGorev(null);
      setFormData({
        ad: '',
        aciklama: '',
        sira: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingGorev(null);
    setFormData({
      ad: '',
      aciklama: '',
      sira: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        ...formData,
        sira: formData.sira ? parseInt(formData.sira) : null
      };
      
      if (editingGorev) {
        await updateGorev.mutateAsync({ id: editingGorev.id, ...dataToSend });
      } else {
        await createGorev.mutateAsync(dataToSend);
      }
      handleCloseModal();
    } catch (error) {
      console.error('Hata:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bu görevi silmek istediğinizden emin misiniz?')) {
      try {
        await deleteGorev.mutateAsync(id);
      } catch (error) {
        console.error('Hata:', error);
      }
    }
  };

  const handleSeed = async () => {
    if (window.confirm('Varsayılan görevleri yüklemek istediğinizden emin misiniz?')) {
      try {
        await seedGorevler.mutateAsync();
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

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
          İlçe Görevleri
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          İlçe görev tanımlarını yönetin
        </p>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Görev Listesi
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Toplam {gorevler?.length || 0} görev
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={handleSeed}>
              Varsayılan Görevleri Yükle
            </Button>
            <Button onClick={() => handleOpenModal()}>
              <PlusIcon className="w-4 h-4 mr-2" />
              Yeni Görev
            </Button>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block">
          <Table>
            <TableHeader>
              <TableHeaderCell>Sıra</TableHeaderCell>
              <TableHeaderCell>Görev Adı</TableHeaderCell>
              <TableHeaderCell>Açıklama</TableHeaderCell>
              <TableHeaderCell>Üye Sayısı</TableHeaderCell>
              <TableHeaderCell>İşlemler</TableHeaderCell>
            </TableHeader>
            <TableBody>
              {gorevler?.map((gorev) => (
                <TableRow key={gorev.id}>
                  <TableCell>
                    <Badge color="brand">
                      {gorev.sira || '-'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium text-gray-800 dark:text-white/90">
                      {gorev.ad}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {gorev.aciklama || '-'}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge color="success">
                      {gorev.uyeler?.length || 0} Üye
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenModal(gorev)}
                      >
                        <PencilIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(gorev.id)}
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
          {gorevler?.map((gorev) => (
            <div
              key={gorev.id}
              className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex items-center justify-center w-10 h-10 bg-brand-50 rounded-full dark:bg-brand-500/10">
                    <Briefcase className="w-5 h-5 text-brand-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge color="brand">
                        <Hash className="w-3 h-3 inline" />
                        {gorev.sira}
                      </Badge>
                      <h3 className="font-semibold text-gray-800 dark:text-white/90">
                        {gorev.ad}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {gorev.aciklama || 'Açıklama yok'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenModal(gorev)}
                  >
                    <PencilIcon className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(gorev.id)}
                  >
                    <TrashBinIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <Users className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <Badge color="success">
                  {gorev.uyeler?.length || 0} Üye
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingGorev ? 'Görev Düzenle' : 'Yeni Görev Ekle'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Görev Adı"
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
            label="Sıra"
            name="sira"
            type="number"
            value={formData.sira}
            onChange={handleInputChange}
          />

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={handleCloseModal}
            >
              İptal
            </Button>
            <Button type="submit">
              {editingGorev ? 'Güncelle' : 'Kaydet'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}