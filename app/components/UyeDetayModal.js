'use client';

import { useEffect } from 'react';
import Modal from './ui/Modal';
import Badge from './ui/Badge';
import Card from './ui/Card';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Building2,
} from 'lucide-react';
import { useUyeDetay } from '../hooks/useData';
import LoadingSkeleton from './LoadingSkeleton';

const UyeDetayModal = ({ uyeId, isOpen, onClose }) => {
  const { data: uyeData, isLoading, refetch } = useUyeDetay(uyeId);

  useEffect(() => {
    if (isOpen && uyeId) {
      refetch();
    }
  }, [isOpen, uyeId, refetch]);

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

  const getDurumColor = (yoklama) => {
    if (yoklama.katildi || yoklama.notlar === 'Geldi') return 'success';
    if (yoklama.notlar === 'İzinli') return 'brand';
    if (yoklama.notlar === 'Mazeretli') return 'warning';
    if (yoklama.notlar === 'Gelmedi') return 'error';
    return 'gray';
  };

  const getDurumIcon = (yoklama) => {
    if (yoklama.katildi || yoklama.notlar === 'Geldi') return <CheckCircle className="w-4 h-4" />;
    if (yoklama.notlar === 'İzinli') return <Clock className="w-4 h-4" />;
    if (yoklama.notlar === 'Mazeretli') return <AlertCircle className="w-4 h-4" />;
    if (yoklama.notlar === 'Gelmedi') return <XCircle className="w-4 h-4" />;
    return null;
  };

  const getDurumText = (yoklama) => {
    if (yoklama.katildi || yoklama.notlar === 'Geldi') return 'Katıldı';
    if (yoklama.notlar === 'İzinli') return 'İzinli';
    if (yoklama.notlar === 'Mazeretli') return 'Mazeretli';
    if (yoklama.notlar === 'Gelmedi') return 'Gelmedi';
    return 'Belirsiz';
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={uyeData ? `${uyeData.ad} ${uyeData.soyad}` : 'Üye Detayları'}
      size="3xl"
    >
      {isLoading ? (
        <LoadingSkeleton />
      ) : uyeData ? (
        <div className="space-y-4">
          {/* Kişisel Bilgiler ve İstatistikler - 2 Kolon Desktop'ta */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Kişisel Bilgiler ve Görevler */}
            <div className="p-3 bg-gray-50 rounded-lg dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center justify-center w-8 h-8 bg-brand-50 rounded-lg dark:bg-brand-500/10">
                <User className="w-4 h-4 text-brand-500" />
              </div>
              <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
                Kişisel Bilgiler
              </h4>
            </div>

            <div className="space-y-3">
              {/* İletişim Bilgileri */}
              <div className="space-y-2">
                {uyeData.ilceGorev && (
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3 h-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                    <Badge color="brand" className="text-xs">{uyeData.ilceGorev.ad}</Badge>
                  </div>
                )}

                {uyeData.telefon && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3 h-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                    <p className="text-xs text-gray-700 dark:text-gray-300">{uyeData.telefon}</p>
                  </div>
                )}

                {uyeData.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3 h-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                    <p className="text-xs text-gray-700 dark:text-gray-300 truncate">{uyeData.email}</p>
                  </div>
                )}

                {uyeData.adres && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3 h-3 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-2">{uyeData.adres}</p>
                  </div>
                )}
              </div>

              {/* Görev ve Sorumluluklar */}
              {(uyeData.komisyonlar?.length > 0 || uyeData.sorumluMahalleler?.length > 0) && (
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
                  {/* Komisyonlar */}
                  {uyeData.komisyonlar && uyeData.komisyonlar.length > 0 && (
                    <div>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1.5 font-medium flex items-center gap-1">
                        <Briefcase className="w-3 h-3" />
                        Komisyonlar
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {uyeData.komisyonlar.map((uk) => (
                          <Badge key={uk.id} color="success" className="text-xs">
                            {uk.komisyon.ad}
                            {uk.gorev && ` • ${uk.gorev}`}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Mahalleler */}
                  {uyeData.sorumluMahalleler && uyeData.sorumluMahalleler.length > 0 && (
                    <div>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1.5 font-medium flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        Mahalleler
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {uyeData.sorumluMahalleler.map((sm) => (
                          <Badge key={sm.id} color="warning" className="text-xs">
                            {sm.mahalle.ad}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            </div>

            {/* Etkinlik İstatistikleri */}
            {uyeData.stats && (
              <div className="p-3 bg-gray-50 rounded-lg dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-8 h-8 bg-brand-50 rounded-lg dark:bg-brand-500/10">
                      <TrendingUp className="w-4 h-4 text-brand-500" />
                    </div>
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
                      İstatistikler
                    </h4>
                  </div>
                  {uyeData.stats.toplam > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden dark:bg-gray-700">
                        <div
                          className="h-full bg-brand-500 transition-all duration-300"
                          style={{ width: `${uyeData.stats.katilimOrani}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-brand-600 dark:text-brand-400">
                        %{uyeData.stats.katilimOrani}
                      </span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <div className="text-center p-2 bg-white rounded dark:bg-gray-800">
                    <p className="text-lg font-bold text-gray-800 dark:text-white/90">
                      {uyeData.stats.toplam}
                    </p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">Toplam</p>
                  </div>

                  <div className="text-center p-2 bg-success-50 rounded dark:bg-success-900/20">
                    <p className="text-lg font-bold text-success-600 dark:text-success-400">
                      {uyeData.stats.katildi}
                    </p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">Katıldı</p>
                  </div>

                  <div className="text-center p-2 bg-orange-50 rounded dark:bg-orange-900/20">
                    <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                      {uyeData.stats.mazeretli}
                    </p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">Mazeretli</p>
                  </div>

                  <div className="text-center p-2 bg-error-50 rounded dark:bg-error-900/20">
                    <p className="text-lg font-bold text-error-600 dark:text-error-400">
                      {uyeData.stats.gelmedi}
                    </p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">Gelmedi</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Etkinlik Geçmişi */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-brand-500" />
              <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
                Etkinlikler ({uyeData.yoklamalar?.length || 0})
              </h4>
            </div>

            {uyeData.yoklamalar && uyeData.yoklamalar.length > 0 ? (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {uyeData.yoklamalar.map((yoklama) => (
                  <div 
                    key={yoklama.id} 
                    className="p-2.5 bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700 hover:border-brand-300 dark:hover:border-brand-600 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 mb-1.5">
                          <div className="flex items-center justify-center w-7 h-7 bg-brand-50 rounded dark:bg-brand-500/10 flex-shrink-0">
                            <Calendar className="w-3.5 h-3.5 text-brand-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="text-sm font-medium text-gray-800 dark:text-white/90 truncate">
                              {yoklama.etkinlik.ad}
                            </h5>
                            <div className="flex items-center gap-1.5 text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                              <Clock className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{formatDate(yoklama.etkinlik.tarih)}</span>
                            </div>
                            {yoklama.etkinlik.konum && (
                              <div className="flex items-center gap-1.5 text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                                <MapPin className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">{yoklama.etkinlik.konum}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {yoklama.etkinlik.komisyonlar && yoklama.etkinlik.komisyonlar.length > 0 && (
                          <div className="flex flex-wrap gap-1 ml-9">
                            {yoklama.etkinlik.komisyonlar.map((ek) => (
                              <Badge key={ek.id} color="success" className="text-[10px] px-1.5 py-0.5">
                                {ek.komisyon.ad}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      <Badge color={getDurumColor(yoklama)} className="flex items-center gap-1 text-xs flex-shrink-0">
                        {getDurumIcon(yoklama)}
                        {getDurumText(yoklama)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg dark:bg-gray-800/50">
                <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Henüz etkinlik kaydı yok
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <XCircle className="w-12 h-12 text-error-500 mx-auto mb-3" />
          <p className="text-lg text-error-600 dark:text-error-400">Üye bulunamadı!</p>
        </div>
      )}
    </Modal>
  );
};

export default UyeDetayModal;

