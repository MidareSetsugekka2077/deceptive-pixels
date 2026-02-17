export interface ChallengeCard {
	title: string;
	description: string;
	cardIcon: string;
	challengeId: number;
	path?: string;
}

export const CHALLENGE_CARDS: ChallengeCard[] = [
	{
		title: 'Pixel Attack',
		description: 'Find the suspicious pixel.',
		cardIcon: '/icons/pixel_attack.png',
		challengeId: 1,
		path: '/pixel-attack',
	},
	{
		title: 'Rotation Attack',
		description: 'Find the rotated image.',
		cardIcon: '/icons/rotate_attack.svg',
		challengeId: 2,
		path: '/rotate-attack',
	},
	{
		title: 'Shift Attack',
		description: 'Find the shifted image.',
		cardIcon: '/icons/shift_attack.svg',
		challengeId: 3,
		path: '/shift-attack',
	},
	{
		title: 'Random Noise Attack',
		description: 'Find the noisy image.',
		cardIcon: '/icons/noise_attack.svg',
		challengeId: 4,
	},
	{
		title: 'Blur Attack',
		description: 'Find the blurred image.',
		cardIcon: '/icons/blur_attack.svg',
		challengeId: 5,
	},
	{
		title: 'Adversarial Patches',
		description: 'Find the misleading patch.',
		cardIcon: '/icons/adversarial_patches.svg',
		challengeId: 6,
	},
];
