import { Effect, Stream, Ref } from 'effect';
import { FetchHttpClient } from '@effect/platform';
import { EdlinkClient, EdlinkClientLive } from '../../src/services/edlink-client.js';

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
  yield* Effect.log('💡 This strategy processes items one-by-one without loading all into memory');

  const edlinkClient = yield* EdlinkClient;
  const eventsStream = edlinkClient.getEventsStream();

  // Use Refs for effectful mutable state instead of `let` / `.push()`
  const countRef = yield* Ref.make(0);
  const idsRef = yield* Ref.make<readonly string[]>([]);

  yield* Stream.runForEach(eventsStream, (event) =>
    Effect.gen(function* () {
      const count = yield* Ref.updateAndGet(countRef, (n) => n + 1);
      if (event.id) {
        yield* Ref.update(idsRef, (ids) => [...ids, event.id!]);
      }
      if (count === 1 || count % 10 === 0) {
        yield* Effect.log(`Processed event #${count}: ID=${event.id}, Type=${event.type}`);
      }
    })
  );

  const totalCount = yield* Ref.get(countRef);
  const processedIds = yield* Ref.get(idsRef);

  yield* Effect.log(`Finished processing ${totalCount} events sequentially`);
  yield* Effect.log(`First 3 IDs: ${processedIds.slice(0, 3).join(', ')}`);
}).pipe(
  Effect.provide(EdlinkClientLive),
  Effect.provide(FetchHttpClient.layer),
);
