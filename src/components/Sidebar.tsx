import React from 'react';
import {
  BarChart3,
  ChefHat,
  Flame,
  FolderKanban,
  LayoutDashboard,
  PlusCircle,
  Receipt,
  Settings,
  UtensilsCrossed,
  X,
} from 'lucide-react';
import { NavSection } from '../types';

interface SidebarProps {
  activeSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  cartCount: number;
  activeKitchenCount: number;
  restaurantName: string;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const NAV_ITEMS: {
  id: NavSection;
  label: string;
  icon: React.FC<{ className?: string }>;
}[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'menu', label: 'Food Menu', icon: UtensilsCrossed },
  { id: 'categories', label: 'Categories', icon: FolderKanban },
  { id: 'new-order', label: 'New Order', icon: PlusCircle },
  { id: 'kitchen', label: 'Kitchen Display', icon: ChefHat },
  { id: 'billing', label: 'Billing', icon: Receipt },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  onSelectSection,
  cartCount,
  activeKitchenCount,
  restaurantName,
  mobileOpen,
  onCloseMobile,
}) => {
  const handleSelect = (id: NavSection) => {
    onSelectSection(id);
    onCloseMobile();
  };

  const sidebarContent = (
    <aside className="w-[260px] h-full bg-[#171315] text-[#F5EFE6] flex flex-col border-r border-[#2B2226] select-none">
      {/* Brand Crest */}
      <div className="px-6 py-6 border-b border-[#2B2226] flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6B1525] via-[#5C1422] to-[#3B0B14] border border-[#D4AF37]/40 flex items-center justify-center shrink-0 shadow-sm">
            <Flame className="w-5 h-5 text-[#F59E0B]" />
          </div>
          <div className="min-w-0">
            <p className="font-display text-base font-bold tracking-wide text-[#FAF6F0] truncate">
              {restaurantName}
            </p>
            <p className="text-[11px] text-[#B8A8AC] truncate">Restaurant POS</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 rounded-lg text-[#B8A8AC] hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close navigation menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto" aria-label="Primary Sidebar Navigation">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          const badgeValue =
            item.id === 'new-order'
              ? cartCount
              : item.id === 'kitchen'
                ? activeKitchenCount
                : 0;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelect(item.id)}
              className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 whitespace-nowrap ${
                isActive
                  ? 'bg-gradient-to-r from-[#5C1422] to-[#741A2C] text-white shadow-sm border border-[#D4AF37]/30'
                  : 'text-[#C8B9BD] hover:text-white hover:bg-[#241D20]'
              }`}
            >
              <span className="flex items-center gap-3 min-w-0">
                <Icon
                  className={`w-[18px] h-[18px] shrink-0 transition-colors ${
                    isActive ? 'text-[#F59E0B]' : 'text-[#9F8D92]'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </span>
              {badgeValue > 0 && (
                <span
                  className={`tabular-nums font-mono text-[11px] font-semibold px-2 py-0.5 rounded-md shrink-0 ${
                    isActive
                      ? 'bg-[#EA580C] text-white'
                      : 'bg-[#2B2226] text-[#F59E0B]'
                  }`}
                >
                  {badgeValue}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Quiet Restaurant Service Footer */}
      <div className="px-5 py-4 border-t border-[#2B2226] text-xs text-[#9F8D92]">
        <p className="font-medium text-[#E5DAD1] truncate">Cathedral Road Flagship</p>
        <p className="mt-0.5 tabular-nums">GSTIN 33AABCS1429B1Z5</p>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block shrink-0 h-screen sticky top-0 z-30">
        {sidebarContent}
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-[2px]"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative z-10 h-full">{sidebarContent}</div>
        </div>
      )}
    </>
  );
};
