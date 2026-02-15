import { Effect, Stream, Chunk } from 'effect';
import { FetchHttpClient } from '@effect/platform';
import { EdlinkClient, EdlinkClientLive } from '../../src/services/edlink-client.js';

/**
 * Example 2: Fetch ALL Available Events (No Limit)
 *
 * Strategy: Fetch All
 * - Fetches all available data without limit
 * - Best for: Complete data sync, reporting, backups
 * - Memory: High (loads all pages until exhausted)
 * - Warning: Use with caution on large datasets
 *
 * This example demonstrates how to override the default 3-page limit
 * and fetch everything available from the API.
 */
export default Effect.gen(function* () {
  yield* Effect.logInfo('📖 Example 2: Fetch ALL Available Events');
  yield* Effect.logWarning('⚠️  This may take time if there are many events...');

  const edlinkClient = yield* EdlinkClient;
  const eventsChunk = yield* edlinkClient
    .getEventsStream({ type: 'all' })
    .pipe(Stream.runCollect);
  const events = Chunk.toArray(eventsChunk);

  yield* Effect.log(`Fetched all ${events.length} events (loaded into memory)`);

  if (events.length > 0) {
    yield* Effect.log('Sample events (first 3):');
    yield* Effect.forEach(events.slice(0, 3), (event, idx) =>
      Effect.log(`  ${idx + 1}. ID: ${event.id}, Type: ${event.type}`)
    );
  }
}).pipe(
  Effect.provide(EdlinkClientLive),
  Effect.provide(FetchHttpClient.layer),
);
