import { Navigate } from 'react-router-dom';
import { useNavigationVisibility } from '../hooks/useNavigationVisibility';
import type { ReactNode } from 'react';

interface SectionGuardProps {
  href: string;
  children: ReactNode;
}

export function SectionGuard({ href, children }: SectionGuardProps) {
  const { isSectionVisible, isLoading } = useNavigationVisibility();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isSectionVisible(href)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
