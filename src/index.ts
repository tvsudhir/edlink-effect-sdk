// Load .env.local before any Effect-TS code runs
import './env-loader.js';

import { Effect } from 'effect';
import { NodeRuntime } from '@effect/platform-node';
import { EdlinkConfig } from './services/config-service.js';

// Static imports for examples (no dynamic imports)
import example1 from '../examples/v2/1-fetch-default-pages';
import example2 from '../examples/v2/2-fetch-all-data';
import example3 from '../examples/v2/3-fetch-max-records';
import example4 from '../examples/v2/4-process-sequentially';
import example5 from '../examples/v2/5-take-first-n-items';
import example6 from '../examples/v2/6-fetch-people';
import example7 from '../examples/v2/7-merge-streams';
import example8 from '../examples/v2/8-compare-strategies';

/**
 * Example selector: Choose which example to run
 * Set the EXAMPLE environment variable (1-8) to run different examples
 * Environment variables will be loaded from .env.local first (if it exists),
 * then from process.env
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

/**
 * Map of example numbers to their modules
 * Simple direct lookup instead of switch statement
 */
const examplesMap: Record<number, any> = {
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
 * Uses Effect pattern to handle invalid example numbers as failures
 */
const loadExampleModule = Effect.fn((exampleNumber: number) =>
  examplesMap[exampleNumber]
    ? Effect.succeed(examplesMap[exampleNumber])
    : Effect.fail(
        new Error(`Invalid example number: ${exampleNumber}. Choose 1-8.`)
      )
);

/**
 * Main entry point - loads and runs the selected example
 * Configuration is injected via the EdlinkConfig context (no manual process.env access)
 */
const main = Effect.gen(function* () {
  // Read example number from typed, validated configuration
  const config = yield* EdlinkConfig;
  const exampleNumber = config.exampleNumber;

  yield* Effect.logInfo('🎯 Edlink Effect SDK - Examples');
  yield* Effect.logInfo(`📌 Running Example ${exampleNumber}`);
  yield* Effect.logInfo('---');

  // Load the example module and run it
  const exampleEffect = yield* loadExampleModule(exampleNumber);
  yield* (exampleEffect as any);
});

/**
 * Runtime entry point - runs the main effect
 */
NodeRuntime.runMain(main.pipe(Effect.provide(EdlinkConfig.Live)) as Effect.Effect<void, never, never>);
