'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { useAuth } from '@/context/AuthContext';
import type { Role } from '@/types';

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: 'patient', label: 'Patient' },
  { value: 'doctor', label: 'Physician' },
];

export default function SignupPage() {
  const { signup } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'patient' as Role,
    phone: '',
    address: '',
    gender: '',
    dateOfBirth: '',
    specialization: '',
    bio: '',
    medicalHistory: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (
    field: keyof typeof form,
    value: string
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await signup({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        phone: form.phone,
        address: form.address,
        gender: form.gender,
        dateOfBirth: form.dateOfBirth,
        specialization: form.role === 'doctor' ? form.specialization : undefined,
        bio: form.role === 'doctor' ? form.bio : undefined,
        medicalHistory: form.role === 'patient' ? form.medicalHistory : undefined,
      });
      router.replace('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create account');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 to-blue-100 px-6 py-16">
      <div className="w-full max-w-3xl rounded-2xl bg-white p-10 shadow-xl">
        <div className="flex flex-col gap-2 text-center">
          <h2 className="text-2xl font-semibold text-slate-800">Create your secure EHR account</h2>
          <p className="text-sm text-slate-500">
            Patients can manage their health data. Physicians gain full visibility on schedules and patient records.
          </p>
        </div>

        <form className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2" onSubmit={handleSubmit}>
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
            type="email"
            value={form.email}
            onChange={(event) => handleChange('email', event.target.value)}
            required
          />
          <Input
            id="password"
            label="Password"
            type="password"
            value={form.password}
            onChange={(event) => handleChange('password', event.target.value)}
            required
          />
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-slate-700">Role</span>
            <select
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
              value={form.role}
              onChange={(event) => handleChange('role', event.target.value as Role)}
            >
              {ROLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
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
            id="dateOfBirth"
            label="Date of birth"
            type="date"
            value={form.dateOfBirth}
            onChange={(event) => handleChange('dateOfBirth', event.target.value)}
          />

          {form.role === 'doctor' && (
            <>
              <Input
                id="specialization"
                label="Specialization"
                value={form.specialization}
                onChange={(event) => handleChange('specialization', event.target.value)}
                required
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

          {form.role === 'patient' && (
            <Textarea
              id="medicalHistory"
              label="Medical history"
              className="md:col-span-2"
              value={form.medicalHistory}
              onChange={(event) => handleChange('medicalHistory', event.target.value)}
            />
          )}

          {error && (
            <p className="md:col-span-2 text-sm text-rose-600">{error}</p>
          )}

          <div className="md:col-span-2 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <Button type="submit" className="w-full md:w-auto" disabled={submitting}>
              {submitting ? 'Creating account…' : 'Create account'}
            </Button>
            <p className="text-sm text-slate-500">
              Already registered?{' '}
              <Link href="/login" className="font-medium text-sky-600 hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

