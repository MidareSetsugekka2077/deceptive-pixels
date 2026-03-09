import type { DatasetKey } from '../config/images';
import {
	getFoundAttackedImageCount,
	getTotalTrackableAttackedImages,
} from '../legacy/challengeScore';
import { Badge } from './Badge';

interface CardBadgesProps {
	challengeId: number;
	badgeTargetCount: number;
}

const unlockDatasets: { key: DatasetKey; label: string }[] = [
	{ key: 'mnist', label: 'MNIST' },
	{ key: 'imagenet', label: 'ImageNet' },
];

export function CardBadges({ challengeId, badgeTargetCount }: CardBadgesProps) {
	const datasetUnlocks = unlockDatasets.map((dataset) => {
		const foundCount = getFoundAttackedImageCount(challengeId, dataset.key);
		const totalCount = getTotalTrackableAttackedImages(challengeId, dataset.key);

		return {
			...dataset,
			foundCount,
			unlocked: totalCount > 0 && foundCount >= totalCount,
		};
	});

	return (
		<div className="mt-auto flex w-full items-center justify-center gap-[28px] pt-8">
			{datasetUnlocks.map((dataset) => (
				<Badge
					key={`${challengeId}-${dataset.key}`}
					label={dataset.label}
					foundCount={dataset.foundCount}
					targetCount={badgeTargetCount}
					unlocked={dataset.unlocked}
				/>
			))}
		</div>
	);
}
