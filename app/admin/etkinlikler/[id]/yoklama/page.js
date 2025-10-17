'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Card from '../../../../components/ui/Card';
import Button from '../../../../components/ui/Button';
import { Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from '../../../../components/ui/Table';
import Badge from '../../../../components/ui/Badge';
import Input from '../../../../components/ui/Input';
import Select from '../../../../components/ui/Select';
import Modal from '../../../../components/ui/Modal';
import {
  User,
  Users,
  CheckCircle,
  XCircle,
  Briefcase,
  MapPin,
  CheckSquare,
  Square,
  Clock,
  AlertCircle,
  Search,
  Filter,
  ArrowLeft,
  RefreshCw,
  Download,
  Calendar,
  TrendingUp,
  UserX,
} from 'lucide-react';
import LoadingSkeleton from '../../../../components/LoadingSkeleton';

export default function YoklamaPage() {
  const params = useParams();
  const router = useRouter();
  const etkinlikId = params?.id;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedUyeler, setSelectedUyeler] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterKomisyon, setFilterKomisyon] = useState('');
  const [filterDurum, setFilterDurum] = useState('');
  const [topluDurum, setTopluDurum] = useState('Geldi');
  const [mazeretModal, setMazeretModal] = useState({ isOpen: false, uyeId: null, uyeAd: '' });
  const [mazeretSebep, setMazeretSebep] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/etkinlikler/${etkinlikId}/yoklama`);
      const result = await response.json();
      
      if (response.ok) {
        setData(result);
      } else {
        console.error('Hata:', result.error);
        alert('Veriler yüklenirken hata oluştu: ' + result.error);
      }
    } catch (error) {
      console.error('Veriler yüklenirken hata:', error);
      alert('Veriler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (etkinlikId) {
    fetchData();
    }
  }, [etkinlikId]);

  const handleStatusChange = async (uyeId, durum, uyeAd = '') => {
    if (!durum) return;

    // Mazeretli seçilirse modal aç
    if (durum === 'Mazeretli') {
      setMazeretModal({ isOpen: true, uyeId, uyeAd });
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/etkinlikler/${etkinlikId}/yoklama`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uyeId, durum }),
      });

      if (response.ok) {
        await fetchData();
      } else {
        const error = await response.json();
        alert('Hata: ' + error.error);
      }
    } catch (error) {
      console.error('Hata:', error);
      alert('Yoklama kaydedilemedi');
    } finally {
      setSaving(false);
    }
  };

  const handleMazeretSubmit = async () => {
    if (!mazeretSebep || mazeretSebep.trim() === '') {
      alert('Lütfen mazeret sebebini giriniz');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/etkinlikler/${etkinlikId}/yoklama`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uyeId: mazeretModal.uyeId, 
          durum: `Mazeretli: ${mazeretSebep.trim()}` 
        }),
      });

      if (response.ok) {
        await fetchData();
        setMazeretModal({ isOpen: false, uyeId: null, uyeAd: '' });
        setMazeretSebep('');
      } else {
        const error = await response.json();
        alert('Hata: ' + error.error);
      }
    } catch (error) {
      console.error('Hata:', error);
      alert('Yoklama kaydedilemedi');
    } finally {
      setSaving(false);
    }
  };

  const handleCloseMazeretModal = () => {
    setMazeretModal({ isOpen: false, uyeId: null, uyeAd: '' });
    setMazeretSebep('');
  };

  const handleTopluIslem = async () => {
    if (selectedUyeler.size === 0) {
      alert('Lütfen en az bir üye seçin');
      return;
    }

    if (!topluDurum) {
      alert('Lütfen durum seçin');
      return;
    }

    setSaving(true);
    try {
      const body = Array.from(selectedUyeler).map((uyeId) => ({
        uyeId,
        durum: topluDurum,
      }));

      const response = await fetch(`/api/etkinlikler/${etkinlikId}/yoklama`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        setSelectedUyeler(new Set());
        await fetchData();
      } else {
        const error = await response.json();
        alert('Hata: ' + error.error);
      }
    } catch (error) {
      console.error('Hata:', error);
      alert('Toplu işlem başarısız oldu');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleSelection = (uyeId) => {
    setSelectedUyeler((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(uyeId)) {
        newSet.delete(uyeId);
      } else {
        newSet.add(uyeId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedUyeler.size === filteredUyeler.length) {
      setSelectedUyeler(new Set());
    } else {
      setSelectedUyeler(new Set(filteredUyeler.map((u) => u.id)));
    }
  };

  // Komisyonları topla
  const komisyonlar = useMemo(() => {
    if (!data?.uyeler) return [];
    const komisyonSet = new Set();
    data.uyeler.forEach((uye) => {
      uye.komisyonlar?.forEach((uk) => {
        komisyonSet.add(JSON.stringify({ id: uk.komisyon.id, ad: uk.komisyon.ad }));
      });
    });
    return Array.from(komisyonSet).map((k) => JSON.parse(k));
  }, [data]);

  // Filtreleme
  const filteredUyeler = useMemo(() => {
    if (!data?.uyeler) return [];

    let filtered = data.uyeler;

    // Arama
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter((uye) => {
        const fullName = `${uye.ad} ${uye.soyad}`.toLowerCase();
        const ilceGorev = uye.ilceGorev?.ad?.toLowerCase() || '';
        return fullName.includes(search) || ilceGorev.includes(search);
      });
    }

    // Komisyon filtresi
    if (filterKomisyon) {
      filtered = filtered.filter((uye) =>
        uye.komisyonlar?.some((uk) => uk.komisyon.id === parseInt(filterKomisyon))
      );
    }

    // Durum filtresi
    if (filterDurum) {
      filtered = filtered.filter((uye) => {
        if (filterDurum === 'Belirsiz') {
          return !uye.yoklama;
        }
        return uye.yoklama?.durum === filterDurum;
      });
    }

    return filtered;
  }, [data, searchTerm, filterKomisyon, filterDurum]);

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

  const getDurumColor = (durum) => {
    if (durum?.startsWith('Mazeretli')) return 'warning';
    
    switch (durum) {
      case 'Geldi':
        return 'success';
      case 'Gelmedi':
        return 'error';
      default:
        return 'gray';
    }
  };

  const getDurumBgClass = (durum) => {
    if (durum?.startsWith('Mazeretli')) {
      return 'border-orange-300 bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-600';
    }
    
    switch (durum) {
      case 'Geldi':
        return 'border-success-300 bg-success-50 text-success-700 dark:bg-success-900/20 dark:text-success-400 dark:border-success-600';
      case 'Gelmedi':
        return 'border-error-300 bg-error-50 text-error-700 dark:bg-error-900/20 dark:text-error-400 dark:border-error-600';
      default:
        return 'border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800 text-gray-800 dark:text-white/90';
    }
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="text-center p-8">
          <XCircle className="w-16 h-16 text-error-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90 mb-2">
            Veriler Yüklenemedi
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Yoklama verileri yüklenirken bir hata oluştu
          </p>
          <Button onClick={() => router.push('/admin/etkinlikler')}>Geri Dön</Button>
        </Card>
      </div>
    );
  }

  const { etkinlik, stats } = data;

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/admin/etkinlikler')}
            className="!p-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <Link href="/admin/etkinlikler" className="hover:text-brand-500">
            Etkinlikler
          </Link>
          <span>/</span>
          <span className="text-gray-800 dark:text-white/90">Yoklama</span>
        </div>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">{etkinlik.ad}</h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(etkinlik.tarih)}
              </span>
              {etkinlik.konum && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {etkinlik.konum}
                </span>
              )}
            </div>
          </div>
          <Button variant="ghost" onClick={fetchData} disabled={loading || saving}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading || saving ? 'animate-spin' : ''}`} />
            Yenile
          </Button>
        </div>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 mb-6">
        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Toplam</p>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white/90 mt-1">{stats.toplam}</h3>
            </div>
            <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center dark:bg-gray-800">
              <Users className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Geldi</p>
              <h3 className="text-xl font-bold text-success-600 dark:text-success-400 mt-1">{stats.geldi}</h3>
            </div>
            <div className="w-10 h-10 bg-success-50 rounded-lg flex items-center justify-center dark:bg-success-900/30">
              <CheckCircle className="w-5 h-5 text-success-600 dark:text-success-400" />
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Mazeretli</p>
              <h3 className="text-xl font-bold text-orange-600 dark:text-orange-400 mt-1">
                {stats.mazeretli}
              </h3>
            </div>
            <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center dark:bg-orange-900/30">
              <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Gelmedi</p>
              <h3 className="text-xl font-bold text-error-600 dark:text-error-400 mt-1">{stats.gelmedi}</h3>
            </div>
            <div className="w-10 h-10 bg-error-50 rounded-lg flex items-center justify-center dark:bg-error-900/30">
              <XCircle className="w-5 h-5 text-error-600 dark:text-error-400" />
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Belirsiz</p>
              <h3 className="text-xl font-bold text-gray-600 dark:text-gray-400 mt-1">{stats.belirsiz}</h3>
            </div>
            <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center dark:bg-gray-800">
              <UserX className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Katılım</p>
              <h3 className="text-xl font-bold text-brand-600 dark:text-brand-400 mt-1">
                %{stats.katilimOrani}
              </h3>
            </div>
            <div className="w-10 h-10 bg-brand-50 rounded-lg flex items-center justify-center dark:bg-brand-900/30">
              <TrendingUp className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filtreler ve Toplu İşlemler */}
      <Card className="mb-6">
        <div className="space-y-4">
          {/* Arama ve Filtreler */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Üye ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:border-brand-500 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white/90"
              />
            </div>

            <Select
              value={filterKomisyon}
              onChange={(e) => setFilterKomisyon(e.target.value)}
            >
              <option value="">Tüm Komisyonlar</option>
              {komisyonlar.map((komisyon) => (
                <option key={komisyon.id} value={komisyon.id}>
                  {komisyon.ad}
                </option>
              ))}
            </Select>

            <Select value={filterDurum} onChange={(e) => setFilterDurum(e.target.value)}>
              <option value="">Tüm Durumlar</option>
              <option value="Geldi">Geldi</option>
              <option value="Mazeretli">Mazeretli</option>
              <option value="Gelmedi">Gelmedi</option>
              <option value="Belirsiz">Belirsiz</option>
            </Select>
          </div>

          {/* Toplu İşlemler */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={handleSelectAll}>
                {selectedUyeler.size === filteredUyeler.length && filteredUyeler.length > 0 ? (
                  <>
                    <CheckSquare className="w-4 h-4 mr-2" />
                    Seçimi Kaldır
                  </>
                ) : (
                  <>
                    <Square className="w-4 h-4 mr-2" />
                    Hepsini Seç
                  </>
                )}
              </Button>
              {selectedUyeler.size > 0 && (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedUyeler.size} üye seçildi
                </span>
              )}
            </div>

            {selectedUyeler.size > 0 && (
              <div className="flex items-center gap-2">
                <Select
                  value={topluDurum}
                  onChange={(e) => setTopluDurum(e.target.value)}
                  className="w-40"
                >
                  <option value="Geldi">Geldi</option>
                  <option value="Gelmedi">Gelmedi</option>
                </Select>
                <Button onClick={handleTopluIslem} disabled={saving}>
                  {saving ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Kaydediliyor...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Toplu Kaydet
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Yoklama Listesi */}
      <Card>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">Yoklama Listesi</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
            {filteredUyeler.length} üye gösteriliyor {searchTerm || filterKomisyon || filterDurum ? `(${data.uyeler.length} toplam)` : ''}
            </p>
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableHeaderCell>
                <input
                  type="checkbox"
                  checked={selectedUyeler.size === filteredUyeler.length && filteredUyeler.length > 0}
                  onChange={handleSelectAll}
                  className="w-5 h-5 text-brand-500 border-gray-300 rounded focus:ring-brand-500 focus:ring-2 cursor-pointer"
                />
              </TableHeaderCell>
              <TableHeaderCell>Ad Soyad</TableHeaderCell>
              <TableHeaderCell>İlçe Görevi</TableHeaderCell>
              <TableHeaderCell>Komisyonlar</TableHeaderCell>
              <TableHeaderCell>Mahalleler</TableHeaderCell>
              <TableHeaderCell>Durum</TableHeaderCell>
            </TableHeader>
            <TableBody>
              {filteredUyeler.map((uye) => {
                const isSelected = selectedUyeler.has(uye.id);
                const currentDurum = uye.yoklama?.durum || '';

                return (
                  <TableRow
                    key={uye.id}
                    className={`${isSelected ? 'bg-brand-50 dark:bg-brand-900/20' : ''}`}
                  >
                  <TableCell>
                    <input
                      type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelection(uye.id)}
                        className="w-5 h-5 text-brand-500 border-gray-300 rounded focus:ring-brand-500 focus:ring-2 cursor-pointer"
                    />
                  </TableCell>
                  <TableCell>
                    <p className="font-medium text-gray-800 dark:text-white/90">
                      {uye.ad} {uye.soyad}
                    </p>
                  </TableCell>
                  <TableCell>
                    {uye.ilceGorev ? (
                        <Badge color="brand" className="text-xs">
                        {uye.ilceGorev.ad}
                      </Badge>
                    ) : (
                      <span className="text-sm text-gray-500 dark:text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {uye.komisyonlar?.map((uk) => (
                        <Badge key={uk.id} color="success" className="text-xs">
                          {uk.komisyon.ad}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {uye.sorumluMahalleler?.map((sm) => (
                        <Badge key={sm.id} color="warning" className="text-xs">
                          {sm.mahalle.ad}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                      <select
                        value={currentDurum?.startsWith('Mazeretli') ? 'Mazeretli' : currentDurum}
                        onChange={(e) => handleStatusChange(uye.id, e.target.value, `${uye.ad} ${uye.soyad}`)}
                      disabled={saving}
                        className={`w-full rounded-lg border px-3 py-2 text-sm font-medium focus:border-brand-500 focus:outline-none focus:ring focus:ring-brand-500/10 cursor-pointer transition-all duration-150 ${getDurumBgClass(
                          currentDurum
                        )}`}
                      >
                        <option value="">Durum Seçiniz</option>
                        <option value="Geldi">✓ Geldi</option>
                        <option value="Mazeretli">⚠ Mazeretli</option>
                        <option value="Gelmedi">✗ Gelmedi</option>
                      </select>
                  </TableCell>
                </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Cards */}
        <div className="grid grid-cols-1 gap-4 lg:hidden">
          {filteredUyeler.map((uye) => {
            const isSelected = selectedUyeler.has(uye.id);
            const currentDurum = uye.yoklama?.durum || '';

            return (
            <div
              key={uye.id}
              className={`p-4 border rounded-lg shadow-sm transition-all ${
                  isSelected
                    ? 'bg-brand-50 border-brand-200 dark:bg-brand-900/20 dark:border-brand-500/30'
                  : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700'
              }`}
            >
              <div className="flex items-start gap-3 mb-3">
                <input
                  type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggleSelection(uye.id)}
                    className="w-6 h-6 mt-1 text-brand-500 border-gray-300 rounded focus:ring-brand-500 focus:ring-2 flex-shrink-0 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center justify-center w-8 h-8 bg-brand-50 rounded-full dark:bg-brand-500/10">
                      <User className="w-4 h-4 text-brand-500" />
                    </div>
                      <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 dark:text-white/90">
                        {uye.ad} {uye.soyad}
                      </h3>
                      {uye.ilceGorev && (
                          <Badge color="brand" className="mt-1 text-xs">
                          {uye.ilceGorev.ad}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {uye.komisyonlar && uye.komisyonlar.length > 0 && (
                    <div className="flex items-start gap-2 text-sm mb-2">
                      <Briefcase className="w-4 h-4 mt-0.5 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                      <div className="flex flex-wrap gap-1">
                        {uye.komisyonlar.map((uk) => (
                            <Badge key={uk.id} color="success" className="text-xs">
                            {uk.komisyon.ad}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {uye.sorumluMahalleler && uye.sorumluMahalleler.length > 0 && (
                    <div className="flex items-start gap-2 text-sm mb-3">
                      <MapPin className="w-4 h-4 mt-0.5 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                      <div className="flex flex-wrap gap-1">
                        {uye.sorumluMahalleler.map((sm) => (
                            <Badge key={sm.id} color="warning" className="text-xs">
                            {sm.mahalle.ad}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                    <select
                      value={currentDurum?.startsWith('Mazeretli') ? 'Mazeretli' : currentDurum}
                      onChange={(e) => handleStatusChange(uye.id, e.target.value, `${uye.ad} ${uye.soyad}`)}
                      disabled={saving}
                      className={`w-full rounded-lg border px-3 py-2.5 text-sm font-medium focus:border-brand-500 focus:outline-none focus:ring focus:ring-brand-500/10 cursor-pointer transition-all duration-150 ${getDurumBgClass(
                        currentDurum
                      )}`}
                    >
                      <option value="">Durum Seçiniz</option>
                      <option value="Geldi">✓ Geldi</option>
                      <option value="Mazeretli">⚠ Mazeretli</option>
                      <option value="Gelmedi">✗ Gelmedi</option>
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredUyeler.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm || filterKomisyon || filterDurum
                ? 'Filtrelere uygun üye bulunamadı'
                : 'Bu etkinliğe henüz üye eklenmemiş'}
            </p>
          </div>
        )}
      </Card>

      {/* Mazeret Sebep Modal */}
      <Modal
        isOpen={mazeretModal.isOpen}
        onClose={handleCloseMazeretModal}
        title={`Mazeret Sebebi - ${mazeretModal.uyeAd}`}
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Lütfen <strong>{mazeretModal.uyeAd}</strong> için mazeret sebebini giriniz:
          </p>
          <textarea
            value={mazeretSebep}
            onChange={(e) => setMazeretSebep(e.target.value)}
            placeholder="Örn: Hastalık nedeniyle, İş seyahati, Ailevi sebep..."
            className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-400"
            rows={4}
            autoFocus
          />
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={handleCloseMazeretModal} disabled={saving}>
              İptal
            </Button>
            <Button onClick={handleMazeretSubmit} disabled={saving || !mazeretSebep.trim()}>
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                'Kaydet'
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
