import { Effect, Context, Layer, Stream, Option } from 'effect';
import { HttpClient, HttpClientRequest } from '@effect/platform';
import type { EdlinkConfig } from '../config.js';
import type { EdlinkEvent, EdlinkPerson, EdlinkPaginatedResponse } from '../types/edlink.js';
import type { PaginationConfig } from '../types/pagination.js';

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
 */
const makeEdlinkClient = (config: EdlinkConfig) =>
  Effect.gen(function* () {
    const httpClient = (yield* HttpClient.HttpClient).pipe(
      HttpClient.filterStatusOk
    );

    // Create default pagination config from the loaded configuration
    const defaultPaginationConfig: PaginationConfig = {
      type: 'pages',
      maxPages: config.defaultMaxPages,
    };

    /**
     * Creates a paginated stream for a given endpoint using cursor-based pagination
     * This function is defined inside Effect.gen so it can capture httpClient
     */
    const createPaginatedStream = <T,>(
      path: string,
      paginationConfig: PaginationConfig = defaultPaginationConfig
    ): Stream.Stream<T, Error> => {
      return Stream.unfoldEffect(
        {
          nextUrl: `${config.apiBaseUrl}/v2/graph${path}`,
          pageCount: 0,
          recordCount: 0,
        },
        (state) =>
          Effect.gen(function* () {
            // If there's no nextUrl, terminate the unfold immediately
            if (!state.nextUrl) {
              return Option.none();
            }

            // Check pagination limits before fetching
            if (
              paginationConfig.type === 'pages' &&
              state.pageCount >= paginationConfig.maxPages
            ) {
              return Option.none();
            }

            if (
              paginationConfig.type === 'records' &&
              state.recordCount >= paginationConfig.maxRecords
            ) {
              return Option.none();
            }

            try {
              // Fetch current page from Edlink API
              const req = HttpClientRequest.get(state.nextUrl).pipe(
                HttpClientRequest.bearerToken(config.clientSecret)
              );

              const response = yield* httpClient.execute(req);
              const pageDataUntyped = yield* response.json;
              const pageData = pageDataUntyped as EdlinkPaginatedResponse<T>;

              // Extract items from this page
              const items = pageData.$data || [];
              const nextCursor = pageData.$next;

              if (!items || items.length === 0) {
                return Option.none();
              }

              // Calculate how many records to emit from this page
              let itemsToEmit = items;
              let newRecordCount = state.recordCount + items.length;

              if (
                paginationConfig.type === 'records' &&
                newRecordCount > paginationConfig.maxRecords
              ) {
                const itemsAllowed =
                  paginationConfig.maxRecords - state.recordCount;
                itemsToEmit = items.slice(0, itemsAllowed);
                newRecordCount = paginationConfig.maxRecords;
              }

              // Check if there's a next page to fetch
              const hasNextPage =
                nextCursor != null &&
                (paginationConfig.type !== 'pages' ||
                  state.pageCount + 1 < paginationConfig.maxPages) &&
                (paginationConfig.type !== 'records' ||
                  newRecordCount < paginationConfig.maxRecords);

              // Return current items with next state if there are more pages
              if (hasNextPage) {
                const nextState = {
                  nextUrl: nextCursor,
                  pageCount: state.pageCount + 1,
                  recordCount: newRecordCount,
                };
                // Emit items and continue with nextState
                return Option.some([itemsToEmit, nextState] as const);
              } else {
                // Last page - emit items and set nextUrl to falsy so next iteration stops
                const lastState = {
                  nextUrl: '',
                  pageCount: state.pageCount + 1,
                  recordCount: newRecordCount,
                };
                return Option.some([itemsToEmit, lastState] as const);
              }
            } catch (error) {
              throw new Error(
                `Failed to fetch from ${state.nextUrl}: ${error instanceof Error ? error.message : String(error)}`
              );
            }
          })
      ).pipe(
        // Flatten the array of items into individual stream emissions,
        // and map errors from HttpClientError to Error
        Stream.flatMap((items) => Stream.fromIterable(items)),
        Stream.mapError(() => new Error('Failed to fetch from Edlink API'))
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
 * Create an Edlink client layer from configuration
 */
export const makeEdlinkClientLayer = (config: EdlinkConfig): Layer.Layer<EdlinkClient, Error, HttpClient.HttpClient> =>
  Layer.effect(EdlinkClient, makeEdlinkClient(config));



