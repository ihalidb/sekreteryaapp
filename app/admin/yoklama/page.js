'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import {
  Calendar,
  Users,
  ArrowRight,
  CheckCircle,
  Clock,
  Bell,
  ClipboardCheck,
  MapPin,
  Search,
  Filter,
  TrendingUp,
  AlertCircle,
  XCircle,
  UserX,
} from 'lucide-react';
import LoadingSkeleton from '../../components/LoadingSkeleton';

export default function YoklamaOverviewPage() {
  const router = useRouter();
  const [etkinlikler, setEtkinlikler] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterZaman, setFilterZaman] = useState('all'); // all, upcoming, past
  const [filterKomisyon, setFilterKomisyon] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/etkinlikler');
      const data = await response.json();
      setEtkinlikler(data);
    } catch (error) {
      console.error('Etkinlikler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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

  const calculateStats = (etkinlik) => {
    const totalUyeler = etkinlik.yoklamalar?.length || 0;
    const geldi = etkinlik.yoklamalar?.filter((y) => y.katildi || y.notlar === 'Geldi').length || 0;
    const mazeretli = etkinlik.yoklamalar?.filter((y) => y.notlar?.startsWith('Mazeretli')).length || 0;
    const gelmedi = etkinlik.yoklamalar?.filter((y) => y.notlar === 'Gelmedi').length || 0;
    const belirsiz = totalUyeler - (geldi + mazeretli + gelmedi);
    
    // Zorunlu etkinlikler için katılım oranı hesapla
    const katilimOrani = etkinlik.zorunlu && totalUyeler > 0 ? Math.round((geldi / totalUyeler) * 100) : 0;

    let katilimColor = 'gray';
    if (!etkinlik.zorunlu) {
      katilimColor = 'gray'; // İsteğe bağlı etkinlikler gri
    } else if (katilimOrani >= 80) {
      katilimColor = 'success';
    } else if (katilimOrani >= 50) {
      katilimColor = 'warning';
    } else {
      katilimColor = 'error';
    }

    return {
      totalUyeler,
      geldi,
      mazeretli,
      gelmedi,
      belirsiz,
      katilimOrani,
      katilimColor,
      zorunlu: etkinlik.zorunlu,
    };
  };

  const isUpcoming = (etkinlikTarihi) => {
    const now = new Date();
    const tarih = new Date(etkinlikTarihi);
    return tarih > now && tarih.getTime() - now.getTime() < 7 * 24 * 60 * 60 * 1000; // 7 gün içinde
  };

  const isToday = (etkinlikTarihi) => {
    const now = new Date();
    const tarih = new Date(etkinlikTarihi);
    return tarih.toDateString() === now.toDateString();
  };

  const isPast = (etkinlikTarihi) => {
    return new Date(etkinlikTarihi) < new Date();
  };

  // Tüm komisyonları topla
  const allKomisyonlar = useMemo(() => {
    const komisyonSet = new Map();
    etkinlikler.forEach((etkinlik) => {
      etkinlik.komisyonlar?.forEach((ek) => {
        if (!komisyonSet.has(ek.komisyon.id)) {
          komisyonSet.set(ek.komisyon.id, ek.komisyon);
        }
      });
    });
    return Array.from(komisyonSet.values());
  }, [etkinlikler]);

  // Filtreleme
  const filteredEtkinlikler = useMemo(() => {
    let filtered = etkinlikler;

    // Arama
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter((etkinlik) => {
        const ad = etkinlik.ad.toLowerCase();
        const konum = etkinlik.konum?.toLowerCase() || '';
        return ad.includes(search) || konum.includes(search);
      });
    }

    // Zaman filtresi
    if (filterZaman !== 'all') {
      filtered = filtered.filter((etkinlik) => {
        if (filterZaman === 'upcoming') {
          return !isPast(etkinlik.tarih);
        } else if (filterZaman === 'past') {
          return isPast(etkinlik.tarih);
        }
        return true;
      });
    }

    // Komisyon filtresi
    if (filterKomisyon) {
      filtered = filtered.filter((etkinlik) =>
        etkinlik.komisyonlar?.some((ek) => ek.komisyon.id === parseInt(filterKomisyon))
      );
    }

    return filtered;
  }, [etkinlikler, searchTerm, filterZaman, filterKomisyon]);

  // Gruplandırma
  const groupedEtkinlikler = useMemo(() => {
    const today = [];
    const upcoming = [];
    const thisWeek = [];
    const past = [];

    filteredEtkinlikler.forEach((etkinlik) => {
      if (isToday(etkinlik.tarih)) {
        today.push(etkinlik);
      } else if (isUpcoming(etkinlik.tarih)) {
        if (new Date(etkinlik.tarih) > new Date()) {
          upcoming.push(etkinlik);
        }
      } else if (isPast(etkinlik.tarih)) {
        past.push(etkinlik);
      } else {
        thisWeek.push(etkinlik);
      }
    });

    // Tarihe göre sırala
    const sortByDate = (a, b) => new Date(b.tarih) - new Date(a.tarih);
    today.sort(sortByDate);
    upcoming.sort((a, b) => new Date(a.tarih) - new Date(b.tarih)); // Yakından uzağa
    thisWeek.sort((a, b) => new Date(a.tarih) - new Date(b.tarih));
    past.sort(sortByDate); // Yeniden eskiye

    return { today, upcoming, thisWeek, past };
  }, [filteredEtkinlikler]);

  const renderEtkinlikCard = (etkinlik) => {
    const stats = calculateStats(etkinlik);
    const yakinda = isUpcoming(etkinlik.tarih) || isToday(etkinlik.tarih);
    const gecmis = isPast(etkinlik.tarih);
    const bugun = isToday(etkinlik.tarih);

    return (
      <Card
        key={etkinlik.id}
        className="hover:shadow-lg transition-all duration-200 cursor-pointer hover:border-brand-300 dark:hover:border-brand-600"
        onClick={() => router.push(`/admin/etkinlikler/${etkinlik.id}/yoklama`)}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3 flex-1">
            <div
              className={`flex items-center justify-center w-12 h-12 rounded-lg flex-shrink-0 ${
                bugun
                  ? 'bg-orange-50 dark:bg-orange-900/30'
                  : yakinda
                  ? 'bg-brand-50 dark:bg-brand-900/30'
                  : 'bg-gray-50 dark:bg-gray-800'
              }`}
            >
              <Calendar
                className={`w-6 h-6 ${
                  bugun
                    ? 'text-orange-500'
                    : yakinda
                    ? 'text-brand-500'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-800 dark:text-white/90 truncate">{etkinlik.ad}</h3>
                {!etkinlik.zorunlu && (
                  <Badge color="gray" className="flex-shrink-0 text-xs">
                    İsteğe Bağlı
                  </Badge>
                )}
                {bugun && (
                  <Badge color="orange" className="flex-shrink-0">
                    <Bell className="w-3 h-3 mr-1" />
                    Bugün
                  </Badge>
                )}
                {yakinda && !bugun && (
                  <Badge color="brand" className="flex-shrink-0">
                    Yaklaşan
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap gap-1 mb-2">
                {etkinlik.komisyonlar?.map((ek) => (
                  <Badge key={ek.id} color="success" className="text-xs">
                    {ek.komisyon.ad}
                  </Badge>
                ))}
                {etkinlik.ilceYonetimKuruluEkle && (
                  <Badge color="brand" className="text-xs">
                    İYK
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mb-3">
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {formatDate(etkinlik.tarih)}
          </span>
          {etkinlik.konum && (
            <span className="flex items-center gap-1 truncate">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              {etkinlik.konum}
            </span>
          )}
        </div>

        {etkinlik.aciklama && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">{etkinlik.aciklama}</p>
        )}

        {/* İstatistikler */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                {stats.totalUyeler}
              </span>
            </div>

            {stats.totalUyeler > 0 && (
              <>
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-success-500" />
                  <span className="text-sm font-medium text-success-600 dark:text-success-400">
                    {stats.geldi}
                  </span>
                </div>

                {stats.belirsiz > 0 && (
                  <div className="flex items-center gap-1">
                    <UserX className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {stats.belirsiz}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            {stats.totalUyeler > 0 && stats.zorunlu && (
              <Badge color={stats.katilimColor} className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                %{stats.katilimOrani}
              </Badge>
            )}
            <Button
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/admin/etkinlikler/${etkinlik.id}/yoklama`);
              }}
            >
              <ClipboardCheck className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  const totalStats = {
    toplam: etkinlikler.length,
    bugun: groupedEtkinlikler.today.length,
    yaklaşan: groupedEtkinlikler.upcoming.length + groupedEtkinlikler.thisWeek.length,
    gecmis: groupedEtkinlikler.past.length,
  };

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">Yoklama Yönetimi</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Tüm etkinliklerin yoklamalarını buradan yönetin
        </p>
      </div>

      {/* Özet İstatistikler */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-6">
        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Toplam Etkinlik</p>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white/90 mt-1">{totalStats.toplam}</h3>
            </div>
            <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center dark:bg-gray-800">
              <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Bugün</p>
              <h3 className="text-xl font-bold text-orange-600 dark:text-orange-400 mt-1">{totalStats.bugun}</h3>
            </div>
            <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center dark:bg-orange-900/30">
              <Bell className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Yaklaşan</p>
              <h3 className="text-xl font-bold text-brand-600 dark:text-brand-400 mt-1">{totalStats.yaklaşan}</h3>
            </div>
            <div className="w-10 h-10 bg-brand-50 rounded-lg flex items-center justify-center dark:bg-brand-900/30">
              <Clock className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Geçmiş</p>
              <h3 className="text-xl font-bold text-gray-600 dark:text-gray-400 mt-1">{totalStats.gecmis}</h3>
            </div>
            <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center dark:bg-gray-800">
              <ClipboardCheck className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filtreler */}
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Etkinlik ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:border-brand-500 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white/90"
            />
          </div>

          <Select value={filterZaman} onChange={(e) => setFilterZaman(e.target.value)}>
            <option value="all">Tüm Zamanlar</option>
            <option value="upcoming">Yaklaşan</option>
            <option value="past">Geçmiş</option>
          </Select>

          <Select value={filterKomisyon} onChange={(e) => setFilterKomisyon(e.target.value)}>
            <option value="">Tüm Komisyonlar</option>
            {allKomisyonlar.map((komisyon) => (
              <option key={komisyon.id} value={komisyon.id}>
                {komisyon.ad}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      {/* Bugünkü Etkinlikler */}
      {groupedEtkinlikler.today.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-orange-500" />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
              Bugünkü Etkinlikler
            </h2>
            <Badge color="orange">{groupedEtkinlikler.today.length}</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {groupedEtkinlikler.today.map(renderEtkinlikCard)}
          </div>
        </div>
      )}

      {/* Yaklaşan Etkinlikler */}
      {(groupedEtkinlikler.upcoming.length > 0 || groupedEtkinlikler.thisWeek.length > 0) && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-brand-500" />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">Yaklaşan Etkinlikler</h2>
            <Badge color="brand">
              {groupedEtkinlikler.upcoming.length + groupedEtkinlikler.thisWeek.length}
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[...groupedEtkinlikler.upcoming, ...groupedEtkinlikler.thisWeek].map(renderEtkinlikCard)}
          </div>
        </div>
      )}

      {/* Geçmiş Etkinlikler */}
      {groupedEtkinlikler.past.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <ClipboardCheck className="w-5 h-5 text-gray-500" />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">Geçmiş Etkinlikler</h2>
            <Badge color="gray">{groupedEtkinlikler.past.length}</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {groupedEtkinlikler.past.map(renderEtkinlikCard)}
          </div>
        </div>
      )}

      {/* Boş Durum */}
      {filteredEtkinlikler.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">
              {searchTerm || filterZaman !== 'all' || filterKomisyon
                ? 'Etkinlik Bulunamadı'
                : 'Henüz Etkinlik Yok'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {searchTerm || filterZaman !== 'all' || filterKomisyon
                ? 'Filtrelere uygun etkinlik bulunamadı'
                : 'Henüz hiç etkinlik oluşturulmamış'}
            </p>
            {!searchTerm && filterZaman === 'all' && !filterKomisyon && (
              <Button onClick={() => router.push('/admin/etkinlikler')}>Yeni Etkinlik Oluştur</Button>
            )}
          </div>
        </Card>
      )}
    </>
  );
}
