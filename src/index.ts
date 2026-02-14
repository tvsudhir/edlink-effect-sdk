import { config } from 'dotenv';
import { Effect, Layer } from 'effect';
import { FetchHttpClient, HttpClient, HttpClientRequest } from '@effect/platform';
import { NodeRuntime } from '@effect/platform-node';
import { loadEdlinkConfig } from './config';

// Load environment variables from .env.local
config({ path: '.env.local' });

/**
 * Main application setup
 */
const main = Effect.gen(function* () {
  // Load configuration from environment variables
  const config = yield* loadEdlinkConfig();

  yield* Effect.logInfo('Edlink SDK initialized with config:', {
    clientId: config.clientId.substring(0, 8) + '...',
    apiBaseUrl: config.apiBaseUrl,
  });

  // Get the HTTP client
  const httpClient = (yield* HttpClient.HttpClient).pipe(
    HttpClient.filterStatusOk
  );

  // Example: Fetch events from Edlink API
  yield* Effect.logInfo('Fetching events from Edlink API...');

  const eventRequest = HttpClientRequest.get(
    `${config.apiBaseUrl}/v2/graph/events`
  ).pipe(HttpClientRequest.bearerToken(config.clientSecret));

  const response = yield* httpClient.execute(eventRequest);
  const events = yield* response.json;

  yield* Effect.logInfo('Events retrieved successfully:', events);
});

// Run the application with FetchHttpClient provider
NodeRuntime.runMain(
  main.pipe(
    Effect.provide(FetchHttpClient.layer),
    Effect.catchAllCause((cause) =>
      Effect.gen(function* () {
        yield* Effect.logError('Application error:', cause);
      })
    )
  )
);

