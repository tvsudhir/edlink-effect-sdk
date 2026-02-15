import { Effect, Config } from 'effect';
import { NodeRuntime } from '@effect/platform-node';
import { EdlinkConfig } from './services/config-service.js';
import * as fs from 'fs';
import * as path from 'path';

// Load .env.local before any Effect-TS code runs
try {
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8');
    const lines = content.split('\n');
    for (const line of lines) {
      if (line.trim() && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        if (key) {
          const value = valueParts.join('=').trim();
          // Remove quotes if present
          const cleanValue = value.replace(/^["']|["']$/g, '');
          process.env[key.trim()] = cleanValue;
        }
      }
    }
  }
} catch {
  // Silently ignore if we can't load .env.local
}

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
  return mod as Effect.Effect<void>;
}

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
  ),
  // Provide the configuration layer so dependencies are satisfied
  Effect.provide(EdlinkConfig.Live)
);

/**
 * Runtime entry point - runs the main effect
 */
NodeRuntime.runMain(main);
