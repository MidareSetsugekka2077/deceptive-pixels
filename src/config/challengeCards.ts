export interface ChallengeCard {
	title: string;
	description: string;
	cardIcon: string;
	path?: string;
}

export const CHALLENGE_CARDS: ChallengeCard[] = [
	{
		title: 'Pixel Attack',
		description: 'Find the suspicious pixel.',
		cardIcon: '/icons/pixel_attack.png',
		path: '/pixel-attack',
	},
	{
		title: 'Rotate Attack',
		description: 'Find the rotated image.',
		cardIcon: '/icons/rotate_attack.svg',
		path: '/rotate-attack',
	},
	{
		title: 'Shift Attack',
		description: 'Find the shifted image.',
		cardIcon: '/icons/shift_attack.svg',
		path: '/shift-attack',
	},
	{
		title: 'Random Noise Attack',
		description: 'Find the noisy image.',
		cardIcon: '/icons/noise_attack.svg',
	},
	{
		title: 'Blur Attack',
		description: 'Find the blurred image.',
		cardIcon: '/icons/blur_attack.svg',
	},
	{
		title: 'Adversarial Patches',
		description: 'Find the misleading patch.',
		cardIcon: '/icons/adversarial_patches.svg',
	},
];
