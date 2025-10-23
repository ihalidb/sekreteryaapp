'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// API helper functions
const apiCall = async (url, options = {}) => {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

// Custom hooks for data fetching
export const useMahalleler = () => {
  return useQuery({
    queryKey: ['mahalleler'],
    queryFn: () => apiCall('/api/mahalleler'),
    staleTime: 5 * 60 * 1000,
  });
};

export const useKomisyonlar = () => {
  return useQuery({
    queryKey: ['komisyonlar'],
    queryFn: () => apiCall('/api/komisyonlar'),
    staleTime: 5 * 60 * 1000,
  });
};

export const useEtkinlikler = () => {
  return useQuery({
    queryKey: ['etkinlikler'],
    queryFn: () => apiCall('/api/etkinlikler'),
    staleTime: 2 * 60 * 1000, // 2 minutes for events
  });
};

export const useIlceGorevler = () => {
  return useQuery({
    queryKey: ['ilce-gorevler'],
    queryFn: () => apiCall('/api/ilce-gorevler'),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};


// Mutation hooks for data updates

// Mahalleler mutations
export const useCreateMahalle = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => apiCall('/api/mahalleler', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['mahalleler']);
    },
  });
};

export const useUpdateMahalle = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...data }) => apiCall(`/api/mahalleler/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['mahalleler']);
    },
  });
};

export const useDeleteMahalle = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => apiCall(`/api/mahalleler/${id}`, {
      method: 'DELETE',
    }),
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries(['mahalle', deletedId]);
      queryClient.invalidateQueries(['mahalleler']);
    },
  });
};

// Komisyonlar mutations
export const useCreateKomisyon = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => apiCall('/api/komisyonlar', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['komisyonlar']);
    },
  });
};

export const useUpdateKomisyon = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...data }) => apiCall(`/api/komisyonlar/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['komisyonlar']);
    },
  });
};

export const useDeleteKomisyon = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => apiCall(`/api/komisyonlar/${id}`, {
      method: 'DELETE',
    }),
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries(['komisyon', deletedId]);
      queryClient.invalidateQueries(['komisyonlar']);
    },
  });
};

// Etkinlikler mutations
export const useCreateEtkinlik = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => apiCall('/api/etkinlikler', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['etkinlikler']);
    },
  });
};

export const useUpdateEtkinlik = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...data }) => apiCall(`/api/etkinlikler/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['etkinlikler']);
    },
  });
};

export const useDeleteEtkinlik = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => apiCall(`/api/etkinlikler/${id}`, {
      method: 'DELETE',
    }),
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries(['etkinlik', deletedId]);
      queryClient.invalidateQueries(['etkinlikler']);
    },
  });
};

// İlçe Görevleri mutations
export const useCreateIlceGorev = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => apiCall('/api/ilce-gorevler', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['ilce-gorevler']);
    },
  });
};

export const useUpdateIlceGorev = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...data }) => apiCall(`/api/ilce-gorevler/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['ilce-gorevler']);
    },
  });
};

export const useDeleteIlceGorev = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => apiCall(`/api/ilce-gorevler/${id}`, {
      method: 'DELETE',
    }),
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries(['ilce-gorev', deletedId]);
      queryClient.invalidateQueries(['ilce-gorevler']);
    },
  });
};

export const useSeedIlceGorevler = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => apiCall('/api/seed-gorevler', {
      method: 'POST',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['ilce-gorevler']);
    },
  });
};

// Komisyon detay hooks
export const useKomisyonDetay = (id) => {
  return useQuery({
    queryKey: ['komisyon', id],
    queryFn: () => apiCall(`/api/komisyonlar/${id}`),
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  });
};

// NOT: Üye tablosu kaldırıldı, komisyon üye yönetimi artık kullanılmıyor
// Yönetim Kurulu veya Mahalle Başkanları üzerinden yönetilmeli

// Yönetim Kurulu hooks
export const useYonetimKurulu = () => {
  return useQuery({
    queryKey: ['yonetim-kurulu'],
    queryFn: () => apiCall('/api/yonetim-kurulu'),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateYonetimKuruluUyesi = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => apiCall('/api/yonetim-kurulu', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['yonetim-kurulu']);
    },
  });
};

export const useUpdateYonetimKuruluUyesi = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...data }) => apiCall(`/api/yonetim-kurulu/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['yonetim-kurulu']);
    },
  });
};

export const useDeleteYonetimKuruluUyesi = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => apiCall(`/api/yonetim-kurulu/${id}`, {
      method: 'DELETE',
    }),
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries(['yonetim-kurulu-uye', deletedId]);
      queryClient.invalidateQueries(['yonetim-kurulu']);
    },
  });
};

// Mahalle Başkanları hooks
export const useMahalleBaskanlar = () => {
  return useQuery({
    queryKey: ['mahalle-baskanlari'],
    queryFn: () => apiCall('/api/mahalle-baskanlari'),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateMahalleBaskan = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => apiCall('/api/mahalle-baskanlari', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['mahalle-baskanlari']);
    },
  });
};

export const useUpdateMahalleBaskan = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...data }) => apiCall(`/api/mahalle-baskanlari/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['mahalle-baskanlari']);
    },
  });
};

export const useDeleteMahalleBaskan = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => apiCall(`/api/mahalle-baskanlari/${id}`, {
      method: 'DELETE',
    }),
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries(['mahalle-baskan', deletedId]);
      queryClient.invalidateQueries(['mahalle-baskanlari']);
    },
  });
};
