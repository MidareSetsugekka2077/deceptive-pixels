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
];
