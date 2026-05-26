'use client';

import { useState } from 'react';
import { Download, Upload, FileSpreadsheet, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const dataTypes = [
  {
    id: 'kisiler',
    name: 'Kişiler',
    description: 'Kişileri görevlerine göre otomatik dağıtın',
    icon: '👥',
    fields: ['Ad', 'Soyad', 'Telefon', 'Görev', 'Sorumlu Mahalle']
  },
  {
    id: 'mahalleler',
    name: 'Mahalleler',
    description: 'Mahalle bilgilerini toplu olarak yükleyin',
    icon: '🏘️',
    fields: ['Ad', 'Açıklama', 'Lokal Yeri']
  },
  {
    id: 'ilce_gorevler',
    name: 'İlçe Görevleri',
    description: 'İlçe görev tanımlarını yükleyin',
    icon: '👔',
    fields: ['Ad', 'Açıklama', 'Sıra']
  },
  {
    id: 'komisyonlar',
    name: 'Komisyonlar',
    description: 'Komisyon bilgilerini yükleyin',
    icon: '🏛️',
    fields: ['Ad', 'Açıklama']
  },
  {
    id: 'etkinlikler',
    name: 'Etkinlikler',
    description: 'Etkinlik bilgilerini toplu ekleyin',
    icon: '📅',
    fields: ['Ad', 'Açıklama', 'Tarih', 'Konum', 'Zorunlu']
  }
];

const VeriYuklemePage = () => {
  const [selectedType, setSelectedType] = useState(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);

  const handleDownloadTemplate = async (typeId) => {
    try {
      const response = await fetch(`/api/excel/templates?type=${typeId}`);
      
      if (!response.ok) {
        throw new Error('Şablon indirilemedi');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${typeId}_sablonu.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      alert('Şablon indirme hatası: ' + error.message);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
        alert('Lütfen sadece Excel dosyası (.xlsx veya .xls) seçin');
        return;
      }
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file || !selectedType) {
      alert('Lütfen dosya ve veri tipi seçin');
      return;
    }

    setUploading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', selectedType);

      const response = await fetch('/api/excel/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: data.message,
          details: data.results
        });
        setFile(null);
        // File input'u temizle
        const fileInput = document.getElementById('file-input');
        if (fileInput) fileInput.value = '';
      } else {
        setResult({
          success: false,
          message: data.error || 'Yükleme başarısız',
          details: data.results
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Yükleme hatası: ' + error.message
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Excel ile Veri Yükleme
        </h1>
        <p className="text-gray-600">
          Veritabanına toplu veri yüklemek için Excel şablonlarını indirin, doldurun ve yükleyin.
        </p>
      </div>

      {/* Bilgilendirme */}
      <div className="bg-accent-50 border-l-4 border-accent-500 p-4 mb-6 rounded-lg">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-accent-600 mt-0.5 mr-3 flex-shrink-0" />
          <div className="text-sm text-accent-800">
            <p className="font-semibold mb-1">Nasıl Kullanılır?</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>İstediğiniz veri tipi için şablonu indirin</li>
              <li>Şablonu Excel&apos;de açıp verilerinizi girin (örnek veriler üzerinde çalışabilirsiniz)</li>
              <li>Dosyayı kaydedin ve buradan yükleyin</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Veri Tipleri Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {dataTypes.map((type) => (
          <div
            key={type.id}
            className={`bg-white border-2 rounded-xl p-6 cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedType === type.id
                ? 'border-accent-600 shadow-lg'
                : 'border-gray-200 hover:border-accent-300'
            }`}
            onClick={() => setSelectedType(type.id)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="text-4xl">{type.icon}</div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownloadTemplate(type.id);
                }}
                className="p-2 text-accent-600 hover:bg-accent-50 rounded-lg transition-colors"
                title="Şablonu İndir"
              >
                <Download className="h-5 w-5" />
              </button>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {type.name}
            </h3>
            
            <p className="text-sm text-gray-600 mb-3">
              {type.description}
            </p>
            
            <div className="flex flex-wrap gap-1">
              {type.fields.map((field, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                >
                  {field}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Upload Section */}
      {selectedType && (
        <div className="bg-white border border-gray-200 rounded-xl p-8 mb-6">
          <div className="flex items-center mb-6">
            <FileSpreadsheet className="h-6 w-6 text-accent-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">
              {dataTypes.find(t => t.id === selectedType)?.name} Yükleme
            </h2>
          </div>

          {/* File Input */}
          <div className="mb-6">
            <label
              htmlFor="file-input"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Excel Dosyası Seçin
            </label>
            <div className="flex items-center gap-4">
              <input
                id="file-input"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none focus:ring-2 focus:ring-accent-500 file:mr-4 file:py-3 file:px-4 file:rounded-l-lg file:border-0 file:text-sm file:font-semibold file:bg-accent-600 file:text-white hover:file:bg-accent-700 file:cursor-pointer"
              />
            </div>
            {file && (
              <p className="mt-2 text-sm text-green-600 flex items-center">
                <CheckCircle className="h-4 w-4 mr-1" />
                {file.name} seçildi
              </p>
            )}
          </div>

          {/* Upload Button */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-accent-600 to-brand-500 text-white font-semibold rounded-lg hover:from-accent-700 hover:to-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Upload className="h-5 w-5 mr-2" />
              {uploading ? 'Yükleniyor...' : 'Yükle'}
            </button>

            <button
              onClick={() => handleDownloadTemplate(selectedType)}
              className="flex items-center px-6 py-3 bg-white border-2 border-accent-600 text-accent-600 font-semibold rounded-lg hover:bg-accent-50 transition-colors duration-200"
            >
              <Download className="h-5 w-5 mr-2" />
              Şablon İndir
            </button>
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div
          className={`border-l-4 p-6 rounded-lg ${
            result.success
              ? 'bg-green-50 border-green-500'
              : 'bg-red-50 border-red-500'
          }`}
        >
          <div className="flex items-start">
            {result.success ? (
              <CheckCircle className="h-6 w-6 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
            ) : (
              <XCircle className="h-6 w-6 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
            )}
            <div className="flex-1">
              <h3
                className={`text-lg font-semibold mb-2 ${
                  result.success ? 'text-green-900' : 'text-red-900'
                }`}
              >
                {result.success ? 'Başarılı!' : 'Hata Oluştu'}
              </h3>
              <p
                className={`mb-3 ${
                  result.success ? 'text-green-800' : 'text-red-800'
                }`}
              >
                {result.message}
              </p>

              {result.details && (
                <div className="mt-4 bg-white rounded-lg p-4 border border-gray-200">
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-sm text-gray-600">Başarılı</p>
                      <p className="text-2xl font-bold text-green-600">
                        {result.details.success || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Başarısız</p>
                      <p className="text-2xl font-bold text-red-600">
                        {result.details.failed || 0}
                      </p>
                    </div>
                  </div>

                  {result.details.errors && result.details.errors.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-semibold text-gray-700 mb-2">
                        Hatalar:
                      </p>
                      <div className="max-h-40 overflow-y-auto">
                        {result.details.errors.map((error, idx) => (
                          <p key={idx} className="text-xs text-red-700 mb-1">
                            • {error}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VeriYuklemePage;

