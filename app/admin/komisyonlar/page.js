'use client';

import { useState } from 'react';
import Link from 'next/link';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import { PlusIcon, PencilIcon, TrashBinIcon, ArrowRightIcon } from '../../icons';
import { Briefcase, Users, ArrowRight, Eye } from 'lucide-react';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import { useKomisyonlar, useCreateKomisyon, useUpdateKomisyon, useDeleteKomisyon } from '../../hooks/useData';
import KomisyonDetayModal from '../../components/KomisyonDetayModal';

export default function KomisyonlarPage() {
  const [showModal, setShowModal] = useState(false);
  const [showDetayModal, setShowDetayModal] = useState(false);
  const [selectedKomisyonId, setSelectedKomisyonId] = useState(null);
  const [editingKomisyon, setEditingKomisyon] = useState(null);
  const [formData, setFormData] = useState({
    ad: '',
    aciklama: ''
  });

  const { data: komisyonlar, isLoading: komisyonlarLoading } = useKomisyonlar();
  const createKomisyon = useCreateKomisyon();
  const updateKomisyon = useUpdateKomisyon();
  const deleteKomisyon = useDeleteKomisyon();

  const handleOpenDetayModal = (komisyonId) => {
    setSelectedKomisyonId(komisyonId);
    setShowDetayModal(true);
  };

  const handleCloseDetayModal = () => {
    setShowDetayModal(false);
    setSelectedKomisyonId(null);
  };

  const handleOpenModal = (komisyon = null) => {
    if (komisyon) {
      setEditingKomisyon(komisyon);
      setFormData({
        ad: komisyon.ad || '',
        aciklama: komisyon.aciklama || ''
      });
    } else {
      setEditingKomisyon(null);
      setFormData({
        ad: '',
        aciklama: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingKomisyon(null);
    setFormData({
      ad: '',
      aciklama: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingKomisyon) {
        await updateKomisyon.mutateAsync({ id: editingKomisyon.id, ...formData });
      } else {
        await createKomisyon.mutateAsync(formData);
      }
      handleCloseModal();
    } catch (error) {
      console.error('Hata:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bu komisyonu silmek istediğinizden emin misiniz?')) {
      try {
        await deleteKomisyon.mutateAsync(id);
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

  if (komisyonlarLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
          Komisyonlar
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Komisyon bilgilerini yönetin
        </p>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Komisyon Listesi
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Toplam {komisyonlar?.length || 0} komisyon
            </p>
          </div>
          <Button onClick={() => handleOpenModal()}>
            <PlusIcon className="w-4 h-4 mr-2" />
            Yeni Komisyon
          </Button>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block">
          <Table>
            <TableHeader>
              <TableHeaderCell>Komisyon Adı</TableHeaderCell>
              <TableHeaderCell>Açıklama</TableHeaderCell>
              <TableHeaderCell>Üye Sayısı</TableHeaderCell>
              <TableHeaderCell>İşlemler</TableHeaderCell>
            </TableHeader>
            <TableBody>
              {komisyonlar?.map((komisyon) => (
                <TableRow 
                  key={komisyon.id}
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  onClick={() => handleOpenDetayModal(komisyon.id)}
                >
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white/90">
                        {komisyon.ad}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {komisyon.aciklama || '-'}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge color="brand">
                      {komisyon.uyeler?.length || 0} Üye
                    </Badge>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/komisyonlar/${komisyon.id}`}>
                        <Button variant="ghost" size="sm" title="Üye Yönetimi">
                          <ArrowRightIcon className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenModal(komisyon)}
                        title="Düzenle"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(komisyon.id)}
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

        {/* Mobile Card View */}
        <div className="grid grid-cols-1 gap-4 lg:hidden">
          {komisyonlar?.map((komisyon) => (
            <div
              key={komisyon.id}
              className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 hover:shadow-md transition-all duration-150 cursor-pointer hover:border-brand-300 dark:hover:border-brand-600"
              onClick={() => handleOpenDetayModal(komisyon.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex items-center justify-center w-10 h-10 bg-brand-50 rounded-full dark:bg-brand-500/10">
                    <Briefcase className="w-5 h-5 text-brand-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 dark:text-white/90">
                      {komisyon.ad}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {komisyon.aciklama || 'Açıklama yok'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <Link href={`/admin/komisyonlar/${komisyon.id}`}>
                    <Button variant="ghost" size="sm" title="Üye Yönetimi">
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenModal(komisyon)}
                    title="Düzenle"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(komisyon.id)}
                    title="Sil"
                  >
                    <TrashBinIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <Users className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <Badge color="brand">
                  {komisyon.uyeler?.length || 0} Üye
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingKomisyon ? 'Komisyon Düzenle' : 'Yeni Komisyon Ekle'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Komisyon Adı"
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

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={handleCloseModal}
            >
              İptal
            </Button>
            <Button type="submit">
              {editingKomisyon ? 'Güncelle' : 'Kaydet'}
            </Button>
          </div>
        </form>
      </Modal>

      <KomisyonDetayModal
        komisyonId={selectedKomisyonId}
        isOpen={showDetayModal}
        onClose={handleCloseDetayModal}
      />
    </>
  );
}