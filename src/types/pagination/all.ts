/**
 * Pagination configuration and strategy for fetching all available records
 */

import type { PaginationState, PaginationStrategy } from '../../strategies/pagination/paginationStrategy.js';

/**
 * Fetch all available records (no limit)
 */
export interface PaginateAll {
  type: 'all';
}

/**
 * Type guard to check if pagination config is PaginateAll
 * @param config - The pagination configuration to check
 * @returns true if the config is a PaginateAll configuration
 */
export const isPaginateAll = (config: unknown): config is PaginateAll => {
  return (
    typeof config === 'object' &&
    config !== null &&
    (config as Record<string, unknown>).type === 'all'
  );
};

/**
 * Strategy for paginating through all available records without limits
 * Continues fetching as long as the API provides more data
 */
export const allStrategy: PaginationStrategy<PaginateAll> = {
  shouldContinue: (): boolean => true,

  updateState: (
    state: PaginationState,
    itemCount: number
  ): PaginationState => ({
    nextUrl: state.nextUrl,
    pageCount: state.pageCount + 1,
    recordCount: state.recordCount + itemCount,
  }),

  calculateItemsToEmit: (
    items: readonly unknown[]
  ): readonly unknown[] => items,

  shouldStopAfterPage: (): boolean => false,

  getNextUrl: (nextCursor: string | null): string =>
    nextCursor ?? '',
};
