export interface ChallengeConfig {
  id: number;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Normal' | 'Hard';
  hint: string;
}

export const CHALLENGES: ChallengeConfig[] = [
  {
    id: 1,
    title: 'Pixel Attack',
    description: 'Find images with altered pixels',
    difficulty: 'Normal',
    hint: 'Look for a pixel that is out of place',
  },
  {
    id: 2,
    title: 'Rotation Attack',
    description: 'Find images with rotation',
    difficulty: 'Easy',
    hint: 'Look for images with greater rotation',
  },
  {
    id: 3,
    title: 'Shift Attack',
    description: 'Find images with shifted numbers',
    difficulty: 'Easy',
    hint: 'Look for images that are closer to edges',
  },
];
