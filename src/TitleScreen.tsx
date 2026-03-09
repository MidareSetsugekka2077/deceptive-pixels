import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from './components/Header';
import { ChallengeInfoDialog } from './components/ChallengeInfoDialog';
import { ResetScoresDialog } from './components/ResetScoresDialog';
import { ChallengeCard } from './components/ChallengeCard';
import { ImageSetSelection } from './ImageSetSelection';
import { Tutorial } from './Tutorial';
import {
	CHALLENGE_CARDS,
	type ChallengeCard as ChallengeCardData,
} from './config/challengeCards';
import { resetAllStoredScores } from './legacy/challengeScore';
import { useChallengeScores } from './hooks/useChallengeScores';

interface TitleScreenProps {
	onPlay: () => void;
}

export function TitleScreen({ onPlay }: TitleScreenProps) {
	const navigate = useNavigate();
	const maxChallengeScore = 30;
	const [datasetDialogOpen, setDatasetDialogOpen] = useState(false);
	const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
	const [tutorialOpen, setTutorialOpen] = useState(false);
	const [resetDialogOpen, setResetDialogOpen] = useState(false);
	const [activeCard, setActiveCard] = useState<ChallengeCardData | null>(null);
	const [pinnedBadgeId, setPinnedBadgeId] = useState<string | null>(null);
	const badgeTargetCount = 10;

	const { datasetScores, activeCardUnlockProgress } = useChallengeScores({
		activeCard,
		maxChallengeScore,
		badgeTargetCount,
		refreshKey: datasetDialogOpen,
	});

	return (
		<div className="min-h-screen bg-[#d8d8d8] text-black">
			{/* Header + constrained content */}
			<Header />

			<section className="w-full bg-[#0d2d43] px-6 pb-[90px] pt-[90px] text-center text-white">
				<div className="mx-auto flex w-full max-w-[680px] flex-col items-center gap-[52px]">
					<div className="flex h-[120px] w-[120px] items-center justify-center bg-white">
						<div className="h-[10px] w-[10px] bg-[#0a0a0a]" />
					</div>
					<h1 className="text-[56px] font-semibold leading-6 tracking-[-0.3125px] text-[#eee] sm:text-[72px]">
						Deceptive Pixels
					</h1>
				</div>

				<div className="mx-auto mt-8 flex w-full max-w-[520px] flex-col items-center gap-8">
					<p className="text-[20px] leading-6 tracking-[-0.3125px]">
						Learn about different kinds of adversarial attacks
						<br />
						by finding the images that can trick the image classifier!
					</p>
					<button
						className="rounded-[5px] bg-[#ffe600] px-[66px] py-[20px] text-[32px] font-extrabold leading-6 tracking-[-0.3125px] text-black transition-colors duration-200 hover:bg-[#e7cf00]"
						onClick={onPlay}
						type="button"
					>
						Play
					</button>
					<button
						className="rounded-[5px] border-2 border-white px-[40px] py-[16px] text-[24px] font-semibold leading-3 tracking-[-0.3125px] text-white transition-colors duration-200 hover:bg-white hover:text-[#0d2d43]"
						onClick={() => setTutorialOpen(true)}
						type="button"
					>
						Tutorial
					</button>
					<button
						className="rounded-[5px] border-2 border-[#ff8f8f] px-[26px] py-[12px] text-[18px] font-semibold leading-3 tracking-[-0.3125px] text-[#ffd7d7] transition-colors duration-200 hover:bg-[#ff8f8f] hover:text-[#0d2d43]"
						onClick={() => setResetDialogOpen(true)}
						type="button"
					>
						Reset Scores
					</button>
				</div>
			</section>

			{/* Constrained cards section */}
			<div className="mx-auto w-full px-5 pb-16">
					<section className="mt-11 flex w-full flex-wrap items-center justify-center gap-[25px] px-3 sm:px-[68px]">
						{CHALLENGE_CARDS.map((card) => (
							<ChallengeCard
								key={`challenge-${card.challengeId}`}
								card={card}
								badgeTargetCount={badgeTargetCount}
								pinnedBadgeId={pinnedBadgeId}
								onPinnedBadgeChange={(badgeId) => {
									setPinnedBadgeId((currentPinnedId) =>
										currentPinnedId === badgeId ? null : badgeId,
									);
								}}
								onCardClick={(selectedCard) => {
									setActiveCard(selectedCard);
									setDatasetDialogOpen(true);
								}}
								onDetailsClick={(selectedCard) => {
									setActiveCard(selectedCard);
									setDetailsDialogOpen(true);
								}}
							/>
						))}
					</section>
			</div>

			<ChallengeInfoDialog
				open={detailsDialogOpen}
				onOpenChange={(open) => {
					setDetailsDialogOpen(open);
					if (!open && !datasetDialogOpen) {
						setActiveCard(null);
					}
				}}
				card={activeCard}
			/>

			<ImageSetSelection
				open={datasetDialogOpen}
				onOpenChange={(open) => {
					setDatasetDialogOpen(open);
					if (!open && !detailsDialogOpen) {
						setActiveCard(null);
					}
				}}
				scores={datasetScores}
				unlockProgress={activeCardUnlockProgress}
				onSelect={(dataset) => {
					if (!activeCard?.path) {
						return;
					}
					setDatasetDialogOpen(false);
					navigate(`${activeCard.path}?dataset=${dataset}`);
				}}
			/>

			<Tutorial
				open={tutorialOpen}
				onOpenChange={setTutorialOpen}
				onComplete={onPlay}
			/>

			<ResetScoresDialog
				open={resetDialogOpen}
				onOpenChange={setResetDialogOpen}
				onConfirmReset={() => {
					resetAllStoredScores();
					setResetDialogOpen(false);
				}}
			/>
		</div>
	);
}
