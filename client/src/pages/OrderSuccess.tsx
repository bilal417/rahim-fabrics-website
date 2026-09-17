import { Link, useLocation, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Seo from '../components/Seo';
import { api } from '../lib/api';
import { formatPkr, type Order } from '../types';

export default function OrderSuccess() {
  const { orderNumber = '' } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState<Order | null>((location.state as { order?: Order } | null)?.order || null);

  useEffect(() => {
    if (order || !orderNumber) return;
    api
      .get(`/orders/${orderNumber}`)
      .then((r) => setOrder(r.data))
      .catch(() => undefined);
  }, [order, orderNumber]);

  return (
    <>
      <Seo
        title="Order received | Rahim Fabrics"
        description="Your Rahim Fabrics order has been received."
        path={`/order-success/${orderNumber}`}
        noindex={true}
      />
      <section className="section">
        <div className="mx-auto max-w-2xl bg-white p-8 text-center shadow-soft md:p-12">
          <p className="eyebrow">Thank you</p>
          <h1 className="mt-4 font-display text-4xl font-semibold text-emerald-950">Order received</h1>
          <p className="mt-4 text-black/55">
            Order number <span className="font-semibold text-emerald-950">{orderNumber}</span>
          </p>
          {order && (
            <div className="mt-8 rounded-sm bg-cream p-5 text-left text-sm leading-7 text-black/60">
              <p>
                Channel: <strong className="capitalize text-emerald-950">{order.channel}</strong>
              </p>
              <p>
                Payment: <strong className="capitalize text-emerald-950">{order.paymentMethod.replace('_', ' ')}</strong>
              </p>
              <p>
                Total: <strong className="text-emerald-950">{formatPkr(order.total)}</strong>
              </p>
              {order.paymentMethod === 'bank_transfer' && order.bankDetails && (
                <div className="mt-4 border-t border-black/10 pt-4">
                  <p className="font-semibold text-emerald-950">Bank transfer details</p>
                  <p>Account name: {order.bankDetails.accountName}</p>
                  {order.bankDetails.bankName && <p>Bank: {order.bankDetails.bankName}</p>}
                  {order.bankDetails.accountNumber && <p>Account: {order.bankDetails.accountNumber}</p>}
                  {order.bankDetails.iban && <p>IBAN: {order.bankDetails.iban}</p>}
                  {order.bankDetails.branch && <p>Branch: {order.bankDetails.branch}</p>}
                  <p className="mt-2">Your uploaded payment slip has been submitted with this order for verification.</p>
                </div>
              )}
              {order.paymentMethod === 'cod' && (
                <p className="mt-4">Pay cash on delivery. Our team will confirm dispatch details shortly.</p>
              )}
            </div>
          )}
          <Link to="/catalogue" className="btn-dark mt-8 inline-flex">
            Continue shopping
          </Link>
        </div>
      </section>
    </>
  );
}
