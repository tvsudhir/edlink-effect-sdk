/**
 * Pagination strategy selection and utilities
 */

import type { PaginationConfig } from '../../types/pagination.js';
import {
  isPaginateAll,
  isPaginateByPages,
  isPaginateByRecords,
  allStrategy,
  byPagesStrategy,
  byRecordsStrategy,
} from '../../types/pagination.js';
import type { PaginationStrategy } from './paginationStrategy.js';

/**
 * Select the appropriate pagination strategy based on the pagination config
 * This function acts as a discriminator to return the right strategy
 *
 * @param config - The pagination configuration
 * @returns The corresponding pagination strategy
 * @throws Error if config type is not recognized
 */
export const selectStrategy = (
  config: PaginationConfig
): PaginationStrategy<any> => {
  if (isPaginateByPages(config)) {
    return byPagesStrategy;
  }
  if (isPaginateByRecords(config)) {
    return byRecordsStrategy;
  }
  if (isPaginateAll(config)) {
    return allStrategy;
  }
  throw new Error(`Unknown pagination config type: ${JSON.stringify(config)}`);
};
