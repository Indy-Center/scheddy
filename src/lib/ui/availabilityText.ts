import type { DayAvailability, Time } from '$lib/availability';

const hhmm = (t: Time) => `${String(t.hour).padStart(2, '0')}:${String(t.minute).padStart(2, '0')}`;

/** A day's availability as words: "09:00–12:00, 18:00–21:00", or "Unavailable". */
export function availabilityText(day: DayAvailability | undefined): string {
	if (!day?.available) return 'Unavailable';
	const ranges = [{ start: day.start, end: day.end }, ...(day.extraRecords ?? [])];
	return ranges.map((r) => `${hhmm(r.start)}–${hhmm(r.end)}`).join(', ');
}
