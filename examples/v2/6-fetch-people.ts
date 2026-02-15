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

  const peopleChunk = yield* edlinkClient
    .getPeopleStream()
    .pipe(Stream.runCollect);
  const people = Chunk.toArray(peopleChunk);

  yield* Effect.log(`Fetched ${people.length} people (default 3 pages max)`);

  if (people.length > 0) {
    yield* Effect.log('Sample people (first 3):');
    yield* Effect.forEach(people.slice(0, 3), (person, idx) =>
      Effect.log(
        `  ${idx + 1}. ID: ${person.id}, Name: ${person.display_name ?? person.first_name}, Email: ${person.email}`
      )
    );
  }
}).pipe(
  Effect.provide(EdlinkClientLive),
  Effect.provide(FetchHttpClient.layer),
);
