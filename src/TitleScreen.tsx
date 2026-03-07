import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from './components/Header';
import { ChallengeInfoDialog } from './components/ChallengeInfoDialog';
import { ImageSetSelection } from './ImageSetSelection';
import { CHALLENGE_CARDS, type ChallengeCard } from './config/challengeCards';
import { getStoredScore } from './legacy/challengeScore';

interface TitleScreenProps {
	onPlay: () => void;
}

export function TitleScreen({ onPlay }: TitleScreenProps) {
	const navigate = useNavigate();
	const maxChallengeScore = 30;
	const [datasetDialogOpen, setDatasetDialogOpen] = useState(false);
	const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
	const [activeCard, setActiveCard] = useState<ChallengeCard | null>(null);

	const datasetScores = useMemo(() => {
		if (!activeCard) {
			return { mnist: 0, imagenet: 0, max: maxChallengeScore };
		}
		return {
			mnist: getStoredScore(activeCard.challengeId, 'mnist', maxChallengeScore),
			imagenet: getStoredScore(activeCard.challengeId, 'imagenet', maxChallengeScore),
			max: maxChallengeScore,
		};
	}, [activeCard, maxChallengeScore, datasetDialogOpen]);

	return (
		<div className="min-h-screen bg-[#d8d8d8] text-black">
			{/* Header + constrained content */}
			<Header />

			<section className="w-full bg-[#0d2d43] px-6 pb-[123px] pt-[116px] text-center text-white">
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
						className="rounded-[5px] bg-[#ffe600] px-[66px] py-[20px] text-[32px] font-bold leading-6 tracking-[-0.3125px] text-black transition-colors duration-200 hover:bg-[#e7cf00]"
						onClick={onPlay}
						type="button"
					>
						Play
					</button>
				</div>
			</section>

			{/* Constrained cards section */}
			<div className="mx-auto w-full px-5 pb-16">
					<section className="mt-11 flex w-full flex-wrap items-center justify-center gap-[25px] px-3 sm:px-[68px]">
						{CHALLENGE_CARDS.map((card, index) => {
							const isActive = Boolean(card.path);

							return (
								<div
									key={`challenge-${index}`}
									className={`relative flex h-[300px] w-[350px] flex-col items-start bg-white p-6 text-left transition-all ${
										isActive ? 'cursor-pointer hover:-translate-y-1 hover:shadow-lg' : 'cursor-not-allowed opacity-70'
									}`}
									onClick={() => {
										if (!card.path) {
											return;
										}
										setActiveCard(card);
										setDatasetDialogOpen(true);
									}}
									role={isActive ? 'button' : undefined}
									aria-disabled={!isActive}
								>
									<button
										className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#0a0a0a] text-[20px] font-bold leading-none text-[#0a0a0a] transition-colors hover:bg-[#0a0a0a] hover:text-white"
										onClick={(event) => {
											event.stopPropagation();
											setActiveCard(card);
											setDetailsDialogOpen(true);
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
								</div>
							);
						})}
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
				onSelect={(dataset) => {
					if (!activeCard?.path) {
						return;
					}
					setDatasetDialogOpen(false);
					navigate(`${activeCard.path}?dataset=${dataset}`);
				}}
			/>
		</div>
	);
}
