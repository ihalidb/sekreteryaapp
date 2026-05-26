'use client';

import Image from 'next/image';
import Link from 'next/link';

export const LOGO_PATH = '/images/logo/ak-parti-logo.png';

const sizeMap = {
  xs: { width: 32, height: 38 },
  sm: { width: 40, height: 48 },
  md: { width: 52, height: 62 },
  lg: { width: 100, height: 120 },
  xl: { width: 140, height: 168 },
};

/**
 * AK Parti resmi logosu — sidebar, giriş ve header için.
 * @param {'xs'|'sm'|'md'|'lg'|'xl'} size
 * @param {boolean} showSubtitle - "Fatih İlçe Teşkilatı" alt satırı
 * @param {boolean} iconOnly - Sadece logo görseli (metin yok)
 */
const AppLogo = ({
  href = '/admin',
  size = 'md',
  showSubtitle = true,
  iconOnly = false,
  className = '',
  asLink = true,
  priority = false,
}) => {
  const dims = sizeMap[size] || sizeMap.md;

  const content = (
    <div
      className={`flex items-center gap-3 ${iconOnly ? 'justify-center' : ''} ${className}`}
    >
      <Image
        src={LOGO_PATH}
        alt="AK Parti logosu"
        width={dims.width}
        height={dims.height}
        priority={priority}
        className="object-contain flex-shrink-0"
      />
      {!iconOnly && (
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-bold text-gray-900 dark:text-white leading-tight truncate">
            AK Parti
          </span>
          {showSubtitle && (
            <span className="text-xs text-gray-600 dark:text-gray-400 leading-tight truncate">
              Fatih İlçe Teşkilatı
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (asLink && href) {
    return (
      <Link href={href} className="focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 rounded-lg">
        {content}
      </Link>
    );
  }

  return content;
};

export default AppLogo;
