import { Routes, Route } from 'react-router-dom';
import { PublicSite } from './pages/PublicSite';
import { MerchPage } from './pages/MerchPage';
import { MerchItemPage } from './pages/MerchItemPage';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AboutEditor } from './pages/admin/AboutEditor';
import { ReleasesEditor } from './pages/admin/ReleasesEditor';
import { GalleryEditor } from './pages/admin/GalleryEditor';
import { MerchEditor } from './pages/admin/MerchEditor';
import { ContactEditor } from './pages/admin/ContactEditor';
import { SocialsEditor } from './pages/admin/SocialsEditor';
import { NavigationEditor } from './pages/admin/NavigationEditor';
import { SiteSettingsEditor } from './pages/admin/SiteSettingsEditor';
import { HeroEditor } from './pages/admin/HeroEditor';
import { OrdersEditor } from './pages/admin/OrdersEditor';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { GalleryPage } from './pages/GalleryPage';
import { AdminProtectedRoute } from './components/admin/AdminProtectedRoute';
import { AuthProvider } from './lib/auth';
import { CartProvider } from './lib/cart';
import { AccentColorProvider } from './lib/accentColor';
import { ToastProvider } from './components/admin/Toast';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
      <AccentColorProvider>
      <ToastProvider>
      <Routes>
        <Route path="/" element={<PublicSite />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/merch" element={<MerchPage />} />
        <Route path="/merch/:id" element={<MerchItemPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="hero" element={<HeroEditor />} />
          <Route path="about" element={<AboutEditor />} />
          <Route path="releases" element={<ReleasesEditor />} />
          <Route path="gallery" element={<GalleryEditor />} />
          <Route path="merch" element={<MerchEditor />} />
          <Route path="contact" element={<ContactEditor />} />
          <Route path="socials" element={<SocialsEditor />} />
          <Route path="navigation" element={<NavigationEditor />} />
          <Route path="settings" element={<SiteSettingsEditor />} />
          <Route path="orders" element={<OrdersEditor />} />
        </Route>
      </Routes>
      </ToastProvider>
      </AccentColorProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
