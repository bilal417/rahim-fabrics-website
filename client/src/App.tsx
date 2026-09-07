import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Catalogue from './pages/Catalogue';
import ProductDetail from './pages/ProductDetail';
import Wholesale from './pages/Wholesale';
import About from './pages/About';
import { AdminDashboard, AdminLogin } from './pages/Admin';

export default function App(){return <BrowserRouter><Routes><Route element={<Layout/>}><Route path="/" element={<Home/>}/><Route path="/catalogue" element={<Catalogue/>}/><Route path="/products/:slug" element={<ProductDetail/>}/><Route path="/wholesale" element={<Wholesale/>}/><Route path="/about" element={<About/>}/></Route><Route path="/admin/login" element={<AdminLogin/>}/><Route path="/admin" element={<AdminDashboard/>}/></Routes></BrowserRouter>}
