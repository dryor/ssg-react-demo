import { Route, Switch } from 'wouter';
import { NotFound } from './pages/NotFound';
import { routes } from './routes';

export function App() {
  return (
    <Switch>
      {routes.map(({ path, component }) => (
        <Route key={path} path={path} component={component} />
      ))}
      <Route component={NotFound} />
    </Switch>
  );
}
