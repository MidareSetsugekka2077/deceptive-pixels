import { MainGame } from '../MainGame';
import { useSearchParams } from 'react-router-dom';

export function AdversarialPatches() {
  const [searchParams] = useSearchParams();
  const dataset = searchParams.get('dataset') === 'imagenet' ? 'imagenet' : 'mnist';

  return (
    <MainGame fixedChallengeId={6} showChallengeSelection={false} dataset={dataset} />
  );
}
