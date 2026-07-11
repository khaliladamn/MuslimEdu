import { API_BASE_URL } from '../config/api';

export interface AdmissionInput {
  name: string;
  email?: string;
  phone?: string;
  guardian_name?: string;
  class_id?: string;
  section_id?: string;
  code?: string;
}

export interface AdmittedStudent {
  id: number;
  name: string;
  email: string | null;
  code: string | null;
}

export interface ClassOption {
  id: number;
  name: string;
}

export interface SectionOption {
  id: number;
  name: string;
}

/**
 * This codebase uses POST for every route, even read-only fetches, and guards
 * everything except /login behind auth:sanctum. So every call here is an
 * authenticated POST with a bearer token - matching orphanService.ts.
 */
async function authedPost(path: string, token: string, body: Record<string, any>) {
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
    // Surface Laravel validation errors nicely (422 responses put them under `errors`).
    const firstError =
      data?.errors && typeof data.errors === 'object'
        ? (Object.values(data.errors)[0] as string[])?.[0]
        : null;
    throw new Error(firstError ?? data?.message ?? `Request failed (${response.status})`);
  }

  return data;
}

/** POST /admin_admission_single - admit one student. */
export async function admitStudent(
  token: string,
  input: AdmissionInput,
): Promise<AdmittedStudent> {
  const data = await authedPost('/admin_admission_single', token, input);
  return (data.student ?? data.data ?? data) as AdmittedStudent;
}

/** POST /admin_class_list - classes for the admission form's Class picker. */
export async function fetchClasses(token: string): Promise<ClassOption[]> {
  const data = await authedPost('/admin_class_list', token, {});
  return (data.classes ?? data.data ?? data ?? []) as ClassOption[];
}

/** POST /admin_section_list - sections, optionally scoped to a class. */
export async function fetchSections(
  token: string,
  classId?: string,
): Promise<SectionOption[]> {
  const data = await authedPost('/admin_section_list', token, classId ? { class_id: classId } : {});
  return (data.sections ?? data.data ?? data ?? []) as SectionOption[];
}
