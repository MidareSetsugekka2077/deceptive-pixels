import { MainGame } from '../MainGame';
import { useSearchParams } from 'react-router-dom';

export function RotateAttack() {
	const [searchParams] = useSearchParams();
	const dataset = searchParams.get('dataset') === 'imagenet' ? 'imagenet' : 'mnist';

	return (
		<MainGame fixedChallengeId={2} showChallengeSelection={false} dataset={dataset} />
	);
}
