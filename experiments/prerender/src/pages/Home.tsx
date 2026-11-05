import { Link } from 'wouter';

export function Home() {
  return (
    <main>
      <p>pre render</p>
      <Link href="/pagina-2">Ir a página 2</Link>
    </main>
  );
}
