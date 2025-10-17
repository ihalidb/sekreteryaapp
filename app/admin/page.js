'use client';

import { useUyeler, useMahalleler, useKomisyonlar, useEtkinlikler } from '../hooks/useData';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { Users, MapPin, Briefcase, Calendar, TrendingUp, TrendingDown, CheckCircle, XCircle } from 'lucide-react';
import LoadingSkeleton from '../components/LoadingSkeleton';

export default function Dashboard() {
  const { data: uyeler, isLoading: uyelerLoading } = useUyeler();
  const { data: mahalleler, isLoading: mahallelerLoading } = useMahalleler();
  const { data: komisyonlar, isLoading: komisyonlarLoading } = useKomisyonlar();
  const { data: etkinlikler, isLoading: etkinliklerLoading } = useEtkinlikler();

  if (uyelerLoading || mahallelerLoading || komisyonlarLoading || etkinliklerLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </Card>
        ))}
      </div>
    );
  }

  // Etkinlik istatistikleri
  const yaklaşanEtkinlikler = etkinlikler?.filter(e => new Date(e.tarih) > new Date()) || [];
  const gecmisEtkinlikler = etkinlikler?.filter(e => new Date(e.tarih) <= new Date()) || [];
  
  // Yoklama istatistikleri
  const toplamYoklama = etkinlikler?.reduce((sum, e) => sum + (e.yoklamalar?.length || 0), 0) || 0;
  const toplamKatilim = etkinlikler?.reduce((sum, e) => 
    sum + (e.yoklamalar?.filter(y => y.katildi).length || 0), 0) || 0;
  const katilimOrani = toplamYoklama > 0 ? Math.round((toplamKatilim / toplamYoklama) * 100) : 0;

  const metrics = [
    {
      title: 'Toplam Üye',
      value: uyeler?.length || 0,
      icon: Users,
      iconColor: 'text-brand-500',
      bgColor: 'bg-brand-50 dark:bg-brand-500/10',
      change: '+12.5%',
      trend: 'up',
      color: 'success'
    },
    {
      title: 'Yaklaşan Etkinlik',
      value: yaklaşanEtkinlikler.length,
      icon: Calendar,
      iconColor: 'text-success-500',
      bgColor: 'bg-success-50 dark:bg-success-500/10',
      change: `${yaklaşanEtkinlikler.length} Aktif`,
      trend: 'up',
      color: 'success'
    },
    {
      title: 'Katılım Oranı',
      value: `${katilimOrani}%`,
      icon: CheckCircle,
      iconColor: 'text-warning-500',
      bgColor: 'bg-warning-50 dark:bg-warning-500/10',
      change: `${toplamKatilim}/${toplamYoklama}`,
      trend: katilimOrani >= 70 ? 'up' : 'down',
      color: katilimOrani >= 70 ? 'success' : 'warning'
    },
    {
      title: 'Toplam Etkinlik',
      value: etkinlikler?.length || 0,
      icon: Briefcase,
      iconColor: 'text-error-500',
      bgColor: 'bg-error-50 dark:bg-error-500/10',
      change: `${gecmisEtkinlikler.length} Tamamlandı`,
      trend: 'up',
      color: 'brand'
    }
  ];

  // Son etkinlikler ve yoklama durumları
  const sonEtkinlikler = etkinlikler?.slice(0, 5).map(etkinlik => {
    const toplamUye = etkinlik.yoklamalar?.length || 0;
    const katilan = etkinlik.yoklamalar?.filter(y => y.katildi).length || 0;
    const oran = toplamUye > 0 ? Math.round((katilan / toplamUye) * 100) : 0;
    
    return {
      ...etkinlik,
      toplamUye,
      katilan,
      oran
    };
  }) || [];

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Sekreterya yönetim paneline hoş geldiniz
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index}>
              <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${metric.bgColor} mb-4`}>
                <Icon className={`w-6 h-6 ${metric.iconColor}`} />
              </div>
              
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {metric.title}
                  </span>
                  <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                    {typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}
                  </h4>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`text-xs font-medium ${metric.trend === 'up' ? 'text-success-600' : 'text-error-600'}`}>
                    {metric.trend === 'up' ? <TrendingUp className="w-4 h-4 inline" /> : <TrendingDown className="w-4 h-4 inline" />}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {metric.change}
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 mt-6 lg:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Son Etkinlikler ve Yoklama Durumu
            </h3>
            <Calendar className="w-5 h-5 text-brand-500" />
          </div>
          <div className="space-y-3">
            {sonEtkinlikler.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                Henüz etkinlik eklenmemiş
              </p>
            ) : (
              sonEtkinlikler.map((etkinlik) => (
                <div key={etkinlik.id} className="p-4 bg-gray-50 rounded-lg dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 dark:text-white/90">
                        {etkinlik.ad}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(etkinlik.tarih).toLocaleDateString('tr-TR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <Badge color={etkinlik.oran >= 70 ? 'success' : etkinlik.oran >= 50 ? 'warning' : 'error'}>
                      %{etkinlik.oran}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-success-600 dark:text-success-400">
                      <CheckCircle className="w-4 h-4" />
                      <span>{etkinlik.katilan} Katıldı</span>
                    </div>
                    <div className="flex items-center gap-1 text-error-600 dark:text-error-400">
                      <XCircle className="w-4 h-4" />
                      <span>{etkinlik.toplamUye - etkinlik.katilan} Katılmadı</span>
                    </div>
                  </div>
                  {etkinlik.konum && (
                    <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mt-2">
                      <MapPin className="w-4 h-4" />
                      <span>{etkinlik.konum}</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Genel İstatistikler
            </h3>
            <Briefcase className="w-5 h-5 text-brand-500" />
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg dark:bg-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Mahalleler</span>
                <Badge color="brand">{mahalleler?.length || 0}</Badge>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                <div className="bg-brand-500 h-2 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg dark:bg-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Komisyonlar</span>
                <Badge color="success">{komisyonlar?.length || 0}</Badge>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                <div className="bg-success-500 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg dark:bg-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Aktif Üyeler</span>
                <Badge color="warning">{uyeler?.length || 0}</Badge>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                <div className="bg-warning-500 h-2 rounded-full" style={{ width: '92%' }}></div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg dark:bg-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Genel Katılım Oranı</span>
                <Badge color={katilimOrani >= 70 ? 'success' : 'error'}>{katilimOrani}%</Badge>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                <div 
                  className={`h-2 rounded-full ${katilimOrani >= 70 ? 'bg-success-500' : 'bg-error-500'}`} 
                  style={{ width: `${katilimOrani}%` }}
                ></div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 mt-6">
        <Card>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
            Yaklaşan Etkinlikler
          </h3>
          <div className="space-y-3">
            {yaklaşanEtkinlikler.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                Yaklaşan etkinlik bulunmuyor
              </p>
            ) : (
              yaklaşanEtkinlikler.slice(0, 3).map((etkinlik) => (
                <div key={etkinlik.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-brand-50 rounded-lg flex items-center justify-center dark:bg-brand-500/10">
                      <Calendar className="w-6 h-6 text-brand-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white/90">
                        {etkinlik.ad}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(etkinlik.tarih).toLocaleDateString('tr-TR', {
                          day: 'numeric',
                          month: 'long',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <Badge color="brand">
                    {etkinlik.yoklamalar?.length || 0} Kayıt
                  </Badge>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </>
  );
}