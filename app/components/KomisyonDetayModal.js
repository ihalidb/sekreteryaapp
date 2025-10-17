'use client';

import { useEffect } from 'react';
import Modal from './ui/Modal';
import Badge from './ui/Badge';
import { Users, Briefcase, Calendar, UserCheck, X, MapPin } from 'lucide-react';
import { useKomisyonDetay } from '../hooks/useData';
import LoadingSkeleton from './LoadingSkeleton';

const KomisyonDetayModal = ({ komisyonId, isOpen, onClose }) => {
  const { data: komisyon, isLoading, refetch } = useKomisyonDetay(komisyonId);

  useEffect(() => {
    if (isOpen && komisyonId) {
      refetch();
    }
  }, [isOpen, komisyonId, refetch]);

  if (!isOpen) return null;

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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={komisyon?.ad || 'Komisyon Detayları'}
      size="xl"
    >
      {isLoading ? (
        <div className="py-8">
          <LoadingSkeleton />
        </div>
      ) : komisyon ? (
        <div className="space-y-6">
          {/* Komisyon Bilgileri */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white/90 mb-2">
                  {komisyon.ad}
                </h3>
                {komisyon.aciklama && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {komisyon.aciklama}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Badge variant="info">
                  <Users className="w-3 h-3 mr-1" />
                  {komisyon.uyeler?.length || 0} Üye
                </Badge>
                <Badge variant="success">
                  <Calendar className="w-3 h-3 mr-1" />
                  {komisyon.etkinlikler?.length || 0} Etkinlik
                </Badge>
              </div>
            </div>
          </div>

          {/* Üyeler Listesi */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              <h4 className="text-base font-semibold text-gray-900 dark:text-white/90">
                Komisyon Üyeleri
              </h4>
            </div>
            {komisyon.uyeler && komisyon.uyeler.length > 0 ? (
              <div className="space-y-2">
                {komisyon.uyeler.map((uyeKomisyon) => (
                  <div
                    key={uyeKomisyon.id}
                    className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-brand-300 dark:hover:border-brand-600 transition-all duration-150"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
                        <span className="text-brand-600 dark:text-brand-400 font-semibold text-sm">
                          {uyeKomisyon.uye.ad[0]}
                          {uyeKomisyon.uye.soyad[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white/90">
                          {uyeKomisyon.uye.ad} {uyeKomisyon.uye.soyad}
                        </p>
                        {uyeKomisyon.uye.ilceGorev && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {uyeKomisyon.uye.ilceGorev.ad}
                          </p>
                        )}
                      </div>
                    </div>
                    {uyeKomisyon.gorev && (
                      <Badge variant="primary">
                        <Briefcase className="w-3 h-3 mr-1" />
                        {uyeKomisyon.gorev}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 dark:text-gray-400">
                  Bu komisyonda henüz üye bulunmuyor
                </p>
              </div>
            )}
          </div>

          {/* Etkinlikler Listesi */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              <h4 className="text-base font-semibold text-gray-900 dark:text-white/90">
                Gerçekleştirilen Etkinlikler
              </h4>
            </div>
            {komisyon.etkinlikler && komisyon.etkinlikler.length > 0 ? (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {komisyon.etkinlikler.map((etkinlikKomisyon) => {
                  const etkinlik = etkinlikKomisyon.etkinlik;
                  const katilimSayisi = etkinlik.yoklamalar?.length || 0;
                  
                  return (
                    <div
                      key={etkinlikKomisyon.id}
                      className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-brand-300 dark:hover:border-brand-600 transition-all duration-150"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900 dark:text-white/90 mb-1">
                            {etkinlik.ad}
                          </h5>
                          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
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
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                              {etkinlik.aciklama}
                            </p>
                          )}
                        </div>
                        {katilimSayisi > 0 && (
                          <Badge variant="success" className="ml-3">
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
              <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 dark:text-gray-400">
                  Bu komisyon henüz etkinlik gerçekleştirmemiş
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            Komisyon bilgisi yüklenemedi
          </p>
        </div>
      )}
    </Modal>
  );
};

export default KomisyonDetayModal;

