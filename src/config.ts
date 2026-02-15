import { Effect } from 'effect';

/**
 * Configuration for Edlink API authentication
 * Loaded from environment variables
 */
export interface EdlinkConfig {
  readonly clientId: string;
  readonly clientSecret: string;
  readonly apiBaseUrl: string;
  readonly defaultMaxPages: number;
}

/**
 * Load Edlink configuration from environment variables
 * 
 * Required environment variables:
 * - EDLINK_CLIENT_ID
 * - EDLINK_CLIENT_SECRET
 * 
 * Optional environment variables:
 * - EDLINK_API_BASE_URL (defaults to 'https://ed.link/api')
 * - EDLINK_DEFAULT_MAX_PAGES (defaults to 3)
 */
export const loadEdlinkConfig = (): Effect.Effect<EdlinkConfig, Error> =>
  Effect.gen(function* () {
    // Read required client ID
    const clientId = yield* Effect.sync(() => process.env.EDLINK_CLIENT_ID).pipe(
      Effect.flatMap((value) =>
        value
          ? Effect.succeed(value)
          : Effect.fail(new Error('EDLINK_CLIENT_ID environment variable not set'))
      )
    );

    // Read required client secret
    const clientSecret = yield* Effect.sync(() => process.env.EDLINK_CLIENT_SECRET).pipe(
      Effect.flatMap((value) =>
        value
          ? Effect.succeed(value)
          : Effect.fail(new Error('EDLINK_CLIENT_SECRET environment variable not set'))
      )
    );

    // Read optional API base URL with default
    const apiBaseUrl = yield* Effect.sync(() => 
      process.env.EDLINK_API_BASE_URL ?? 'https://ed.link/api'
    );

    // Read optional default max pages with validation and default
    const defaultMaxPages = yield* Effect.sync(() => {
      const raw = process.env.EDLINK_DEFAULT_MAX_PAGES;
      if (!raw) return 3;
      const parsed = parseInt(raw, 10);
      return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 3;
    });

    return {
      clientId,
      clientSecret,
      apiBaseUrl,
      defaultMaxPages,
    } satisfies EdlinkConfig;
  });




