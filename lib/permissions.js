export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  EDITOR: 'EDITOR',
  VIEWER: 'VIEWER',
};

export const ROLE_LABELS = {
  SUPER_ADMIN: 'Süper Admin',
  ADMIN: 'Admin',
  EDITOR: 'Editör',
  VIEWER: 'Görüntüleyici',
};

export const ROLE_COLORS = {
  SUPER_ADMIN: 'red',
  ADMIN: 'blue',
  EDITOR: 'yellow',
  VIEWER: 'gray',
};

export const MODULES = ['mahalleler', 'uyeler', 'etkinlikler', 'komisyonlar'];

export const MODULE_LABELS = {
  mahalleler: 'Mahalleler',
  uyeler: 'Üyeler & Yönetim Kurulu',
  etkinlikler: 'Etkinlikler & Yoklama',
  komisyonlar: 'Komisyonlar & Görevler',
};

export const PERMISSION_LEVELS = {
  none: 'Erişim Yok',
  read: 'Sadece Görüntüle',
  write: 'Görüntüle & Düzenle',
};

// SUPER_ADMIN ve ADMIN rollerine tüm modüllerde tam erişim verilir
// EDITOR ve VIEWER için admin_izinler tablosuna bakılır
export function hasAccess(user, izinler, module, level = 'read') {
  if (!user) return false;
  if (user.role === ROLES.SUPER_ADMIN || user.role === ROLES.ADMIN) return true;

  if (!izinler) return false;
  const perm = izinler[module];
  if (!perm || perm === 'none') return false;
  if (level === 'read') return perm === 'read' || perm === 'write';
  if (level === 'write') return perm === 'write';
  return false;
}

export function canManageUsers(user) {
  return user?.role === ROLES.SUPER_ADMIN;
}

export function getDefaultIzinler() {
  return {
    mahalleler: 'none',
    uyeler: 'none',
    etkinlikler: 'none',
    komisyonlar: 'none',
  };
}
