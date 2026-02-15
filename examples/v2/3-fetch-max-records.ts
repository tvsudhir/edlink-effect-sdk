import { Effect, Stream, Chunk } from 'effect';
import { FetchHttpClient } from '@effect/platform';
import { loadEdlinkConfig } from '../../src/config.js';
import { makeEdlinkClientLayer, EdlinkClient } from '../../src/services/edlink-client.js';

/**
 * Example 3: Fetch with Maximum Record Count Limit
 *
 * Strategy: Max Records
 * - Limits by number of records instead of pages
 * - Best for: Batch processing, pagination UIs, controlled memory
 * - Memory: Predictable (stops at exactly N records)
 *
 * This demonstrates limiting the stream by the number of individual records
 * rather than the number of pages. Useful when you know exactly how much
 * data you can process.
 */
export default Effect.gen(function* () {
  yield* Effect.logInfo('📖 Example 3: Fetch Events with Max Records Limit (50)');

  const edlinkConfig = yield* loadEdlinkConfig();
  const httpClientLayer = FetchHttpClient.layer;
  const edlinkClientLayer = makeEdlinkClientLayer(edlinkConfig);

  yield* Effect.gen(function* () {
    const edlinkClient = yield* EdlinkClient;

    // Get stream of events, limited to max 50 records
    const eventsStream = edlinkClient.getEventsStream({
      type: 'records',
      maxRecords: 50,
    });

    // Collect all events and convert to array
    const eventsChunk = yield* Stream.runCollect(eventsStream);
    const events = Chunk.toArray(eventsChunk);

    const summary = {
      maxRequested: 50,
      actualCount: events.length,
      strategy: 'Stop after N records',
      memoryNote: 'Memory usage bounded by record limit',
    };
    yield* Effect.logInfo('✅ Events with record limit:', summary);
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
