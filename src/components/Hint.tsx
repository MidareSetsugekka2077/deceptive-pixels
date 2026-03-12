import { ArrowRight, X } from 'lucide-react';
import { Button } from './ui/button';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from './ui/dialog';

interface HintProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title?: string | null;
	hint?: string | null;
	originalImage?: string | null;
	attackedImage?: string | null;
}

export function Hint({
	open,
	onOpenChange,
	title,
	hint,
	originalImage,
	attackedImage,
}: HintProps) {
	const challengeTitle = title ?? 'Challenge';
	const hintText =
		hint ?? 'Look for differences between the original and attacked images!';

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="bg-[#d9d9d9] border-0 rounded-xl p-8 shadow-none sm:max-w-[617px] [&>button:last-child]:hidden">
				<DialogTitle className="pr-16 text-3xl font-semibold text-[#030213]">
					Hint
				</DialogTitle>
				<DialogClose
					className="absolute right-6 top-6 inline-flex h-10 w-10 items-center justify-center rounded-full border-[3px] border-[#1d1b20] text-[#1d1b20] transition-colors hover:bg-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 sm:right-8 sm:top-8"
					aria-label="Close"
				>
					<X className="h-7 w-7" strokeWidth={2.75} />
				</DialogClose>
				<DialogDescription className="sr-only">
					Hint for {challengeTitle}.
				</DialogDescription>
				<div className="mt-2 flex items-center justify-center gap-4">
					<div className="flex flex-col items-center">
						<p className="mb-2 text-sm text-[#030213]">Original</p>
						{originalImage ? (
							<img
								src={originalImage}
								alt={`${challengeTitle} original hint example`}
								className="h-[220px] w-[220px] rounded-[5px] border-[10px] border-white object-cover"
							/>
						) : (
							<div className="h-[220px] w-[220px] rounded-[5px] bg-white" />
						)}
					</div>
					<ArrowRight className="h-10 w-10 text-[#030213]" strokeWidth={2.75} />
					<div className="flex flex-col items-center">
						<p className="mb-2 text-sm text-[#030213]">Attacked</p>
						{attackedImage ? (
							<img
								src={attackedImage}
								alt={`${challengeTitle} attacked hint example`}
								className="h-[220px] w-[220px] rounded-[5px] border-[10px] border-white object-cover"
							/>
						) : (
							<div className="h-[220px] w-[220px] rounded-[5px] bg-white" />
						)}
					</div>
				</div>
				<p className="mt-2 text-center text-lg text-[#030213]">{hintText}</p>
				<div className="mt-2 flex justify-center">
					<Button
						onClick={() => onOpenChange(false)}
						className="bg-[#fff200] hover:bg-[#e6d900] text-black font-normal px-8 h-[39px] rounded-[3px] shadow-none"
					>
						Got it!
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}