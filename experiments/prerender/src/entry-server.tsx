import { StrictMode } from 'react';
import { prerender } from 'react-dom/static';
import { Router } from 'wouter';
import { App } from './App';

export async function render(url: string): Promise<string> {
  const { prelude } = await prerender(
    <StrictMode>
      <Router ssrPath={url}>
        <App />
      </Router>
    </StrictMode>,
  );
  return new Response(prelude).text();
}
