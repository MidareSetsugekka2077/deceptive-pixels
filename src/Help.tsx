import { useMemo, useState } from 'react';
import { Header } from './components/Header';
import { HELP_TOPICS, TOPIC_IMAGES } from './config/helpTopics';

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
