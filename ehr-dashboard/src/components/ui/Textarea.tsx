import React from 'react';
import clsx from 'clsx';

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  hint?: string;
};

export function Textarea({ id, label, hint, className, ...props }: TextareaProps) {
  return (
    <label className="flex w-full flex-col gap-1 text-sm">
      {label && <span className="font-medium text-slate-700">{label}</span>}
      <textarea
        id={id}
        className={clsx(
          'w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm transition focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200',
          className
        )}
        rows={props.rows ?? 4}
        {...props}
      />
      {hint && <span className="text-xs text-slate-500">{hint}</span>}
    </label>
  );
}
