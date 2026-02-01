import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { Target, Zap, Trophy, GraduationCap } from 'lucide-react';
import { Tutorial } from './Tutorial';

const CHALLENGES = [
  {
    id: 1,
    title: 'Pixel Attack',
    description: 'Find images with altered pixels',
    difficulty: 'Easy',
    hint: 'Look for a pixel that is out of place',
  },
  {
    id: 2,
    title: 'Pixel Attack',
    description: 'Find images with altered pixels',
    difficulty: 'Easy',
    hint: 'Look for a pixel that is out of place',
  },
  {
    id: 3,
    title: 'Pixel Attack',
    description: 'Find images with altered pixels',
    difficulty: 'Easy',
    hint: 'Look for a pixel that is out of place',
  },
];

// Image lists for pixel attack challenge
const PIXEL_ATTACK_IMAGES = {
  original: [
    '01_idx0_true8_pred8.png',
    '02_idx1_true4_pred4.png',
    '03_idx2_true8_pred8.png',
    '04_idx3_true7_pred7.png',
    '05_idx4_true7_pred7.png',
    '06_idx5_true0_pred0.png',
    '07_idx6_true6_pred6.png',
    '08_idx7_true2_pred2.png',
    '09_idx8_true7_pred7.png',
    '10_idx9_true4_pred4.png',
    '11_idx10_true3_pred3.png',
    '12_idx11_true9_pred9.png',
  ],
  attacked: [
    'attack_0_attacked_pred9.png',
    'attack_1_attacked_pred2.png',
    'attack_2_attacked_pred6.png',
    'attack_3_attacked_pred9.png',
    'attack_4_attacked_pred7.png',
  ],
};

interface ImageItem {
  id: string;
  src: string;
  isAttacked: boolean;
}

// Utility functions
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const randomizeImages = (): ImageItem[] => {
  const shuffledOriginal = shuffleArray(PIXEL_ATTACK_IMAGES.original).slice(0, 3);
  const shuffledAttacked = shuffleArray(PIXEL_ATTACK_IMAGES.attacked).slice(0, 3);

  const images: ImageItem[] = [
    ...shuffledOriginal.map((filename) => ({
      id: `original_${filename}`,
      src: `/cnn/pixel_attack/original/${filename}`,
      isAttacked: false,
    })),
    ...shuffledAttacked.map((filename) => ({
      id: `attacked_${filename}`,
      src: `/cnn/pixel_attack/attacked/${filename}`,
      isAttacked: true,
    })),
  ];

  return shuffleArray(images);
};

