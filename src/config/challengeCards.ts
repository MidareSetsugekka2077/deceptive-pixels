import { getPublicAssetPath } from '../lib/publicAsset';

export interface ChallengeCard {
	title: string;
	description: string;
	cardIcon: string;
	challengeId: number;
	path?: string;
	previewImages?: {
		original: string;
		attacked: string;
		hintAttacked?: string;
	};
	attackDetails: {
		description: string;
		howItWorks: string;
		effectiveness: string;
	};
}

const RAW_CHALLENGE_CARDS: ChallengeCard[] = [
	{
		title: 'Pixel Attack',
		description: 'Find the suspicious pixel.',
		cardIcon: '/icons/pixel_attack.png',
		challengeId: 1,
		path: '/pixel-attack',
		previewImages: {
			original: '/cnn/mnist/original/13_idx12_true2_pred2.png',
			attacked: '/cnn/mnist/pixel/successful_attacks_images/attack_6_attacked_pred7.png',
			hintAttacked: '/hint/pixel_hint.png',
		},
		attackDetails: {
			description: 'Pixel Attack involves modifying one or more pixels in the image.',
			howItWorks:
				'Changes only a tiny number of pixels in the image. For a low resolution image, it is often just one, for higher resolution images, it can be NxN pixels. Attackers can use this to push the classifier toward a wrong prediction.',
			effectiveness:
				'Can be surprisingly effective on image models because small, targeted perturbations may cross decision boundaries with minimal visible change.',
		},
	},
	{
		title: 'Rotation Attack',
		description: 'Find the rotated image.',
		cardIcon: '/icons/rotate_attack.svg',
		challengeId: 2,
		path: '/rotate-attack',
		previewImages: {
			original: '/cnn/mnist/original/14_idx13_true7_pred7.png',
			attacked: '/cnn/mnist/rotate/successful_attacks_images/rotate_attack_7_attacked_pred9_rot15deg.png',
			hintAttacked: '/hint/rotate_hint.png',
		},
		attackDetails: {
			description: 'Rotation Attack involves rotating the image by a certain amount of degrees.',
			howItWorks:
				'Applies small angular rotations to an input image. Even slight changes in orientation can alter feature alignment and confuse models that are not fully rotation-invariant.',
			effectiveness:
				'Often effective against models trained on limited orientation variation. Impact increases when rotation moves key features away from expected positions.',
		},
	},
	{
		title: 'Shift Attack',
		description: 'Find the shifted image.',
		cardIcon: '/icons/shift_attack.svg',
		challengeId: 3,
		path: '/shift-attack',
		previewImages: {
			original: '/cnn/mnist/original/07_idx6_true6_pred6.png',
			attacked: '/cnn/mnist/shift/successful_attacks_images/shift_attack_6_attacked_pred2_dx5_dy-5.png',
			hintAttacked: '/hint/shift_hint.png',
		},
		attackDetails: {
			description: 'Shift Attack involves translating the image up, down, left or right by a certain amount of pixels.',
			howItWorks:
				'Shifts the whole image by a few pixels horizontally or vertically. This small translation can disrupt learned spatial patterns and cause misrecognition',
			effectiveness:
				'Frequently effective when models rely heavily on precise feature placement and have limited robustness to translation.',
		},
	},
	{
		title: 'Random Noise Attack',
		description: 'Find the noisy image.',
		cardIcon: '/icons/noise_attack.svg',
		challengeId: 4,
		path: '/random-noise-attack',
		previewImages: {
			original: '/cnn/mnist/original/15_idx14_true5_pred5.png',
			attacked: '/cnn/mnist/noise/successful_attacks_images/noise_attack_7_attacked_pred3_sigma0.25.png',
			hintAttacked: '/hint/noise_hint.png',
		},
		attackDetails: {
			description: 'Random Noise Attack involves applying random filters to images or changing RGB values of random pixels.',
			howItWorks:
				'Adds random perturbations across many pixels. The overall image still looks similar, but the added noise can distort the features used for classification.',
			effectiveness:
				'Can be effective depending on noise level and model robustness. Higher noise usually increases attack success as more pixels are modified in the process.',
		},
	},
	{
		title: 'Blur Attack',
		description: 'Find the blurred image.',
		cardIcon: '/icons/blur_attack.svg',
		challengeId: 5,
		path: '/blur-attack',
		previewImages: {
			original: '/cnn/mnist/original/16_idx15_true3_pred3.png',
			attacked: '/cnn/mnist/blur/successful_attacks_images/blur_attack_9_attacked_pred5_k5_s1.5.png',
			hintAttacked: '/hint/blur_hint.png',
		},
		attackDetails: {
			description: 'Blur Attack involves applying a Gaussian blur (usually) to an image.',
			howItWorks:
				'Applies blur filters that smooth out edges and high-frequency details. This removes texture cues that many classifiers depend on.',
			effectiveness:
				'Highly effective when classes are distinguished by fine-grained details. Strong blur can significantly drop confidence and accuracy.',
		},
	},
	{
		title: 'Adversarial Patches',
		description: 'Find the misleading patch.',
		cardIcon: '/icons/adversarial_patches.svg',
		challengeId: 6,
		path: '/adversarial-patches',
		previewImages: {
			original: '/cnn/imagenet/original/original_10_true0.png',
			attacked: '/cnn/imagenet/patch/imagenet_successful_attacks_images/patch_attack_8_attacked_pred113_x57_y87.png',
			hintAttacked: '/hint/patch_hint.png',
		},
		attackDetails: {
			description: 'Adversarial Patch Attack involves adding a specially trained patch and placing it on the image.',
			howItWorks:
				'Overlays a crafted patch onto part of the image. The patch is optimized to dominate model attention and steer prediction toward a target or incorrect class.',
			effectiveness:
				'One of the strongest practical attacks because it can remain effective across positions, scales, and real-world viewing conditions.',
		},
	},
	{
		title: 'Emoji Attack',
		description: 'Find the emoji overlay.',
		cardIcon: '/icons/emoji.svg',
		challengeId: 7,
		path: '/emoji-attack',
		previewImages: {
			original: '/cnn/mnist/emoji/successful_attacks_images/emoji_attack_0_original_true8.png',
			attacked: '/cnn/mnist/emoji/successful_attacks_images/emoji_attack_0_attacked_pred3_x10_y4_h8_w8.png',
			hintAttacked: '/cnn/mnist/emoji/successful_attacks_images/emoji_attack_0_attacked_pred3_x10_y4_h8_w8.png',
		},
		attackDetails: {
			description: 'Emoji Attack places a small sticker-like patch on part of the image.',
			howItWorks:
				'Adds a localized visual occlusion at targeted positions. Even when the underlying object is mostly visible, the added patch can redirect model attention and alter prediction.',
			effectiveness:
				'Often effective because the perturbation is high-contrast and structured, making it influential relative to small objects or fine features.',
		},
	},
	{
		title: 'Line Attack',
		description: 'Find the line-perturbed image.',
		cardIcon: '/icons/line.svg',
		challengeId: 8,
		path: '/line-attack',
		previewImages: {
			original: '/cnn/mnist/line/successful_attacks_images/black_line_2_original_true0.png',
			attacked: '/cnn/mnist/line/successful_attacks_images/black_line_2_attacked_pred6_vertical_fixed17_start6_len12.png',
			hintAttacked: '/cnn/mnist/line/successful_attacks_images/black_line_2_attacked_pred6_vertical_fixed17_start6_len12.png',
		},
		attackDetails: {
			description: 'Line Attack draws a dark horizontal or vertical line across the image.',
			howItWorks:
				'Introduces a strong edge feature that interferes with the model\'s learned feature detectors. The line can mask salient regions or create misleading activations.',
			effectiveness:
				'Can be highly effective on models that rely on edge and contour features without robustness to synthetic artifacts.',
		},
	},
	{
		title: 'Mirror Attack',
		description: 'Find the flipped image.',
		cardIcon: '/icons/mirror.svg',
		challengeId: 9,
		path: '/mirror-attack',
		previewImages: {
			original: '/cnn/mnist/mirror/successful_attacks_images/mirror_attack_4_original_true2.png',
			attacked: '/cnn/mnist/mirror/successful_attacks_images/mirror_attack_4_attacked_pred5_vertical.png',
			hintAttacked: '/cnn/mnist/mirror/successful_attacks_images/mirror_attack_4_attacked_pred5_vertical.png',
		},
		attackDetails: {
			description: 'Mirror Attack flips an image horizontally or vertically.',
			howItWorks:
				'Applies geometric reflection to move key features into unfamiliar spatial arrangements. This can disrupt class-specific patterns the model expects.',
			effectiveness:
				'Effective when training data has directional bias and the model lacks invariance to flips.',
		},
	},
];

export const CHALLENGE_CARDS: ChallengeCard[] = RAW_CHALLENGE_CARDS.map((card) => ({
	...card,
	cardIcon: getPublicAssetPath(card.cardIcon),
	previewImages: card.previewImages
		? {
				original: getPublicAssetPath(card.previewImages.original),
				attacked: getPublicAssetPath(card.previewImages.attacked),
				hintAttacked: card.previewImages.hintAttacked
					? getPublicAssetPath(card.previewImages.hintAttacked)
					: undefined,
			}
		: undefined,
}));
