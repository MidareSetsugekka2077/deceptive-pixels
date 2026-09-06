import { useState } from 'react';
import { ArrowLeft, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from './components/ui/card';
import { Button } from './components/ui/button';
import {
  IMAGENET_PIXEL_ATTACK_IMAGES,
  type DatasetKey,
} from './config/images';
import { getPublicAssetPath } from './lib/publicAsset';
import { trackAnalyticsEvent } from './lib/analytics';

type AttackKey =
  | 'pixel'
  | 'rotation'
  | 'shift'
  | 'noise'
  | 'blur'
  | 'patch'
  | 'emoji'
  | 'line'
  | 'mirror';

type SandboxSample = {
  id: string;
  label: string;
  originalFilename: string;
  originalSrc: string;
  trueLabel: string | null;
  originalPrediction: string | null;
};

type GeneratedAttack = {
  src: string;
  originalDataUrl: string;
  location: string;
  changedPixels: number;
  generatedAt: number;
};

type ImageSize = {
  width: number;
  height: number;
};

type ShiftBounds = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
};

type PixelAttackPosition = {
  x: number;
  y: number;
  channel: number;
};

type PixelPositionInput = {
  x: string;
  y: string;
};

type PatchAttackPosition = {
  x: number;
  y: number;
};

type PatchPositionInput = {
  x: string;
  y: string;
};

type EmojiAttackPosition = {
  x: number;
  y: number;
};

type EmojiPositionInput = {
  x: string;
  y: string;
};

type LineOrientation = 'horizontal' | 'vertical';

type MirrorDirection = 'horizontal' | 'vertical';

type ShiftOffsetInput = {
  dx: string;
  dy: string;
};

type BlurSettingsInput = {
  kernel: string;
  sigma: string;
};

type ClassificationState =
  | { status: 'idle' }
  | { status: 'pending' }
  | {
      status: 'ready';
      prediction: string;
      predictionLabel: string | null;
      confidence: number;
      success: boolean | null;
      baselinePrediction: string | null;
      baselineLabel: string | null;
      baselineConfidence: number | null;
    }
  | { status: 'error'; message: string };

const datasetOptions: { key: DatasetKey; label: string }[] = [
  { key: 'mnist', label: 'MNIST' },
  { key: 'imagenet', label: 'ImageNet' },
];

const attackOptions: { key: AttackKey; label: string }[] = [
  { key: 'pixel', label: 'Pixel Attack' },
  { key: 'rotation', label: 'Rotation Attack' },
  { key: 'shift', label: 'Shift Attack' },
  { key: 'noise', label: 'Random Noise Attack' },
  { key: 'blur', label: 'Blur Attack' },
  { key: 'patch', label: 'Adversarial Patches Attack' },
  { key: 'emoji', label: 'Emoji Attack' },
  { key: 'line', label: 'Line Attack' },
  { key: 'mirror', label: 'Mirror Attack' },
];

const MNIST_BASE = getPublicAssetPath('/cnn/mnist');
const IMAGENET_BASE = getPublicAssetPath('/cnn/imagenet');
const configuredSandboxApiBaseUrl = import.meta.env.VITE_SANDBOX_API_URL;
const SANDBOX_API_BASE_URL =
  typeof configuredSandboxApiBaseUrl === 'string' &&
  configuredSandboxApiBaseUrl.length > 0
    ? configuredSandboxApiBaseUrl.replace(/\/$/, '')
    : import.meta.env.DEV
      ? 'http://127.0.0.1:8000'
      : '';
const SANDBOX_API_UNAVAILABLE_MESSAGE =
  'CNN classification backend is not available for this deployed site. Run the Python sandbox API locally, or deploy it separately and set VITE_SANDBOX_API_URL.';
const MNIST_PIXEL_PATCH_SIZE = 3;
const IMAGENET_PIXEL_PATCH_SIZE = 5;
const MNIST_ADVERSARIAL_PATCH_SIZE = 8;
const IMAGENET_ADVERSARIAL_PATCH_SIZE = 20;
const MNIST_EMOJI_SIZE = 8;
const IMAGENET_EMOJI_SIZE = 20;
const EMOJI_ATTACK_SYMBOL = String.fromCodePoint(0x1f604);
const EMOJI_FONT_STACK =
  '"Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif';
const LINE_ORIENTATIONS: LineOrientation[] = ['horizontal', 'vertical'];
const MIRROR_DIRECTIONS: MirrorDirection[] = ['horizontal', 'vertical'];
const DEFAULT_ROTATION_ATTACK_ANGLE = 0;
const DEFAULT_SHIFT_ATTACK_OFFSET = 0;
const MNIST_NOISE_SIGMAS = [0.05, 0.1, 0.15, 0.2, 0.25];
const IMAGENET_NOISE_SIGMAS = [0.02, 0.04, 0.06, 0.08, 0.1];
const DEFAULT_BLUR_KERNEL_SIZE = 5;
const DEFAULT_BLUR_SIGMA = 1;
const MAX_BLUR_KERNEL_SIZE = 31;
const MIN_BLUR_SIGMA = 0.1;
const MAX_BLUR_SIGMA = 10;

const adversarialPatchSources = {
  mnist: `${MNIST_BASE}/patch.png`,
  imagenet: `${IMAGENET_BASE}/patch.png`,
} satisfies Record<DatasetKey, string>;

const pixelChannelOptions = [
  { value: 0, label: 'Red' },
  { value: 1, label: 'Green' },
  { value: 2, label: 'Blue' },
];

const MNIST_ORIGINAL_FILES = [
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
  '13_idx12_true2_pred2.png',
  '14_idx13_true7_pred7.png',
  '15_idx14_true5_pred5.png',
  '16_idx15_true3_pred3.png',
];

const IMAGENET_ORIGINAL_FILES = IMAGENET_PIXEL_ATTACK_IMAGES.original.filter(
  (filename) => filename.startsWith('original_'),
);

const parseField = (filename: string, field: 'true' | 'pred') => {
  const match = filename.match(new RegExp(`${field}(\\d+)`));
  return match?.[1] ?? null;
};

const clampNumber = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const toIntegerInput = (value: string) => {
  const nextValue = Number(value);
  return Number.isFinite(nextValue) ? Math.round(nextValue) : 0;
};

const toNumberInput = (value: string) => {
  const nextValue = Number(value);
  return Number.isFinite(nextValue) ? nextValue : 0;
};

const getPixelPatchSize = (dataset: DatasetKey) =>
  dataset === 'mnist' ? MNIST_PIXEL_PATCH_SIZE : IMAGENET_PIXEL_PATCH_SIZE;

const getAdversarialPatchSize = (dataset: DatasetKey) =>
  dataset === 'mnist'
    ? MNIST_ADVERSARIAL_PATCH_SIZE
    : IMAGENET_ADVERSARIAL_PATCH_SIZE;

const getEmojiSize = (dataset: DatasetKey) =>
  dataset === 'mnist' ? MNIST_EMOJI_SIZE : IMAGENET_EMOJI_SIZE;

const getNoiseSigmas = (dataset: DatasetKey) =>
  dataset === 'mnist' ? MNIST_NOISE_SIGMAS : IMAGENET_NOISE_SIGMAS;

const getBlurKernelMax = (imageSize: ImageSize | null) => {
  const maxKernelSize = imageSize
    ? Math.min(MAX_BLUR_KERNEL_SIZE, imageSize.width, imageSize.height)
    : MAX_BLUR_KERNEL_SIZE;

  if (maxKernelSize <= 1) {
    return 1;
  }

  return maxKernelSize % 2 === 0 ? maxKernelSize - 1 : maxKernelSize;
};

const getClampedBlurKernelSize = (value: number, maxKernelSize: number) => {
  const clampedKernelSize = clampNumber(
    Math.round(value),
    1,
    Math.max(1, maxKernelSize),
  );

  if (clampedKernelSize % 2 === 1) {
    return clampedKernelSize;
  }

  if (clampedKernelSize >= maxKernelSize) {
    return Math.max(1, clampedKernelSize - 1);
  }

  return clampedKernelSize + 1;
};

const getClampedBlurSigma = (value: number) =>
  clampNumber(value, MIN_BLUR_SIGMA, MAX_BLUR_SIGMA);

const getBlurKernelSizeFromInput = (value: string, maxKernelSize: number) =>
  getClampedBlurKernelSize(
    value === '' ? DEFAULT_BLUR_KERNEL_SIZE : toIntegerInput(value),
    maxKernelSize,
  );

const getBlurSigmaFromInput = (value: string) =>
  getClampedBlurSigma(
    value === '' ? DEFAULT_BLUR_SIGMA : toNumberInput(value),
  );

