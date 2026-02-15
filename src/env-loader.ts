/**
 * Environment loader - loads .env.local before any Effect code runs
 * This module should be imported as the first line in index.ts
 * to ensure environment variables are available to Effect's Config system
 */
import * as fs from 'fs';
import * as path from 'path';

/**
 * Load environment variables from .env.local file
 * Parses the file line by line and sets process.env values
 * Silently ignores if file doesn't exist or errors occur
 */
function loadEnvLocal(): void {
  const envPath = path.join(process.cwd(), '.env.local');
  
  // Check if file exists before attempting to read
  if (!fs.existsSync(envPath)) {
    return;
  }

  try {
    const content = fs.readFileSync(envPath, 'utf-8');
    const lines = content.split('\n');
    
    for (const line of lines) {
      if (line.trim() && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        if (key) {
          const value = valueParts.join('=').trim();
          // Remove quotes if present
          const cleanValue = value.replace(/^["']|["']$/g, '');
          process.env[key.trim()] = cleanValue;
        }
      }
    }
  } catch (error) {
    // Silently ignore errors during .env.local parsing
    // Errors prior to file existence check are already handled
    // This only catches issues during read/parse operations
  }
}

// Execute immediately when this module is imported
loadEnvLocal();
