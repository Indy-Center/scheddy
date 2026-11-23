<script lang="ts">
	import type { PageData } from './$types';
	import { Icon, Link, PageHeader, StatCard } from '@indy-center/centerline-svelte';
	import { mdiCalendarCheck, mdiRadar, mdiSwapVertical } from '@mdi/js';

	interface Props {
		data: PageData;
	}
	let { data }: Props = $props();

	const hours = new Date().getHours();
	const timeOfDay = hours >= 4 && hours < 12 ? 'morning' : hours < 17 ? 'afternoon' : 'evening';
</script>

<PageHeader title="Good {timeOfDay}, {data.user.firstName}">Your training at a glance.</PageHeader>

<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
	<div>
		<StatCard label="Your upcoming sessions" value={data.yourSessions}>
			{#snippet icon()}<Icon path={mdiCalendarCheck} />{/snippet}
		</StatCard>
		<Link href="/dash/mentors/{data.user.id}" class="mt-2 inline-block text-sm">Your schedule</Link>
	</div>
	<div>
		<StatCard label="Facility upcoming sessions" value={data.upcoming}>
			{#snippet icon()}<Icon path={mdiRadar} />{/snippet}
		</StatCard>
		<Link href="/dash/cal" class="mt-2 inline-block text-sm">Facility calendar</Link>
	</div>
	<div>
		<StatCard label="Pending transfer requests" value={data.transferRequests}>
			{#snippet icon()}<Icon path={mdiSwapVertical} />{/snippet}
		</StatCard>
		<Link href="/dash/cal/transfer_requests" class="mt-2 inline-block text-sm">
			Transfer requests
		</Link>
	</div>
</div>
