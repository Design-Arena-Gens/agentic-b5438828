'use client';

import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/lib/api';
import { useRoleAccess } from '@/hooks/useRoleAccess';

interface PatientItem {
  id: string;
  name: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  medicalHistory?: string;
  address?: string;
  gender?: string;
}

export default function PatientsPage() {
  const { token, user } = useAuth();
  const [patients, setPatients] = useState<PatientItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useRoleAccess(['doctor', 'admin']);

  useEffect(() => {
    if (!token || !user) return;

    void (async () => {
      try {
        const items = await apiClient<PatientItem[]>('/users/patients', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPatients(items);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load patients');
      }
    })();
  }, [token, user]);

  if (!user || user.role === 'patient') return null;

  return (
    <Card title="Patients" className="shadow">
      {error && <p className="mb-4 text-sm text-rose-600">{error}</p>}
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>DOB</th>
              <th>Gender</th>
              <th>Medical history</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient) => (
              <tr key={patient.id}>
                <td>{patient.name}</td>
                <td>{patient.email}</td>
                <td>{patient.phone || '—'}</td>
                <td>{patient.dateOfBirth ? dayjs(patient.dateOfBirth).format('MMM D, YYYY') : '—'}</td>
                <td className="capitalize">{patient.gender || '—'}</td>
                <td className="max-w-sm text-sm text-slate-600">
                  {patient.medicalHistory || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
