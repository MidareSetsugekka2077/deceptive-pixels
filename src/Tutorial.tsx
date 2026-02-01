import { useState, useEffect } from 'react';
import { Button } from './components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './components/ui/dialog';
import { Alert, AlertDescription } from './components/ui/alert';
import { Progress } from './components/ui/progress';
import { BookOpen, ChevronRight, ChevronLeft, Trophy, Target, Lightbulb } from 'lucide-react';

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
    title: 'Understanding Convolutional Neural Networks (CNNs)',
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

interface TutorialProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

export function Tutorial({ open, onOpenChange, onComplete }: TutorialProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (open) {
      setStep(0);
    }
  }, [open]);

  const nextStep = () => {
    if (step < TUTORIAL_STEPS.length - 1) {
      setStep(step + 1);
    } else {
      onOpenChange(false);
      onComplete();
    }
  };

  const prevStep = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const skip = () => {
    onOpenChange(false);
    onComplete();
  };

  const currentStep = TUTORIAL_STEPS[step];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <DialogTitle>{currentStep.title}</DialogTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={skip}
            >
            </Button>
          </div>
          <div className="space-y-2">
            <Progress value={(step / (TUTORIAL_STEPS.length - 1)) * 100} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Step {step + 1} of {TUTORIAL_STEPS.length}
            </p>
          </div>
        </DialogHeader>

        <DialogDescription className="text-base leading-relaxed py-4">
          {currentStep.content}
        </DialogDescription>

        {/* Visual aids for specific steps */}
        {step === 2 && (
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

        {step === 3 && (
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

        {step === 4 && (
          <Alert>
            <Target className="h-4 w-4" />
            <AlertDescription>
              <strong>Pro Tip:</strong> Start with an "Easy" challenge like "Texture Trickster" to practice
              finding images with misleading patterns that fool CNNs.
            </AlertDescription>
          </Alert>
        )}

        {step === 5 && (
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
            onClick={prevStep}
            disabled={step === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={skip}>
              Skip Tutorial
            </Button>
            <Button onClick={nextStep}>
              {step === TUTORIAL_STEPS.length - 1 ? (
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
  );
}