const makeGaussianKernel = (kernelSize: number, sigma: number) => {
  const radius = Math.floor(kernelSize / 2);
  const kernel: number[] = [];
  let sum = 0;

  for (let i = -radius; i <= radius; i += 1) {
    const value = Math.exp(-(i * i) / (2 * sigma * sigma));
    kernel.push(value);
    sum += value;
  }

  return kernel.map((value) => value / sum);
};

const getRandomItem = <T,>(items: readonly T[]) =>
  items[Math.floor(Math.random() * items.length)] ?? items[0];

const getGaussianRandom = () => {
  let u = 0;
  let v = 0;

  while (u === 0) {
    u = Math.random();
  }

  while (v === 0) {
    v = Math.random();
  }

  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};

const getClampedPixelPosition = (
  position: PixelAttackPosition,
  width: number,
  height: number,
  patchSize: number,
): PixelAttackPosition => {
  const maxX = Math.max(0, width - patchSize);
  const maxY = Math.max(0, height - patchSize);

  return {
    x: clampNumber(Math.round(position.x), 0, maxX),
    y: clampNumber(Math.round(position.y), 0, maxY),
    channel: clampNumber(Math.round(position.channel), 0, 2),
  };
};

const getClampedPatchPosition = (
  position: PatchAttackPosition,
  width: number,
  height: number,
  patchSize: number,
): PatchAttackPosition => ({
  x: clampNumber(Math.round(position.x), 0, Math.max(0, width - patchSize)),
  y: clampNumber(Math.round(position.y), 0, Math.max(0, height - patchSize)),
});

const getClampedEmojiPosition = (
  position: EmojiAttackPosition,
  width: number,
  height: number,
  emojiSize: number,
): EmojiAttackPosition => ({
  x: clampNumber(Math.round(position.x), 0, Math.max(0, width - emojiSize)),
  y: clampNumber(Math.round(position.y), 0, Math.max(0, height - emojiSize)),
});

const getShiftBounds = (imageSize: ImageSize | null): ShiftBounds => {
  if (!imageSize) {
    return {
      minX: 0,
      maxX: 0,
      minY: 0,
      maxY: 0,
    };
  }

  return {
    minX: 1 - imageSize.width,
    maxX: imageSize.width - 1,
    minY: 1 - imageSize.height,
    maxY: imageSize.height - 1,
  };
};

const getClampedShiftOffset = (
  offsetInput: ShiftOffsetInput,
  bounds: ShiftBounds,
) => ({
  dx: clampNumber(toIntegerInput(offsetInput.dx), bounds.minX, bounds.maxX),
  dy: clampNumber(toIntegerInput(offsetInput.dy), bounds.minY, bounds.maxY),
});

const formatImageLabel = (index: number) =>
  `image_${String(index + 1).padStart(2, '0')}`;

const makeMnistPixelSamples = (): SandboxSample[] =>
  MNIST_ORIGINAL_FILES.map((originalFilename, index) => {
    const trueLabel = parseField(originalFilename, 'true');

    return {
      id: `mnist-original-${index}`,
      label: formatImageLabel(index),
      originalFilename,
      originalSrc: `${MNIST_BASE}/original/${originalFilename}`,
      trueLabel,
      originalPrediction: parseField(originalFilename, 'pred') ?? trueLabel,
    };
  });

const makeImagenetPixelSamples = (): SandboxSample[] =>
  IMAGENET_ORIGINAL_FILES.map((originalFilename, index) => {
    const trueLabel = parseField(originalFilename, 'true');

    return {
      id: `imagenet-original-${index}`,
      label: formatImageLabel(index),
      originalFilename,
      originalSrc: `${IMAGENET_BASE}/original/${originalFilename}`,
      trueLabel,
      originalPrediction: trueLabel,
    };
  });

const sandboxSamplesByDataset: Record<DatasetKey, SandboxSample[]> = {
  mnist: makeMnistPixelSamples(),
  imagenet: makeImagenetPixelSamples(),
};

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Could not load selected image'));
    image.src = src;
  });

type ClassifyResult = {
  prediction: number;
  predictionLabel?: string | null;
  confidence: number;
  success: boolean | null;
  baselinePrediction?: number | null;
  baselineLabel?: string | null;
  baselineConfidence?: number | null;
};

const applyPixelAttack = async (
  imageSrc: string,
  dataset: DatasetKey,
  position: PixelAttackPosition,
): Promise<GeneratedAttack> => {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement('canvas');
  const width = image.naturalWidth;
  const height = image.naturalHeight;
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Canvas is not available');
  }

  context.drawImage(image, 0, 0);
  const originalDataUrl = canvas.toDataURL('image/png');
  const imageData = context.getImageData(0, 0, width, height);
  const { data } = imageData;

  if (dataset === 'mnist') {
    const patchSize = Math.min(getPixelPatchSize(dataset), width, height);
    const { x, y } = getClampedPixelPosition(
      position,
      width,
      height,
      patchSize,
    );
    let total = 0;

    for (let patchY = y; patchY < y + patchSize; patchY += 1) {
      for (let patchX = x; patchX < x + patchSize; patchX += 1) {
        const offset = (patchY * width + patchX) * 4;
        total += data[offset] + data[offset + 1] + data[offset + 2];
      }
    }

    const changedPixels = patchSize * patchSize;
    const average = total / (changedPixels * 3);
    const newValue = average < 128 ? 255 : 0;

    for (let patchY = y; patchY < y + patchSize; patchY += 1) {
      for (let patchX = x; patchX < x + patchSize; patchX += 1) {
        const offset = (patchY * width + patchX) * 4;
        data[offset] = newValue;
        data[offset + 1] = newValue;
        data[offset + 2] = newValue;
      }
    }

    context.putImageData(imageData, 0, 0);

    return {
      src: canvas.toDataURL('image/png'),
      originalDataUrl,
      location: `x ${x}, y ${y}, size ${patchSize}x${patchSize}`,
      changedPixels,
      generatedAt: Date.now(),
    };
  }

  const patchSize = Math.min(getPixelPatchSize(dataset), width, height);
  const { x, y, channel } = getClampedPixelPosition(
    position,
    width,
    height,
    patchSize,
  );
  const channelLabel = pixelChannelOptions[channel]?.label ?? String(channel);
  let total = 0;

  for (let patchY = y; patchY < y + patchSize; patchY += 1) {
    for (let patchX = x; patchX < x + patchSize; patchX += 1) {
      total += data[(patchY * width + patchX) * 4 + channel];
    }
  }

  const changedPixels = patchSize * patchSize;
  const newValue = total / changedPixels < 128 ? 255 : 0;

  for (let patchY = y; patchY < y + patchSize; patchY += 1) {
    for (let patchX = x; patchX < x + patchSize; patchX += 1) {
      data[(patchY * width + patchX) * 4 + channel] = newValue;
    }
  }

  context.putImageData(imageData, 0, 0);

  return {
    src: canvas.toDataURL('image/png'),
    originalDataUrl,
    location: `channel ${channelLabel}, x ${x}, y ${y}, size ${patchSize}x${patchSize}`,
    changedPixels,
    generatedAt: Date.now(),
  };
};

const applyRotationAttack = async (
  imageSrc: string,
  rotationAngle: number,
): Promise<GeneratedAttack> => {
  const image = await loadImage(imageSrc);
  const width = image.naturalWidth;
  const height = image.naturalHeight;

  const originalCanvas = document.createElement('canvas');
  originalCanvas.width = width;
  originalCanvas.height = height;

  const originalContext = originalCanvas.getContext('2d');
  if (!originalContext) {
    throw new Error('Canvas is not available');
  }

  originalContext.drawImage(image, 0, 0);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Canvas is not available');
  }

  const angle = Number.isFinite(rotationAngle) ? rotationAngle : 0;
  const radians = (angle * Math.PI) / 180;

  context.fillStyle = 'black';
  context.fillRect(0, 0, width, height);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.translate(width / 2, height / 2);
  context.rotate(radians);
  context.drawImage(image, -width / 2, -height / 2);

  return {
    src: canvas.toDataURL('image/png'),
    originalDataUrl: originalCanvas.toDataURL('image/png'),
    location: `angle ${angle}deg`,
    changedPixels: width * height,
    generatedAt: Date.now(),
  };
};

