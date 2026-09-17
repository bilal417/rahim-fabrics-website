import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import { CartProvider } from './context/CartContext';
import Home from './pages/Home';
import Catalogue from './pages/Catalogue';
import ProductDetail from './pages/ProductDetail';
import Wholesale from './pages/Wholesale';
import About from './pages/About';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import { AdminDashboard, AdminLogin } from './pages/Admin';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
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
      </BrowserRouter>
    </CartProvider>
  );
}
