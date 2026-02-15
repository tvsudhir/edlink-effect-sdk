import { config } from 'dotenv';
import { Effect } from 'effect';
import { NodeRuntime } from '@effect/platform-node';

// Static imports for examples (no dynamic imports)
import example1 from '../examples/v2/1-fetch-default-pages';
import example2 from '../examples/v2/2-fetch-all-data';
import example3 from '../examples/v2/3-fetch-max-records';
import example4 from '../examples/v2/4-process-sequentially';
import example5 from '../examples/v2/5-take-first-n-items';
import example6 from '../examples/v2/6-fetch-people';
import example7 from '../examples/v2/7-merge-streams';
import example8 from '../examples/v2/8-compare-strategies';

// Load environment variables from .env.local
config({ path: '.env.local' });

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

/**
 * Safely read and parse the EXAMPLE configuration from environment
 */
const readExampleNumber = (): Effect.Effect<number> =>
  Effect.sync(() => {
    const raw = process.env.EXAMPLE || '1';
    const parsed = parseInt(raw, 10);
    if (!Number.isFinite(parsed) || parsed < 1 || parsed > 8) {
      return 1; // Default to example 1
    }
    return parsed;
  });

/**
 * Dynamically load an example module
 */
async function loadExampleModule(exampleNumber: number) {
  const exampleNames = [
    '1-fetch-default-pages',
    '2-fetch-all-data',
    '3-fetch-max-records',
    '4-process-sequentially',
    '5-take-first-n-items',
    '6-fetch-people',
    '7-merge-streams',
    '8-compare-strategies',
  ];

  const exampleName = exampleNames[exampleNumber - 1];
  if (!exampleName) {
    throw new Error(
      `Invalid example number: ${exampleNumber}. Choose 1-8.`
    );
  }
  const examples: any[] = [
    example1,
    example2,
    example3,
    example4,
    example5,
    example6,
    example7,
    example8,
  ];

  const mod = examples[exampleNumber - 1];
  if (!mod) throw new Error(`Example module not found for ${exampleName}`);
  return mod as Effect.Effect<void, unknown>;
}

/**
 * Main entry point - loads and runs the selected example
 */
const main = Effect.gen(function* () {
  const exampleNumber = yield* readExampleNumber();
  
  yield* Effect.logInfo('🎯 Edlink Effect SDK - Examples');
  yield* Effect.logInfo(`📌 Running Example ${exampleNumber}`);
  yield* Effect.logInfo('---');

  try {
    // Load the example module dynamically
    const exampleEffect = yield* Effect.tryPromise({
      try: () => loadExampleModule(exampleNumber),
      catch: (error) => new Error(`Failed to load example: ${error}`),
    });

    // Run the example effect
    yield* exampleEffect;
  } catch (error) {
    yield* Effect.logError('Error running example:', error);
    throw error;
  }
}).pipe(
  Effect.catchAll((error) =>
    Effect.logError(`Fatal error: ${error}`).pipe(Effect.andThen(() =>
      Effect.fail(error)
    ))
  )
);

/**
 * Runtime entry point - runs the main effect
 */
NodeRuntime.runMain(main);

