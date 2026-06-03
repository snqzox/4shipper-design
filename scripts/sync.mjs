import { pullAll } from './pull.mjs'
import { pullNested } from './pull-nested.mjs'
import { buildTokens } from './tokens.mjs'
import { buildSnapshot, readLatest, saveSnapshotIfChanged } from './snapshot.mjs'
import { diffSnapshots, hasChanges, writeChangelog } from './diff.mjs'
import { buildDashboard } from './build-dashboard.mjs'

// One command: pull current state → compare to last snapshot → record changes → rebuild dashboard.
// Designed to run with zero model tokens (plain Node) so it can be scheduled in CI.
async function main() {
  console.log('→ Pulling current state from Figma…')
  await pullAll()
  buildTokens()

  // Nested-component relationships are a dashboard enhancement, not part of change-tracking.
  // A failure here must not abort the sync, so warn and continue with stale/absent nested data.
  try {
    const nested = await pullNested()
    console.log(`✓ Nested components: ${nested.withNested}/${nested.units} units mapped.`)
  } catch (err) {
    console.warn(`⚠ Nested-component extraction skipped: ${err.message}`)
  }

  const previous = readLatest()
  const current = buildSnapshot()
  const diff = diffSnapshots(previous, current)
  const changed = writeChangelog(diff, current)
  saveSnapshotIfChanged(current, previous)

  buildDashboard()

  if (diff.firstRun) {
    console.log('✓ First run — baseline snapshot stored.')
  } else if (changed) {
    console.log('✓ Library changes detected — changelog updated.')
  } else {
    console.log('✓ No library changes since last sync.')
  }
  console.log('✓ Dashboard rebuilt: dashboard/index.html')

  // Expose result for CI step summaries.
  if (hasChanges(diff)) console.log('::notice::Design system changed')
}

main().catch((err) => {
  console.error('✗ Sync failed:', err.message)
  process.exit(1)
})
