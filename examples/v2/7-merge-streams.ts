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
  yield* Effect.logInfo('Example 7: Merge Events and People Streams');
  yield* Effect.log('Combine multiple streams for unified processing');

  const edlinkClient = yield* EdlinkClient;

  const eventsStream = edlinkClient.getEventsStream().pipe(
    Stream.map((event) => ({ kind: 'event' as const, id: event.id, data: event }))
  );
  const peopleStream = edlinkClient.getPeopleStream().pipe(
    Stream.map((person) => ({ kind: 'person' as const, id: person.id, data: person }))
  );

  const mergedStream = Stream.merge(eventsStream, peopleStream);
  const itemsChunk = yield* Stream.runCollect(mergedStream);
  const items = Chunk.toArray(itemsChunk);

  const eventCount = items.filter((i) => i.kind === 'event').length;
  const personCount = items.filter((i) => i.kind === 'person').length;

  yield* Effect.log(`Merged ${items.length} items (${eventCount} events, ${personCount} people)`);

  if (items.length > 0) {
    yield* Effect.log('Sample items (first 5):');
    yield* Effect.forEach(items.slice(0, 5), (item, idx) =>
      item.kind === 'event'
        ? Effect.log(`  ${idx + 1}. EVENT  - ID: ${item.id}, Type: ${item.data.type}`)
        : Effect.log(`  ${idx + 1}. PERSON - ID: ${item.id}, Name: ${item.data.display_name}`)
    );
  }
}).pipe(
  Effect.provide(EdlinkClientLive),
  Effect.provide(FetchHttpClient.layer),
);
