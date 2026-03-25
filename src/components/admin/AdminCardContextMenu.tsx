import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { MoreDotIcon } from '../../icons';

export type ContextMenuItem = {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
};

interface AdminCardContextMenuProps {
  items: ContextMenuItem[];
}

export const AdminCardContextMenu = ({ items }: AdminCardContextMenuProps) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white text-warm-700 transition hover:bg-warm-50"
        aria-label="Acoes"
      >
        <MoreDotIcon className="h-5 w-5" />
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-30 w-64 rounded-2xl bg-white p-2 shadow-theme-md">
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-warm-800 transition hover:bg-warm-50"
              onClick={() => {
                item.onClick();
                setOpen(false);
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
