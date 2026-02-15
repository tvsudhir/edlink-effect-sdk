/**
 * Base types and interfaces for pagination strategies
 */

/**
 * State tracked during pagination traversal
 */
export interface PaginationState {
  readonly nextUrl: string;
  readonly pageCount: number;
  readonly recordCount: number;
}

/**
 * Generic pagination strategy interface
 * Strategies encapsulate pagination logic for different strategies
 */
export interface PaginationStrategy<T> {
  /**
   * Determine if we should fetch the next page based on current state and config
   */
  readonly shouldContinue: (state: PaginationState, config: T) => boolean;

  /**
   * Update the pagination state after fetching a page
   * Used to increment page/record counts
   */
  readonly updateState: (
    state: PaginationState,
    itemCount: number,
    config: T
  ) => PaginationState;

  /**
   * Calculate which items to emit from the current page
   * For records-based pagination, this may slice the array to respect max record limits
   */
  readonly calculateItemsToEmit: (
    items: readonly unknown[],
    state: PaginationState,
    config: T
  ) => readonly unknown[];

  /**
   * Check if pagination should stop after this page's items
   * Useful for detecting when we've reached record limits mid-page
   */
  readonly shouldStopAfterPage: (
    newRecordCount: number,
    config: T
  ) => boolean;

  /**
   * Determine the next URL to fetch, or empty string to stop pagination
   * Encapsulates the logic of whether to continue with the next cursor or halt
   */
  readonly getNextUrl: (
    nextCursor: string | null,
    newRecordCount: number,
    config: T
  ) => string;
}