const applyShiftAttack = async (
  imageSrc: string,
  dx: number,
  dy: number,
): Promise<GeneratedAttack> => {
  const image = await loadImage(imageSrc);
  const width = image.naturalWidth;
  const height = image.naturalHeight;

  const originalCanvas = document.createElement('canvas');
  originalCanvas.width = width;
  originalCanvas.height = height;

  const originalContext = originalCanvas.getContext('2d');
  if (!originalContext) {
    throw new Error('Canvas is not available');
  }

  originalContext.drawImage(image, 0, 0);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Canvas is not available');
  }

  const shiftX = Number.isFinite(dx) ? Math.round(dx) : 0;
  const shiftY = Number.isFinite(dy) ? Math.round(dy) : 0;

  context.fillStyle = 'black';
  context.fillRect(0, 0, width, height);
  context.drawImage(image, shiftX, shiftY);

  return {
    src: canvas.toDataURL('image/png'),
    originalDataUrl: originalCanvas.toDataURL('image/png'),
    location: `dx ${shiftX}, dy ${shiftY}`,
    changedPixels: width * height,
    generatedAt: Date.now(),
  };
};

const applyRandomNoiseAttack = async (
  imageSrc: string,
  dataset: DatasetKey,
): Promise<GeneratedAttack> => {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement('canvas');
  const width = image.naturalWidth;
  const height = image.naturalHeight;
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Canvas is not available');
  }

  context.drawImage(image, 0, 0);
  const originalDataUrl = canvas.toDataURL('image/png');
  const imageData = context.getImageData(0, 0, width, height);
  const { data } = imageData;
  const sigma = getRandomItem(getNoiseSigmas(dataset));
  const noiseScale = sigma * 255;

  for (let offset = 0; offset < data.length; offset += 4) {
    if (dataset === 'mnist') {
      const noise = getGaussianRandom() * noiseScale;
      const value = clampNumber(Math.round(data[offset] + noise), 0, 255);

      data[offset] = value;
      data[offset + 1] = value;
      data[offset + 2] = value;
    } else {
      data[offset] = clampNumber(
        Math.round(data[offset] + getGaussianRandom() * noiseScale),
        0,
        255,
      );
      data[offset + 1] = clampNumber(
        Math.round(data[offset + 1] + getGaussianRandom() * noiseScale),
        0,
        255,
      );
      data[offset + 2] = clampNumber(
        Math.round(data[offset + 2] + getGaussianRandom() * noiseScale),
        0,
        255,
      );
    }
  }

  context.putImageData(imageData, 0, 0);

  return {
    src: canvas.toDataURL('image/png'),
    originalDataUrl,
    location: `sigma ${sigma.toFixed(2)}`,
    changedPixels: width * height,
    generatedAt: Date.now(),
  };
};

const applyGaussianBlurToImageData = (
  imageData: ImageData,
  width: number,
  height: number,
  kernelSize: number,
  sigma: number,
) => {
  const { data } = imageData;
  const kernel = makeGaussianKernel(kernelSize, sigma);
  const radius = Math.floor(kernelSize / 2);
  const temp = new Float32Array(data.length);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const targetOffset = (y * width + x) * 4;

      for (let channel = 0; channel < 3; channel += 1) {
        let sum = 0;

        for (let kernelIndex = 0; kernelIndex < kernel.length; kernelIndex += 1) {
          const sourceX = clampNumber(x + kernelIndex - radius, 0, width - 1);
          const sourceOffset = (y * width + sourceX) * 4 + channel;
          sum += data[sourceOffset] * kernel[kernelIndex];
        }

        temp[targetOffset + channel] = sum;
      }

      temp[targetOffset + 3] = data[targetOffset + 3];
    }
  }

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const targetOffset = (y * width + x) * 4;

      for (let channel = 0; channel < 3; channel += 1) {
        let sum = 0;

        for (let kernelIndex = 0; kernelIndex < kernel.length; kernelIndex += 1) {
          const sourceY = clampNumber(y + kernelIndex - radius, 0, height - 1);
          const sourceOffset = (sourceY * width + x) * 4 + channel;
          sum += temp[sourceOffset] * kernel[kernelIndex];
        }

        data[targetOffset + channel] = clampNumber(Math.round(sum), 0, 255);
      }

      data[targetOffset + 3] = temp[targetOffset + 3];
    }
  }
};

const applyBlurAttack = async (
  imageSrc: string,
  kernelSize: number,
  sigma: number,
): Promise<GeneratedAttack> => {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement('canvas');
  const width = image.naturalWidth;
  const height = image.naturalHeight;
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Canvas is not available');
  }

  context.drawImage(image, 0, 0);
  const originalDataUrl = canvas.toDataURL('image/png');
  const imageData = context.getImageData(0, 0, width, height);

  applyGaussianBlurToImageData(imageData, width, height, kernelSize, sigma);
  context.putImageData(imageData, 0, 0);

  return {
    src: canvas.toDataURL('image/png'),
    originalDataUrl,
    location: `kernel ${kernelSize}, sigma ${sigma.toFixed(2)}`,
    changedPixels: width * height,
    generatedAt: Date.now(),
  };
};

const applyAdversarialPatchAttack = async (
  imageSrc: string,
  dataset: DatasetKey,
  position: PatchAttackPosition,
): Promise<GeneratedAttack> => {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement('canvas');
  const width = image.naturalWidth;
  const height = image.naturalHeight;
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Canvas is not available');
  }

  context.drawImage(image, 0, 0);
  const originalDataUrl = canvas.toDataURL('image/png');
  const patchSize = Math.min(getAdversarialPatchSize(dataset), width, height);
  const { x, y } = getClampedPatchPosition(position, width, height, patchSize);
  const patchImage = await loadImage(adversarialPatchSources[dataset]);

  context.drawImage(patchImage, x, y, patchSize, patchSize);

  return {
    src: canvas.toDataURL('image/png'),
    originalDataUrl,
    location: `x ${x}, y ${y}, size ${patchSize}x${patchSize}`,
    changedPixels: patchSize * patchSize,
    generatedAt: Date.now(),
  };
};

const createUnicodeEmojiCanvas = (emojiSize: number) => {
  const sourceScale = 4;
  const sourceSize = emojiSize * sourceScale;
  const sourceCanvas = document.createElement('canvas');
  sourceCanvas.width = sourceSize;
  sourceCanvas.height = sourceSize;

  const sourceContext = sourceCanvas.getContext('2d');
  if (!sourceContext) {
    throw new Error('Canvas is not available');
  }

  sourceContext.font = `${Math.round(sourceSize * 0.9)}px ${EMOJI_FONT_STACK}`;
  sourceContext.textAlign = 'center';
  sourceContext.textBaseline = 'middle';
  sourceContext.fillText(
    EMOJI_ATTACK_SYMBOL,
    sourceSize / 2,
    sourceSize / 2,
  );

  const emojiCanvas = document.createElement('canvas');
  emojiCanvas.width = emojiSize;
  emojiCanvas.height = emojiSize;

  const emojiContext = emojiCanvas.getContext('2d');
  if (!emojiContext) {
    throw new Error('Canvas is not available');
  }

  emojiContext.imageSmoothingEnabled = true;
  emojiContext.imageSmoothingQuality = 'high';
  emojiContext.drawImage(sourceCanvas, 0, 0, emojiSize, emojiSize);

  return emojiCanvas;
};

const applyEmojiAttack = async (
  imageSrc: string,
  dataset: DatasetKey,
  position: EmojiAttackPosition,
): Promise<GeneratedAttack> => {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement('canvas');
  const width = image.naturalWidth;
  const height = image.naturalHeight;
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Canvas is not available');
  }

  context.drawImage(image, 0, 0);
  const originalDataUrl = canvas.toDataURL('image/png');
  const emojiSize = Math.min(getEmojiSize(dataset), width, height);
  const { x, y } = getClampedEmojiPosition(position, width, height, emojiSize);
  const emojiCanvas = createUnicodeEmojiCanvas(emojiSize);

  if (dataset === 'mnist') {
    const imageData = context.getImageData(0, 0, width, height);
    const emojiContext = emojiCanvas.getContext('2d');
    if (!emojiContext) {
      throw new Error('Canvas is not available');
    }

    const emojiData = emojiContext.getImageData(0, 0, emojiSize, emojiSize).data;
    const { data } = imageData;

    for (let patchY = 0; patchY < emojiSize; patchY += 1) {
      for (let patchX = 0; patchX < emojiSize; patchX += 1) {
        const imageOffset = ((y + patchY) * width + x + patchX) * 4;
        const emojiOffset = (patchY * emojiSize + patchX) * 4;
        const emojiAlpha = emojiData[emojiOffset + 3] / 255;

        if (emojiAlpha === 0) {
          continue;
        }

        const emojiValue =
          emojiData[emojiOffset] * 0.299 +
          emojiData[emojiOffset + 1] * 0.587 +
          emojiData[emojiOffset + 2] * 0.114;
        const blend = emojiAlpha;

        for (let channel = 0; channel < 3; channel += 1) {
          data[imageOffset + channel] = clampNumber(
            Math.round(
              (1 - blend) * data[imageOffset + channel] + blend * emojiValue,
            ),
            0,
            255,
          );
        }
      }
    }

    context.putImageData(imageData, 0, 0);
  } else {
    context.drawImage(emojiCanvas, x, y);
  }

  return {
    src: canvas.toDataURL('image/png'),
    originalDataUrl,
    location: `x ${x}, y ${y}, size ${emojiSize}x${emojiSize}`,
    changedPixels: emojiSize * emojiSize,
    generatedAt: Date.now(),
  };
};

