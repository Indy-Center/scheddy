<script lang="ts">
	import type { PageData } from './$types';
	import { DateTime, Interval } from 'luxon';
	import { goto } from '$app/navigation';
	import { superForm } from 'sveltekit-superforms';
	import {
		Button,
		Card,
		ConfirmDialog,
		Field,
		Input,
		PageHeader,
		Select,
		toast
	} from '@indy-center/centerline-svelte';
	import { ROLE_STAFF } from '$lib/utils';
	import UserSelector from '$lib/ui/UserSelector.svelte';
	import type { DayAvailability, MentorAvailability, Time } from '$lib/availability';
	import { roleOf } from '$lib';

	interface Props {
		data: PageData;
	}
	let { data }: Props = $props();

	let confirmOpen = $state(false);
	let confirmed = false;

	const form = superForm(data.form, {
		onSubmit({ cancel }) {
			// A session that clashes with the mentor's sessions or availability
			// is allowed, but only after they confirm it.
			if (confirmed) {
				confirmed = false; // The confirmed resubmit: let it go.
				return;
			}
			if (!isMentorAvailable.status) {
				cancel();
				confirmOpen = true;
			}
		},
		async onUpdated({ form }) {
			if (form.valid) {
				await goto(`/dash/cal`);
				toast('success', 'Session created.');
			}
		}
	});
	const { form: formData, errors, enhance, delayed } = form;

	const availableInterval = (
		mentorAvailability: DayAvailability,
		sessionStart: DateTime,
		sessionEnd: DateTime
	) => {
		const intervalHelper = (start: Time, end: Time) => {
			const dayAvailabilityStart = sessionStart.set({
				hour: start.hour,
				minute: start.minute - 1
			});
			const dayAvailabilityEnd = sessionEnd.set({
				hour: end.hour,
				minute: end.minute + 1
			});

			return Interval.fromDateTimes(dayAvailabilityStart, dayAvailabilityEnd);
		};

		const intervals = [intervalHelper(mentorAvailability.start, mentorAvailability.end)];

		if (mentorAvailability.extraRecords) {
			for (const record of mentorAvailability.extraRecords) {
				intervals.push(intervalHelper(record.start, record.end));
			}
		}

		return intervals.some((i) => i.contains(sessionStart) && i.contains(sessionEnd));
	};

	const calculateMentorAvailability = (sessionStart: DateTime, sessiondEnd: DateTime) => {
		const mentor = data.mentorsMap[$formData.mentor];
		if (!mentor || Object.keys(data.typesMap).length === 0) return false;

		const availability: MentorAvailability | null = mentor.availability
			? JSON.parse(mentor.availability as string)
			: null;

		if (!availability) return false;

		if (
			!availability[sessionStart.weekdayLong?.toLowerCase()].available &&
			!availability[sessiondEnd.weekdayLong?.toLowerCase()].available &&
			Object.keys(availability.exceptions).length === 0
		)
			return false;

		const startDayAvailability = availability[
			sessionStart.weekdayLong?.toLowerCase()
		] as DayAvailability;

		const endDayAvailability = availability[
			sessiondEnd.weekdayLong?.toLowerCase()
		] as DayAvailability;

		if (
			availableInterval(startDayAvailability, sessionStart, sessiondEnd) &&
			availableInterval(endDayAvailability, sessionStart, sessiondEnd)
		) {
			return true;
		} else {
			for (const exception in availability.exceptions) {
				if ($formData.date === exception) {
					return availableInterval(availability.exceptions[exception], sessionStart, sessiondEnd);
				}
			}
		}
	};

	const notInAvailability =
		"This session falls outside of this mentor's availability. Are you sure you want to create it?";
	const conflictsWithExistingSession =
		'This session falls during an existing session this mentor has booked. Are you sure you want to create it?';

	const isMentorAvailable = $derived.by(() => {
		// Nothing to check until there's a session type to measure.
		if (!data.typesMap[$formData.type]) {
			return { status: true, message: '' };
		}
		const sessionDate = DateTime.fromISO($formData.date, {
			zone: $formData.timezone
		});

		const start = sessionDate.set({ hour: $formData.hour, minute: $formData.minute });
		const end = start.plus({ minutes: data.typesMap[$formData.type].length });

		for (const session of data.mentorSessions) {
			const sessionStart = DateTime.fromISO(session.start, {
				zone: session.timezone
			});

			const sessionEnd = sessionStart.plus({ minutes: data.typesMap[session.type].length });
			const sessionInterval = Interval.fromDateTimes(sessionStart, sessionEnd);

			if (sessionInterval.contains(start) || sessionInterval.contains(end)) {
				return { status: false, message: conflictsWithExistingSession };
			}
		}

		return { status: calculateMentorAvailability(start, end), message: notInAvailability };
	});

	const pad = (n: number | string) => String(n).padStart(2, '0');
	const nowThere = $derived(
		$formData.timezone
			? DateTime.now().setZone($formData.timezone).toLocaleString(DateTime.TIME_SIMPLE)
			: ''
	);

	const usersMap = Object.fromEntries(
		Object.entries(data.usersMap).map(([key, value]) => [Number(key), value.name])
	);

	const mentorMap = Object.fromEntries(
		Object.entries(data.mentorsMap).map(([key, value]) => [Number(key), value.name])
	);

	function createAnyway() {
		confirmed = true;
		form.submit();
	}
