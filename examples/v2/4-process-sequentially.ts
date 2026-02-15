import { Effect, Stream } from 'effect';
import { FetchHttpClient } from '@effect/platform';
import { loadEdlinkConfig } from '../../src/config.js';
import { makeEdlinkClientLayer, EdlinkClient } from '../../src/services/edlink-client.js';

/**
 * Example 4: Process Events Sequentially (Memory-Efficient)
 *
 * Strategy: Stream Processing
 * - Processes one item at a time
 * - Best for: Large datasets, pipeline processing, real-time feeds
 * - Memory: Very Low (processes then discards each item)
 * - This is the most memory-efficient pattern
 *
 * Instead of collecting all items into memory, this streams items
 * one-by-one for processing. Perfect for large datasets or when
 * you don't need all data at once.
 */
export default Effect.gen(function* () {
  yield* Effect.logInfo('📖 Example 4: Process Events Sequentially (Memory-Efficient)');
  yield* Effect.logInfo('💡 This strategy processes items one-by-one without loading all into memory');

  const edlinkConfig = yield* loadEdlinkConfig();
  const httpClientLayer = FetchHttpClient.layer;
  const edlinkClientLayer = makeEdlinkClientLayer(edlinkConfig);

  yield* Effect.gen(function* () {
    const edlinkClient = yield* EdlinkClient;

    const eventsStream = edlinkClient.getEventsStream();

    // Process each event as it comes (doesn't load all into memory)
    let eventCount = 0;
    const processedIds: string[] = [];

    yield* Stream.runForEach(eventsStream, (event) =>
      Effect.gen(function* () {
        eventCount++;
        if (event.id) {
          processedIds.push(event.id);
        }

        // Log progress at intervals
        if (eventCount === 1 || eventCount % 10 === 0) {
          yield* Effect.logInfo(`Processed event #${eventCount}:`, {
            eventId: event.id,
            eventType: event.type,
          });
        }
      })
    );

    const summary = {
      totalCount: eventCount,
      strategy: 'Stream processing (one at a time)',
      memoryNote: 'Only one event held in memory at a time',
      firstThreeIds: processedIds.slice(0, 3),
    };
    yield* Effect.logInfo('✅ Finished processing events sequentially:', summary);
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(summary, null, 2));
  }).pipe(
    Effect.provide(edlinkClientLayer),
    Effect.provide(httpClientLayer)
  );
});
