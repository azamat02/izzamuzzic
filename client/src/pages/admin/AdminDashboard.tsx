import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Link } from 'react-router-dom';
import {
  HiOutlineMusicNote, HiOutlinePhotograph, HiOutlineShoppingBag,
  HiOutlineCalendar, HiOutlineNewspaper, HiOutlineMail, HiOutlineGlobe,
} from 'react-icons/hi';

export function AdminDashboard() {
  const { data: releases } = useQuery({ queryKey: ['releases'], queryFn: () => api.get<any[]>('/releases') });
  const { data: gallery } = useQuery({ queryKey: ['gallery'], queryFn: () => api.get<any[]>('/gallery') });
  const { data: merch } = useQuery({ queryKey: ['merch'], queryFn: () => api.get<any[]>('/merch') });
  const { data: tours } = useQuery({ queryKey: ['tours'], queryFn: () => api.get<any[]>('/tours') });
  const { data: press } = useQuery({ queryKey: ['press'], queryFn: () => api.get<any[]>('/press') });
  const { data: contacts } = useQuery({ queryKey: ['contact-categories'], queryFn: () => api.get<any[]>('/contact-categories') });
  const { data: socials } = useQuery({ queryKey: ['socials'], queryFn: () => api.get<any[]>('/socials') });

  const stats = [
    { label: 'Releases', count: releases?.length ?? 0, icon: HiOutlineMusicNote, path: '/admin/releases', color: 'bg-purple-500/10 text-purple-400' },
    { label: 'Gallery Photos', count: gallery?.length ?? 0, icon: HiOutlinePhotograph, path: '/admin/gallery', color: 'bg-blue-500/10 text-blue-400' },
    { label: 'Merch Items', count: merch?.length ?? 0, icon: HiOutlineShoppingBag, path: '/admin/merch', color: 'bg-green-500/10 text-green-400' },
    { label: 'Tour Dates', count: tours?.length ?? 0, icon: HiOutlineCalendar, path: '/admin/tours', color: 'bg-yellow-500/10 text-yellow-400' },
    { label: 'Press Quotes', count: press?.length ?? 0, icon: HiOutlineNewspaper, path: '/admin/press', color: 'bg-pink-500/10 text-pink-400' },
    { label: 'Contact Categories', count: contacts?.length ?? 0, icon: HiOutlineMail, path: '/admin/contact', color: 'bg-orange-500/10 text-orange-400' },
    { label: 'Social Links', count: socials?.length ?? 0, icon: HiOutlineGlobe, path: '/admin/socials', color: 'bg-cyan-500/10 text-cyan-400' },
  ];

  return (
    <div>
      <h1 className="text-3xl text-white mb-8" style={{ fontFamily: 'var(--font-heading)' }}>DASHBOARD</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            to={stat.path}
            className="bg-[#141414] border border-[#1a1a1a] rounded-lg p-5 hover:border-[#e63946]/30 transition-colors"
          >
            <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className="text-xl" />
            </div>
            <p className="text-3xl text-white font-bold" style={{ fontFamily: 'var(--font-heading)' }}>{stat.count}</p>
            <p className="text-[#a0a0a0] text-sm">{stat.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
