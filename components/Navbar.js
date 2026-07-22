'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getDestinationHref } from '@/utils/destinationLinks';

/* ── Mega-menu data ───────────────────────────────────── */
const destinationCols = [
  [
    { name: 'Bali', tag: 'TRENDING', tagClr: 'var(--color-card)', tagBg: 'var(--color-secondary)', href: '/tour?search=Bali' },
    { name: 'Maldives', tag: 'HONEYMOON', tagClr: 'var(--color-card)', tagBg: 'var(--color-secondary)', href: '/tour?search=Maldives' },
    { name: 'Thailand', tag: 'BUDGET', tagClr: 'var(--color-card)', tagBg: 'var(--color-secondary)', href: '/tour?search=Thailand' },
  ],
  [
    { name: 'Dubai', tag: null, href: '/tour?search=Dubai' },
    { name: 'Switzerland', tag: 'LUXURY', tagClr: 'var(--color-card)', tagBg: 'var(--color-secondary)', href: '/tour?search=Switzerland' },
    { name: 'Singapore', tag: null, href: '/tour?search=Singapore' },
  ],
  [
    { name: 'Australia', tag: null, href: '/tour?search=Australia' },
    { name: 'Japan', tag: null, href: '/tour?search=Japan' },
    { name: 'Explore 40+ Destinations →', href: '/tours?destination', isExplore: true },
  ],
];

const indiaDropdownCols = [
  [
    { name: 'Kashmir Paradise', tag: 'POPULAR', tagClr: 'var(--color-card)', tagBg: 'var(--color-secondary)', href: '/tour?search=Kashmir' },
    { name: 'Himachal Escape', tag: null, href: '/tour?search=Himachal' },
    { name: 'Kerala Backwaters', tag: 'TRENDING', tagClr: 'var(--color-card)', tagBg: 'var(--color-secondary)', href: '/tour?search=Kerala' },
  ],
  [
    { name: 'Rajasthan Royal', tag: null, href: '/tour?search=Rajasthan' },
    { name: 'Goa Beach Bliss', tag: null, href: '/tour?search=Goa' },
    { name: 'Andaman Islands', tag: null, href: '/tour?search=Andaman' },
  ],
  [
    { name: 'Leh Ladakh', tag: 'ADVENTURE', tagClr: 'var(--color-primary)', tagBg: 'var(--color-primary-light)', href: '/tour?search=Ladakh' },
    { name: 'Varanasi Spiritual', tag: null, href: '/tour?search=Varanasi' },
    { name: 'Explore All India →', href: '/packages?destination=India', isExplore: true },
  ],
];

const packageCols = [
  [
    { name: 'Honeymoon Packages', href: '/packages?type=COUPLE' },
    { name: 'Family Packages', href: '/packages?type=FAMILY' },
    { name: 'Group Packages', href: '/packages?type=GROUP' },
    { name: 'Solo Packages', href: '/packages?type=SOLO' },
  ],
  [
    { name: 'Adventure Tours', href: '/packages?type=ADVENTURE' },
    { name: 'Luxury Tours', href: '/packages?type=LUXURY' },
    { name: 'Budget Tours', href: '/packages?dest=All&price=under50' },
    { name: 'Weekend Getaways', href: '/packages' },
  ],
  [
    { name: 'Char Dham Yatra', href: '/tours/deluxe-chardham-yatra' },
    { name: 'Beach Holidays', href: '/packages?type=BEACH' },
    { name: 'Wildlife Safaris', href: '/packages?dest=Safari' },
    { name: 'View All Packages →', href: '/packages', isExplore: true },
  ],
];

const HOTEL_HREF = '/hotels';

const currencyOptions = [
  { code: 'INR', name: 'Indian Rupee', country: 'India', symbol: 'Rs' },
  { code: 'USD', name: 'US Dollar', country: 'United States', symbol: '$' },
  { code: 'EUR', name: 'Euro', country: 'Europe', symbol: 'EUR' },
  { code: 'GBP', name: 'British Pound', country: 'United Kingdom', symbol: 'GBP' },
  { code: 'AED', name: 'UAE Dirham', country: 'United Arab Emirates', symbol: 'AED' },
  { code: 'SGD', name: 'Singapore Dollar', country: 'Singapore', symbol: 'S$' },
  { code: 'THB', name: 'Thai Baht', country: 'Thailand', symbol: 'THB' },
  { code: 'MYR', name: 'Malaysian Ringgit', country: 'Malaysia', symbol: 'MYR' },
  { code: 'AUD', name: 'Australian Dollar', country: 'Australia', symbol: 'A$' },
  { code: 'CAD', name: 'Canadian Dollar', country: 'Canada', symbol: 'C$' },
  { code: 'JPY', name: 'Japanese Yen', country: 'Japan', symbol: 'JPY' },
  { code: 'CHF', name: 'Swiss Franc', country: 'Switzerland', symbol: 'CHF' },
  { code: 'NZD', name: 'New Zealand Dollar', country: 'New Zealand', symbol: 'NZ$' },
  { code: 'HKD', name: 'Hong Kong Dollar', country: 'Hong Kong', symbol: 'HK$' },
  { code: 'IDR', name: 'Indonesian Rupiah', country: 'Indonesia', symbol: 'IDR' },
  { code: 'VND', name: 'Vietnamese Dong', country: 'Vietnam', symbol: 'VND' },
  { code: 'LKR', name: 'Sri Lankan Rupee', country: 'Sri Lanka', symbol: 'LKR' },
  { code: 'MVR', name: 'Maldivian Rufiyaa', country: 'Maldives', symbol: 'MVR' },
  { code: 'SAR', name: 'Saudi Riyal', country: 'Saudi Arabia', symbol: 'SAR' },
  { code: 'QAR', name: 'Qatari Riyal', country: 'Qatar', symbol: 'QAR' },
];

const emptyForexInquiry = {
  fromCurrency: 'INR',
  toCurrency: 'USD',
  amount: '',
  purpose: 'Travel',
  travelDate: '',
  customerName: '',
  phone: '',
  email: '',
  notes: '',
};

const forexRowsFromPayload = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.data?.rows)) return payload.data.rows;
  if (Array.isArray(payload?.rows)) return payload.rows;
  if (payload?.data && typeof payload.data === 'object') return [payload.data];
  if (payload && typeof payload === 'object' && (payload.code || payload.currency_code || payload.base_code || payload.rate)) return [payload];
  return [];
};

