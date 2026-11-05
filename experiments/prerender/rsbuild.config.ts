import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginPrerender } from './prerender-plugin';

export default defineConfig({
  plugins: [pluginReact(), pluginPrerender()],
  environments: {
    web: {
      source: { entry: { index: './src/entry-client.tsx' } },
      output: { target: 'web' },
    },
    node: {
      source: { entry: { index: './src/entry-server.tsx' } },
      output: { target: 'node', distPath: { root: 'dist/server' } },
    },
  },
});
