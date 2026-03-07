import { MainGame } from '../MainGame';
import { useSearchParams } from 'react-router-dom';

export function BlurAttack() {
  const [searchParams] = useSearchParams();
  const dataset = searchParams.get('dataset') === 'imagenet' ? 'imagenet' : 'mnist';

  return (
    <MainGame fixedChallengeId={5} showChallengeSelection={false} dataset={dataset} />
  );
}
