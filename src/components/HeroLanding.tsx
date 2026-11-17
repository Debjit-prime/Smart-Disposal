import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { AppPage, ProductItem } from '../types/disposal';
import { CurvedCarousel, CurvedCarouselItem } from './CurvedCarousel';
import { DemoTabId, LiveDemoPill } from './LiveDemoPill';
import { NavSafeMask } from './GlassUI';

interface HeroLandingProps {
  products: ProductItem[];
  onNavigate: (page: AppPage) => void;
  onSelectProduct: (product: ProductItem) => void;
}

const LINE_ONE = 'Know what you throw.';
const LINE_TWO = 'Choose what returns to earth.';

const HERO_SUBLINES: Record<DemoTabId, string> = {
  search: "Type any product to learn if it's biodegradable.",
  scan: 'Scan a barcode and get an answer in seconds.',
  switch: 'See a greener alternative and make the switch.',
};

const FEATURED_LANDING_IDS = [
  'plastic-bag',
  'banana-peel',
  'paper-plate',
  'styrofoam-cup',
  'tea-bag',
  'jute-bag',
  'glass-bottle',
  'cotton-tshirt',
];

function renderAnimatedLine(text: string, startIndex: number, extraClass = '') {
  let idx = startIndex;
  const node = (
    <span className={extraClass}>
      {text.split(' ').map((word, wordIdx, wordsArr) => (
        <span key={`${text}-${wordIdx}`} className="inline-block whitespace-nowrap">
          {word.split('').map((char, cIdx) => {
            const delayMs = 200 + idx * 28;
            idx += 1;
            return (
              <span
                key={`${wordIdx}-${cIdx}`}
                className="char-reveal"
                style={{ animationDelay: `${delayMs}ms` }}
              >
                {char}
              </span>
            );
          })}
          {wordIdx < wordsArr.length - 1 &&
            (() => {
              const spaceDelayMs = 200 + idx * 28;
              idx += 1;
              return (
                <span
                  className="char-reveal"
                  style={{ animationDelay: `${spaceDelayMs}ms` }}
                >
                  {'\u00A0'}
                </span>
              );
            })()}
        </span>
      ))}
    </span>
  );
  return { node, nextIndex: idx };
}

