import { Effect, Context, Layer, Stream, Option, Secret } from 'effect';
import { HttpClient, HttpClientRequest } from '@effect/platform';
import { EdlinkConfig as EdlinkConfigService } from './config-service.js';
import type { EdlinkEvent, EdlinkPerson, EdlinkPaginatedResponse } from '../types/edlink.js';
import type { PaginationConfig } from '../types/pagination.js';
import { selectStrategy } from '../strategies/pagination/index.js';

/**
 * Edlink API Client service
 * Handles HTTP requests to the Edlink API with proper authentication and provides
 * Stream-based access to paginated data
 */
export class EdlinkClient extends Context.Tag('EdlinkClient')<
  EdlinkClient,
  {
    /**
     * Returns a Stream of Events from the Edlink Graph API
     * Defaults to fetching first 3 pages max
     *
     * @param config - Optional pagination configuration
     * @returns Stream of EdlinkEvent objects
     *
     * @example
     * // Fetch default 3 pages
     * const events = yield* getEventsStream();
     *
     * @example
     * // Fetch all available events
     * const events = yield* getEventsStream({ type: 'all' });
     *
     * @example
     * // Fetch max 500 records
     * const events = yield* getEventsStream({ type: 'records', maxRecords: 500 });
     */
    readonly getEventsStream: (
      config?: PaginationConfig
    ) => Stream.Stream<EdlinkEvent, Error>;

    /**
     * Returns a Stream of People from the Edlink Graph API
     * Defaults to fetching first 3 pages max
     *
     * @param config - Optional pagination configuration
     * @returns Stream of EdlinkPerson objects
     *
     * @example
     * // Fetch default 3 pages
     * const people = yield* getPeopleStream();
     *
     * @example
     * // Fetch all available people
     * const people = yield* getPeopleStream({ type: 'all' });
     *
     * @example
     * // Fetch max 1000 records
     * const people = yield* getPeopleStream({ type: 'records', maxRecords: 1000 });
     */
    readonly getPeopleStream: (
      config?: PaginationConfig
    ) => Stream.Stream<EdlinkPerson, Error>;
  }
>() {}

/**
 * Create an Edlink client service from configuration
 * Depends on EdlinkConfig service (injected via context)
 */
const makeEdlinkClient: Effect.Effect<
  {
    readonly getEventsStream: (
      config?: PaginationConfig
    ) => Stream.Stream<EdlinkEvent, Error>;
    readonly getPeopleStream: (
      config?: PaginationConfig
    ) => Stream.Stream<EdlinkPerson, Error>;
  },
  never,
  EdlinkConfigService | HttpClient.HttpClient
