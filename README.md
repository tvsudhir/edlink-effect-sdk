# Edlink Effect SDK

An Effect-TS based SDK for interacting with the Edlink API.

## Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Credentials

Create a `.env.local` file in the root directory (this file is git-ignored):

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in your Edlink API credentials:

```env
EDLINK_CLIENT_ID=your_client_id_here
EDLINK_CLIENT_SECRET=your_client_secret_here
EDLINK_API_BASE_URL=https://ed.link/api
```

### 3. Build

```bash
pnpm build
```

### 4. Run

```bash
pnpm dev
```

## Project Structure

- `src/config.ts` - Environment configuration loading
- `src/services/edlink-client.ts` - Edlink API client service
- `src/index.ts` - Main application entry point

## Architecture

This SDK follows Effect-TS best practices:

- **Configuration Management**: Environment variables are loaded via Effect's Config module
- **Dependency Injection**: Services are provided through Effect Layers
- **Error Handling**: All effects propagate errors properly through the Effect system
- **Type Safety**: Full TypeScript typing throughout

## Development

- Run with live TypeScript execution:
  ```bash
  pnpm dev
  ```

- Build distribution:
  ```bash
  pnpm build
  ```

## License

MIT
