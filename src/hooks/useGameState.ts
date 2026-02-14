import { useCallback, useMemo, useState } from 'react';

export type GamePhase = 'selecting' | 'revealed';

export const useGameState = () => {
  const [phase, setPhase] = useState<GamePhase>('selecting');

  const revealed = useMemo(() => phase === 'revealed', [phase]);

  const reveal = useCallback(() => {
    setPhase('revealed');
  }, []);

  const resetPhase = useCallback(() => {
    setPhase('selecting');
  }, []);

  return {
    phase,
    revealed,
    reveal,
    resetPhase,
  };
};
