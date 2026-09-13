import React from 'react';
import { Home, Radio, Users, Search, Library } from 'lucide-react';

export type NavTab = 'home' | 'eras' | 'artists' | 'search' | 'library';

interface NavigationProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'eras', label: 'Decades', icon: Radio },
    { id: 'artists', label: 'Singers', icon: Users },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'library', label: 'Library', icon: Library },
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 glass-panel border-t border-retro-gold/15 px-2 py-2 flex items-center justify-around">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              isActive
                ? 'text-retro-gold scale-105 font-bold'
                : 'text-retro-muted hover:text-retro-cream font-medium'
            }`}
          >
            <div className={`relative p-1 ${isActive ? 'text-retro-gold' : ''}`}>
              <Icon className="w-5 h-5" />
              {isActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-retro-gold shadow-sm shadow-retro-gold"></span>
              )}
            </div>
            <span className="text-[11px] tracking-tight mt-0.5">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
