import { Config, Context, Effect, Layer, Secret } from 'effect';

/**
 * Type-safe Edlink configuration shape
 * Matches the existing EdlinkConfig interface but will be loaded via Effect's Config system
 */
export interface EdlinkConfigData {
  readonly clientId: string;
  readonly clientSecret: Secret.Secret;
  readonly apiBaseUrl: string;
  readonly defaultMaxPages: number;
  readonly exampleNumber: number;
}

/**
 * EdlinkConfig service tag
 * This becomes an injectable dependency throughout the application
 */
export class EdlinkConfig extends Context.Tag('EdlinkConfig')<
  EdlinkConfig,
  EdlinkConfigData
>() {
  /**
   * Live layer that loads configuration from environment variables
   * and .env files (via ConfigProvider)
   *
   * Required variables:
   * - EDLINK_CLIENT_ID: Your Edlink API client ID
   * - EDLINK_CLIENT_SECRET: Your Edlink API client secret (redacted in logs)
   *
   * Optional variables:
   * - EDLINK_API_BASE_URL: Base URL for Edlink API (defaults to https://ed.link/api)
   * - EDLINK_DEFAULT_MAX_PAGES: Default max pages to fetch (defaults to 3)
   * - EXAMPLE: Which example to run, 1-8 (defaults to 1)
   */
  static readonly Live = Layer.effect(
    EdlinkConfig,
    Config.all({
      clientId: Config.string('EDLINK_CLIENT_ID'),
      clientSecretRaw: Config.string('EDLINK_CLIENT_SECRET'),
      apiBaseUrl: Config.string('EDLINK_API_BASE_URL').pipe(
        Config.withDefault('https://ed.link/api')
      ),
      defaultMaxPages: Config.integer('EDLINK_DEFAULT_MAX_PAGES').pipe(
        Config.withDefault(3)
      ),
      exampleNumber: Config.integer('EXAMPLE').pipe(
        Config.withDefault(1)
      ),
    }).pipe(
      Effect.map((config) => ({
        clientId: config.clientId,
        clientSecret: Secret.fromString(config.clientSecretRaw),
        apiBaseUrl: config.apiBaseUrl,
        defaultMaxPages: config.defaultMaxPages,
        exampleNumber: config.exampleNumber,
      }))
    )
  );

  /**
   * Helper to extract just the legacy EdlinkConfig shape (without exampleNumber)
   * Useful for backward compatibility with existing APIs
   */
  static readonly toLegacyConfig = (config: EdlinkConfigData) => ({
    clientId: config.clientId,
    clientSecret: Secret.value(config.clientSecret),
    apiBaseUrl: config.apiBaseUrl,
    defaultMaxPages: config.defaultMaxPages,
  });
}

