import { defineConfig } from 'tsup';

export default defineConfig({
  format: ['esm', 'cjs'],
  target: 'node16',
  skipNodeModulesBundle: true,
  clean: true,
  dts: true,
});
