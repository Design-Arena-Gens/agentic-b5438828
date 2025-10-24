'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import type { Role } from '@/types';

export function useRoleAccess(allowedRoles: Role[]) {
  const { user } = useAuth();
  const router = useRouter();
  const signature = allowedRoles.join(',');

  useEffect(() => {
    if (!user) {
      router.replace('/login');
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      router.replace('/dashboard');
    }
  }, [user, allowedRoles, router, signature]);

  return { user };
}

