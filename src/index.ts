import { Effect } from 'effect';
import { NodeRuntime } from '@effect/platform-node';
import { EdlinkConfig } from './services/config-service.js';

// Static imports for examples
import example1 from '../examples/v2/1-fetch-default-pages.js';
import example2 from '../examples/v2/2-fetch-all-data.js';
import example3 from '../examples/v2/3-fetch-max-records.js';
import example4 from '../examples/v2/4-process-sequentially.js';
import example5 from '../examples/v2/5-take-first-n-items.js';
import example6 from '../examples/v2/6-fetch-people.js';
import example7 from '../examples/v2/7-merge-streams.js';
import example8 from '../examples/v2/8-compare-strategies.js';

/**
 * Example selector: Choose which example to run
 * Set the EXAMPLE environment variable (1-8) to run different examples
 *
 * Available examples:
 * 1 - Fetch default 3 pages
 * 2 - Fetch all available data
 * 3 - Fetch with max record limit
 * 4 - Process sequentially (memory-efficient)
 * 5 - Take first N items
 * 6 - Fetch people data
 * 7 - Merge multiple streams
 * 8 - Compare pagination strategies
 */

type ExampleEffect = Effect.Effect<void, unknown, EdlinkConfig>;

const examplesMap: Record<number, ExampleEffect> = {
  1: example1,
  2: example2,
  3: example3,
  4: example4,
  5: example5,
  6: example6,
  7: example7,
  8: example8,
};

/**
 * Lookup and return the requested example module
 */
const loadExampleModule = Effect.fn((exampleNumber: number) =>
  examplesMap[exampleNumber]
    ? Effect.succeed(examplesMap[exampleNumber]!)
    : Effect.fail(
        new Error(`Invalid example number: ${exampleNumber}. Choose 1-8.`)
      )
);

/**
 * Main entry point — loads and runs the selected example
 */
const main = Effect.gen(function* () {
  const config = yield* EdlinkConfig;
  const exampleNumber = config.exampleNumber;

  yield* Effect.logInfo(`Edlink Effect SDK - Running Example ${exampleNumber}`);
  yield* Effect.logInfo('---');

  const exampleEffect = yield* loadExampleModule(exampleNumber);
  yield* exampleEffect;
});

NodeRuntime.runMain(
  main.pipe(Effect.provide(EdlinkConfig.Live))
);
