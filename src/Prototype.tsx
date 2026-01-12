import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { Alert, AlertDescription } from './components/ui/alert';
import { Lightbulb, Target, Zap, Trophy } from 'lucide-react';

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
    title: 'Context Confuser',
    description: 'Find images where background matters',
    difficulty: 'Medium',
    hint: 'Objects in unexpected environments',
  },
  {
    id: 3,
    title: 'Rotation Master',
    description: 'Find images that confuse CNNs when rotated',
    difficulty: 'Hard',
    hint: 'CNNs are less rotation-invariant',
  },
];

const IMAGE_POOL = [
  {
    id: 1,
    name: 'Cat on keyboard',
    cnnFools: false,
    vitFools: false,
    // Example remote image (replace with local path like '/images/cat.jpg' if you add files to /public/images)
    src: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=800&q=60',
  },
  {
    id: 2,
    name: 'Chihuahua or muffin?',
    cnnFools: true,
    vitFools: false,
    src: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=800&q=60',
  },
  {
    id: 3,
    name: 'Dog underwater',
    cnnFools: false,
    vitFools: false,
    src: 'https://images.unsplash.com/photo-1507149833265-60c372daea22?auto=format&fit=crop&w=800&q=60',
  },
  {
    id: 4,
    name: 'Upside-down bird',
    cnnFools: true,
    vitFools: false,
    src: 'https://images.unsplash.com/photo-1494575194354-3f6d2b2b1f77?auto=format&fit=crop&w=800&q=60',
  },
  {
    id: 5,
    name: 'Camouflaged lizard',
    cnnFools: false,
    vitFools: true,
    src: 'https://images.unsplash.com/photo-1501706362039-c6e8091bf1c6?auto=format&fit=crop&w=800&q=60',
  },
  {
    id: 6,
    name: 'Abstract art',
    cnnFools: true,
    vitFools: true,
    src: 'https://images.unsplash.com/photo-1543340713-6b5b9d24b1bb?auto=format&fit=crop&w=800&q=60',
  },
];

export function Prototype() {
  const [selectedChallenge, setSelectedChallenge] = useState<number | null>(null);
  const [selectedImages, setSelectedImages] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const toggleImage = (imgId: number) => {
    if (selectedImages.includes(imgId)) {
      setSelectedImages(selectedImages.filter((id) => id !== imgId));
    } else if (selectedImages.length < 3) {
      setSelectedImages([...selectedImages, imgId]);
    }
  };

  const submitGuess = () => {
    // Mock scoring logic
    const points = selectedImages.filter((id) => {
      const img = IMAGE_POOL.find((i) => i.id === id);
      return img?.cnnFools;
    }).length * 10;
    setScore(score + points);
    setRevealed(true);
  };

  const reset = () => {
    setSelectedImages([]);
    setRevealed(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Prototype Game</CardTitle>
          <CardDescription>
            Challenge: Select images that fool this model. Understand the different kinds of adversarial attacks!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertDescription>
              <strong>Game Concept:</strong>
            </AlertDescription>
          </Alert>

          {/* Score Display */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-chart-4" />
              <span>Current Score: <strong>{score} points</strong></span>
            </div>
            <Badge variant="secondary">Level 1</Badge>
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
                  <h3>Pick 3 Images That Will Fool the CNN</h3>
                  <Badge variant="outline">{selectedImages.length}/3 selected</Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {IMAGE_POOL.map((img) => {
                    const isSelected = selectedImages.includes(img.id);
                    const isCorrect = revealed && img.cnnFools && isSelected;
                    const isWrong = revealed && !img.cnnFools && isSelected;
                    const isMissed = revealed && img.cnnFools && !isSelected;

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
                            alt={img.name}
                            className="object-cover w-full h-full"
                            onError={(e) => {
                              // Fallback to a placeholder image if the remote image fails to load
                              (e.currentTarget as HTMLImageElement).src = 'https://via.placeholder.com/800?text=Image+Unavailable';
                            }}
                          />
                        </div>
                        <p className="text-sm text-center">{img.name}</p>
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
                    disabled={selectedImages.length !== 3}
                    className="flex-1"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Submit Guess
                  </Button>
                ) : (
                  <Button onClick={reset} className="flex-1" variant="outline">
                    Try Another Challenge
                  </Button>
                )}
              </div>

              {/* Educational Feedback */}
              {revealed && (
                <Card className="border-2 border-primary">
                  <CardHeader>
                    <CardTitle className="text-lg">What You Learned</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h4>🔴 CNN Weaknesses:</h4>
                        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                          <li>Easily fooled by similar textures</li>
                          <li>Sensitive to rotation and orientation</li>
                          <li>Focuses on local patterns over context</li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <h4>🔵 ViT Strengths:</h4>
                        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                          <li>Better at understanding whole scene</li>
                          <li>More robust to transformations</li>
                          <li>Uses global attention mechanism</li>
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
    </div>
  );
}
