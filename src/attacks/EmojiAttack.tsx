import { MainGame } from '../MainGame';
import { useSearchParams } from 'react-router-dom';

export function EmojiAttack() {
  const [searchParams] = useSearchParams();
  const dataset = searchParams.get('dataset') === 'imagenet' ? 'imagenet' : 'mnist';

  return (
    <MainGame fixedChallengeId={7} showChallengeSelection={false} dataset={dataset} />
  );
}
