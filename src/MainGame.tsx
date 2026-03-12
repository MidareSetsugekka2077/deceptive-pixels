import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { Target, X, Zap, Trophy } from 'lucide-react';
import { Dialog, DialogClose, DialogContent } from './components/ui/dialog';
import { Header } from './components/Header';
import { CHALLENGE_CARDS } from './config/challengeCards';
import { CHALLENGES } from './config/challenges';
import type { DatasetKey } from './config/images';
import { useImages } from './hooks/useImages';
import { useGameState } from './hooks/useGameState';
import {
  getStoredScore,
  setFoundAttackedImages,
  setStoredScore,
} from './legacy/challengeScore';

interface MainGameProps {
  fixedChallengeId?: number;
  showChallengeSelection?: boolean;
  dataset?: DatasetKey;
}

export function MainGame({
  fixedChallengeId,
  showChallengeSelection = true,
  dataset = 'mnist',
}: MainGameProps) {
  const maxChallengeScore = 30;
  const [selectedChallenge, setSelectedChallenge] = useState<number | null>(
    fixedChallengeId ?? null,
  );
  const [selectedImageIds, setSelectedImageIds] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [currentAttemptScore, setCurrentAttemptScore] = useState(0);
  const [hintOpen, setHintOpen] = useState(false);
  const { imagePool, resetImages } = useImages(selectedChallenge, dataset);
  const { revealed, reveal, resetPhase } = useGameState();
  const selectedChallengeConfig = selectedChallenge
    ? CHALLENGES.find((challenge) => challenge.id === selectedChallenge)
    : null;
  const selectedChallengeCard = selectedChallenge
    ? CHALLENGE_CARDS.find((card) => card.challengeId === selectedChallenge)
    : null;
  const challengeLabel = selectedChallengeConfig?.title ?? null;
  const hintOriginalImage = selectedChallengeCard?.previewImages?.original;
  const hintAttackedImage = selectedChallengeCard?.previewImages?.hintAttacked;

  useEffect(() => {
    if (fixedChallengeId) {
      setSelectedChallenge(fixedChallengeId);
    }
  }, [fixedChallengeId]);

  useEffect(() => {
    if (!selectedChallenge) {
      setScore(0);
      setCurrentAttemptScore(0);
      return;
    }

    setScore(getStoredScore(selectedChallenge, dataset, maxChallengeScore));
    setCurrentAttemptScore(0);
  }, [selectedChallenge, dataset]);

  const toggleImage = (imgId: string) => {
    if (selectedImageIds.includes(imgId)) {
      setSelectedImageIds(selectedImageIds.filter((id) => id !== imgId));
    } else if (selectedImageIds.length < 3) {
      setSelectedImageIds([...selectedImageIds, imgId]);
    }
  };

  const submitGuess = () => {
    // Calculate points based on correct answers.
    const correctlySelectedAttackedIds = selectedImageIds.filter((id) => {
      const img = imagePool.find((i) => i.id === id);
      return img?.isAttacked;
    });
    const correctCount = correctlySelectedAttackedIds.length;
    const points = correctCount * 10;
    setCurrentAttemptScore(points);
    const nextScore = Math.min(Math.max(score, points), maxChallengeScore);
    setScore(nextScore);
    if (selectedChallenge) {
      setStoredScore(selectedChallenge, dataset, nextScore);
      setFoundAttackedImages(
        selectedChallenge,
        dataset,
        correctlySelectedAttackedIds,
      );
    }
    reveal();
  };

  const reset = () => {
    setSelectedImageIds([]);
    setCurrentAttemptScore(0);
    resetPhase();
    resetImages();
  };

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="min-h-[calc(100vh-2rem)] md:min-h-[calc(100vh-3rem)] border-8 border-[#9c9cb2] rounded-xl p-4 md:p-6">
        <div className="bg-[#cad1d7] rounded-2xl">
          <Header
            isGameplayHeader
            rightContent={
              challengeLabel ? (
                <div className="flex items-center gap-2 text-xl text-muted-foreground">
                  <Badge variant="outline" className="border-[#0d2d43] border-2 text-xl">{challengeLabel}</Badge>
                </div>
              ) : null
            }
          />
          <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Challenge: Select adversarial images that fool the model. Understand the different kinds of adversarial attacks!</CardTitle>
              <CardDescription>
                Extra Challenge: Can you reach 300 points?
              </CardDescription>
            </div>
              <Button onClick={() => setHintOpen(true)} variant="outline" size="sm">
                💡 Hint
              </Button>
            </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Score Display */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg gap-6">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <span>
                Best Score: <strong>{score}/{maxChallengeScore}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-500" />
              <span>
                Current Attempt: <strong>{currentAttemptScore}/{maxChallengeScore}</strong>
              </span>
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
                          variant={challenge.badgeVariant}
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
              <div className="border-2 rounded-lg p-3 bg-background">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium">Pick 3 Images That Were Adversarially Attacked to Fool the CNN Model</h3>
                  <Badge variant="outline">{selectedImageIds.length}/3 selected</Badge>
                </div>
                <div className="grid grid-cols-3 gap-3 justify-items-center">
                  {imagePool.map((img) => {
                    const isSelected = selectedImageIds.includes(img.id);
                    const isCorrect = revealed && img.isAttacked && isSelected;
                    const isWrong = revealed && !img.isAttacked && isSelected;
                    const isMissed = revealed && img.isAttacked && !isSelected;

                    return (
                      <div
                        key={img.id}
                        onClick={() => !revealed && toggleImage(img.id)}
                        className={`relative border-2 rounded-lg p-2 cursor-pointer transition-all max-w-[200px] w-full ${
                          isSelected ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                        } ${isCorrect ? 'border-green-500 bg-green-500/10' : ''} ${
                          isWrong ? 'border-red-500 bg-red-500/10' : ''
                        } ${isMissed ? 'border-yellow-500 bg-yellow-500/10' : ''}`}
                      >
                        <div className="aspect-square bg-muted rounded border flex items-center justify-center mb-1 overflow-hidden">
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
                          {(selectedChallengeConfig?.weaknesses ?? []).map((weakness) => (
                            <li key={weakness}>{weakness}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Hint Dialog */}
          <Dialog open={hintOpen} onOpenChange={setHintOpen}>
            <DialogContent className="bg-[#d9d9d9] border-0 rounded-xl p-8 shadow-none sm:max-w-[617px] [&>button:last-child]:hidden">
              <h2 className="pr-16 text-3xl font-semibold text-[#030213]">💡 Hint</h2>
              <DialogClose
                className="absolute right-6 top-6 inline-flex h-10 w-10 items-center justify-center rounded-full border-[3px] border-[#1d1b20] text-[#1d1b20] transition-colors hover:bg-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 sm:right-8 sm:top-8"
                aria-label="Close"
              >
                <X className="h-7 w-7" strokeWidth={2.75} />
              </DialogClose>
              <div className="flex items-center justify-center gap-4 mt-2">
                <div className="flex flex-col items-center">
                  <p className="text-sm text-[#030213] mb-2">Original</p>
                  {hintOriginalImage ? (
                    <img
                      src={hintOriginalImage}
                      alt={`${selectedChallengeCard?.title ?? 'Challenge'} original hint example`}
                      className="h-[220px] w-[220px] rounded-[5px] border-[10px] border-white object-cover"
                    />
                  ) : (
                    <div className="w-[220px] h-[220px] bg-white rounded-[5px]" />
                  )}
                </div>
                <span className="text-4xl text-[#030213]">→</span>
                <div className="flex flex-col items-center">
                  <p className="text-sm text-[#030213] mb-2">Attacked</p>
                  {hintAttackedImage ? (
                    <img
                      src={hintAttackedImage}
                      alt={`${selectedChallengeCard?.title ?? 'Challenge'} attacked hint example`}
                      className="h-[220px] w-[220px] rounded-[5px] border-[10px] border-white object-cover"
                    />
                  ) : (
                    <div className="w-[220px] h-[220px] bg-white rounded-[5px]" />
                  )}
                </div>
              </div>
              <p className="text-center text-lg text-[#030213] mt-2">
                {selectedChallengeConfig?.hint ?? 'Look for differences between the original and attacked images!'}
              </p>
              <div className="flex justify-center mt-2">
                <Button
                  onClick={() => setHintOpen(false)}
                  className="bg-[#fff200] hover:bg-[#e6d900] text-black font-normal px-8 h-[39px] rounded-[3px] shadow-none"
                >
                  Got it!
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
