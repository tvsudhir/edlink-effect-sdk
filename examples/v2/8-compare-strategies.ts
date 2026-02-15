import { Effect, Stream, Chunk } from 'effect';
import { FetchHttpClient } from '@effect/platform';
import { EdlinkClient, EdlinkClientLive } from '../../src/services/edlink-client.js';

export default Effect.gen(function* () {
  yield* Effect.logInfo('Example 8: Compare All Pagination Strategies');

  const edlinkClient = yield* EdlinkClient;

  yield* Effect.log('Running strategy 1/3: Default (3 pages)...');
  const events1 = Chunk.toArray(yield* Stream.runCollect(edlinkClient.getEventsStream()));

  yield* Effect.log('Running strategy 2/3: Fetch All...');
  const events2 = Chunk.toArray(yield* Stream.runCollect(edlinkClient.getEventsStream({ type: 'all' })));

  yield* Effect.log('Running strategy 3/3: Max 100 Records...');
  const events3 = Chunk.toArray(
    yield* Stream.runCollect(edlinkClient.getEventsStream({ type: 'records', maxRecords: 100 })),
  );

  const table = [
    '',
    '  Strategy                   | Count | Use Case',
    '  ---|---|---',
    `  Default (3 pages)          | ${String(events1.length).padEnd(5)} | Fast sampling, testing`,
    `  Fetch All                  | ${String(events2.length).padEnd(5)} | Complete sync, reporting`,
    `  Max 100 Records            | ${String(events3.length).padEnd(5)} | Batch processing, balanced`,
    '',
  ];

  yield* Effect.log('Pagination strategy comparison:');
  yield* Effect.forEach(table, (line) => Effect.log(line));

  const recommendation =
    events2.length > 200
      ? 'Use pagination in production (avoid "fetch all" on large datasets)'
      : 'Safe to use "fetch all" on small datasets';

  yield* Effect.log(
    `Default: ${events1.length}, All: ${events2.length}, Max100: ${events3.length}, Diff: ${events2.length - events1.length}`,
  );
  yield* Effect.log(`Recommendation: ${recommendation}`);
}).pipe(
  Effect.provide(EdlinkClientLive),
  Effect.provide(FetchHttpClient.layer),
);
