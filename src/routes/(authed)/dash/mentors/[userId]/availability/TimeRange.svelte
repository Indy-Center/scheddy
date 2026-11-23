<script lang="ts">
	import { Button, Icon, Input } from '@indy-center/centerline-svelte';
	import { mdiDelete } from '@mdi/js';

	type Time = { hour: number; minute: number };

	interface Props {
		/** Names the group for screen readers, such as "Monday, hours 2". */
		label: string;
		start: Time;
		end: Time;
		onremove?: () => void;
	}
	let { label, start = $bindable(), end = $bindable(), onremove }: Props = $props();
</script>

<div class="flex flex-wrap items-center gap-2" role="group" aria-label={label}>
	<span class="inline-flex items-center gap-1">
		<Input
			type="number"
			min="0"
			max="48"
			class="w-16 text-center"
			aria-label="From hour"
			bind:value={start.hour}
		/>
		<span aria-hidden="true">:</span>
		<Input
			type="number"
			min="0"
			max="59"
			step="5"
			class="w-16 text-center"
			aria-label="From minute"
			bind:value={start.minute}
		/>
	</span>
	<span class="text-muted-foreground">to</span>
	<span class="inline-flex items-center gap-1">
		<Input
			type="number"
			min="0"
			max="48"
			class="w-16 text-center"
			aria-label="To hour"
			bind:value={end.hour}
		/>
		<span aria-hidden="true">:</span>
		<Input
			type="number"
			min="0"
			max="59"
			step="5"
			class="w-16 text-center"
			aria-label="To minute"
			bind:value={end.minute}
		/>
	</span>
	{#if onremove}
		<Button variant="secondary" size="sm" aria-label="Remove these hours" onclick={onremove}>
			<Icon path={mdiDelete} />
		</Button>
	{/if}
</div>
