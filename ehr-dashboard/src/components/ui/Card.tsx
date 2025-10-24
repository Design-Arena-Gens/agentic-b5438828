import clsx from 'clsx';
import React from 'react';

interface CardProps {
  title?: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export function Card({ title, action, className, children }: CardProps) {
  return (
    <div className={clsx('rounded-xl border border-sky-100 bg-white p-6 shadow-sm', className)}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between">
          {title && <h3 className="text-base font-semibold text-slate-800">{title}</h3>}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

