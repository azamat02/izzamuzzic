import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import { useState } from 'react';
import {
  HiOutlineHome, HiOutlineUser, HiOutlineMusicNote, HiOutlinePhotograph,
  HiOutlineShoppingBag, HiOutlineClipboardList,
  HiOutlineMail, HiOutlineGlobe, HiOutlineMenu as HiOutlineNavigation,
  HiOutlineCog, HiOutlineLogout, HiOutlineX, HiMenu, HiOutlineFilm,
  HiOutlineColorSwatch,
} from 'react-icons/hi';

const navItems = [
  { label: 'Dashboard', path: '/admin', icon: HiOutlineHome, end: true },
  { label: 'Logo', path: '/admin/logo', icon: HiOutlineColorSwatch },
  { label: 'Hero', path: '/admin/hero', icon: HiOutlineFilm },
  { label: 'About', path: '/admin/about', icon: HiOutlineUser },
  { label: 'Releases', path: '/admin/releases', icon: HiOutlineMusicNote },
  { label: 'Gallery', path: '/admin/gallery', icon: HiOutlinePhotograph },
  { label: 'Merch', path: '/admin/merch', icon: HiOutlineShoppingBag },
  { label: 'Orders', path: '/admin/orders', icon: HiOutlineClipboardList },
  { label: 'Contact', path: '/admin/contact', icon: HiOutlineMail },
  { label: 'Socials', path: '/admin/socials', icon: HiOutlineGlobe },
  { label: 'Navigation', path: '/admin/navigation', icon: HiOutlineNavigation },
  { label: 'Settings', path: '/admin/settings', icon: HiOutlineCog },
];

export function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
      isActive
        ? 'bg-[#e63946] text-white'
        : 'text-[#a0a0a0] hover:text-white hover:bg-[#1a1a1a]'
    }`;

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#141414] border-r border-[#1a1a1a] flex flex-col transform transition-transform lg:transform-none ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex items-center justify-between p-4 border-b border-[#1a1a1a]">
          <a href="/" target="_blank" className="hover:opacity-80">
            <img src="/logo_white.png" alt="IZZAMUZZIC" className="h-8" />
          </a>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white">
            <HiOutlineX className="text-xl" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={linkClass}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon className="text-lg" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-[#1a1a1a]">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-[#a0a0a0] hover:text-white hover:bg-[#1a1a1a] transition-colors w-full"
          >
            <HiOutlineLogout className="text-lg" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="bg-[#141414] border-b border-[#1a1a1a] px-6 py-4 flex items-center lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="text-white text-xl mr-4">
            <HiMenu />
          </button>
          <span className="text-white font-medium">Admin Panel</span>
        </header>
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
