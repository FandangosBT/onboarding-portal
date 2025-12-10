import { AppRouter } from './routes/AppRouter';

export function App() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-background-primary)', padding: '16px' }}>
      <AppRouter />
    </div>
  );
}
