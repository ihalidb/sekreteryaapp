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
import { Calendar, MapPin, Users, Briefcase, ArrowRight, Building2, Info } from 'lucide-react';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import { useEtkinlikler, useKomisyonlar, useUyeler, useCreateEtkinlik, useUpdateEtkinlik, useDeleteEtkinlik } from '../../hooks/useData';

export default function EtkinliklerPage() {
  const [showModal, setShowModal] = useState(false);
  const [editingEtkinlik, setEditingEtkinlik] = useState(null);
  const [formData, setFormData] = useState({
    ad: '',
    aciklama: '',
    tarih: '',
    konum: '',
    zorunlu: true,
    komisyonlar: [],
    ilceYonetimKuruluEkle: false
  });

  const { data: etkinlikler, isLoading } = useEtkinlikler();
  const { data: komisyonlar, isLoading: komisyonlarLoading } = useKomisyonlar();
  const { data: uyeler } = useUyeler();
  const createEtkinlik = useCreateEtkinlik();
  const updateEtkinlik = useUpdateEtkinlik();
  const deleteEtkinlik = useDeleteEtkinlik();

  const handleOpenModal = (etkinlik = null) => {
    if (etkinlik) {
      setEditingEtkinlik(etkinlik);
      const tarihObj = new Date(etkinlik.tarih);
      const formattedDate = tarihObj.toISOString().slice(0, 16);
      
      // Komisyon ID'lerini al
      const komisyonIds = etkinlik.komisyonlar?.map(ek => ek.komisyon.id) || [];
      
      // İlçe Yönetim Kurulu seçiliyse, "ilce-yonetim" değerini de ekle
      const selectedValues = [...komisyonIds];
      if (etkinlik.ilceYonetimKuruluEkle) {
        selectedValues.push('ilce-yonetim');
      }
      
      setFormData({
        ad: etkinlik.ad || '',
        aciklama: etkinlik.aciklama || '',
        tarih: formattedDate,
        konum: etkinlik.konum || '',
        zorunlu: etkinlik.zorunlu !== undefined ? etkinlik.zorunlu : true,
        komisyonlar: komisyonIds,
        ilceYonetimKuruluEkle: etkinlik.ilceYonetimKuruluEkle || false
      });
    } else {
      setEditingEtkinlik(null);
      setFormData({
        ad: '',
        aciklama: '',
        tarih: '',
        konum: '',
        zorunlu: true,
        komisyonlar: [],
        ilceYonetimKuruluEkle: false
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingEtkinlik(null);
    setFormData({
      ad: '',
      aciklama: '',
      tarih: '',
      konum: '',
      zorunlu: true,
      komisyonlar: [],
      ilceYonetimKuruluEkle: false
    });
  };

  // İlçe Yönetim Kurulu üye sayısını hesapla
  const ilceYonetimKuruluCount = uyeler?.filter(uye => 
    ['İlçe Başkanı', 'Yürütme Kurulu', 'Yönetim Kurulu'].includes(uye.ilceGorev?.ad)
  ).length || 0;

  const handleKomisyonChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    
    // "ilce-yonetim" seçeneğini kontrol et
    const ilceYonetimSecildi = selectedOptions.includes('ilce-yonetim');
    const komisyonIds = selectedOptions
      .filter(val => val !== 'ilce-yonetim' && val !== '')
      .map(val => parseInt(val));
    
    setFormData(prev => ({
      ...prev,
      komisyonlar: komisyonIds,
      ilceYonetimKuruluEkle: ilceYonetimSecildi
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEtkinlik) {
        await updateEtkinlik.mutateAsync({ id: editingEtkinlik.id, ...formData });
      } else {
        await createEtkinlik.mutateAsync(formData);
      }
      handleCloseModal();
    } catch (error) {
      console.error('Hata:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bu etkinliği silmek istediğinizden emin misiniz?')) {
      try {
        await deleteEtkinlik.mutateAsync(id);
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
          Etkinlikler
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Etkinlik bilgilerini yönetin ve yoklama alın
        </p>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Etkinlik Listesi
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Toplam {etkinlikler?.length || 0} etkinlik
            </p>
          </div>
          <Button onClick={() => handleOpenModal()}>
            <PlusIcon className="w-4 h-4 mr-2" />
            Yeni Etkinlik
          </Button>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block">
          <Table>
            <TableHeader>
              <TableHeaderCell>Etkinlik Adı</TableHeaderCell>
              <TableHeaderCell>Tarih</TableHeaderCell>
              <TableHeaderCell>Konum</TableHeaderCell>
              <TableHeaderCell>Katılımcı Grupları</TableHeaderCell>
              <TableHeaderCell>Katılımcı</TableHeaderCell>
              <TableHeaderCell>İşlemler</TableHeaderCell>
            </TableHeader>
            <TableBody>
              {etkinlikler?.map((etkinlik) => (
                <TableRow key={etkinlik.id}>
                  <TableCell>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-800 dark:text-white/90">
                          {etkinlik.ad}
                        </p>
                        {!etkinlik.zorunlu && (
                          <Badge color="gray" className="text-xs">İsteğe Bağlı</Badge>
                        )}
                      </div>
                      {etkinlik.aciklama && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {etkinlik.aciklama}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(etkinlik.tarih).toLocaleDateString('tr-TR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {etkinlik.konum || '-'}
                    </p>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {etkinlik.ilceYonetimKuruluEkle && (
                        <Badge color="brand">
                          🏛️ İlçe Yönetim Kurulu
                        </Badge>
                      )}
                      {etkinlik.komisyonlar?.map((ek) => (
                        <Badge key={ek.id} color="success">
                          {ek.komisyon.ad}
                        </Badge>
                      ))}
                      {(!etkinlik.komisyonlar || etkinlik.komisyonlar.length === 0) && !etkinlik.ilceYonetimKuruluEkle && (
                        <span className="text-sm text-gray-500 dark:text-gray-400">-</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge color="warning">
                      {etkinlik.yoklamalar?.length || 0} Kişi
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/etkinlikler/${etkinlik.id}/yoklama`}>
                        <Button variant="ghost" size="sm">
                          <ArrowRightIcon className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenModal(etkinlik)}
                      >
                        <PencilIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(etkinlik.id)}
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
          {etkinlikler?.map((etkinlik) => (
            <div
              key={etkinlik.id}
              className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex items-center justify-center w-10 h-10 bg-brand-50 rounded-full dark:bg-brand-500/10">
                    <Calendar className="w-5 h-5 text-brand-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-800 dark:text-white/90">
                        {etkinlik.ad}
                      </h3>
                      {!etkinlik.zorunlu && (
                        <Badge color="gray" className="text-xs">İsteğe Bağlı</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {etkinlik.aciklama || 'Açıklama yok'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Link href={`/admin/etkinlikler/${etkinlik.id}/yoklama`}>
                    <Button variant="ghost" size="sm">
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenModal(etkinlik)}
                  >
                    <PencilIcon className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(etkinlik.id)}
                  >
                    <TrashBinIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(etkinlik.tarih).toLocaleDateString('tr-TR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                {etkinlik.konum && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="w-4 h-4" />
                    <span>{etkinlik.konum}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <Badge color="warning">
                    {etkinlik.yoklamalar?.length || 0} Katılımcı
                  </Badge>
                </div>
                {(etkinlik.komisyonlar?.length > 0 || etkinlik.ilceYonetimKuruluEkle) && (
                  <div className="flex items-start gap-2 text-sm pt-2 border-t border-gray-200 dark:border-gray-700">
                    <Briefcase className="w-4 h-4 mt-0.5 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                    <div className="flex flex-wrap gap-1">
                      {etkinlik.ilceYonetimKuruluEkle && (
                        <Badge color="brand">
                          🏛️ İlçe Yönetim Kurulu
                        </Badge>
                      )}
                      {etkinlik.komisyonlar?.map((ek) => (
                        <Badge key={ek.id} color="success">
                          {ek.komisyon.ad}
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
        title={editingEtkinlik ? 'Etkinlik Düzenle' : 'Yeni Etkinlik Ekle'}
        size="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Etkinlik Adı"
              name="ad"
              value={formData.ad}
              onChange={handleInputChange}
              required
            />

            <Input
              label="Tarih ve Saat"
              name="tarih"
              type="datetime-local"
              value={formData.tarih}
              onChange={handleInputChange}
              required
            />
          </div>

          <Input
            label="Konum"
            name="konum"
            value={formData.konum}
            onChange={handleInputChange}
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
              rows={2}
              placeholder="Etkinlik hakkında kısa açıklama..."
            />
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="zorunlu"
                checked={formData.zorunlu}
                onChange={(e) => setFormData(prev => ({ ...prev, zorunlu: e.target.checked }))}
                className="w-4 h-4 text-brand-500 border-gray-300 rounded focus:ring-brand-500 focus:ring-2 cursor-pointer"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Zorunlu Etkinlik
              </span>
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-6">
              Zorunlu etkinlikler katılım oranı hesabında dikkate alınır
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Katılımcılar (Gruplar)
            </label>
            <select
              multiple
              size={Math.min((komisyonlar?.length || 0) + 1, 8)}
              className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-800 focus:border-brand-500 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white/90 dark:focus:border-brand-400"
              value={[
                ...(formData.ilceYonetimKuruluEkle ? ['ilce-yonetim'] : []),
                ...formData.komisyonlar.map(String)
              ]}
              onChange={handleKomisyonChange}
            >
              <option value="ilce-yonetim">
                İlçe Yönetim Kurulu - Başkan, Yürütme, YK ({ilceYonetimKuruluCount} üye)
              </option>
              {komisyonlar?.map((komisyon) => (
                <option key={komisyon.id} value={komisyon.id}>
                  {komisyon.ad} ({komisyon.uyeler?.length || 0} üye)
                </option>
              ))}
            </select>
            <div className="flex items-start gap-2 mt-2">
              <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Seçilen gruplardaki tüm üyeler otomatik eklenecek. Birden fazla seçmek için Ctrl (Cmd) tuşunu basılı tutun
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="ghost"
              onClick={handleCloseModal}
            >
              İptal
            </Button>
            <Button type="submit">
              {editingEtkinlik ? 'Güncelle' : 'Kaydet'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}