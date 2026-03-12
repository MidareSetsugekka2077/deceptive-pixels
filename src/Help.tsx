import { useMemo, useState } from 'react';
import { Header } from './components/Header';

interface HelpPage {
  visualLabel: string;
  body: string;
}

interface HelpTopic {
  id: string;
  question: string;
  source: string;
  accentColor: string;
  pages: HelpPage[];
}

// Mapping of topic IDs to their help images (shown on first page only)
const TOPIC_IMAGES: Record<string, string> = {
  cnn: '/help/cnn1.webp',
  vit: '/help/vit1.png',
  mnist: '/help/mnist.png',
  imagenet: '/help/imagenet.webp',
  'adversarial-attacks': '/help/adversarial_attack.png',
  'why-care': '/help/why_care.png',
};

const HELP_TOPICS: HelpTopic[] = [
  {
    id: 'cnn',
    question: 'What is a CNN?',
    source: 'https://www.codecademy.com/article/understanding-convolutional-neural-network-cnn-architecture',
    accentColor: '#fb2c36',
    pages: [
      {
        visualLabel: 'CNN overview',
        body:
          'A Convolutional Neural Network (CNN) is a model that looks for visual patterns like edges, textures, and shapes. It stacks these patterns from simple to complex until it can recognize objects.',
      },
      {
        visualLabel: 'How CNNs learn',
        body:
          'CNNs train on labelled images and adjust their internal weights to reduce mistakes. Over time, they become better at spotting signals that separate one class from another.',
      },
      {
        visualLabel: 'Why this matters here',
        body:
          'In this game, a CNN can be tricked by small changes to an image. You are exploring examples where those changes cause confident but incorrect predictions.',
      },
    ],
  },
  {
    id: 'vit',
    question: 'What is a ViT?',
    source: 'https://arxiv.org/pdf/2010.11929',
    accentColor: '#f0b100',
    pages: [
      {
        visualLabel: 'ViT overview',
        body:
          'A Vision Transformer (ViT) splits an image into patches and processes them with attention, similar to how language transformers process words.',
      },
      {
        visualLabel: 'Patch attention',
        body:
          'Attention helps the model decide which image patches matter most for prediction. It can capture long-range relationships across the whole image.',
      },
      {
        visualLabel: 'In adversarial settings',
        body:
          'ViTs can still be fooled by adversarial inputs, but the failure patterns may differ from CNNs because they rely on different internal representations. Some attacks are still highly effective against ViTs.',
      },
    ],
  },
  {
    id: 'mnist',
    question: 'What is MNIST?',
    source: 'https://en.wikipedia.org/wiki/MNIST_database',
    accentColor: '#ffe600',
    pages: [
      {
        visualLabel: 'MNIST digits',
        body:
          'MNIST is a classic dataset of handwritten digits from 0 to 9. It is often used for simple image classification experiments and benchmarks.',
      },
      {
        visualLabel: 'Why use it here',
        body:
          'Because the images are small and simple, it is easier to see how tiny perturbations can still change the model\'s decision.',
      },
    ],
  },
  {
    id: 'imagenet',
    question: 'What is ImageNet?',
    source: 'https://en.wikipedia.org/wiki/ImageNet',
    accentColor: '#008945',
    pages: [
      {
        visualLabel: 'ImageNet overview',
        body:
          'ImageNet is a large-scale dataset with many object categories and realistic photos. It is widely used to train and evaluate advanced image models.',
      },
      {
        visualLabel: 'Why it is harder',
        body:
          'ImageNet contains richer scenes, more variation, and more classes than MNIST. Adversarial examples in this setting can be less obvious but still effective.',
      },
    ],
  },
  {
    id: 'adversarial-attacks',
    question: 'What are adversarial attacks?',
    source: 'https://arxiv.org/pdf/2312.16880',
    accentColor: '#39ff7e',
    pages: [
      {
        visualLabel: 'Attack concept',
        body:
          'Adversarial attacks are intentional changes to an input that make a model predict the wrong label. The change is crafted to exploit model weaknesses.',
      },
      {
        visualLabel: 'Common attack styles',
        body:
          'This project includes attacks like pixel edits, shifts, rotations, blur, noise, and patches. Each one perturbs the image in a different way.',
      },
    ],
  },
  {
    id: 'why-work',
    question: 'Why do these attacks work?',
    source: 'https://arxiv.org/pdf/2312.16880',
    accentColor: '#0d55f1',
    pages: [
      {
        visualLabel: 'Decision boundaries',
        body:
          'Models learn complex decision boundaries. A small, targeted perturbation can move an image across a boundary, flipping the predicted class.',
      },
      {
        visualLabel: 'Model shortcuts',
        body:
          'Neural networks can rely on brittle shortcuts that correlate with labels in training data. Attacks exploit these shortcuts instead of changing true semantics.',
      },
      {
        visualLabel: 'Transferability',
        body:
          'Some adversarial examples fool multiple models, which means vulnerabilities are not always tied to one exact architecture.',
      },
    ],
  },
  {
    id: 'why-fail',
    question: 'Why do some attacks not work?',
    source: 'https://arxiv.org/pdf/2403.08170',
    accentColor: '#a70ee8',
    pages: [
      {
        visualLabel: 'Attack constraints',
        body:
          'Attacks usually have limits, such as small perturbation budgets. If the limit is too strict, the change may be insufficient to force misclassification.',
      },
      {
        visualLabel: 'Model robustness',
        body:
          'Some samples are naturally more robust, and some models use defenses or training strategies that make attacks less effective in practice.',
      },
      {
        visualLabel: 'Optimization issues',
        body:
          'Attack generation can get stuck in weak solutions. Parameter choices like step size, iterations, and initialization strongly affect success rates.',
      },
    ],
  },
  {
    id: 'why-care',
    question: 'Why should I care?',
    source: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10487122/',
    accentColor: '#0a0a0a',
    pages: [
      {
        visualLabel: 'Real-world impact',
        body:
          'Adversarial vulnerabilities matter in safety-critical systems such as healthcare, autonomous driving, and security applications.',
      },
      {
        visualLabel: 'Better AI engineering',
        body:
          'Understanding attacks helps practitioners design stronger evaluation pipelines, better defenses, and more reliable models.',
      },
      {
        visualLabel: 'Responsible deployment',
        body:
          'Studying failure modes is part of building trustworthy AI. Awareness of adversarial risk supports safer deployment decisions.',
      },
    ],
  },
];

