import { Effect, Context, Layer, Stream, Option, Secret, Data } from 'effect';
import { HttpClient, HttpClientRequest } from '@effect/platform';
import { EdlinkConfig } from './config-service.js';
import type { EdlinkEvent, EdlinkPerson, EdlinkPaginatedResponse } from '../types/edlink.js';
import type { PaginationConfig } from '../types/pagination.js';

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

/** Typed error for Edlink API failures */
export class EdlinkApiError extends Data.TaggedError('EdlinkApiError')<{
  readonly message: string;
  readonly cause?: unknown;
}> {}

// ---------------------------------------------------------------------------
// Service interface
// ---------------------------------------------------------------------------

/**
 * Edlink API Client service
 *
 * Provides Stream-based access to paginated Edlink Graph API data.
 * Streams are lazy — pages are only fetched as downstream consumers demand items.
 */
export class EdlinkClient extends Context.Tag('EdlinkClient')<
  EdlinkClient,
  {
    /** Stream of Events from the Edlink Graph API */
    readonly getEventsStream: (
      config?: PaginationConfig
    ) => Stream.Stream<EdlinkEvent, EdlinkApiError>;

    /** Stream of People from the Edlink Graph API */
    readonly getPeopleStream: (
      config?: PaginationConfig
    ) => Stream.Stream<EdlinkPerson, EdlinkApiError>;
  }
>() {}

// ---------------------------------------------------------------------------
// Pagination helpers (pure functions, no strategy objects needed)
// ---------------------------------------------------------------------------

interface PaginationState {
  readonly nextUrl: string;
  readonly pageCount: number;
  readonly recordCount: number;
}

/** Should we fetch the next page? */
const shouldContinue = (state: PaginationState, config: PaginationConfig): boolean => {
  switch (config.type) {
    case 'all':
      return true;
    case 'pages':
      return state.pageCount < config.maxPages;
    case 'records':
      return state.recordCount < config.maxRecords;
  }
};

/** Slice items if we'd exceed the record limit, otherwise pass through */
const trimItems = <T>(items: readonly T[], state: PaginationState, config: PaginationConfig): readonly T[] => {
  if (config.type !== 'records') return items;
  const remaining = config.maxRecords - state.recordCount;
  return items.length <= remaining ? items : items.slice(0, remaining);
};

/** Determine the next URL (empty string = stop) */
const nextUrl = (cursor: string | null, newRecordCount: number, config: PaginationConfig): string => {
  if (!cursor) return '';
  if (config.type === 'records' && newRecordCount >= config.maxRecords) return '';
  return cursor;
};

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

/**
 * Build the live EdlinkClient from injected dependencies.
 */
const makeEdlinkClient = Effect.gen(function* () {
  const edlinkConfig = yield* EdlinkConfig;
  const httpClient = (yield* HttpClient.HttpClient).pipe(HttpClient.filterStatusOk);

  const defaultConfig: PaginationConfig = {
    type: 'pages',
    maxPages: edlinkConfig.defaultMaxPages,
  };

  /**
   * Creates a paginated Stream for a given API path using cursor-based pagination.
   * Pagination logic is inlined — no strategy objects needed.
   */
  const createPaginatedStream = <T>(
    path: string,
    paginationConfig: PaginationConfig = defaultConfig,
  ): Stream.Stream<T, EdlinkApiError> =>
    Stream.unfoldEffect(
      { nextUrl: `${edlinkConfig.apiBaseUrl}/v2/graph${path}`, pageCount: 0, recordCount: 0 } as PaginationState,
      (state: PaginationState) =>
        Effect.gen(function* () {
          if (!state.nextUrl || !shouldContinue(state, paginationConfig)) {
            return Option.none<readonly [readonly T[], PaginationState]>();
          }

          const req = HttpClientRequest.get(state.nextUrl).pipe(
            HttpClientRequest.bearerToken(Secret.value(edlinkConfig.clientSecret))
          );

          const response = yield* httpClient.execute(req);
          const pageData = (yield* response.json) as EdlinkPaginatedResponse<T>;
          const items = pageData.$data ?? [];

          if (items.length === 0) {
            return Option.none<readonly [readonly T[], PaginationState]>();
          }

          const itemsToEmit = trimItems(items, state, paginationConfig);
          const newRecordCount = state.recordCount + itemsToEmit.length;

          const next: PaginationState = {
            nextUrl: nextUrl(pageData.$next, newRecordCount, paginationConfig),
            pageCount: state.pageCount + 1,
            recordCount: newRecordCount,
          };

          return Option.some([itemsToEmit, next] as const);
        }),
    ).pipe(
      Stream.flatMap((items) => Stream.fromIterable(items)),
      Stream.mapError((error) =>
        new EdlinkApiError({
          message: `Failed to fetch from Edlink API: ${error instanceof Error ? error.message : String(error)}`,
          cause: error,
        })
      ),
    );

  return {
    getEventsStream: (config?: PaginationConfig) =>
      createPaginatedStream<EdlinkEvent>('/events', config),
    getPeopleStream: (config?: PaginationConfig) =>
      createPaginatedStream<EdlinkPerson>('/people', config),
  };
});

// ---------------------------------------------------------------------------
// Layer
// ---------------------------------------------------------------------------

/**
 * Live layer for EdlinkClient.
 *
 * Dependencies: EdlinkConfig, HttpClient
 */
export const EdlinkClientLive: Layer.Layer<EdlinkClient, never, EdlinkConfig | HttpClient.HttpClient> =
  Layer.effect(EdlinkClient, makeEdlinkClient);



