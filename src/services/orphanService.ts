import { API_BASE_URL } from '../config/api';

export interface ReportPhoto {
  url: string;
}

export interface MonthlyReport {
  id: number;
  report_month: string; // "2026-07-01"
  note: string | null;
  academic_rating: number | null;
  wellbeing_rating: number | null;
  submitted_by: string | null;
  photos: string[];
}

export interface ReportStatus {
  submitted_this_month: boolean;
  current_report: MonthlyReport | null;
  history: MonthlyReport[];
}

export interface PickedPhoto {
  uri: string;
  fileName?: string | null;
  type?: string | null;
}

async function authedPost(path: string, token: string, body: FormData | Record<string, any>) {
  const isFormData = body instanceof FormData;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      Authorization: `Bearer ${token}`,
    },
    body: isFormData ? body : JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.message ?? `Request failed (${response.status})`);
  }

  return data;
}

/** POST /orphan_report_status - current month status + full history */
export async function fetchReportStatus(token: string): Promise<ReportStatus> {
  return authedPost('/orphan_report_status', token, {});
}

/**
 * POST /orphan_report_submit - submit this month's report.
 * Always sent as multipart/form-data so photos (0 or more) attach the same
 * way the backend's `$request->hasFile('photos')` check expects.
 */
export async function submitReport(
  token: string,
  fields: { note: string; academic_rating: number; wellbeing_rating: number },
  photos: PickedPhoto[] = [],
): Promise<{ message: string; report: MonthlyReport }> {
  const form = new FormData();
  form.append('note', fields.note);
  form.append('academic_rating', String(fields.academic_rating));
  form.append('wellbeing_rating', String(fields.wellbeing_rating));

  photos.forEach((photo, index) => {
    // @ts-ignore - React Native's FormData accepts this shape for file uploads
    form.append('photos[]', {
      uri: photo.uri,
      name: photo.fileName ?? `photo_${index}.jpg`,
      type: photo.type ?? 'image/jpeg',
    });
  });

  return authedPost('/orphan_report_submit', token, form);
}