> = Effect.gen(function* () {
  // Inject dependencies from context
  const edlinkConfig = yield* EdlinkConfigService;
  const httpClient = (yield* HttpClient.HttpClient).pipe(
    HttpClient.filterStatusOk
  );

  // Extract secret value for authentication
  const clientSecret = Secret.value(edlinkConfig.clientSecret);

  // Create default pagination config from the loaded configuration
  const defaultPaginationConfig: PaginationConfig = {
    type: 'pages',
    maxPages: edlinkConfig.defaultMaxPages,
  };

  /**
   * Creates a paginated stream for a given endpoint using cursor-based pagination
   * This function is defined inside Effect.gen so it can capture httpClient
   */
  const createPaginatedStream = <T,>(
    path: string,
    paginationConfig: PaginationConfig = defaultPaginationConfig
  ): Stream.Stream<T, Error> => {
    // Select the appropriate pagination strategy for this config
    const strategy = selectStrategy(paginationConfig);

    return Stream.unfoldEffect(
      {
        nextUrl: `${edlinkConfig.apiBaseUrl}/v2/graph${path}`,
        pageCount: 0,
        recordCount: 0,
      },
      (state) =>
        Effect.gen(function* () {
          // If there's no nextUrl, terminate the unfold immediately
          if (!state.nextUrl) {
            return Option.none();
          }

          // Check pagination limits using the strategy
          if (!strategy.shouldContinue(state, paginationConfig)) {
            return Option.none();
          }

          // Fetch current page from Edlink API
          const req = HttpClientRequest.get(state.nextUrl).pipe(
            HttpClientRequest.bearerToken(clientSecret)
          );

          // Errors naturally propagate through yield* - no Effect.try needed
          const response = yield* httpClient.execute(req);
          const pageDataUntyped = yield* response.json;
          const pageData = pageDataUntyped as EdlinkPaginatedResponse<T>;

          // Extract items from this page
          const items = pageData.$data || [];
          const nextCursor = pageData.$next;

          if (!items || items.length === 0) {
            return Option.none();
          }

          // Use strategy to calculate which items to emit
          const itemsToEmit = strategy.calculateItemsToEmit(
            items,
            state,
            paginationConfig
          ) as T[];
          const newRecordCount = state.recordCount + itemsToEmit.length;

          // Determine next URL using strategy
          const nextUrl = strategy.getNextUrl(nextCursor, newRecordCount, paginationConfig);

          // Update state and return items with next URL
          const nextState = strategy.updateState(state, items.length, paginationConfig);
          return Option.some([
            itemsToEmit,
            { ...nextState, nextUrl },
          ] as const);
        })
    ).pipe(
      // Flatten the array of items into individual stream emissions
      Stream.flatMap((items) => Stream.fromIterable(items)),
      // Map any errors to standardized Error type
      Stream.mapError((error) => 
        new Error(
          `Failed to fetch from Edlink API: ${error instanceof Error ? error.message : String(error)}`
        )
      )
    );
  };

  return {
    getEventsStream: (paginationConfig?: PaginationConfig) =>
      createPaginatedStream<EdlinkEvent>('/events', paginationConfig),
    getPeopleStream: (paginationConfig?: PaginationConfig) =>
      createPaginatedStream<EdlinkPerson>('/people', paginationConfig),
  };
});

/**
 * Create an Edlink client layer
 * 
 * Dependencies:
 * - EdlinkConfig: The configuration service (injected automatically if EdlinkConfig.Live is provided)
 * - HttpClient: The HTTP client (injected automatically)
 */
export const EdlinkClientLive: Layer.Layer<EdlinkClient, never, EdlinkConfigService | HttpClient.HttpClient> =
  Layer.effect(EdlinkClient, makeEdlinkClient);

/**
 * @deprecated Use EdlinkClientLive instead
 * Create an Edlink client layer from configuration parameter
 * 
 * This is provided for backward compatibility. New code should use EdlinkClientLive
 * and ensure EdlinkConfig.Live is provided as a dependency.
 */
export const makeEdlinkClientLayer = (config: any): Layer.Layer<EdlinkClient, never, HttpClient.HttpClient> =>
  Layer.effect(EdlinkClient, Effect.succeed({
    getEventsStream: (paginationConfig?: PaginationConfig) => {
      const defaultPaginationConfig: PaginationConfig = {
        type: 'pages',
        maxPages: config.defaultMaxPages,
      };

      return Stream.unfoldEffect(
        {
          nextUrl: `${config.apiBaseUrl}/v2/graph/events`,
          pageCount: 0,
          recordCount: 0,
        },
        (state) =>
          Effect.gen(function* () {
            if (!state.nextUrl) {
              return Option.none();
            }

            if (
              paginationConfig?.type === 'pages' &&
              state.pageCount >= (paginationConfig?.maxPages || defaultPaginationConfig.maxPages)
            ) {
              return Option.none();
            }

            if (
              paginationConfig?.type === 'records' &&
              state.recordCount >= (paginationConfig?.maxRecords || 0)
            ) {
              return Option.none();
            }

            yield* Effect.logError('makeEdlinkClientLayer is deprecated. Use EdlinkClientLive instead.');
            return Option.none();
          })
      );
    },
    getPeopleStream: (paginationConfig?: PaginationConfig) => {
      return Stream.unfoldEffect(
        {
          nextUrl: `${config.apiBaseUrl}/v2/graph/people`,
          pageCount: 0,
          recordCount: 0,
        },
        (state) =>
          Effect.gen(function* () {
            if (!state.nextUrl) {
              return Option.none();
            }

            yield* Effect.logError('makeEdlinkClientLayer is deprecated. Use EdlinkClientLive instead.');
            return Option.none();
          })
      );
    },
  }));