export function Prototype() {
  const [selectedChallenge, setSelectedChallenge] = useState<number | null>(null);
  const [imagePool, setImagePool] = useState<ImageItem[]>([]);
  const [selectedImageIds, setSelectedImageIds] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [tutorialActive, setTutorialActive] = useState(false);
  const [tutorialCompleted, setTutorialCompleted] = useState(false);

  const startTutorial = () => {
    setTutorialActive(true);
  };

  // Initialize images when challenge is selected
  useEffect(() => {
    if (selectedChallenge === 1) {
      setImagePool(randomizeImages());
    }
  }, [selectedChallenge]);

  const toggleImage = (imgId: string) => {
    if (selectedImageIds.includes(imgId)) {
      setSelectedImageIds(selectedImageIds.filter((id) => id !== imgId));
    } else if (selectedImageIds.length < 3) {
      setSelectedImageIds([...selectedImageIds, imgId]);
    }
  };

  const submitGuess = () => {
    // Calculate points based on correct answers
    const correctCount = selectedImageIds.filter((id) => {
      const img = imagePool.find((i) => i.id === id);
      return img?.isAttacked;
    }).length;
    const points = correctCount * 10;
    setScore(score + points);
    setRevealed(true);
  };

  const reset = () => {
    setSelectedImageIds([]);
    setRevealed(false);
    // Randomize images again
    setImagePool(randomizeImages());
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Challenge: Select adversarial images that fool the model. Understand the different kinds of adversarial attacks!</CardTitle>
              <CardDescription>
                Extra Challenge: Can you reach 100 points?
              </CardDescription>
            </div>
              {!tutorialCompleted && (
                <Button onClick={startTutorial} variant="outline" size="sm">
                  <GraduationCap className="h-4 w-4 mr-2" />
                  Start Tutorial
                </Button>
              )}
            </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Score Display */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-chart-4" />
              <span>Current Score: <strong>{score} points</strong></span>
            </div>
            {/* <Badge variant="secondary">Level 1</Badge> */}
          </div>

          {/* Challenge Selection */}
          <div className="border-2 border-dashed rounded-lg p-6 bg-background">
            <div className="flex items-center gap-2 mb-4">
              <Target className="h-5 w-5" />
              <h3>Select Your Challenge</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {CHALLENGES.map((challenge) => (
                <Card
                  key={challenge.id}
                  className={`cursor-pointer transition-all ${
                    selectedChallenge === challenge.id ? 'border-2 border-primary shadow-lg' : ''
                  }`}
                  onClick={() => {
                    setSelectedChallenge(challenge.id);
                    reset();
                  }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base">{challenge.title}</CardTitle>
                      <Badge
                        variant={
                          challenge.difficulty === 'Easy'
                            ? 'secondary'
                            : challenge.difficulty === 'Medium'
                            ? 'default'
                            : 'destructive'
                        }
                      >
                        {challenge.difficulty}
                      </Badge>
                    </div>
                    <CardDescription className="text-sm">{challenge.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground italic">💡 {challenge.hint}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Image Pool */}
          {selectedChallenge && (
            <>
              <div className="border-2 rounded-lg p-6 bg-background">
                <div className="flex items-center justify-between mb-4">
                  <h3>Pick 3 Images That Were Adversarially Attacked to Fool the CNN Model</h3>
                  <Badge variant="outline">{selectedImageIds.length}/3 selected</Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {imagePool.map((img) => {
                    const isSelected = selectedImageIds.includes(img.id);
                    const isCorrect = revealed && img.isAttacked && isSelected;
                    const isWrong = revealed && !img.isAttacked && isSelected;
                    const isMissed = revealed && img.isAttacked && !isSelected;

                    return (
                      <div
                        key={img.id}
                        onClick={() => !revealed && toggleImage(img.id)}
                        className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
                          isSelected ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                        } ${isCorrect ? 'border-green-500 bg-green-500/10' : ''} ${
                          isWrong ? 'border-red-500 bg-red-500/10' : ''
                        } ${isMissed ? 'border-yellow-500 bg-yellow-500/10' : ''}`}
                      >
                        <div className="aspect-square bg-muted rounded border flex items-center justify-center mb-2 overflow-hidden">
                          <img
                            src={img.src}
                            alt={img.id}
                            className="object-cover w-full h-full"
                            onError={(e) => {
                              // Fallback to a placeholder image if the image fails to load
                              (e.currentTarget as HTMLImageElement).src = 'https://via.placeholder.com/400?text=Image+Unavailable';
                            }}
                          />
                        </div>
                        {revealed && (
                          <div className="absolute top-2 right-2">
                            {isCorrect && <Badge className="bg-green-600">✓ Correct</Badge>}
                            {isWrong && <Badge className="bg-red-600">✗ Wrong</Badge>}
                            {isMissed && <Badge className="bg-yellow-600">! Missed</Badge>}
                          </div>
                        )}
                        {isSelected && !revealed && (
                          <div className="absolute top-2 right-2">
                            <Badge>Selected</Badge>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                {!revealed ? (
                  <Button
                    onClick={submitGuess}
                    disabled={selectedImageIds.length !== 3}
                    className="flex-1"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Submit Guess
                  </Button>
                ) : (
                  <Button onClick={reset} className="flex-1" variant="outline">
                    Try Again
                  </Button>
                )}
              </div>

              {/* Educational Feedback */}
              {revealed && (
                <Card className="border-2 border-primary">
                  <CardHeader>
                    <CardTitle className="text-lg">In the real world:</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h4>🔴 CNN Model Weaknesses:</h4>
                        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                          <li>Easily fooled by pixel-level perturbations</li>
                          <li>Small imperceptible changes can cause misclassification</li>
                          <li>Adversarial examples are a real security concern</li>
                        </ul>
                      </div>
                      {/* <div className="space-y-2">
                        <h4>🔵 ViT Strengths:</h4>
                        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                          <li>Better robustness to adversarial attacks</li>
                          <li>Transformer architecture sees global context</li>
                          <li>More resistant to pixel-level perturbations</li>
                        </ul>
                      </div> */}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Tutorial Component */}
      <Tutorial
        open={tutorialActive}
        onOpenChange={setTutorialActive}
        onComplete={() => setTutorialCompleted(true)}
      />
    </div>
  );
}
