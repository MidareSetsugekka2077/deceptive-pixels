import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

interface HeaderProps {
	title?: string;
	rightContent?: ReactNode;
}

export function Header({ title = 'Deceptive Pixels', rightContent }: HeaderProps) {
	return (
		<div className="mx-auto w-full max-w-[1240px] px-10 pt-5 pb-5">
			<div className="flex items-center justify-between gap-4">
				<Link
					className="flex items-center gap-2"
					to="/"
					aria-label="Go to title screen"
				>
					<div className="flex h-[18px] w-[18px] items-center justify-center bg-white">
						<div className="h-[10px] w-[10px] bg-[#0a0a0a]" />
					</div>
					<p className="text-[32px] font-medium leading-6 tracking-[-0.3125px]">
						{title}
					</p>
				</Link>
				{rightContent ? <div className="flex items-center">{rightContent}</div> : null}
			</div>
		</div>
	);
}
