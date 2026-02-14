import { useCallback, useEffect, useState } from 'react';
import {
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

const randomizeImages = (challengeId: number): ImageItem[] => {
  let imageSet;
  let attackPath;

  switch (challengeId) {
    case 1:
      imageSet = PIXEL_ATTACK_IMAGES;
      attackPath = 'pixel_attack';
      break;
    case 2:
      imageSet = ROTATE_ATTACK_IMAGES;
      attackPath = 'rotate';
      break;
    case 3:
      imageSet = SHIFT_ATTACK_IMAGES;
      attackPath = 'shift_attack';
      break;
    default:
      imageSet = PIXEL_ATTACK_IMAGES;
      attackPath = 'pixel_attack';
  }

  const shuffledOriginal = shuffleArray(imageSet.original).slice(0, 3);
  const shuffledAttacked = shuffleArray(imageSet.attacked).slice(0, 3);

  const images: ImageItem[] = [
    ...shuffledOriginal.map((filename) => ({
      id: `original_${filename}`,
      src: filename.startsWith('failed_')
        ? `/cnn/pixel_attack/failed_attacks/${filename}`
        : `/cnn/original/${filename}`,
      isAttacked: false,
    })),
    ...shuffledAttacked.map((filename) => ({
      id: `attacked_${filename}`,
      src: `/cnn/${attackPath}/successful_attacks/${filename}`,
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
