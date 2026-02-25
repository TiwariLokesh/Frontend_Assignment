import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { cn } from '../../utils/cn';

type ButtonVariant = 'primary' | 'secondary' | 'destructive';

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    fullWidth?: boolean;
  }
>;

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'border border-blue-500 bg-blue-500 text-white hover:bg-blue-600 hover:border-blue-600 focus-visible:ring-blue-400',
  secondary:
    'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus-visible:ring-slate-400 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800',
  destructive:
    'border border-red-500 bg-red-500 text-white hover:bg-red-600 hover:border-red-600 focus-visible:ring-red-400',
};

function Button({ children, className, variant = 'secondary', fullWidth, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-lg px-3.5 py-2 text-sm font-semibold tracking-wide transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950',
        'disabled:cursor-not-allowed disabled:opacity-60',
        fullWidth && 'w-full',
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
