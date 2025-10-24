'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace('/dashboard');
    }
  }, [user, isLoading, router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-sky-50 via-white to-blue-100 px-6 py-24 text-center">
      <div className="max-w-xl space-y-8">
        <span className="inline-flex items-center rounded-full bg-white/60 px-3 py-1 text-xs font-medium uppercase tracking-wide text-sky-700 ring-1 ring-inset ring-sky-200">
          Aurora Health Platform
        </span>
        <h1 className="text-4xl font-bold text-slate-900 sm:text-5xl">
          Deliver coordinated care with a modern EHR experience
        </h1>
        <p className="text-lg text-slate-600">
          Securely manage patient profiles, appointments, and medical records with role-based
          dashboards for patients, providers, and administrators.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/login">
            <Button className="min-w-[160px]">Sign in</Button>
          </Link>
          <Link href="/signup">
            <Button variant="secondary" className="min-w-[160px]">
              Create account
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}

