import { useNavigate } from 'react-router-dom';
import { Header } from './components/Header';
import { CHALLENGE_CARDS } from './config/challengeCards';

interface TitleScreenProps {
	onPlay: () => void;
}

export function TitleScreen({ onPlay }: TitleScreenProps) {
	const navigate = useNavigate();

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
										if (card.path) {
											navigate(card.path);
										}
									}}
									role={isActive ? 'button' : undefined}
									aria-disabled={!isActive}
								>
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
		</div>
	);
}
