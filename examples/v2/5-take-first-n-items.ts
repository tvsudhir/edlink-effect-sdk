import { Effect, Stream, Chunk } from 'effect';
import { FetchHttpClient } from '@effect/platform';
import { EdlinkClient, EdlinkClientLive } from '../../src/services/edlink-client.js';

/**
 * Example 5: Take First N Items (Sampling)
 *
 * Strategy: Stream Sampling
 * - Takes only the first N items and stops
 * - Best for: Sampling large datasets, testing, quick previews
 * - Memory: Low (stops early, doesn't fetch remaining pages)
 *
 * Even if you request unlimited data, you can take just the first
 * few items. The stream will stop fetching once it has enough items.
 * This is useful for quick sampling without wasting API calls.
 */
export default Effect.gen(function* () {
  yield* Effect.logInfo('📖 Example 5: Take First 5 Events (Sampling)');
  yield* Effect.log('💡 Even requesting "all" data, we only take first 5 items');

  const edlinkClient = yield* EdlinkClient;

  // Request all events, but take only the first 5
  const eventsStream = edlinkClient.getEventsStream({ type: 'all' }).pipe(
    Stream.take(5)
  );

  const eventsChunk = yield* Stream.runCollect(eventsStream);
  const events = Chunk.toArray(eventsChunk);

  yield* Effect.log(`Took ${events.length} events (stream stopped fetching after 5)`);

  if (events.length > 0) {
    yield* Effect.log('Sampled events:');
    yield* Effect.forEach(events, (event, idx) =>
      Effect.log(`  ${idx + 1}. ID: ${event.id}, Type: ${event.type}`)
    );
  }
}).pipe(
  Effect.provide(EdlinkClientLive),
  Effect.provide(FetchHttpClient.layer),
);
