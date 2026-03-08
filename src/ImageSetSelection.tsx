import { Dialog, DialogContent, DialogTitle } from './components/ui/dialog';
import type { DatasetKey } from './config/images';

interface ImageSetSelectionProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSelect: (dataset: DatasetKey) => void;
	scores: {
		mnist: number;
		imagenet: number;
		max: number;
	};
	unlockProgress: {
		mnist: { foundCount: number; totalCount: number; unlocked: boolean };
		imagenet: { foundCount: number; totalCount: number; unlocked: boolean };
	};
}

export function ImageSetSelection({
	open,
	onOpenChange,
	onSelect,
	scores,
	unlockProgress,
}: ImageSetSelectionProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="w-[min(1100px,calc(100vw-2rem))] max-w-[1100px] sm:max-w-none rounded-[12px] border-none bg-[#d9d9d9] p-4 sm:p-6">
				<DialogTitle className="sr-only">Choose a dataset</DialogTitle>
				<div className="grid gap-4 sm:grid-cols-2">
					<button
						className="flex min-h-[480px] flex-col items-center justify-center gap-6 rounded-[5px] bg-[#9c9cb2] text-[#0a0a0a] transition-transform duration-200 hover:-translate-y-1"
						onClick={() => onSelect('mnist')}
						type="button"
					>
						<div
							className={`h-[35px] w-[35px] rounded-[10px] ${unlockProgress.mnist.unlocked ? 'bg-[#ffe600]' : 'bg-[#40404a]'}`}
							title={`MNIST: ${unlockProgress.mnist.foundCount}/10`}
						>
							<span className="sr-only">
								MNIST {unlockProgress.mnist.foundCount}/10 found
							</span>
						</div>
						<span className="text-[40px] leading-none tracking-[-0.3125px] sm:text-[64px]">
							MNIST
						</span>
						<span className="rounded-[10px] bg-[#d9d9d9] px-6 py-2 text-[24px] leading-none sm:text-[40px]">
							{scores.mnist}/{scores.max}
						</span>
					</button>
					<button
						className="flex min-h-[480px] flex-col items-center justify-center gap-6 rounded-[5px] bg-[#f80] text-[#0a0a0a] transition-transform duration-200 hover:-translate-y-1"
						onClick={() => onSelect('imagenet')}
						type="button"
					>
						<div
							className={`h-[35px] w-[35px] rounded-[10px] ${unlockProgress.imagenet.unlocked ? 'bg-[#ffe600]' : 'bg-[#40404a]'}`}
							title={`ImageNet: ${unlockProgress.imagenet.foundCount}/10`}
						>
							<span className="sr-only">
								ImageNet {unlockProgress.imagenet.foundCount}/10 found
							</span>
						</div>
						<span className="text-[40px] leading-none tracking-[-0.3125px] sm:text-[64px]">
							ImageNet
						</span>
						<span className="rounded-[10px] bg-[#d9d9d9] px-6 py-2 text-[24px] leading-none sm:text-[40px]">
							{scores.imagenet}/{scores.max}
						</span>
					</button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
