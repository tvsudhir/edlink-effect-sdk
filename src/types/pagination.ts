/**
 * Pagination configuration types for Edlink API Stream operations
 *
 * Uses a discriminated union on the `type` field for exhaustive pattern matching.
 */

/** Limit pagination to a specific number of pages */
export interface PaginateByPages {
  readonly type: 'pages';
  readonly maxPages: number;
}

/** Limit pagination to a specific number of records (may stop mid-page) */
export interface PaginateByRecords {
  readonly type: 'records';
  readonly maxRecords: number;
}

/** Fetch all available records with no limit */
export interface PaginateAll {
  readonly type: 'all';
}

/**
 * Pagination configuration — discriminated union
 *
 * @example
 * // Fetch max 3 pages (default)
 * const config: PaginationConfig = { type: 'pages', maxPages: 3 };
 *
 * @example
 * // Fetch max 500 records
 * const config: PaginationConfig = { type: 'records', maxRecords: 500 };
 *
 * @example
 * // Fetch everything
 * const config: PaginationConfig = { type: 'all' };
 */
export type PaginationConfig = PaginateByPages | PaginateByRecords | PaginateAll;
