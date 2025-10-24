export type Role = 'patient' | 'doctor' | 'admin';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  address?: string;
  gender?: string;
  dateOfBirth?: string;
  specialization?: string;
  bio?: string;
  medicalHistory?: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface Appointment {
  _id: string;
  patient: AuthUser | null;
  doctor: AuthUser | null;
  scheduledAt: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  reason?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MedicalRecord {
  _id: string;
  patient: AuthUser | null;
  doctor: AuthUser | null;
  title: string;
  description?: string;
  recordedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminStats {
  patientCount: number;
  doctorCount: number;
  upcomingAppointments: number;
  latestRecords: MedicalRecord[];
}
