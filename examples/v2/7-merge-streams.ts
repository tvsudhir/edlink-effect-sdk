import { Effect, Stream, Chunk } from 'effect';
import { FetchHttpClient } from '@effect/platform';
import { EdlinkClient, EdlinkClientLive } from '../../src/services/edlink-client.js';

/**
 * Example 7: Merge Multiple Streams
 *
 * Strategy: Stream Merging / Concurrent Fetching
 * - Merges Events and People streams into single stream
 * - Best for: Multi-entity processing, unified data pipelines
 * - Memory: Depends on items (combines all sources)
 * - Efficient: Concurrent fetching of different entities
 *
 * This shows how to combine multiple streams into one unified stream
 * with type discrimination. Useful for processing multiple entity types
 * in a single pipeline.
 */
export default Effect.gen(function* () {
  yield* Effect.logInfo('📖 Example 7: Merge Events and People Streams');
  yield* Effect.logInfo('💡 Combine multiple streams for unified processing');

  const edlinkClient = yield* EdlinkClient;

  // Create a merged stream with type discrimination
  const eventsStream = edlinkClient.getEventsStream().pipe(
    Stream.map((event) => ({ type: 'event' as const, id: event.id, data: event }))
  );

  const peopleStream = edlinkClient.getPeopleStream().pipe(
    Stream.map((person) => ({
      type: 'person' as const,
      id: person.id,
      data: person,
    }))
  );

  // Merge both streams
  const mergedStream = Stream.merge(eventsStream, peopleStream);

  const itemsChunk = yield* Stream.runCollect(mergedStream);
  const items = Chunk.toArray(itemsChunk);

  const eventCount = items.filter((i) => i.type === 'event').length;
  const personCount = items.filter((i) => i.type === 'person').length;

  const summary = {
    totalItems: items.length,
    eventCount,
    personCount,
    strategy: 'Stream.merge() for concurrent fetching',
    note: 'Items come from both sources interleaved',
  };
  yield* Effect.logInfo('✅ Merged stream results:', summary);
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(summary, null, 2));

  if (items.length > 0) {
    yield* Effect.logInfo('📌 Sample items (first 5):');
    items.slice(0, 5).forEach((item, idx) => {
      if (item.type === 'event') {
        console.log(`  ${idx + 1}. EVENT - ID: ${item.id}, Type: ${item.data.type}`);
      } else {
        console.log(
          `  ${idx + 1}. PERSON - ID: ${item.id}, Name: ${item.data.display_name}`
        );
      }
    });
  }
}).pipe(
  Effect.provide(EdlinkClientLive),
  Effect.provide(FetchHttpClient.layer),
);
