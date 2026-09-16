import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Seo from '../components/Seo';
import { useCart } from '../context/CartContext';
import { api } from '../lib/api';
import { calculateItemTotal, formatPkr, type Order, type PaymentMethod } from '../types';

type BankDetails = {
  accountName?: string;
  bankName?: string;
  accountNumber?: string;
  iban?: string;
};

export default function Checkout() {
  const nav = useNavigate();
  const { channel, items, subtotal, clear } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [bankDetails, setBankDetails] = useState<BankDetails>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/checkout/payment-options')
      .then((r) => setBankDetails(r.data?.bankDetails || {}))
      .catch(() => undefined);
  }, []);

  if (!items.length) {
    return (
      <section className="section text-center">
        <h1 className="font-display text-4xl text-emerald-950">Your cart is empty</h1>
        <Link to="/catalogue" className="btn-dark mt-6 inline-flex">
          Browse shop
        </Link>
      </section>
    );
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const form = new FormData(e.currentTarget);
    const payload = {
      channel,
      paymentMethod,
      customerName: String(form.get('customerName') || ''),
      businessName: String(form.get('businessName') || ''),
      phone: String(form.get('phone') || ''),
      email: String(form.get('email') || ''),
      city: String(form.get('city') || ''),
      address: String(form.get('address') || ''),
      notes: String(form.get('notes') || ''),
      items: items.map((item) => ({
        productId: Number.isFinite(Number(item.productId)) ? Number(item.productId) : item.productId,
        qty: item.qty,
      })),
    };
    try {
      const response = await api.post<Order>('/orders', payload);
      clear();
      nav(`/order-success/${response.data.orderNumber}`, { state: { order: response.data } });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Could not place the order. Please try again or WhatsApp us.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Seo
        title="Checkout | Rahim Fabrics"
        description="Complete your retail or wholesale fabric order with COD or bank transfer."
        path="/checkout"
        noindex={true}
      />
      <section className="section">
        <div className="mx-auto grid max-w-[1200px] gap-10 lg:grid-cols-[1.2fr_.8fr]">
          <form onSubmit={submit} className="bg-white p-6 shadow-soft md:p-8">
            <p className="eyebrow">Secure checkout</p>
            <h1 className="mt-3 font-display text-4xl font-semibold text-emerald-950">
              {channel === 'retail' ? 'Retail checkout' : 'Wholesale checkout'}
            </h1>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <Field name="customerName" label="Full name" required />
              <Field name="phone" label="Phone" type="tel" required />
              <Field name="email" label="Email" type="email" />
              {channel === 'wholesale' && <Field name="businessName" label="Business name" />}
              <Field name="city" label="City" required />
              <label className="text-xs font-bold uppercase tracking-wider text-black/45 sm:col-span-2">
                Delivery address
                <textarea name="address" required className="field mt-2 min-h-24 normal-case tracking-normal" />
              </label>
              <label className="text-xs font-bold uppercase tracking-wider text-black/45 sm:col-span-2">
                Order notes
                <textarea name="notes" className="field mt-2 min-h-20 normal-case tracking-normal" placeholder="Colour preference, delivery timing, etc." />
              </label>
            </div>

            <div className="mt-8">
              <h2 className="font-display text-2xl text-emerald-950">Payment</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <PaymentCard
                  active={paymentMethod === 'cod'}
                  title="Cash on delivery"
                  description="Pay when your order is delivered."
                  onClick={() => setPaymentMethod('cod')}
                />
                <PaymentCard
                  active={paymentMethod === 'bank_transfer'}
                  title="Bank transfer"
                  description="Transfer and share the order number as reference."
                  onClick={() => setPaymentMethod('bank_transfer')}
                />
              </div>
              {paymentMethod === 'bank_transfer' && (
                <div className="mt-4 rounded-sm bg-cream p-4 text-sm leading-6 text-black/60">
                  <p className="font-semibold text-emerald-950">Transfer details</p>
                  <p>Account name: {bankDetails.accountName || 'Rahim Fabrics'}</p>
                  {bankDetails.bankName && <p>Bank: {bankDetails.bankName}</p>}
                  {bankDetails.accountNumber && <p>Account number: {bankDetails.accountNumber}</p>}
                  {bankDetails.iban && <p>IBAN: {bankDetails.iban}</p>}
                  <p className="mt-2 text-xs">
                    After placing the order, use your order number as the transfer reference and WhatsApp the receipt.
                  </p>
                </div>
              )}
            </div>

            {error && <p className="mt-5 text-sm text-red-700">{error}</p>}
            <button disabled={loading} className="btn-dark mt-7 min-w-48">
              {loading ? 'Placing order…' : `Place ${channel} order`}
            </button>
          </form>

          <aside className="h-fit bg-emerald-950 p-6 text-white">
            <h2 className="font-display text-2xl">Order summary</h2>
            <div className="mt-5 space-y-3">
              {items.map((item) => (
                <div key={item.productId} className="flex justify-between gap-4 text-sm">
                  <span className="text-white/70">
                    {item.name} × {item.qty} {item.unit}
                  </span>
                  <span>{formatPkr(calculateItemTotal(item))}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-between border-t border-white/10 pt-4 font-semibold">
              <span>Total</span>
              <span>{formatPkr(subtotal)}</span>
            </div>
            <p className="mt-4 text-xs leading-5 text-white/45">
              Delivery charges are confirmed after order review.
            </p>
          </aside>
        </div>
      </section>
    </>
  );
}

function Field({
  name,
  label,
  type = 'text',
  required = false,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="text-xs font-bold uppercase tracking-wider text-black/45">
      {label}
      <input name={name} type={type} required={required} className="field mt-2 normal-case tracking-normal" />
    </label>
  );
}

function PaymentCard({
  active,
  title,
  description,
  onClick,
}: {
  active: boolean;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-sm border p-4 text-left transition ${
        active ? 'border-emerald-950 bg-cream' : 'border-black/10 bg-white'
      }`}
    >
      <div className="font-semibold text-emerald-950">{title}</div>
      <p className="mt-1 text-sm text-black/50">{description}</p>
    </button>
  );
}
