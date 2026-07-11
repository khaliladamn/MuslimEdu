import { API_BASE_URL } from '../config/api';
import { OrphanProfile } from './authService';

export interface StudentSummary {
  id: number;
  name: string;
  email: string;
  photo: string | null;
  class_id: number | null;
  section_id: number | null;
  orphan_id_number: string | null;
}

async function authedPost(path: string, token: string, body: Record<string, any> = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.message ?? `Request failed (${response.status})`);
  }

  return data;
}

/** Multipart variant - used by admission (photo upload). */
async function authedPostForm(path: string, token: string, form: FormData) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: form,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.message ?? `Request failed (${response.status})`);
  }

  return data;
}

/**
 * POST /admin_children_list - all children in the admin's school.
 * There's no separate "orphans only" endpoint: an admin's school is either
 * entirely regular or entirely an orphanage (school-level, not per-child),
 * so this single list already is the right one for orphanage admins.
 */
export async function fetchStudents(token: string, search: string = ''): Promise<StudentSummary[]> {
  const data = await authedPost('/admin_children_list', token, { search });
  return data.children;
}

export interface OrphanProfileFull extends OrphanProfile {}

/** POST /admin_child_profile - a single child's full profile */
export async function fetchChildProfile(token: string, studentId: number) {
  return authedPost('/admin_child_profile', token, { student_id: studentId });
}

/** POST /admin_child_orphan_profile_update - save orphan-specific fields for a child */
export async function updateOrphanProfile(
  token: string,
  studentId: number,
  fields: Partial<{
    guardian_name: string;
    guardian_relation: string;
    guardian_phone: string;
    health_status: string;
    special_needs: string;
    admission_date: string;
    admission_reason: string;
  }>,
) {
  return authedPost('/admin_child_orphan_profile_update', token, {
    student_id: studentId,
    ...fields,
  });
}

// --- Admission -----------------------------------------------------------

export interface AdmissionPhoto {
  uri: string;
  fileName?: string | null;
  type?: string | null;
}

export interface AdmissionFields {
  name: string;
  email: string;
  password: string;
  gender: string;          // 'male' | 'female'
  birthday: string;        // date string e.g. "2015-04-21"
  phone: string;
  address: string;
  class_id: string;        // numeric id, sent as string in multipart
  section_id: string;      // numeric id, sent as string in multipart
  photo?: AdmissionPhoto | null;
}

/**
 * POST /admin_admission_single - admit one student.
 * Multipart because it optionally carries a `photo` file. Admin-only on the
 * backend (role_id == 2), and it checks the school's student limit + rejects
 * duplicate emails with a 400 (surfaced here as a thrown Error message).
 */
export async function admitSingleStudent(token: string, fields: AdmissionFields) {
  const form = new FormData();
  form.append('name', fields.name);
  form.append('email', fields.email);
  form.append('password', fields.password);
  form.append('gender', fields.gender);
  form.append('birthday', fields.birthday);
  form.append('phone', fields.phone);
  form.append('address', fields.address);
  form.append('class_id', fields.class_id);
  form.append('section_id', fields.section_id);

  if (fields.photo?.uri) {
    // @ts-ignore - React Native's FormData accepts this shape for file uploads
    form.append('photo', {
      uri: fields.photo.uri,
      name: fields.photo.fileName ?? 'admission_photo.jpg',
      type: fields.photo.type ?? 'image/jpeg',
    });
  }

  return authedPostForm('/admin_admission_single', token, form);
}
