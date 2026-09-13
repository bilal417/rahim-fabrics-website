import { Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import ProductCard from '../components/ProductCard';
import Seo from '../components/Seo';
import { api } from '../lib/api';
import { categories, products as seedProducts } from '../lib/data';
import type { Product } from '../types';

export default function Catalogue(){
 const [active,setActive]=useState('All Fabrics'); const [query,setQuery]=useState(''); const [items,setItems]=useState<Product[]>(seedProducts);
 useEffect(()=>{api.get('/products').then(r=>{if(r.data?.length)setItems(r.data)}).catch(()=>undefined)},[]);
 const shown=useMemo(()=>items.filter(p=>(active==='All Fabrics'||p.category===active)&&`${p.name} ${p.code} ${p.fabricType}`.toLowerCase().includes(query.toLowerCase())),[active,query,items]);
 return <><Seo
   title="Wholesale Fabric Collection | Rahim Fabrics Lahore"
   description="Browse gents fabric ranges by thaan — wash & wear, cotton, khaddar, summer and winter wholesale stock from Azam Market, Lahore."
   path="/catalogue"
 /><section className="bg-emerald-950 px-5 py-20 text-white md:px-10"><div className="mx-auto max-w-[1320px]"><p className="eyebrow">Current stock</p><h1 className="mt-4 font-display text-5xl font-semibold md:text-6xl">Wholesale Collection</h1><p className="mt-5 max-w-2xl text-white/55">Browse available fabric ranges by thaan. Wholesale prices are shared directly after buyer verification.</p></div></section><section className="section pt-10"><div className="mx-auto max-w-[1320px]"><div className="flex flex-col gap-6 border-b border-black/10 pb-8 lg:flex-row lg:items-center lg:justify-between"><div className="flex flex-wrap gap-2">{categories.map(c=><button onClick={()=>setActive(c)} key={c} className={`rounded-full px-4 py-2 text-xs font-bold transition ${active===c?'bg-emerald-900 text-white':'bg-cream text-black/55 hover:text-emerald-900'}`}>{c}</button>)}</div><label className="flex min-w-[280px] items-center gap-3 border-b border-black/20 py-2"><Search size={17} className="text-black/35"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search name or product code" className="w-full bg-transparent text-sm outline-none"/></label></div><div className="mt-10 flex items-center justify-between"><p className="text-sm text-black/45">Showing {shown.length} fabric ranges</p><p className="text-xs font-bold uppercase tracking-wider text-emerald-900">Sold by thaan</p></div><div className="mt-8 grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">{shown.map(p=><ProductCard key={p.code} product={p}/>)}</div>{!shown.length&&<div className="py-20 text-center text-black/45">No fabrics match your search.</div>}</div></section></>
}
