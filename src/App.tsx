import { MainGame } from './MainGame';

export default function App() {
  return (
    <div className="size-full bg-muted p-8 overflow-auto">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-semibold">Deceptive Pixels</h1>
        </header>
        <MainGame />
      </div>
    </div>
  );
}
