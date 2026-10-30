# Changes: ui-skills (ibelick)

This variant applies [ibelick/ui-skills](https://github.com/ibelick/ui-skills) to the Fieldwork baseline, in this order: `baseline-ui` (the deslop pass), then `fixing-accessibility`, then `fixing-motion-performance`. I skimmed `ui-skills-root` (a router that picks skills through a CLI) and borrowed the audit method from `improve-ui` (contradiction check and proof gate). Content, data, sections and features are the same as the baseline, with two exceptions: the one copy fix below, and a confirmation step added in front of the existing Delete actions. No npm dependencies were added. `AlertDialog` comes from the `radix-ui` package the project already has.

## Changes

### baseline-ui
| Change | File(s) | Rule |
| --- | --- | --- |
| Added `text-balance` to headings: h1, CardTitle, DialogTitle, AlertDialogTitle, AccordionTrigger | PageHeader.tsx, ui/card.tsx, ui/dialog.tsx, ui/alert-dialog.tsx, ui/accordion.tsx | Typography: "MUST use `text-balance` for headings" |
| Added `text-pretty` to body copy: CardDescription, DialogDescription, page subtitle, chat bubbles, activity lines, empty-state copy, switch descriptions, accordion answers | ui/card.tsx, ui/dialog.tsx, ui/accordion.tsx, sections/* | Typography: "`text-pretty` for body/paragraphs" |
| Added `tabular-nums` to all data: stat values and notes, invoice number/date/amount, due dates, progress %, star count, selection count, file sizes, rate input | Stats, Workspace, Controls, States, Settings, PageHeader | Typography: "MUST use `tabular-nums` for data" |
| Removed `tracking-widest` from DropdownMenuShortcut | ui/dropdown-menu.tsx | Typography: "NEVER modify letter-spacing" |
| Truncated project card titles, client names and file names | Workspace.tsx, States.tsx | Typography: "SHOULD use truncate or line-clamp for dense UI" |
| Destructive actions (project menu "Delete", Controls "Delete") now open an AlertDialog with Cancel and a destructive confirm. New `ui/alert-dialog.tsx` follows the same shadcn new-york pattern on Radix. The project menu is `modal={false}` so the menu and the dialog don't fight over focus and pointer-events | ui/alert-dialog.tsx (new), Workspace.tsx, Controls.tsx | Interaction: "MUST use an AlertDialog for destructive or irreversible actions"; Components: "use the project's existing primitives first / never mix primitive systems" |
| Toaster offsets use `env(safe-area-inset-*)`. Added `viewport-fit=cover` so `env()` resolves, and gave the sticky header `pt-[env(safe-area-inset-top)]` | ui/sonner.tsx, index.html (viewport meta only; bridge script untouched), TopNav.tsx | Interaction: "MUST respect safe-area-inset for fixed elements" |
| Conditional class strings go through `cn()` | TopNav.tsx, Controls.tsx | Stack: "MUST use cn utility for class logic" |
| Footer right-hand text set to "Variant: ui-skills (ibelick)" | App.tsx | Lab rule |

### improve-ui (audit method, then implemented)
| Change | File(s) | Rule |
| --- | --- | --- |
| Subtitle "6 active projects across 6 clients" changed to "6 projects across 6 clients, 4 in progress": the data has one Paused and one Done project | PageHeader.tsx | §3 "direct contradiction in user-facing presentation or content within the same task" |

### fixing-accessibility
| Change | File(s) | Rule |
| --- | --- | --- |
| Search input got `aria-label` and `type="search"` (it only had a placeholder) | TopNav.tsx | 1: "every input… must be labeled" |
| Assistant textarea got an sr-only `<Label>` | Assistant.tsx | 1: "every input… must be labeled" |
| Main nav got `aria-label="Main"`; the active link got `aria-current="page"` | TopNav.tsx | 4 semantics |
| Account avatar button got a visible `focus-visible` ring matching the other controls | TopNav.tsx | 2: "focus must be visible" |
| Card titles render as real `h2`s through a new optional `as` prop on CardTitle (default stays `div`), giving an h1 then h2 outline. Stat values use `as="p"` because they are numbers, not headings | ui/card.tsx, all sections | 4: "do not skip heading levels" (there were no headings below h1) |
| Activity feed and Recent files are now `ul`/`li` | Workspace.tsx, States.tsx | 4: "lists must use ul or ol with li" |
| Empty checkbox column header got sr-only "Select" | Workspace.tsx | 4: "tables must use th for headers" |
| New-project name field: `aria-required`, plus `aria-describedby` and `role="alert"` on the error | PageHeader.tsx | 5: errors linked via aria-describedby, required announced; 6: critical errors use aria-live |
| Billing email: `type="email"`, form `noValidate` (keeps the custom inline error), helper/error text linked with `aria-describedby` and `aria-live="polite"` | Settings.tsx | 5: "helper text must be associated with inputs" |
| Switch descriptions linked via `aria-describedby` | Settings.tsx | 5 |
| Save button `aria-busy` while saving | Settings.tsx | 6: "loading states should use aria-busy or status text" |
| Chat log: `role="log"`, `aria-live="polite"`, accessible name, keyboard-focusable scroll region; "Thinking…" is `role="status"`; sr-only "You:" and "Fieldwork:" speaker prefixes; bot avatars `aria-hidden` | Assistant.tsx | 6 announcements; 2 keyboard access; 1 decorative icons aria-hidden |
| Recent-files list has `aria-busy` during loading, plus sr-only "Loading file" per skeleton row | States.tsx | 6 |
| Invoice selection count is `role="status"` | Workspace.tsx | 6 |
| Every Progress bar has an `aria-label` that includes its value | Stats.tsx, Workspace.tsx | 1: accessible names |
| Decorative avatars and file thumbnails `aria-hidden` | Workspace.tsx, States.tsx | 1 |

### fixing-motion-performance (and baseline-ui Animation)
| Change | File(s) | Rule |
| --- | --- | --- |
| Accordion no longer animates `height` (`animate-accordion-up/down`). Opened content now fades in with `fade-in-0`; the chevron still rotates via transform | ui/accordion.tsx | baseline "NEVER animate layout properties"; motion §2 "prefer downgrading technique over removing motion" |
| `transition-all` replaced with explicit properties: Button gets color/bg/border/shadow, Switch track gets `transition-colors`, AccordionTrigger transition removed (it only toggles an underline) | ui/button.tsx, ui/switch.tsx, ui/accordion.tsx | motion §2 "default to transform and opacity"; baseline "animate only compositor props" |
| Progress indicator: `transition-all` became `transition-transform duration-200 ease-out` (it moves with translateX) | ui/progress.tsx | baseline "ease-out on entrance", "≤200ms"; motion §2 |
| `motion-reduce:` opt-outs on Skeleton pulse, the Save spinner, the Progress transition, the accordion fade and the chevron rotation | ui/skeleton.tsx, Settings.tsx, ui/progress.tsx, ui/accordion.tsx | baseline "SHOULD respect prefers-reduced-motion"; a11y §8 |

## Found but not implemented
- **Pause looping animations off-screen** (baseline MUST): the Skeleton `animate-pulse` is an opacity-only CSS loop during a transient loading state. An IntersectionObserver hook would be a lot of JS for a demo skeleton, and the reduced-motion opt-out covers the user-facing concern.
- **"Limit accent color to one per view" and "use theme tokens"**: the liked Heart uses `text-red-500`. Remapping it to `--destructive` would give a "like" a danger meaning, so I left it.
- **Arbitrary values** (`rounded-[4px]`, `h-[1.15rem]`, `max-w-[80%]`): these already existed in the baseline, and baseline-ui allows custom values that already exist.
- **z-index scale**: the page already uses Tailwind's defaults (`z-40`, `z-50`), so no change was needed.
- **motion/react, Base UI**: neither was required. Nothing needs JS animation, and the project's primitive system is Radix ("use existing primitives first; never mix systems").
- **Disabled submit must explain why** (Assistant send and suggestion chips): they are disabled only while empty or while "Thinking…", and the `role="status"` thinking line now announces that. No extra copy was added.
- **Like button label toggles Like/Liked alongside `aria-pressed`**: the redundancy is minor, and the skill has no rule on it. Left as is to keep content identical.
- **Top nav links as `ul`/`li`**: a flat link row inside a labelled `<nav>` is acceptable, so I skipped it.
- **improve-ui findings for hierarchy, density and prominence** need rendered evidence under its own rules, which this pass didn't have, so I reported none.
- **ui-skills CLI**: not used. I read the skills straight from the clone.

## Agent notes
ui-skills is a set of terse, checklist-style constraints that are easy to apply mechanically and easy to verify in a diff: `text-balance`/`text-pretty`, `tabular-nums`, no `tracking-*`, no `transition-all`, AlertDialog for destructive actions, safe-area insets. It is good at removing small tells and at catching motion and a11y slips in shadcn defaults (the accordion height animation, `transition-all` everywhere, unlabeled inputs). It gave almost no visual direction. It says nothing about color, spacing rhythm, type scale or hierarchy beyond "use Tailwind defaults", so the page looks nearly the same and is mostly better underneath. Some rules are absolute ("NEVER animate layout properties", "MUST pause loops off-screen") but give no guidance on proportionate fixes, and improve-ui is deliberately the opposite: so evidence-strict that, without rendered evidence, it surfaces almost nothing. Overall it is highly opinionated about implementation hygiene and close to neutral on aesthetics.
