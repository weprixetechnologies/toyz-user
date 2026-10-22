'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Gift, Facebook, Twitter, Instagram, Youtube,
  Linkedin, MessageCircle, Share2
} from 'lucide-react';
import api from '@/lib/api';

const DEFAULT_FOOTER_CONFIG = {
  brand: {
    logo_url: '',
    logo_text: 'Provoke Playtech',
    about_text: 'Bringing joy to kids of all ages with premium toys, next-level RC cars, and educational games. Playtime never stops!',
    show_brand_column: true
  },
  column_count: 4,
  columns: [
    {
      id: 'col-shop',
      heading: 'Shop',
      type: 'links',
      custom_content: '',
      links: [
        { id: 'l-1', label: 'All Products', url: '/products', target: '_self', highlight: false },
        { id: 'l-2', label: 'RC Cars & Trucks', url: '/categories/rc-cars', target: '_self', highlight: false },
        { id: 'l-3', label: 'Action Figures', url: '/categories/action-figures', target: '_self', highlight: false },
        { id: 'l-4', label: 'Puzzles & Games', url: '/categories/puzzles', target: '_self', highlight: false },
        { id: 'l-5', label: 'Educational Toys', url: '/categories/educational', target: '_self', highlight: false },
        { id: 'l-6', label: 'Baby & Toddler', url: '/categories/toddler', target: '_self', highlight: false },
        { id: 'l-7', label: 'Apply as Reseller', url: '/account/apply-reseller', target: '_self', highlight: true }
      ]
    },
    {
      id: 'col-care',
      heading: 'Customer Care',
      type: 'links',
      custom_content: '',
      links: [
        { id: 'l-8', label: 'Track Your Order', url: '/account/orders', target: '_self', highlight: false },
        { id: 'l-9', label: 'Shipping & Returns', url: '/shipping-returns', target: '_self', highlight: false },
        { id: 'l-blog', label: 'Provoke Playtech Blog', url: '/blogs', target: '_self', highlight: false },
        { id: 'l-10', label: 'FAQ', url: '/faq', target: '_self', highlight: false },
        { id: 'l-11', label: 'Contact Us', url: '/contact', target: '_self', highlight: false }
      ]
    },
    {
      id: 'col-contact',
      heading: 'Contact Us',
      type: 'custom',
      custom_content: 'Email: hello@Provoke Playtech.com\nPhone: +1 (800) TOY-WORLD\nAddress: 123 Playtime Avenue, Fun City, TX 75001',
      links: []
    }
  ],
  social_media: {
    enabled: true,
    title: 'Follow Us',
    links: [
      { id: 'soc-fb', platform: 'facebook', url: '#', enabled: true },
      { id: 'soc-tw', platform: 'twitter', url: '#', enabled: true },
      { id: 'soc-ig', platform: 'instagram', url: '#', enabled: true },
      { id: 'soc-yt', platform: 'youtube', url: '#', enabled: true }
    ]
  },
  bottom_bar: {
    enabled: true,
    copyright_text: '© {year} Provoke Playtech Inc. All rights reserved.',
    links: [
      { id: 'bot-1', label: 'Privacy Policy', url: '/privacy', target: '_self' },
      { id: 'bot-2', label: 'Terms of Service', url: '/terms', target: '_self' }
    ]
  }
};

const SOCIAL_ICON_MAP = {
  facebook: Facebook,
  twitter: Twitter,
  instagram: Instagram,
  youtube: Youtube,
  whatsapp: MessageCircle,
  linkedin: Linkedin
};

