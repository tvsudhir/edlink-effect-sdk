/**
 * Configuration options for paginating through Edlink API results
 * 
 * This module defines and re-exports pagination types and strategies from their dedicated submodules:
 * - pages.ts: PaginateByPages type + byPagesStrategy
 * - records.ts: PaginateByRecords type + byRecordsStrategy
 * - all.ts: PaginateAll type + allStrategy
 */

export { 
  type PaginateByPages,
  isPaginateByPages,
  byPagesStrategy,
} from './pagination/pages.js';

export { 
  type PaginateByRecords,
  isPaginateByRecords,
  byRecordsStrategy,
} from './pagination/records.js';

export { 
  type PaginateAll,
  isPaginateAll,
  allStrategy,
} from './pagination/all.js';

/**
 * Re-import types for the union definition below
 */
import type { PaginateByPages } from './pagination/pages.js';
import type { PaginateByRecords } from './pagination/records.js';
import type { PaginateAll } from './pagination/all.js';

/**
 * Pagination configuration for Stream operations
 *
 * @example
 * // Fetch max 3 pages (default)
 * const config: PaginationConfig = { type: 'pages', maxPages: 3 };
 *
 * @example
 * // Fetch max 1000 records
 * const config: PaginationConfig = { type: 'records', maxRecords: 1000 };
 *
 * @example
 * // Fetch all available records
 * const config: PaginationConfig = { type: 'all' };
 */
export type PaginationConfig = 
  | PaginateByPages
  | PaginateByRecords
  | PaginateAll;
