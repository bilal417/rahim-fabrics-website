import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import Seo, { Breadcrumbs } from '../components/Seo';
import { ADDRESS_FULL, EMAIL, MAPS_URL, PHONE_DISPLAY, PHONE_TEL, whatsappUrl } from '../lib/data';
import { localBusinessSchema, webPageSchema } from '../lib/seo';

const path = '/contact';
const title = 'Contact Rahim Fabrics | New Azam Cloth Market Lahore';
const description = 'Contact Rahim Fabrics for retail fabric orders, wholesale thaans and current stock at New Azam Cloth Market Lahore.';
const crumbs = [{ name: 'Home', path: '/' }, { name: 'Contact', path }];

export default function Contact() {
  return (
    <>
      <Seo
        title={title}
        description={description}
        path={path}
        breadcrumbs={crumbs}
        jsonLd={[
          { '@context': 'https://schema.org', ...webPageSchema({ path, title, description, type: 'ContactPage' }) },
          { '@context': 'https://schema.org', ...localBusinessSchema },
        ]}
      />
      <section className="bg-emerald-950 px-5 py-20 text-white md:px-10">
        <div className="mx-auto max-w-[1100px]">
          <Breadcrumbs items={crumbs} tone="dark" />
          <p className="eyebrow">Retail and wholesale assistance</p>
          <h1 className="mt-4 font-display text-5xl font-semibold md:text-6xl">Contact Rahim Fabrics</h1>
          <p className="mt-5 max-w-2xl leading-8 text-white/65">Ask about a product, confirm a shade or discuss current thaan availability with our team in Lahore.</p>
        </div>
      </section>
      <section className="section">
        <div className="mx-auto grid max-w-[1100px] gap-6 md:grid-cols-2">
          <a href={whatsappUrl('Assalam-o-Alaikum, I need help with a fabric order.')} target="_blank" rel="noreferrer" className="group border border-emerald-950/10 bg-cream p-8 transition hover:border-gold-500">
            <MessageCircle className="text-gold-600" />
            <h2 className="mt-5 font-display text-3xl font-semibold text-emerald-950">WhatsApp</h2>
            <p className="mt-3 leading-7 text-black/55">Send the product name, colour and required quantity for quicker guidance.</p>
          </a>
          <a href={`tel:${PHONE_TEL}`} className="group border border-emerald-950/10 bg-white p-8 transition hover:border-gold-500">
            <Phone className="text-gold-600" />
            <h2 className="mt-5 font-display text-3xl font-semibold text-emerald-950">Call the shop</h2>
            <p className="mt-3 leading-7 text-black/55">{PHONE_DISPLAY}</p>
          </a>
          <a href={`mailto:${EMAIL}`} className="group border border-emerald-950/10 bg-white p-8 transition hover:border-gold-500">
            <Mail className="text-gold-600" />
            <h2 className="mt-5 font-display text-3xl font-semibold text-emerald-950">Email</h2>
            <p className="mt-3 leading-7 text-black/55">{EMAIL}</p>
          </a>
          <a href={MAPS_URL} target="_blank" rel="noreferrer" className="group border border-emerald-950/10 bg-cream p-8 transition hover:border-gold-500">
            <MapPin className="text-gold-600" />
            <h2 className="mt-5 font-display text-3xl font-semibold text-emerald-950">Visit the shop</h2>
            <p className="mt-3 leading-7 text-black/55">{ADDRESS_FULL}</p>
          </a>
        </div>
      </section>
    </>
  );
}
