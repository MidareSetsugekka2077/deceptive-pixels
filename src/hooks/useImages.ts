import { useCallback, useEffect, useState } from 'react';
import {
  BLUR_ATTACK_IMAGES,
  NOISE_ATTACK_IMAGES,
  PATCH_ATTACK_IMAGES,
  PIXEL_ATTACK_IMAGES,
  ROTATE_ATTACK_IMAGES,
  SHIFT_ATTACK_IMAGES,
} from '../config/images';

export interface ImageItem {
  id: string;
  src: string;
  isAttacked: boolean;
}

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

type ChallengeAssets = {
  imageSet: { original: string[]; attacked: string[] };
  resolveOriginalSrc: (filename: string) => string;
  resolveAttackedSrc: (filename: string) => string;
};

const MNIST_BASE = '/cnn/mnist';
const isMnistOriginal = (filename: string) => filename.includes('_idx');

const challengeAssetsById: Record<number, ChallengeAssets> = {
  1: {
    imageSet: PIXEL_ATTACK_IMAGES,
    resolveOriginalSrc: (filename) =>
      filename.startsWith('failed_')
        ? `${MNIST_BASE}/pixel/failed_attacks_images/${filename}`
        : `${MNIST_BASE}/original/${filename}`,
    resolveAttackedSrc: (filename) => `${MNIST_BASE}/pixel/successful_attacks_images/${filename}`,
  },
  2: {
    imageSet: ROTATE_ATTACK_IMAGES,
    resolveOriginalSrc: (filename) =>
      filename.startsWith('failed_')
        ? `${MNIST_BASE}/rotate/failed_attacks_images/${filename}`
        : `${MNIST_BASE}/original/${filename}`,
    resolveAttackedSrc: (filename) => `${MNIST_BASE}/rotate/successful_attacks_images/${filename}`,
  },
  3: {
    imageSet: SHIFT_ATTACK_IMAGES,
    resolveOriginalSrc: (filename) =>
      filename.startsWith('failed_')
        ? `${MNIST_BASE}/shift/failed_attacks_images/${filename}`
        : `${MNIST_BASE}/original/${filename}`,
    resolveAttackedSrc: (filename) => `${MNIST_BASE}/shift/successful_attacks_images/${filename}`,
  },
  4: {
    imageSet: NOISE_ATTACK_IMAGES,
    resolveOriginalSrc: (filename) => {
      if (isMnistOriginal(filename)) {
        return `${MNIST_BASE}/original/${filename}`;
      }
      return filename.startsWith('failed_')
        ? `${MNIST_BASE}/noise/failed_attacks_images/${filename}`
        : `${MNIST_BASE}/noise/successful_attacks_images/${filename}`;
    },
    resolveAttackedSrc: (filename) =>
      filename.startsWith('failed_')
        ? `${MNIST_BASE}/noise/failed_attacks_images/${filename}`
        : `${MNIST_BASE}/noise/successful_attacks_images/${filename}`,
  },
  5: {
    imageSet: BLUR_ATTACK_IMAGES,
    resolveOriginalSrc: (filename) => {
      if (isMnistOriginal(filename)) {
        return `${MNIST_BASE}/original/${filename}`;
      }
      return filename.startsWith('failed_')
        ? `${MNIST_BASE}/blur/failed_attacks_images/${filename}`
        : `${MNIST_BASE}/blur/successful_attacks_images/${filename}`;
    },
    resolveAttackedSrc: (filename) =>
      filename.startsWith('failed_')
        ? `${MNIST_BASE}/blur/failed_attacks_images/${filename}`
        : `${MNIST_BASE}/blur/successful_attacks_images/${filename}`,
  },
  6: {
    imageSet: PATCH_ATTACK_IMAGES,
    resolveOriginalSrc: (filename) => {
      if (isMnistOriginal(filename)) {
        return `${MNIST_BASE}/original/${filename}`;
      }
      return filename.startsWith('failed_')
        ? `${MNIST_BASE}/patch/failed_attacks_images/${filename}`
        : `${MNIST_BASE}/patch/successful_attacks_images/${filename}`;
    },
    resolveAttackedSrc: (filename) =>
      filename.startsWith('failed_')
        ? `${MNIST_BASE}/patch/failed_attacks_images/${filename}`
        : `${MNIST_BASE}/patch/successful_attacks_images/${filename}`,
  },
};

const randomizeImages = (challengeId: number): ImageItem[] => {
  const assets = challengeAssetsById[challengeId] ?? challengeAssetsById[1];
  const shuffledOriginal = shuffleArray(assets.imageSet.original).slice(0, 3);
  const shuffledAttacked = shuffleArray(assets.imageSet.attacked).slice(0, 3);

  const images: ImageItem[] = [
    ...shuffledOriginal.map((filename) => ({
      id: `original_${filename}`,
      src: assets.resolveOriginalSrc(filename),
      isAttacked: false,
    })),
    ...shuffledAttacked.map((filename) => ({
      id: `attacked_${filename}`,
      src: assets.resolveAttackedSrc(filename),
      isAttacked: true,
    })),
  ];

  return shuffleArray(images);
};

export const useImages = (challengeId: number | null) => {
  const [imagePool, setImagePool] = useState<ImageItem[]>([]);

  const resetImages = useCallback(() => {
    if (!challengeId) {
      setImagePool([]);
      return;
    }
    setImagePool(randomizeImages(challengeId));
  }, [challengeId]);

  useEffect(() => {
    resetImages();
  }, [resetImages]);

  return { imagePool, resetImages };
};
