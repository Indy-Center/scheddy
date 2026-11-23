<script lang="ts">
	import { Combobox, Field } from '@indy-center/centerline-svelte';

	// Pick a member by name or CID. Sends the CID with the form as `name`.
	interface Props {
		usersMap: Record<number, string>;
		name: string;
		label: string;
		/** The chosen CID; '' (or 0) when nobody is chosen. Set to a string. */
		value: string | number;
		hint?: string;
		error?: string;
		required?: boolean;
	}
	let {
		usersMap,
		name,
		label,
		value = $bindable(''),
		hint,
		error,
		required = true
	}: Props = $props();

	type Option = { cid: string; name: string };
	const options: Option[] = $derived(
		Object.entries(usersMap).map(([cid, name]) => ({ cid, name }))
	);
</script>

<Field {label} hint={hint ?? 'Search by name or CID.'} {error} {required}>
	{#snippet children(control)}
		<Combobox
			{...control}
			{name}
			{options}
			getText={(o: Option) => `${o.name} (${o.cid})`}
			getKey={(o: Option) => o.cid}
			bind:value={
				() => options.find((o) => o.cid === String(value)) ?? null,
				(o: Option | null) => (value = o?.cid ?? '')
			}
		>
			{#snippet option(o: Option)}
				<span class="flex-1">{o.name}</span>
				<span class="font-mono text-sm text-muted-foreground">{o.cid}</span>
			{/snippet}
		</Combobox>
	{/snippet}
</Field>
