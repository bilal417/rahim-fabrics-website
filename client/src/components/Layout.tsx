import { Link, NavLink, Outlet } from 'react-router-dom';
import { ChevronRight, Facebook, Instagram, Mail, MapPin, Menu, MessageCircle, Phone, ShoppingBag, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import {
  ADDRESS_FULL,
  ADDRESS_SHORT,
  BRAND_LINE,
  EMAIL,
  MAPS_URL,
  PHONE_DISPLAY,
  PHONE_TEL,
  SOCIAL,
  WHATSAPP,
  seasonalCollections,
  whatsappUrl,
} from '../lib/data';

const links = [
  ['/', 'Home'],
  ['/catalogue', 'Shop'],
] as const;

export default function Layout() {
  const [open, setOpen] = useState(false);
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [openSeason, setOpenSeason] = useState<keyof typeof seasonalCollections | null>('Summer');
  const { items } = useCart();
  const cartCount = items.length;

  useEffect(() => {
    if (!collectionsOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setCollectionsOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [collectionsOpen]);

  return (
    <div className="min-h-screen overflow-x-hidden">
      <div className="bg-emerald-950 px-5 py-2.5 text-white">
        <div className="mx-auto flex max-w-[1320px] items-center justify-center gap-4 text-[10px] font-bold uppercase tracking-[.16em] text-white/75 sm:justify-between sm:text-[11px]">
          <span className="truncate">Retail & wholesale · Delivery across Pakistan</span>
          <div className="flex shrink-0 items-center gap-3 sm:gap-4">
            <SocialLinks compact />
          </div>
        </div>
      </div>
      <header className="sticky top-0 z-50 border-b border-emerald-950/10 bg-[#fbf8f2]/95 shadow-[0_8px_30px_rgba(4,54,45,.06)] backdrop-blur-xl">
        <div className="relative mx-auto flex h-[100px] w-full max-w-[1320px] items-center justify-between md:h-[112px]">
          <Link
            to="/"
            aria-label="Rahim Fabrics home"
            className="group relative z-10 shrink-0 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
          >
            <img
              src="/logo-small.webp?v=1"
              alt="Rahim Fabrics — Tradition in every thread"
              className="h-[88px] w-auto max-w-[140px] rounded-md object-contain object-left transition duration-300 group-hover:scale-[1.02] md:h-[100px] md:max-w-[160px]"
            />
          </Link>
          <nav
            aria-label="Main navigation"
            className="absolute left-1/2 top-1/2 z-0 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-1 lg:flex"
          >
            {links.map(([to, label]) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  'relative rounded-full px-4 py-3 text-[13px] font-bold transition ' +
                  (isActive
                    ? 'bg-emerald-950 text-white shadow-sm'
                    : 'text-ink/65 hover:bg-emerald-950/5 hover:text-emerald-950')
                }
              >
                {label}
              </NavLink>
            ))}
            <button
              type="button"
              onClick={() => setCollectionsOpen(true)}
              className="flex items-center gap-1 rounded-full px-4 py-3 text-[13px] font-bold text-ink/65 transition hover:bg-emerald-950/5 hover:text-emerald-950"
              aria-haspopup="dialog"
              aria-expanded={collectionsOpen}
            >
              Collections <ChevronRight size={14} />
            </button>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                'relative rounded-full px-4 py-3 text-[13px] font-bold transition ' +
                (isActive
                  ? 'bg-emerald-950 text-white shadow-sm'
                  : 'text-ink/65 hover:bg-emerald-950/5 hover:text-emerald-950')
              }
            >
              Our Story
            </NavLink>
          </nav>
          <div className="relative z-10 flex items-center gap-3">
            <a
              href={`https://wa.me/${WHATSAPP}`}
              target="_blank"
              rel="noreferrer"
              aria-label="Chat with Rahim Fabrics on WhatsApp"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-emerald-950 px-4 text-xs font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-900"
            >
              <MessageCircle size={17} />
              Chat With Us
            </a>
            <Link
              to="/cart"
              className="relative grid h-11 w-11 place-items-center rounded-full border border-emerald-950/10 bg-white text-emerald-950"
              aria-label="Open cart"
            >
              <ShoppingBag size={18} />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-gold-500 px-1 text-[10px] font-bold text-emerald-950">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-gold-500 bg-gold-500 text-emerald-950 shadow-sm transition hover:bg-gold-400 lg:hidden"
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
              aria-expanded={open}
            >
              {open ? <X size={21} /> : <Menu size={21} />}
            </button>
          </div>
        </div>
        {open && (
          <nav aria-label="Mobile navigation" className="border-t border-emerald-950/10 bg-cream px-5 pb-6 pt-3 shadow-xl lg:hidden">
            <div className="mx-auto max-w-[1320px]">
              {links.map(([to, label]) => (
                <NavLink
                  onClick={() => setOpen(false)}
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    'flex items-center justify-between border-b border-emerald-950/10 py-4 text-sm font-bold ' +
                    (isActive ? 'text-gold-600' : 'text-emerald-950')
                  }
                >
                  <span>{label}</span>
                  <span className="text-gold-500">→</span>
                </NavLink>
              ))}
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setCollectionsOpen(true);
                }}
                className="flex w-full items-center justify-between border-b border-emerald-950/10 py-4 text-sm font-bold text-emerald-950"
              >
                Collections <span className="text-gold-500">→</span>
              </button>
              <NavLink
                onClick={() => setOpen(false)}
                to="/about"
                className={({ isActive }) =>
                  'flex items-center justify-between border-b border-emerald-950/10 py-4 text-sm font-bold ' +
                  (isActive ? 'text-gold-600' : 'text-emerald-950')
                }
              >
                <span>Our Story</span>
                <span className="text-gold-500">→</span>
              </NavLink>
              <SocialLinks className="mt-5" tone="light" />
              <Link
                to="/cart"
                onClick={() => setOpen(false)}
                className="mt-4 flex items-center justify-center gap-2 rounded-full bg-emerald-950 px-5 py-3.5 text-sm font-bold text-white"
              >
                <ShoppingBag size={17} /> Cart ({cartCount})
              </Link>
            </div>
          </nav>
        )}
      </header>
      <div
        className={`fixed inset-0 z-[80] transition ${collectionsOpen ? 'pointer-events-auto visible' : 'pointer-events-none invisible'}`}
        aria-hidden={!collectionsOpen}
      >
        <button
          type="button"
          aria-label="Close collections"
          onClick={() => setCollectionsOpen(false)}
          className={`absolute inset-0 bg-black/55 backdrop-blur-[2px] transition-opacity duration-300 ${collectionsOpen ? 'opacity-100' : 'opacity-0'}`}
        />
        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Fabric collections"
          className={`absolute right-0 top-0 h-full w-full max-w-[480px] overflow-y-auto bg-[#fbf8f2] shadow-2xl transition-transform duration-300 ease-out ${collectionsOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <div className="flex items-center justify-between border-b border-emerald-950/10 px-6 py-5 md:px-8">
            <div>
              <p className="eyebrow">Shop by season</p>
              <h2 className="mt-1 font-display text-3xl font-semibold text-emerald-950">Collections</h2>
            </div>
            <button
              type="button"
              onClick={() => setCollectionsOpen(false)}
              aria-label="Close collections panel"
              className="grid h-11 w-11 place-items-center rounded-full border border-emerald-950/10 bg-white text-emerald-950 transition hover:border-gold-500"
            >
              <X size={20} />
            </button>
          </div>
          <div className="space-y-9 px-6 py-7 md:px-8">
            {Object.entries(seasonalCollections).map(([season, fabrics]) => (
              <section key={season}>
                <button
                  type="button"
                  onClick={() => setOpenSeason((current) => current === season ? null : season as keyof typeof seasonalCollections)}
                  aria-expanded={openSeason === season}
                  className="flex w-full items-center justify-between border-b border-gold-500/35 pb-3 text-left"
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-[.2em] text-gold-600">Seasonal range</span>
                    <h3 className="mt-1 font-display text-2xl font-semibold text-emerald-950">{season} Season</h3>
                  </div>
                  <ChevronRight
                    size={19}
                    className={`text-gold-600 transition-transform ${openSeason === season ? 'rotate-90' : ''}`}
                  />
                </button>
                {openSeason === season && (
                  <div className="mt-3 divide-y divide-emerald-950/10">
                    <Link
                      to={`/catalogue?season=${encodeURIComponent(season)}`}
                      onClick={() => setCollectionsOpen(false)}
                      className="flex items-center justify-between py-3.5 text-sm font-bold text-emerald-950 transition hover:pl-1"
                    >
                      View All {season} Fabrics <ChevronRight size={15} className="text-gold-600" />
                    </Link>
                    {fabrics.map((fabric) => (
                      <Link
                        key={fabric}
                        to={`/catalogue?season=${encodeURIComponent(season)}&category=${encodeURIComponent(fabric)}`}
                        onClick={() => setCollectionsOpen(false)}
                        className="flex items-center justify-between py-3.5 text-sm font-semibold text-ink/65 transition hover:pl-1 hover:text-emerald-950"
                      >
                        {fabric} Collection <ChevronRight size={15} className="text-gold-600" />
                      </Link>
                    ))}
                  </div>
                )}
              </section>
            ))}
            <Link
              to="/catalogue"
              onClick={() => setCollectionsOpen(false)}
              className="btn-dark w-full"
            >
              View all fabrics
            </Link>
          </div>
        </aside>
      </div>
      <main>
        <Outlet />
      </main>
      <footer className="bg-emerald-950 px-5 pb-8 pt-16 text-white md:px-10 lg:px-16">
        <div className="mx-auto grid max-w-[1320px] gap-12 border-b border-white/10 pb-14 md:grid-cols-4">
          <div className="md:col-span-2">
            <img
              src="/logo-small.webp?v=1"
              alt="Rahim Fabrics"
              className="mt-2 h-16 w-auto object-contain md:h-20"
            />
            <p className="mt-4 text-sm font-semibold text-gold-400">{BRAND_LINE}</p>
            <p className="mt-3 max-w-md text-sm leading-7 text-white/55">
              Premium gents fabrics for retail customers and wholesale buyers — sold by the metre and by the thaan from New Azam Cloth Market, Lahore.
            </p>
            <SocialLinks className="mt-6" />
          </div>
          <div>
            <div className="eyebrow">Navigation</div>
            <nav aria-label="Footer navigation" className="mt-4 flex flex-col items-start gap-3">
              {links.map(([to, label]) => (
                <Link
                  key={to}
                  to={to}
                  className="text-sm text-white/65 transition hover:translate-x-1 hover:text-gold-400"
                >
                  {label}
                </Link>
              ))}
              <button
                type="button"
                onClick={() => setCollectionsOpen(true)}
                className="text-sm text-white/65 transition hover:translate-x-1 hover:text-gold-400"
              >
                Collections
              </button>
              <Link
                to="/about"
                className="text-sm text-white/65 transition hover:translate-x-1 hover:text-gold-400"
              >
                Our Story
              </Link>
            </nav>
          </div>
          <div>
            <div className="eyebrow">Contact</div>
            <a
              href={MAPS_URL}
              target="_blank"
              rel="noreferrer"
              title={`Open in Google Maps — ${ADDRESS_FULL}`}
              className="mt-4 flex gap-3 text-sm leading-6 text-white/65 underline decoration-white/20 underline-offset-4 transition hover:text-gold-400 hover:decoration-gold-400"
            >
              <MapPin size={18} className="mt-0.5 shrink-0 text-gold-400" />
              <span>{ADDRESS_SHORT}</span>
            </a>
            <a className="mt-4 flex gap-3 text-sm text-white/65" href={`tel:${PHONE_TEL}`}>
              <Phone size={17} className="text-gold-400" /> {PHONE_DISPLAY}
            </a>
            <a className="mt-3 flex gap-3 text-sm text-white/65" href={`mailto:${EMAIL}`}>
              <Mail size={17} className="text-gold-400" /> {EMAIL}
            </a>
          </div>
        </div>
        <div className="mx-auto flex max-w-[1320px] flex-col justify-between gap-3 pt-7 text-[11px] uppercase tracking-wider text-white/35 sm:flex-row">
          <span>© {new Date().getFullYear()} Rahim Fabrics</span>
          <Link to="/admin/login">Trade administration</Link>
        </div>
      </footer>
      <a
        aria-label="Chat on WhatsApp"
        href={whatsappUrl('Assalam-o-Alaikum, I need fabric details for an order.')}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-xl transition hover:scale-105"
      >
        <MessageCircle />
      </a>
    </div>
  );
}

function SocialLinks({
  className = '',
  tone = 'dark',
  compact = false,
}: {
  className?: string;
  tone?: 'dark' | 'light';
  compact?: boolean;
}) {
  const chip =
    tone === 'dark'
      ? 'border-white/15 bg-white/5 text-white hover:border-gold-400 hover:text-gold-400'
      : 'border-emerald-950/10 bg-white text-emerald-950 hover:border-gold-500 hover:text-gold-600';
  const size = compact ? 'h-7 w-7' : 'h-10 w-10';
  const iconSize = compact ? 13 : 16;

  return (
    <div className={`flex items-center ${compact ? 'gap-2' : 'gap-3'} ${className}`}>
      <a
        href={SOCIAL.facebook}
        target="_blank"
        rel="noreferrer"
        aria-label="Rahim Fabrics on Facebook"
        className={`grid ${size} place-items-center rounded-full border transition ${chip}`}
      >
        <Facebook size={iconSize} />
      </a>
      {SOCIAL.instagram ? (
        <a
          href={SOCIAL.instagram}
          target="_blank"
          rel="noreferrer"
          aria-label="Rahim Fabrics on Instagram"
          className={`grid ${size} place-items-center rounded-full border transition ${chip}`}
        >
          <Instagram size={iconSize} />
        </a>
      ) : null}
      {SOCIAL.tiktok ? (
        <a
          href={SOCIAL.tiktok}
          target="_blank"
          rel="noreferrer"
          aria-label="Rahim Fabrics on TikTok"
          className={`grid ${size} place-items-center rounded-full border transition ${chip}`}
        >
          <TikTokIcon size={iconSize} />
        </a>
      ) : null}
    </div>
  );
}

function TikTokIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M15 3v10.25a4.75 4.75 0 1 1-4-4.69V11.7a1.75 1.75 0 1 0 1 1.55V3h3Zm0 0c.45 2.45 1.85 3.85 4 4v3c-1.55-.08-2.86-.55-4-1.35"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
