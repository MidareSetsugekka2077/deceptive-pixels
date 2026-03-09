import type { ChallengeCard as ChallengeCardData } from '../config/challengeCards';
import { CardBadges } from './CardBadges';

interface ChallengeCardProps {
	card: ChallengeCardData;
	badgeTargetCount: number;
	pinnedBadgeId: string | null;
	onPinnedBadgeChange: (badgeId: string) => void;
	onCardClick: (card: ChallengeCardData) => void;
	onDetailsClick: (card: ChallengeCardData) => void;
}

export function ChallengeCard({
	card,
	badgeTargetCount,
	pinnedBadgeId,
	onPinnedBadgeChange,
	onCardClick,
	onDetailsClick,
}: ChallengeCardProps) {
	const isActive = Boolean(card.path);

	return (
		<div
			className={`relative flex h-[300px] w-[350px] flex-col items-start bg-white p-6 text-left transition-all ${
				isActive
					? 'cursor-pointer hover:-translate-y-1 hover:shadow-lg'
					: 'cursor-not-allowed opacity-70'
			}`}
			onClick={() => {
				if (!card.path) {
					return;
				}
				onCardClick(card);
			}}
			role={isActive ? 'button' : undefined}
			aria-disabled={!isActive}
		>
			<button
				className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#0a0a0a] text-[20px] font-bold leading-none text-[#0a0a0a] transition-colors hover:bg-[#0a0a0a] hover:text-white"
				onClick={(event) => {
					event.stopPropagation();
					onDetailsClick(card);
				}}
				type="button"
				aria-label={`About ${card.title}`}
			>
				?
			</button>
			{card.cardIcon && (
				<div className="mb-6 flex h-[24px] w-[24px] items-center justify-center">
					<img alt="" className="h-full w-full" src={card.cardIcon} />
				</div>
			)}
			{card.title && (
				<p className="text-[32px] font-semibold leading-6 tracking-[-0.3125px]">
					{card.title}
				</p>
			)}
			{card.description && (
				<p className="mt-2 text-[20px] leading-6 tracking-[-0.3125px]">
					{card.description}
				</p>
			)}
			<CardBadges
				challengeId={card.challengeId}
				badgeTargetCount={badgeTargetCount}
				pinnedBadgeId={pinnedBadgeId}
				onPinnedBadgeChange={onPinnedBadgeChange}
			/>
		</div>
	);
}
