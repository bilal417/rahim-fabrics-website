import { FormEvent, useEffect, useState } from 'react';
import {
  Boxes,
  ClipboardList,
  FolderTree,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  PackagePlus,
  Pencil,
  Trash2,
} from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
import Seo from '../components/Seo';
import { api } from '../lib/api';
import { products as seedProducts } from '../lib/data';
import { formatPkr, type Inquiry, type Order, type Product } from '../types';

type Tab = 'products' | 'inquiries' | 'productForm' | 'categories' | 'orders';
type Category = { _id?: string; name: string; slug?: string };

export function AdminLogin() {
  const nav = useNavigate();
  const [error, setError] = useState('');
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      const r = await api.post('/auth/login', Object.fromEntries(new FormData(e.currentTarget)));
      localStorage.setItem('rf_token', r.data.token);
      nav('/admin');
    } catch {
      setError('Login failed. Check your email and password.');
    }
  }
  return (
    <>
      <Seo
        title="Admin Login | Rahim Fabrics"
        description="Private trade administration for Rahim Fabrics."
        path="/admin/login"
        noindex={true}
      />
      <div className="grid min-h-screen place-items-center bg-emerald-950 p-5">
        <form onSubmit={submit} className="w-full max-w-md bg-cream p-8 shadow-2xl md:p-10">
          <img src="/logo.png" className="h-16 w-16 object-contain" alt="" />
          <h1 className="mt-5 font-display text-3xl font-semibold text-emerald-950">Trade administration</h1>
          <p className="mt-2 text-sm text-black/45">Sign in to manage catalogue, orders and inquiries.</p>
          <input
            className="field mt-7"
            name="email"
            type="email"
            defaultValue="info@rahimfabrics.site"
            placeholder="Email address"
            required
          />
          <input className="field mt-3" name="password" type="password" placeholder="Password" required />
          {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
          <button className="btn-dark mt-5 w-full">Secure login</button>
        </form>
      </div>
    </>
  );
}

