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
  branch?: string;
};

export default function Checkout() {
  const nav = useNavigate();
  const { channel, items, subtotal, clear } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [bankDetails, setBankDetails] = useState<BankDetails>({});
  const [billingSame, setBillingSame] = useState(true);
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
    if (paymentMethod === 'bank_transfer' && !(form.get('paymentSlip') as File)?.size) {
      setError('Bank deposit ke liye payment slip upload karna zaroori hai.');
      setLoading(false);
      return;
    }
    const payload = new FormData();
    payload.set('channel', channel);
    payload.set('paymentMethod', paymentMethod);
    payload.set('customerName', `${String(form.get('firstName') || '')} ${String(form.get('lastName') || '')}`.trim());
    payload.set('businessName', String(form.get('businessName') || ''));
    payload.set('phone', String(form.get('phone') || ''));
    payload.set('email', String(form.get('email') || ''));
    payload.set('country', 'Pakistan');
    payload.set('city', String(form.get('city') || ''));
    payload.set('postalCode', String(form.get('postalCode') || ''));
    payload.set('address', String(form.get('address') || ''));
    payload.set('addressLine2', String(form.get('addressLine2') || ''));
    payload.set('billingSame', billingSame ? '1' : '0');
    payload.set('billingAddress', billingSame ? '' : String(form.get('billingAddress') || ''));
    payload.set('notes', String(form.get('notes') || ''));
    payload.set(
      'items',
      JSON.stringify(items.map((item) => ({
        productId: Number.isFinite(Number(item.productId)) ? Number(item.productId) : item.productId,
        qty: item.qty,
      }))),
    );
    const paymentSlip = form.get('paymentSlip');
    if (paymentMethod === 'bank_transfer' && paymentSlip instanceof File) {
      payload.set('paymentSlip', paymentSlip);
    }
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
          <form onSubmit={submit} encType="multipart/form-data" className="bg-white p-6 shadow-soft md:p-8">
            <p className="eyebrow">Secure checkout</p>
            <h1 className="mt-3 font-display text-4xl font-semibold text-emerald-950">Checkout</h1>

            <h2 className="mt-8 font-display text-2xl font-semibold text-emerald-950">Contact</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field name="email" label="Email address (optional)" type="email" />
              <Field name="phone" label="Mobile phone number" type="tel" required />
            </div>

            <h2 className="mt-8 font-display text-2xl font-semibold text-emerald-950">Delivery</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="text-xs font-bold uppercase tracking-wider text-black/45 sm:col-span-2">
                Country/Region
                <input value="Pakistan" readOnly className="field mt-2 normal-case tracking-normal" />
              </label>
              <Field name="firstName" label="First name" required />
              <Field name="lastName" label="Last name" required />
              {channel === 'wholesale' && <Field name="businessName" label="Business name" />}
              <label className="text-xs font-bold uppercase tracking-wider text-black/45 sm:col-span-2">
                Address
                <input name="address" required className="field mt-2 normal-case tracking-normal" />
              </label>
              <Field name="addressLine2" label="Apartment, suite, etc. (optional)" />
              <Field name="city" label="City" required />
              <Field name="postalCode" label="Postal code (optional)" />
              <label className="text-xs font-bold uppercase tracking-wider text-black/45 sm:col-span-2">
                Order notes
                <textarea name="notes" className="field mt-2 min-h-20 normal-case tracking-normal" placeholder="Colour preference, delivery timing, etc." />
              </label>
            </div>

            <div className="mt-8">
              <h2 className="font-display text-2xl text-emerald-950">Shipping method</h2>
              <div className="mt-4 flex items-center justify-between rounded-sm border border-emerald-900 bg-cream px-4 py-4 text-sm font-semibold text-emerald-950">
                <span>Standard · Lahore COD</span>
                <span>FREE</span>
              </div>
              <p className="mt-2 text-xs text-black/40">Outside Lahore delivery charges are confirmed before dispatch.</p>
            </div>

            <div className="mt-8">
              <h2 className="font-display text-2xl text-emerald-950">Payment</h2>
              <p className="mt-1 text-sm text-black/45">All transactions are secure and encrypted.</p>
              <div className="mt-4 overflow-hidden rounded-sm border border-black/10">
                <PaymentCard
                  active={paymentMethod === 'cod'}
                  title="Cash on Delivery (COD)"
                  description="Pay in cash when your order is delivered. No slip required."
                  onClick={() => setPaymentMethod('cod')}
                />
                <PaymentCard
                  active={paymentMethod === 'bank_transfer'}
                  title="Bank Deposit"
                  description="Deposit into our Meezan Bank account and upload the receipt."
                  onClick={() => setPaymentMethod('bank_transfer')}
                />
              </div>
              {paymentMethod === 'bank_transfer' && (
                <div className="rounded-b-sm bg-cream p-4 text-sm leading-6 text-black/60">
                  <p className="font-semibold text-emerald-950">Transfer details</p>
                  <p>Account name: {bankDetails.accountName || 'Rahim Fabrics'}</p>
                  {bankDetails.bankName && <p>Bank: {bankDetails.bankName}</p>}
                  {bankDetails.accountNumber && <p>Account number: {bankDetails.accountNumber}</p>}
                  {bankDetails.iban && <p>IBAN: {bankDetails.iban}</p>}
                  {bankDetails.branch && <p>Branch: {bankDetails.branch}</p>}
                  <label className="mt-4 block text-xs font-bold uppercase tracking-wider text-black/55">
                    Upload payment slip <span className="text-red-700">*</span>
                    <input
                      key={paymentMethod}
                      name="paymentSlip"
                      type="file"
                      accept="image/jpeg,image/png,image/webp,application/pdf"
                      required
                      className="field mt-2 bg-white normal-case tracking-normal"
                    />
                    <span className="mt-1 block font-normal normal-case tracking-normal text-black/40">JPG, PNG, WEBP or PDF · maximum 8 MB</span>
                  </label>
                </div>
              )}
            </div>

            <div className="mt-8">
              <h2 className="font-display text-2xl text-emerald-950">Billing address</h2>
              <div className="mt-4 overflow-hidden rounded-sm border border-black/10">
                <label className="flex cursor-pointer items-center gap-3 border-b border-black/10 p-4 text-sm font-semibold">
                  <input type="radio" checked={billingSame} onChange={() => setBillingSame(true)} />
                  Same as shipping address
                </label>
                <label className="flex cursor-pointer items-center gap-3 p-4 text-sm font-semibold">
                  <input type="radio" checked={!billingSame} onChange={() => setBillingSame(false)} />
                  Use a different billing address
                </label>
              </div>
              {!billingSame && (
                <textarea
                  name="billingAddress"
                  required
                  className="field mt-3 min-h-24"
                  placeholder="Complete billing address"
                />
              )}
            </div>

            {error && <p className="mt-5 text-sm text-red-700">{error}</p>}
            <button disabled={loading} className="btn-dark mt-7 w-full">
              {loading ? 'Completing order…' : 'Complete order'}
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
              COD delivery is free in Lahore. Outside Lahore charges are confirmed before dispatch. Product totals use current server prices.
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
      className={`block w-full border-0 p-4 text-left transition ${
        active ? 'bg-cream ring-1 ring-inset ring-emerald-900' : 'bg-white'
      }`}
    >
      <div className="flex items-center gap-3 font-semibold text-emerald-950">
        <span className={`h-4 w-4 rounded-full border ${active ? 'border-[5px] border-emerald-800' : 'border-black/20'}`} />
        {title}
      </div>
      <p className="mt-1 text-sm text-black/50">{description}</p>
    </button>
  );
}
