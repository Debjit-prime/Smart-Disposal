import React, { useState } from 'react';
import { Leaf } from 'lucide-react';
import {
  FilterChip,
  GlassButton,
  GlassCard,
  GlassInput,
  Modal,
  PrimaryButton,
  ResultSkeleton,
  TimelineBar,
  VerdictBadge,
} from './GlassUI';
import { CurvedCarousel, CurvedCarouselItem } from './CurvedCarousel';
import { LiveDemoPill } from './LiveDemoPill';

interface DesignSystemViewProps {
  onTriggerToast: (msg: string) => void;
}

const DEMO_CAROUSEL_ITEMS: CurvedCarouselItem[] = [
  {
    id: 'demo-1',
    title: 'Default State',
    meta: 'Center 170×280 · 26px gap',
    verdict: 'biodegradable',
    iconType: 'leaf',
  },
  {
    id: 'demo-2',
    title: 'Hover State',
    meta: 'Lifts -8px · Brighter border',
    verdict: 'biodegradable',
    iconType: 'sprout',
  },
  {
    id: 'demo-3',
    title: 'Dragging State',
    meta: '1:1 pointer · 95%/s decay',
    iconType: 'refresh',
  },
  {
    id: 'demo-4',
    title: 'Focus State',
    meta: 'Pauses scroll · Arrow keys',
    verdict: 'not-biodegradable',
    iconType: 'ban',
  },
  {
    id: 'demo-5',
    title: 'Edge Perspective',
    meta: 'Grows to 370px · Outer taller',
    iconType: 'layers',
  },
];

