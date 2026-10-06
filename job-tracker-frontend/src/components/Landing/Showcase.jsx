import { useState } from "react";
import { LANDING_SHOWCASE, screenshotFor } from "../../constants/landing";
import { useThemeStore } from "../../stores/useThemeStore";
import Tabs, { TabPanel } from "../UI/Tabs";
import Screenshot from "./Screenshot";

// Only the tabs whose (light-mode) screenshot file has been added
const AVAILABLE_SLIDES = LANDING_SHOWCASE.filter((slide) => screenshotFor(slide.fileName));

// "See it in action": one screenshot at a time, picked with labelled tabs. No tab bar for a single
// screenshot, and nothing at all when none have been added.
export default function Showcase() {
  const darkMode = useThemeStore((state) => state.darkMode);
  const [activeSlideId, setActiveSlideId] = useState(AVAILABLE_SLIDES[0]?.id);

  if (AVAILABLE_SLIDES.length === 0) return null;

  const activeSlide = AVAILABLE_SLIDES.find((slide) => slide.id === activeSlideId) ?? AVAILABLE_SLIDES[0];
  const screenshot = (
    <Screenshot
      key={activeSlide.id}
      src={screenshotFor(activeSlide.fileName, darkMode)}
      alt={activeSlide.alt}
      caption={activeSlide.caption}
      lazy
    />
  );

  return (
    <section aria-labelledby="showcase-heading" className="flex flex-col gap-8 max-w-4xl mx-auto w-full">
      <h2 id="showcase-heading" className="text-2xl sm:text-3xl font-bold text-center text-light-text dark:text-dark-text">
        See it in action
      </h2>
      {AVAILABLE_SLIDES.length === 1 ? (
        screenshot
      ) : (
        <div>
          {/* On a phone the tab bar scrolls sideways instead of squashing the labels (pt-1 keeps the
              keyboard focus ring inside the scroller, which would otherwise clip it) */}
          <div className="overflow-x-auto pt-1">
            <Tabs
              tabs={AVAILABLE_SLIDES}
              activeTab={activeSlide.id}
              onChange={setActiveSlideId}
              idPrefix="showcase"
              label="App screenshots"
              className="w-max min-w-full justify-center"
            />
          </div>
          <TabPanel idPrefix="showcase" tabId={activeSlide.id}>
            {screenshot}
          </TabPanel>
        </div>
      )}
    </section>
  );
}
