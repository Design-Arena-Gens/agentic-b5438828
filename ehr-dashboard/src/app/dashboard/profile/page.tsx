'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/lib/api';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function ProfilePage() {
  const { user, token, refreshProfile } = useAuth();
  const [form, setForm] = useState({
    name: user?.name ?? '',
    phone: user?.phone ?? '',
    address: user?.address ?? '',
    gender: user?.gender ?? '',
    dateOfBirth: user?.dateOfBirth ? user.dateOfBirth.slice(0, 10) : '',
    medicalHistory: user?.medicalHistory ?? '',
    specialization: user?.specialization ?? '',
    bio: user?.bio ?? '',
  });
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  if (!user || !token) return null;

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('saving');
    setError(null);

    try {
      await apiClient('/users/me', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...form,
          dateOfBirth: form.dateOfBirth || undefined,
          medicalHistory: user.role === 'patient' ? form.medicalHistory : undefined,
          specialization: user.role === 'doctor' ? form.specialization : undefined,
          bio: user.role === 'doctor' ? form.bio : undefined,
        }),
      });
      await refreshProfile();
      setStatus('saved');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update profile');
      setStatus('error');
    }
  };

  return (
    <div className="space-y-6">
      <Card title="Profile" className="shadow">
        <form className="grid grid-cols-1 gap-6 md:grid-cols-2" onSubmit={handleSubmit}>
          <Input
            id="name"
            label="Full name"
            value={form.name}
            onChange={(event) => handleChange('name', event.target.value)}
            required
          />
          <Input
            id="email"
            label="Email"
            value={user.email}
            disabled
          />
          <Input
            id="phone"
            label="Phone"
            value={form.phone}
            onChange={(event) => handleChange('phone', event.target.value)}
          />
          <Input
            id="address"
            label="Address"
            value={form.address}
            onChange={(event) => handleChange('address', event.target.value)}
          />
          <Input
            id="gender"
            label="Gender"
            value={form.gender}
            onChange={(event) => handleChange('gender', event.target.value)}
          />
          <Input
            id="dob"
            label="Date of birth"
            type="date"
            value={form.dateOfBirth}
            onChange={(event) => handleChange('dateOfBirth', event.target.value)}
          />

          {user.role === 'patient' && (
            <Textarea
              id="medicalHistory"
              label="Medical history"
              className="md:col-span-2"
              value={form.medicalHistory}
              onChange={(event) => handleChange('medicalHistory', event.target.value)}
            />
          )}

          {user.role === 'doctor' && (
            <>
              <Input
                id="specialization"
                label="Specialization"
                value={form.specialization}
                onChange={(event) => handleChange('specialization', event.target.value)}
              />
              <Textarea
                id="bio"
                label="Professional bio"
                className="md:col-span-2"
                value={form.bio}
                onChange={(event) => handleChange('bio', event.target.value)}
              />
            </>
          )}

          {error && <p className="md:col-span-2 text-sm text-rose-600">{error}</p>}
          {status === 'saved' && (
            <p className="md:col-span-2 text-sm text-emerald-600">Profile updated successfully.</p>
          )}

          <div className="md:col-span-2 flex justify-end">
            <Button type="submit" disabled={status === 'saving'}>
              {status === 'saving' ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

