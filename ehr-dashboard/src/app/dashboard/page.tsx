'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/lib/api';
import type { AdminStats, Appointment, MedicalRecord, AuthUser } from '@/types';

dayjs.extend(relativeTime);

type LoadingState = 'idle' | 'loading' | 'loaded' | 'error';

export default function DashboardPage() {
  const { user, token } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [status, setStatus] = useState<LoadingState>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !user) return;

    const fetchData = async () => {
      setStatus('loading');
      setError(null);

      const headers = { Authorization: `Bearer ${token}` };

      try {
        const [appointmentsRes, recordsRes, statsRes] = await Promise.allSettled([
          apiClient<Appointment[]>('/appointments', { headers }),
          apiClient<MedicalRecord[]>('/records', { headers }),
          user.role === 'admin'
            ? apiClient<AdminStats>('/users/admin/stats', { headers })
            : Promise.resolve(null),
        ]);

        if (appointmentsRes.status === 'fulfilled') {
          setAppointments(appointmentsRes.value);
        } else {
          setError(appointmentsRes.reason?.message || 'Unable to load appointments');
        }

        if (recordsRes.status === 'fulfilled') {
          setRecords(recordsRes.value);
        }

        if (statsRes.status === 'fulfilled') {
          setStats(statsRes.value);
        }

        setStatus('loaded');
      } catch (err) {
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Unable to load dashboard');
      }
    };

    void fetchData();
  }, [token, user]);

  const upcoming = useMemo(() => {
    return appointments
      .filter((item) => dayjs(item.scheduledAt).isAfter(dayjs()))
      .sort((a, b) => dayjs(a.scheduledAt).valueOf() - dayjs(b.scheduledAt).valueOf())
      .slice(0, 5);
  }, [appointments]);

  const recentRecords = records.slice(0, 5);

  const summaryCards = [
    {
      label: user?.role === 'doctor' ? 'Scheduled visits' : 'Upcoming appointments',
      value: appointments.filter((item) => dayjs(item.scheduledAt).isAfter(dayjs())).length,
    },
    {
      label: 'Medical records',
      value: records.length,
    },
  ];

  if (user?.role === 'admin' && stats) {
    summaryCards.push(
      { label: 'Registered patients', value: stats.patientCount },
      { label: 'Active physicians', value: stats.doctorCount }
    );
  }

  return (
    <div className="space-y-6">
      <section className="card-grid">
        {summaryCards.map((item) => (
          <Card key={item.label} className="shadow-md">
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{item.value}</p>
          </Card>
        ))}
      </section>

      {status === 'error' && error && (
        <Card className="border-rose-200 bg-rose-50 text-rose-700">
          <p>{error}</p>
        </Card>
      )}

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card
          title="Upcoming appointments"
          action={
            <Link href="/dashboard/appointments" className="text-sm font-medium text-sky-600">
              View all
            </Link>
          }
        >
          <div className="space-y-4">
            {upcoming.length === 0 && (
              <p className="text-sm text-slate-500">No upcoming visits scheduled.</p>
            )}
            {upcoming.map((appointment) => (
              <div
                key={appointment._id}
                className="flex items-start justify-between gap-4 rounded-lg border border-slate-100 bg-slate-50/60 p-4"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {user?.role === 'patient'
                      ? resolveName(appointment.doctor)
                      : resolveName(appointment.patient)}
                  </p>
                  <p className="text-sm text-slate-500">
                    {dayjs(appointment.scheduledAt).format('MMMM D, YYYY • h:mm A')}
                  </p>
                  {appointment.reason && (
                    <p className="mt-2 text-sm text-slate-600">Reason: {appointment.reason}</p>
                  )}
                </div>
                <Badge variant={getStatusVariant(appointment.status)} className="self-center capitalize">
                  {appointment.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Recent records">
          <div className="space-y-3">
            {recentRecords.length === 0 && (
              <p className="text-sm text-slate-500">No medical records recorded yet.</p>
            )}
            {recentRecords.map((record) => (
              <div
                key={record._id}
                className="rounded-lg border border-slate-100 bg-white p-4 shadow-sm"
              >
                <p className="text-sm font-semibold text-slate-800">{record.title}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {dayjs(record.recordedAt || record.createdAt).format('MMM D, YYYY')} · Dr.{' '}
                  {resolveName(record.doctor)}
                </p>
                {record.description && (
                  <p className="mt-2 text-sm text-slate-600">{record.description}</p>
                )}
              </div>
            ))}
          </div>
        </Card>
      </section>

      {user?.role === 'admin' && stats && (
        <Card title="Latest activity">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Record</th>
                  <th>Patient</th>
                  <th>Physician</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.latestRecords.map((record) => (
                  <tr key={record._id}>
                    <td className="font-medium text-slate-700">{record.title}</td>
                    <td>{resolveName(record.patient)}</td>
                    <td>{resolveName(record.doctor)}</td>
                    <td>{dayjs(record.recordedAt || record.createdAt).format('MMM D, YYYY')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

function getStatusVariant(status: Appointment['status']) {
  switch (status) {
    case 'confirmed':
      return 'success';
    case 'completed':
      return 'default';
    case 'cancelled':
      return 'danger';
    default:
      return 'warning';
  }
}

function resolveName(entity?: AuthUser | null) {
  return entity?.name ?? '—';
}