const numberFromForex = (...values) => {
  for (const value of values) {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  return null;
};

const normalizeForexRate = (item = {}, index = 0) => {
  const rawCode = item.code || item.currency_code || item.currencyCode || item.from_code || item.fromCurrency || item.currency;
  const rawBaseCode = item.base_code || item.baseCode || item.to_code || item.toCurrency || item.quote_code || item.quoteCode;
  const code = String(rawCode || '').trim().toUpperCase();
  const baseCode = String(rawBaseCode || '').trim().toUpperCase();
  const country = String(item.country?.name || item.country_name || item.country || item.countryName || '').trim();
  const name = String(item.currency_name || item.currencyName || item.name || item.label || `${code || baseCode} currency`).trim();
  const rate = numberFromForex(
    item.rate,
    item.conversion_rate,
    item.conversionRate,
    item.exchange_rate,
    item.exchangeRate,
    item.sell_rate,
    item.sellRate,
    item.value
  );

  return {
    ...item,
    code: code || baseCode || `FX${index}`,
    baseCode,
    country: country || 'Active forex rate',
    name,
    rate,
    symbol: item.symbol || item.currency_symbol || item.currencySymbol || code || baseCode,
  };
};

const buildForexOptions = (rows = []) => {
  const seen = new Set();
  const normalized = rows
    .map(normalizeForexRate)
    .filter((currency) => currency.code && !currency.code.startsWith('FX'));

  const combined = [...normalized, ...currencyOptions];

  return combined.filter((currency) => {
    const key = currency.code;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const findForexRateMatch = (rates = [], fromCode, toCode) => {
  const from = String(fromCode || '').toUpperCase();
  const to = String(toCode || '').toUpperCase();

  if (!from || !to || from === to) return null;

  const direct = rates.find((rate) => rate.code === from && rate.baseCode === to && rate.rate);
  if (direct) return { rate: direct.rate, source: direct, mode: 'direct' };

  const reverse = rates.find((rate) => rate.code === to && rate.baseCode === from && rate.rate);
  if (reverse) return { rate: 1 / reverse.rate, source: reverse, mode: 'reverse' };

  return null;
};

const formatMoneyValue = (value, code) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return '';
  return `${amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })} ${code}`;
};

const firstObjectFromPayload = (payload) => {
  if (!payload) return null;
  if (Array.isArray(payload)) return payload[0] || null;
  if (Array.isArray(payload?.data)) return payload.data[0] || null;
  if (Array.isArray(payload?.data?.rows)) return payload.data.rows[0] || null;
  if (payload?.data && typeof payload.data === 'object') return payload.data;
  if (payload && typeof payload === 'object') return payload;
  return null;
};

const getCustomerId = (user) => (
  user?.id ||
  user?.customer_id ||
  user?.customerId ||
  user?.user_id ||
  user?.user?.id ||
  user?.customer?.id ||
  null
);

const normalizeForexServiceCharge = (payload) => {
  const item = firstObjectFromPayload(payload);
  if (!item) return null;

  const type = item.type || item.charge_type || item.chargeType || item.service_charge_type || item.serviceChargeType;
  const value = numberFromForex(
    item.value,
    item.amount,
    item.charge,
    item.service_charge,
    item.serviceCharge,
    item.forex_service_charge,
    item.forexServiceCharge
  );

  if (!type && !value) return null;

  return {
    type: String(type || 'fixed').toLowerCase(),
    value,
  };
};

const normalizeForexConversion = (payload, fallback = {}) => {
  const item = firstObjectFromPayload(payload);
  if (!item) return null;

  const rate = numberFromForex(
    item.rate,
    item.conversion_rate,
    item.conversionRate,
    item.exchange_rate,
    item.exchangeRate,
    fallback.rate
  );
  const convertedAmount = numberFromForex(
    item.converted_amount,
    item.convertedAmount,
    item.converted,
    item.destination_amount,
    item.destinationAmount,
    fallback.convertedAmount
  );
  const serviceCharge = numberFromForex(
    item.service_charge,
    item.serviceCharge,
    item.charge_amount,
    item.chargeAmount,
    item.fee,
    fallback.serviceCharge
  );
  const totalAmount = numberFromForex(
    item.total_amount,
    item.totalAmount,
    item.payable_amount,
    item.payableAmount,
    item.final_amount,
    item.finalAmount,
    serviceCharge && convertedAmount ? convertedAmount + serviceCharge : fallback.totalAmount
  );

  return {
    ...item,
    rate,
    convertedAmount,
    serviceCharge,
    totalAmount,
    requestId: item.id || item.request_id || item.requestId || item.forex_request_id || item.forexRequestId,
  };
};

function CurrencyCombobox({ id, label, value, onChange, currencies = currencyOptions, loading = false }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapRef = useRef(null);
  const selected = currencies.find((currency) => currency.code === value) || null;
  const filteredCurrencies = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return currencies;

    return currencies.filter((currency) => (
      String(currency.code || '').toLowerCase().includes(query) ||
      String(currency.name || '').toLowerCase().includes(query) ||
      String(currency.country || '').toLowerCase().includes(query) ||
      String(currency.baseCode || '').toLowerCase().includes(query)
    ));
  }, [currencies, search]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!wrapRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  const chooseCurrency = (currency) => {
    onChange(currency.code);
    setSearch('');
    setOpen(false);
  };

  return (
    <label className="forex-currency-field" ref={wrapRef}>
      {label}
      <div className={`forex-currency-combobox${open ? ' is-open' : ''}`}>
        <div className="forex-currency-selected">
          {selected ? (
            <>
              <strong>{selected.code}</strong>
              <span>{selected.name}</span>
              {selected.baseCode ? <em>{selected.baseCode}</em> : null}
            </>
          ) : (
            <span>Select currency</span>
          )}
        </div>
        <input
          id={id}
          type="text"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search code or country"
          autoComplete="off"
        />
        <button type="button" aria-label={`Open ${label} currency list`} onClick={() => setOpen((current) => !current)}>
          <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
            <path d="M7 10l5 5 5-5z" />
          </svg>
        </button>
        {open ? (
          <div className="forex-currency-menu">
            {loading ? (
              <div className="forex-currency-empty">Loading active rates...</div>
            ) : filteredCurrencies.length ? filteredCurrencies.map((currency) => (
              <button
                key={`${currency.code}-${currency.baseCode || currency.country || 'currency'}`}
                type="button"
                className={currency.code === value ? 'active' : ''}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => chooseCurrency(currency)}
              >
                <span>
                  <strong>{currency.code}</strong>
                  <small>{currency.name}{currency.baseCode ? ` to ${currency.baseCode}` : ''}</small>
                </span>
                <em>{currency.country}</em>
              </button>
            )) : (
              <div className="forex-currency-empty">No currency found</div>
            )}
          </div>
        ) : null}
      </div>
    </label>
  );
}

/* ── Tag badge component ──────────────────────────────── */
function Tag({ label, color, bg }) {
  return (
    <span style={{
      display: 'inline-block',
      background: bg,
      color: color,
      fontSize: 8,
      fontWeight: 700,
      letterSpacing: 0.8,
      padding: 'var(--space-1) var(--space-2)',
      borderRadius: 'var(--radius-sm)',
      marginLeft: 'var(--space-2)',
      lineHeight: 1.6,
      verticalAlign: 'middle',
      textTransform: 'uppercase',
    }}>
      {label}
    </span>
  );
}

/* ── Mega Dropdown ────────────────────────────────────── */
function MegaDropdown({ label, cols, isTransparent }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const linkColor = isTransparent ? 'rgba(255,255,255,0.92)' : 'var(--color-text-secondary)';

  return (
    <li ref={ref} style={{ position: 'relative', listStyle: 'none' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: 'var(--space-1)',
          background: 'none', border: 'none', cursor: 'pointer',
          color: linkColor, fontSize: 13, fontWeight: 600,
          padding: 'var(--space-2) var(--space-1)',
          transition: 'color var(--transition-base)',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={e => { if (!isTransparent) e.currentTarget.style.color = 'var(--color-primary)'; }}
        onMouseLeave={e => { if (!isTransparent) e.currentTarget.style.color = 'var(--color-text-secondary)'; }}
      >
        {label}
        <svg
          viewBox="0 0 24 24" fill="currentColor" width="14" height="14"
          style={{
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform var(--transition-fast)',
            opacity: 0.7,
          }}
        >
          <path d="M7 10l5 5 5-5z" />
        </svg>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 14px)',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'white',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-md)',
            border: '1px solid var(--color-border)',
            padding: 'var(--space-5) var(--space-6)',
            display: 'flex',
            gap: 0,
            zIndex: 999,
            animation: 'dropIn 0.2s ease',
            minWidth: 540,
          }}
        >
          {cols.map((col, ci) => (
            <div
              key={ci}
              style={{
                flex: 1,
                paddingRight: ci < cols.length - 1 ? 20 : 0,
                marginRight: ci < cols.length - 1 ? 20 : 0,
                borderRight: ci < cols.length - 1 ? '1px solid var(--color-border)' : 'none',
              }}
            >
              {col.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: 'var(--space-2) 0',
                    borderBottom: '1px solid var(--color-bg)',
                    textDecoration: 'none',
                    color: item.isExplore ? 'var(--color-primary)' : 'var(--color-text-primary)',
                    fontWeight: item.isExplore ? 700 : 500,
                    fontSize: 13.5,
                    transition: 'color var(--transition-fast)',
                    lineHeight: 1.5,
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-primary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = item.isExplore ? 'var(--color-primary)' : 'var(--color-text-primary)'; }}
                >
                  {item.name}
                  {item.tag && (
                    <Tag label={item.tag} color={item.tagClr} bg={item.tagBg} />
                  )}
                </Link>
              ))}
            </div>
          ))}
        </div>
      )}
    </li>
  );
}

