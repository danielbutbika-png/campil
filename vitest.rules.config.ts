import { defineConfig } from 'vitest/config';
// Security rules tests need the Firestore emulator (see tests/rules/rules.test.ts).
export default defineConfig({ test: { include: ['tests/rules/**/*.test.ts'], testTimeout: 20000, hookTimeout: 60000, fileParallelism: false } });
