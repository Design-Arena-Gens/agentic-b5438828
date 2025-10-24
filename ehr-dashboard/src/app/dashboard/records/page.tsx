'use client';

import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { Card } from '@/components/ui/Card';
import { Textarea } from '@/components/ui/Textarea';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/lib/api';
import type { MedicalRecord, AuthUser } from '@/types';

interface PatientItem {
  id: string;
  name: string;
  email: string;
}

export default function MedicalRecordsPage() {
  const { user, token } = useAuth();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [patients, setPatients] = useState<PatientItem[]>([]);
  const [form, setForm] = useState({ patientId: '', title: '', description: '' });
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'saving'>('idle');

  useEffect(() => {
    if (!token || !user) return;
    const headers = { Authorization: `Bearer ${token}` };

    void (async () => {
      try {
        const patientPromise: Promise<PatientItem[]> =
          user.role !== 'patient'
            ? apiClient<PatientItem[]>('/users/patients', { headers })
            : Promise.resolve([]);

        const [recordRes, patientRes] = await Promise.all([
          apiClient<MedicalRecord[]>('/records', { headers }),
          patientPromise,
        ]);
        setRecords(recordRes);
        if (Array.isArray(patientRes)) {
          setPatients(patientRes);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load records');
      }
    })();
  }, [token, user]);

  if (!user || !token) return null;

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.patientId || !form.title) return;

    setStatus('saving');
    setError(null);

    try {
      const record = await apiClient<MedicalRecord>('/records', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          patientId: form.patientId,
          title: form.title,
          description: form.description,
        }),
      });
      setRecords((prev) => [record, ...prev]);
      setForm({ patientId: '', title: '', description: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save record');
    } finally {
      setStatus('idle');
    }
  };

  return (
    <div className="space-y-6">
      {user.role !== 'patient' && (
        <Card title="Add medical record" className="shadow">
          <form className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-slate-700">Patient</span>
              <select
                className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                value={form.patientId}
                onChange={(event) => handleChange('patientId', event.target.value)}
                required
              >
                <option value="">Select patient</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name}
                  </option>
                ))}
              </select>
            </label>
            <Input
              id="title"
              label="Record title"
              value={form.title}
              onChange={(event) => handleChange('title', event.target.value)}
              required
            />
            <Textarea
              id="description"
              label="Description"
              className="md:col-span-2"
              value={form.description}
              onChange={(event) => handleChange('description', event.target.value)}
            />
            <div className="md:col-span-2 flex items-center justify-between">
              {error && <p className="text-sm text-rose-600">{error}</p>}
              <Button type="submit" disabled={status === 'saving'}>
                {status === 'saving' ? 'Saving…' : 'Save record'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card title="Medical records" className="shadow">
        <div className="space-y-4">
          {records.map((record) => (
            <article
              key={record._id}
              className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-slate-800">{record.title}</h3>
                  <p className="text-xs text-slate-500">
                    {renderName(record.patient)} · Dr. {renderName(record.doctor)}
                  </p>
                </div>
                <span className="text-xs font-medium text-slate-500">
                  {dayjs(record.recordedAt || record.createdAt).format('MMM D, YYYY')}
                </span>
              </div>
              {record.description && (
                <p className="mt-3 text-sm text-slate-600">{record.description}</p>
              )}
            </article>
          ))}
          {records.length === 0 && (
            <p className="text-sm text-slate-500">No records available.</p>
          )}
        </div>
      </Card>
    </div>
  );
}

function renderName(user?: AuthUser | PatientItem | null) {
  return user?.name ?? '—';
}
