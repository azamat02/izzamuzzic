import { Routes, Route } from 'react-router-dom';
import { PublicSite } from './pages/PublicSite';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AboutEditor } from './pages/admin/AboutEditor';
import { ReleasesEditor } from './pages/admin/ReleasesEditor';
import { GalleryEditor } from './pages/admin/GalleryEditor';
import { MerchEditor } from './pages/admin/MerchEditor';
import { ToursEditor } from './pages/admin/ToursEditor';
import { PressEditor } from './pages/admin/PressEditor';
import { ContactEditor } from './pages/admin/ContactEditor';
import { SocialsEditor } from './pages/admin/SocialsEditor';
import { NavigationEditor } from './pages/admin/NavigationEditor';
import { SiteSettingsEditor } from './pages/admin/SiteSettingsEditor';
import { AdminProtectedRoute } from './components/admin/AdminProtectedRoute';
import { AuthProvider } from './lib/auth';
import { ToastProvider } from './components/admin/Toast';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
      <Routes>
        <Route path="/" element={<PublicSite />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="about" element={<AboutEditor />} />
          <Route path="releases" element={<ReleasesEditor />} />
          <Route path="gallery" element={<GalleryEditor />} />
          <Route path="merch" element={<MerchEditor />} />
          <Route path="tours" element={<ToursEditor />} />
          <Route path="press" element={<PressEditor />} />
          <Route path="contact" element={<ContactEditor />} />
          <Route path="socials" element={<SocialsEditor />} />
          <Route path="navigation" element={<NavigationEditor />} />
          <Route path="settings" element={<SiteSettingsEditor />} />
        </Route>
      </Routes>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
