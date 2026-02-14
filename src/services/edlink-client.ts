import { Effect, Context, Layer } from 'effect';
import { HttpClient, HttpClientRequest } from '@effect/platform';
import type { EdlinkConfig } from '../config.js';

/**
 * Edlink API Client service
 * Handles HTTP requests to the Edlink API with proper authentication
 */
export class EdlinkClient extends Context.Tag('EdlinkClient')<
  EdlinkClient,
  {
    readonly getEvents: () => Effect.Effect<unknown, Error>;
    readonly getPeople: () => Effect.Effect<unknown, Error>;
  }
>() {}

/**
 * Create an Edlink client service from configuration
 */
const makeEdlinkClient = (config: EdlinkConfig) =>
  Effect.gen(function* () {
    const httpClient = (yield* HttpClient.HttpClient).pipe(
      HttpClient.filterStatusOk
    );

    const makeRequest = (path: string) =>
      HttpClientRequest.get(`${config.apiBaseUrl}/v2/graph${path}`).pipe(
        HttpClientRequest.bearerToken(config.clientSecret)
      );

    return {
      getEvents: () =>
        Effect.gen(function* () {
          const req = makeRequest('/events');
          const response = yield* httpClient.execute(req);
          const data = yield* response.json;
          return data;
        }).pipe(
          Effect.mapError(() => new Error('Failed to fetch events'))
        ),

      getPeople: () =>
        Effect.gen(function* () {
          const req = makeRequest('/people');
          const response = yield* httpClient.execute(req);
          const data = yield* response.json;
          return data;
        }).pipe(
          Effect.mapError(() => new Error('Failed to fetch people'))
        ),
    };
  });

/**
 * Create an Edlink client layer from configuration
 */
export const makeEdlinkClientLayer = (config: EdlinkConfig): Layer.Layer<EdlinkClient, Error, HttpClient.HttpClient> =>
  Layer.effect(EdlinkClient, makeEdlinkClient(config));



