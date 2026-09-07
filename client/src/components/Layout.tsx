import { Link, NavLink, Outlet } from 'react-router-dom';
import { Menu, MessageCircle, Phone, X, MapPin } from 'lucide-react';
import { useState } from 'react';
import { whatsappUrl } from '../lib/data';

const links = [['/','Home'],['/catalogue','Collection'],['/wholesale','Wholesale'],['/about','Our Story']] as const;

export default function Layout() {
  const [open,setOpen] = useState(false);
  return <div className="min-h-screen overflow-x-hidden">
    <div className="bg-emerald-950 px-5 py-2 text-center text-[11px] font-medium tracking-widest text-white/75">WHOLESALE ONLY · AZAM MARKET, LAHORE · DELIVERY ACROSS PAKISTAN</div>
    <header className="sticky top-0 z-50 border-b border-black/5 bg-[#fbf8f2]/95 backdrop-blur-xl">
      <div className="mx-auto flex h-[78px] max-w-[1440px] items-center justify-between px-5 md:px-10">
        <Link to="/" aria-label="Rahim Fabrics home"><img src="/logo.webp" alt="Rahim Fabrics — Tradition in every thread" className="h-[62px] w-[150px] object-contain"/></Link>
        <nav className="hidden items-center gap-8 lg:flex">{links.map(([to,label])=><NavLink key={to} to={to} className={({isActive})=>`text-sm font-semibold transition hover:text-gold-500 ${isActive?'text-gold-500':'text-ink/70'}`}>{label}</NavLink>)}</nav>
        <a href={whatsappUrl('Assalam-o-Alaikum, I want to inquire about wholesale fabric.')} target="_blank" className="hidden items-center gap-2 text-sm font-bold text-emerald-900 sm:flex"><MessageCircle size={17}/> WhatsApp Inquiry</a>
        <button className="lg:hidden" onClick={()=>setOpen(!open)} aria-label="Toggle menu">{open?<X/>:<Menu/>}</button>
      </div>
      {open&&<nav className="border-t bg-cream px-5 py-5 lg:hidden">{links.map(([to,label])=><NavLink onClick={()=>setOpen(false)} key={to} to={to} className="block py-3 font-semibold">{label}</NavLink>)}</nav>}
    </header>
    <main><Outlet/></main>
    <footer className="bg-emerald-950 px-5 pb-8 pt-16 text-white md:px-10 lg:px-16">
      <div className="mx-auto grid max-w-[1320px] gap-12 border-b border-white/10 pb-14 md:grid-cols-4">
        <div className="md:col-span-2"><div className="font-display text-3xl text-white">Rahim Fabrics</div><p className="mt-4 max-w-md text-sm leading-7 text-white/55">Premium gents unstitched fabrics, supplied by the thaan to retailers, resellers and boutiques across Pakistan.</p></div>
        <div><div className="eyebrow">Visit our shop</div><p className="mt-4 flex gap-3 text-sm leading-6 text-white/65"><MapPin size={18} className="shrink-0 text-gold-400"/> Azam Market, Lahore, Pakistan</p></div>
        <div><div className="eyebrow">Wholesale desk</div><a className="mt-4 flex gap-3 text-sm text-white/65" href="tel:+923001234567"><Phone size={17} className="text-gold-400"/> +92 300 1234567</a></div>
      </div>
      <div className="mx-auto flex max-w-[1320px] flex-col justify-between gap-3 pt-7 text-[11px] uppercase tracking-wider text-white/35 sm:flex-row"><span>© {new Date().getFullYear()} Rahim Fabrics</span><Link to="/admin/login">Trade administration</Link></div>
    </footer>
    <a aria-label="Chat on WhatsApp" href={whatsappUrl('Assalam-o-Alaikum, I need wholesale fabric details.')} target="_blank" className="fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-xl transition hover:scale-105"><MessageCircle/></a>
  </div>
}
