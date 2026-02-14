import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { Target, Zap, Trophy, GraduationCap } from 'lucide-react';
import { Tutorial } from './Tutorial';
import { Header } from './components/Header';
import { CHALLENGES } from './config/challenges';
import { useImages } from './hooks/useImages';

interface MainGameProps {
  fixedChallengeId?: number;
  showChallengeSelection?: boolean;
}

export function MainGame({ fixedChallengeId, showChallengeSelection = true }: MainGameProps) {
  const [selectedChallenge, setSelectedChallenge] = useState<number | null>(
    fixedChallengeId ?? null,
  );
  const [selectedImageIds, setSelectedImageIds] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [tutorialActive, setTutorialActive] = useState(false);
  const [tutorialCompleted, setTutorialCompleted] = useState(false);
  const { imagePool, resetImages } = useImages(selectedChallenge);

  const startTutorial = () => {
    setTutorialActive(true);
  };

  useEffect(() => {
    if (fixedChallengeId) {
      setSelectedChallenge(fixedChallengeId);
    }
  }, [fixedChallengeId]);

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
    resetImages();
  };

  return (
    <div className="space-y-6">
      <Header />
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Challenge: Select adversarial images that fool the model. Understand the different kinds of adversarial attacks!</CardTitle>
              <CardDescription>
                Extra Challenge: Can you reach 300 points?
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
              <Trophy className="h-5 w-5 text-yellow-500" />
              <span>Current Score: <strong>{score} points</strong></span>
            </div>
          </div>

          {/* Challenge Selection */}
          {showChallengeSelection && !fixedChallengeId && (
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
                              : challenge.difficulty === 'Normal'
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
          )}

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
                          {selectedChallenge === 1 && (
                            <>
                              <li>Easily fooled by pixel-level perturbations</li>
                              <li>Small imperceptible changes can cause misclassification</li>
                              <li>Adversarial examples are a real security concern</li>
                            </>
                          )}
                          {selectedChallenge === 2 && (
                            <>
                              <li>Vulnerable to rotational transformations</li>
                              <li>Small rotations can significantly alter predictions</li>
                              <li>Geometric transformations exploit spatial dependencies</li>
                            </>
                          )}
                          {selectedChallenge === 3 && (
                            <>
                              <li>Sensitive to positional shifts</li>
                              <li>Small translations can cause misclassification</li>
                              <li>Relies heavily on precise spatial positioning</li>
                            </>
                          )}
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
        onComplete={() => setTutorialCompleted(false)}
      />
    </div>
  );
}
