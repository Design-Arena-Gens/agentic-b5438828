import React from 'react';
import clsx from 'clsx';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
};

export function Button({ className, variant = 'primary', ...props }: ButtonProps) {
  const base =
    'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 disabled:cursor-not-allowed disabled:opacity-60';

  const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
    primary: 'bg-sky-600 text-white hover:bg-sky-700',
    secondary: 'bg-white text-sky-700 ring-1 ring-inset ring-sky-200 hover:bg-sky-50',
    ghost: 'bg-transparent text-sky-600 hover:bg-sky-50',
  };

  return <button className={clsx(base, variants[variant], className)} {...props} />;
}

