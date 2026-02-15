import { Effect } from 'effect';
import { EdlinkConfig as EdlinkConfigService } from './services/config-service.js';

/**
 * @deprecated Use EdlinkConfig service tag from config-service instead
 * Configuration for Edlink API authentication
 * Loaded from environment variables via Effect's Config system
 */
export interface EdlinkConfig {
  readonly clientId: string;
  readonly clientSecret: string;
  readonly apiBaseUrl: string;
  readonly defaultMaxPages: number;
}

/**
 * @deprecated Use EdlinkConfig.Live layer from config-service instead
 * 
 * Load Edlink configuration from environment variables via Effect's Config system
 * 
 * Required environment variables:
 * - EDLINK_CLIENT_ID
 * - EDLINK_CLIENT_SECRET
 * 
 * Optional environment variables:
 * - EDLINK_API_BASE_URL (defaults to 'https://ed.link/api')
 * - EDLINK_DEFAULT_MAX_PAGES (defaults to 3)
 * 
 * NOTE: This function is provided for backward compatibility.
 * For new code, use EdlinkConfig.Live layer and inject via Context.
 */
export const loadEdlinkConfig = (): Effect.Effect<EdlinkConfig, Error, EdlinkConfigService> =>
  Effect.gen(function* () {
    const configData = yield* EdlinkConfigService;
    return {
      clientId: configData.clientId,
      clientSecret: EdlinkConfigService.toLegacyConfig(configData).clientSecret,
      apiBaseUrl: configData.apiBaseUrl,
      defaultMaxPages: configData.defaultMaxPages,
    } satisfies EdlinkConfig;
  });





