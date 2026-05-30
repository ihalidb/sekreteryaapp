'use client';

import { useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import { PlusIcon, PencilIcon, TrashBinIcon } from '../../icons';
import { User, Phone, Mail, MapPin, Users2, Eye, EyeOff } from 'lucide-react';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import {
  useYonetimKurulu,
  useIlceGorevler,
  useMahalleler,
  useCreateYonetimKuruluUyesi,
  useUpdateYonetimKuruluUyesi,
  useDeleteYonetimKuruluUyesi,
} from '../../hooks/useData';
import Select from '../../components/ui/Select';

export default function YonetimKuruluPage() {
  const [showModal, setShowModal] = useState(false);
  const [editingUye, setEditingUye] = useState(null);
  const [showSifre, setShowSifre] = useState(false);
  const [olusturulanKullanici, setOlusturulanKullanici] = useState(null);
  const [formData, setFormData] = useState({
    ad: '', soyad: '', ilceGorevId: '', telefon: '', email: '',
    adres: '', sira: 0, sorumluMahalleler: [], sifre: '',
  });

  const { data: uyeler, isLoading } = useYonetimKurulu();
  const { data: ilceGorevler, isLoading: ilceGorevlerLoading } = useIlceGorevler();
  const { data: mahalleler, isLoading: mahallelerLoading } = useMahalleler();
  const createUye = useCreateYonetimKuruluUyesi();
  const updateUye = useUpdateYonetimKuruluUyesi();
  const deleteUye = useDeleteYonetimKuruluUyesi();

  const handleOpenModal = (uye = null) => {
    if (uye) {
      setEditingUye(uye);
      setFormData({
        ad: uye.ad || '',
        soyad: uye.soyad || '',
        ilceGorevId: uye.ilceGorevId || '',
        telefon: uye.telefon || '',
        email: uye.email || '',
        adres: uye.adres || '',
        sira: uye.sira || 0,
        sorumluMahalleler: uye.sorumluMahalleler?.map(sm => sm.mahalleId) || [],
      });
    } else {
      setEditingUye(null);
      setFormData({ ad: '', soyad: '', ilceGorevId: '', telefon: '', email: '', adres: '', sira: 0, sorumluMahalleler: [], sifre: '', yeniSifre: '' });
    }
    setOlusturulanKullanici(null);
    setShowSifre(false);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUye(null);
    setFormData({
      ad: '',
      soyad: '',
      ilceGorevId: '',
      telefon: '',
      email: '',
      adres: '',
      sira: 0,
      sorumluMahalleler: [],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUye) {
        await updateUye.mutateAsync({ id: editingUye.id, ...formData, yeniSifre: formData.yeniSifre || undefined });
        handleCloseModal();
      } else {
        const result = await createUye.mutateAsync(formData);
        if (result?._username) { setOlusturulanKullanici(result._username); return; }
        handleCloseModal();
      }
    } catch (error) {
      console.error('Hata:', error);
      alert('İşlem sırasında bir hata oluştu');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bu üyeyi silmek istediğinizden emin misiniz?')) {
      try {
        await deleteUye.mutateAsync(id);
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

  if (isLoading || ilceGorevlerLoading || mahallelerLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">Yönetim Kurulu Üyeleri</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">İlçe yönetim kurulu üyelerini yönetin</p>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">Üye Listesi</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Toplam {uyeler?.length || 0} üye</p>
          </div>
          <Button onClick={() => handleOpenModal()}>
            <PlusIcon className="w-4 h-4 mr-2" />
            Yeni Üye
          </Button>
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block">
          <Table>
            <TableHeader>
              <TableHeaderCell>Ad Soyad</TableHeaderCell>
              <TableHeaderCell>Görev</TableHeaderCell>
              <TableHeaderCell>Sorumlu Mahalleler</TableHeaderCell>
              <TableHeaderCell>Komisyon Başkanlığı</TableHeaderCell>
              <TableHeaderCell>İletişim</TableHeaderCell>
              <TableHeaderCell>İşlemler</TableHeaderCell>
            </TableHeader>
            <TableBody>
              {uyeler?.map((uye) => (
                <TableRow key={uye.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-brand-50 rounded-full dark:bg-brand-900/20">
                        <Users2 className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white/90">
                          {uye.ad} {uye.soyad}
                        </p>
                        {uye.email && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">{uye.email}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge color="brand" className="font-medium">
                      {uye.ilceGorev?.ad || '-'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {uye.sorumluMahalleler?.map((sm) => (
                        <Badge key={sm.id} color="warning" className="text-xs">
                          {sm.mahalle.ad}
                        </Badge>
                      ))}
                      {(!uye.sorumluMahalleler || uye.sorumluMahalleler.length === 0) && (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {uye.komisyonlar?.map((komisyon) => (
                        <Badge key={komisyon.id} color="success" className="text-xs">
                          {komisyon.ad}
                        </Badge>
                      ))}
                      {(!uye.komisyonlar || uye.komisyonlar.length === 0) && (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
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
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleOpenModal(uye)} title="Düzenle">
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

        {/* Mobile Cards */}
        <div className="grid grid-cols-1 gap-4 lg:hidden">
          {uyeler?.map((uye) => (
            <div
              key={uye.id}
              className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-brand-50 rounded-full dark:bg-brand-900/20">
                    <Users2 className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-white/90">
                      {uye.ad} {uye.soyad}
                    </h3>
                    <Badge color="brand" className="mt-1 text-xs">
                      {uye.ilceGorev?.ad || '-'}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => handleOpenModal(uye)} title="Düzenle">
                    <PencilIcon className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(uye.id)} title="Sil">
                    <TrashBinIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                {uye.sorumluMahalleler && uye.sorumluMahalleler.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {uye.sorumluMahalleler.map((sm) => (
                      <Badge key={sm.id} color="warning" className="text-xs">
                        {sm.mahalle.ad}
                      </Badge>
                    ))}
                  </div>
                )}
                {uye.komisyonlar && uye.komisyonlar.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {uye.komisyonlar.map((komisyon) => (
                      <Badge key={komisyon.id} color="success" className="text-xs">
                        Başkan: {komisyon.ad}
                      </Badge>
                    ))}
                  </div>
                )}
                {uye.telefon && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Phone className="w-4 h-4" />
                    <span>{uye.telefon}</span>
                  </div>
                )}
                {uye.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Mail className="w-4 h-4" />
                    <span>{uye.email}</span>
                  </div>
                )}
                {uye.adres && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="w-4 h-4" />
                    <span>{uye.adres}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {uyeler?.length === 0 && (
          <div className="text-center py-12">
            <Users2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">Henüz üye eklenmemiş</p>
          </div>
        )}
      </Card>

      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingUye ? 'Üye Düzenle' : 'Yeni Üye Ekle'}
        size="lg"
      >
        {olusturulanKullanici ? (
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-5 text-center space-y-3">
              <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                <User className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-green-800">YK üyesi başarıyla eklendi!</p>
                <p className="text-sm text-green-700 dark:text-green-400 mt-1">Sistem girişi için kullanıcı hesabı oluşturuldu.</p>
              </div>
              <div className="bg-white dark:bg-gray-800 border border-green-200 dark:border-green-900 rounded-lg px-4 py-3 text-sm">
                <p className="text-gray-500 text-xs mb-1">Kullanıcı Adı</p>
                <p className="font-mono font-bold text-gray-900 dark:text-white text-lg">{olusturulanKullanici}</p>
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleCloseModal}>Tamam</Button>
            </div>
          </div>
        ) : (
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="İlçe Görevi"
              name="ilceGorevId"
              value={formData.ilceGorevId}
              onChange={handleInputChange}
              required
            >
              <option value="">İlçe Görevi Seçin</option>
              {ilceGorevler?.map((gorev) => (
                <option key={gorev.id} value={gorev.id}>
                  {gorev.ad}
                </option>
              ))}
            </Select>
            <Input
              label="Sıra"
              name="sira"
              type="number"
              value={formData.sira}
              onChange={handleInputChange}
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

          <Input label="Adres" name="adres" value={formData.adres} onChange={handleInputChange} />

          {!editingUye ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sistem Şifresi *</label>
              <div className="relative">
                <input
                  type={showSifre ? 'text' : 'password'}
                  name="sifre"
                  value={formData.sifre}
                  onChange={handleInputChange}
                  required
                  minLength={6}
                  placeholder="En az 6 karakter"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 pr-10 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-accent-500"
                />
                <button type="button" onClick={() => setShowSifre(!showSifre)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showSifre ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Kullanıcı adı otomatik oluşturulacak (İlk harf + Soyad)</p>
            </div>
          ) : editingUye?.admin && (
            <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Sistem Hesabı</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500">Kullanıcı Adı:</span>
                <span className="font-mono font-bold text-gray-900 dark:text-white">{editingUye.admin.username}</span>
                <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${editingUye.admin.active ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                  {editingUye.admin.active ? 'Aktif' : 'Pasif'}
                </span>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Yeni Şifre (boş bırakırsanız değişmez)</label>
                <div className="relative">
                  <input
                    type={showSifre ? 'text' : 'password'}
                    name="yeniSifre"
                    value={formData.yeniSifre || ''}
                    onChange={handleInputChange}
                    minLength={6}
                    placeholder="••••••"
                    className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 pr-10 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-accent-500"
                  />
                  <button type="button" onClick={() => setShowSifre(!showSifre)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showSifre ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sorumlu Mahalleler
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto border rounded-lg p-3">
              {mahalleler?.map((mahalle) => (
                <label key={mahalle.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.sorumluMahalleler.includes(mahalle.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData(prev => ({
                          ...prev,
                          sorumluMahalleler: [...prev.sorumluMahalleler, mahalle.id]
                        }));
                      } else {
                        setFormData(prev => ({
                          ...prev,
                          sorumluMahalleler: prev.sorumluMahalleler.filter(id => id !== mahalle.id)
                        }));
                      }
                    }}
                    className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span className="text-gray-700 dark:text-gray-300">{mahalle.ad}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={handleCloseModal}>
              İptal
            </Button>
            <Button type="submit">{editingUye ? 'Güncelle' : 'Kaydet'}</Button>
          </div>
        </form>
        )}
      </Modal>
    </>
  );
}

