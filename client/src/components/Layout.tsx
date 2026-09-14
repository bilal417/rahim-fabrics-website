import { Link, NavLink, Outlet } from 'react-router-dom';
import { Mail, MapPin, Menu, MessageCircle, Phone, ShoppingBag, X } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { whatsappUrl } from '../lib/data';

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
        <div className="mx-auto flex max-w-[1320px] items-center justify-center text-[10px] font-bold uppercase tracking-[.16em] text-white/75 sm:justify-between sm:text-[11px]">
          <span className="flex items-center gap-2">
            <MapPin size={13} className="text-gold-400" /> Azam Market, Lahore
          </span>
          <span className="hidden md:block">Retail & wholesale · Delivery across Pakistan</span>
          <div className="hidden items-center gap-5 sm:flex">
            <a href="tel:+923219454085" className="transition hover:text-gold-400">
              +92 321 9454085
            </a>
            <a href="mailto:info@rahimfabrics.site" className="hidden transition hover:text-gold-400 lg:block">
              info@rahimfabrics.site
            </a>
          </div>
        </div>
      </div>
      <header className="sticky top-0 z-50 border-b border-emerald-950/10 bg-[#fbf8f2]/95 shadow-[0_8px_30px_rgba(4,54,45,.06)] backdrop-blur-xl">
        <div className="mx-auto flex min-h-[88px] max-w-[1320px] items-center justify-between gap-8 px-5 md:min-h-[98px] md:px-10">
          <Link
            to="/"
            aria-label="Rahim Fabrics home"
            className="group shrink-0 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
          >
            <img
              src="/logo.webp"
              alt="Rahim Fabrics — Tradition in every thread"
              className="h-[70px] w-[105px] object-contain transition duration-300 group-hover:scale-[1.03] md:h-[84px] md:w-[126px]"
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
              <Link
                to="/cart"
                onClick={() => setOpen(false)}
                className="mt-5 flex items-center justify-center gap-2 rounded-full bg-emerald-950 px-5 py-3.5 text-sm font-bold text-white"
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
            <div className="font-display text-3xl text-white">Rahim Fabrics</div>
            <p className="mt-4 max-w-md text-sm leading-7 text-white/55">
              Premium gents fabrics for retail customers and wholesale buyers — sold by the metre and by the thaan from Azam Market, Lahore.
            </p>
          </div>
          <div>
            <div className="eyebrow">Visit our shop</div>
            <p className="mt-4 flex gap-3 text-sm leading-6 text-white/65">
              <MapPin size={18} className="shrink-0 text-gold-400" /> Azam Market, Lahore, Pakistan
            </p>
          </div>
          <div>
            <div className="eyebrow">Contact</div>
            <a className="mt-4 flex gap-3 text-sm text-white/65" href="tel:+923219454085">
              <Phone size={17} className="text-gold-400" /> +92 321 9454085
            </a>
            <a className="mt-3 flex gap-3 text-sm text-white/65" href="mailto:info@rahimfabrics.site">
              <Mail size={17} className="text-gold-400" /> info@rahimfabrics.site
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
