import { useEffect, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { whatsappUrl } from '../lib/data';

const slides = [
  '/images/hero-slider/banner-01.webp',
  '/images/hero-slider/banner-02.webp',
  '/images/hero-slider/banner-03.webp',
];

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
    <section className="relative min-h-[720px] overflow-hidden bg-emerald-950 text-white lg:min-h-[760px]">
      {slides.map((src, index) => (
        <img
          key={src}
          src={src}
          alt={`Rahim Fabrics shop collage ${index + 1}`}
          aria-hidden={active !== index}
          className={`absolute inset-0 h-full w-full object-cover object-center transition duration-1000 ${
            active === index ? 'scale-100 opacity-100' : 'scale-[1.025] opacity-0'
          }`}
        />
      ))}

      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-black/5" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/10" />

      <div className="pointer-events-none absolute inset-0 z-10 hidden font-display text-[11px] italic tracking-wide text-white/20 md:block">
        <span className="absolute left-[8%] top-[15%]">Rahim Fabrics</span>
        <span className="absolute right-[9%] top-[18%]">Rahim Fabrics</span>
        <span className="absolute bottom-[13%] left-[43%]">Rahim Fabrics</span>
        <span className="absolute bottom-[10%] right-[8%]">Rahim Fabrics</span>
      </div>

      <div className="relative z-20 mx-auto flex min-h-[720px] w-full max-w-[1440px] items-center px-5 py-20 md:px-10 lg:min-h-[760px] lg:px-16">
        <div className="max-w-2xl reveal">
          <p className="eyebrow">Azam Market · Lahore</p>
          <h1 className="mt-6 max-w-full font-display text-[clamp(2.25rem,10vw,4.5rem)] font-semibold leading-[1.04]">
            Premium Gents Fabrics <span className="block italic text-gold-400 sm:inline">Wholesale</span>{' '}Supplier
          </h1>
          <p className="mt-7 max-w-lg text-lg leading-8 text-white/75">
            Quality fabrics from Azam Market Lahore, curated by the thaan for dealers, retailers and boutiques across Pakistan.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link to="/catalogue" className="btn-primary">View Collection <ArrowRight size={17} /></Link>
            <a href={whatsappUrl('Assalam-o-Alaikum, I would like to view your wholesale collection.')} target="_blank" rel="noreferrer" className="btn-outline bg-black/15 backdrop-blur-sm">
              <MessageCircle size={17} /> WhatsApp Wholesale Inquiry
            </a>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 md:left-auto md:right-10 md:translate-x-0 lg:right-16">
        <button type="button" onClick={() => changeSlide(-1)} aria-label="Previous banner" className="grid h-10 w-10 place-items-center rounded-full border border-white/50 bg-black/45 text-white backdrop-blur transition hover:border-gold-400 hover:text-gold-400">
          <ChevronLeft size={18} />
        </button>
        <div className="flex gap-1.5 rounded-full bg-black/45 px-3 py-2.5 backdrop-blur">
          {slides.map((_, index) => (
            <button key={index} type="button" onClick={() => setActive(index)} aria-label={`Show banner ${index + 1}`} className={`h-1.5 rounded-full transition-all ${active === index ? 'w-7 bg-gold-400' : 'w-1.5 bg-white/55'}`} />
          ))}
        </div>
        <button type="button" onClick={() => changeSlide(1)} aria-label="Next banner" className="grid h-10 w-10 place-items-center rounded-full border border-white/50 bg-black/45 text-white backdrop-blur transition hover:border-gold-400 hover:text-gold-400">
          <ChevronRight size={18} />
        </button>
      </div>
    </section>
  );
}
