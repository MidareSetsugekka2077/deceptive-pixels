export interface ChallengeConfig {
  id: number;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Normal' | 'Hard';
  badgeVariant: 'secondary' | 'default' | 'destructive';
  hint: string;
  weaknesses: string[];
}

export const CHALLENGES: ChallengeConfig[] = [
  {
    id: 1,
    title: 'Pixel Attack',
    description: 'Find images with altered pixels',
    difficulty: 'Normal',
    badgeVariant: 'default',
    hint: 'Look for a pixel that is out of place',
    weaknesses: [
      'Easily fooled by pixel-level perturbations',
      'Small imperceptible changes can cause misclassification',
      'Adversarial examples are a real security concern',
    ],
  },
  {
    id: 2,
    title: 'Rotation Attack',
    description: 'Find images with rotation',
    difficulty: 'Easy',
    badgeVariant: 'secondary',
    hint: 'Look for images with greater rotation',
    weaknesses: [
      'Vulnerable to rotational transformations',
      'Small rotations can significantly alter predictions',
      'Geometric transformations exploit spatial dependencies',
    ],
  },
  {
    id: 3,
    title: 'Shift Attack',
    description: 'Find images with shifted numbers',
    difficulty: 'Easy',
    badgeVariant: 'secondary',
    hint: 'Look for images that are closer to edges',
    weaknesses: [
      'Sensitive to positional shifts',
      'Small translations can cause misclassification',
      'Relies heavily on precise spatial positioning',
    ],
  },
  {
    id: 4,
    title: 'Random Noise Attack',
    description: 'Find images with noisy pixels',
    difficulty: 'Easy',
    badgeVariant: 'secondary',
    hint: 'Look for images that feel noisy with many altered pixels',
    weaknesses: [
      'Environments are often noisy and CNNs are not always trained to classify noisy images',
      'Perceptible changes can also cause misclassification',
      'Adversarial examples are a real security concern',
    ],
  },
  {
    id: 5,
    title: 'Blur Attack',
    description: 'Find blurred images',
    difficulty: 'Easy',
    badgeVariant: 'secondary',
    hint: 'Look for images that are more blurry than others',
    weaknesses: [
      'CNNs cannot recognise blurry images if they were not trained to do so',
      'Blurred images alters almost all pixels which is an unexpected input',
      'Even a slight blur can be very effective in fooling CNNs',
    ],
  },
  {
    id: 6,
    title: 'Adversarial Patches',
    description: 'Find images with a weird patch',
    difficulty: 'Easy',
    badgeVariant: 'secondary',
    hint: 'Look for images that have a weird looking sticker',
    weaknesses: [
      'Very effective against CNNs',
      'The same adversarial patch can cause most CNNs to misclassify',
      'Does not require prior knowledge of original image to attack successfully',
    ],
  },
  {
    id: 7,
    title: 'Emoji Attack',
    description: 'Find images with emoji overlays',
    difficulty: 'Easy',
    badgeVariant: 'secondary',
    hint: 'Look for sticker-like overlays on the image',
    weaknesses: [
      'Occlusions can hide key features from the model',
      'Localized perturbations can still dominate model predictions',
      'Models can over-focus on high-contrast patterns',
    ],
  },
  {
    id: 8,
    title: 'Line Attack',
    description: 'Find images with adversarial lines',
    difficulty: 'Easy',
    badgeVariant: 'secondary',
    hint: 'Look for unnatural straight lines crossing the image',
    weaknesses: [
      'Simple structural artifacts can disrupt classification',
      'Models can be sensitive to high-contrast edges',
      'Small geometric changes can shift feature activations',
    ],
  },
  {
    id: 9,
    title: 'Mirror Attack',
    description: 'Find mirrored or flipped images',
    difficulty: 'Easy',
    badgeVariant: 'secondary',
    hint: 'Look for left-right or up-down symmetry changes',
    weaknesses: [
      'Orientation changes can break learned feature alignment',
      'Models may not generalize to mirrored variants',
      'Spatial priors can make flip-based attacks effective',
    ],
  },
];
