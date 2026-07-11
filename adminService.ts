import { API_BASE_URL, absoluteUrl } from '../config/api';
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

export interface AdmissionInput {
  name: string;
  email?: string;
  phone?: string;
  password?: string;
  guardian_name?: string;
  class_id?: string;
  section_id?: string;
  code?: string;
  // Orphan-specific fields - only collected when the school is an orphanage
  // (user.is_orphan). Mirrors the fields in updateOrphanProfile() so the
  // admin isn't forced to admit first and edit the profile separately.
  orphan_id_number?: string;
  guardian_relation?: string;
  guardian_phone?: string;
  health_status?: string;
  special_needs?: string;
  admission_reason?: string;
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
    // Surface Laravel validation errors nicely (422 responses put them under `errors`).
    const firstError =
      data?.errors && typeof data.errors === 'object'
        ? (Object.values(data.errors)[0] as string[])?.[0]
        : null;
    throw new Error(firstError ?? data?.message ?? `Request failed (${response.status})`);
  }

  return data;
}

/**
 * POST /admin_children_list - all children in the admin's school.
 * There's no separate "orphans only" endpoint: an admin's school is either
 * entirely regular or entirely an orphanage (school-level, not per-child),
 * so this single list already is the right one for orphanage admins.
 *
 * Photos are absolutized here so the list avatars actually load.
 */
export async function fetchStudents(token: string, search: string = ''): Promise<StudentSummary[]> {
  const data = await authedPost('/admin_children_list', token, { search });
  const children: StudentSummary[] = data.children ?? [];
  return children.map((c) => ({ ...c, photo: absoluteUrl(c.photo) }));
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

/**
 * Client-side duplicate guard for the admission form. There's no dedicated
 * "check duplicate" endpoint, so this reuses /admin_children_list (the same
 * list StudentListScreen shows) and matches on name, case/whitespace-insensitive.
 * Returns any existing students that look like the same person so the admin
 * can be warned before a duplicate record is created.
 */
export async function findPossibleDuplicates(
  token: string,
  name: string,
): Promise<StudentSummary[]> {
  const target = name.trim().toLowerCase();
  if (!target) return [];
  const results = await fetchStudents(token, name.trim());
  return results.filter((s) => s.name.trim().toLowerCase() === target);
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
  const data = await authedPost(
    '/admin_section_list',
    token,
    classId ? { class_id: classId } : {},
  );
  return (data.sections ?? data.data ?? data ?? []) as SectionOption[];
}
