/* Shared helpers for the To-Do module (dates are local: YYYY-MM-DD / HH:MM) */

export function ymd(d: Date): string {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

export function parseYmd(s: string): Date {
  const p = s.split('-');
  return new Date(+p[0], +p[1] - 1, +p[2]);
}

export function dayDiff(dateStr: string): number {
  const t = new Date(); t.setHours(0, 0, 0, 0);
  return Math.round((parseYmd(dateStr).getTime() - t.getTime()) / 86400000);
}

export function time12(t: string | null): string {
  if (!t) { return ''; }
  const [h, m] = t.split(':').map(Number);
  const ap = h >= 12 ? 'PM' : 'AM';
  const hh = h % 12 || 12;
  return hh + ':' + String(m).padStart(2, '0') + ' ' + ap;
}

/* true when an open task is past its due date/time */
export function isOverdue(item: any): boolean {
  if (!item || item.is_completed == 1 || !item.due_date) { return false; }
  const diff = dayDiff(item.due_date);
  if (diff < 0) { return true; }
  if (diff === 0 && item.due_time) {
    const [h, m] = item.due_time.split(':').map(Number);
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes() > h * 60 + m;
  }
  return false;
}

/* "Today, 2:30 PM" · "Tomorrow" · "Overdue · 3 days" · "Mon, 9 Nov" */
export function dueLabel(item: any): string {
  if (!item || !item.due_date) { return 'No date'; }
  const diff = dayDiff(item.due_date);
  const t = item.due_time ? ', ' + time12(item.due_time) : '';
  if (item.is_completed != 1 && diff < 0) {
    const n = Math.abs(diff);
    return 'Overdue · ' + (n === 1 ? 'yesterday' : n + ' days');
  }
  if (diff === 0) { return 'Today' + t; }
  if (diff === 1) { return 'Tomorrow' + t; }
  if (diff === -1) { return 'Yesterday' + t; }
  const d = parseYmd(item.due_date);
  const sameYear = d.getFullYear() === new Date().getFullYear();
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: sameYear ? undefined : 'numeric' }) + t;
}

export const REMINDER_OPTIONS = [
  { value: '', label: 'No reminder' },
  { value: '0', label: 'At due time' },
  { value: '5', label: '5 minutes before' },
  { value: '15', label: '15 minutes before' },
  { value: '30', label: '30 minutes before' },
  { value: '60', label: '1 hour before' },
  { value: '120', label: '2 hours before' },
  { value: '1440', label: '1 day before' },
  { value: '2880', label: '2 days before' },
  { value: '10080', label: '1 week before' },
];

export const REPEAT_OPTIONS = [
  { value: 'none', label: 'Does not repeat' },
  { value: 'daily', label: 'Every day' },
  { value: 'weekly', label: 'Every week' },
  { value: 'monthly', label: 'Every month' },
  { value: 'yearly', label: 'Every year' },
];

export const PRIORITIES = [
  { value: 3, label: 'High', cls: 'high' },
  { value: 2, label: 'Medium', cls: 'medium' },
  { value: 1, label: 'Low', cls: 'low' },
];

export const DEFAULT_CATEGORIES = ['Client follow-up', 'Payment', 'Billing', 'Meeting', 'AMC / Renewal', 'Personal'];

/* minutes from now until tomorrow 10:00 AM */
export function minutesToTomorrow10(): number {
  const now = new Date();
  const t = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 10, 0, 0);
  return Math.max(1, Math.round((t.getTime() - now.getTime()) / 60000));
}
