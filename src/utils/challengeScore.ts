import type { DatasetKey } from '../config/images';

const LEGACY_PREFIX = 'challengeScore:';

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
