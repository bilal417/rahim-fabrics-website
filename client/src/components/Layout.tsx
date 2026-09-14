import { Link, NavLink, Outlet } from 'react-router-dom';
import { Facebook, Instagram, Mail, MapPin, Menu, MessageCircle, Phone, ShoppingBag, X } from 'lucide-react';
import { useState } from 'react';
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
  whatsappUrl,
} from '../lib/data';

const links = [
  ['/', 'Home'],
  ['/catalogue', 'Shop'],
  ['/wholesale', 'Wholesale'],
  ['/about', 'Our Story'],
] as const;

export default function Layout() {
  const [open, setOpen] = useState(false);
  const { items } = useCart();
  const cartCount = items.length;

  return (
    <div className="min-h-screen overflow-x-hidden">
      <div className="bg-emerald-950 px-5 py-2.5 text-white">
        <div className="mx-auto flex max-w-[1320px] items-center justify-center gap-4 text-[10px] font-bold uppercase tracking-[.16em] text-white/75 sm:justify-between sm:text-[11px]">
          <a
            href={MAPS_URL}
            target="_blank"
            rel="noreferrer"
            title={`Open in Google Maps — ${ADDRESS_FULL}`}
            className="flex min-w-0 items-center gap-2 underline decoration-white/25 underline-offset-4 transition hover:text-gold-400 hover:decoration-gold-400"
          >
            <MapPin size={13} className="shrink-0 text-gold-400" />
            <span className="truncate">{ADDRESS_SHORT}</span>
          </a>
          <span className="hidden md:block">Retail & wholesale · Delivery across Pakistan</span>
          <div className="hidden items-center gap-4 sm:flex">
            <a href={`tel:${PHONE_TEL}`} className="transition hover:text-gold-400">
              {PHONE_DISPLAY}
            </a>
            <SocialLinks className="hidden lg:flex" />
          </div>
        </div>
      </div>
      <header className="sticky top-0 z-50 border-b border-emerald-950/10 bg-[#fbf8f2]/95 shadow-[0_8px_30px_rgba(4,54,45,.06)] backdrop-blur-xl">
        <div className="mx-auto flex min-h-[100px] max-w-[1320px] items-center justify-between gap-6 pr-5 md:min-h-[112px] md:pr-10">
          <Link
            to="/"
            aria-label="Rahim Fabrics home"
            className="group -ml-1 shrink-0 rounded-sm pl-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
          >
            <img
              src="/logo.webp"
              alt="Rahim Fabrics — Tradition in every thread"
              className="site-logo h-[92px] w-[138px] object-contain object-left transition duration-300 group-hover:scale-[1.03] md:h-[110px] md:w-[165px]"
            />
          </Link>
          <nav aria-label="Main navigation" className="hidden items-center gap-1 lg:flex">
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
          </nav>
          <div className="flex items-center gap-3">
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
            <Link
              to="/catalogue"
              className="hidden items-center gap-2 rounded-full bg-emerald-950 px-5 py-3 text-xs font-bold text-white shadow-[0_10px_25px_rgba(4,54,45,.18)] transition hover:-translate-y-0.5 hover:bg-emerald-900 sm:flex"
            >
              Shop fabrics
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
      <main>
        <Outlet />
      </main>
      <footer className="bg-emerald-950 px-5 pb-8 pt-16 text-white md:px-10 lg:px-16">
        <div className="mx-auto grid max-w-[1320px] gap-12 border-b border-white/10 pb-14 md:grid-cols-4">
          <div className="md:col-span-2">
            <img
              src="/logo.webp"
              alt="Rahim Fabrics"
              className="site-logo h-20 w-auto object-contain object-left md:h-24"
            />
            <p className="mt-4 text-sm font-semibold text-gold-400">{BRAND_LINE}</p>
            <p className="mt-3 max-w-md text-sm leading-7 text-white/55">
              Premium gents fabrics for retail customers and wholesale buyers — sold by the metre and by the thaan from New Azam Cloth Market, Lahore.
            </p>
            <SocialLinks className="mt-6" />
          </div>
          <div>
            <div className="eyebrow">Visit our shop</div>
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
          </div>
          <div>
            <div className="eyebrow">Contact</div>
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

function SocialLinks({ className = '', tone = 'dark' }: { className?: string; tone?: 'dark' | 'light' }) {
  const chip =
    tone === 'dark'
      ? 'border-white/15 bg-white/5 text-white hover:border-gold-400 hover:text-gold-400'
      : 'border-emerald-950/10 bg-white text-emerald-950 hover:border-gold-500 hover:text-gold-600';

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <a
        href={SOCIAL.facebook}
        target="_blank"
        rel="noreferrer"
        aria-label="Rahim Fabrics on Facebook"
        className={`grid h-10 w-10 place-items-center rounded-full border transition ${chip}`}
      >
        <Facebook size={16} />
      </a>
      {SOCIAL.instagram ? (
        <a
          href={SOCIAL.instagram}
          target="_blank"
          rel="noreferrer"
          aria-label="Rahim Fabrics on Instagram"
          className={`grid h-10 w-10 place-items-center rounded-full border transition ${chip}`}
        >
          <Instagram size={16} />
        </a>
      ) : null}
    </div>
  );
}
