import { Effect, Stream, Chunk } from 'effect';
import { FetchHttpClient } from '@effect/platform';
import { loadEdlinkConfig } from '../../src/config.js';
import { makeEdlinkClientLayer, EdlinkClient } from '../../src/services/edlink-client.js';

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
  yield* Effect.logInfo('⚠️  This may take time if there are many events...');

  const edlinkConfig = yield* loadEdlinkConfig();
  const httpClientLayer = FetchHttpClient.layer;
  const edlinkClientLayer = makeEdlinkClientLayer(edlinkConfig);

  yield* Effect.gen(function* () {
    const edlinkClient = yield* EdlinkClient;

    // Get stream of events with no limit
    const eventsStream = edlinkClient.getEventsStream({ type: 'all' });

    // Collect all events and convert to array
    const eventsChunk = yield* Stream.runCollect(eventsStream);
    const events = Chunk.toArray(eventsChunk);

    const summary = {
      totalCount: events.length,
      strategy: 'Fetch everything',
      memoryNote: 'All pages loaded into memory',
    };
    yield* Effect.logInfo('✅ All available events fetched:', summary);
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(summary, null, 2));

    if (events.length > 0) {
      yield* Effect.logInfo('📌 Sample events (first 3):');
      events.slice(0, 3).forEach((event, idx) => {
        console.log(`  ${idx + 1}. ID: ${event.id}, Type: ${event.type}`);
      });
    }
  }).pipe(
    Effect.provide(edlinkClientLayer),
    Effect.provide(httpClientLayer)
  );
});
