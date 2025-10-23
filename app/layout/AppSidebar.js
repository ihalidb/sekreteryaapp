'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebar } from '../context/SidebarContext';
import {
  GridIcon,
  CalenderIcon,
  UserCircleIcon,
  ListIcon,
  TableIcon,
  PageIcon,
  BoxCubeIcon,
  PlugInIcon,
  ChevronDownIcon,
  HorizontaLDots,
  GroupIcon,
} from '../icons';
import { ClipboardCheck, Users2, MapPinned, ChevronRight } from 'lucide-react';

const AppSidebar = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered, setIsMobileOpen } = useSidebar();
  const pathname = usePathname();

  const [openSubmenu, setOpenSubmenu] = useState(null);

  const isActive = useCallback((path) => {
    if (!path) return false;
    return pathname === path;
  }, [pathname]);

  const handleLinkClick = () => {
    // Mobilde sidebar'ı kapat
    if (window.innerWidth < 1024) {
      setIsMobileOpen(false);
    }
  };

  const navItems = [
    {
      icon: <GridIcon />,
      name: "Dashboard",
      path: "/admin",
    },
    {
      icon: <UserCircleIcon />,
      name: "Mahalleler",
      path: "/admin/mahalleler",
    },
    {
      icon: <GroupIcon />,
      name: "Komisyonlar",
      path: "/admin/komisyonlar",
    },
    {
      icon: <ListIcon />,
      name: "Üyeler",
      path: "/admin/uyeler",
    },
    {
      icon: <Users2 className="w-6 h-6" />,
      name: "Yönetim",
      submenu: [
        {
          icon: <Users2 className="w-5 h-5" />,
          name: "Yönetim Kurulu",
          path: "/admin/yonetim-kurulu",
        },
        {
          icon: <MapPinned className="w-5 h-5" />,
          name: "Mahalle Başkanları",
          path: "/admin/mahalle-baskanlari",
        },
      ],
    },
    {
      icon: <TableIcon />,
      name: "İlçe Görevleri",
      path: "/admin/ilce-gorevler",
    },
    {
      icon: <CalenderIcon />,
      name: "Etkinlikler",
      path: "/admin/etkinlikler",
    },
    {
      icon: <ClipboardCheck className="w-6 h-6" />,
      name: "Yoklama",
      path: "/admin/yoklama",
    },
  ];

  const handleSubmenuToggle = (index) => {
    setOpenSubmenu(openSubmenu === index ? null : index);
  };

  return (
    <aside
      className={`fixed top-0 left-0 z-50 flex flex-col h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out dark:border-gray-800 dark:bg-gray-900 text-gray-900 dark:text-white
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="px-5 py-8">
        <Link 
          href="/admin" 
          className={`flex items-center gap-3 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}
        >
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <div className="flex items-center justify-center w-10 h-10 bg-orange-500 rounded-lg flex-shrink-0">
                <span className="text-white font-bold text-xl">AK</span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                  AK PARTİ
                </span>
                <span className="text-xs text-gray-600 dark:text-gray-400 leading-tight">
                  Fatih İlçe Teşkilatı
                </span>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center w-10 h-10 bg-orange-500 rounded-lg">
              <span className="text-white font-bold text-lg">AK</span>
            </div>
          )}
        </Link>
      </div>

      <div className="flex flex-col flex-1 overflow-y-auto no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <HorizontaLDots className="size-6" />
                )}
              </h2>
              <ul className="flex flex-col gap-4">
                {navItems.map((nav, index) => (
                  <li key={nav.name}>
                    {nav.submenu ? (
                      // Submenu item
                      <div>
                        <button
                          onClick={() => handleSubmenuToggle(index)}
                          className={`menu-item group w-full ${
                            openSubmenu === index ? "menu-item-active" : "menu-item-inactive"
                          }`}
                        >
                          <span
                            className={`menu-item-icon-size ${
                              openSubmenu === index
                                ? "menu-item-icon-active"
                                : "menu-item-icon-inactive"
                            }`}
                          >
                            {nav.icon}
                          </span>
                          {(isExpanded || isHovered || isMobileOpen) && (
                            <>
                              <span className="menu-item-text flex-1">{nav.name}</span>
                              <ChevronRight
                                className={`w-4 h-4 transition-transform duration-200 ${
                                  openSubmenu === index ? "rotate-90" : ""
                                }`}
                              />
                            </>
                          )}
                        </button>
                        
                        {/* Submenu items */}
                        {(isExpanded || isHovered || isMobileOpen) && openSubmenu === index && (
                          <ul className="mt-2 ml-4 flex flex-col gap-2 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
                            {nav.submenu.map((subItem) => (
                              <li key={subItem.path}>
                                <Link
                                  href={subItem.path}
                                  onClick={handleLinkClick}
                                  prefetch={true}
                                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 ${
                                    isActive(subItem.path)
                                      ? "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400"
                                      : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800/50"
                                  }`}
                                >
                                  <span className={`${
                                    isActive(subItem.path) ? "text-orange-600 dark:text-orange-400" : ""
                                  }`}>
                                    {subItem.icon}
                                  </span>
                                  <span className="text-sm font-medium">{subItem.name}</span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ) : nav.path ? (
                      // Regular item
                      <Link
                        href={nav.path}
                        onClick={handleLinkClick}
                        prefetch={true}
                        className={`menu-item group ${
                          isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                        }`}
                      >
                        <span
                          className={`menu-item-icon-size ${
                            isActive(nav.path)
                              ? "menu-item-icon-active"
                              : "menu-item-icon-inactive"
                          }`}
                        >
                          {nav.icon}
                        </span>
                        {(isExpanded || isHovered || isMobileOpen) && (
                          <span className="menu-item-text">{nav.name}</span>
                        )}
                      </Link>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