export function Help() {
  const [activeTopicId, setActiveTopicId] = useState(HELP_TOPICS[0].id);
  const [pageIndex, setPageIndex] = useState(0);

  const activeTopic = useMemo(
    () => HELP_TOPICS.find((topic) => topic.id === activeTopicId) ?? HELP_TOPICS[0],
    [activeTopicId],
  );

  const totalPages = activeTopic.pages.length;
  const currentPage = activeTopic.pages[pageIndex] ?? activeTopic.pages[0];

  const canGoBack = pageIndex > 0;
  const canGoForward = pageIndex < totalPages - 1;

  const selectTopic = (topicId: string) => {
    setActiveTopicId(topicId);
    setPageIndex(0);
  };

  return (
    <div className="min-h-screen bg-[#d8d8d8] text-black">
      <Header />
      <div className="h-[3px] w-full bg-[#0d2d43]" />

      <main className="mx-auto w-full max-w-[1240px] pb-12">
        <div className="flex flex-col md:min-h-[calc(100vh-70px)] md:flex-row">
          <section className="border-b-[3px] border-[#0d2d43] p-3 md:w-[340px] md:border-b-0 md:border-r-[3px] md:p-[11px]">
            <div className="space-y-[11px]">
              {HELP_TOPICS.map((topic) => {
                const active = topic.id === activeTopic.id;

                return (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => selectTopic(topic.id)}
                    className={`group flex w-full items-stretch rounded-[2px] text-left transition-shadow hover:shadow-[0_0_0_1px_rgba(13,45,67,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d2d43] focus-visible:ring-offset-1 ${
                      active ? 'shadow-[0_0_0_2px_rgba(13,45,67,0.55)]' : ''
                    }`}
                  >
                    <span
                      className="h-[40px] w-[40px] shrink-0 rounded-[2px]"
                      style={{ backgroundColor: topic.accentColor }}
                      aria-hidden="true"
                    />
                    <span className="flex min-h-[40px] flex-1 items-center rounded-r-[2px] bg-white px-4 text-[16px] leading-6 tracking-[-0.3125px]">
                      {topic.question}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="flex-1 px-4 pb-6 pt-6 sm:px-8 md:px-10">
            <h1 className="text-center text-[38px] font-medium leading-[1.1] tracking-[-0.3125px] sm:text-[48px]">
              {activeTopic.question}
            </h1>

            <div className="mt-5 flex items-center justify-center gap-2 sm:gap-4 md:gap-6">
              <button
                type="button"
                onClick={() => setPageIndex((index) => Math.max(index - 1, 0))}
                disabled={!canGoBack}
                aria-label="Previous help page"
                className="flex h-[36px] w-[36px] items-center justify-center rounded-full border-[3px] border-black bg-transparent text-[26px] leading-none transition-opacity disabled:cursor-not-allowed disabled:opacity-35"
              >
                <span aria-hidden="true">&#8592;</span>
              </button>

              <article className="w-full max-w-[480px] rounded-[5px] bg-white px-4 pb-3 pt-3 sm:px-5 sm:pb-4 sm:pt-[11px]">
                <div className="h-[210px] w-full bg-[#a1a1ab] sm:h-[243px]">
                  {pageIndex === 0 && TOPIC_IMAGES[activeTopic.id] ? (
                    <img
                      src={TOPIC_IMAGES[activeTopic.id]}
                      alt={currentPage.visualLabel}
                      className="h-full w-full rounded-[2px] object-contain"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center px-4 text-center text-[18px] font-medium text-black/75 sm:text-[20px]">
                      {currentPage.visualLabel}
                    </div>
                  )}
                </div>

                <p className="px-2 pb-2 pt-7 text-[16px] leading-[1.5] tracking-[-0.2px] sm:px-6">
                  {currentPage.body}
                </p>

                <div className="mx-auto flex h-[20px] w-[40px] items-center justify-center rounded-[2px] bg-[#d9d9d9] text-[16px] leading-6 tracking-[-0.3125px]">
                  {pageIndex + 1}/{totalPages}
                </div>

                <div className="mt-4 border-t border-[#d9d9d9] pt-3 text-center">
                  <span className="text-[14px] text-black">Learn more: </span>
                  <a
                    href={activeTopic.source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[14px] text-blue-600 hover:underline break-words"
                  >
                    {activeTopic.source}
                  </a>
                </div>
              </article>

              <button
                type="button"
                onClick={() => setPageIndex((index) => Math.min(index + 1, totalPages - 1))}
                disabled={!canGoForward}
                aria-label="Next help page"
                className="flex h-[36px] w-[36px] items-center justify-center rounded-full border-[3px] border-black bg-transparent text-[26px] leading-none transition-opacity disabled:cursor-not-allowed disabled:opacity-35"
              >
                <span aria-hidden="true">&#8594;</span>
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
