'use client';

import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/lib/api';
import type { Appointment, AuthUser } from '@/types';

interface DoctorItem {
  id: string;
  name: string;
  email: string;
  specialization?: string;
  bio?: string;
}

const STATUS_OPTIONS: Appointment['status'][] = ['pending', 'confirmed', 'completed', 'cancelled'];

export default function AppointmentsPage() {
  const { user, token } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<DoctorItem[]>([]);
  const [form, setForm] = useState({ doctorId: '', scheduledAt: '', reason: '' });
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'submitting'>('idle');

  useEffect(() => {
    if (!token) return;

    const headers = { Authorization: `Bearer ${token}` };

    void (async () => {
      try {
        const doctorPromise: Promise<DoctorItem[]> =
          user?.role === 'patient'
            ? apiClient<DoctorItem[]>('/users/doctors', { headers })
            : Promise.resolve([]);

        const [appointmentRes, doctorRes] = await Promise.all([
          apiClient<Appointment[]>('/appointments', { headers }),
          doctorPromise,
        ]);
        setAppointments(appointmentRes);
        if (Array.isArray(doctorRes)) {
          setDoctors(doctorRes);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load appointments');
      }
    })();
  }, [token, user?.role]);

  if (!user || !token) return null;

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.doctorId || !form.scheduledAt) return;
    setStatus('submitting');
    setError(null);

    try {
      const appointment = await apiClient<Appointment>('/appointments', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          doctorId: form.doctorId,
          scheduledAt: form.scheduledAt,
          reason: form.reason,
        }),
      });
      setAppointments((prev) => [...prev, appointment]);
      setForm({ doctorId: '', scheduledAt: '', reason: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create appointment');
    } finally {
      setStatus('idle');
    }
  };

  const handleStatusChange = async (appointmentId: string, statusValue: Appointment['status']) => {
    try {
      const updated = await apiClient<Appointment>(`/appointments/${appointmentId}/status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: statusValue }),
      });
      setAppointments((prev) => prev.map((appt) => (appt._id === appointmentId ? updated : appt)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update appointment');
    }
  };

  return (
    <div className="space-y-6">
      {user.role === 'patient' && (
        <Card title="Book appointment" className="shadow">
          <form className="grid grid-cols-1 gap-4 md:grid-cols-3" onSubmit={handleCreate}>
            <label className="flex flex-col gap-1 text-sm md:col-span-1">
              <span className="font-medium text-slate-700">Physician</span>
              <select
                className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                value={form.doctorId}
                onChange={(event) => handleChange('doctorId', event.target.value)}
                required
              >
                <option value="">Select a physician</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name} {doctor.specialization ? `• ${doctor.specialization}` : ''}
                  </option>
                ))}
              </select>
            </label>
            <Input
              id="date"
              label="Date & time"
              type="datetime-local"
              value={form.scheduledAt}
              onChange={(event) => handleChange('scheduledAt', event.target.value)}
              required
            />
            <Textarea
              id="reason"
              label="Reason"
              value={form.reason}
              onChange={(event) => handleChange('reason', event.target.value)}
              className="md:col-span-1"
            />
            <div className="md:col-span-3 flex justify-end gap-3">
              {error && <p className="self-center text-sm text-rose-600">{error}</p>}
              <Button type="submit" disabled={status === 'submitting'}>
                {status === 'submitting' ? 'Booking…' : 'Book appointment'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card title="Appointments" className="shadow">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Physician</th>
                <th>Date</th>
                <th>Status</th>
                <th>Reason</th>
                {user.role !== 'patient' && <th className="text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment._id}>
                  <td>{formatPerson(appointment.patient)}</td>
                  <td>{formatPerson(appointment.doctor)}</td>
                  <td>{dayjs(appointment.scheduledAt).format('MMM D, YYYY h:mm A')}</td>
                  <td>
                    <Badge variant={getStatusVariant(appointment.status)} className="capitalize">
                      {appointment.status}
                    </Badge>
                  </td>
                  <td className="max-w-xs text-sm text-slate-600">
                    {appointment.reason || '—'}
                  </td>
                  {user.role !== 'patient' && (
                    <td className="text-right">
                      <div className="flex justify-end gap-2">
                        {STATUS_OPTIONS.map((option) => (
                          <Button
                            key={option}
                            type="button"
                            variant={appointment.status === option ? 'primary' : 'ghost'}
                            className="px-3 py-1 text-xs"
                            onClick={() => handleStatusChange(appointment._id, option)}
                          >
                            {option}
                          </Button>
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function formatPerson(person?: AuthUser | null) {
  return person?.name ?? '—';
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
