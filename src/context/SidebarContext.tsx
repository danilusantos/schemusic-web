import { createContext, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

interface SidebarContextType {
  isExpanded: boolean;
  isHovered: boolean;
  isMobileOpen: boolean;
  toggleSidebar: () => void;
  toggleMobileSidebar: () => void;
  closeMobileSidebar: () => void;
  setIsHovered: (value: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider = ({ children }: { children: ReactNode }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const value = useMemo<SidebarContextType>(() => ({
    isExpanded,
    isHovered,
    isMobileOpen,
    toggleSidebar: () => {
      setIsExpanded((current) => !current);
    },
    toggleMobileSidebar: () => {
      setIsMobileOpen((current) => !current);
    },
    closeMobileSidebar: () => {
      setIsMobileOpen(false);
    },
    setIsHovered,
  }), [isExpanded, isHovered, isMobileOpen]);

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within SidebarProvider');
  }
  return context;
};
