import { Effect } from 'effect';

/**
 * Configuration for Edlink API authentication
 * Loaded from environment variables
 */
export interface EdlinkConfig {
  readonly clientId: string;
  readonly clientSecret: string;
  readonly apiBaseUrl: string;
}

/**
 * Load Edlink configuration from environment variables
 * Throws an error if required environment variables are not set
 */
export const loadEdlinkConfig = (): Effect.Effect<EdlinkConfig, Error> =>
  Effect.gen(function* () {
    const clientId = yield* Effect.sync(() => process.env.EDLINK_CLIENT_ID).pipe(
      Effect.flatMap((value) =>
        value
          ? Effect.succeed(value)
          : Effect.fail(new Error('EDLINK_CLIENT_ID environment variable not set'))
      )
    );

    const clientSecret = yield* Effect.sync(() => process.env.EDLINK_CLIENT_SECRET).pipe(
      Effect.flatMap((value) =>
        value
          ? Effect.succeed(value)
          : Effect.fail(new Error('EDLINK_CLIENT_SECRET environment variable not set'))
      )
    );

    const apiBaseUrl = yield* Effect.sync(() => process.env.EDLINK_API_BASE_URL ?? 'https://ed.link/api');

    return {
      clientId,
      clientSecret,
      apiBaseUrl,
    } satisfies EdlinkConfig;
  });



