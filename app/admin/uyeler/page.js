'use client';

import { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import { PlusIcon, PencilIcon, TrashBinIcon } from '../../icons';
import { User, Phone, Mail, MapPin, Briefcase, Users, Eye } from 'lucide-react';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import { useUyeler, useMahalleler, useIlceGorevler, useCreateUye, useUpdateUye, useDeleteUye } from '../../hooks/useData';
import UyeDetayModal from '../../components/UyeDetayModal';

export default function UyelerPage() {
  const [showModal, setShowModal] = useState(false);
  const [showDetayModal, setShowDetayModal] = useState(false);
  const [selectedUyeId, setSelectedUyeId] = useState(null);
  const [editingUye, setEditingUye] = useState(null);
  const [formData, setFormData] = useState({
    ad: '',
    soyad: '',
    telefon: '',
    email: '',
    adres: '',
    ilceGorevId: '',
    mahalleler: []
  });

  const { data: uyeler, isLoading: uyelerLoading } = useUyeler();
  const { data: mahalleler, isLoading: mahallelerLoading } = useMahalleler();
  const { data: ilceGorevler, isLoading: ilceGorevlerLoading } = useIlceGorevler();
  const createUye = useCreateUye();
  const updateUye = useUpdateUye();
  const deleteUye = useDeleteUye();

  const handleOpenDetayModal = (uyeId) => {
    setSelectedUyeId(uyeId);
    setShowDetayModal(true);
  };

  const handleCloseDetayModal = () => {
    setShowDetayModal(false);
    setSelectedUyeId(null);
  };

  const handleOpenModal = (uye = null) => {
    if (uye) {
      setEditingUye(uye);
      setFormData({
        ad: uye.ad || '',
        soyad: uye.soyad || '',
        telefon: uye.telefon || '',
        email: uye.email || '',
        adres: uye.adres || '',
        ilceGorevId: uye.ilceGorevId || '',
        mahalleler: uye.sorumluMahalleler?.map(sm => sm.mahalle.id) || []
      });
    } else {
      setEditingUye(null);
      setFormData({
        ad: '',
        soyad: '',
        telefon: '',
        email: '',
        adres: '',
        ilceGorevId: '',
        mahalleler: []
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUye(null);
    setFormData({
      ad: '',
      soyad: '',
      telefon: '',
      email: '',
      adres: '',
      ilceGorevId: '',
      mahalleler: []
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUye) {
        await updateUye.mutateAsync({ id: editingUye.id, ...formData });
      } else {
        await createUye.mutateAsync(formData);
      }
      handleCloseModal();
    } catch (error) {
      console.error('Hata:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bu üyeyi silmek istediğinizden emin misiniz?')) {
      try {
        await deleteUye.mutateAsync(id);
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

  const handleMahalleChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => parseInt(option.value));
    setFormData(prev => ({
      ...prev,
      mahalleler: selectedOptions
    }));
  };


  // Custom sorting for members
  const sortedUyeler = uyeler ? [...uyeler].sort((a, b) => {
    const aGorev = a.ilceGorev?.ad || '';
    const bGorev = b.ilceGorev?.ad || '';
    
    // İlçe Başkanı first
    if (aGorev === 'İlçe Başkanı' && bGorev !== 'İlçe Başkanı') return -1;
    if (bGorev === 'İlçe Başkanı' && aGorev !== 'İlçe Başkanı') return 1;
    
    // Then Yürütme Kurulu
    if (aGorev === 'Yürütme Kurulu' && bGorev !== 'Yürütme Kurulu' && bGorev !== 'İlçe Başkanı') return -1;
    if (bGorev === 'Yürütme Kurulu' && aGorev !== 'Yürütme Kurulu' && aGorev !== 'İlçe Başkanı') return 1;
    
    // Then Yönetim Kurulu
    if (aGorev === 'Yönetim Kurulu' && bGorev !== 'Yönetim Kurulu' && bGorev !== 'İlçe Başkanı' && bGorev !== 'Yürütme Kurulu') return -1;
    if (bGorev === 'Yönetim Kurulu' && aGorev !== 'Yönetim Kurulu' && aGorev !== 'İlçe Başkanı' && aGorev !== 'Yürütme Kurulu') return 1;
    
    // Alphabetical by name
    const aName = `${a.ad} ${a.soyad}`.toLowerCase();
    const bName = `${b.ad} ${b.soyad}`.toLowerCase();
    return aName.localeCompare(bName);
  }) : [];

  if (uyelerLoading || mahallelerLoading || ilceGorevlerLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
          Üyeler
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Üye bilgilerini yönetin
        </p>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Üye Listesi
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Toplam {uyeler?.length || 0} üye
            </p>
          </div>
          <Button onClick={() => handleOpenModal()}>
            <PlusIcon className="w-4 h-4 mr-2" />
            Yeni Üye
          </Button>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block">
          <Table>
            <TableHeader>
              <TableHeaderCell>Ad Soyad</TableHeaderCell>
              <TableHeaderCell>İletişim</TableHeaderCell>
              <TableHeaderCell>İlçe Görevi</TableHeaderCell>
              <TableHeaderCell>Sorumlu Mahalleler</TableHeaderCell>
              <TableHeaderCell>İşlemler</TableHeaderCell>
            </TableHeader>
            <TableBody>
              {sortedUyeler.map((uye) => (
                <TableRow 
                  key={uye.id}
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  onClick={() => handleOpenDetayModal(uye.id)}
                >
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white/90">
                        {uye.ad} {uye.soyad}
                      </p>
                      {uye.email && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {uye.email}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      {uye.telefon && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {uye.telefon}
                        </p>
                      )}
                      {uye.adres && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {uye.adres}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {uye.ilceGorev ? (
                      <Badge color="brand">
                        {uye.ilceGorev.ad}
                      </Badge>
                    ) : (
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Atanmamış
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {uye.sorumluMahalleler?.map((sm) => (
                        <Badge key={sm.id} color="success" className="text-xs">
                          {sm.mahalle.ad}
                        </Badge>
                      ))}
                      {(!uye.sorumluMahalleler || uye.sorumluMahalleler.length === 0) && (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Yok
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenModal(uye)}
                        title="Düzenle"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(uye.id)}
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
          {sortedUyeler.map((uye) => (
            <div
              key={uye.id}
              className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 hover:shadow-md transition-all cursor-pointer hover:border-brand-300 dark:hover:border-brand-600"
              onClick={() => handleOpenDetayModal(uye.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-brand-50 rounded-full dark:bg-brand-500/10">
                    <User className="w-5 h-5 text-brand-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-white/90">
                      {uye.ad} {uye.soyad}
                    </h3>
                    {uye.ilceGorev && (
                      <Badge color="brand" className="mt-1">
                        {uye.ilceGorev.ad}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenModal(uye)}
                    title="Düzenle"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(uye.id)}
                    title="Sil"
                  >
                    <TrashBinIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                {uye.telefon && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Phone className="w-4 h-4" />
                    <span>{uye.telefon}</span>
                  </div>
                )}
                {uye.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{uye.email}</span>
                  </div>
                )}
                {uye.sorumluMahalleler && uye.sorumluMahalleler.length > 0 && (
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="w-4 h-4 mt-0.5 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                    <div className="flex flex-wrap gap-1">
                      {uye.sorumluMahalleler.map((sm) => (
                        <Badge key={sm.id} color="success">
                          {sm.mahalle.ad}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {uye.komisyonlar && uye.komisyonlar.length > 0 && (
                  <div className="flex items-start gap-2 text-sm">
                    <Briefcase className="w-4 h-4 mt-0.5 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                    <div className="flex flex-wrap gap-1">
                      {uye.komisyonlar.map((uk) => (
                        <Badge key={uk.id} color="warning">
                          {uk.komisyon.ad}
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
        title={editingUye ? 'Üye Düzenle' : 'Yeni Üye Ekle'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Ad"
              name="ad"
              value={formData.ad}
              onChange={handleInputChange}
              required
            />
            <Input
              label="Soyad"
              name="soyad"
              value={formData.soyad}
              onChange={handleInputChange}
              required
            />
          </div>

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

          <Input
            label="Adres"
            name="adres"
            value={formData.adres}
            onChange={handleInputChange}
          />

          <Select
            label="İlçe Görevi"
            name="ilceGorevId"
            value={formData.ilceGorevId}
            onChange={handleInputChange}
          >
            <option value="">Görev Seçin</option>
            {ilceGorevler?.map((gorev) => (
              <option key={gorev.id} value={gorev.id}>
                {gorev.ad}
              </option>
            ))}
          </Select>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sorumlu Mahalleler
            </label>
            <select
              multiple
              className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2.5 text-sm text-gray-800 focus:border-brand-500 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white/90 dark:focus:border-brand-400"
              value={formData.mahalleler}
              onChange={handleMahalleChange}
            >
              {mahalleler?.map((mahalle) => (
                <option key={mahalle.id} value={mahalle.id}>
                  {mahalle.ad}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Birden fazla mahalle seçmek için Ctrl (Cmd) tuşunu basılı tutun
            </p>
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
              {editingUye ? 'Güncelle' : 'Kaydet'}
            </Button>
          </div>
        </form>
      </Modal>

      <UyeDetayModal
        uyeId={selectedUyeId}
        isOpen={showDetayModal}
        onClose={handleCloseDetayModal}
      />
    </>
  );
}