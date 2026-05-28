import { runSyncColleges } from '../src/lib/ingestion';

async function main() {
  console.log('===================================================');
  console.log('   COLLEGEHUB: DYNAMIC REAL DATA SYNC SYSTEM       ');
  console.log('===================================================');
  try {
    const start = Date.now();
    const result = await runSyncColleges(true);
    const duration = ((Date.now() - start) / 1000).toFixed(2);
    
    console.log('\n---------------------------------------------------');
    console.log('✓ Synchronization Status: SUCCESS');
    console.log(`✓ Total Processed:      ${result.count} colleges`);
    console.log(`✓ Newly Added:          ${result.added}`);
    console.log(`✓ Records Updated:      ${result.updated}`);
    console.log(`✓ Fetch Feeds Used:     \n  - ${result.sources.join('\n  - ')}`);
    console.log(`✓ Fallback Database:    ${result.isFallback ? 'ACTIVE (PostgreSQL Offline - Syncing fallback-db.json)' : 'INACTIVE (PostgreSQL Connected)'}`);
    console.log(`✓ Sync Duration:        ${duration}s`);
    console.log('---------------------------------------------------');
    console.log('Search tokenizer index and caches successfully refreshed.\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Dynamic Ingestion Sync Failed:', error);
    process.exit(1);
  }
}

main();
