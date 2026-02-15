/**
 * Pagination configuration and strategy for limiting by page count
 */

import type { PaginationState, PaginationStrategy } from '../../strategies/pagination/paginationStrategy.js';

/**
 * Limit pagination to a specific number of pages
 */
export interface PaginateByPages {
  type: 'pages';
  /** Maximum number of pages to fetch */
  maxPages: number;
}

/**
 * Type guard to check if pagination config is PaginateByPages
 * @param config - The pagination configuration to check
 * @returns true if the config is a PaginateByPages configuration
 */
export const isPaginateByPages = (
  config: unknown
): config is PaginateByPages => {
  return (
    typeof config === 'object' &&
    config !== null &&
    (config as Record<string, unknown>).type === 'pages' &&
    typeof (config as Record<string, unknown>).maxPages === 'number'
  );
};

/**
 * Strategy for paginating by a maximum number of pages
 * Stops fetching when maxPages is reached, regardless of record count
 */
export const byPagesStrategy: PaginationStrategy<PaginateByPages> = {
  shouldContinue: (state: PaginationState, config: PaginateByPages): boolean =>
    state.pageCount < config.maxPages,

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
