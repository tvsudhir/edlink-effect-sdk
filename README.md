# Edlink Effect SDK

A modern, type-safe Effect-TS based SDK for interacting with the **Edlink Graph API**. Stream-based pagination for efficient data fetching with minimal memory overhead.

## ✨ Features

- **Stream-Based Pagination** - Lazy-load paginated API data without loading everything into memory
- **Configurable Limits** - Default 3-page limit, or customize with record limits or fetch-all
- **Type-Safe** - Full TypeScript support with precise type definitions
- **Memory Efficient** - Process large datasets item-by-item without buffering
- **Effect-TS Ecosystem** - Leverages Effect-TS for powerful error handling and composition
- **Multiple Strategies** - Choose the approach that fits your use case (sampling, batching, streaming, etc.)
- **API Versioning** - Folder structure supports v1, v2, v3, etc. (currently v2)

## 📦 Install & Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Credentials

Create a `.env.local` file in the root directory with your Edlink API credentials:

```bash
cat > .env.local << 'EOF'
EDLINK_CLIENT_ID=your_client_id_here
EDLINK_CLIENT_SECRET=your_client_secret_here
EDLINK_API_BASE_URL=https://ed.link/api
EOF
```

Get your credentials from the [Edlink Dashboard](https://ed.link/dashboard).

### 3. Build & Run

```bash
# Build TypeScript
pnpm build

# Run examples (see Examples section below)
pnpm dev
```

## � Configuration (Effect-TS Pattern)

This SDK uses **Effect-TS** best practices for configuration management. Secrets are never accessed directly via `process.env` and are always type-safe and validated.

### Environment Variables

Configuration is loaded via Effect's **Config** system, which provides:
- ✅ Type-safe environment variable parsing
- ✅ Automatic validation and defaults
- ✅ Secret redaction in logs (prevents accidental exposure)
- ✅ Support for multiple environments (.env.local, .env.staging, etc.)
- ✅ Zero direct `process.env` access in the codebase

### Setup

1. **Copy the template:**
   ```bash
   cp .env.example .env.local
   ```

2. **Fill in your credentials:**
   ```bash
   # Edit .env.local
   EDLINK_CLIENT_ID=your_id
   EDLINK_CLIENT_SECRET=your_secret
   ```

3. **Never commit .env.local** - it's already in `.gitignore`

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `EDLINK_CLIENT_ID` | Your Edlink API client ID | `abc123def456` |
| `EDLINK_CLIENT_SECRET` | Your Edlink API client secret (redacted in logs) | `secret_xyz789` |

### Optional Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `EDLINK_API_BASE_URL` | `https://ed.link/api` | Edlink API endpoint |
| `EDLINK_DEFAULT_MAX_PAGES` | `3` | Default page limit for fetches |
| `EXAMPLE` | `1` | Which example to run (1-8) |

### Environment-Specific Configs

For different environments, create additional `.env` files:

```bash
# Local development (gitignored)
.env.local

# Staging environment
.env.staging

# Production environment
.env.production
```

The Config system automatically uses the available environment files.

---

## 🚀 Quick Start

### Modern Approach (Using Effect Context Injection)

```typescript
import { Effect, Stream, Chunk } from 'effect';
import { FetchHttpClient } from '@effect/platform';
import { EdlinkClient, EdlinkClientLive } from './src/services/edlink-client';

/**
 * No manual config loading needed!
 * Dependencies are injected via Effect's Context system
 */
const example = Effect.gen(function* () {
  // EdlinkConfig is automatically loaded and validated
  const client = yield* EdlinkClient;
  
  // Fetch events (default: max 3 pages)
  const eventsStream = client.getEventsStream();
  const eventsChunk = yield* Stream.runCollect(eventsStream);
  const events = Chunk.toArray(eventsChunk);
  
  yield* Effect.logInfo(`Fetched ${events.length} events`);
}).pipe(
  Effect.provide(EdlinkClientLive),
  Effect.provide(FetchHttpClient.layer),
);
```

### Key Benefits

1. **No process.env** - Configuration is managed by Effect's type-safe system
2. **Automatic Secret Redaction** - `EDLINK_CLIENT_SECRET` is wrapped in `Secret` type and redacted in logs
3. **Testability** - Easy to inject different configurations for testing without mocking `process.env`
4. **Type Safety** - All configuration is validated at startup via Effect's Config system
5. **Dependency Injection** - Services depend on `EdlinkConfig` context tag, not loose parameters

---

## 📚 Examples

The `/examples/v2` directory contains 8 practical examples demonstrating different pagination strategies:

### Running Examples

```bash
# Run example 1 (default)
pnpm dev

# Run specific example (1-8)
EXAMPLE=2 pnpm dev
EXAMPLE=5 pnpm dev

# Run strategy comparison (see all strategies)
EXAMPLE=8 pnpm dev
```

### Available Examples

| # | Strategy | Use Case | Memory |
|---|----------|----------|--------|
| **1** | [fetch-default-pages](./examples/v2/1-fetch-default-pages.ts) | Quick sampling, testing | Low |
| **2** | [fetch-all-data](./examples/v2/2-fetch-all-data.ts) | Complete sync, reporting | High ⚠️ |
| **3** | [fetch-max-records](./examples/v2/3-fetch-max-records.ts) | Batch processing | Predictable |
| **4** | [process-sequentially](./examples/v2/4-process-sequentially.ts) | Large datasets 💡 | Very Low |
| **5** | [take-first-n-items](./examples/v2/5-take-first-n-items.ts) | Sampling + early stop | Low |
| **6** | [fetch-people](./examples/v2/6-fetch-people.ts) | Different entity types | Low |
| **7** | [merge-streams](./examples/v2/7-merge-streams.ts) | Multi-entity processing | Depends |
| **8** | [compare-strategies](./examples/v2/8-compare-strategies.ts) | Understand trade-offs | Educational |

See [examples/v2/README.md](./examples/v2/README.md) for detailed documentation.

## 📖 API Reference

### EdlinkClient Service

The `EdlinkClient` provides the main API for interacting with Edlink.

#### Methods

##### `getEventsStream(config?: PaginationConfig): Stream<EdlinkEvent, Error>`

Fetch events from the Edlink Graph API.

```typescript
const client = yield* EdlinkClient;

// Default: first 3 pages
const events1 = client.getEventsStream();

// Fetch all
const events2 = client.getEventsStream({ type: 'all' });

// Max records
const events3 = client.getEventsStream({ type: 'records', maxRecords: 100 });
```

##### `getPeopleStream(config?: PaginationConfig): Stream<EdlinkPerson, Error>`

Fetch people from the Edlink Graph API. Same pattern as `getEventsStream()`.

### Pagination Configuration

```typescript
// Type 1: Limit by pages (default)
{ type: 'pages', maxPages: 3 }

// Type 2: Limit by records
{ type: 'records', maxRecords: 50 }

// Type 3: Fetch all
{ type: 'all' }
```

Default behavior: `{ type: 'pages', maxPages: 3 }`

### Stream Operators

Once you have a stream, use Effect-TS Stream operators:

```typescript
const stream = client.getEventsStream();

// Collect all into array
const allEvents = Chunk.toArray(yield* Stream.runCollect(stream));

// Process one-by-one (memory efficient)
yield* Stream.runForEach(stream, (event) => /* process */);

// Take first N
const firstFive = client.getEventsStream({ type: 'all' }).pipe(
  Stream.take(5)
);

// Filter
const filtered = stream.pipe(
  Stream.filter((e) => e.type === 'person.created')
);

// Map
const mapped = stream.pipe(
  Stream.map((e) => ({ id: e.id, type: e.type }))
);

// Merge multiple streams
const merged = Stream.merge(
  client.getEventsStream(),
  client.getPeopleStream()
);
```

## 📁 Project Structure

```
edlink-effect-sdk/
├── src/
│   ├── config.ts                    # Environment config loading
│   ├── index.ts                     # Main entry (example selector)
│   ├── services/
│   │   └── edlink-client.ts         # Core API client
│   └── types/
│       ├── edlink.ts                # Entity type definitions
│       └── pagination.ts            # Pagination config types
├── examples/
│   └── v2/                          # Graph API v2 examples
│       ├── 1-fetch-default-pages.ts
│       ├── 2-fetch-all-data.ts
│       ├── 3-fetch-max-records.ts
│       ├── 4-process-sequentially.ts
│       ├── 5-take-first-n-items.ts
│       ├── 6-fetch-people.ts
│       ├── 7-merge-streams.ts
│       ├── 8-compare-strategies.ts
│       └── README.md                # Examples documentation
├── dist/                            # Compiled output
├── tsconfig.json
├── package.json
└── README.md                        # This file
```

## 🎯 Choosing a Strategy

### Sampling & Testing → **fetch-default-pages**
Default 3-page limit balances speed and data volume. Perfect for quick tests and prototypes.

```typescript
const events = client.getEventsStream();
```

### Complete Sync → **fetch-all-data**
Fetches everything. Use only for smaller datasets or critical syncs.

```typescript
const allEvents = client.getEventsStream({ type: 'all' });
```

### Batch Processing → **fetch-max-records**
Predictable memory usage - exactly N records. Good for worker queues and pipelines.

```typescript
const batch = client.getEventsStream({ type: 'records', maxRecords: 100 });
```

### Large Datasets → **process-sequentially** ⭐ Recommended
Most memory-efficient. Process items one-by-one as they arrive from the API.

```typescript
yield* Stream.runForEach(stream, (event) => {
  // Process one event at a time
  // Previous events are discarded from memory
});
```

### Preview/Sampling → **take-first-n-items**
Get first N items with early stopping (stops API calls). Efficient for quick previews.

```typescript
const preview = client.getEventsStream({ type: 'all' }).pipe(Stream.take(5));
```

### Multiple Entities → **merge-streams**
Combine events and people in one pipeline. Great for unified processing.

```typescript
const merged = Stream.merge(
  client.getEventsStream(),
  client.getPeopleStream()
);
```

## 🔧 Architecture

This SDK is built on **Effect-TS**, a powerful ecosystem for handling side effects, errors, and resource management.

### Key Components

- **Streams** - Lazy-evaluated, asynchronous sequences of values
- **Effects** - Composable computations with error handling
- **Layers** - Dependency injection and service composition
- **Context Tags** - Type-safe service lookup

### Dependency Injection

Services are provided through Effect Layers:

```typescript
const edlinkClientLayer = makeEdlinkClientLayer(config);
const effect = someEffect.pipe(
  Effect.provide(edlinkClientLayer),
  Effect.provide(FetchHttpClient.layer)
);
```

### Error Handling

All errors propagate through the Effect system:

```typescript
const result = yield* stream.pipe(
  Effect.catchAll((error) => 
    Effect.logError('API error:', error)
  )
);
```

## 📝 Type Definitions

### EdlinkEvent

```typescript
interface EdlinkEvent {
  id?: string;
  type?: string;  // e.g., 'person.created', 'person.updated'
  data?: Record<string, unknown>;
  created_date?: string;
  updated_date?: string;
}
```

### EdlinkPerson

```typescript
interface EdlinkPerson {
  id?: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  email?: string;
  phone?: string;
  picture_url?: string;
  roles?: EdlinkRole[];
  school_ids?: string[];
  grade_levels?: EdlinkGradeLevel[];
  // ... and more fields
}
```

See [src/types/edlink.ts](./src/types/edlink.ts) for complete definitions.

## 🚀 Performance Tips

1. **Use `process-sequentially` for large datasets** - Don't load millions of items into memory
2. **Set appropriate record limits** - Match your API rate limits
3. **Use `Stream.take()` for sampling** - Get representative data without full sync
4. **Merge streams carefully** - Consider memory with multiple concurrent streams
5. **Monitor pagination defaults** - 3 pages is safe but may not get all your data

## 🤝 Contributing

Contributions welcome! Key areas:

- Add v1 API examples to `/examples/v1`
- Extend type definitions
- Add utility functions for common patterns
- Improve documentation

## 📄 License

MIT

## 🔗 Resources

- [Edlink Documentation](https://ed.link/docs)
- [Effect-TS Documentation](https://effect.website)
- [Stream API Guide](https://effect.website/docs/stream/introduction/)

## ❓ FAQ

**Q: What's the default pagination limit?**
A: 3 pages. Prevents accidentally fetching massive datasets, change with `getEventsStream({ type: 'all' })`

**Q: Which strategy is best for production?**
A: Depends on your use case. For very large datasets, use `process-sequentially`. For periodic syncs, use `fetch-max-records`.

**Q: Can I use this with Node.js older than 18?**
A: Unknown. This SDK uses modern JavaScript features. Test with your Node version.

**Q: How do I handle rate limiting?**
A: Implement retry logic in the stream processing. Example coming soon.

**Q: Can I use this in the browser?**
A: Not recommended. The SDK is designed for backend/server use.

---

Made with ❤️ for Edlink users
