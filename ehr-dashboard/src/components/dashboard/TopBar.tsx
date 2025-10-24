'use client';

import { useAuth } from '@/context/AuthContext';
import dayjs from 'dayjs';

export function TopBar() {
  const { user } = useAuth();

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-800">Dashboard</h1>
        <p className="text-sm text-slate-500">{dayjs().format('dddd, MMMM D, YYYY')}</p>
      </div>
      {user && (
        <div className="text-right text-sm text-slate-600">
          <p className="font-medium text-slate-700">{user.name}</p>
          <p className="capitalize text-sky-600">{user.role}</p>
        </div>
      )}
    </header>
  );
}

