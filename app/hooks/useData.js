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
export const useUyeler = () => {
  return useQuery({
    queryKey: ['uyeler'],
    queryFn: () => apiCall('/api/uyeler'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUyeDetay = (uyeId) => {
  return useQuery({
    queryKey: ['uye', uyeId],
    queryFn: () => apiCall(`/api/uyeler/${uyeId}`),
    enabled: !!uyeId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

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
export const useCreateUye = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => apiCall('/api/uyeler', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['uyeler']);
    },
  });
};

export const useUpdateUye = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...data }) => apiCall(`/api/uyeler/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['uyeler']);
    },
  });
};

export const useDeleteUye = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => apiCall(`/api/uyeler/${id}`, {
      method: 'DELETE',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['uyeler']);
    },
  });
};

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
    onSuccess: () => {
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
    onSuccess: () => {
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
    onSuccess: () => {
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
    onSuccess: () => {
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

export const useAddUyeToKomisyon = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ komisyonId, uyeId, gorev }) => apiCall(`/api/komisyonlar/${komisyonId}/uyeler`, {
      method: 'POST',
      body: JSON.stringify({ uyeId, gorev }),
    }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['komisyon', variables.komisyonId]);
      queryClient.invalidateQueries(['komisyonlar']);
    },
  });
};

export const useUpdateUyeKomisyon = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ komisyonId, uyeKomisyonId, gorev }) => apiCall(`/api/komisyonlar/${komisyonId}/uyeler`, {
      method: 'PUT',
      body: JSON.stringify({ uyeKomisyonId, gorev }),
    }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['komisyon', variables.komisyonId]);
      queryClient.invalidateQueries(['komisyonlar']);
    },
  });
};

export const useRemoveUyeFromKomisyon = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ komisyonId, uyeKomisyonId }) => apiCall(`/api/komisyonlar/${komisyonId}/uyeler?uyeKomisyonId=${uyeKomisyonId}`, {
      method: 'DELETE',
    }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['komisyon', variables.komisyonId]);
      queryClient.invalidateQueries(['komisyonlar']);
    },
  });
};