/* ── Side Drawer ───────────────────────────────────────── */
function SideDrawer({ isOpen, onClose, allCategories, isLoggedIn, currentUser, onLogout, onForexOpen, companyInfo }) {
  const [expanded, setExpanded] = useState(null);
  const displayPhone = companyInfo?.contact?.phone || '+91 8031274154';
  const firstName = isLoggedIn ? currentUser?.name?.split(' ')[0] || 'Traveler' : 'Guest';
  const userInitial = firstName.charAt(0).toUpperCase() || 'G';

  const getNavIcon = (label = '') => {
    const key = label.toLowerCase();
    if (key.includes('holiday') || key.includes('package')) return 'HP';
    if (key.includes('hotel')) return 'HT';
    if (key.includes('forex')) return 'FX';
    if (key.includes('profile')) return 'MP';
    if (key.includes('login')) return 'IN';
    if (key.includes('faq')) return 'QA';
    if (key.includes('contact')) return 'CT';
    if (key.includes('blog')) return 'BL';
    if (key.includes('about')) return 'AB';
    if (key.includes('testimonial')) return 'TS';
    return label.slice(0, 2).toUpperCase();
  };

  const toggleExpand = (label) => {
    setExpanded(expanded === label ? null : label);
  };

  const navGroup = [
    {
      label: 'Holiday Tour Packages',
      hasSub: true,
      subItems: packageCols.flat().map((item) => ({
        label: item.name,
        href: item.href,
      })),
    },
    { label: 'Hotels', href: HOTEL_HREF },
    { label: 'Testimonial', href: '/testimonials' },
    { label: 'FAQ', href: '/contact#faq' },
    { label: 'Contact us', href: '/contact' },
    { label: 'Blog', href: '/blog' },
    { label: 'About us', href: '/about' },
    ...(isLoggedIn
      ? [{ label: 'My Profile', href: '/profile' }]
      : [{ label: 'Login', href: '/auth/login' }]),
    // Previous static login link kept for reference:
    // { label: 'Login', href: '/auth/login' },
    // { label: 'Careers', href: '/careers' },
    // { label: 'Choose Country', hasSub: true, subItems: ['USA', 'UK', 'Australia', 'UAE'] },
  ];

  const dynamicGroups = (allCategories || []).map(cat => ({
    label: cat.name,
    hasSub: (cat.destinations && cat.destinations.length > 0),
    subItems: (cat.destinations || []).map(dest => ({
      label: dest.name,
      href: getDestinationHref(dest)
    }))
  }));

  const navGroups = [...dynamicGroups, ...navGroup];

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.4)',
          zIndex: 2000,
          opacity: isOpen ? 1 : 0,
          visibility: isOpen ? 'visible' : 'hidden',
          transition: 'all var(--transition-base)',
          backdropFilter: 'blur(4px)',
        }}
      />
      <div
        style={{
          position: 'fixed', top: 0, right: 0,
          width: '100%', maxWidth: 360, height: '100vh',
          background: 'linear-gradient(180deg, var(--color-card) 0%, var(--color-bg-soft) 100%)', zIndex: 2001,
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform var(--transition-slow)',
          display: 'flex', flexDirection: 'column',
          boxShadow: '-18px 0 50px rgba(15,23,42,0.22)',
        }}
      >
        {/* Header */}
        <div style={{ padding: 'var(--space-5) var(--space-5) var(--space-4)', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
            <span style={{ color: 'var(--color-primary)', fontSize: 11, fontWeight: 900, letterSpacing: 1.6, textTransform: 'uppercase' }}>
              Travel Menu
            </span>
            <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 'var(--radius-lg)', background: 'var(--color-bg-soft)', border: '1px solid var(--color-border)', cursor: 'pointer', padding: 0, color: 'var(--color-text-muted)', display: 'grid', placeItems: 'center' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="20" height="20">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-4)', borderRadius: 'var(--radius-xl)', background: 'var(--gradient-primary)', color: 'white', boxShadow: '0 14px 30px color-mix(in srgb, var(--color-primary) 24%, transparent)' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.28)', display: 'grid', placeItems: 'center', fontSize: 15, fontWeight: 900 }}>
              {userInitial}
            </div>
            <div style={{ minWidth: 0 }}>
              <h2 style={{ fontSize: 17, fontWeight: 850, margin: 0, color: 'white' }}>
                Hello, {firstName}
              </h2>
              <p style={{ margin: '3px 0 0', color: 'rgba(255,255,255,0.74)', fontSize: 12, fontWeight: 700 }}>
                {isLoggedIn ? 'Manage your travel faster' : 'Sign in for saved trips'}
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-4) var(--space-4) var(--space-3)' }}>
          {navGroups?.map((group, idx) => {
            const isExpanded = expanded === group.label;
            const hasHref = !!group.href;
            const hasAction = typeof group.action === 'function';
            const navIcon = getNavIcon(group.label);

            const ItemTrigger = (
              <div
                onClick={() => {
                  if (group.hasSub) toggleExpand(group.label);
                  if (hasAction) {
                    group.action();
                    onClose();
                  }
                }}
                style={{
                  padding: 'var(--space-3)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'all var(--transition-base)',
                  background: isExpanded ? 'var(--color-primary-light)' : 'white',
                  border: isExpanded ? '1px solid var(--brand-primary-border)' : '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: isExpanded ? '0 10px 22px color-mix(in srgb, var(--color-primary) 14%, transparent)' : 'var(--shadow-sm)',
                }}
                onMouseEnter={e => { if (!isExpanded) e.currentTarget.style.background = 'color-mix(in srgb, var(--color-primary) 8%, white)'; }}
                onMouseLeave={e => { if (!isExpanded) e.currentTarget.style.background = 'white'; }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', minWidth: 0 }}>
                  <span style={{ width: 34, height: 34, flex: '0 0 34px', borderRadius: 'var(--radius-lg)', display: 'grid', placeItems: 'center', background: isExpanded ? 'var(--color-primary)' : 'color-mix(in srgb, var(--color-primary) 10%, white)', color: isExpanded ? 'white' : 'var(--color-primary)', fontSize: 10, fontWeight: 950, letterSpacing: 0.3 }}>
                    {navIcon}
                  </span>
                  <span style={{ fontSize: 13.5, fontWeight: isExpanded ? 850 : 750, color: isExpanded ? 'var(--color-text-primary)' : 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {group.label}
                  </span>
                </span>
                <span style={{ width: 28, height: 28, borderRadius: 9, display: 'grid', placeItems: 'center', color: isExpanded ? 'var(--color-primary)' : 'var(--color-text-muted)', background: isExpanded ? 'var(--color-card)' : 'color-mix(in srgb, var(--color-primary) 6%, white)' }}>
                  {group.hasSub ? (
                    <svg
                      viewBox="0 0 24 24" fill="currentColor" width="16" height="16"
                      style={{
                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform var(--transition-base)',
                      }}
                    >
                      <path d="M7 10l5 5 5-5z" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="14" height="14" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  )}
                </span>
              </div>
            );

            return (
              <div key={idx} style={{ marginBottom: 'var(--space-2)' }}>
                {hasHref ? (
                  <Link href={group.href} style={{ textDecoration: 'none' }} onClick={onClose}>
                    {ItemTrigger}
                  </Link>
                ) : hasAction ? (
                  <button type="button" style={{ width: '100%', border: 0, background: 'transparent', padding: 0, textAlign: 'left' }}>
                    {ItemTrigger}
                  </button>
                ) : ItemTrigger}

                {/* Expanded Sub-items */}
                {group.hasSub && isExpanded && (
                  <div style={{ display: 'grid', gap: 'var(--space-2)', padding: '10px 4px 4px 48px' }}>
                    {group.subItems.map((sub, sidx) => {
                      const isObj = typeof sub === 'object';
                      const label = isObj ? sub.label : sub;
                      const href = isObj ? sub.href : '#';

                      const ItemContent = (
                        <div
                          style={{
                            padding: 'var(--space-2) var(--space-3)',
                            borderRadius: 'var(--radius-lg)',
                            background: 'var(--color-card)',
                            border: '1px solid var(--color-border)',
                            fontSize: '12.5px',
                            fontWeight: 750,
                            color: 'var(--color-text-secondary)',
                            cursor: 'pointer',
                            transition: 'all var(--transition-base)',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-primary)'; e.currentTarget.style.background = 'color-mix(in srgb, var(--color-primary) 8%, white)'; e.currentTarget.style.borderColor = 'var(--brand-primary-border)'; }}
                          onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-text-secondary)'; e.currentTarget.style.background = 'var(--color-card)'; e.currentTarget.style.borderColor = 'var(--color-border)'; }}
                        >
                          {label}
                        </div>
                      );

                      return isObj && href !== '#' ? (
                        <Link key={sidx} href={href} style={{ textDecoration: 'none' }} onClick={onClose}>
                          {ItemContent}
                        </Link>
                      ) : (
                        <div key={sidx}>{ItemContent}</div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ padding: 'var(--space-4) var(--space-5) var(--space-5)', background: 'var(--color-card)', borderTop: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div>
              <div style={{ color: 'var(--color-text-primary)', fontSize: 12, fontWeight: 900 }}>Need help planning?</div>
              <div style={{ marginTop: 2, color: 'var(--color-text-muted)', fontSize: 12, fontWeight: 700 }}>{displayPhone}</div>
            </div>
            {isLoggedIn ? (
              <button
                type="button"
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                style={{
                  fontSize: 12,
                  fontWeight: 900,
                  color: 'var(--color-card)',
                  background: 'var(--color-primary)',
                  border: '1px solid var(--color-primary)',
                  borderRadius: 999,
                  padding: 'var(--space-2) var(--space-3)',
                }}
              >
                Sign out
              </button>
            ) : (
              <Link href="/auth/login" onClick={onClose} style={{ fontSize: 12, fontWeight: 900, color: 'white', background: 'var(--color-primary)', borderRadius: 999, padding: 'var(--space-3) var(--space-4)', textDecoration: 'none' }}>
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Main Navbar ──────────────────────────────────────── */
import {
  AUTH_CHANGED_EVENT,
  clearAuthSession,
  convertForexRate,
  getCategories,
  getDestinationsByCategory,
  getForexRateByCode,
  getForexRates,
  getForexServiceCharge,
  getStoredAuth,
  getStoredToken,
} from '@/utils/api';

const getLogoUrl = (logo) => {
  if (!logo) return '';
  if (/^(https?:|data:|blob:)/i.test(logo)) return logo;
  if (!String(logo).startsWith('/uploads')) return logo;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_IMAGE_URL || 'https://ratnamforex.yber.in';
  return `${baseUrl.replace(/\/$/, '')}/${String(logo).replace(/^\//, '')}`;
};

export default function Navbar({ brand, companyInfo }) {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [atHero, setAtHero] = useState(true);
  const [categories, setCategories] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [forexOpen, setForexOpen] = useState(false);
  const [forexDraft, setForexDraft] = useState(emptyForexInquiry);
  const [forexInquiry, setForexInquiry] = useState('');
  const [forexRates, setForexRates] = useState([]);
  const [forexRatesLoading, setForexRatesLoading] = useState(false);
  const [forexRatesError, setForexRatesError] = useState('');
  const [forexLookupLoading, setForexLookupLoading] = useState(false);
  const [forexLookupRate, setForexLookupRate] = useState(null);
  const [forexServiceCharge, setForexServiceCharge] = useState(null);
  const [forexConversion, setForexConversion] = useState(null);
  const pathname = usePathname();

  const isHeroPage = pathname === '/' || pathname === '/packages' || pathname.startsWith('/package') || pathname.startsWith('/tours') || pathname.startsWith('/hotels') || pathname.startsWith('/about') || pathname.startsWith('/blog') || pathname.startsWith('/contact');

  useEffect(() => {
    const fetchNavbarCategoriesAndDests = async () => {
      const allCats = await getCategories();

      // Helper to fetch destinations for a list of categories
      const enrichCategories = async (cats) => {
        return await Promise.all(
          cats.map(async (cat) => {
            const apiDests = await getDestinationsByCategory(cat.id);
            let mappedItems = apiDests.map(item => {
              const tagStr = item.type ? item.type.split(',')[0].trim().toUpperCase() : null;
              return {
                name: item.name.charAt(0).toUpperCase() + item.name.slice(1),
                href: getDestinationHref(item),
                tag: tagStr,
                tagClr: tagStr === 'BEACH' ? 'var(--color-secondary)' : 'var(--color-primary)',
                tagBg: tagStr === 'BEACH' ? 'var(--color-secondary-hover)' : 'var(--color-secondary-hover)'
              };
            });

            if (mappedItems.length > 0) {
              mappedItems.push({
                name: `Explore All →`,
                href: `/tours?destination`,
                isExplore: true
              });
            }

            // Distribute into 3 columns automatically
            const columnCount = 3;
            const itemsPerCol = Math.ceil(mappedItems.length / columnCount) || 1;
            const cols = [];
            for (let i = 0; i < mappedItems.length; i += itemsPerCol) {
              cols.push(mappedItems.slice(i, i + itemsPerCol));
            }
            return { ...cat, destinations: apiDests, cols };
          })
        );
      };

      // Filter for Menu (Desktop)
      const menuCatsRaw = allCats.filter(cat => cat.show_in_menu === true);
      const menuCats = await enrichCategories(menuCatsRaw);
      setCategories(menuCats);

      // Filter for Sidebar (Mobile) - Include both menu and sidebar flagged categories
      const sidebarCatsRaw = allCats.filter(cat => cat.show_in_sidebar == true || cat.show_in_menu == true);
      const sidebarCats = await enrichCategories(sidebarCatsRaw);
      setAllCategories(sidebarCats);
    };
    fetchNavbarCategoriesAndDests();
  }, []);

  useEffect(() => {
    const syncAuthState = () => {
      const token = getStoredToken();
      setIsLoggedIn(Boolean(token));
      setCurrentUser(getStoredAuth());
    };

    syncAuthState();
    window.addEventListener('storage', syncAuthState);
    window.addEventListener(AUTH_CHANGED_EVENT, syncAuthState);

    return () => {
      window.removeEventListener('storage', syncAuthState);
      window.removeEventListener(AUTH_CHANGED_EVENT, syncAuthState);
    };
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 60);
      setAtHero(y < 80);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setDrawerOpen(false));
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  useEffect(() => {
    if (!forexOpen) return undefined;

    let active = true;

    const loadForexRates = async () => {
      setForexRatesLoading(true);
      setForexRatesError('');

      const [result, chargeResult] = await Promise.all([
        getForexRates(),
        getForexServiceCharge(),
      ]);
      if (!active) return;

      const rows = forexRowsFromPayload(result).map(normalizeForexRate).filter((rate) => rate.code);
      setForexRates(rows);
      setForexServiceCharge(normalizeForexServiceCharge(chargeResult));

      if (!rows.length) {
        setForexRatesError(result?.message || 'Active forex rates are not available right now.');
      }

      setForexRatesLoading(false);
    };

    loadForexRates();

    return () => {
      active = false;
    };
  }, [forexOpen]);

  const forexOptions = useMemo(() => buildForexOptions(forexRates), [forexRates]);
  const forexEstimate = useMemo(() => {
    const rows = forexLookupRate ? [forexLookupRate, ...forexRates] : forexRates;
    const match = findForexRateMatch(rows, forexDraft.fromCurrency, forexDraft.toCurrency);
    const amount = Number(forexDraft.amount || 0);

    if (!match || !amount) return { match, convertedAmount: null };

    return {
      match,
      convertedAmount: amount * match.rate,
    };
  }, [forexDraft.amount, forexDraft.fromCurrency, forexDraft.toCurrency, forexLookupRate, forexRates]);

  if (pathname?.startsWith('/auth') || pathname === '/customize') {
    return null;
  }

  const brandLogo = getLogoUrl(companyInfo?.company_logo_url) || brand?.logo || '/logooo.png';
  const brandName = brand?.legalName || 'ITS TRAVELS AND TOURS';
  const isTransparent = isHeroPage && atHero && !scrolled && !drawerOpen;
  const isLightHeader = isTransparent || scrolled;
  const linkColor = isLightHeader ? 'rgba(255,255,255,0.92)' : 'var(--color-text-secondary)';
  const navButtonStyle = {
    padding: 'var(--space-2) var(--space-5)',
    borderRadius: 'var(--radius-md)',
    border: isLightHeader ? '1.5px solid rgba(255,255,255,0.6)' : '1.5px solid var(--color-border)',
    color: isLightHeader ? 'white' : 'var(--color-text-secondary)',
    fontWeight: 600,
    fontSize: 13,
    textDecoration: 'none',
    background: isLightHeader ? 'rgba(255,255,255,0.1)' : 'white',
    backdropFilter: 'blur(6px)',
    transition: 'all var(--transition-base)',
  };

  const updateForexDraft = (key, value) => {
    setForexDraft((current) => ({ ...current, [key]: value }));
    setForexConversion(null);
    setForexInquiry('');
  };

  const generateForexInquiry = async (event) => {
    event.preventDefault();
    const customerId = getCustomerId(currentUser);
    const amountValue = Number(forexDraft.amount || 0);

    if (!customerId) {
      setForexRatesError('Please login before creating a forex conversion request.');
      return;
    }

    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      setForexRatesError('Enter a valid conversion amount.');
      return;
    }

    setForexLookupLoading(true);
    setForexRatesError('');
    setForexConversion(null);

    const [lookup, conversionResponse] = await Promise.all([
      getForexRateByCode(forexDraft.fromCurrency),
      convertForexRate({
        customerId,
        fromCurrency: forexDraft.fromCurrency,
        toCurrency: forexDraft.toCurrency,
        amount: amountValue,
      }),
    ]);
    const lookupRows = forexRowsFromPayload(lookup).map(normalizeForexRate).filter((rate) => rate.code);
    const nextLookupRate = lookupRows[0] || null;
    setForexLookupRate(nextLookupRate);

    const fromCurrency = forexOptions.find((currency) => currency.code === forexDraft.fromCurrency);
    const toCurrency = forexOptions.find((currency) => currency.code === forexDraft.toCurrency);
    const amount = amountValue.toLocaleString('en-IN');
    const lookupEstimate = findForexRateMatch(
      nextLookupRate ? [nextLookupRate, ...forexRates] : forexRates,
      forexDraft.fromCurrency,
      forexDraft.toCurrency
    );
    const convertedAmount = lookupEstimate && amountValue ? amountValue * lookupEstimate.rate : null;
    const normalizedConversion = normalizeForexConversion(conversionResponse, {
      rate: lookupEstimate?.rate,
      convertedAmount,
    });
    const contact = [
      forexDraft.customerName && `Name: ${forexDraft.customerName.trim()}`,
      forexDraft.phone && `Phone: ${forexDraft.phone.trim()}`,
      forexDraft.email && `Email: ${forexDraft.email.trim()}`,
    ].filter(Boolean).join(' | ');

    if (conversionResponse?.success === false) {
      setForexRatesError(conversionResponse?.message || 'Unable to create the forex conversion request.');
    }

    setForexConversion(normalizedConversion);
    setForexInquiry([
      `Forex inquiry to convert ${amount} ${fromCurrency?.code || forexDraft.fromCurrency} to ${toCurrency?.code || forexDraft.toCurrency}.`,
      normalizedConversion?.convertedAmount ? `Converted value: ${formatMoneyValue(normalizedConversion.convertedAmount, toCurrency?.code || forexDraft.toCurrency)}.` : convertedAmount ? `Estimated value: ${formatMoneyValue(convertedAmount, toCurrency?.code || forexDraft.toCurrency)} at ${formatMoneyValue(lookupEstimate.rate, toCurrency?.code || forexDraft.toCurrency)} per ${fromCurrency?.code || forexDraft.fromCurrency}.` : 'Rate will be confirmed by the forex team.',
      normalizedConversion?.serviceCharge ? `Service charge: ${formatMoneyValue(normalizedConversion.serviceCharge, toCurrency?.code || forexDraft.toCurrency)}.` : '',
      normalizedConversion?.totalAmount ? `Total amount: ${formatMoneyValue(normalizedConversion.totalAmount, toCurrency?.code || forexDraft.toCurrency)}.` : '',
      normalizedConversion?.requestId ? `Request ID: ${normalizedConversion.requestId}.` : '',
      `Purpose: ${forexDraft.purpose}.`,
      forexDraft.travelDate ? `Travel date: ${forexDraft.travelDate}.` : '',
      contact,
      forexDraft.notes.trim() ? `Notes: ${forexDraft.notes.trim()}` : '',
    ].filter(Boolean).join(' '));

    if (!normalizedConversion && !lookupRows.length && !lookupEstimate) {
      setForexRatesError(lookup?.message || 'No active rate found for the selected currency pair.');
    }

    setForexLookupLoading(false);
  };

  const swapForexCurrencies = () => {
    setForexDraft((current) => ({
      ...current,
      fromCurrency: current.toCurrency,
      toCurrency: current.fromCurrency,
    }));
    setForexConversion(null);
    setForexInquiry('');
  };

  return (
    <>
      {/* Inject keyframe for dropdown animation */}
      <style>{`
        @keyframes dropIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-8px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        .nav-plain-link {
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          padding: 6px 2px;
          white-space: nowrap;
          transition: color 0.2s;
          position: relative;
        }
        .nav-plain-link::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0;
          width: 0; height: 2px;
          background: var(--color-primary);
          border-radius: 999px;
          transition: width 0.25s;
        }
        .nav-plain-link:hover::after,
        .nav-plain-link.active::after { width: 100%; }
        .nav-plain-link:hover,
        .nav-plain-link.active {
          color: var(--color-primary) !important;
        }
        .nav-social-icon {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 1.5px solid currentColor;
          background: transparent;
          color: inherit;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          text-decoration: none;
        }
        .nav-social-icon:hover {
          background: var(--color-primary-hover);
          color: var(--color-card);
          transform: scale(1.08);
        }
        .forex-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 2200;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: rgba(15, 23, 42, 0.58);
          backdrop-filter: blur(5px);
        }
        .forex-modal {
          width: min(100%, 720px);
          max-height: min(86vh, 760px);
          overflow: auto;
          border-radius: var(--radius-md);
          background: var(--color-card);
          box-shadow: 0 28px 70px rgba(0,0,0,0.28);
        }
        .forex-modal-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 18px;
          padding: 22px 24px;
          background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
          color: var(--color-card);
        }
        .forex-modal-head span {
          display: block;
          margin-bottom: 6px;
          color: #c9fff2;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: .8px;
          text-transform: uppercase;
        }
        .forex-modal-head h2 {
          margin: 0 0 6px;
          font-family: "Italiana", sans-serif;
          font-size: 24px;
          font-weight: 900;
        }
        .forex-modal-head p {
          margin: 0;
          color: rgba(255,255,255,.8);
          font-size: 14px;
          line-height: 1.5;
        }
        .forex-modal-close {
          width: 36px;
          height: 36px;
          border: 1px solid rgba(255,255,255,.35);
          border-radius: 50%;
          background: rgba(255,255,255,.12);
          color: var(--color-card);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex: 0 0 auto;
        }
        .forex-modal-form {
          display: grid;
          gap: 16px;
          padding: 20px 22px 22px;
        }
        .forex-modal-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }
        .forex-modal-grid label {
          display: grid;
          gap: 7px;
          color: var(--color-text-secondary);
          font-size: 12px;
          font-weight: 900;
        }
        .forex-conversion-row {
          grid-column: 1 / -1;
          display: grid;
          grid-template-columns: minmax(0, 1fr) 42px minmax(0, 1fr);
          gap: 10px;
          align-items: end;
        }
        .forex-currency-field {
          min-width: 0;
        }
        .forex-currency-combobox {
          position: relative;
          display: grid;
          grid-template-columns: minmax(0, 1fr) 42px;
          grid-template-areas:
            "selected toggle"
            "search toggle";
          min-height: 64px;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          background: var(--color-card);
          transition: border-color .18s ease, box-shadow .18s ease;
        }
        .forex-currency-combobox.is-open {
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 14%, transparent);
        }
        .forex-currency-selected {
          grid-area: selected;
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
          padding: 9px 12px 0;
        }
        .forex-currency-selected strong {
          color: var(--color-text-primary);
          font-size: 15px;
          font-weight: 900;
          letter-spacing: .3px;
        }
        .forex-currency-selected span {
          min-width: 0;
          color: var(--color-text-muted);
          font-size: 12px;
          font-weight: 800;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .forex-currency-selected em {
          flex: 0 0 auto;
          padding: 2px 6px;
          border-radius: 999px;
          background: var(--color-secondary-hover);
          color: var(--color-secondary);
          font-size: 10px;
          font-style: normal;
          font-weight: 900;
        }
        .forex-currency-combobox input {
          grid-area: search;
          min-height: 28px;
          border: 0;
          border-radius: 0;
          padding: 0 12px 8px;
          color: var(--color-text-primary);
          font-size: 13px;
          font-weight: 700;
          outline: none;
        }
        .forex-currency-combobox > button {
          grid-area: toggle;
          border: 0;
          border-left: 1px solid var(--color-border);
          border-radius: 0 8px 8px 0;
          background: var(--color-bg-soft);
          color: var(--color-text-secondary);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        .forex-currency-combobox.is-open > button svg {
          transform: rotate(180deg);
        }
        .forex-currency-menu {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          right: 0;
          z-index: 30;
          max-height: 248px;
          overflow-y: auto;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          background: var(--color-card);
          box-shadow: 0 18px 42px rgba(15,23,42,.18);
          padding: 6px;
        }
        .forex-currency-menu button {
          width: 100%;
          border: 0;
          border-radius: 7px;
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 10px;
          text-align: left;
          cursor: pointer;
        }
        .forex-currency-menu button:hover,
        .forex-currency-menu button.active {
          background: var(--color-secondary-hover);
        }
        .forex-currency-menu button span {
          display: grid;
          gap: 2px;
          min-width: 0;
        }
        .forex-currency-menu button strong {
          color: var(--color-text-primary);
          font-size: 13px;
          font-weight: 900;
        }
        .forex-currency-menu button small {
          color: var(--color-text-muted);
          font-size: 12px;
          font-weight: 700;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .forex-currency-menu button em {
          flex: 0 0 auto;
          max-width: 120px;
          color: var(--color-secondary);
          font-size: 11px;
          font-style: normal;
          font-weight: 900;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .forex-currency-empty {
          padding: 14px 12px;
          color: var(--color-text-muted);
          font-size: 13px;
          font-weight: 800;
          text-align: center;
        }
        .forex-swap-button {
          width: 42px;
          height: 42px;
          margin-bottom: 11px;
          border: 1px solid var(--color-border);
          border-radius: 50%;
          background: var(--color-card);
          color: var(--color-primary);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform .18s ease, background .18s ease, color .18s ease;
        }
        .forex-swap-button:hover {
          background: var(--color-primary);
          color: var(--color-card);
          transform: rotate(180deg);
        }
        .forex-modal-grid input,
        .forex-modal-grid select,
        .forex-modal-grid textarea {
          width: 100%;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          background: var(--color-card);
          color: var(--color-text-primary);
          font: inherit;
          font-size: 14px;
          outline: none;
        }
        .forex-modal-grid input,
        .forex-modal-grid select {
          min-height: 44px;
          padding: 0 12px;
        }
        .forex-modal-grid textarea {
          min-height: 92px;
          padding: 12px;
          resize: vertical;
        }
        .forex-modal-grid .forex-currency-combobox input {
          min-height: 28px;
          border: 0;
          border-radius: 0;
          padding: 0 12px 8px;
        }
        .forex-modal-notes { grid-column: 1 / -1; }
        .forex-rate-preview {
          grid-column: 1 / -1;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          padding: 14px 16px;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          background: var(--color-secondary-hover);
          color: var(--color-text-primary);
        }
        .forex-rate-preview strong {
          display: block;
          color: var(--color-text-primary);
          font-size: 13px;
          font-weight: 950;
        }
        .forex-rate-preview span {
          display: block;
          margin-top: 3px;
          color: var(--color-text-secondary);
          font-size: 13px;
          font-weight: 800;
          line-height: 1.45;
        }
        .forex-rate-preview small {
          flex: 0 0 auto;
          color: var(--color-secondary);
          font-size: 12px;
          font-weight: 900;
          text-align: right;
        }
        .forex-charge-note {
          grid-column: 1 / -1;
          margin-top: -6px;
          color: var(--color-text-secondary);
          font-size: 12px;
          font-weight: 850;
        }
        .forex-rate-error {
          grid-column: 1 / -1;
          margin: 0;
          padding: 11px 13px;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          background: var(--color-secondary-hover);
          color: var(--color-secondary);
          font-size: 13px;
          font-weight: 850;
        }
        .forex-modal-form > button {
          justify-self: start;
          min-height: 44px;
          padding: 0 18px;
          border: 0;
          border-radius: var(--radius-md);
          background: var(--color-primary);
          color: var(--color-card);
          font-weight: 900;
          cursor: pointer;
        }
        .forex-modal-form > button:disabled {
          cursor: wait;
          opacity: .72;
        }
        .forex-modal-output {
          padding: 15px 16px;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          background: var(--color-secondary-hover);
          color: var(--color-text-primary);
        }
        .forex-modal-output strong {
          display: block;
          margin-bottom: 5px;
          font-size: 13px;
          font-weight: 900;
        }
        .forex-result-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 8px;
          margin: 10px 0 12px;
        }
        .forex-result-grid span {
          min-height: 62px;
          padding: 10px;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          background: var(--color-secondary-hover);
          color: var(--color-text-primary);
          font-size: 13px;
          font-weight: 900;
          overflow-wrap: anywhere;
        }
        .forex-result-grid b {
          display: block;
          margin-bottom: 4px;
          color: var(--color-text-secondary);
          font-size: 11px;
          text-transform: uppercase;
        }
        .forex-modal-output p {
          margin: 0;
          color: var(--color-text-primary);
          font-size: 14px;
          line-height: 1.55;
        }
        @media (max-width: 640px) {
          .forex-modal-grid { grid-template-columns: 1fr; }
          .forex-conversion-row {
            grid-template-columns: 1fr;
          }
          .forex-swap-button {
            justify-self: center;
            margin: 0;
            transform: rotate(90deg);
          }
          .forex-swap-button:hover {
            transform: rotate(270deg);
          }
          .forex-modal-head { padding: 20px; }
          .forex-modal-form { padding: 18px; }
          .forex-rate-preview {
            align-items: flex-start;
            flex-direction: column;
          }
          .forex-rate-preview small {
            text-align: left;
          }
          .forex-result-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div
        className={`navbar-wrapper ${scrolled ? 'scrolled' : ''}`}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          boxShadow: scrolled ? 'var(--shadow-md)' : 'none',
          transition: 'all var(--transition-base)',
          background: 'var(--color-background)',
        }}
      >
        {/* Top Bar */}
        <div
          className="nav-top-bar d-none d-lg-block"
          style={{
            background: 'var(--gradient-primary)',
            height: scrolled ? '0px' : '40px',
            overflow: 'hidden',
            transition: 'all var(--transition-base)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)', color: scrolled ? 'var(--color-text-primary)' : 'white', fontSize: '12.5px', fontWeight: '600' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                  <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                  <path d="M4 22h16" />
                  <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34" />
                  <path d="M12 2a4 4 0 0 0-4 4v6a4 4 0 0 0 8 0V6a4 4 0 0 0-4-4z" />
                </svg>
                20+ Years of Excellence in Travel
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                4.8/5 Google Rating
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15.05 5A5 5 0 0 1 19 8.95M15.05 1A9 9 0 0 1 23 8.94m-1 7.98v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                {companyInfo?.contact?.phone || '+91 9876543210'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', color: scrolled ? 'var(--color-text-primary)' : 'white', fontSize: '12.5px', fontWeight: '600' }}>
              <span>Follow Us:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                {/* Facebook */}
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="nav-social-icon">
                  <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8H7v3h2v9h3v-9h3l.5-3H12V6c0-.88.39-1 1-1h2V2h-3C9.78 2 9 3.5 9 5.5V8z" /></svg>
                </a>
                {/* Instagram */}
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="nav-social-icon">
                  <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" /></svg>
                </a>
                {/* Youtube */}
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="nav-social-icon">
                  <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.53 3.545 12 3.545 12 3.545s-7.53 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.017 0 12 0 12s0 3.983.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.858.508 9.388.508 9.388.508s7.53 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.983 24 12 24 12s0-3.983-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Main Navbar Header */}
        <header
          style={{
            background: 'var(--color-card)',
            padding: scrolled ? '10px 0' : '16px 0',
            transition: 'all 0.3s ease',
            borderBottom: scrolled ? '1px solid var(--color-border)' : 'none',
          }}
        >
          <div className="container">
            <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-5)' }}>

              {/* Logo */}
              <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                <div style={{ position: 'relative', width: 142, height: 46 }}>
                  <Image
                    src={brandLogo}
                    alt={`${brandName} Logo`}
                    fill
                    sizes="142px"
                    style={{ objectFit: 'contain' }}
                    priority
                  />
                </div>
              </Link>

              {/* Navigation Center Menu Links */}
              <ul
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-4)',
                  listStyle: 'none',
                  margin: 0,
                  padding: 0,
                  flex: 1,
                  justifyContent: 'center',
                }}
                className="d-none d-lg-flex"
              >
                <MegaDropdown label="Packages" cols={packageCols} isTransparent={false} />
                <MegaDropdown label="India Tours" cols={indiaDropdownCols} isTransparent={false} />
                <MegaDropdown label="International Tours" cols={destinationCols} isTransparent={false} />

                <li>
                  <Link
                    href="/tours?search=nri"
                    className={`nav-plain-link`}
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    NRI Tours
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tours?search=corporate"
                    className={`nav-plain-link`}
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    Corporate Tours
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tours"
                    className={`nav-plain-link ${pathname === '/tours' ? 'active' : ''}`}
                    style={{ color: pathname === '/tours' ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}
                  >
                    Destinations
                  </Link>
                </li>
              </ul>

              {/* Right Side Call Section & Mobile Trigger Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flexShrink: 0 }}>
                {/* Call section */}
                <a
                  href={`https://wa.me/${String(companyInfo?.contact?.whatsapp || companyInfo?.contact?.phone || '+919876543210').replace(/[^\d+]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', textDecoration: 'none' }}
                  onMouseEnter={(e) => { e.currentTarget.querySelector('.whatsapp-nav-icon').style.transform = 'scale(1.05)'; e.currentTarget.querySelector('.whatsapp-nav-icon').style.background = 'var(--color-primary)'; e.currentTarget.querySelector('.whatsapp-nav-icon').style.color = 'var(--color-card)'; }}
                  onMouseLeave={(e) => { e.currentTarget.querySelector('.whatsapp-nav-icon').style.transform = 'scale(1)'; e.currentTarget.querySelector('.whatsapp-nav-icon').style.background = 'color-mix(in srgb, var(--color-primary) 12%, transparent)'; e.currentTarget.querySelector('.whatsapp-nav-icon').style.color = 'var(--color-primary)'; }}
                >
                  <div
                    className="whatsapp-nav-icon"
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: '50%',
                      background: 'color-mix(in srgb, var(--color-primary) 12%, transparent)',
                      border: '1.5px solid var(--color-primary)',
                      color: 'var(--color-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
                      <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
                    </svg>
                  </div>
                  <div className="d-none d-xl-flex" style={{ flexDirection: 'column' }}>
                    <span style={{ fontSize: '14.5px', fontWeight: 800, color: 'var(--color-text-primary)', lineHeight: 1.1 }}>
                      {companyInfo?.contact?.whatsapp || companyInfo?.contact?.phone || '+91 98765 43210'}
                    </span>
                    <span style={{ fontSize: '10.5px', fontWeight: 600, color: 'var(--color-text-muted)', marginTop: '2px' }}>
                      WhatsApp Us
                    </span>
                  </div>
                </a>


                {/* Desktop Hamburger button */}
                <button
                  type="button"
                  aria-label="Open travel menu"
                  className="d-none d-lg-inline-flex"
                  onClick={() => setDrawerOpen(true)}
                  style={{
                    width: 36,
                    height: 36,
                    background: 'var(--color-bg)',
                    border: '1.5px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: 0,
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-text-secondary)',
                    cursor: 'pointer',
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden="true">
                    <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
                  </svg>
                </button>

                {/* Mobile hamburger button */}
                <button
                  type="button"
                  aria-label="Open travel menu"
                  className="d-lg-none"
                  onClick={() => setDrawerOpen(true)}
                  style={{
                    background: 'var(--color-bg)',
                    border: '1.5px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '6px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-text-secondary)',
                    cursor: 'pointer',
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                    <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
                  </svg>
                </button>
              </div>
            </nav>
          </div>
        </header>
      </div>

      {forexOpen ? (
        <div className="forex-modal-backdrop" role="presentation" onMouseDown={() => setForexOpen(false)}>
          <section className="forex-modal" role="dialog" aria-modal="true" aria-labelledby="forex-modal-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className="forex-modal-head">
              <div>
                <span>Forex request</span>
                <h2 id="forex-modal-title">Generate currency inquiry</h2>
                <p>Select currencies to check active forex rates and prepare an inquiry for confirmation.</p>
              </div>
              <button type="button" className="forex-modal-close" aria-label="Close Forex inquiry" onClick={() => setForexOpen(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="18" height="18" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form className="forex-modal-form" onSubmit={generateForexInquiry}>
              <div className="forex-modal-grid">
                <div className="forex-conversion-row">
                  <CurrencyCombobox
                    id="forex-from-currency"
                    label="Converting from"
                    value={forexDraft.fromCurrency}
                    onChange={(value) => updateForexDraft('fromCurrency', value)}
                    currencies={forexOptions}
                    loading={forexRatesLoading}
                  />
                  <button type="button" className="forex-swap-button" aria-label="Swap currencies" onClick={swapForexCurrencies}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="18" height="18" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M7 7h11l-3-3" />
                      <path d="M17 17H6l3 3" />
                    </svg>
                  </button>
                  <CurrencyCombobox
                    id="forex-to-currency"
                    label="Converting to"
                    value={forexDraft.toCurrency}
                    onChange={(value) => updateForexDraft('toCurrency', value)}
                    currencies={forexOptions}
                    loading={forexRatesLoading}
                  />
                </div>
                <label>
                  Amount
                  <input type="number" min="1" value={forexDraft.amount} onChange={(event) => updateForexDraft('amount', event.target.value)} placeholder="1000" required />
                </label>
                <label>
                  Purpose
                  <select value={forexDraft.purpose} onChange={(event) => updateForexDraft('purpose', event.target.value)}>
                    <option>Travel</option>
                    <option>Business</option>
                    <option>Education</option>
                    <option>Medical</option>
                  </select>
                </label>
                <label>
                  Date
                  <input type="date" value={forexDraft.travelDate} onChange={(event) => updateForexDraft('travelDate', event.target.value)} />
                </label>
                <label>
                  Customer name
                  <input value={forexDraft.customerName} onChange={(event) => updateForexDraft('customerName', event.target.value)} placeholder="Full name" />
                </label>
                <label>
                  Phone
                  <input value={forexDraft.phone} onChange={(event) => updateForexDraft('phone', event.target.value)} placeholder="+91 98765 43210" />
                </label>
                <label>
                  Email
                  <input type="email" value={forexDraft.email} onChange={(event) => updateForexDraft('email', event.target.value)} placeholder="name@example.com" />
                </label>
                <label className="forex-modal-notes">
                  Notes
                  <textarea value={forexDraft.notes} onChange={(event) => updateForexDraft('notes', event.target.value)} placeholder="Pickup city, delivery preference, or document details" rows="3" />
                </label>
                <div className="forex-rate-preview" aria-live="polite">
                  <div>
                    <strong>{forexLookupLoading || forexRatesLoading ? 'Checking active rates...' : forexConversion ? 'Confirmed conversion' : 'Rate estimate'}</strong>
                    {forexConversion?.convertedAmount ? (
                      <span>
                        {formatMoneyValue(Number(forexDraft.amount || 0), forexDraft.fromCurrency)} converts to {formatMoneyValue(forexConversion.convertedAmount, forexDraft.toCurrency)}.
                      </span>
                    ) : forexEstimate.match && forexEstimate.convertedAmount ? (
                      <span>
                        {formatMoneyValue(Number(forexDraft.amount || 0), forexDraft.fromCurrency)} is approximately {formatMoneyValue(forexEstimate.convertedAmount, forexDraft.toCurrency)}.
                      </span>
                    ) : (
                      <span>{isLoggedIn ? 'Create the request to verify the latest active rate for this currency pair.' : 'Login to create a forex conversion request.'}</span>
                    )}
                  </div>
                  {forexConversion?.rate ? (
                    <small>1 {forexDraft.fromCurrency} = {formatMoneyValue(forexConversion.rate, forexDraft.toCurrency)}</small>
                  ) : forexEstimate.match ? (
                    <small>1 {forexDraft.fromCurrency} = {formatMoneyValue(forexEstimate.match.rate, forexDraft.toCurrency)}</small>
                  ) : (
                    <small>Active API rates</small>
                  )}
                </div>
                {forexServiceCharge ? (
                  <div className="forex-charge-note">
                    Service charge: {forexServiceCharge.value ? `${forexServiceCharge.value}${forexServiceCharge.type.includes('percent') ? '%' : ` ${forexDraft.toCurrency}`}` : 'Configured in CRM'}
                  </div>
                ) : null}
                {forexRatesError ? <p className="forex-rate-error">{forexRatesError}</p> : null}
              </div>
              <button type="submit" disabled={forexLookupLoading || forexRatesLoading}>
                {forexLookupLoading ? 'Creating Request...' : 'Create Forex Request'}
              </button>
              {forexInquiry ? (
                <div className="forex-modal-output">
                  <strong>Forex request summary</strong>
                  {forexConversion ? (
                    <div className="forex-result-grid">
                      {forexConversion.requestId ? <span><b>Request</b>{forexConversion.requestId}</span> : null}
                      {forexConversion.convertedAmount ? <span><b>Converted</b>{formatMoneyValue(forexConversion.convertedAmount, forexDraft.toCurrency)}</span> : null}
                      {forexConversion.serviceCharge ? <span><b>Service charge</b>{formatMoneyValue(forexConversion.serviceCharge, forexDraft.toCurrency)}</span> : null}
                      {forexConversion.totalAmount ? <span><b>Total</b>{formatMoneyValue(forexConversion.totalAmount, forexDraft.toCurrency)}</span> : null}
                    </div>
                  ) : null}
                  <p>{forexInquiry}</p>
                </div>
              ) : null}
            </form>
          </section>
        </div>
      ) : null}

      {/* Sidebar Drawer Component */}
      <SideDrawer
        allCategories={allCategories}
        currentUser={currentUser}
        isLoggedIn={isLoggedIn}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onForexOpen={() => setForexOpen(true)}
        onLogout={clearAuthSession}
        companyInfo={companyInfo}
      />
    </>
  );
}
