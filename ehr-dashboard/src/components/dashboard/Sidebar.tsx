'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { useAuth } from '@/context/AuthContext';
import type { Role } from '@/types';

const NAVIGATION: Record<Role, { label: string; href: string }[]> = {
  patient: [
    { label: 'Overview', href: '/dashboard' },
    { label: 'Profile', href: '/dashboard/profile' },
    { label: 'Appointments', href: '/dashboard/appointments' },
    { label: 'Medical Records', href: '/dashboard/records' },
  ],
  doctor: [
    { label: 'Overview', href: '/dashboard' },
    { label: 'Schedule', href: '/dashboard/appointments' },
    { label: 'Patients', href: '/dashboard/patients' },
    { label: 'Records', href: '/dashboard/records' },
  ],
  admin: [
    { label: 'Overview', href: '/dashboard' },
    { label: 'Users', href: '/dashboard/admin/users' },
    { label: 'Appointments', href: '/dashboard/appointments' },
  ],
};

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  if (!user) return null;

  const navItems = NAVIGATION[user.role];

  return (
    <aside className="flex h-full w-64 flex-col bg-gradient-to-b from-sky-900 to-slate-900 text-slate-100">
      <div className="px-6 py-6">
        <h2 className="text-lg font-semibold">Aurora EHR</h2>
        <p className="mt-1 text-xs text-slate-300">Welcome, {user.name}</p>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              'block rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-white/10',
              pathname === item.href ? 'bg-white/15 text-white' : 'text-slate-200'
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="px-3 pb-6">
        <button
          onClick={logout}
          className="w-full rounded-md border border-white/20 px-3 py-2 text-sm font-medium text-slate-100 transition hover:bg-white/10"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}

