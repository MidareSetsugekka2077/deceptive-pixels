import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from './ui/dialog';

interface ResetScoresDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirmReset: () => void;
}

export function ResetScoresDialog({
	open,
	onOpenChange,
	onConfirmReset,
}: ResetScoresDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[460px]">
				<DialogHeader>
					<DialogTitle>Reset all scores?</DialogTitle>
					<DialogDescription>
						This will reset every challenge score for both datasets back to 0. This action cannot be undone.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<button
						className="rounded-md border border-[#a0a0a0] px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-[#efefef]"
						onClick={() => onOpenChange(false)}
						type="button"
					>
						Cancel
					</button>
					<button
						className="rounded-md bg-[#d03232] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#b42b2b]"
						onClick={onConfirmReset}
						type="button"
					>
						Reset Scores
					</button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
