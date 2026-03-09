import { useState } from 'react';
import { Header } from './components/Header';
import { CHALLENGE_CARDS } from './config/challengeCards';
import type { DatasetKey } from './config/images';
import { getAttackedImageSrc } from './hooks/useImages';
import {
  getFoundAttackedImages,
  getTrackableAttackedImages,
} from './legacy/challengeScore';

interface GalleryTileProps {
  challengeId: number;
  dataset: DatasetKey;
  filename: string;
  unlocked: boolean;
}

function GalleryTile({ challengeId, dataset, filename, unlocked }: GalleryTileProps) {
  return (
    <div className="rounded-[2px] bg-white p-2">
      <div className="relative aspect-square w-full overflow-hidden bg-[#a1a1ab]">
        {unlocked ? (
          <img
            src={getAttackedImageSrc(challengeId, dataset, filename)}
            alt={`${filename} unlocked example`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[86px] leading-none text-black">
            ?
          </div>
        )}
      </div>
    </div>
  );
}

export function Gallery() {
  const [dataset, setDataset] = useState<DatasetKey>('mnist');

  return (
    <div className="min-h-screen bg-[#d8d8d8] text-black">
      <Header />
      <div className="h-[3px] w-full bg-[#0d2d43]" />

      <main className="mx-auto w-full max-w-[1240px] px-4 pb-16 pt-6 sm:px-6 md:px-10">
        <div className="mb-8 flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            className={`rounded-[5px] border px-4 py-2 text-[18px] font-medium tracking-[-0.3125px] transition-colors ${
              dataset === 'mnist'
                ? 'border-[#0d2d43] bg-[#0d2d43] text-white'
                : 'border-black/40 bg-transparent text-black hover:bg-black/5'
            }`}
            onClick={() => setDataset('mnist')}
          >
            MNIST
          </button>
          <button
            type="button"
            className={`rounded-[5px] border px-4 py-2 text-[18px] font-medium tracking-[-0.3125px] transition-colors ${
              dataset === 'imagenet'
                ? 'border-[#0d2d43] bg-[#0d2d43] text-white'
                : 'border-black/40 bg-transparent text-black hover:bg-black/5'
            }`}
            onClick={() => setDataset('imagenet')}
          >
            ImageNet
          </button>
        </div>

        <div className="space-y-12">
          {CHALLENGE_CARDS
            .slice()
            .sort((a, b) => a.challengeId - b.challengeId)
            .map((card) => {
              const trackableImages = getTrackableAttackedImages(card.challengeId, dataset);
              const foundImages = new Set(getFoundAttackedImages(card.challengeId, dataset));
              const unlockedCount = trackableImages.filter((name) => foundImages.has(name)).length;

              return (
                <section key={`gallery-${dataset}-${card.challengeId}`}>
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <h2 className="text-[28px] font-medium leading-6 tracking-[-0.3125px]">
                      {card.title}
                    </h2>
                    <p className="text-[28px] font-medium leading-6 tracking-[-0.3125px]">
                      Unlocked {unlockedCount}/{trackableImages.length}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-[16px] sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {trackableImages.map((filename) => (
                      <GalleryTile
                        key={`${card.challengeId}-${dataset}-${filename}`}
                        challengeId={card.challengeId}
                        dataset={dataset}
                        filename={filename}
                        unlocked={foundImages.has(filename)}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
        </div>
      </main>
    </div>
  );
}