export function AdminDashboard() {
  const nav = useNavigate();
  const token = localStorage.getItem('rf_token');
  const [tab, setTab] = useState<Tab>('products');
  const [items, setItems] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [inquiries, setInquiries] = useState<(Inquiry & { _id?: string; createdAt?: string; status?: string })[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const load = () => {
    api
      .get('/products?admin=true')
      .then((r) => setItems(r.data))
      .catch(() => setItems(seedProducts));
    api
      .get('/inquiries')
      .then((r) => setInquiries(r.data))
      .catch(() => setInquiries([]));
    api
      .get('/categories')
      .then((r) => setCategories(r.data))
      .catch(() =>
        setCategories([
          { name: 'Wash & Wear' },
          { name: 'Cotton' },
          { name: 'Khaddar' },
          { name: 'Summer' },
          { name: 'Winter' },
        ]),
      );
    api
      .get('/orders')
      .then((r) => setOrders(r.data))
      .catch(() => setOrders([]));
  };

  useEffect(load, []);
  if (!token) return <Navigate to="/admin/login" replace />;

  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    try {
      await api.post(editing ? `/products/${editing._id}` : '/products', data, {
        // Product image uploads can take longer on shared hosting. Keep this
        // request alive so a successful save is not reported as a failure.
        timeout: 120000,
      });
      form.reset();
      setEditing(null);
      setTab('products');
      load();
    } catch (error) {
      const failure = error as {
        code?: string;
        response?: { data?: { message?: string } };
      };
      const message = failure.response?.data?.message;
      if (failure.code === 'ECONNABORTED') {
        alert('The upload is taking longer than expected. Refresh the product list before trying again, because the product may still have been saved.');
      } else {
        alert(message || 'Could not save. Confirm the PHP API, MySQL and uploads configuration.');
      }
    }
  }

  async function remove(id?: string) {
    if (!id || !confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      load();
    } catch {
      alert('Could not delete product.');
    }
  }

  async function addCategory(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    try {
      await api.post('/categories', Object.fromEntries(new FormData(form)));
      form.reset();
      load();
    } catch {
      alert('Could not add category.');
    }
  }

  async function removeCategory(id?: string) {
    if (id && confirm('Delete this category?')) {
      await api.delete(`/categories/${id}`);
      load();
    }
  }

  async function updateInquiry(id: string | undefined, status: string) {
    if (id) {
      await api.patch(`/inquiries/${id}`, { status });
      load();
    }
  }

  async function updateOrder(id: string | undefined, patch: { orderStatus?: string; paymentStatus?: string }) {
    if (!id) return;
    try {
      await api.patch(`/orders/${id}`, patch);
      load();
    } catch {
      alert('Could not update order.');
    }
  }

  const title =
    tab === 'products'
      ? 'Product catalogue'
      : tab === 'productForm'
        ? editing
          ? 'Edit fabric'
          : 'Add a new fabric'
        : tab === 'categories'
          ? 'Fabric categories'
          : tab === 'orders'
            ? 'Customer orders'
            : 'Wholesale inquiries';

  return (
    <>
      <Seo title="Admin | Rahim Fabrics" description="Private trade administration for Rahim Fabrics." path="/admin" noindex={true} />
      <div className="min-h-screen bg-[#f4f1eb] md:flex">
        <aside className="bg-emerald-950 p-6 text-white md:sticky md:top-0 md:h-screen md:w-64">
          <div className="flex items-center gap-3">
            <img src="/logo.png" className="h-11 w-11 object-contain" alt="" />
            <div className="font-display text-xl">Rahim Fabrics</div>
          </div>
          <nav className="mt-10 space-y-2">
            <Side icon={<Boxes />} active={tab === 'products'} onClick={() => setTab('products')}>
              Products
            </Side>
            <Side
              icon={<PackagePlus />}
              active={tab === 'productForm'}
              onClick={() => {
                setEditing(null);
                setTab('productForm');
              }}
            >
              Add product
            </Side>
            <Side icon={<ClipboardList />} active={tab === 'orders'} onClick={() => setTab('orders')}>
              Orders
            </Side>
            <Side icon={<FolderTree />} active={tab === 'categories'} onClick={() => setTab('categories')}>
              Categories
            </Side>
            <Side icon={<MessageSquare />} active={tab === 'inquiries'} onClick={() => setTab('inquiries')}>
              Inquiries
            </Side>
          </nav>
          <button
            onClick={() => {
              localStorage.removeItem('rf_token');
              nav('/admin/login');
            }}
            className="mt-10 flex items-center gap-3 text-sm text-white/55"
          >
            <LogOut size={17} /> Sign out
          </button>
        </aside>
        <main className="flex-1 p-5 md:p-10">
          <div className="mx-auto max-w-6xl">
            <div className="flex items-center gap-3">
              <LayoutDashboard className="text-gold-500" />
              <h1 className="font-display text-3xl font-semibold text-emerald-950">{title}</h1>
            </div>

            {tab === 'products' && (
              <div className="mt-8 overflow-x-auto bg-white shadow-soft">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead className="bg-emerald-950 text-white">
                    <tr>
                      {['Product', 'Code', 'Retail', 'Wholesale', 'Stock', 'Actions'].map((x) => (
                        <th key={x} className="p-4">
                          {x}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((p) => (
                      <tr key={p.code} className="border-b">
                        <td className="p-4 font-semibold">{p.name}</td>
                        <td className="p-4 text-black/50">{p.code}</td>
                        <td className="p-4">
                          {formatPkr(p.retailPrice || 0)} / {p.retailUnit || 'meter'}
                          {p.bundleQty && p.bundlePrice ? (
                            <div className="mt-1 text-xs font-bold text-gold-600">
                              {p.bundleQty} for {formatPkr(p.bundlePrice)}
                            </div>
                          ) : null}
                        </td>
                        <td className="p-4">{formatPkr(p.wholesalePrice || 0)} / thaan</td>
                        <td className="p-4">
                          {p.unlimitedStock ? (
                            <div className="font-bold text-emerald-800">Unlimited retail stock</div>
                          ) : (
                            <>
                              <div className={p.stock < 10 ? 'font-bold text-red-700' : ''}>{p.stock} thaans</div>
                              <div className="text-xs text-black/40">{p.stockMeters ?? 0} metres</div>
                            </>
                          )}
                        </td>
                        <td className="p-4">
                          <button
                            title="Edit product and stock"
                            onClick={() => {
                              setEditing(p);
                              setTab('productForm');
                            }}
                            className="mr-4 text-emerald-900"
                          >
                            <Pencil size={17} />
                          </button>
                          <button title="Delete" onClick={() => remove(p._id)} className="text-red-700">
                            <Trash2 size={17} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {tab === 'productForm' && (
              <form key={editing?.code || 'new'} onSubmit={save} className="mt-8 grid gap-4 bg-white p-6 shadow-soft md:grid-cols-2">
                <AdminInput name="name" placeholder="Product name" value={editing?.name} />
                <AdminInput name="code" placeholder="Product code" value={editing?.code} />
                <AdminInput name="category" placeholder="Category" value={editing?.category} />
                <AdminInput name="fabricType" placeholder="Fabric type" value={editing?.fabricType} />
                <AdminInput name="colors" placeholder="Colours, comma separated" value={editing?.colors.join(', ')} />
                <AdminInput name="thaanLength" placeholder="Thaan length, e.g. 20 metres" value={editing?.thaanLength} />
                <AdminInput name="suitsPerThaan" placeholder="Suits per thaan" type="number" value={editing?.suitsPerThaan} />
                <AdminInput name="stock" placeholder="Wholesale stock (thaans)" type="number" value={editing?.stock} />
                <AdminInput name="stockMeters" placeholder="Retail stock (metres)" type="number" value={editing?.stockMeters ?? 0} />
                <AdminInput name="retailPrice" placeholder="Retail price (PKR)" type="number" value={editing?.retailPrice ?? 0} />
                <AdminInput name="compareAtPrice" placeholder="Compare-at price (optional; enter 0 to hide)" type="number" value={editing?.compareAtPrice ?? 0} />
                <AdminCheckbox
                  name="bundleEnabled"
                  label="Enable bundle offer"
                  defaultChecked={Boolean(editing?.bundleQty && editing?.bundlePrice)}
                />
                <div className="grid grid-cols-2 gap-4">
                  <AdminInput name="bundleQty" placeholder="Bundle quantity" type="number" value={editing?.bundleQty ?? 2} />
                  <AdminInput name="bundlePrice" placeholder="Bundle price (PKR)" type="number" value={editing?.bundlePrice ?? 0} />
                </div>
                <AdminInput name="wholesalePrice" placeholder="Wholesale price / thaan (PKR)" type="number" value={editing?.wholesalePrice ?? 0} />
                <label className="text-xs font-bold uppercase tracking-wider text-black/45">
                  Retail unit
                  <select name="retailUnit" defaultValue={editing?.retailUnit || 'meter'} className="field mt-2 normal-case tracking-normal">
                    <option value="meter">Meter</option>
                    <option value="suit">Suit</option>
                  </select>
                </label>
                <AdminInput name="minRetailQty" placeholder="Min retail qty" type="number" value={editing?.minRetailQty ?? 2} />
                <AdminInput name="minWholesaleQty" placeholder="Min wholesale qty" type="number" value={editing?.minWholesaleQty ?? 1} />
                <label className="text-xs font-bold uppercase tracking-wider text-black/45">
                  Purchase mode
                  <select name="purchaseMode" defaultValue={editing?.purchaseMode || 'checkout'} className="field mt-2 normal-case tracking-normal">
                    <option value="checkout">Website checkout</option>
                    <option value="whatsapp">WhatsApp order</option>
                  </select>
                </label>
                <div className="grid gap-3 rounded-sm border border-black/10 bg-cream p-4">
                  <AdminCheckbox name="retailOnly" label="Retail-only product" defaultChecked={Boolean(editing?.retailOnly)} />
                  <AdminCheckbox name="unlimitedStock" label="Unlimited stock" defaultChecked={Boolean(editing?.unlimitedStock)} />
                  <AdminCheckbox name="featured" label="Featured product" defaultChecked={Boolean(editing?.featured)} />
                </div>
                <textarea
                  name="description"
                  required
                  defaultValue={editing?.description}
                  className="field min-h-28 md:col-span-2"
                  placeholder="Product description"
                />
                <label className="field cursor-pointer md:col-span-2">
                  {editing ? 'Upload replacement images (optional)' : 'Upload product images'}
                  <input type="file" name="images" multiple accept="image/jpeg,image/png,image/webp" className="mt-2 block text-xs" />
                </label>
                <div className="flex gap-3 md:col-span-2">
                  <button className="btn-dark">{editing ? 'Save changes' : 'Add to catalogue'}</button>
                  {editing && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(null);
                        setTab('products');
                      }}
                      className="px-5 text-sm font-bold text-black/45"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            )}

            {tab === 'orders' && (
              <div className="mt-8 grid gap-4">
                {orders.length ? (
                  orders.map((order) => (
                    <div key={order._id || order.orderNumber} className="bg-white p-5 shadow-soft">
                      <div className="flex flex-col justify-between gap-4 lg:flex-row">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-bold text-emerald-950">{order.orderNumber}</h3>
                            <span className="rounded-full bg-cream px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-950">
                              {order.channel}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-black/50">
                            {order.customerName}
                            {order.businessName ? ` · ${order.businessName}` : ''} · {order.city} ·{' '}
                            <a className="font-semibold text-emerald-900" href={`tel:${order.phone}`}>
                              {order.phone}
                            </a>
                          </p>
                          {order.email && <p className="mt-1 text-sm text-black/45">{order.email}</p>}
                          <p className="mt-2 text-sm text-black/55">
                            {order.address}
                            {order.addressLine2 ? `, ${order.addressLine2}` : ''}, {order.city}
                            {order.postalCode ? ` ${order.postalCode}` : ''}, {order.country || 'Pakistan'}
                          </p>
                          {!order.billingSame && order.billingAddress && (
                            <p className="mt-2 text-xs text-black/45">
                              <span className="font-bold text-black/60">Billing:</span> {order.billingAddress}
                            </p>
                          )}
                          <p className="mt-3 text-sm font-semibold text-emerald-950">
                            {formatPkr(order.total)} · {order.paymentMethod.replace('_', ' ')}
                          </p>
                          {order.paymentMethod === 'bank_transfer' && order.paymentSlipUrl && (
                            <a
                              href={order.paymentSlipUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-2 inline-flex rounded-sm bg-emerald-950 px-3 py-2 text-xs font-bold text-white"
                            >
                              View payment slip
                            </a>
                          )}
                          <div className="mt-4 overflow-hidden rounded-sm border border-black/10 text-xs">
                            {order.items?.map((item) => (
                              <div key={`${item.productCode}-${item.qty}`} className="grid gap-1 border-b border-black/10 p-3 last:border-0 sm:grid-cols-[1fr_auto]">
                                <div>
                                  <div className="font-bold text-emerald-950">{item.productName}</div>
                                  <div className="text-black/45">Article: {item.productCode} · {item.qty} {item.unit} × {formatPkr(item.unitPrice)}</div>
                                </div>
                                <div className="font-bold text-emerald-950">{formatPkr(item.lineTotal)}</div>
                              </div>
                            ))}
                          </div>
                          {order.notes && (
                            <p className="mt-3 text-xs text-black/45"><span className="font-bold text-black/60">Notes:</span> {order.notes}</p>
                          )}
                        </div>
                        <div className="shrink-0 space-y-3">
                          <div className="text-xs text-black/35">
                            {order.createdAt ? new Date(order.createdAt).toLocaleString() : ''}
                          </div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-black/40">
                            Order status
                            <select
                              aria-label="Order status"
                              value={order.orderStatus}
                              onChange={(e) => updateOrder(order._id, { orderStatus: e.target.value })}
                              className="mt-1 block rounded border px-3 py-2 text-xs font-bold"
                            >
                              {['new', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                                <option key={status} value={status}>
                                  {status}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-black/40">
                            Payment status
                            <select
                              aria-label="Payment status"
                              value={order.paymentStatus}
                              onChange={(e) => updateOrder(order._id, { paymentStatus: e.target.value })}
                              className="mt-1 block rounded border px-3 py-2 text-xs font-bold"
                            >
                              {['pending', 'cod_pending', 'paid', 'failed', 'refunded'].map((status) => (
                                <option key={status} value={status}>
                                  {status}
                                </option>
                              ))}
                            </select>
                          </label>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white p-10 text-center text-black/45">No orders yet.</div>
                )}
              </div>
            )}

            {tab === 'categories' && (
              <div className="mt-8 grid gap-6 lg:grid-cols-[.7fr_1.3fr]">
                <form onSubmit={addCategory} className="h-fit bg-white p-6 shadow-soft">
                  <h2 className="font-display text-xl font-semibold text-emerald-950">Add category</h2>
                  <input required name="name" className="field mt-5" placeholder="e.g. Blended Fabric" />
                  <textarea name="description" className="field mt-3 min-h-24" placeholder="Short description (optional)" />
                  <button className="btn-dark mt-4">Add category</button>
                </form>
                <div className="bg-white shadow-soft">
                  {categories.map((c) => (
                    <div key={c._id || c.name} className="flex items-center justify-between border-b p-5">
                      <div>
                        <div className="font-bold text-emerald-950">{c.name}</div>
                        <div className="mt-1 text-xs text-black/35">/{c.slug || c.name.toLowerCase().replaceAll(' ', '-')}</div>
                      </div>
                      {c._id && (
                        <button onClick={() => removeCategory(c._id)} className="text-red-700">
                          <Trash2 size={17} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === 'inquiries' && (
              <div className="mt-8 grid gap-4">
                {inquiries.length ? (
                  inquiries.map((q, i) => (
                    <div key={q._id || i} className="bg-white p-5 shadow-soft">
                      <div className="flex flex-col justify-between gap-4 sm:flex-row">
                        <div>
                          <h3 className="font-bold text-emerald-950">{q.businessName || q.customerName}</h3>
                          <p className="mt-1 text-sm text-black/50">
                            {q.customerName} · {q.city} ·{' '}
                            <a className="font-semibold text-emerald-900" href={`tel:${q.phone}`}>
                              {q.phone}
                            </a>
                          </p>
                          <p className="mt-3 text-sm">
                            {q.shopType} · {q.monthlyRequirement}
                          </p>
                        </div>
                        <div>
                          <div className="text-xs text-black/35">
                            {q.createdAt ? new Date(q.createdAt).toLocaleDateString() : ''}
                          </div>
                          {q._id && (
                            <select
                              aria-label="Inquiry status"
                              value={q.status || 'new'}
                              onChange={(e) => updateInquiry(q._id, e.target.value)}
                              className="mt-3 rounded border px-3 py-2 text-xs font-bold"
                            >
                              <option value="new">New</option>
                              <option value="contacted">Contacted</option>
                              <option value="closed">Closed</option>
                            </select>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white p-10 text-center text-black/45">No inquiries yet.</div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}

function Side({
  icon,
  active,
  onClick,
  children,
}: {
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-sm px-4 py-3 text-sm ${
        active ? 'bg-gold-500 font-bold text-emerald-950' : 'text-white/60 hover:bg-white/5'
      }`}
    >
      <span className="[&_svg]:h-[17px] [&_svg]:w-[17px]">{icon}</span>
      {children}
    </button>
  );
}

function AdminInput({
  name,
  placeholder,
  type = 'text',
  value,
}: {
  name: string;
  placeholder: string;
  type?: string;
  value?: string | number;
}) {
  return <input name={name} placeholder={placeholder} type={type} defaultValue={value} required className="field" />;
}

function AdminCheckbox({
  name,
  label,
  defaultChecked = false,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-emerald-950">
      <input name={name} type="checkbox" value="1" defaultChecked={defaultChecked} className="h-4 w-4 accent-emerald-900" />
      {label}
    </label>
  );
}
