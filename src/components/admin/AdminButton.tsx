import type { ButtonHTMLAttributes, ReactElement, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface AdminButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactElement;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
  children: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md',
  secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm',
  danger: 'bg-red-600 text-white hover:bg-red-700 hover:shadow-md',
  success: 'bg-green-600 text-white hover:bg-green-700 hover:shadow-md',
  outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400',
};

const sizeStyles: Record<ButtonSize, { button: string; icon: string }> = {
  sm: { button: 'px-3 py-1.5 text-xs font-semibold', icon: 'h-3 w-3' },
  md: { button: 'px-4 py-2 text-sm font-semibold', icon: 'h-4 w-4' },
  lg: { button: 'px-5 py-2.5 text-base font-semibold', icon: 'h-5 w-5' },
};

export const AdminButton = ({
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  isLoading = false,
  disabled,
  children,
  ...props
}: AdminButtonProps) => {
  const sizeStyle = sizeStyles[size];
  const variantStyle = variantStyles[variant];

  return (
    <button
      type="button"
      disabled={isLoading || disabled}
      className={[
        'inline-flex items-center gap-2 rounded-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed',
        sizeStyle.button,
        variantStyle,
      ].join(' ')}
      {...props}
    >
      {icon && iconPosition === 'left' && (
        <span className={`inline-flex ${sizeStyle.icon}`}>{icon}</span>
      )}
      {children}
      {icon && iconPosition === 'right' && (
        <span className={`inline-flex ${sizeStyle.icon}`}>{icon}</span>
      )}
    </button>
  );
};
