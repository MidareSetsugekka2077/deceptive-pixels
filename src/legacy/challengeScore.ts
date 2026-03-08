import type { DatasetKey } from '../config/images';
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

const LEGACY_PREFIX = 'challengeScore:';
const FOUND_IMAGES_PREFIX = 'challengeFoundImages:';
const ATTACKED_ID_PREFIX = 'attacked_';

const successfulAttackedByChallenge: Record<number, Record<DatasetKey, string[]>> = {
  1: {
    mnist: PIXEL_ATTACK_IMAGES.attacked.filter((name) => !name.startsWith('failed_')),
    imagenet: IMAGENET_PIXEL_ATTACK_IMAGES.attacked.filter(
      (name) => !name.startsWith('failed_'),
    ),
  },
  2: {
    mnist: ROTATE_ATTACK_IMAGES.attacked.filter((name) => !name.startsWith('failed_')),
    imagenet: IMAGENET_ROTATE_ATTACK_IMAGES.attacked.filter(
      (name) => !name.startsWith('failed_'),
    ),
  },
  3: {
    mnist: SHIFT_ATTACK_IMAGES.attacked.filter((name) => !name.startsWith('failed_')),
    imagenet: IMAGENET_SHIFT_ATTACK_IMAGES.attacked.filter(
      (name) => !name.startsWith('failed_'),
    ),
  },
  4: {
    mnist: NOISE_ATTACK_IMAGES.attacked.filter((name) => !name.startsWith('failed_')),
    imagenet: IMAGENET_NOISE_ATTACK_IMAGES.attacked.filter(
      (name) => !name.startsWith('failed_'),
    ),
  },
  5: {
    mnist: BLUR_ATTACK_IMAGES.attacked.filter((name) => !name.startsWith('failed_')),
    imagenet: IMAGENET_BLUR_ATTACK_IMAGES.attacked.filter(
      (name) => !name.startsWith('failed_'),
    ),
  },
  6: {
    mnist: PATCH_ATTACK_IMAGES.attacked.filter((name) => !name.startsWith('failed_')),
    imagenet: IMAGENET_PATCH_ATTACK_IMAGES.attacked.filter(
      (name) => !name.startsWith('failed_'),
    ),
  },
};

const getSuccessfulAttackedImages = (challengeId: number, dataset: DatasetKey) =>
  successfulAttackedByChallenge[challengeId]?.[dataset] ?? [];

const getFoundImagesStorageKey = (challengeId: number, dataset: DatasetKey) =>
  `${FOUND_IMAGES_PREFIX}${dataset}:${challengeId}`;

const getStoredFoundImages = (challengeId: number, dataset: DatasetKey) => {
  if (typeof window === 'undefined') {
    return new Set<string>();
  }

  const stored = localStorage.getItem(getFoundImagesStorageKey(challengeId, dataset));
  if (!stored) {
    return new Set<string>();
  }

  try {
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      return new Set<string>();
    }

    return new Set(
      parsed.filter((value): value is string => typeof value === 'string'),
    );
  } catch {
    return new Set<string>();
  }
};

const toAttackedFilename = (imageId: string) =>
  imageId.startsWith(ATTACKED_ID_PREFIX)
    ? imageId.slice(ATTACKED_ID_PREFIX.length)
    : null;

export const getScoreStorageKey = (challengeId: number, dataset: DatasetKey) =>
  `${LEGACY_PREFIX}${dataset}:${challengeId}`;

export const getStoredScore = (
  challengeId: number,
  dataset: DatasetKey,
  maxScore: number,
) => {
  if (typeof window === 'undefined') {
    return 0;
  }

  const storedScore = localStorage.getItem(getScoreStorageKey(challengeId, dataset));
  if (storedScore !== null) {
    const parsedScore = Number.parseInt(storedScore, 10);
    return Number.isNaN(parsedScore) ? 0 : Math.min(parsedScore, maxScore);
  }

  if (dataset === 'mnist') {
    const legacyScore = localStorage.getItem(`${LEGACY_PREFIX}${challengeId}`);
    const parsedScore = legacyScore ? Number.parseInt(legacyScore, 10) : 0;
    return Number.isNaN(parsedScore) ? 0 : Math.min(parsedScore, maxScore);
  }

  return 0;
};

export const setStoredScore = (
  challengeId: number,
  dataset: DatasetKey,
  score: number,
) => {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem(getScoreStorageKey(challengeId, dataset), String(score));
  if (dataset === 'mnist') {
    localStorage.setItem(`${LEGACY_PREFIX}${challengeId}`, String(score));
  }
};

export const getTotalTrackableAttackedImages = (
  challengeId: number,
  dataset: DatasetKey,
) => getSuccessfulAttackedImages(challengeId, dataset).length;

export const getFoundAttackedImageCount = (
  challengeId: number,
  dataset: DatasetKey,
) => {
  const found = getStoredFoundImages(challengeId, dataset);
  const trackable = new Set(getSuccessfulAttackedImages(challengeId, dataset));

  let count = 0;
  found.forEach((filename) => {
    if (trackable.has(filename)) {
      count += 1;
    }
  });

  return count;
};

export const setFoundAttackedImages = (
  challengeId: number,
  dataset: DatasetKey,
  imageIds: string[],
) => {
  if (typeof window === 'undefined' || imageIds.length === 0) {
    return;
  }

  const trackable = new Set(getSuccessfulAttackedImages(challengeId, dataset));
  const found = getStoredFoundImages(challengeId, dataset);
  let hasNewFound = false;

  imageIds.forEach((id) => {
    const filename = toAttackedFilename(id);
    if (!filename || !trackable.has(filename) || found.has(filename)) {
      return;
    }

    found.add(filename);
    hasNewFound = true;
  });

  if (!hasNewFound) {
    return;
  }

  localStorage.setItem(
    getFoundImagesStorageKey(challengeId, dataset),
    JSON.stringify(Array.from(found)),
  );
};

export const resetAllStoredScores = () => {
  if (typeof window === 'undefined') {
    return;
  }

  // Remove both dataset-specific and legacy challenge score keys.
  const keysToRemove: string[] = [];
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (
      key?.startsWith(LEGACY_PREFIX)
      || key?.startsWith(FOUND_IMAGES_PREFIX)
    ) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach((key) => {
    localStorage.removeItem(key);
  });
};
