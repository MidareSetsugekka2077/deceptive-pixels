const cardIcon = "https://www.figma.com/api/mcp/asset/17727949-c1cc-4669-be92-462f9ebd6520";

const challengeCards = [
	{
		title: "Pixel Attack",
		description: "Find the suspicious pixel.",
		withIcon: true,
	},
	{ title: "", description: "" },
	{ title: "", description: "" },
	{ title: "", description: "" },
	{ title: "", description: "" },
	{ title: "", description: "" },
	{ title: "", description: "" },
	{ title: "", description: "" },
	{ title: "", description: "" },
];

export function TitleScreen() {
	return (
		<div className="min-h-screen bg-[#d8d8d8] text-black">
			<div className="mx-auto w-full max-w-[1240px] px-5 pb-16 pt-6">
				<div className="flex items-center gap-2">
					<div className="flex h-[18px] w-[18px] items-center justify-center bg-white">
						<div className="h-[10px] w-[10px] bg-[#0a0a0a]" />
					</div>
					<p className="text-[32px] font-medium leading-6 tracking-[-0.3125px]">
						Deceptive Pixels
					</p>
				</div>

				<div className="mt-6 flex flex-col items-center gap-11">
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
								className="rounded-[5px] bg-[#ffe600] px-[66px] py-[20px] text-[32px] font-bold leading-6 tracking-[-0.3125px] text-black"
								type="button"
							>
								Play
							</button>
						</div>
					</section>

					<section className="flex w-full flex-wrap items-center justify-center gap-[25px] px-3 sm:px-[68px]">
						{challengeCards.map((card, index) => (
							<div
								key={`challenge-${index}`}
								className="relative flex h-[250px] w-[250px] flex-col items-start bg-white p-6 text-left"
							>
								{card.withIcon && (
									<div className="mb-6 flex h-[24px] w-[24px] items-center justify-center">
										<img
											alt=""
											className="h-full w-full"
											src={cardIcon}
										/>
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
						))}
					</section>
				</div>
			</div>
		</div>
	);
}
