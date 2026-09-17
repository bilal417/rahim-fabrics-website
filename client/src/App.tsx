import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import { CartProvider } from './context/CartContext';
import Home from './pages/Home';

const Catalogue = lazy(() => import('./pages/Catalogue'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Wholesale = lazy(() => import('./pages/Wholesale'));
const About = lazy(() => import('./pages/About'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'));
const NotFound = lazy(() => import('./pages/NotFound'));
const AdminLogin = lazy(() => import('./pages/Admin').then((module) => ({ default: module.AdminLogin })));
const AdminDashboard = lazy(() => import('./pages/Admin').then((module) => ({ default: module.AdminDashboard })));

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Suspense fallback={<div className="min-h-[45vh] bg-cream" aria-label="Loading page" />}>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/catalogue" element={<Catalogue />} />
              <Route path="/products/:slug" element={<ProductDetail />} />
              <Route path="/wholesale" element={<Wholesale />} />
              <Route path="/about" element={<About />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-success/:orderNumber" element={<OrderSuccess />} />
              <Route path="*" element={<NotFound />} />
            </Route>
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </CartProvider>
  );
}
