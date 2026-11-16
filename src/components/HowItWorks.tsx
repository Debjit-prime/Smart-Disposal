import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Layers, Leaf, RefreshCw, Search } from 'lucide-react';
import { AppPage } from '../types/disposal';
import { GlassButton, GlassCard, PrimaryButton } from './GlassUI';
import { CurvedCarousel, CurvedCarouselItem } from './CurvedCarousel';

interface HowItWorksProps {
  onNavigate: (page: AppPage) => void;
}

interface ProcedureStep {
  id: string;
  stepNumber: string;
  title: string;
  description: string;
  ctaLabel: string;
  targetPage: AppPage;
  Icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
}

const PROCEDURE_STEPS: ProcedureStep[] = [
  {
    id: 'stage-1',
    stepNumber: '01',
    title: 'Search or Scan',
    description: 'Type any everyday item or scan its barcode with your device camera.',
    ctaLabel: 'Open checker',
    targetPage: 'checker',
    Icon: Search,
  },
  {
    id: 'stage-2',
    stepNumber: '02',
    title: 'Check Database',
    description: 'Match materials against verified polymer science and composting sources.',
    ctaLabel: 'Browse database',
    targetPage: 'database',
    Icon: Layers,
  },
  {
    id: 'stage-3',
    stepNumber: '03',
    title: 'Get the Result',
    description: 'Inspect biodegradability verdict, breakdown timeline, and byproducts.',
    ctaLabel: 'Test an item',
    targetPage: 'checker',
    Icon: Leaf,
  },
  {
    id: 'stage-4',
    stepNumber: '04',
    title: 'Switch',
    description: 'Adopt a compostable or reusable alternative and log your eco-switch.',
    ctaLabel: 'See alternatives',
    targetPage: 'alternatives',
    Icon: RefreshCw,
  },
];

const BIOLOGY_ITEMS: CurvedCarouselItem[] = [
  {
    id: 'bio-microbes',
    title: 'Microbes',
    meta: 'Bacteria & fungi colonize surfaces',
    secondaryMeta: 'Living soil decomposers',
    iconType: 'sprout',
  },
  {
    id: 'bio-enzymes',
    title: 'Enzymes',
    meta: 'Cellulase & protease cleave bonds',
    secondaryMeta: 'Biological catalysts',
    iconType: 'layers',
  },
  {
    id: 'bio-conditions',
    title: 'Conditions',
    meta: 'Oxygen, moisture, warmth & soil pH',
    secondaryMeta: 'Rate-limiting factors',
    iconType: 'compass',
  },
  {
    id: 'bio-material',
    title: 'Material Type',
    meta: 'Natural cellulose vs. synthetic chains',
    secondaryMeta: 'Chemical bond structure',
    iconType: 'leaf',
  },
];

const RevealBlock: React.FC<{ children: React.ReactNode; delayMs?: number }> = ({
  children,
  delayMs = 0,
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setVisible(true);
      return;
    }

    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delayMs}ms` }}
      className={`transition-all duration-700 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      {children}
    </div>
  );
};