export const DesignSystemView: React.FC<DesignSystemViewProps> = ({ onTriggerToast }) => {
  const [chipActive, setChipActive] = useState<'Plastics' | 'Paper'>('Plastics');
  const [sampleModalOpen, setSampleModalOpen] = useState(false);

  return (
    <section className="w-full py-12 lg:py-16 space-y-16 overflow-hidden">
      <div className="px-6 md:px-12 lg:px-16 max-w-7xl mx-auto space-y-16">
        {/* Header */}
        <div className="space-y-3 max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-normal tracking-[-0.04em] text-white [text-shadow:0_2px_18px_rgba(0,0,0,0.9)]">
            Style Guide &amp; Component Sheet
          </h1>
          <p className="text-base text-gray-100 [text-shadow:0_1px_12px_rgba(0,0,0,0.9)]">
            Design tokens, typography scale, liquid-glass specification, responsive grid frames,
            and shared React + Tailwind primitives for SmartDisposal.
          </p>
        </div>

        {/* 1. Color & Glass Tokens */}
        <div className="space-y-6">
          <h2 className="text-2xl font-normal tracking-[-0.04em] text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.9)]">
            01. Palette &amp; Liquid-Glass Surface
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <GlassCard className="p-5 space-y-3">
              <div className="h-14 rounded-lg bg-black border border-white/20" />
              <div>
                <p className="text-sm text-white">Canvas Base</p>
                <p className="text-xs text-gray-300 tabular-nums">#000000</p>
              </div>
            </GlassCard>

            <GlassCard className="p-5 space-y-3">
              <div className="h-14 rounded-lg bg-white" />
              <div>
                <p className="text-sm text-white">Primary Text &amp; CTA</p>
                <p className="text-xs text-gray-300 tabular-nums">#FFFFFF</p>
              </div>
            </GlassCard>

            <GlassCard className="p-5 space-y-3">
              <div className="h-14 rounded-lg bg-gray-300" />
              <div>
                <p className="text-sm text-white">Secondary Text</p>
                <p className="text-xs text-gray-300 tabular-nums">#D1D5DB (gray-300)</p>
              </div>
            </GlassCard>

            <GlassCard className="p-5 space-y-3">
              <div className="h-14 rounded-lg border border-white/20 bg-black" />
              <div>
                <p className="text-sm text-white">Hairline Border</p>
                <p className="text-xs text-gray-300 tabular-nums">rgba(255,255,255,0.2)</p>
              </div>
            </GlassCard>

            <GlassCard className="p-5 space-y-3">
              <div className="h-14 rounded-lg liquid-glass border border-white/20" />
              <div>
                <p className="text-sm text-white">Liquid Glass</p>
                <p className="text-xs text-gray-300">rgba(0,0,0,0.56) · blur(8px)</p>
              </div>
            </GlassCard>
          </div>

          <GlassCard className="p-6 text-sm text-gray-300 space-y-2">
            <p className="text-white font-medium">Liquid-Glass CSS Recipe</p>
            <p className="tabular-nums">
              background: rgba(0, 0, 0, 0.56) · backdrop-filter: blur(8px) · box-shadow: inset 0
              1px 1px rgba(255, 255, 255, 0.12) · 1.4px vertical gradient border (30% white top
              &amp; bottom fading to 0% center).
            </p>
          </GlassCard>
        </div>

        {/* 2. Typography, Spacing & Radii */}
        <div className="space-y-6">
          <h2 className="text-2xl font-normal tracking-[-0.04em] text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.9)]">
            02. Typography, Radii &amp; Breakpoints
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GlassCard className="p-6 space-y-5">
              <div className="space-y-1">
                <p className="text-xs text-gray-300">Hero Heading · Inter 400 · -0.04em</p>
                <p className="text-4xl font-normal tracking-[-0.04em] text-white">
                  Know what you throw.
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-300">Wordmark · Inter 600 · Single Leaf Accent</p>
                <p className="inline-flex items-center gap-2 text-2xl font-semibold tracking-tight text-white">
                  <Leaf className="w-4 h-4 text-[#86efac]" aria-hidden="true" />
                  <span>SmartDisposal</span>
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-300">Glass Tag · Inter 300</p>
                <p className="text-xl font-light text-white">Search. Scan. Switch.</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-300">Body Copy · Inter 400 · gray-300</p>
                <p className="text-base text-gray-300">
                  Plain, factual, encouraging prose without technical jargon.
                </p>
              </div>
            </GlassCard>

            <GlassCard className="p-6 space-y-4">
              <div className="flex justify-between border-b border-white/20 pb-3 text-sm">
                <span className="text-gray-300">Section horizontal padding</span>
                <span className="text-white tabular-nums">px-6 md:px-12 lg:px-16</span>
              </div>
              <div className="flex justify-between border-b border-white/20 pb-3 text-sm">
                <span className="text-gray-300">Cards &amp; Navbar radius</span>
                <span className="text-white tabular-nums">rounded-xl (12px)</span>
              </div>
              <div className="flex justify-between border-b border-white/20 pb-3 text-sm">
                <span className="text-gray-300">Carousel card radius</span>
                <span className="text-white tabular-nums">15px (no drop shadows)</span>
              </div>
              <div className="flex justify-between border-b border-white/20 pb-3 text-sm">
                <span className="text-gray-300">Desktop frame target</span>
                <span className="text-white tabular-nums">1440px (170×280 → 370px edges)</span>
              </div>
              <div className="flex justify-between border-b border-white/20 pb-3 text-sm">
                <span className="text-gray-300">Tablet frame target</span>
                <span className="text-white tabular-nums">768px (0.86× curved band)</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Mobile frame target</span>
                <span className="text-white tabular-nums">390px (~250px tall curved band)</span>
              </div>
            </GlassCard>
          </div>
        </div>

        {/* 3. Live Component Sheet */}
        <div className="space-y-6">
          <h2 className="text-2xl font-normal tracking-[-0.04em] text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.9)]">
            03. Interactive Component Sheet
          </h2>
          <GlassCard className="p-6 sm:p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <p className="text-xs text-gray-300">Buttons</p>
                <div className="flex flex-wrap gap-3">
                  <PrimaryButton
                    type="button"
                    onClick={() => onTriggerToast('Primary action clicked')}
                  >
                    Check a Product
                  </PrimaryButton>
                  <GlassButton
                    type="button"
                    onClick={() => onTriggerToast('Glass secondary button clicked')}
                  >
                    Explore Database
                  </GlassButton>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-gray-300">Verdict Badges (Icon + Text)</p>
                <div className="flex flex-wrap gap-3">
                  <VerdictBadge biodegradable={true} />
                  <VerdictBadge biodegradable={false} />
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-gray-300">Filter Chips</p>
                <div className="flex flex-wrap gap-2">
                  <FilterChip
                    label="Plastics"
                    active={chipActive === 'Plastics'}
                    onClick={() => setChipActive('Plastics')}
                  />
                  <FilterChip
                    label="Paper"
                    active={chipActive === 'Paper'}
                    onClick={() => setChipActive('Paper')}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-gray-300">Glass Input &amp; Overlay Triggers</p>
                <div className="flex flex-wrap gap-3">
                  <GlassInput placeholder="Type a product..." className="max-w-xs" />
                  <GlassButton type="button" onClick={() => setSampleModalOpen(true)}>
                    Open Modal
                  </GlassButton>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/20">
              <TimelineBar percent={28} label="2 – 4 months" biodegradable={true} />
            </div>

            <div className="pt-6 border-t border-white/20 space-y-3">
              <p className="text-xs text-gray-300">Loading Skeleton (Glass Shimmer)</p>
              <ResultSkeleton />
            </div>
          </GlassCard>
        </div>

        {/* 4. Curved Carousel States & Specs */}
        <div className="space-y-4">
          <h2 className="text-2xl font-normal tracking-[-0.04em] text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.9)]">
            04. Curved Horizontal Scroll Carousel (States &amp; Geometry)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <GlassCard className="p-5 space-y-1.5">
              <p className="text-sm font-medium text-white">Default</p>
              <p className="text-xs text-gray-300">
                50px/s right-to-left loop, 170×280 center arch rising in middle, 26px gap.
              </p>
            </GlassCard>
            <GlassCard className="p-5 space-y-1.5">
              <p className="text-sm font-medium text-white">Hover</p>
              <p className="text-xs text-gray-300">
                Card lifts upward (-8px) and hairline border brightens to white/70.
              </p>
            </GlassCard>
            <GlassCard className="p-5 space-y-1.5">
              <p className="text-sm font-medium text-white">Dragging</p>
              <p className="text-xs text-gray-300">
                Cursor grab → grabbing, 1:1 pointer tracking, 95%/s momentum coast decay.
              </p>
            </GlassCard>
            <GlassCard className="p-5 space-y-1.5">
              <p className="text-sm font-medium text-white">Focus &amp; Reduced Motion</p>
              <p className="text-xs text-gray-300">
                Pauses auto-scroll on focus, Left/Right arrow step, static row under reduced motion.
              </p>
            </GlassCard>
          </div>
        </div>
      </div>

      {/* Full-bleed live Curved Carousel preview */}
      <CurvedCarousel
        items={DEMO_CAROUSEL_ITEMS}
        sharedImageUrl="/assets/aistudio/image_1_1ba20a32.png"
        ariaLabel="Curved carousel interactive state showcase"
        onSelect={(item) => onTriggerToast(`Selected carousel card: ${item.title}`)}
      />

      {/* 5. Live Demo Pill — All 3 States + Interactive States */}
      <div className="px-6 md:px-12 lg:px-16 max-w-7xl mx-auto space-y-8">
        <div className="space-y-2">
          <h2 className="text-2xl font-normal tracking-[-0.04em] text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.9)]">
            05. Live Demo Pill — States &amp; Component Sheet
          </h2>
          <p className="text-sm text-gray-100 [text-shadow:0_1px_10px_rgba(0,0,0,0.9)]">
            Auto-cycles every 3s, pauses on hover/focus/hidden tab, supports Left/Right arrow keys,
            and falls back to static tabs under reduced motion.
          </p>
        </div>

        {/* All three tab states side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <p className="text-xs text-gray-300">State 1 · Search</p>
            <LiveDemoPill lockedTab="search" className="lg:w-full" />
          </div>
          <div className="space-y-2">
            <p className="text-xs text-gray-300">State 2 · Scan</p>
            <LiveDemoPill lockedTab="scan" className="lg:w-full" />
          </div>
          <div className="space-y-2">
            <p className="text-xs text-gray-300">State 3 · Switch</p>
            <LiveDemoPill lockedTab="switch" className="lg:w-full" />
          </div>
        </div>

        {/* Hover, Focus, and Pressed state previews */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <p className="text-xs text-gray-300">Hover State (Pauses Timer)</p>
            <LiveDemoPill lockedTab="search" previewState="hover" className="lg:w-full" />
          </div>
          <div className="space-y-2">
            <p className="text-xs text-gray-300">Focus State (White Ring + Keyboard Step)</p>
            <LiveDemoPill lockedTab="scan" previewState="focus" className="lg:w-full" />
          </div>
          <div className="space-y-2">
            <p className="text-xs text-gray-300">Pressed State (Active Tab Feedback)</p>
            <LiveDemoPill lockedTab="switch" previewState="pressed" className="lg:w-full" />
          </div>
        </div>
      </div>

      <Modal
        open={sampleModalOpen}
        onClose={() => setSampleModalOpen(false)}
        title="Sample glass modal"
      >
        <p className="text-sm text-gray-300 mb-6">
          Dialogs render with keyboard Escape dismissal, visible focus rings, and liquid-glass
          surface contrast.
        </p>
        <div className="flex justify-end">
          <PrimaryButton type="button" onClick={() => setSampleModalOpen(false)}>
            Close
          </PrimaryButton>
        </div>
      </Modal>
    </section>
  );
};
