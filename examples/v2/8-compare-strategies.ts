import { Effect, Stream, Chunk } from 'effect';
import { FetchHttpClient } from '@effect/platform';
import { EdlinkClient, EdlinkClientLive } from '../../src/services/edlink-client.js';

/**
 * Example 8: Compare All Pagination Strategies
 *
 * Strategy: Strategy Comparison
 * - Runs multiple strategies side-by-side
 * - Best for: Understanding trade-offs, benchmarking, testing
 * - Demonstrates: Default, all, and record-limited approaches
 *
 * This example shows how different pagination strategies affect
 * the amount of data fetched. Useful for understanding which
 * strategy best fits your use case.
 */
export default Effect.gen(function* () {
  yield* Effect.logInfo('📖 Example 8: Compare All Pagination Strategies');
  yield* Effect.logInfo(
    '💡 See how different strategies fetch different amounts of data'
  );

  const edlinkClient = yield* EdlinkClient;

  yield* Effect.logInfo('⏳ Running strategy 1/3: Default (3 pages)...');
  // Strategy 1: Default (3 pages)
  const eventsChunk1 = yield* Stream.runCollect(
    edlinkClient.getEventsStream()
  );
  const events1 = Chunk.toArray(eventsChunk1);

  yield* Effect.logInfo('⏳ Running strategy 2/3: Fetch All...');
  // Strategy 2: Fetch all
  const eventsChunk2 = yield* Stream.runCollect(
    edlinkClient.getEventsStream({ type: 'all' })
  );
  const events2 = Chunk.toArray(eventsChunk2);

  yield* Effect.logInfo('⏳ Running strategy 3/3: Max 100 Records...');
  // Strategy 3: Max 100 records
  const eventsChunk3 = yield* Stream.runCollect(
    edlinkClient.getEventsStream({
      type: 'records',
      maxRecords: 100,
    })
  );
  const events3 = Chunk.toArray(eventsChunk3);

  const table = [] as string[];
  table.push('');
  table.push('  Strategy                   | Count | Use Case');
  table.push('  ---|---|---');
  table.push(`  Default (3 pages)          | ${String(events1.length).padEnd(5)} | Fast sampling, testing`);
  table.push(`  Fetch All                  | ${String(events2.length).padEnd(5)} | Complete sync, reporting`);
  table.push(`  Max 100 Records            | ${String(events3.length).padEnd(5)} | Batch processing, balanced`);
  table.push('');

  const differences = {
    default3PagesCount: events1.length,
    fetchAllCount: events2.length,
    max100RecordsCount: events3.length,
    allVsDefault: events2.length - events1.length,
    recommendation:
      events2.length > 200
        ? 'Use pagination in production (avoid "fetch all" on large datasets)'
        : 'Safe to use "fetch all" on small datasets',
  };

  yield* Effect.logInfo('✅ Pagination strategy comparison:');
  // Print the table and JSON summary to console for immediate visibility
  // eslint-disable-next-line no-console
  console.log(table.join('\n'));
  // eslint-disable-next-line no-console
  console.log('');
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(differences, null, 2));
}).pipe(
  Effect.provide(EdlinkClientLive),
  Effect.provide(FetchHttpClient.layer),
);
