import { ArrowRight, BadgeCheck, Box, MapPin, Scissors, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import HeroSlider from '../components/HeroSlider';
import ProductCard from '../components/ProductCard';
import Seo from '../components/Seo';
import { products } from '../lib/data';

export default function Home(){return <>
  <Seo
    title="Rahim Fabrics | Gents Fabrics Wholesale Azam Market Lahore"
    description="Premium gents fabrics wholesale supplier in Azam Market, Lahore. Wash & wear, cotton, khaddar and seasonal fabrics sold by the thaan across Pakistan."
    path="/"
  />
  <HeroSlider />
  <section className="section bg-[#fbf8f2]"><div className="mx-auto max-w-[1320px]"><div className="flex flex-col justify-between gap-8 md:flex-row md:items-end"><div><p className="eyebrow">Trade collection</p><h2 className="mt-4 max-w-xl font-display text-4xl font-semibold leading-tight text-emerald-950 md:text-5xl">Fabrics selected for your customers.</h2></div><Link to="/catalogue" className="flex items-center gap-2 text-sm font-bold text-emerald-900">Explore the full catalogue <ArrowRight size={16}/></Link></div><div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-3">{products.slice(0,3).map(p=><ProductCard key={p.code} product={p}/>)}</div></div></section>
  <section className="bg-cream"><div className="mx-auto grid max-w-[1440px] lg:grid-cols-2"><div className="min-h-[480px] bg-[url('/images/showroom-hero.png')] bg-cover bg-left"/><div className="flex items-center px-7 py-16 md:px-16 lg:px-20"><div><p className="eyebrow">Built for wholesale</p><h2 className="mt-4 font-display text-4xl font-semibold text-emerald-950 md:text-5xl">The thaan is our standard.</h2><p className="mt-6 max-w-xl leading-8 text-black/55">We understand the real rhythm of fabric trade: consistent lots, accurate colour assortments, dependable packing and direct answers before you buy.</p><div className="mt-9 grid gap-5 sm:grid-cols-2">{[[Box,'Thaan-based inventory','Clear packing and suit yield'],[BadgeCheck,'Checked quality','Trade-ready fabric selection'],[Scissors,'Tailor-friendly cuts','Consistent length and finish'],[Truck,'Pakistan delivery','Dispatch for verified dealers']].map(([Icon,t,d])=><div key={String(t)} className="flex gap-3"><Icon className="mt-1 text-gold-500" size={21}/><div><div className="font-bold text-emerald-950">{String(t)}</div><div className="mt-1 text-sm text-black/45">{String(d)}</div></div></div>)}</div></div></div></div></section>
  <section className="section bg-emerald-900 text-white"><div className="mx-auto flex max-w-[1100px] flex-col items-center text-center"><MapPin className="text-gold-400"/><p className="eyebrow mt-5">Wholesale relationships</p><h2 className="mt-4 font-display text-4xl font-semibold md:text-6xl">From Lahore's fabric heart, to your shop.</h2><p className="mt-6 max-w-2xl leading-8 text-white/60">Register your business requirement and our wholesale desk will share suitable ranges, availability and trade prices directly.</p><Link to="/wholesale" className="btn-primary mt-9">Register as a wholesale buyer <ArrowRight size={17}/></Link></div></section>
  </>}