export const HowItWorks: React.FC<HowItWorksProps> = ({ onNavigate }) => {
  const [selectedBioId, setSelectedBioId] = useState<string>('bio-microbes');

  const bioDetails: Record<string, string> = {
    'bio-microbes':
      'Soil bacteria and saprotrophic fungi treat organic matter as food, colonizing moist surfaces to initiate natural decay.',
    'bio-enzymes':
      'Microorganisms secrete specialized extracellular enzymes like cellulase and protease that sever plant and protein polymers into simple sugars and amino acids.',
    'bio-conditions':
      'Oxygen, moisture, warmth, and neutral soil pH accelerate enzymatic activity. Sealed anaerobic landfills starve microbes of oxygen.',
    'bio-material':
      'Natural cellulose and keratin dissolve into fertile humus, whereas petroleum plastics rely on synthetic carbon-carbon bonds microbes cannot digest.',
  };

  return (
    <section className="w-full py-12 lg:py-20 space-y-16 overflow-hidden">
      {/* Intro */}
      <div className="px-6 md:px-12 lg:px-16 max-w-7xl mx-auto space-y-4">
        <div className="max-w-3xl space-y-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-normal tracking-[-0.04em] text-white [text-shadow:0_2px_18px_rgba(0,0,0,0.9)]">
            How It Works
          </h1>
          <p className="text-base md:text-lg text-gray-100 leading-relaxed [text-shadow:0_1px_12px_rgba(0,0,0,0.9)]">
            Four clear stages turn confusion at the bin into grounded material choices—backed by
            the biology of decomposition.
          </p>
        </div>
      </div>

      {/* 4-Step Procedure (section > div:nth-of-type(2), no horizontal scroll) */}
      <div className="px-6 md:px-12 lg:px-16 max-w-7xl mx-auto">
        <ol className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {PROCEDURE_STEPS.map((step, index) => {
            const StepIcon = step.Icon;
            return (
              <li key={step.id} className="relative flex">
                <GlassCard
                  onClick={() => onNavigate(step.targetPage)}
                  className="w-full p-6 flex flex-col justify-between space-y-6 hover:border-white/45 transition-colors"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-medium text-gray-300 tabular-nums">
                        Step {step.stepNumber}
                      </span>
                      <div className="w-8 h-8 rounded-full border border-white/25 bg-white/10 flex items-center justify-center shrink-0">
                        <StepIcon className="w-4 h-4 text-white" aria-hidden={true} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h2 className="text-xl font-normal tracking-[-0.03em] text-white">
                        {step.stepNumber}. {step.title}
                      </h2>
                      <p className="text-sm text-gray-300 leading-relaxed">{step.description}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/20 flex items-center justify-between gap-2 text-xs text-white">
                    <span>{step.ctaLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-300 shrink-0" aria-hidden="true" />
                  </div>
                </GlassCard>

                {index < PROCEDURE_STEPS.length - 1 && (
                  <div
                    aria-hidden="true"
                    className="hidden lg:flex items-center justify-center absolute -right-4 top-1/2 -translate-y-1/2 z-20 pointer-events-none"
                  >
                    <ArrowRight className="w-3.5 h-3.5 text-white/50" />
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </div>

      {/* Placement 4B: Biology Curved Carousel + Soil Cross-Section */}
      <div className="pt-10 border-t border-white/20 space-y-12">
        <div className="px-6 md:px-12 lg:px-16 max-w-7xl mx-auto">
          <RevealBlock>
            <div className="max-w-3xl space-y-4">
              <h2 className="text-3xl md:text-5xl font-normal tracking-[-0.04em] text-white [text-shadow:0_2px_18px_rgba(0,0,0,0.9)]">
                The Biology of Breakdown
              </h2>
              <p className="text-base md:text-lg text-gray-100 leading-relaxed [text-shadow:0_1px_12px_rgba(0,0,0,0.9)]">
                Four biological drivers decide whether an item returns to living soil or lingers for
                centuries. Select any card to read its mechanism.
              </p>
            </div>
          </RevealBlock>
        </div>

        <CurvedCarousel
          items={BIOLOGY_ITEMS}
          selectedId={selectedBioId}
          sharedImageUrl="/assets/aistudio/image_4_29227969.png"
          ariaLabel="Four biological factors of decomposition"
          onSelect={(item) => setSelectedBioId(item.id)}
        />

        <div className="px-6 md:px-12 lg:px-16 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-5">
            <RevealBlock>
              <GlassCard className="overflow-hidden h-full flex flex-col">
                <div className="bg-stage relative aspect-[3/4] w-full flex-1">
                  <div
                    className="hero-bg"
                    style={{
                      backgroundImage: `url('/assets/aistudio/image_4_29227969.png')`,
                    }}
                    role="img"
                    aria-label="Botanical cross-section showing surface leaves, mushroom fruiting body, underground fungal mycelium network, earthworms, and soil decomposers"
                  />
                </div>
                <div className="p-5 border-t border-white/20">
                  <p className="text-xs text-gray-300">
                    Soil food web · Fungal mycelium, invertebrates, and microbial enzymes recycling
                    leaf litter into humus.
                  </p>
                </div>
              </GlassCard>
            </RevealBlock>
          </div>

          <div className="lg:col-span-7 flex flex-col justify-between gap-6">
            <GlassCard className="p-6 sm:p-8 space-y-3">
              <p className="text-xs text-gray-300">Selected biological factor</p>
              <h3 className="text-2xl sm:text-3xl font-normal tracking-[-0.04em] text-white">
                {BIOLOGY_ITEMS.find((b) => b.id === selectedBioId)?.title}
              </h3>
              <p className="text-base text-gray-200 leading-relaxed">
                {bioDetails[selectedBioId]}
              </p>
            </GlassCard>

            <GlassCard className="p-8 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="space-y-2 max-w-md">
                <h3 className="text-2xl font-normal tracking-[-0.04em] text-white">
                  Test an everyday item right now.
                </h3>
                <p className="text-sm text-gray-300">
                  Inspect decomposition timelines and find cleaner swaps in seconds.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 shrink-0">
                <PrimaryButton type="button" onClick={() => onNavigate('checker')}>
                  Check a Product
                </PrimaryButton>
                <GlassButton type="button" onClick={() => onNavigate('database')}>
                  Explore Database
                </GlassButton>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </section>
  );
};
