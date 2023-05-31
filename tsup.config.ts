import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: 'esm',
    target: [
      'node16',
      'chrome94',
      'edge94',
      'safari16',
      'firefox93',
      'opera80',
    ],
    skipNodeModulesBundle: true,
    clean: true,
    dts: true,
  },
]);
