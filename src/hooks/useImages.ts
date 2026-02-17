import { useCallback, useEffect, useState } from 'react';
import {
  BLUR_ATTACK_IMAGES,
  IMAGENET_BLUR_ATTACK_IMAGES,
  IMAGENET_NOISE_ATTACK_IMAGES,
  IMAGENET_PATCH_ATTACK_IMAGES,
  IMAGENET_PIXEL_ATTACK_IMAGES,
  IMAGENET_ROTATE_ATTACK_IMAGES,
  IMAGENET_SHIFT_ATTACK_IMAGES,
  NOISE_ATTACK_IMAGES,
  PATCH_ATTACK_IMAGES,
  PIXEL_ATTACK_IMAGES,
  ROTATE_ATTACK_IMAGES,
  SHIFT_ATTACK_IMAGES,
} from '../config/images';
import type { DatasetKey } from '../config/images';

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
const IMAGENET_BASE = '/cnn/imagenet';
const isMnistOriginal = (filename: string) => filename.includes('_idx');
const isImagenetBaseOriginal = (filename: string) => filename.startsWith('original_');

const challengeAssetsById: Record<number, Record<DatasetKey, ChallengeAssets>> = {
  1: {
    mnist: {
      imageSet: PIXEL_ATTACK_IMAGES,
      resolveOriginalSrc: (filename) =>
        filename.startsWith('failed_')
          ? `${MNIST_BASE}/pixel/failed_attacks_images/${filename}`
          : `${MNIST_BASE}/original/${filename}`,
      resolveAttackedSrc: (filename) =>
        `${MNIST_BASE}/pixel/successful_attacks_images/${filename}`,
    },
    imagenet: {
      imageSet: IMAGENET_PIXEL_ATTACK_IMAGES,
      resolveOriginalSrc: (filename) =>
        isImagenetBaseOriginal(filename)
          ? `${IMAGENET_BASE}/original/${filename}`
          : `${IMAGENET_BASE}/3x3/imagenet_failed_attacks_images/${filename}`,
      resolveAttackedSrc: (filename) =>
        `${IMAGENET_BASE}/3x3/imagenet_successful_attacks_images/${filename}`,
    },
  },
  2: {
    mnist: {
      imageSet: ROTATE_ATTACK_IMAGES,
      resolveOriginalSrc: (filename) =>
        filename.startsWith('failed_')
          ? `${MNIST_BASE}/rotate/failed_attacks_images/${filename}`
          : `${MNIST_BASE}/original/${filename}`,
      resolveAttackedSrc: (filename) =>
        `${MNIST_BASE}/rotate/successful_attacks_images/${filename}`,
    },
    imagenet: {
      imageSet: IMAGENET_ROTATE_ATTACK_IMAGES,
      resolveOriginalSrc: (filename) =>
        isImagenetBaseOriginal(filename)
          ? `${IMAGENET_BASE}/original/${filename}`
          : `${IMAGENET_BASE}/rotate/imagenet_failed_attacks_images/${filename}`,
      resolveAttackedSrc: (filename) =>
        filename.startsWith('failed_')
          ? `${IMAGENET_BASE}/rotate/imagenet_failed_attacks_images/${filename}`
          : `${IMAGENET_BASE}/rotate/imagenet_successful_attacks_images/${filename}`,
    },
  },
  3: {
    mnist: {
      imageSet: SHIFT_ATTACK_IMAGES,
      resolveOriginalSrc: (filename) =>
        filename.startsWith('failed_')
          ? `${MNIST_BASE}/shift/failed_attacks_images/${filename}`
          : `${MNIST_BASE}/original/${filename}`,
      resolveAttackedSrc: (filename) =>
        `${MNIST_BASE}/shift/successful_attacks_images/${filename}`,
    },
    imagenet: {
      imageSet: IMAGENET_SHIFT_ATTACK_IMAGES,
      resolveOriginalSrc: (filename) =>
        isImagenetBaseOriginal(filename)
          ? `${IMAGENET_BASE}/original/${filename}`
          : `${IMAGENET_BASE}/shift/imagenet_failed_attacks_images/${filename}`,
      resolveAttackedSrc: (filename) =>
        filename.startsWith('failed_')
          ? `${IMAGENET_BASE}/shift/imagenet_failed_attacks_images/${filename}`
          : `${IMAGENET_BASE}/shift/imagenet_successful_attacks_images/${filename}`,
    },
  },
  4: {
    mnist: {
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
    imagenet: {
      imageSet: IMAGENET_NOISE_ATTACK_IMAGES,
      resolveOriginalSrc: (filename) =>
        isImagenetBaseOriginal(filename)
          ? `${IMAGENET_BASE}/original/${filename}`
          : `${IMAGENET_BASE}/noise/imagenet_successful_attacks_images/${filename}`,
      resolveAttackedSrc: (filename) =>
        filename.startsWith('failed_')
          ? `${IMAGENET_BASE}/noise/imagenet_failed_attacks_images/${filename}`
          : `${IMAGENET_BASE}/noise/imagenet_successful_attacks_images/${filename}`,
    },
  },
  5: {
    mnist: {
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
    imagenet: {
      imageSet: IMAGENET_BLUR_ATTACK_IMAGES,
      resolveOriginalSrc: (filename) =>
        isImagenetBaseOriginal(filename)
          ? `${IMAGENET_BASE}/original/${filename}`
          : `${IMAGENET_BASE}/blur/imagenet_successful_attacks_images/${filename}`,
      resolveAttackedSrc: (filename) =>
        filename.startsWith('failed_')
          ? `${IMAGENET_BASE}/blur/imagenet_failed_attacks_images/${filename}`
          : `${IMAGENET_BASE}/blur/imagenet_successful_attacks_images/${filename}`,
    },
  },
  6: {
    mnist: {
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
    imagenet: {
      imageSet: IMAGENET_PATCH_ATTACK_IMAGES,
      resolveOriginalSrc: (filename) =>
        isImagenetBaseOriginal(filename)
          ? `${IMAGENET_BASE}/original/${filename}`
          : `${IMAGENET_BASE}/patch/imagenet_successful_attacks_images/${filename}`,
      resolveAttackedSrc: (filename) =>
        filename.startsWith('failed_')
          ? `${IMAGENET_BASE}/patch/imagenet_failed_attacks_images/${filename}`
          : `${IMAGENET_BASE}/patch/imagenet_successful_attacks_images/${filename}`,
    },
  },
};

const randomizeImages = (challengeId: number, dataset: DatasetKey): ImageItem[] => {
  const assets = challengeAssetsById[challengeId]?.[dataset] ??
    challengeAssetsById[1].mnist;
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

export const useImages = (challengeId: number | null, dataset: DatasetKey) => {
  const [imagePool, setImagePool] = useState<ImageItem[]>([]);

  const resetImages = useCallback(() => {
    if (!challengeId) {
      setImagePool([]);
      return;
    }
    setImagePool(randomizeImages(challengeId, dataset));
  }, [challengeId, dataset]);

  useEffect(() => {
    resetImages();
  }, [resetImages]);

  return { imagePool, resetImages };
};
