import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { MoreDotIcon } from '../../icons';

export type ContextMenuItem = {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  tone?: 'default' | 'danger';
};

interface AdminCardContextMenuProps {
  items: ContextMenuItem[];
  hideWhenAllDisabled?: boolean;
}

export const AdminCardContextMenu = ({ items, hideWhenAllDisabled = false }: AdminCardContextMenuProps) => {
  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const containerRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const hasEnabledItem = items.some((item) => !item.disabled);

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

  useEffect(() => {
    if (open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.right - 256 + window.scrollX,
      });
    }
  }, [open]);

  if (hideWhenAllDisabled && !hasEnabledItem) {
    return null;
  }

  return (
    <div ref={containerRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white text-warm-700 transition hover:bg-warm-50"
        aria-label="Acoes"
      >
        <MoreDotIcon className="h-5 w-5" />
      </button>

      {open && (
        <div 
          className="fixed z-50 w-64 rounded-2xl border border-gray-200 bg-white p-2 shadow-xl shadow-gray-300/50"
          style={{ top: `${menuPosition.top}px`, left: `${menuPosition.left}px` }}
        >
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              disabled={item.disabled}
              className={[
                'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold transition',
                item.tone === 'danger' ? 'text-red-700 hover:bg-red-50' : 'text-warm-800 hover:bg-warm-50',
                item.disabled ? 'cursor-not-allowed opacity-50 hover:bg-transparent' : '',
              ].join(' ')}
              onClick={() => {
                if (item.disabled) {
                  return;
                }
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
