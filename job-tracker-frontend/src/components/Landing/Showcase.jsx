import { useState } from "react";
import { LANDING_SHOWCASE, screenshotFor } from "../../constants/landing";
import { useThemeStore } from "../../stores/useThemeStore";
import Screenshot from "./Screenshot";
import SectionHeading from "./SectionHeading";

// Only the features whose (light-mode) screenshot file has been added
const AVAILABLE_SLIDES = LANDING_SHOWCASE.filter((slide) => screenshotFor(slide.fileName));

const PANEL_ID = "feature-panel";
const tabId = (slideId) => `feature-tab-${slideId}`;

// Arrow keys move through the list whichever way it's laid out (a column on desktop, wrapped chips on phones)
const ARROW_STEPS = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };

const featureClasses = (isSelected) =>
  `flex min-h-14 grow basis-[calc((320px-100%)*999)] items-center gap-3 rounded-xl border px-4 text-left text-lg whitespace-nowrap transition-colors ${
    isSelected ? "border-accent bg-accent font-semibold text-white" : "border-line bg-surface font-medium text-ink hover:bg-soft"
  }`;

// "Everything your job search needs": the feature list beside its screenshot and caption. The list is a column
// beside the screenshot on desktop and wraps into chips above it on phones (the basis trick: each tab takes a
// full row while the list is narrower than 320px). No list for a single screenshot, nothing at all for none.
export default function Showcase() {
  const darkMode = useThemeStore((state) => state.darkMode);
  const [activeSlideId, setActiveSlideId] = useState(AVAILABLE_SLIDES[0]?.id);

  if (AVAILABLE_SLIDES.length === 0) return null;

  const activeSlide = AVAILABLE_SLIDES.find((slide) => slide.id === activeSlideId) ?? AVAILABLE_SLIDES[0];
  const showList = AVAILABLE_SLIDES.length > 1;

  const selectSlide = (slide) => {
    setActiveSlideId(slide.id);
    document.getElementById(tabId(slide.id))?.focus();
  };

  const moveWithKeys = (event) => {
    const currentIndex = AVAILABLE_SLIDES.indexOf(activeSlide);
    const lastIndex = AVAILABLE_SLIDES.length - 1;
    let nextIndex;
    if (event.key in ARROW_STEPS) nextIndex = (currentIndex + ARROW_STEPS[event.key] + AVAILABLE_SLIDES.length) % AVAILABLE_SLIDES.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = lastIndex;
    if (nextIndex === undefined) return;
    event.preventDefault();
    selectSlide(AVAILABLE_SLIDES[nextIndex]);
  };

  return (
    <section aria-labelledby="features-heading" className="bg-page">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-12 px-4 py-16 sm:px-8 lg:py-24">
        <SectionHeading
          id="features-heading"
          title="Everything your job search needs"
          subtitle={showList ? "Pick a feature to see it in the app." : "Here's how it looks in the app."}
        />
        <div className="flex flex-wrap items-start gap-8">
          {showList && (
            <div
              role="tablist"
              aria-label="Features"
              aria-orientation="vertical"
              onKeyDown={moveWithKeys}
              className="flex max-w-full flex-[1_1_280px] flex-wrap gap-2"
            >
              {AVAILABLE_SLIDES.map((slide) => {
                const isSelected = slide.id === activeSlide.id;
                const FeatureIcon = slide.icon;
                return (
                  <button
                    key={slide.id}
                    id={tabId(slide.id)}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    aria-controls={PANEL_ID}
                    tabIndex={isSelected ? 0 : -1}
                    onClick={() => setActiveSlideId(slide.id)}
                    className={featureClasses(isSelected)}
                  >
                    <FeatureIcon size={20} aria-hidden="true" />
                    {slide.label}
                  </button>
                );
              })}
            </div>
          )}
          <figure
            id={PANEL_ID}
            role={showList ? "tabpanel" : undefined}
            aria-labelledby={showList ? tabId(activeSlide.id) : undefined}
            className="flex min-w-0 flex-[999_1_560px] flex-col gap-4"
          >
            <Screenshot
              key={activeSlide.id}
              src={screenshotFor(activeSlide.fileName, darkMode)}
              alt={activeSlide.alt}
              frameClassName="bg-surface"
              lazy
            />
            <figcaption className="flex flex-col gap-1">
              <strong className="text-xl/8 font-semibold">{activeSlide.label}</strong>
              <span className="text-lg/8 text-muted">{activeSlide.caption}</span>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
