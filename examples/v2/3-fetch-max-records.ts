import { Effect, Stream, Chunk } from 'effect';
import { FetchHttpClient } from '@effect/platform';
import { EdlinkClient, EdlinkClientLive } from '../../src/services/edlink-client.js';

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

  const edlinkClient = yield* EdlinkClient;

  // Get stream of events, limited to max 50 records
  const eventsStream = edlinkClient.getEventsStream({
    type: 'records',
    maxRecords: 50,
  });

  const eventsChunk = yield* Stream.runCollect(eventsStream);
  const events = Chunk.toArray(eventsChunk);

  yield* Effect.log(`Fetched ${events.length} events (max 50 records, memory bounded)`);

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
