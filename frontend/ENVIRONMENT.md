# Environment Configuration

This project supports multiple environments (development, production) using Vite's built-in environment variable system.

## Environment Files

The following environment files are available:

- `.env` - Default environment variables (shared across all environments)
- `.env.development` - Development-specific variables
- `.env.production` - Production-specific variables

## Available Environment Variables

### App Configuration
- `VITE_APP_NAME` - Application name displayed in the UI
- `VITE_APP_VERSION` - Application version

### API Configuration
- `VITE_API_BASE_URL` - Base URL for API requests
- `VITE_API_TIMEOUT` - Request timeout in milliseconds

### Feature Flags
- `VITE_ENABLE_DEBUG` - Enable debug logging (true/false)
- `VITE_ENABLE_ANALYTICS` - Enable analytics tracking (true/false)
- `VITE_LOG_LEVEL` - Logging level (debug, info, warn, error)

## Usage in Code

### Using Environment Variables

```typescript
import { env, isDevelopment, isProduction } from './utilities/env';

// Access environment variables
console.log(env.APP_NAME); // "Freight UI"
console.log(env.API_BASE_URL); // "http://localhost:8080" or production URL

// Environment checks
if (isDevelopment()) {
  console.log('Running in development mode');
}

// Debug logging (only works in development with debug enabled)
debugLog('This will only show in development');
```

### Using the API Utility

```typescript
import { api, getEnvironmentInfo } from './apis/api';

// Make API requests (automatically uses environment-configured base URL)
const data = await api.get('/users');
const newUser = await api.post('/users', { name: 'John' });

// Get current environment info
console.log(getEnvironmentInfo());
```

## Development Commands

```bash
# Start development server (uses .env.development)
npm run dev

# Start development server with production environment
npm run dev:prod

# Build for development
npm run build:dev

# Build for production
npm run build:prod

# Preview production build
npm run preview:prod
```

## Environment Setup

1. Copy the appropriate `.env.*` file for your environment
2. Update the values as needed for your setup
3. Restart the development server after changing environment files

## Security Notes

- Never commit sensitive data like API keys to version control
- Use `.env.local` for local overrides (this file is gitignored)
- Environment variables prefixed with `VITE_` are exposed to the client-side code
- Server-side only secrets should not use the `VITE_` prefix
