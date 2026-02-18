import { usePublicData } from './useApi';

interface NavigationItem {
  id: number;
  label: string;
  href: string;
  visible: boolean;
  sortOrder: number;
}

export function useNavigationVisibility() {
  const { data: navItems, isLoading } = usePublicData<NavigationItem[]>('navigation', '/navigation');

  const isSectionVisible = (href: string) => {
    if (!navItems) return false;
    const item = navItems.find(n => n.href === href);
    return item?.visible ?? false;
  };

  return { isSectionVisible, isLoading };
}
