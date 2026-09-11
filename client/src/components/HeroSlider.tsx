import { useEffect, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { whatsappUrl } from '../lib/data';

const slides = [
  { main: '/images/shop-slider/shop-04.jpg', top: '/images/shop-slider/shop-03.jpg', bottom: '/images/shop-slider/shop-06.jpg' },
  { main: '/images/shop-slider/shop-02.jpg', top: '/images/shop-slider/shop-01.jpg', bottom: '/images/shop-slider/shop-05.jpg' },
  { main: '/images/shop-slider/shop-06.jpg', top: '/images/shop-slider/shop-04.jpg', bottom: '/images/shop-slider/shop-03.jpg' },
];

const Watermark = () => (
  <span className="pointer-events-none absolute bottom-3 right-4 font-display text-[11px] italic tracking-wide text-white/35 drop-shadow-md md:text-xs">
    Rahim Fabrics
  </span>
);

export default function HeroSlider() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % slides.length), 5500);
    return () => window.clearInterval(timer);
  }, []);

  const changeSlide = (direction: number) => {
    setActive((current) => (current + direction + slides.length) % slides.length);
  };

  return (
    <section className="relative overflow-hidden bg-emerald-950 text-white">
      <div className="mx-auto grid min-h-[720px] w-full max-w-[1600px] lg:min-h-[760px] lg:grid-cols-[.43fr_.57fr]">
        <div className="relative z-20 flex min-w-0 max-w-full items-center overflow-hidden px-5 py-20 md:px-10 lg:px-16">
          <div className="absolute -left-40 top-10 h-96 w-96 rounded-full bg-emerald-700/25 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-px w-3/4 bg-gradient-to-r from-transparent to-gold-400/50" />
          <div className="relative max-w-2xl reveal">
            <p className="eyebrow">Azam Market · Lahore</p>
            <h1 className="mt-6 max-w-full font-display text-[clamp(2.25rem,10vw,4.5rem)] font-semibold leading-[1.04]">
              Premium Gents Fabrics <span className="block italic text-gold-400 sm:inline">Wholesale</span>{' '}Supplier
            </h1>
            <p className="mt-7 max-w-lg text-lg leading-8 text-white/70">
              Quality fabrics from Azam Market Lahore, curated by the thaan for dealers, retailers and boutiques across Pakistan.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link to="/catalogue" className="btn-primary">View Collection <ArrowRight size={17} /></Link>
              <a href={whatsappUrl('Assalam-o-Alaikum, I would like to view your wholesale collection.')} target="_blank" rel="noreferrer" className="btn-outline">
                <MessageCircle size={17} /> WhatsApp Wholesale Inquiry
              </a>
            </div>
            <div className="mt-12 grid w-full max-w-lg grid-cols-3 overflow-hidden border-y border-white/10">
              {[['20+', 'Fabric ranges'], ['4–5', 'Suits per thaan'], ['Nationwide', 'Delivery']].map(([value, label]) => (
                <div key={label} className="min-w-0 overflow-hidden border-r border-white/10 px-2 py-5 first:pl-0 last:border-r-0 md:px-3">
                  <div className="truncate font-display text-sm text-gold-400 sm:text-xl md:text-2xl">
                    {value === 'Nationwide' ? <><span className="sm:hidden">Pakistan</span><span className="hidden sm:inline">Nationwide</span></> : value}
                  </div>
                  <div className="mt-1 text-[8px] uppercase tracking-[.1em] text-white/45 sm:text-[9px] md:text-[10px] md:tracking-[.16em]">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative min-h-[470px] min-w-0 overflow-hidden bg-[#e8dfd0] p-3 sm:p-4 lg:min-h-[760px] lg:p-5">
          {slides.map((slide, index) => (
            <div
              key={`${slide.main}-${index}`}
              aria-hidden={active !== index}
              className={`absolute inset-3 grid grid-cols-[1.55fr_.85fr] grid-rows-2 gap-3 transition-all duration-700 sm:inset-4 lg:inset-5 ${
                active === index ? 'z-10 translate-x-0 opacity-100' : 'pointer-events-none z-0 translate-x-6 opacity-0'
              }`}
            >
              <figure className="relative row-span-2 overflow-hidden rounded-sm shadow-2xl">
                <img src={slide.main} alt="Rahim Fabrics shop fabric collection" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent" />
                <Watermark />
              </figure>
              <figure className="relative overflow-hidden rounded-sm border border-white/80 shadow-xl">
                <img src={slide.top} alt="Premium fabric stock at Rahim Fabrics" className="h-full w-full object-cover" />
                <Watermark />
              </figure>
              <figure className="relative overflow-hidden rounded-sm border border-white/80 shadow-xl">
                <img src={slide.bottom} alt="Wholesale suiting fabrics at Rahim Fabrics" className="h-full w-full object-cover" />
                <Watermark />
              </figure>
            </div>
          ))}

          <div className="absolute bottom-7 left-7 z-30 flex items-center gap-2 lg:bottom-9 lg:left-9">
            <button type="button" onClick={() => changeSlide(-1)} aria-label="Previous shop collage" className="grid h-10 w-10 place-items-center rounded-full border border-white/60 bg-emerald-950/75 text-white shadow-lg backdrop-blur transition hover:bg-emerald-900">
              <ChevronLeft size={18} />
            </button>
            <div className="flex gap-1.5 rounded-full bg-emerald-950/75 px-3 py-2.5 backdrop-blur">
              {slides.map((_, index) => (
                <button key={index} type="button" onClick={() => setActive(index)} aria-label={`Show shop collage ${index + 1}`} className={`h-1.5 rounded-full transition-all ${active === index ? 'w-7 bg-gold-400' : 'w-1.5 bg-white/55'}`} />
              ))}
            </div>
            <button type="button" onClick={() => changeSlide(1)} aria-label="Next shop collage" className="grid h-10 w-10 place-items-center rounded-full border border-white/60 bg-emerald-950/75 text-white shadow-lg backdrop-blur transition hover:bg-emerald-900">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
