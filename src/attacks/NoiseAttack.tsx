import { MainGame } from '../MainGame';
import { useSearchParams } from 'react-router-dom';

export function NoiseAttack() {
  const [searchParams] = useSearchParams();
  const dataset = searchParams.get('dataset') === 'imagenet' ? 'imagenet' : 'mnist';

  return (
    <MainGame fixedChallengeId={4} showChallengeSelection={false} dataset={dataset} />
  );
}
