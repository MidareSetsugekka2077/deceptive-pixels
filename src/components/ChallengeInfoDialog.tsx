import { ArrowRight, X } from 'lucide-react';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from './ui/dialog';
import type { ChallengeCard } from '../config/challengeCards';

interface ChallengeInfoDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	card: ChallengeCard | null;
}

export function ChallengeInfoDialog({
	open,
	onOpenChange,
	card,
}: ChallengeInfoDialogProps) {
	if (!card) {
		return null;
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="w-[min(700px,calc(100vw-2rem))] max-w-[700px] sm:max-w-none gap-0 rounded-[12px] border-none bg-[#d9d9d9] p-6 text-[#030213] shadow-none sm:p-8 [&>button:last-child]:hidden">
				<DialogTitle className="pr-16 text-[30px] font-semibold leading-none tracking-[-0.3125px] text-[#030213] sm:text-[36px]">
					{card.title}
				</DialogTitle>
				<DialogClose
					className="absolute right-6 top-6 inline-flex h-10 w-10 items-center justify-center rounded-full border-[3px] border-[#1d1b20] text-[#1d1b20] transition-colors hover:bg-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 sm:right-8 sm:top-8"
					aria-label="Close"
				>
					<X className="h-7 w-7" strokeWidth={2.75} />
				</DialogClose>
				<DialogDescription className="sr-only">
					Detailed information about {card.title}.
				</DialogDescription>
				<div className="mt-6">
					<div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-5">
						<div className="text-center">
							<p className="mb-2 text-[16px] font-normal leading-none text-[#1d1b20]">
								Original
							</p>
							{card.previewImages?.original ? (
								<img
									src={card.previewImages.original}
									alt={`${card.title} original example`}
									className="mx-auto h-[140px] w-[140px] rounded-[5px] border-[10px] border-white object-cover sm:h-[220px] sm:w-[220px]"
								/>
							) : (
								<div className="mx-auto h-[140px] w-[140px] rounded-[5px] border-[10px] border-white bg-[#0d2d43] sm:h-[220px] sm:w-[220px]" />
							)}
						</div>
						<ArrowRight className="h-12 w-12 text-[#1d1b20] sm:h-16 sm:w-16" strokeWidth={2.75} />
						<div className="text-center">
							<p className="mb-2 text-[16px] font-normal leading-none text-[#1d1b20]">
								Attacked
							</p>
							{card.previewImages?.attacked ? (
								<img
									src={card.previewImages.attacked}
									alt={`${card.title} attacked example`}
									className="mx-auto h-[140px] w-[140px] rounded-[5px] border-[10px] border-white object-cover sm:h-[220px] sm:w-[220px]"
								/>
							) : (
								<div className="mx-auto h-[140px] w-[140px] rounded-[5px] border-[10px] border-white bg-[#0d2d43] sm:h-[220px] sm:w-[220px]" />
							)}
						</div>
					</div>

					<p className="mt-4 text-center text-[16px] leading-[1.15] text-[#030213] sm:mt-8">
						{card.attackDetails.description}
					</p>

					<section className="mt-6 sm:mt-9">
						<h3 className="text-[28px] font-medium leading-none tracking-[-0.3125px] text-[#030213]">
							How it works
						</h3>
						<p className="mt-3 text-[16px] leading-[1.15] text-[#030213] sm:mt-4">
							{card.attackDetails.howItWorks}
						</p>
					</section>

					<section className="mt-6 sm:mt-8">
						<h3 className="text-[28px] font-medium leading-none tracking-[-0.3125px] text-[#030213]">
							Effectiveness
						</h3>
						<p className="mt-3 text-[16px] leading-[1.15] text-[#030213] sm:mt-4">
							{card.attackDetails.effectiveness}
						</p>
					</section>
				</div>
			</DialogContent>
		</Dialog>
	);
}
