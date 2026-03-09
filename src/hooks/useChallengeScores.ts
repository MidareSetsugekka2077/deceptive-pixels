import { useMemo } from 'react';
import type { ChallengeCard } from '../config/challengeCards';
import {
	getFoundAttackedImageCount,
	getStoredScore,
	getTotalTrackableAttackedImages,
} from '../legacy/challengeScore';

interface UseChallengeScoresParams {
	activeCard: ChallengeCard | null;
	maxChallengeScore: number;
	badgeTargetCount: number;
	refreshKey?: unknown;
}

export function useChallengeScores({
	activeCard,
	maxChallengeScore,
	badgeTargetCount,
	refreshKey,
}: UseChallengeScoresParams) {
	const datasetScores = useMemo(() => {
		if (!activeCard) {
			return { mnist: 0, imagenet: 0, max: maxChallengeScore };
		}

		return {
			mnist: getStoredScore(activeCard.challengeId, 'mnist', maxChallengeScore),
			imagenet: getStoredScore(activeCard.challengeId, 'imagenet', maxChallengeScore),
			max: maxChallengeScore,
		};
	}, [activeCard, maxChallengeScore, refreshKey]);

	const activeCardUnlockProgress = useMemo(() => {
		if (!activeCard) {
			return {
				mnist: { foundCount: 0, totalCount: badgeTargetCount, unlocked: false },
				imagenet: { foundCount: 0, totalCount: badgeTargetCount, unlocked: false },
			};
		}

		const mnistFound = getFoundAttackedImageCount(activeCard.challengeId, 'mnist');
		const imagenetFound = getFoundAttackedImageCount(activeCard.challengeId, 'imagenet');
		const mnistTotal = getTotalTrackableAttackedImages(activeCard.challengeId, 'mnist');
		const imagenetTotal = getTotalTrackableAttackedImages(activeCard.challengeId, 'imagenet');

		return {
			mnist: {
				foundCount: Math.min(mnistFound, badgeTargetCount),
				totalCount: badgeTargetCount,
				unlocked: mnistTotal > 0 && mnistFound >= mnistTotal,
			},
			imagenet: {
				foundCount: Math.min(imagenetFound, badgeTargetCount),
				totalCount: badgeTargetCount,
				unlocked: imagenetTotal > 0 && imagenetFound >= imagenetTotal,
			},
		};
	}, [activeCard, badgeTargetCount, refreshKey]);

	return {
		datasetScores,
		activeCardUnlockProgress,
	};
}
