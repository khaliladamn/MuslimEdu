import { API_BASE_URL } from '../config/api';
import { OrphanProfile } from './authService';

export interface StudentSummary {
  id: number;
  name: string;
  email: string;
  code: string | null;
}

export interface OrphanStudentSummary extends StudentSummary {
  orphan_profile: OrphanProfile;
}

async function authedGet(path: string, token: string) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data?.message ?? `Request failed (${response.status})`);
  }

  return response.json();
}

/** GET /students - all students in the admin's school */
export async function fetchStudents(token: string): Promise<StudentSummary[]> {
  const data = await authedGet('/students', token);
  return data.students;
}

/** GET /students/orphans - only students with an orphan profile */
export async function fetchOrphanStudents(token: string): Promise<OrphanStudentSummary[]> {
  const data = await authedGet('/students/orphans', token);
  return data.students;
}