export default function Footer() {
  const [footerData, setFooterData] = useState(DEFAULT_FOOTER_CONFIG);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchFooter() {
      // Check cached footer config in sessionStorage for faster navigation
      try {
        const cached = sessionStorage.getItem('ecom_footer_config');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && typeof parsed === 'object') {
            setFooterData(parsed);
          }
        }
      } catch (_) { }

      try {
        // Try dedicated /footer endpoint first
        let res = await api.get('/footer');
        if (!res.success || !res.data) {
          // Fallback to /settings
          const setRes = await api.get('/settings');
          if (setRes.success && setRes.data?.settings?.footer_settings) {
            const raw = setRes.data.settings.footer_settings;
            res = {
              success: true,
              data: typeof raw === 'string' ? JSON.parse(raw) : raw
            };
          }
        }

        if (isMounted && res.success && res.data) {
          setFooterData(res.data);
          try {
            sessionStorage.setItem('ecom_footer_config', JSON.stringify(res.data));
          } catch (_) { }
        }
      } catch (err) {
        // Silently fallback to default config
      }
    }

    fetchFooter();

    return () => {
      isMounted = false;
    };
  }, []);

  const {
    brand = {},
    column_count = 4,
    columns = [],
    social_media = {},
    bottom_bar = {}
  } = footerData || {};

  // Responsive grid column class based on configured column_count
  const getGridColsClass = () => {
    switch (Number(column_count)) {
      case 2:
        return 'grid-cols-1 md:grid-cols-2';
      case 3:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
      case 5:
        return 'grid-cols-1 md:grid-cols-3 lg:grid-cols-5';
      case 4:
      default:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
    }
  };

  const currentYear = new Date().getFullYear().toString();
  const copyrightText = (bottom_bar.copyright_text || '© {year} Provoke Playtech Inc. All rights reserved.')
    .replace('{year}', currentYear);

  return (
    <footer className="bg-[#17202A] text-white pt-16 pb-8 border-t-[8px] border-[#F51F2D] font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`grid ${getGridColsClass()} gap-12 mb-12`}>
          {/* Brand Column */}
          {brand.show_brand_column !== false && (
            <div className="space-y-6">
              <Link href="/" className="text-3xl font-black tracking-tight text-white flex items-center gap-2">
                {brand.logo_url && !logoError ? (
                  <img
                    src={brand.logo_url}
                    alt={brand.logo_text || 'Store Logo'}
                    onError={() => setLogoError(true)}
                    className="max-h-12 w-auto object-contain"
                  />
                ) : (
                  <>
                    <Gift size={32} className="text-[#F51F2D] flex-shrink-0" />
                    <span>{brand.logo_text || 'Provoke Playtech'}</span>
                  </>
                )}
              </Link>

              {brand.about_text && (
                <p className="text-[#E7EBEF] text-sm font-medium leading-relaxed">
                  {brand.about_text}
                </p>
              )}

              {/* Social Media Links */}
              {social_media.enabled !== false && Array.isArray(social_media.links) && (
                <div className="flex flex-wrap gap-4 pt-2">
                  {social_media.links
                    .filter((s) => s.enabled && s.url && s.url !== '#')
                    .map((s, idx) => {
                      const Icon = SOCIAL_ICON_MAP[s.platform?.toLowerCase()] || Share2;
                      return (
                        <a
                          key={s.id || s.platform || idx}
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={s.label || s.platform || 'Social Link'}
                          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#F51F2D] hover:scale-110 transition-all"
                        >
                          <Icon size={18} />
                        </a>
                      );
                    })}
                </div>
              )}
            </div>
          )}

          {/* Dynamic Menu Columns */}
          {Array.isArray(columns) &&
            columns.map((col, idx) => (
              <div key={col.id || idx}>
                {col.heading && (
                  <h4 className="text-lg font-black mb-6 text-white uppercase tracking-wider">
                    {col.heading}
                  </h4>
                )}

                {col.type === 'custom' ? (
                  <div className="space-y-3 text-sm font-medium text-[#E7EBEF] whitespace-pre-line leading-relaxed">
                    {col.custom_content}
                  </div>
                ) : (
                  <ul className="space-y-4 text-sm font-medium text-[#E7EBEF]">
                    {Array.isArray(col.links) &&
                      col.links.map((link, lIdx) => {
                        const isInternal = link.url && link.url.startsWith('/') && !link.url.startsWith('//');
                        const isBlank = link.target === '_blank';
                        const linkClass = `transition-colors hover:text-[#F51F2D] ${link.highlight ? 'text-amber-400 font-semibold' : ''
                          }`;

                        return (
                          <li key={link.id || lIdx}>
                            {isInternal && !isBlank ? (
                              <Link href={link.url} className={linkClass}>
                                {link.label}
                              </Link>
                            ) : (
                              <a
                                href={link.url || '#'}
                                target={isBlank ? '_blank' : '_self'}
                                rel={isBlank ? 'noopener noreferrer' : undefined}
                                className={linkClass}
                              >
                                {link.label}
                              </a>
                            )}
                          </li>
                        );
                      })}
                  </ul>
                )}
              </div>
            ))}
        </div>

        {/* Dynamic Bottom Bar */}
        {bottom_bar.enabled !== false && (
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm font-medium text-[#5F6872] text-center md:text-left">
              {copyrightText}
            </p>

            {Array.isArray(bottom_bar.links) && bottom_bar.links.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-4 text-sm font-medium text-[#5F6872]">
                {bottom_bar.links.map((blink, bIdx) => {
                  const isInternal = blink.url && blink.url.startsWith('/') && !blink.url.startsWith('//');
                  const isBlank = blink.target === '_blank';

                  return isInternal && !isBlank ? (
                    <Link
                      key={blink.id || bIdx}
                      href={blink.url}
                      className="hover:text-white transition-colors"
                    >
                      {blink.label}
                    </Link>
                  ) : (
                    <a
                      key={blink.id || bIdx}
                      href={blink.url || '#'}
                      target={isBlank ? '_blank' : '_self'}
                      rel={isBlank ? 'noopener noreferrer' : undefined}
                      className="hover:text-white transition-colors"
                    >
                      {blink.label}
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </footer>
  );
}
