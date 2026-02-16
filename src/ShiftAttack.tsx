import { MainGame } from './MainGame';
import { useSearchParams } from 'react-router-dom';

export function ShiftAttack() {
	const [searchParams] = useSearchParams();
	const dataset = searchParams.get('dataset') === 'imagenet' ? 'imagenet' : 'mnist';

	return (
		<MainGame fixedChallengeId={3} showChallengeSelection={false} dataset={dataset} />
	);
}
