import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Alert, AlertDescription } from './components/ui/alert';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './components/ui/dialog';
import { Target, Zap, Trophy, GraduationCap, BookOpen, ChevronRight, ChevronLeft, Lightbulb } from 'lucide-react';
import { Progress } from './components/ui/progress';

const TUTORIAL_STEPS = [
  {
    id: 0,
    title: 'Welcome to Deceptive Pixels!',
    content: 'In this game, you\'ll learn about the different adversarial attacks you can employ on images in order to fool image recognition models. Ready to deceive some AI models?',
    highlight: null,
  },
  {
    id: 1,
    title: 'What are Adversarial Attacks?',
    content: 'Adversarial Attacks are modifications to images that can trick AI models into making wrong predictions. These modifications range from altering a single pixel to adding patches that are specifically designed to deceive them, we will learn all sorts of attacks in this game.',
    highlight: null,
  },
  {
    id: 2,
    title: 'Understanding CNNs',
    content: 'Convolutional Neural Networks (CNNs) represent a class of deep learning models specifically engineered for processing structured grid data, such as images. CNNs exploit spatial hierarchies in data through a specialized architecture that includes convolutional layers, which apply filters to detect local patterns within the input.',
    highlight: null,
  },
  {
    id: 3,
    title: 'Understanding Vision Transformers',
    content: 'Vision Transformers (ViTs) use attention mechanisms to look at the entire image at once. They understand global context better than CNNs, making them possibly more robust to transformations and less fooled by texture alone.',
    highlight: null,
  },
  {
    id: 4,
    title: 'Your Mission',
    content: 'Your goal is to find images that will fool the CNN model. Look for images with edits, out of place pixels, or unusual orientations. Start by selecting a challenge below!',
    highlight: 'challenges',
  },
  {
    id: 5,
    title: 'Making Your Selection',
    content: 'Once you pick a challenge, you\'ll see a pool of images. Choose 3 images that you think will fool the CNN based on the challenge requirements.',
    highlight: 'images',
  },
  {
    id: 6,
    title: 'Learning from Results',
    content: 'After submitting, you\'ll see which images actually fool the CNN. Green means you were right, red means the image didn\'t fool the CNN, and yellow means you missed one that would have worked. Pay attention to the images that successfully deceive the models!',
    highlight: 'feedback',
  },
  {
    id: 7,
    title: 'Ready to Play!',
    content: 'Now you know the basics! Try different challenges to explore various attacks. Each successful choice earns you points and teaches you more about how these AI models work. Have fun!',
    highlight: null,
  },
];

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
  const [tutorialStep, setTutorialStep] = useState(0);
  const [tutorialCompleted, setTutorialCompleted] = useState(false);

  const startTutorial = () => {
    setTutorialActive(true);
    setTutorialStep(0);
    setSelectedChallenge(null);
    setSelectedImageIds([]);
    setRevealed(false);
  };

  const nextTutorialStep = () => {
    if (tutorialStep < TUTORIAL_STEPS.length - 1) {
      setTutorialStep(tutorialStep + 1);
    } else {
      setTutorialActive(false);
      setTutorialCompleted(true);
    }
  };

  const prevTutorialStep = () => {
    if (tutorialStep > 0) {
      setTutorialStep(tutorialStep - 1);
    }
  };

  const skipTutorial = () => {
    setTutorialActive(false);
    setTutorialCompleted(true);
  };

  const currentTutorialStep = TUTORIAL_STEPS[tutorialStep];

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

      {/* Tutorial Dialog */}
      <Dialog open={tutorialActive} onOpenChange={(open) => !open && skipTutorial()}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <DialogTitle>{currentTutorialStep.title}</DialogTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={skipTutorial}
              >
              </Button>
            </div>
            <div className="space-y-2">
              <Progress value={(tutorialStep / (TUTORIAL_STEPS.length - 1)) * 100} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Step {tutorialStep + 1} of {TUTORIAL_STEPS.length}
              </p>
            </div>
          </DialogHeader>

          <DialogDescription className="text-base leading-relaxed py-4">
            {currentTutorialStep.content}
          </DialogDescription>

          {/* Visual aids for specific steps */}
          {tutorialStep === 2 && (
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <h4 className="flex items-center gap-2">
                <span className="text-red-500">🔴</span> CNN Weaknesses:
              </h4>
              <ul className="text-sm space-y-1 list-disc list-inside ml-4">
                <li>Fooled by similar textures (e.g., muffins vs. dogs)</li>
                <li>Struggles with rotated or upside-down objects</li>
                <li>Focuses on local patterns, misses big picture</li>
              </ul>
            </div>
          )}

          {tutorialStep === 3 && (
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <h4 className="flex items-center gap-2">
                <span className="text-blue-500">🔵</span> ViT Strengths:
              </h4>
              <ul className="text-sm space-y-1 list-disc list-inside ml-4">
                <li>Understands the whole scene context</li>
                <li>More robust to rotation and transformations</li>
                <li>Uses attention to focus on important parts</li>
              </ul>
            </div>
          )}

          {tutorialStep === 4 && (
            <Alert>
              <Target className="h-4 w-4" />
              <AlertDescription>
                <strong>Pro Tip:</strong> Start with an "Easy" challenge like "Texture Trickster" to practice 
                finding images with misleading patterns that fool CNNs.
              </AlertDescription>
            </Alert>
          )}

          {tutorialStep === 5 && (
            <Alert>
              <Lightbulb className="h-4 w-4" />
              <AlertDescription>
                <strong>Think like a CNN:</strong> Ask yourself: "Does this image have confusing textures? 
                Is it rotated oddly? Is the context unexpected?" If yes, it might fool a CNN!
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter className="flex justify-between sm:justify-between">
            <Button
              variant="outline"
              onClick={prevTutorialStep}
              disabled={tutorialStep === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={skipTutorial}>
                Skip Tutorial
              </Button>
              <Button onClick={nextTutorialStep}>
                {tutorialStep === TUTORIAL_STEPS.length - 1 ? (
                  <>
                    <Trophy className="h-4 w-4 mr-2" />
                    Start Playing!
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
