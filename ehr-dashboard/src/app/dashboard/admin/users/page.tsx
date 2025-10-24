'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/lib/api';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import type { AuthUser } from '@/types';

export default function AdminUsersPage() {
  const { token, user } = useAuth();
  const [patients, setPatients] = useState<AuthUser[]>([]);
  const [doctors, setDoctors] = useState<AuthUser[]>([]);
  const [error, setError] = useState<string | null>(null);

  useRoleAccess(['admin']);

  useEffect(() => {
    if (!token || !user) return;

    void (async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [patientRes, doctorRes] = await Promise.all([
          apiClient<AuthUser[]>('/users/patients', { headers }),
          apiClient<AuthUser[]>('/users/doctors', { headers }),
        ]);
        setPatients(patientRes);
        setDoctors(doctorRes);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load user directory');
      }
    })();
  }, [token, user]);

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="space-y-6">
      {error && <Card className="border-rose-200 bg-rose-50 text-rose-700">{error}</Card>}

      <Card title="Physicians" className="shadow">
        <div className="space-y-3">
          {doctors.map((doctor) => (
            <div key={doctor.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{doctor.name}</p>
                  <p className="text-xs text-slate-500">{doctor.email}</p>
                </div>
                <Badge variant="success">{doctor.specialization || 'Specialist'}</Badge>
              </div>
              {doctor.bio && <p className="mt-2 text-sm text-slate-600">{doctor.bio}</p>}
            </div>
          ))}
          {doctors.length === 0 && <p className="text-sm text-slate-500">No physicians available.</p>}
        </div>
      </Card>

      <Card title="Patients" className="shadow">
        <div className="space-y-3">
          {patients.map((patient) => (
            <div key={patient.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{patient.name}</p>
                  <p className="text-xs text-slate-500">{patient.email}</p>
                </div>
                <Badge variant="default">Patient</Badge>
              </div>
              {patient.medicalHistory && (
                <p className="mt-2 text-sm text-slate-600">{patient.medicalHistory}</p>
              )}
            </div>
          ))}
          {patients.length === 0 && <p className="text-sm text-slate-500">No patients registered.</p>}
        </div>
      </Card>
    </div>
  );
}
