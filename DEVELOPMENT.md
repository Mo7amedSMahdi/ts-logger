# Development Guide

## Building the Library

This TypeScript library includes build scripts for local development and testing.

### Available Scripts

- `yarn build` - Compiles TypeScript to JavaScript in the `dist/` folder
- `yarn build:watch` - Watches for changes and rebuilds automatically
- `yarn clean` - Removes the `dist/` folder
- `yarn link:local` - Builds and links the library for local development
- `yarn test` - Runs tests with coverage
- `yarn dev` - Runs tests in watch mode

### Local Development Workflow

1. **Build the library:**

   ```bash
   yarn build
   ```

2. **Link for local testing:**

   ```bash
   yarn link:local
   ```

3. **In your test project, link the library:**

   ```bash
   yarn link "ts-logger-utils"
   ```

4. **Use the library in your test project:**

   ```typescript
   import { Logger, ConsoleSink } from 'ts-logger-utils';

   const logger = new Logger({
     sinks: [new ConsoleSink()],
     minLevel: 'DEBUG',
   });

   logger.info('Hello from ts-logger-utils!');
   ```

5. **During development, rebuild and the linked version will update:**
   ```bash
   yarn build:watch  # In the library project
   ```

### Unlinking

When you're done testing, unlink from your test project:

```bash
yarn unlink "ts-logger-utils"  # In your test project
yarn unlink                    # In the library project
```

### Package Structure

- `src/` - TypeScript source files
- `dist/` - Compiled JavaScript output (created by build)
- `package.json` - Points to `dist/index.js` as the main entry
- Generated `.d.ts` files provide TypeScript definitions

### Building for Production

The library is configured to build CommonJS modules that work in both Node.js and browser environments. The build output includes:

- Compiled JavaScript files
- TypeScript declaration files (`.d.ts`)
- Source maps for debugging
