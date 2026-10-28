import { defineConfig } from 'vitest/config';
// Unit tests only; security rules tests run separately against the emulator (vitest.rules.config.ts).
export default defineConfig({ test: { include: ['src/**/*.test.ts'] } });
