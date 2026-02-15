/**
 * Pagination configuration and strategy for limiting by record count
 */

import type { PaginationState, PaginationStrategy } from '../../strategies/pagination/paginationStrategy.js';

/**
 * Limit pagination to a specific number of records
 */
export interface PaginateByRecords {
  type: 'records';
  /** Maximum number of records to fetch */
  maxRecords: number;
}

/**
 * Type guard to check if pagination config is PaginateByRecords
 * @param config - The pagination configuration to check
 * @returns true if the config is a PaginateByRecords configuration
 */
export const isPaginateByRecords = (
  config: unknown
): config is PaginateByRecords => {
  return (
    typeof config === 'object' &&
    config !== null &&
    (config as Record<string, unknown>).type === 'records' &&
    typeof (config as Record<string, unknown>).maxRecords === 'number'
  );
};

/**
 * Strategy for paginating by a maximum number of records
 * May stop mid-page if record limit is reached
 */
export const byRecordsStrategy: PaginationStrategy<PaginateByRecords> = {
  shouldContinue: (state: PaginationState, config: PaginateByRecords): boolean =>
    state.recordCount < config.maxRecords,

  updateState: (
    state: PaginationState,
    itemCount: number
  ): PaginationState => ({
    nextUrl: state.nextUrl,
    pageCount: state.pageCount + 1,
    recordCount: state.recordCount + itemCount,
  }),

  calculateItemsToEmit: (
    items: readonly unknown[],
    state: PaginationState,
    config: PaginateByRecords
  ): readonly unknown[] => {
    const newRecordCount = state.recordCount + items.length;

    // If we haven't exceeded the limit, return all items
    if (newRecordCount <= config.maxRecords) {
      return items;
    }

    // Otherwise, slice to only return items up to the limit
    const itemsAllowed = config.maxRecords - state.recordCount;
    return items.slice(0, itemsAllowed);
  },

  shouldStopAfterPage: (
    newRecordCount: number,
    config: PaginateByRecords
  ): boolean => newRecordCount >= config.maxRecords,

  getNextUrl: (
    nextCursor: string | null,
    newRecordCount: number,
    config: PaginateByRecords
  ): string => {
    // Stop if we've reached the record limit or no next cursor
    if (newRecordCount >= config.maxRecords || !nextCursor) {
      return '';
    }
    return nextCursor;
  },
};