export const HeroLanding: React.FC<HeroLandingProps> = ({
  products,
  onNavigate,
  onSelectProduct,
}) => {
  const [demoTab, setDemoTab] = useState<DemoTabId>('search');

  const featuredProducts = FEATURED_LANDING_IDS.map((id) =>
    products.find((p) => p.id === id)
  ).filter((p): p is ProductItem => Boolean(p));

  const carouselItems: CurvedCarouselItem[] = featuredProducts.map((p) => ({
    id: p.id,
    title: p.name,
    meta: p.decompositionTime,
    secondaryMeta: `Switch: ${p.alternative.name}`,
    verdict: p.biodegradable ? 'biodegradable' : 'not-biodegradable',
    iconType: p.biodegradable ? 'leaf' : 'ban',
  }));

  const lineOneRender = renderAnimatedLine(LINE_ONE, 0, 'font-normal');
  const lineTwoRender = renderAnimatedLine(LINE_TWO, lineOneRender.nextIndex, 'font-light');

  const scrollToBelowFold = () => {
    const el = document.getElementById('hero-below-fold');
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 96;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    }
  };

  return (
    <div className="relative w-full bg-[#211409]">
      {/* Continuous seamless soil ground extending from behind the feathered hero soil through the below-fold section */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-[52vh] bottom-0 overflow-hidden z-0 [mask-image:linear-gradient(to_bottom,transparent_0px,black_220px,black_100%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0px,black_220px,black_100%)]"
      >
        <div
          className="w-full h-full bg-cover bg-top -scale-y-100 brightness-[0.74] contrast-[1.06]"
          style={{
            backgroundImage: `url('/src/assets/images/home_soil_smooth_extend_1794852543744.jpg')`,
          }}
        />
      </div>

      {/* Unmasked-top botanical video/image with outer non-scaled 56%->96% feather so drift scale never clips the fade */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[112vh] min-h-[840px] overflow-hidden z-0 [mask-image:linear-gradient(to_bottom,black_0%,black_56%,transparent_96%)] [-webkit-mask-image:linear-gradient(to_bottom,black_0%,black_56%,transparent_96%)]"
      >
        <div
          className="hero-bg animate-nature-drift pointer-events-none"
          style={{
            backgroundImage: `url('/assets/aistudio/image_1_1ba20a32.png')`,
          }}
        >
          {/* Placeholder video slot: drop your looping muted .mp4 file source here to play over background */}
          <video
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
            poster="/assets/aistudio/image_1_1ba20a32.png"
            aria-hidden="true"
          >
            {/* <source src="/videos/foliage-soil-loop.mp4" type="video/mp4" /> */}
          </video>
        </div>
      </div>

      {/* Foreground text & interactive layers smoothly fade clear of the fixed navbar on scroll */}
      <NavSafeMask className="relative z-10">
      <section aria-label="SmartDisposal hero" className="hero relative flex flex-col">
        {/* Hero content pinned to the bottom of the viewport with generous spacing */}
        <div className="relative z-10 flex-1 flex flex-col justify-end px-6 md:px-12 lg:px-16 pb-12 lg:pb-16 pt-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-end gap-6 lg:gap-8">
            {/* Widened left heading & copy container */}
            <div className="lg:col-span-7 xl:col-span-8 max-w-4xl">
              <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-[64px] font-normal tracking-[-0.04em] leading-[1.06] text-white mb-4 [text-wrap:balance] [text-shadow:0_2px_18px_rgba(0,0,0,0.85)]">
                {lineOneRender.node}
                <br />
                {lineTwoRender.node}
              </h1>

              {/* Subline linked to the active LiveDemoPill tab */}
              <p
                key={demoTab}
                className="animate-demo-morph text-base md:text-lg text-gray-100 lg:mb-6 max-w-xl leading-relaxed [text-shadow:0_1px_12px_rgba(0,0,0,0.9)]"
              >
                {HERO_SUBLINES[demoTab]}
              </p>

              {/* Desktop Action Buttons */}
              <div
                className="hero-fade-in hidden lg:flex flex-wrap gap-4"
                style={{ animationDelay: '900ms' }}
              >
                <button
                  type="button"
                  onClick={() => onNavigate('checker')}
                  className="bg-white text-black px-8 py-3 rounded-lg text-sm sm:text-base font-medium hover:bg-gray-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Check a Product
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('database')}
                  className="liquid-glass border border-white/25 text-white px-8 py-3 rounded-lg text-sm sm:text-base font-medium hover:bg-white hover:text-black transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Explore Database
                </button>
              </div>
            </div>

            {/* Bottom-right Live Demo Pill (sits above buttons at full width on mobile) */}
            <div
              className="hero-fade-in lg:col-span-5 xl:col-span-4 flex lg:justify-end"
              style={{ animationDelay: '1050ms' }}
            >
              <LiveDemoPill activeTab={demoTab} onTabChange={setDemoTab} />
            </div>

            {/* Mobile Action Buttons directly below Live Demo Pill */}
            <div className="flex lg:hidden flex-wrap gap-3">
              <button
                type="button"
                onClick={() => onNavigate('checker')}
                className="bg-white text-black px-6 py-3 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Check a Product
              </button>
              <button
                type="button"
                onClick={() => onNavigate('database')}
                className="liquid-glass border border-white/25 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-white hover:text-black transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Explore Database
              </button>
            </div>
          </div>

          {/* Bottom-centre subtle scroll cue */}
          <div className="mt-6 lg:mt-8 flex justify-center">
            <button
              type="button"
              onClick={scrollToBelowFold}
              className="liquid-glass border border-white/25 rounded-full px-4 py-1.5 inline-flex items-center gap-1.5 text-xs text-white hover:bg-white hover:text-black transition-colors animate-gentle-bob whitespace-nowrap cursor-pointer"
            >
              <span>See how it works</span>
              <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>

      {/* Directly under the hero fold (not over the video): Blended continuous soil ground + Stats Strip + Curved Carousel */}
      <section
        id="hero-below-fold"
        aria-label="What breaks down, and what doesn't"
        className="w-full relative z-10 scroll-mt-24 pt-10 pb-16 lg:pt-12 lg:pb-24 space-y-12 overflow-hidden"
      >
        {/* Thin Glass Stats Strip */}
        <div className="relative z-10 px-6 md:px-12 lg:px-16 max-w-7xl mx-auto">
          <div className="liquid-glass border border-white/20 rounded-xl px-5 py-3 overflow-x-auto no-scrollbar">
            <div className="flex items-center justify-start sm:justify-between gap-8 whitespace-nowrap min-w-max sm:min-w-0 text-xs sm:text-sm">
              <div className="flex items-center gap-1.5">
                <span className="text-white font-medium tabular-nums">500+</span>
                <span className="text-gray-300">materials</span>
              </div>
              <span className="text-white/20 hidden sm:inline" aria-hidden="true">
                /
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-white font-medium tabular-nums">3</span>
                <span className="text-gray-300">second answers</span>
              </div>
              <span className="text-white/20 hidden sm:inline" aria-hidden="true">
                /
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-white font-medium">Free</span>
                <span className="text-gray-300">and open</span>
              </div>
            </div>
          </div>
        </div>

        {/* Placement 1: Curved Carousel */}
        <div className="relative z-10 space-y-10">
          <div className="px-6 md:px-12 lg:px-16 max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-normal tracking-[-0.04em] text-white [text-shadow:0_2px_18px_rgba(0,0,0,0.9)]">
                What breaks down, and what doesn&apos;t
              </h2>
              <p className="text-sm sm:text-base text-gray-100 [text-shadow:0_1px_12px_rgba(0,0,0,0.9)]">
                Drag, scroll, or use arrow keys to compare everyday products and greener swaps.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('database')}
              className="liquid-glass border border-white/20 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-white hover:text-black transition-colors whitespace-nowrap shrink-0 self-start sm:self-auto cursor-pointer"
            >
              View full database
            </button>
          </div>

          <CurvedCarousel
            items={carouselItems}
            sharedImageUrl="/assets/aistudio/image_1_1ba20a32.png"
            ariaLabel="Everyday items decomposition comparison"
            onSelect={(item) => {
              const found = products.find((p) => p.id === item.id);
              if (found) onSelectProduct(found);
            }}
          />
        </div>
      </section>
      </NavSafeMask>
    </div>
  );
};