const applyLineAttack = async (
  imageSrc: string,
  orientation: LineOrientation,
  coordinate: number,
): Promise<GeneratedAttack> => {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement('canvas');
  const width = image.naturalWidth;
  const height = image.naturalHeight;
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Canvas is not available');
  }

  context.drawImage(image, 0, 0);
  const originalDataUrl = canvas.toDataURL('image/png');

  context.fillStyle = 'black';

  if (orientation === 'horizontal') {
    const row = clampNumber(Math.round(coordinate), 0, Math.max(0, height - 1));
    context.fillRect(0, row, width, 1);

    return {
      src: canvas.toDataURL('image/png'),
      originalDataUrl,
      location: `horizontal row ${row}`,
      changedPixels: width,
      generatedAt: Date.now(),
    };
  }

  const col = clampNumber(Math.round(coordinate), 0, Math.max(0, width - 1));
  context.fillRect(col, 0, 1, height);

  return {
    src: canvas.toDataURL('image/png'),
    originalDataUrl,
    location: `vertical col ${col}`,
    changedPixels: height,
    generatedAt: Date.now(),
  };
};

const applyMirrorAttack = async (
  imageSrc: string,
  direction: MirrorDirection,
): Promise<GeneratedAttack> => {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement('canvas');
  const width = image.naturalWidth;
  const height = image.naturalHeight;
  canvas.width = width;
  canvas.height = height;

  const originalCanvas = document.createElement('canvas');
  originalCanvas.width = width;
  originalCanvas.height = height;

  const originalContext = originalCanvas.getContext('2d');
  const context = canvas.getContext('2d');
  if (!originalContext || !context) {
    throw new Error('Canvas is not available');
  }

  originalContext.drawImage(image, 0, 0);

  if (direction === 'horizontal') {
    context.translate(width, 0);
    context.scale(-1, 1);
    context.drawImage(image, 0, 0);

    return {
      src: canvas.toDataURL('image/png'),
      originalDataUrl: originalCanvas.toDataURL('image/png'),
      location: 'left-right flip',
      changedPixels: width * height,
      generatedAt: Date.now(),
    };
  }

  context.translate(0, height);
  context.scale(1, -1);
  context.drawImage(image, 0, 0);

  return {
    src: canvas.toDataURL('image/png'),
    originalDataUrl: originalCanvas.toDataURL('image/png'),
    location: 'top-bottom flip',
    changedPixels: width * height,
    generatedAt: Date.now(),
  };
};

const applySelectedAttack = (
  imageSrc: string,
  dataset: DatasetKey,
  attack: AttackKey,
  pixelPosition: PixelAttackPosition,
  patchPosition: PatchAttackPosition,
  emojiPosition: EmojiAttackPosition,
  lineOrientation: LineOrientation,
  lineCoordinate: number,
  mirrorDirection: MirrorDirection,
  rotationAngle: number,
  shiftX: number,
  shiftY: number,
  blurKernelSize: number,
  blurSigma: number,
) => {
  if (attack === 'rotation') {
    return applyRotationAttack(imageSrc, rotationAngle);
  }

  if (attack === 'shift') {
    return applyShiftAttack(imageSrc, shiftX, shiftY);
  }

  if (attack === 'noise') {
    return applyRandomNoiseAttack(imageSrc, dataset);
  }

  if (attack === 'blur') {
    return applyBlurAttack(imageSrc, blurKernelSize, blurSigma);
  }

  if (attack === 'patch') {
    return applyAdversarialPatchAttack(imageSrc, dataset, patchPosition);
  }

  if (attack === 'emoji') {
    return applyEmojiAttack(imageSrc, dataset, emojiPosition);
  }

  if (attack === 'line') {
    return applyLineAttack(imageSrc, lineOrientation, lineCoordinate);
  }

  if (attack === 'mirror') {
    return applyMirrorAttack(imageSrc, mirrorDirection);
  }

  return applyPixelAttack(imageSrc, dataset, pixelPosition);
};

const toReadyClassification = (result: ClassifyResult): ClassificationState => ({
  status: 'ready',
  prediction: String(result.prediction),
  predictionLabel: result.predictionLabel ?? null,
  confidence: result.confidence,
  success: result.success,
  baselinePrediction:
    result.baselinePrediction === null || result.baselinePrediction === undefined
      ? null
      : String(result.baselinePrediction),
  baselineLabel: result.baselineLabel ?? null,
  baselineConfidence: result.baselineConfidence ?? null,
});

