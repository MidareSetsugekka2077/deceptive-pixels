import { useState } from 'react';
import { MainGame } from './MainGame';
import { TitleScreen } from './TitleScreen';

export default function App() {
  const [view, setView] = useState<'title' | 'game'>('title');

  if (view === 'game') {
    return <MainGame />;
  }

  return (
    <TitleScreen onPlay={() => setView('game')} />
  );
}
