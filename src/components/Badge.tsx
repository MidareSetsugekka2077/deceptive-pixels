import { useState } from 'react';

interface BadgeProps {
	id: string;
	label: string;
	foundCount: number;
	targetCount: number;
	unlocked: boolean;
	isPinned: boolean;
	onPinnedChange: (id: string) => void;
}

export function Badge({
	id,
	label,
	foundCount,
	targetCount,
	unlocked,
	isPinned,
	onPinnedChange,
}: BadgeProps) {
	const [isHovered, setIsHovered] = useState(false);
	const clampedFoundCount = Math.min(foundCount, targetCount);
	const showTooltip = isHovered || isPinned;

	return (
		<div className="relative">
			<button
				type="button"
				onClick={(event) => {
					event.stopPropagation();
					onPinnedChange(id);
				}}
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
				onFocus={() => setIsHovered(true)}
				onBlur={() => setIsHovered(false)}
				className={`h-[35px] w-[35px] rounded-[10px] transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#0d2d43] ${
					unlocked ? 'bg-[#ffe600]' : 'bg-[#40404a]'
				}`}
				aria-label={`${label} progress ${clampedFoundCount}/${targetCount}`}
			>
				<span className="sr-only">
					{label} {clampedFoundCount} of {targetCount} found
				</span>
			</button>
			{showTooltip && (
				<div className="pointer-events-none absolute bottom-[calc(100%+10px)] left-1/2 z-20 -translate-x-1/2">
					<div className="whitespace-nowrap rounded-[12px] bg-[#0d2d43] px-3 py-2 text-[14px] font-semibold text-white shadow-lg">
						{clampedFoundCount}/{targetCount}
					</div>
					<div className="mx-auto h-0 w-0 border-l-[7px] border-r-[7px] border-t-[8px] border-l-transparent border-r-transparent border-t-[#0d2d43]" />
				</div>
			)}
		</div>
	);
}
