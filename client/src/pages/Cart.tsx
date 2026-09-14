import { Link } from 'react-router-dom';
import Seo from '../components/Seo';
import { useCart } from '../context/CartContext';
import { formatPkr } from '../types';

export default function Cart() {
  const { channel, items, subtotal, setChannel, updateQty, removeItem, clear } = useCart();

  return (
    <>
      <Seo
        title="Your Cart | Rahim Fabrics"
        description="Review retail or wholesale fabric items before checkout at Rahim Fabrics."
        path="/cart"
        noindex={true}
      />
      <section className="section">
        <div className="mx-auto max-w-[1100px]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">Checkout bag</p>
              <h1 className="mt-3 font-display text-4xl font-semibold text-emerald-950">Your cart</h1>
            </div>
            <div className="flex rounded-full bg-cream p-1 text-xs font-bold">
              {(['retail', 'wholesale'] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setChannel(option)}
                  className={`rounded-full px-4 py-2 capitalize ${
                    channel === option ? 'bg-emerald-950 text-white' : 'text-black/50'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {!items.length ? (
            <div className="mt-12 rounded-sm bg-white p-10 text-center shadow-soft">
              <p className="text-black/50">Your {channel} cart is empty.</p>
              <Link to="/catalogue" className="btn-dark mt-6 inline-flex">
                Browse shop
              </Link>
            </div>
          ) : (
            <div className="mt-10 grid gap-8 lg:grid-cols-[1.4fr_.8fr]">
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.productId} className="flex flex-col gap-4 bg-white p-5 shadow-soft sm:flex-row sm:items-center">
                    <div
                      className="h-24 w-full bg-cover bg-center sm:w-24"
                      style={{ backgroundImage: `url(${item.image || '/images/fabric-collection.png'})` }}
                      role="img"
                      aria-label={item.name}
                    />
                    <div className="flex-1">
                      <Link to={`/products/${item.slug}`} className="font-display text-xl font-semibold text-emerald-950">
                        {item.name}
                      </Link>
                      <p className="mt-1 text-sm text-black/45">
                        {item.code} · {formatPkr(item.unitPrice)} / {item.unit}
                      </p>
                      <div className="mt-3 flex items-center gap-3">
                        <label className="text-xs font-bold uppercase tracking-wider text-black/40">
                          Qty
                          <input
                            type="number"
                            min={1}
                            value={item.qty}
                            onChange={(e) => updateQty(item.productId, Number(e.target.value) || 1)}
                            className="field mt-1 w-24"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => removeItem(item.productId)}
                          className="mt-5 text-xs font-bold uppercase tracking-wider text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="font-semibold text-emerald-950">{formatPkr(item.qty * item.unitPrice)}</div>
                  </div>
                ))}
                <button type="button" onClick={clear} className="text-sm font-bold text-black/40">
                  Clear cart
                </button>
              </div>
              <aside className="h-fit bg-emerald-950 p-6 text-white">
                <h2 className="font-display text-2xl">Order summary</h2>
                <p className="mt-2 text-sm capitalize text-white/55">{channel} checkout</p>
                <div className="mt-6 flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span className="font-semibold">{formatPkr(subtotal)}</span>
                </div>
                <p className="mt-4 text-xs leading-5 text-white/45">
                  Delivery charges are confirmed after order review. Product total is charged at checkout.
                </p>
                <Link to="/checkout" className="btn-primary mt-6 w-full">
                  Proceed to checkout
                </Link>
              </aside>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
