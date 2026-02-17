import { SocialLinks } from '../ui/SocialLinks';
import { usePublicData } from '../../hooks/useApi';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { data: settings } = usePublicData<Record<string, string>>('settings', '/settings');

  return (
    <footer className="bg-[#141414] py-12 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6">
          <a href="#" className="hover:opacity-80 transition-opacity">
            <img src="/logo_white.png" alt="IZZAMUZZIC" className="h-10" />
          </a>
          <SocialLinks size="lg" />
          <div className="flex items-center gap-2 mt-4">
            <img src="/topspot.png" alt="TopSpot" className="h-6" />
          </div>
          <p className="text-[#a0a0a0] text-sm">
            &copy; {currentYear} {settings?.copyrightText || 'IZZAMUZZIC. All rights reserved.'}
          </p>
        </div>
      </div>
    </footer>
  );
}
