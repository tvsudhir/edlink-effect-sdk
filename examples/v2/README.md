/**
 * Edlink Effect SDK - V2 Examples
 *
 * This directory contains examples demonstrating different strategies
 * for fetching paginated data from the Edlink Graph API v2.
 *
 * ## Available Examples
 *
 * 1. **1-fetch-default-pages.ts** - Fetch with default 3-page limit
 *    - Strategy: Safe sampling
 *    - Use when: Quick testing, preview data
 *
 * 2. **2-fetch-all-data.ts** - Fetch all available data
 *    - Strategy: Unlimited fetching
 *    - Use when: Complete sync, reporting, backups
 *    - ⚠️ Warning: Can be slow on large datasets
 *
 * 3. **3-fetch-max-records.ts** - Fetch up to max record count
 *    - Strategy: Record-based limiting
 *    - Use when: Batch processing, predictable memory
 *
 * 4. **4-process-sequentially.ts** - Process items one-by-one
 *    - Strategy: Stream processing
 *    - Use when: Large datasets, memory-constrained
 *    - 💡 Most memory-efficient approach
 *
 * 5. **5-take-first-n-items.ts** - Take first N items only
 *    - Strategy: Sampling with early stopping
 *    - Use when: Preview, testing, quick samples
 *
 * 6. **6-fetch-people.ts** - Fetch people entity data
 *    - Strategy: Different entity type
 *    - Use when: Getting user/organizational data
 *
 * 7. **7-merge-streams.ts** - Combine multiple streams
 *    - Strategy: Concurrent multi-entity fetching
 *    - Use when: Processing multiple entities together
 *
 * 8. **8-compare-strategies.ts** - Compare all strategies
 *    - Strategy: Educational/benchmarking
 *    - Use when: Understanding trade-offs
 *
 * ## How to Run Examples
 *
 * From the project root:
 *
 * ```bash
 * # Run example 1 (default)
 * pnpm dev
 *
 * # Run specific example (e.g., example 3)
 * EXAMPLE=3 pnpm dev
 *
 * # Run example 8 to see strategy comparison
 * EXAMPLE=8 pnpm dev
 * ```
 *
 * ## Choosing the Right Strategy
 *
 * | Scenario | Strategy | Why |
 * |----------|----------|-----|
 * | Testing | default-pages | Fast, minimal API calls |
 * | Large sync | fetch-all | Need everything |
 * | Memory limit | max-records | Predictable memory |
 * | Huge datasets | process-sequentially | Only keep one item at a time |
 * | Quick preview | take-first-n | Early stopping |
 * | Multiple types | merge-streams | Process together |
 *
 * ## API Versions
 *
 * This directory (`v2/`) contains examples for Edlink Graph API v2.
 * Future versions will be in `v1/`, `v3/`, etc.
 *
 * All examples use the same Effect-Ts stream-based pattern,
 * making them easy to understand and adapt.
 */

export {};
