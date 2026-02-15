/**
 * Configuration options for paginating through Edlink API results
 */

/**
 * Limit pagination to a specific number of pages
 */
export interface PaginateByPages {
  type: 'pages';
  /** Maximum number of pages to fetch */
  maxPages: number;
}

/**
 * Limit pagination to a specific number of records
 */
export interface PaginateByRecords {
  type: 'records';
  /** Maximum number of records to fetch */
  maxRecords: number;
}

/**
 * Fetch all available records (no limit)
 */
export interface PaginateAll {
  type: 'all';
}

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
export type PaginationConfig = PaginateByPages | PaginateByRecords | PaginateAll;
