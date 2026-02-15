import { Effect, Stream, Chunk, Duration } from 'effect';
import { FetchHttpClient } from '@effect/platform';
import { EdlinkClient, EdlinkClientLive } from '../../src/services/edlink-client.js';


/**
 * Example 1: Fetch Events with Default 3 Pages Limit
 *
 * Strategy: Default Pagination
 * - Fetches only the first 3 pages
 * - Best for: Quick sampling, testing, lightweight queries
 * - Memory: Low (loads only 3 pages)
 *
 * This is the simplest usage pattern where the SDK defaults to fetching
 * a safe number of pages (3) to avoid long-running queries.
 * 
 * Dependencies are injected via Effect's Context:
 * - EdlinkConfig: Configuration service (comes from EdlinkConfig.Live layer)
 * - EdlinkClient: API client service (comes from EdlinkClientLive layer)
 * - HttpClient: HTTP platform (comes from FetchHttpClient.layer)
 */
export default Effect.gen(function* () {
  yield* Effect.logInfo('📖 Example 1: Fetch Events with Default 3-Page Limit');

  const edlinkClient = yield* EdlinkClient;

  const eventsChunk = yield* edlinkClient
    .getEventsStream()
    .pipe(Stream.take(500), Stream.runCollect);
  const events = Chunk.toArray(eventsChunk);

  yield* Effect.log(`Fetched ${events.length} events (default pagination, 3 pages max)`);

  if (events.length > 0) {
    yield* Effect.log('Sample events:');
    yield* Effect.forEach(events.slice(0, 3), (event, idx) =>
      Effect.log(`  ${idx + 1}. ID: ${event.id}, Type: ${event.type}`)
    );
  }
}).pipe(
  // Provide the required service layers
  Effect.provide(EdlinkClientLive),
  Effect.provide(FetchHttpClient.layer),
  Effect.timeout(Duration.seconds(12))
);