const classifyGeneratedAttack = async (
  generatedAttack: GeneratedAttack,
  selectedSample: SandboxSample,
  dataset: DatasetKey,
): Promise<ClassificationState> => {
  if (!SANDBOX_API_BASE_URL) {
    throw new Error(SANDBOX_API_UNAVAILABLE_MESSAGE);
  }

  let response: Response;
  try {
    response = await fetch(`${SANDBOX_API_BASE_URL}/classify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dataset,
        imageDataUrl: generatedAttack.src,
        originalImageDataUrl: generatedAttack.originalDataUrl,
        trueLabel: selectedSample.trueLabel
          ? Number(selectedSample.trueLabel)
          : null,
      }),
    });
  } catch {
    throw new Error(SANDBOX_API_UNAVAILABLE_MESSAGE);
  }

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'CNN classification failed');
  }

  const result = (await response.json()) as ClassifyResult;
  return toReadyClassification(result);
};

const formatPrediction = (
  prediction: string | null,
  label: string | null,
  confidence: number | null,
) => {
  if (!prediction) {
    return '-';
  }

  const labelText = label ? ` - ${label}` : '';
  const confidenceText =
    confidence === null ? '' : ` (${Math.round(confidence * 100)}%)`;

  return `${prediction}${labelText}${confidenceText}`;
};

export function SandboxMode() {
  const navigate = useNavigate();
  const [dataset, setDataset] = useState<DatasetKey>('mnist');
  const [attack, setAttack] = useState<AttackKey>('pixel');
  const [sampleIndex, setSampleIndex] = useState(0);
  const [generatedAttack, setGeneratedAttack] = useState<GeneratedAttack | null>(
    null,
  );
  const [classification, setClassification] = useState<ClassificationState>({
    status: 'idle',
  });
  const [selectedImageSize, setSelectedImageSize] = useState<ImageSize | null>(
    null,
  );
  const [pixelPosition, setPixelPosition] = useState<PixelAttackPosition>({
    x: 0,
    y: 0,
    channel: 0,
  });
  const [pixelPositionInput, setPixelPositionInput] =
    useState<PixelPositionInput>({
      x: '0',
      y: '0',
    });
  const [patchPosition, setPatchPosition] = useState<PatchAttackPosition>({
    x: 0,
    y: 0,
  });
  const [patchPositionInput, setPatchPositionInput] =
    useState<PatchPositionInput>({
      x: '0',
      y: '0',
    });
  const [emojiPosition, setEmojiPosition] = useState<EmojiAttackPosition>({
    x: 0,
    y: 0,
  });
  const [emojiPositionInput, setEmojiPositionInput] =
    useState<EmojiPositionInput>({
      x: '0',
      y: '0',
    });
  const [rotationAngleInput, setRotationAngleInput] = useState(
    String(DEFAULT_ROTATION_ATTACK_ANGLE),
  );
  const [shiftOffsetInput, setShiftOffsetInput] = useState<ShiftOffsetInput>({
    dx: String(DEFAULT_SHIFT_ATTACK_OFFSET),
    dy: String(DEFAULT_SHIFT_ATTACK_OFFSET),
  });
  const [blurSettingsInput, setBlurSettingsInput] =
    useState<BlurSettingsInput>({
      kernel: String(DEFAULT_BLUR_KERNEL_SIZE),
      sigma: String(DEFAULT_BLUR_SIGMA),
    });
  const [lineOrientation, setLineOrientation] =
    useState<LineOrientation>('horizontal');
  const [lineCoordinateInput, setLineCoordinateInput] = useState('0');
  const [mirrorDirection, setMirrorDirection] =
    useState<MirrorDirection>('horizontal');
  const [attackError, setAttackError] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [isClassifying, setIsClassifying] = useState(false);

  const samples = sandboxSamplesByDataset[dataset];
  const selectedSample = samples[sampleIndex] ?? samples[0];
  const activePixelPatchSize = selectedImageSize
    ? Math.min(
        getPixelPatchSize(dataset),
        selectedImageSize.width,
        selectedImageSize.height,
      )
    : getPixelPatchSize(dataset);
  const clampedPixelPosition = selectedImageSize
    ? getClampedPixelPosition(
        pixelPosition,
        selectedImageSize.width,
        selectedImageSize.height,
        activePixelPatchSize,
      )
    : pixelPosition;
  const pixelMaxX = selectedImageSize
    ? Math.max(0, selectedImageSize.width - activePixelPatchSize)
    : 0;
  const pixelMaxY = selectedImageSize
    ? Math.max(0, selectedImageSize.height - activePixelPatchSize)
    : 0;
  const activeAdversarialPatchSize = selectedImageSize
    ? Math.min(
        getAdversarialPatchSize(dataset),
        selectedImageSize.width,
        selectedImageSize.height,
      )
    : getAdversarialPatchSize(dataset);
  const patchMaxX = selectedImageSize
    ? Math.max(0, selectedImageSize.width - activeAdversarialPatchSize)
    : 0;
  const patchMaxY = selectedImageSize
    ? Math.max(0, selectedImageSize.height - activeAdversarialPatchSize)
    : 0;
  const activeEmojiSize = selectedImageSize
    ? Math.min(
        getEmojiSize(dataset),
        selectedImageSize.width,
        selectedImageSize.height,
      )
    : getEmojiSize(dataset);
  const emojiMaxX = selectedImageSize
    ? Math.max(0, selectedImageSize.width - activeEmojiSize)
    : 0;
  const emojiMaxY = selectedImageSize
    ? Math.max(0, selectedImageSize.height - activeEmojiSize)
    : 0;
  const lineCoordinateMax = selectedImageSize
    ? Math.max(
        0,
        lineOrientation === 'horizontal'
          ? selectedImageSize.height - 1
          : selectedImageSize.width - 1,
      )
    : 0;
  const shiftBounds = getShiftBounds(selectedImageSize);
  const blurKernelMax = getBlurKernelMax(selectedImageSize);

  const resetGeneratedAttack = () => {
    setGeneratedAttack(null);
    setClassification({ status: 'idle' });
    setAttackError(null);
    setIsApplying(false);
    setIsClassifying(false);
  };

  const changeDataset = (nextDataset: DatasetKey) => {
    if (nextDataset === dataset) {
      return;
    }

    setDataset(nextDataset);
    setSampleIndex(0);
    setSelectedImageSize(null);
    setPixelPosition({ x: 0, y: 0, channel: 0 });
    setPixelPositionInput({ x: '0', y: '0' });
    setPatchPosition({ x: 0, y: 0 });
    setPatchPositionInput({ x: '0', y: '0' });
    setEmojiPosition({ x: 0, y: 0 });
    setEmojiPositionInput({ x: '0', y: '0' });
    setLineCoordinateInput('0');
    resetGeneratedAttack();
    trackAnalyticsEvent('sandbox_dataset_changed', {
      fromDataset: dataset,
      toDataset: nextDataset,
      attack,
    });
  };

  const changeSample = (nextIndex: number) => {
    if (nextIndex === sampleIndex) {
      return;
    }

    const nextSample = samples[nextIndex];
    setSampleIndex(nextIndex);
    setSelectedImageSize(null);
    setPixelPosition((position) => ({ ...position, x: 0, y: 0 }));
    setPixelPositionInput({ x: '0', y: '0' });
    setPatchPosition({ x: 0, y: 0 });
    setPatchPositionInput({ x: '0', y: '0' });
    setEmojiPosition({ x: 0, y: 0 });
    setEmojiPositionInput({ x: '0', y: '0' });
    setLineCoordinateInput('0');
    resetGeneratedAttack();
    trackAnalyticsEvent('sandbox_sample_changed', {
      dataset,
      attack,
      fromSampleIndex: sampleIndex,
      toSampleIndex: nextIndex,
      sampleId: nextSample?.id ?? null,
      originalFilename: nextSample?.originalFilename ?? null,
    });
  };

  const changeAttack = (nextAttack: AttackKey) => {
    if (nextAttack === attack) {
      return;
    }

    setAttack(nextAttack);
    resetGeneratedAttack();
    trackAnalyticsEvent('sandbox_attack_changed', {
      dataset,
      sampleId: selectedSample.id,
      originalFilename: selectedSample.originalFilename,
      fromAttack: attack,
      toAttack: nextAttack,
    });
  };

  const changePixelCoordinate = (
    field: keyof PixelPositionInput,
    value: string,
  ) => {
    setPixelPositionInput((positionInput) => ({
      ...positionInput,
      [field]: value,
    }));

    if (value === '') {
      resetGeneratedAttack();
      return;
    }

    const nextValue = toIntegerInput(value);

    setPixelPosition((position) => {
      const nextPosition = { ...position, [field]: nextValue };

      return selectedImageSize
        ? getClampedPixelPosition(
            nextPosition,
            selectedImageSize.width,
            selectedImageSize.height,
            activePixelPatchSize,
          )
        : nextPosition;
    });
    resetGeneratedAttack();
  };

  const clearDefaultPixelCoordinate = (field: keyof PixelPositionInput) => {
    setPixelPositionInput((positionInput) =>
      positionInput[field] === '0'
        ? { ...positionInput, [field]: '' }
        : positionInput,
    );
  };

  const commitPixelCoordinate = (field: keyof PixelPositionInput) => {
    const committedPosition = getClampedPixelPosition(
      {
        ...pixelPosition,
        [field]: toIntegerInput(pixelPositionInput[field]),
      },
      selectedImageSize?.width ?? activePixelPatchSize,
      selectedImageSize?.height ?? activePixelPatchSize,
      activePixelPatchSize,
    );

    setPixelPosition(committedPosition);
    setPixelPositionInput({
      x: String(committedPosition.x),
      y: String(committedPosition.y),
    });
  };

  const changePatchCoordinate = (
    field: keyof PatchPositionInput,
    value: string,
  ) => {
    setPatchPositionInput((positionInput) => ({
      ...positionInput,
      [field]: value,
    }));

    if (value === '') {
      resetGeneratedAttack();
      return;
    }

    const nextValue = toIntegerInput(value);

    setPatchPosition((position) => {
      const nextPosition = { ...position, [field]: nextValue };

      return selectedImageSize
        ? getClampedPatchPosition(
            nextPosition,
            selectedImageSize.width,
            selectedImageSize.height,
            activeAdversarialPatchSize,
          )
        : nextPosition;
    });
    resetGeneratedAttack();
  };

  const clearDefaultPatchCoordinate = (field: keyof PatchPositionInput) => {
    setPatchPositionInput((positionInput) =>
      positionInput[field] === '0'
        ? { ...positionInput, [field]: '' }
        : positionInput,
    );
  };

  const commitPatchCoordinate = (field: keyof PatchPositionInput) => {
    const committedPosition = getClampedPatchPosition(
      {
        ...patchPosition,
        [field]: toIntegerInput(patchPositionInput[field]),
      },
      selectedImageSize?.width ?? activeAdversarialPatchSize,
      selectedImageSize?.height ?? activeAdversarialPatchSize,
      activeAdversarialPatchSize,
    );

    setPatchPosition(committedPosition);
    setPatchPositionInput({
      x: String(committedPosition.x),
      y: String(committedPosition.y),
    });
  };

  const changeEmojiCoordinate = (
    field: keyof EmojiPositionInput,
    value: string,
  ) => {
    setEmojiPositionInput((positionInput) => ({
      ...positionInput,
      [field]: value,
    }));

    if (value === '') {
      resetGeneratedAttack();
      return;
    }

    const nextValue = toIntegerInput(value);

    setEmojiPosition((position) => {
      const nextPosition = { ...position, [field]: nextValue };

      return selectedImageSize
        ? getClampedEmojiPosition(
            nextPosition,
            selectedImageSize.width,
            selectedImageSize.height,
            activeEmojiSize,
          )
        : nextPosition;
    });
    resetGeneratedAttack();
  };

  const clearDefaultEmojiCoordinate = (field: keyof EmojiPositionInput) => {
    setEmojiPositionInput((positionInput) =>
      positionInput[field] === '0'
        ? { ...positionInput, [field]: '' }
        : positionInput,
    );
  };

  const commitEmojiCoordinate = (field: keyof EmojiPositionInput) => {
    const committedPosition = getClampedEmojiPosition(
      {
        ...emojiPosition,
        [field]: toIntegerInput(emojiPositionInput[field]),
      },
      selectedImageSize?.width ?? activeEmojiSize,
      selectedImageSize?.height ?? activeEmojiSize,
      activeEmojiSize,
    );

    setEmojiPosition(committedPosition);
    setEmojiPositionInput({
      x: String(committedPosition.x),
      y: String(committedPosition.y),
    });
  };

  const changePixelChannel = (value: string) => {
    const nextChannel = clampNumber(toIntegerInput(value), 0, 2);

    setPixelPosition((position) => ({
      ...position,
      channel: nextChannel,
    }));
    resetGeneratedAttack();
  };

  const changeRotationAngle = (value: string) => {
    setRotationAngleInput(value);

    if (value === '') {
      resetGeneratedAttack();
      return;
    }

    resetGeneratedAttack();
  };

  const clearDefaultRotationAngle = () => {
    setRotationAngleInput((value) => (value === '0' ? '' : value));
  };

  const commitRotationAngle = () => {
    const committedAngle = toNumberInput(rotationAngleInput);

    setRotationAngleInput(String(committedAngle));
  };

  const changeShiftOffset = (field: keyof ShiftOffsetInput, value: string) => {
    setShiftOffsetInput((offsetInput) => ({
      ...offsetInput,
      [field]: value,
    }));
    resetGeneratedAttack();
  };

  const clearDefaultShiftOffset = (field: keyof ShiftOffsetInput) => {
    setShiftOffsetInput((offsetInput) =>
      offsetInput[field] === '0'
        ? { ...offsetInput, [field]: '' }
        : offsetInput,
    );
  };

  const commitShiftOffset = (field: keyof ShiftOffsetInput) => {
    setShiftOffsetInput((offsetInput) => {
      const committedOffset = getClampedShiftOffset(offsetInput, shiftBounds);

      return {
        ...offsetInput,
        [field]: String(committedOffset[field]),
      };
    });
  };

  const changeBlurSetting = (
    field: keyof BlurSettingsInput,
    value: string,
  ) => {
    setBlurSettingsInput((settingsInput) => ({
      ...settingsInput,
      [field]: value,
    }));
    resetGeneratedAttack();
  };

  const clearDefaultBlurSetting = (field: keyof BlurSettingsInput) => {
    const defaultValue =
      field === 'kernel' ? DEFAULT_BLUR_KERNEL_SIZE : DEFAULT_BLUR_SIGMA;

    setBlurSettingsInput((settingsInput) =>
      settingsInput[field] === String(defaultValue)
        ? { ...settingsInput, [field]: '' }
        : settingsInput,
    );
  };

  const commitBlurSetting = (field: keyof BlurSettingsInput) => {
    setBlurSettingsInput((settingsInput) => {
      const committedKernel = getBlurKernelSizeFromInput(
        settingsInput.kernel,
        blurKernelMax,
      );
      const committedSigma = getBlurSigmaFromInput(settingsInput.sigma);

      return {
        ...settingsInput,
        [field]:
          field === 'kernel'
            ? String(committedKernel)
            : String(committedSigma),
      };
    });
  };

  const changeLineOrientation = (value: string) => {
    const nextOrientation =
      value === 'vertical' ? 'vertical' : 'horizontal';
    const nextCoordinateMax = selectedImageSize
      ? Math.max(
          0,
          nextOrientation === 'horizontal'
            ? selectedImageSize.height - 1
            : selectedImageSize.width - 1,
        )
      : 0;

    setLineOrientation(nextOrientation);
    setLineCoordinateInput((coordinateInput) =>
      String(
        clampNumber(
          toIntegerInput(coordinateInput),
          0,
          nextCoordinateMax,
        ),
      ),
    );
    resetGeneratedAttack();
  };

  const changeLineCoordinate = (value: string) => {
    setLineCoordinateInput(value);
    resetGeneratedAttack();
  };

  const clearDefaultLineCoordinate = () => {
    setLineCoordinateInput((value) => (value === '0' ? '' : value));
  };

  const commitLineCoordinate = () => {
    setLineCoordinateInput((value) =>
      String(clampNumber(toIntegerInput(value), 0, lineCoordinateMax)),
    );
  };

  const changeMirrorDirection = (value: string) => {
    setMirrorDirection(value === 'vertical' ? 'vertical' : 'horizontal');
    resetGeneratedAttack();
  };

  const handleOriginalImageLoaded = (image: HTMLImageElement) => {
    const nextSize = {
      width: image.naturalWidth,
      height: image.naturalHeight,
    };
    const nextPatchSize = Math.min(
      getPixelPatchSize(dataset),
      nextSize.width,
      nextSize.height,
    );
    const nextAdversarialPatchSize = Math.min(
      getAdversarialPatchSize(dataset),
      nextSize.width,
      nextSize.height,
    );
    const nextEmojiSize = Math.min(
      getEmojiSize(dataset),
      nextSize.width,
      nextSize.height,
    );
    const nextBlurKernelMax = getBlurKernelMax(nextSize);

    const nextPosition = getClampedPixelPosition(
      pixelPosition,
      nextSize.width,
      nextSize.height,
      nextPatchSize,
    );
    const nextPatchPosition = getClampedPatchPosition(
      patchPosition,
      nextSize.width,
      nextSize.height,
      nextAdversarialPatchSize,
    );
    const nextEmojiPosition = getClampedEmojiPosition(
      emojiPosition,
      nextSize.width,
      nextSize.height,
      nextEmojiSize,
    );

    setSelectedImageSize(nextSize);
    setPixelPosition(nextPosition);
    setPixelPositionInput({
      x: String(nextPosition.x),
      y: String(nextPosition.y),
    });
    setPatchPosition(nextPatchPosition);
    setPatchPositionInput({
      x: String(nextPatchPosition.x),
      y: String(nextPatchPosition.y),
    });
    setEmojiPosition(nextEmojiPosition);
    setEmojiPositionInput({
      x: String(nextEmojiPosition.x),
      y: String(nextEmojiPosition.y),
    });
    setBlurSettingsInput((settingsInput) => ({
      kernel: String(
        getBlurKernelSizeFromInput(settingsInput.kernel, nextBlurKernelMax),
      ),
      sigma: String(getBlurSigmaFromInput(settingsInput.sigma)),
    }));
    setLineCoordinateInput((coordinateInput) => {
      const nextCoordinateMax = Math.max(
        0,
        lineOrientation === 'horizontal'
          ? nextSize.height - 1
          : nextSize.width - 1,
      );

      return String(
        clampNumber(toIntegerInput(coordinateInput), 0, nextCoordinateMax),
      );
    });
    setShiftOffsetInput((offsetInput) => {
      const nextOffset = getClampedShiftOffset(
        offsetInput,
        getShiftBounds(nextSize),
      );

      return {
        dx: String(nextOffset.dx),
        dy: String(nextOffset.dy),
      };
    });
  };

  const applyAttack = async () => {
    setIsApplying(true);
    setAttackError(null);
    setClassification({ status: 'idle' });

    try {
      const appliedRotationAngle =
        rotationAngleInput === '' ? 0 : toNumberInput(rotationAngleInput);
      const appliedShiftOffset = getClampedShiftOffset(
        shiftOffsetInput,
        shiftBounds,
      );

      if (attack === 'shift') {
        setShiftOffsetInput({
          dx: String(appliedShiftOffset.dx),
          dy: String(appliedShiftOffset.dy),
        });
      }

      const appliedPatchPosition = getClampedPatchPosition(
        {
          x:
            patchPositionInput.x === ''
              ? 0
              : toIntegerInput(patchPositionInput.x),
          y:
            patchPositionInput.y === ''
              ? 0
              : toIntegerInput(patchPositionInput.y),
        },
        selectedImageSize?.width ?? activeAdversarialPatchSize,
        selectedImageSize?.height ?? activeAdversarialPatchSize,
        activeAdversarialPatchSize,
      );

      if (attack === 'patch') {
        setPatchPosition(appliedPatchPosition);
        setPatchPositionInput({
          x: String(appliedPatchPosition.x),
          y: String(appliedPatchPosition.y),
        });
      }

      const appliedEmojiPosition = getClampedEmojiPosition(
        {
          x:
            emojiPositionInput.x === ''
              ? 0
              : toIntegerInput(emojiPositionInput.x),
          y:
            emojiPositionInput.y === ''
              ? 0
              : toIntegerInput(emojiPositionInput.y),
        },
        selectedImageSize?.width ?? activeEmojiSize,
        selectedImageSize?.height ?? activeEmojiSize,
        activeEmojiSize,
      );

      if (attack === 'emoji') {
        setEmojiPosition(appliedEmojiPosition);
        setEmojiPositionInput({
          x: String(appliedEmojiPosition.x),
          y: String(appliedEmojiPosition.y),
        });
      }

      const appliedLineCoordinate = clampNumber(
        lineCoordinateInput === '' ? 0 : toIntegerInput(lineCoordinateInput),
        0,
        lineCoordinateMax,
      );

      if (attack === 'line') {
        setLineCoordinateInput(String(appliedLineCoordinate));
      }

      const appliedBlurKernelSize = getBlurKernelSizeFromInput(
        blurSettingsInput.kernel,
        blurKernelMax,
      );
      const appliedBlurSigma = getBlurSigmaFromInput(blurSettingsInput.sigma);

      if (attack === 'blur') {
        setBlurSettingsInput({
          kernel: String(appliedBlurKernelSize),
          sigma: String(appliedBlurSigma),
        });
      }

      const nextGeneratedAttack = await applySelectedAttack(
        selectedSample.originalSrc,
        dataset,
        attack,
        clampedPixelPosition,
        appliedPatchPosition,
        appliedEmojiPosition,
        lineOrientation,
        appliedLineCoordinate,
        mirrorDirection,
        appliedRotationAngle,
        appliedShiftOffset.dx,
        appliedShiftOffset.dy,
        appliedBlurKernelSize,
        appliedBlurSigma,
      );

      setGeneratedAttack(nextGeneratedAttack);
      trackAnalyticsEvent('sandbox_attack_run', {
        dataset,
        attack,
        sampleId: selectedSample.id,
        originalFilename: selectedSample.originalFilename,
        attackDetail: nextGeneratedAttack.location,
        changedPixels: nextGeneratedAttack.changedPixels,
        imageWidth: selectedImageSize?.width ?? null,
        imageHeight: selectedImageSize?.height ?? null,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Could not generate attack';
      setAttackError(message);
      setClassification({ status: 'error', message });
      setGeneratedAttack(null);
      trackAnalyticsEvent('sandbox_attack_run_failed', {
        dataset,
        attack,
        sampleId: selectedSample.id,
        originalFilename: selectedSample.originalFilename,
        errorMessage: message,
      });
    } finally {
      setIsApplying(false);
    }
  };

  const classifyAttack = async () => {
    if (!generatedAttack) {
      return;
    }

    setIsClassifying(true);
    setClassification({ status: 'pending' });

    try {
      const nextClassification = await classifyGeneratedAttack(
        generatedAttack,
        selectedSample,
        dataset,
      );
      setClassification(nextClassification);
      trackAnalyticsEvent('sandbox_attack_classified', {
        dataset,
        attack,
        sampleId: selectedSample.id,
        originalFilename: selectedSample.originalFilename,
        classificationStatus: nextClassification.status,
        prediction:
          nextClassification.status === 'ready'
            ? nextClassification.prediction
            : null,
        predictionLabel:
          nextClassification.status === 'ready'
            ? nextClassification.predictionLabel
            : null,
        confidence:
          nextClassification.status === 'ready'
            ? nextClassification.confidence
            : null,
        baselinePrediction:
          nextClassification.status === 'ready'
            ? nextClassification.baselinePrediction
            : null,
        baselineLabel:
          nextClassification.status === 'ready'
            ? nextClassification.baselineLabel
            : null,
        baselineConfidence:
          nextClassification.status === 'ready'
            ? nextClassification.baselineConfidence
            : null,
        success:
          nextClassification.status === 'ready'
            ? nextClassification.success
            : null,
      });
    } catch (classificationError) {
      const message =
        classificationError instanceof Error
          ? classificationError.message
          : 'CNN classification failed';
      setClassification({ status: 'error', message });
      trackAnalyticsEvent('sandbox_attack_classification_failed', {
        dataset,
        attack,
        sampleId: selectedSample.id,
        originalFilename: selectedSample.originalFilename,
        errorMessage: message,
      });
    } finally {
      setIsClassifying(false);
    }
  };

  const exitToHome = () => {
    trackAnalyticsEvent('sandbox_exit_clicked');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#d8d8d8] text-neutral-950">
      <header className="border-b border-neutral-300 bg-white/80 px-6 py-4">
        <div className="mx-auto flex max-w-[96rem] items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Sandbox Mode</h1>
          </div>
          <Button onClick={exitToHome} variant="outline">
            <ArrowLeft />
            Exit
          </Button>
        </div>
      </header>

      <main className="mx-auto grid max-w-[96rem] gap-5 px-6 py-6 lg:grid-cols-3">
        <Card className="rounded-lg border-neutral-300 bg-white">
          <CardHeader>
            <CardTitle className="text-lg">Original Image</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1 text-sm font-medium">
                <span>Dataset</span>
                <select
                  value={dataset}
                  onChange={(event) =>
                    changeDataset(event.target.value as DatasetKey)
                  }
                  className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-neutral-700 focus:ring-2 focus:ring-neutral-300"
                >
                  {datasetOptions.map((option) => (
                    <option key={option.key} value={option.key}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-1 text-sm font-medium">
                <span>Image</span>
                <select
                  value={sampleIndex}
                  onChange={(event) => changeSample(Number(event.target.value))}
                  className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-neutral-700 focus:ring-2 focus:ring-neutral-300"
                >
                  {samples.map((sample, index) => (
                    <option key={sample.id} value={index}>
                      {sample.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="relative flex aspect-square min-h-[300px] items-center justify-center overflow-hidden rounded-md border border-neutral-300 bg-neutral-100 p-1 sm:min-h-[380px] xl:min-h-[420px]">
              <img
                src={selectedSample.originalSrc}
                alt={selectedSample.originalFilename}
                onLoad={(event) => handleOriginalImageLoaded(event.currentTarget)}
                className="h-full w-full object-contain [image-rendering:pixelated]"
              />
            </div>

            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <dt className="text-neutral-500">True label</dt>
              <dd className="font-medium">{selectedSample.trueLabel ?? '-'}</dd>
              <dt className="text-neutral-500">Original prediction</dt>
              <dd className="font-medium">
                {selectedSample.originalPrediction ?? '-'}
              </dd>
              <dt className="text-neutral-500">File</dt>
              <dd className="truncate font-mono text-xs">
                {selectedSample.originalFilename}
              </dd>
            </dl>
          </CardContent>
        </Card>

        <Card className="rounded-lg border-neutral-300 bg-white">
          <CardHeader>
            <CardTitle className="text-lg">Attacked Image</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <label className="space-y-1 text-sm font-medium">
                <span>Attack</span>
                <select
                  value={attack}
                  onChange={(event) =>
                    changeAttack(event.target.value as AttackKey)
                  }
                  className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-neutral-700 focus:ring-2 focus:ring-neutral-300"
                >
                  {attackOptions.map((option) => (
                    <option key={option.key} value={option.key}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <Button
                onClick={applyAttack}
                disabled={isApplying}
                className="self-end"
              >
                <Zap />
                {isApplying ? 'Applying' : 'Apply'}
              </Button>
            </div>

            {attack === 'pixel' ? (
              <div
                className={`grid gap-3 ${
                  dataset === 'imagenet' ? 'sm:grid-cols-3' : 'sm:grid-cols-2'
                }`}
              >
                <label className="space-y-1 text-sm font-medium">
                  <span>X</span>
                  <input
                    type="number"
                    min={0}
                    max={pixelMaxX}
                    value={pixelPositionInput.x}
                    onFocus={() => clearDefaultPixelCoordinate('x')}
                    onChange={(event) =>
                      changePixelCoordinate('x', event.target.value)
                    }
                    onBlur={() => commitPixelCoordinate('x')}
                    className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-neutral-700 focus:ring-2 focus:ring-neutral-300"
                  />
                </label>

                <label className="space-y-1 text-sm font-medium">
                  <span>Y</span>
                  <input
                    type="number"
                    min={0}
                    max={pixelMaxY}
                    value={pixelPositionInput.y}
                    onFocus={() => clearDefaultPixelCoordinate('y')}
                    onChange={(event) =>
                      changePixelCoordinate('y', event.target.value)
                    }
                    onBlur={() => commitPixelCoordinate('y')}
                    className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-neutral-700 focus:ring-2 focus:ring-neutral-300"
                  />
                </label>

                {dataset === 'imagenet' && (
                  <label className="space-y-1 text-sm font-medium">
                    <span>Channel</span>
                    <select
                      value={clampedPixelPosition.channel}
                      onChange={(event) =>
                        changePixelChannel(event.target.value)
                      }
                      className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-neutral-700 focus:ring-2 focus:ring-neutral-300"
                    >
                      {pixelChannelOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </div>
            ) : attack === 'rotation' ? (
              <label className="block space-y-1 text-sm font-medium">
                <span>Angle</span>
                <input
                  type="number"
                  step={1}
                  value={rotationAngleInput}
                  onFocus={clearDefaultRotationAngle}
                  onChange={(event) => changeRotationAngle(event.target.value)}
                  onBlur={commitRotationAngle}
                  className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-neutral-700 focus:ring-2 focus:ring-neutral-300"
                />
              </label>
            ) : attack === 'shift' ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1 text-sm font-medium">
                  <span>Shift X</span>
                  <input
                    type="number"
                    step={1}
                    min={shiftBounds.minX}
                    max={shiftBounds.maxX}
                    value={shiftOffsetInput.dx}
                    onFocus={() => clearDefaultShiftOffset('dx')}
                    onChange={(event) =>
                      changeShiftOffset('dx', event.target.value)
                    }
                    onBlur={() => commitShiftOffset('dx')}
                    className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-neutral-700 focus:ring-2 focus:ring-neutral-300"
                  />
                </label>

                <label className="space-y-1 text-sm font-medium">
                  <span>Shift Y</span>
                  <input
                    type="number"
                    step={1}
                    min={shiftBounds.minY}
                    max={shiftBounds.maxY}
                    value={shiftOffsetInput.dy}
                    onFocus={() => clearDefaultShiftOffset('dy')}
                    onChange={(event) =>
                      changeShiftOffset('dy', event.target.value)
                    }
                    onBlur={() => commitShiftOffset('dy')}
                    className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-neutral-700 focus:ring-2 focus:ring-neutral-300"
                  />
                </label>
              </div>
            ) : attack === 'blur' ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1 text-sm font-medium">
                  <span>Kernel</span>
                  <input
                    type="number"
                    step={2}
                    min={1}
                    max={blurKernelMax}
                    value={blurSettingsInput.kernel}
                    onFocus={() => clearDefaultBlurSetting('kernel')}
                    onChange={(event) =>
                      changeBlurSetting('kernel', event.target.value)
                    }
                    onBlur={() => commitBlurSetting('kernel')}
                    className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-neutral-700 focus:ring-2 focus:ring-neutral-300"
                  />
                </label>

                <label className="space-y-1 text-sm font-medium">
                  <span>Sigma</span>
                  <input
                    type="number"
                    step={0.1}
                    min={MIN_BLUR_SIGMA}
                    max={MAX_BLUR_SIGMA}
                    value={blurSettingsInput.sigma}
                    onFocus={() => clearDefaultBlurSetting('sigma')}
                    onChange={(event) =>
                      changeBlurSetting('sigma', event.target.value)
                    }
                    onBlur={() => commitBlurSetting('sigma')}
                    className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-neutral-700 focus:ring-2 focus:ring-neutral-300"
                  />
                </label>
              </div>
            ) : attack === 'patch' ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1 text-sm font-medium">
                  <span>Patch X</span>
                  <input
                    type="number"
                    min={0}
                    max={patchMaxX}
                    value={patchPositionInput.x}
                    onFocus={() => clearDefaultPatchCoordinate('x')}
                    onChange={(event) =>
                      changePatchCoordinate('x', event.target.value)
                    }
                    onBlur={() => commitPatchCoordinate('x')}
                    className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-neutral-700 focus:ring-2 focus:ring-neutral-300"
                  />
                </label>

                <label className="space-y-1 text-sm font-medium">
                  <span>Patch Y</span>
                  <input
                    type="number"
                    min={0}
                    max={patchMaxY}
                    value={patchPositionInput.y}
                    onFocus={() => clearDefaultPatchCoordinate('y')}
                    onChange={(event) =>
                      changePatchCoordinate('y', event.target.value)
                    }
                    onBlur={() => commitPatchCoordinate('y')}
                    className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-neutral-700 focus:ring-2 focus:ring-neutral-300"
                  />
                </label>
              </div>
            ) : attack === 'emoji' ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1 text-sm font-medium">
                  <span>Emoji X</span>
                  <input
                    type="number"
                    min={0}
                    max={emojiMaxX}
                    value={emojiPositionInput.x}
                    onFocus={() => clearDefaultEmojiCoordinate('x')}
                    onChange={(event) =>
                      changeEmojiCoordinate('x', event.target.value)
                    }
                    onBlur={() => commitEmojiCoordinate('x')}
                    className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-neutral-700 focus:ring-2 focus:ring-neutral-300"
                  />
                </label>

                <label className="space-y-1 text-sm font-medium">
                  <span>Emoji Y</span>
                  <input
                    type="number"
                    min={0}
                    max={emojiMaxY}
                    value={emojiPositionInput.y}
                    onFocus={() => clearDefaultEmojiCoordinate('y')}
                    onChange={(event) =>
                      changeEmojiCoordinate('y', event.target.value)
                    }
                    onBlur={() => commitEmojiCoordinate('y')}
                    className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-neutral-700 focus:ring-2 focus:ring-neutral-300"
                  />
                </label>
              </div>
            ) : attack === 'line' ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1 text-sm font-medium">
                  <span>Direction</span>
                  <select
                    value={lineOrientation}
                    onChange={(event) =>
                      changeLineOrientation(event.target.value)
                    }
                    className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-neutral-700 focus:ring-2 focus:ring-neutral-300"
                  >
                    {LINE_ORIENTATIONS.map((orientation) => (
                      <option key={orientation} value={orientation}>
                        {orientation === 'horizontal'
                          ? 'Horizontal'
                          : 'Vertical'}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1 text-sm font-medium">
                  <span>
                    {lineOrientation === 'horizontal' ? 'Row' : 'Column'}
                  </span>
                  <input
                    type="number"
                    min={0}
                    max={lineCoordinateMax}
                    value={lineCoordinateInput}
                    onFocus={clearDefaultLineCoordinate}
                    onChange={(event) =>
                      changeLineCoordinate(event.target.value)
                    }
                    onBlur={commitLineCoordinate}
                    className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-neutral-700 focus:ring-2 focus:ring-neutral-300"
                  />
                </label>
              </div>
            ) : attack === 'mirror' ? (
              <label className="block space-y-1 text-sm font-medium">
                <span>Flip</span>
                <select
                  value={mirrorDirection}
                  onChange={(event) =>
                    changeMirrorDirection(event.target.value)
                  }
                  className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-neutral-700 focus:ring-2 focus:ring-neutral-300"
                >
                  {MIRROR_DIRECTIONS.map((direction) => (
                    <option key={direction} value={direction}>
                      {direction === 'horizontal'
                        ? 'Left-right'
                        : 'Top-bottom'}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            <div className="flex aspect-square min-h-[300px] items-center justify-center rounded-md border border-neutral-300 bg-neutral-100 p-1 sm:min-h-[380px] xl:min-h-[420px]">
              {generatedAttack ? (
                <img
                  src={generatedAttack.src}
                  alt="Generated attacked image"
                  className="h-full w-full object-contain [image-rendering:pixelated]"
                />
              ) : (
                <span className="px-4 text-center text-sm text-neutral-500">
                  {attackError ?? 'Run attack to generate a temporary output'}
                </span>
              )}
            </div>

            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <dt className="text-neutral-500">Attack detail</dt>
              <dd className="font-medium">
                {generatedAttack?.location ?? '-'}
              </dd>
              <dt className="text-neutral-500">Affected pixels</dt>
              <dd className="font-medium">
                {generatedAttack?.changedPixels ?? '-'}
              </dd>
            </dl>

            <p className="rounded-md border border-neutral-300 bg-neutral-50 px-3 py-2 text-xs text-neutral-700">
              Each run creates a new temporary image in browser memory. Refreshing
              or leaving the page discards it.
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-lg border-neutral-300 bg-white">
          <CardHeader>
            <CardTitle className="text-lg">Attack Result</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={classifyAttack}
              disabled={!generatedAttack || isClassifying}
              className="w-full"
            >
              <Zap />
              {isClassifying ? 'Classifying' : 'Attack'}
            </Button>

            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <dt className="text-neutral-500">Attacked prediction</dt>
              <dd className="break-words font-medium">
                {classification.status === 'ready'
                  ? formatPrediction(
                      classification.prediction,
                      classification.predictionLabel,
                      classification.confidence,
                    )
                  : classification.status === 'pending'
                    ? 'Classifying...'
                    : classification.status === 'error'
                      ? 'Error'
                      : '-'}
              </dd>
              <dt className="text-neutral-500">Original prediction</dt>
              <dd className="break-words font-medium">
                {classification.status === 'ready'
                  ? formatPrediction(
                      classification.baselinePrediction,
                      classification.baselineLabel,
                      classification.baselineConfidence,
                    )
                  : '-'}
              </dd>
              <dt className="text-neutral-500">Attack result</dt>
              <dd className="font-medium">
                {classification.status === 'ready'
                  ? classification.success
                    ? 'Successed'
                    : 'Failed'
                  : '-'}
              </dd>
            </dl>

            {!generatedAttack && (
              <p className="rounded-md border border-neutral-300 bg-neutral-50 px-3 py-2 text-xs text-neutral-700">
                Apply an attack first, then run CNN classification here.
              </p>
            )}

            {classification.status === 'error' && (
              <p className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                {classification.message}
              </p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
