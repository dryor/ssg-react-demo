import { useState } from 'react';
import { Link } from 'wouter';
import { useHydrated } from '../use-hydrated';

export function Home() {
  const [clicks, setClicks] = useState(0);
  const hydrated = useHydrated();

  return (
    <main>
      <h1>Inicio</h1>
      <button type="button" disabled={!hydrated} onClick={() => setClicks((n) => n + 1)}>
        Clics: {clicks}
      </button>
      <Link href="/pagina-2">Ir a página 2</Link>
    </main>
  );
}
