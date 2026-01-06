import { SocialLinks } from '../ui/SocialLinks';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#141414] py-12 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6">
          {/* Logo */}
          <a href="#" className="hover:opacity-80 transition-opacity">
            <img src="/logo_white.png" alt="IZZAMUZZIC" className="h-10" />
          </a>

          {/* Social Links */}
          <SocialLinks size="lg" />

          {/* Label Logo */}
          <div className="flex items-center gap-2 mt-4">
            <img src="/topspot.png" alt="TopSpot" className="h-6" />
          </div>

          {/* Copyright */}
          <p className="text-[#a0a0a0] text-sm">
            &copy; {currentYear} IZZAMUZZIC. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
