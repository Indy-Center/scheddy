// Adjusts Centerline's header to match flyindycenter.com and
// training.flyindycenter.com, so moving between the apps looks seamless:
// the user menu shows the name and ATC rating, and there's no Apps menu.
// Centerline's Header has no options for either.
//
// Runs on postinstall. Idempotent; fails loudly if Centerline's markup changed,
// so an upgrade can't silently drop the change. Remove once Centerline offers it.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const MARK = 'Scheddy patch:';
const dist = (path) =>
	fileURLToPath(
		new URL(`../node_modules/@indy-center/centerline-svelte/dist/${path}`, import.meta.url)
	);

const patches = [
	{
		// The bar shows the member's name and ATC rating, as the hub's header does.
		file: dist('UserMenu/UserMenu.svelte'),
		edits: [
			[
				'import { mdiAccountCircle, mdiCog, mdiLogout } from "@mdi/js";',
				'import { mdiAccountCircle, mdiChevronDown, mdiCog, mdiLogout, mdiRadar } from "@mdi/js";'
			],
			[
				'import { findPilotRating } from "../aviation/ratings.js";',
				'import { findPilotRating, findRating } from "../aviation/ratings.js";'
			],
			[
				'const letters = $derived(initials(name));',
				`const letters = $derived(initials(name));
  // ${MARK} the bar shows the name and ATC rating, as the hub's header does.
  const atc = $derived(rating !== undefined ? findRating(rating)?.short : undefined);`
			],
			[
				`          "size-8 text-xs ring-2",
          open ? "ring-foreground-soft" : "ring-transparent",
        ]}
      >
        {@render face(20)}
      </span>`,
				`          "size-8 text-xs ring-2 md:hidden",
          open ? "ring-foreground-soft" : "ring-transparent",
        ]}
      >
        {@render face(20)}
      </span>
      <span class="flex items-center gap-2 max-md:hidden">
        <span class="text-sm font-semibold whitespace-nowrap text-foreground">{name}</span>
        {#if atc}
          <span
            class="inline-flex items-center gap-1 rounded-md bg-primary/30 px-1.5 py-0.5 font-mono text-xs text-link"
            ><Icon path={mdiRadar} size={12} />{atc}</span
          >
        {/if}
        <Icon
          path={mdiChevronDown}
          size={18}
          class={["text-muted-foreground transition-transform", open && "rotate-180"]}
        />
      </span>`
			]
		]
	},
	{
		// The current page's nav item (and menu row) is tinted sky with a shadow,
		// as on the hub, rather than Centerline's neutral grey. Important, so
		// hovering it doesn't swap in the grey hover fill (the hub's doesn't change).
		file: dist('headerMenu/headerMenu.js'),
		edits: [
			[
				'export const currentClass = "bg-foreground/10 text-foreground!";',
				`// ${MARK} sky tint, as on the hub.
export const currentClass = "bg-sky-600/20! text-foreground! shadow-lg";`
			]
		]
	},
	{
		// No Apps menu: the hub and training site have none.
		file: dist('Header/Header.svelte'),
		edits: [
			[
				'      <AppsMenu {apps} current={app?.href ?? hub} />',
				`      <!-- ${MARK} no Apps menu, as on the hub and training site. -->`
			]
		]
	}
];

let failed = false;
for (const { file, edits } of patches) {
	let src = readFileSync(file, 'utf8');
	if (src.includes(MARK)) continue;
	for (const [from, to] of edits) {
		if (!src.includes(from)) {
			console.error(`patch-centerline: ${file} changed; can't find:
${from}`);
			failed = true;
			break;
		}
		src = src.replace(from, to);
	}
	if (!failed) writeFileSync(file, src);
}
if (failed) process.exit(1);
console.log('patch-centerline: applied');
