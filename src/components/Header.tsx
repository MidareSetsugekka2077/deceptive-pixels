import { Link, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import {
	getDatasetFoundAttackedImageCount,
	getDatasetTotalTrackableAttackedImages,
} from '../legacy/challengeScore';

interface HeaderProps {
	title?: string;
	username?: string;
	rightContent?: ReactNode;
	isGameplayHeader?: boolean;
}

interface DatasetProgressBarProps {
	label: string;
	foundCount: number;
	totalCount: number;
}

function DatasetProgressBar({ label, foundCount, totalCount }: DatasetProgressBarProps) {
	const progressRatio = totalCount > 0 ? Math.min(foundCount / totalCount, 1) : 0;
	const progressWidth = `${Math.round(progressRatio * 100)}%`;

	return (
		<div className="flex w-full items-center gap-2">
			<p className="w-[88px] shrink-0 whitespace-nowrap text-right text-[14px] font-medium leading-5 tracking-[-0.25px] sm:w-[110px] sm:text-[20px] sm:leading-6 sm:tracking-[-0.3125px]">
				{label}
			</p>
			<div className="h-[10px] flex-1 rounded-[2px] bg-white sm:h-[13px]">
				<div
					className="h-full rounded-[2px] bg-[#0a0a0a]"
					style={{ width: progressWidth }}
				/>
			</div>
			<span className="min-w-[42px] text-[10px] font-medium leading-3 sm:text-[12px]">{foundCount}/{totalCount}</span>
		</div>
	);
}

export function Header({
	title = 'Deceptive Pixels',
	username = 'User123',
	rightContent,
	isGameplayHeader = false,
}: HeaderProps) {
	const location = useLocation();
	const isTitlePage = location.pathname === '/';
	const isGalleryPage = location.pathname === '/gallery';

	const datasetProgress = {
		mnistFound: getDatasetFoundAttackedImageCount('mnist'),
		imagenetFound: getDatasetFoundAttackedImageCount('imagenet'),
		mnistTotal: getDatasetTotalTrackableAttackedImages('mnist'),
		imagenetTotal: getDatasetTotalTrackableAttackedImages('imagenet'),
	};

	if (isGameplayHeader) {
		return (
			<div className="w-full bg-[#d8d8d8]">
				<div className="mx-auto flex w-full max-w-[1240px] items-center justify-between gap-4 px-4 py-3 sm:px-6 md:min-h-[67px] md:px-10 md:py-0">
					<div
						className={`flex min-h-[67px] items-center px-4 sm:px-[22px] ${
							isTitlePage ? 'bg-[rgba(174,174,174,0.65)]' : ''
						}`}
					>
						<Link
							className="flex items-center gap-2"
							to="/"
							aria-label="Go to title screen"
						>
							<div className="flex h-[18px] w-[18px] items-center justify-center bg-white">
								<div className="h-[10px] w-[10px] bg-[#0a0a0a]" />
							</div>
							<p className="text-[30px] font-medium leading-6 tracking-[-0.3125px] sm:text-[32px]">
								{title}
							</p>
						</Link>
					</div>

					{rightContent ? <div className="flex items-center">{rightContent}</div> : null}
				</div>
			</div>
		);
	}

	return (
		<div className="w-full bg-[#d8d8d8]">
			<div className="mx-auto flex w-full max-w-[1240px] flex-col gap-3 px-4 py-3 sm:px-6 md:flex-row md:items-center md:justify-between md:gap-4 md:px-10 md:py-0">
				<div className="flex min-h-[67px] flex-wrap items-center gap-4 sm:gap-1">
					<div
						className={`flex min-h-[67px] items-center px-4 sm:px-[22px] ${
							isTitlePage ? 'bg-[rgba(174,174,174,0.65)]' : ''
						}`}
					>
						<Link
							className="flex items-center gap-2"
							to="/"
							aria-label="Go to title screen"
						>
							<div className="flex h-[18px] w-[18px] items-center justify-center bg-white">
								<div className="h-[10px] w-[10px] bg-[#0a0a0a]" />
							</div>
							<p className="text-[30px] font-medium leading-6 tracking-[-0.3125px] sm:text-[32px]">
								{title}
							</p>
						</Link>
					</div>

					<div
						className={`flex min-h-[67px] items-center px-4 sm:px-[22px] ${
							isGalleryPage ? 'bg-[rgba(174,174,174,0.65)]' : ''
						}`}
					>
						<Link
							to="/gallery"
							className="text-[30px] font-medium leading-6 tracking-[-0.3125px] sm:text-[32px]"
						>
							Gallery
						</Link>
					</div>
					<button
						type="button"
						className="text-[30px] font-medium leading-6 tracking-[-0.3125px] sm:text-[32px]"
					>
						Help
					</button>

					{rightContent ? <div className="flex items-center">{rightContent}</div> : null}
				</div>

				<div className="flex items-center justify-between gap-3 self-stretch md:self-auto">
					<div className="flex w-full max-w-[320px] flex-col gap-[3px] sm:w-[260px]">
						<DatasetProgressBar
							label="MNIST"
							foundCount={datasetProgress.mnistFound}
							totalCount={datasetProgress.mnistTotal}
						/>
						<DatasetProgressBar
							label="ImageNet"
							foundCount={datasetProgress.imagenetFound}
							totalCount={datasetProgress.imagenetTotal}
						/>
					</div>
					<p className="text-[18px] font-medium leading-6 tracking-[-0.3125px] sm:text-[20px]">
						{username}
					</p>
				</div>
			</div>
		</div>
	);
}
