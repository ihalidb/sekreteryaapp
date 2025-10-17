'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from '../../../components/ui/Table';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Badge from '../../../components/ui/Badge';
import { PlusIcon, PencilIcon, TrashBinIcon, ArrowRightIcon } from '../../../icons';
import { User, Briefcase, Users, ArrowLeft, Calendar, UserCheck, Phone, Mail, MapPin } from 'lucide-react';
import LoadingSkeleton from '../../../components/LoadingSkeleton';
import { useKomisyonDetay, useUyeler, useAddUyeToKomisyon, useUpdateUyeKomisyon, useRemoveUyeFromKomisyon } from '../../../hooks/useData';

export default function KomisyonDetayPage({ params }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const komisyonId = parseInt(unwrappedParams.id);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUyeKomisyon, setEditingUyeKomisyon] = useState(null);
  const [formData, setFormData] = useState({
    uyeId: '',
    gorev: ''
  });

  const { data: komisyon, isLoading: komisyonLoading } = useKomisyonDetay(komisyonId);
  const { data: uyeler, isLoading: uyelerLoading } = useUyeler();
  const addUye = useAddUyeToKomisyon();
  const updateUye = useUpdateUyeKomisyon();
  const removeUye = useRemoveUyeFromKomisyon();

  const handleBackClick = () => {
    router.back();
  };

  const handleOpenAddModal = (uyeKomisyon = null) => {
    if (uyeKomisyon) {
      setEditingUyeKomisyon(uyeKomisyon);
      setFormData({
        uyeId: uyeKomisyon.uyeId,
        gorev: uyeKomisyon.gorev || ''
      });
    } else {
      setEditingUyeKomisyon(null);
      setFormData({
        uyeId: '',
        gorev: ''
      });
    }
    setShowAddModal(true);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setEditingUyeKomisyon(null);
    setFormData({
      uyeId: '',
      gorev: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUyeKomisyon) {
        await updateUye.mutateAsync({
          komisyonId,
          uyeKomisyonId: editingUyeKomisyon.id,
          gorev: formData.gorev
        });
      } else {
        await addUye.mutateAsync({
          komisyonId,
          uyeId: parseInt(formData.uyeId),
          gorev: formData.gorev
        });
      }
      handleCloseAddModal();
    } catch (error) {
      console.error('Hata:', error);
    }
  };

  const handleRemove = async (uyeKomisyonId) => {
    if (window.confirm('Bu üyeyi komisyondan çıkarmak istediğinizden emin misiniz?')) {
      try {
        await removeUye.mutateAsync({ komisyonId, uyeKomisyonId });
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

  if (komisyonLoading || uyelerLoading) {
    return <LoadingSkeleton />;
  }

  const availableUyeler = uyeler?.filter(
    uye => !komisyon?.uyeler?.some(uk => uk.uyeId === uye.id)
  );

  return (
    <>
      <div className="mb-6">
        <div className="mb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackClick}
            aria-label="Geri"
            className="cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Geri
          </Button>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
          <Link href="/admin/komisyonlar" className="hover:text-brand-500">
            Komisyonlar
          </Link>
          <span>/</span>
          <span className="text-gray-800 dark:text-white/90">{komisyon?.ad}</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
          {komisyon?.ad}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {komisyon?.aciklama || 'Komisyon üyelerini yönetin'}
        </p>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Komisyon Üyeleri
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Toplam {komisyon?.uyeler?.length || 0} üye
            </p>
          </div>
          <Button onClick={() => handleOpenAddModal()}>
            <PlusIcon className="w-4 h-4 mr-2" />
            Üye Ekle
          </Button>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block">
          <Table>
            <TableHeader>
              <TableHeaderCell>Ad Soyad</TableHeaderCell>
              <TableHeaderCell>İlçe Görevi</TableHeaderCell>
              <TableHeaderCell>Komisyon Görevi</TableHeaderCell>
              <TableHeaderCell>İletişim</TableHeaderCell>
              <TableHeaderCell>İşlemler</TableHeaderCell>
            </TableHeader>
            <TableBody>
              {komisyon?.uyeler?.map((uyeKomisyon) => (
                <TableRow key={uyeKomisyon.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white/90">
                        {uyeKomisyon.uye.ad} {uyeKomisyon.uye.soyad}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {uyeKomisyon.uye.ilceGorev ? (
                      <Badge color="brand">
                        {uyeKomisyon.uye.ilceGorev.ad}
                      </Badge>
                    ) : (
                      <span className="text-sm text-gray-500 dark:text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {uyeKomisyon.gorev ? (
                      <Badge color="success">
                        {uyeKomisyon.gorev}
                      </Badge>
                    ) : (
                      <span className="text-sm text-gray-500 dark:text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      {uyeKomisyon.uye.telefon && (
                        <p className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {uyeKomisyon.uye.telefon}
                        </p>
                      )}
                      {uyeKomisyon.uye.email && (
                        <p className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {uyeKomisyon.uye.email}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenAddModal(uyeKomisyon)}
                      >
                        <PencilIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemove(uyeKomisyon.id)}
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
          {komisyon?.uyeler?.map((uyeKomisyon) => (
            <div
              key={uyeKomisyon.id}
              className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex items-center justify-center w-10 h-10 bg-brand-50 rounded-full dark:bg-brand-500/10">
                    <User className="w-5 h-5 text-brand-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 dark:text-white/90">
                      {uyeKomisyon.uye.ad} {uyeKomisyon.uye.soyad}
                    </h3>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {uyeKomisyon.uye.ilceGorev && (
                        <Badge color="brand">
                          {uyeKomisyon.uye.ilceGorev.ad}
                        </Badge>
                      )}
                      {uyeKomisyon.gorev && (
                        <Badge color="success">
                          {uyeKomisyon.gorev}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenAddModal(uyeKomisyon)}
                  >
                    <PencilIcon className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(uyeKomisyon.id)}
                  >
                    <TrashBinIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                {uyeKomisyon.uye.telefon && (
                  <p className="flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {uyeKomisyon.uye.telefon}
                  </p>
                )}
                {uyeKomisyon.uye.email && (
                  <p className="flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {uyeKomisyon.uye.email}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Etkinlikler Kartı */}
      <Card className="mt-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Gerçekleştirilen Etkinlikler
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Bu komisyonun katıldığı {komisyon?.etkinlikler?.length || 0} etkinlik
          </p>
        </div>

        {komisyon?.etkinlikler && komisyon.etkinlikler.length > 0 ? (
          <div className="space-y-3">
            {komisyon.etkinlikler.map((etkinlikKomisyon) => {
              const etkinlik = etkinlikKomisyon.etkinlik;
              const katilimSayisi = etkinlik.yoklamalar?.length || 0;
              const formatDate = (dateString) => {
                const date = new Date(dateString);
                return date.toLocaleDateString('tr-TR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });
              };
              
              return (
                <div
                  key={etkinlikKomisyon.id}
                  className="p-4 bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700 hover:border-brand-300 dark:hover:border-brand-600 transition-all duration-150"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="flex items-center justify-center w-10 h-10 bg-brand-50 rounded-full dark:bg-brand-500/10 flex-shrink-0">
                        <Calendar className="w-5 h-5 text-brand-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 dark:text-white/90 mb-1">
                          {etkinlik.ad}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-2">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(etkinlik.tarih)}
                          </span>
                          {etkinlik.konum && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {etkinlik.konum}
                            </span>
                          )}
                        </div>
                        {etkinlik.aciklama && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                            {etkinlik.aciklama}
                          </p>
                        )}
                      </div>
                    </div>
                    {katilimSayisi > 0 && (
                      <Badge variant="success" className="ml-3 flex-shrink-0">
                        <UserCheck className="w-3 h-3 mr-1" />
                        {katilimSayisi} Katılımcı
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">
              Bu komisyon henüz etkinlik gerçekleştirmemiş
            </p>
          </div>
        )}
      </Card>

      <Modal
        isOpen={showAddModal}
        onClose={handleCloseAddModal}
        title={editingUyeKomisyon ? 'Üye Görevini Düzenle' : 'Komisyona Üye Ekle'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {!editingUyeKomisyon && (
            <Select
              label="Üye Seçin"
              name="uyeId"
              value={formData.uyeId}
              onChange={handleInputChange}
              required
            >
              <option value="">Üye Seçin</option>
              {availableUyeler?.map((uye) => (
                <option key={uye.id} value={uye.id}>
                  {uye.ad} {uye.soyad} {uye.ilceGorev ? `(${uye.ilceGorev.ad})` : ''}
                </option>
              ))}
            </Select>
          )}

          <Input
            label="Komisyon Görevi"
            name="gorev"
            value={formData.gorev}
            onChange={handleInputChange}
            placeholder="Örn: Başkan, Üye, Sekreter"
          />

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={handleCloseAddModal}
            >
              İptal
            </Button>
            <Button type="submit">
              {editingUyeKomisyon ? 'Güncelle' : 'Ekle'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}