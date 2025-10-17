'use client';

import { useSidebar } from '../context/SidebarContext';

const Backdrop = () => {
  const { isMobileOpen, setIsMobileOpen } = useSidebar();

  if (!isMobileOpen) return null;

  return (
    <div
      className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
      onClick={() => setIsMobileOpen(false)}
    />
  );
};

export default Backdrop;

