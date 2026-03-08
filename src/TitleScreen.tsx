import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from './components/Header';
import { ChallengeInfoDialog } from './components/ChallengeInfoDialog';
import { ResetScoresDialog } from './components/ResetScoresDialog';
import { ImageSetSelection } from './ImageSetSelection';
import { Tutorial } from './Tutorial';
import { CHALLENGE_CARDS, type ChallengeCard } from './config/challengeCards';
import type { DatasetKey } from './config/images';
import {
	getFoundAttackedImageCount,
	getStoredScore,
	getTotalTrackableAttackedImages,
	resetAllStoredScores,
} from './legacy/challengeScore';

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
	const [activeCard, setActiveCard] = useState<ChallengeCard | null>(null);
	const [hoveredBadgeId, setHoveredBadgeId] = useState<string | null>(null);
	const [pinnedBadgeId, setPinnedBadgeId] = useState<string | null>(null);
	const badgeTargetCount = 10;

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
	}, [activeCard, badgeTargetCount, datasetDialogOpen]);

	const unlockDatasets: { key: DatasetKey; label: string }[] = [
		{ key: 'mnist', label: 'MNIST' },
		{ key: 'imagenet', label: 'ImageNet' },
	];

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
						{CHALLENGE_CARDS.map((card, index) => {
							const isActive = Boolean(card.path);
							const datasetUnlocks = unlockDatasets.map((dataset) => {
								const foundCount = getFoundAttackedImageCount(
									card.challengeId,
									dataset.key,
								);
								const totalCount = getTotalTrackableAttackedImages(
									card.challengeId,
									dataset.key,
								);

								return {
									...dataset,
									foundCount,
									totalCount,
									unlocked: totalCount > 0 && foundCount >= totalCount,
								};
							});

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
									<div className="mt-auto flex w-full items-center justify-center gap-[28px] pt-8">
										{datasetUnlocks.map((dataset) => {
											const badgeId = `${card.challengeId}-${dataset.key}`;
											const showTooltip =
												hoveredBadgeId === badgeId || pinnedBadgeId === badgeId;
											const clampedFoundCount = Math.min(
												dataset.foundCount,
												badgeTargetCount,
											);

											return (
												<div
													key={badgeId}
													className="relative"
												>
													<button
														type="button"
														onClick={(event) => {
															event.stopPropagation();
															setPinnedBadgeId((prev) => (prev === badgeId ? null : badgeId));
														}}
														onMouseEnter={() => setHoveredBadgeId(badgeId)}
														onMouseLeave={() => setHoveredBadgeId((prev) => (prev === badgeId ? null : prev))}
														onFocus={() => setHoveredBadgeId(badgeId)}
														onBlur={() => setHoveredBadgeId((prev) => (prev === badgeId ? null : prev))}
														className={`h-[35px] w-[35px] rounded-[10px] transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#0d2d43] ${dataset.unlocked ? 'bg-[#ffe600]' : 'bg-[#40404a]'}`}
														aria-label={`${dataset.label} progress ${clampedFoundCount}/${badgeTargetCount}`}
													>
														<span className="sr-only">
															{dataset.label} {clampedFoundCount} of {badgeTargetCount} found
														</span>
													</button>
													{showTooltip && (
														<div className="pointer-events-none absolute bottom-[calc(100%+10px)] left-1/2 z-20 -translate-x-1/2">
															<div className="whitespace-nowrap rounded-[12px] bg-[#0d2d43] px-3 py-2 text-[14px] font-semibold text-white shadow-lg">
																{clampedFoundCount}/{badgeTargetCount}
															</div>
															<div className="mx-auto h-0 w-0 border-l-[7px] border-r-[7px] border-t-[8px] border-l-transparent border-r-transparent border-t-[#0d2d43]" />
														</div>
													)}
												</div>
											);
										})}
									</div>
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
