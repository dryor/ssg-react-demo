import { defineConfig, type EnvironmentConfig, type RsbuildConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginPrerender } from './prerender-plugin';

const web: EnvironmentConfig = {
  source: { entry: { index: './src/entry-client.tsx' } },
  output: { target: 'web' },
};

const dev: RsbuildConfig = {
  plugins: [pluginReact()],
  environments: { web },
};

const build: RsbuildConfig = {
  plugins: [pluginReact(), pluginPrerender({ nginxDir: 'build/nginx' })],
  environments: {
    web,
    node: {
      source: { entry: { index: './src/entry-server.tsx' } },
      output: { target: 'node', distPath: { root: 'build/server' } },
    },
  },
};

export default defineConfig(({ command }) => (command === 'build' ? build : dev));
