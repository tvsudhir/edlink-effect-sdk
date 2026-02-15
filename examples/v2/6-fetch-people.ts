import { Effect, Stream, Chunk } from 'effect';
import { FetchHttpClient } from '@effect/platform';
import { EdlinkClient, EdlinkClientLive } from '../../src/services/edlink-client.js';

/**
 * Example 6: Fetch People Data
 *
 * Strategy: Entity Fetching
 * - Fetches a different entity type (People instead of Events)
 * - Best for: Getting user/person data, organizational structure
 * - Memory: Low (default 3 pages)
 *
 * This example shows how to use the same stream-based approach
 * with different entity types. The pattern is identical to Events,
 * just using the getPeopleStream() method instead.
 */
export default Effect.gen(function* () {
  yield* Effect.logInfo('📖 Example 6: Fetch People Data (Default 3 Pages)');
  yield* Effect.logInfo('💡 Same stream pattern works for all entity types');

  const edlinkClient = yield* EdlinkClient;

  // Get stream of people (default: max 3 pages)
  const peopleStream = edlinkClient.getPeopleStream();

  const peopleChunk = yield* Stream.runCollect(peopleStream);
  const people = Chunk.toArray(peopleChunk);

  const summary = {
    totalCount: people.length,
    entityType: 'Person',
    strategy: 'Default pagination (3 pages)',
  };
  yield* Effect.logInfo('✅ People fetched (default 3 pages max):', summary);
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(summary, null, 2));

  if (people.length > 0) {
    yield* Effect.logInfo('📌 Sample people (first 3):');
    people.slice(0, 3).forEach((person, idx) => {
      console.log(
        `  ${idx + 1}. ID: ${person.id}, Name: ${person.display_name || person.first_name}, Email: ${person.email}`
      );
    });
  }
}).pipe(
  Effect.provide(EdlinkClientLive),
  Effect.provide(FetchHttpClient.layer),
);