</script>

<PageHeader title="Create a session">Book a session on a student's behalf.</PageHeader>

<Card class="max-w-xl">
	<form method="POST" use:enhance class="flex flex-col gap-5">
		<Field
			label="Time zone"
			hint={nowThere
				? `Enter the date and time in this zone, where it's ${nowThere} now.`
				: undefined}
			error={$errors.timezone?.[0]}
			required
		>
			{#snippet children(control)}
				<Select {...control} name="timezone" bind:value={$formData.timezone}>
					{#each data.timezones as timezone (timezone.name)}
						<option value={timezone.name}>{timezone.name}</option>
					{/each}
				</Select>
			{/snippet}
		</Field>

		<div class="grid gap-5 sm:grid-cols-2">
			<Field label="Date" error={$errors.date?.[0]} required>
				{#snippet children(control)}
					<Input {...control} type="date" name="date" bind:value={$formData.date} />
				{/snippet}
			</Field>
			<Field label="Time" error={$errors.hour?.[0] ?? $errors.minute?.[0]} required>
				{#snippet children(control)}
					<Input
						{...control}
						type="time"
						bind:value={
							() => `${pad($formData.hour)}:${pad($formData.minute)}`,
							(v) => {
								const [h, m] = String(v).split(':');
								$formData.hour = Number(h);
								$formData.minute = Number(m);
							}
						}
					/>
				{/snippet}
			</Field>
		</div>
		<input type="hidden" name="hour" value={$formData.hour} />
		<input type="hidden" name="minute" value={$formData.minute} />

		<Field label="Session type" error={$errors.type?.[0]} required>
			{#snippet children(control)}
				<Select {...control} name="type" bind:value={$formData.type}>
					<option value="" disabled>Choose a session type</option>
					{#each Object.entries(data.typesMap) as [id, type] (id)}
						<option value={id}>{type.name} ({type.length} minutes)</option>
					{/each}
				</Select>
			{/snippet}
		</Field>

		{#if roleOf(data.user) >= ROLE_STAFF}
			<UserSelector
				label="Mentor"
				usersMap={mentorMap}
				name="mentor"
				bind:value={$formData.mentor}
				error={$errors.mentor?.[0]}
			/>
		{/if}

		<UserSelector
			label="Student"
			{usersMap}
			name="student"
			bind:value={$formData.student}
			error={$errors.student?.[0]}
		/>

		<div>
			<Button type="submit" disabled={!$formData.type} busy={$delayed} busyLabel="Creating">
				Create session
			</Button>
		</div>
	</form>
</Card>

<ConfirmDialog
	bind:open={confirmOpen}
	title="Schedule conflict"
	confirmLabel="Create anyway"
	onconfirm={createAnyway}
>
	<p>{isMentorAvailable.message}</p>
</ConfirmDialog>
