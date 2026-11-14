# Browser Local Storage Architecture

> **Historical:** `services/projectStore.ts` and the `userProjects` /
> `currentProject` keys were removed with the dashboard. The only keys the app
> still uses are `permitflow_onboarding_draft` (resumable wizard) and
> `permitHub_documentChecklist` (simulator result). See `AGENTS.md` for the
> current schema.

Layout mode to line: Every view must talk to **one** storage module
(`services/projectStore.ts`). Nothing else reads or writes the `userProjects`
and `currentProject` keys.

## Key Contract

| Key | Format | Owned by | Written by |
|-----|--------|----------|------------|
| `userProjects` | Versioned envelope (below) | `services/projectStore.ts` | `services/projectStore.ts` only |
| `currentProject` | A single repaired `PermitProject` JSON | `services/projectStore.ts` | `services/projectStore.ts` only |
| `permitHub_documentChecklist` | Simulator checklist snapshot | `DocumentChecklistCalculator.tsx` | own component |
| `permitflow_onboarding_draft` | In-progress wizard auto-save | `views/Onboarding.tsx` | own view |
| `permitflow_read_notifications` | Read notification IDs | `components/NotificationCenter.tsx` | own component |
| `permitflow_dismissed_notifications` | Dismissed notification IDs | `components/NotificationCenter.tsx` | own component |
| `permitflow_custom_notifications` | Simulated notifications | `components/NotificationCenter.tsx` | own component |

If you need a new key, document it here **in the same change** that adds it.

## Envelope

```ts
interface ProjectsEnvelope {
  version: number;            // PROJECTS_SCHEMA_VERSION (currently 1)
  projects: PermitProject[];
}
```

Stored under `userProjects` via `localStorage.setItem` (or the injected
`StorageLike` in tests).

## Schema versioning

- `PROJECTS_SCHEMA_VERSION = 1` is the only version the app writes.
- `loadProjects()` accepts:
  - a legacy **unversioned array** (`PermitProject[]`) → migrated to the
    envelope automatically and immediately rewritten;
  - an envelope with `version < current` → treated as migrated;
  - an envelope with `version > current` (written by a newer app) →
    **whole-store reset**: the key is removed and an empty workspace is
    returned (`storeReset: true`).
- Bump `PROJECTS_SCHEMA_VERSION` only when the envelope shape changes, and
  add a migration step for the old version before doing so.

## Recovery semantics (never crash)

`loadProjects()` returns `ProjectLoadResult`:

```ts
{
  projects: PermitProject[];   // every record that could be kept
  recovered: RecoveredRecord[]; // id + reason per repaired/reset record
  migrated: boolean;            // legacy array upgraded this load
  storeReset: boolean;          // whole store had to be reset
}
```

Per-record rules in `repairRecord`:

- **Missing/invalid `id`** → synthesize `RECOVERED-<ts>-<n>`; record is kept
  and listed in `recovered`.
- **Non-object record** → dropped; the slot is reported in `recovered`
  (only the affected record, never the whole store).
- **Duplicate `id`** → later duplicates are dropped and reported in
  `recovered`.
- **Field coercion** — strings trimmed/capped (`MAX_STRING_LEN` 4000,
  `MAX_ROADMAP_LEN` 20000), numbers kept only when finite, `statusCategory`
  ↔ `status` inferred from each other when either is invalid,
  `readinessScore` clamped to 0–100, `documentAvailability` values forced to
  `have | missing | unknown`, nested arrays pruned to well-formed id'd items,
  `files` forced to `[]` (File objects don't survive JSON).
- **Unknown/extra fields are preserved losslessly** (`...raw` spread).
- After any repair or migration the store is **rewritten immediately**, so a
  second load is clean.

Only two situations reset the whole store:
1. `userProjects` is not valid JSON.
2. The envelope claims a newer schema version.

## Storage failures

Every API returns `StoreResult<T>` (`{ ok, error?, value? }`). Writes that
fail (quota, private-mode blocking) return `ok: false` with a user-facing
message. The module **never throws**.

```ts
type StoreResult<T = void> = { ok: boolean; error?: string; value?: T };
```

## Public API

| Function | Purpose |
|----------|---------|
| `loadProjects()` | Read + repair + migrate; returns the load result. |
| `persistProjects(projects)` | Write a full list through the envelope. |
| `getProject(id)` | Read a single project by id. |
| `saveProject(project)` | Upsert: replace by id, else prepend. |
| `removeProject(id)` | Delete one project (permanent). |
| `setProjectArchived(id, archived)` | Toggle the `archived` flag. |
| `getCurrentProject()` | Read the currently selected project. |
| `setCurrentProject(project \| null)` | Set, or clear, the current project. |
| `setStoreStorage(storage \| null)` | **Tests only** — inject an in-memory `StorageLike`. |

## Rules for views

- Views own React state only; they persist by calling the store API.
- The Dashboard seeds `SEED_PROJECTS` only when the `userProjects` key is
  absent, then treats the store as the single source of truth.
- `archived === true` projects are excluded from default lists, counts and
  "All" throughput; the Archive tab shows them. Archiving is reversible,
  deletion is permanent (confirm before deleting).
- The `storage` event (other tabs) is handled in `components/Layout.tsx` by
  re-running `loadProjects()`.