'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Users, MapPin, Briefcase, Calendar, UserCog, LogOut, Menu, X, FileSpreadsheet, Users2, ChevronDown, Settings } from 'lucide-react';
import AppLogo from '../components/AppLogo';

const AdminLayout = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null);

  useEffect(() => {
    let intervalId = null;
    let isCheckingAuth = false;
    
    const checkAuth = async () => {
      // Eğer zaten kontrol yapılıyorsa, tekrar yapma
      if (isCheckingAuth) return;
      
      isCheckingAuth = true;
      
      try {
        const response = await fetch('/api/auth/me');
        
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          setLoading(false);
        } else {
          // Oturum yok veya geçersiz
          // Interval'i temizle
          if (intervalId) {
            clearInterval(intervalId);
          }
          
          try {
            const data = await response.json();
            // Sadece başka cihazdan giriş varsa alert göster
            if (data.error?.includes('başka bir cihazdan')) {
              alert('⚠️ ' + data.error);
            }
          } catch (e) {
            // JSON parse hatası, önemli değil
          }
          
          // Login'e yönlendir
          window.location.href = '/login';
        }
      } catch (error) {
        console.error('Auth check error:', error);
        // Interval'i temizle
        if (intervalId) {
          clearInterval(intervalId);
        }
        window.location.href = '/login';
      } finally {
        isCheckingAuth = false;
      }
    };

    checkAuth();
    
    // Her 30 saniyede bir auth kontrolü yap (başka cihazdan giriş kontrolü için)
    intervalId = setInterval(checkAuth, 30000);
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);

  const handleLogout = async () => {
    try {
      // Logout isteği gönder
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Her durumda login'e yönlendir
      window.location.href = '/login';
    }
  };

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: Home },
    {
      name: 'İlçe Teşkilatı',
      icon: Users2,
      submenu: [
        { name: 'Yönetim Kurulu', href: '/admin/yonetim-kurulu', icon: Users2 },
        { name: 'Mahalle Başkanları', href: '/admin/mahalle-baskanlari', icon: MapPin },
      ],
    },
    { name: 'Etkinlikler', href: '/admin/etkinlikler', icon: Calendar },
    { 
      name: 'Ayarlar',
      icon: Settings,
      submenu: [
        { name: 'Mahalleler', href: '/admin/mahalleler', icon: MapPin },
        { name: 'Komisyonlar', href: '/admin/komisyonlar', icon: Briefcase },
        { name: 'İlçe Görevleri', href: '/admin/ilce-gorevler', icon: UserCog },
        { name: 'Veri Yükleme', href: '/admin/veri-yukleme', icon: FileSpreadsheet },
      ]
    },
  ];

  const handleSubmenuToggle = (index) => {
    setOpenSubmenu(openSubmenu === index ? null : index);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-600"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Redirect yapılıyor
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
            <AppLogo href="/admin" size="sm" priority />
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item, index) => {
              const Icon = item.icon;
              
              // Submenu varsa
              if (item.submenu) {
                const isSubmenuOpen = openSubmenu === index;
                const isAnySubmenuActive = item.submenu.some(sub => pathname === sub.href);
                
                return (
                  <div key={item.name}>
                    <button
                      onClick={() => handleSubmenuToggle(index)}
                      className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                        isAnySubmenuActive
                          ? 'bg-gradient-to-r from-accent-600 to-brand-500 text-white shadow-lg'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <div className="flex items-center">
                        <Icon className="mr-3 h-5 w-5" />
                        {item.name}
                      </div>
                      <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isSubmenuOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {/* Submenu items */}
                    {isSubmenuOpen && (
                      <div className="mt-1 ml-4 space-y-1">
                        {item.submenu.map((subItem) => {
                          const isActive = pathname === subItem.href;
                          const SubIcon = subItem.icon;
                          return (
                            <Link
                              key={subItem.href}
                              href={subItem.href}
                              onClick={() => setSidebarOpen(false)}
                              className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                                isActive
                                  ? 'bg-brand-50 text-brand-700 border-l-2 border-brand-500'
                                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                              }`}
                            >
                              <SubIcon className="mr-3 h-4 w-4" />
                              {subItem.name}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }
              
              // Normal menu item
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-accent-600 to-brand-500 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex-1 flex items-center justify-between lg:justify-end">
              <h1 className="text-xl font-semibold text-gray-900 lg:hidden">
                {(() => {
                  // Normal menu item kontrolü
                  const mainItem = navigation.find((item) => item.href === pathname);
                  if (mainItem) return mainItem.name;
                  
                  // Submenu item kontrolü
                  for (const item of navigation) {
                    if (item.submenu) {
                      const subItem = item.submenu.find(sub => sub.href === pathname);
                      if (subItem) return subItem.name;
                    }
                  }
                  
                  return 'Dashboard';
                })()}
              </h1>
              <div className="flex items-center space-x-4">
                {/* Admin Info & Logout */}
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-accent-500 to-brand-500 flex items-center justify-center text-white font-semibold text-sm">
                      {user.name ? user.name.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-gray-900 hidden sm:block">
                      {user.name || user.username}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center px-3 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors duration-200"
                  >
                    <LogOut className="mr-1 h-4 w-4" />
                    <span className="hidden sm:inline">Çıkış</span>
                  </button>
                </div>
                <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <span className="w-2 h-2 mr-2 bg-green-500 rounded-full animate-pulse"></span>
                  Aktif
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

