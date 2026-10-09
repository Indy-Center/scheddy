<script lang="ts">
	import { base } from '$app/paths';

	import { Button } from '$lib/components/ui/button';
	import PlusIcon from '@lucide/svelte/icons/plus';
</script>

<Button class="float-right" size="sm" href="{base}/dash/users/set">
	<PlusIcon class="size-4 mr-2" />
	Set Override
</Button>
