import React, { useMemo, useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { ProductItem } from '../types/disposal';
import { getAlternativeImageUrl } from '../data/products';
import { GlassButton, GlassCard, PrimaryButton, VerdictBadge } from './GlassUI';
import { CurvedCarousel, CurvedCarouselItem } from './CurvedCarousel';

interface AlternativesViewProps {
  products: ProductItem[];
  switchedIds: string[];
  onSwitchAlternative: (product: ProductItem) => void;
  onSelectProduct: (product: ProductItem) => void;
}

function spreadDistinctImages(items: CurvedCarouselItem[]): CurvedCarouselItem[] {
  const remaining = [...items];
  const ordered: CurvedCarouselItem[] = [];
  while (remaining.length > 0) {
    const prevImg = ordered.length > 0 ? ordered[ordered.length - 1].imageUrl : undefined;
    const nextIdx = remaining.findIndex((candidate) => candidate.imageUrl !== prevImg);
    const chosenIdx = nextIdx >= 0 ? nextIdx : 0;
    ordered.push(remaining.splice(chosenIdx, 1)[0]);
  }
  return ordered;
}

export const AlternativesView: React.FC<AlternativesViewProps> = ({
  products,
  switchedIds,
  onSwitchAlternative,
  onSelectProduct,
}) => {
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);

  const prioritized = useMemo(() => {
    return [...products].sort((a, b) => {
      if (a.biodegradable === b.biodegradable) {
        return b.decompositionDays - a.decompositionDays;
      }
      return a.biodegradable ? 1 : -1;
    });
  }, [products]);

  const curvedItems: CurvedCarouselItem[] = useMemo(() => {
    const mapped: CurvedCarouselItem[] = prioritized.map((item) => ({
      id: item.id,
      title: item.alternative.name,
      meta: item.alternative.decompositionTime,
      secondaryMeta: `Replaces ${item.name}`,
      verdict: item.biodegradable ? 'biodegradable' : 'not-biodegradable',
      imageUrl: getAlternativeImageUrl(item),
      iconType: 'sprout',
    }));
    return spreadDistinctImages(mapped);
  }, [prioritized]);

  return (
    <section className="w-full py-12 lg:py-16 space-y-12 overflow-hidden">
      {/* Clean editorial banner with sunlit bamboo/ceramic/linen visual */}
      <div className="px-6 md:px-12 lg:px-16 max-w-7xl mx-auto">
        <GlassCard className="overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch bg-black/78">
          <div className="lg:col-span-6 p-8 sm:p-10 flex flex-col justify-center space-y-4">
            <p className="text-xs font-medium text-gray-200 tabular-nums">
              {prioritized.length} material swaps
            </p>
            <h1 className="text-4xl md:text-5xl font-normal tracking-[-0.04em] text-white">
              Greener Alternatives
            </h1>
            <p className="text-base text-gray-100 leading-relaxed max-w-xl">
              Practical everyday swaps that replace persistent synthetic waste with compostable or
              endlessly reusable materials.
            </p>
          </div>

          <div className="lg:col-span-6 bg-stage relative min-h-[240px] lg:min-h-[300px]">
            <div
              className="hero-bg"
              style={{
                backgroundImage: `url('/src/assets/images/alternatives_banner_nature_1794849364151.jpg')`,
              }}
              role="img"
              aria-label="Bamboo stems, unglazed ceramic cup, woven raw linen cloth, and sprouting leaves resting on mossy wood in warm morning sunlight"
            />
          </div>
        </GlassCard>
      </div>

      {/* Curved Horizontal Scroll Carousel for Greener Alternatives */}
      <div className="space-y-4">
        <div className="px-6 md:px-12 lg:px-16 max-w-7xl mx-auto">
          <p className="text-xs sm:text-sm font-medium text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.95),0_1px_3px_rgba(0,0,0,0.95)]">
            Drag, scroll, or use arrow keys to explore swaps — select any card to inspect
          </p>
        </div>

        <CurvedCarousel
          items={curvedItems}
          selectedId={selectedId}
          ariaLabel="Greener alternatives curved carousel"
          onSelect={(item) => {
            setSelectedId(item.id);
            const found = products.find((p) => p.id === item.id);
            if (found) onSelectProduct(found);
          }}
        />
      </div>

      {/* Side-by-side Swap Comparison Grid */}
      <div className="px-6 md:px-12 lg:px-16 max-w-7xl mx-auto space-y-6">
        <p className="text-xs sm:text-sm font-medium text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.95),0_1px_3px_rgba(0,0,0,0.95)]">
          Side-by-side swap comparison ({prioritized.length})
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {prioritized.map((item) => {
            const switched = switchedIds.includes(item.id);
            return (
              <GlassCard
                key={item.id}
                className="p-6 sm:p-8 flex flex-col justify-between space-y-6 bg-black/78"
              >
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-medium text-gray-200">{item.category}</span>
                    <VerdictBadge biodegradable={item.biodegradable} compact />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <p className="text-xs font-medium text-gray-200">Instead of</p>
                      <button
                        type="button"
                        onClick={() => onSelectProduct(item)}
                        className="text-left text-lg font-medium text-white hover:text-gray-200 transition-colors cursor-pointer"
                      >
                        {item.name}
                      </button>
                      <p className="text-xs sm:text-sm text-gray-200 tabular-nums">
                        {item.decompositionTime}
                      </p>
                    </div>

                    <div className="space-y-1.5 sm:border-l sm:border-white/25 sm:pl-5">
                      <p className="text-xs font-medium text-emerald-300">Switch to</p>
                      <p className="text-lg font-medium text-white">{item.alternative.name}</p>
                      <p className="text-xs sm:text-sm text-gray-200 tabular-nums">
                        {item.alternative.decompositionTime}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-100 leading-relaxed">{item.alternative.reason}</p>
                </div>

                <div className="pt-4 border-t border-white/20 flex flex-wrap items-center justify-between gap-3">
                  <GlassButton type="button" size="sm" onClick={() => onSelectProduct(item)}>
                    <span>Inspect breakdown</span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </GlassButton>

                  {switched ? (
                    <GlassButton
                      type="button"
                      size="sm"
                      active
                      onClick={() => onSwitchAlternative(item)}
                    >
                      <Check className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Switched</span>
                    </GlassButton>
                  ) : (
                    <PrimaryButton
                      type="button"
                      size="sm"
                      onClick={() => onSwitchAlternative(item)}
                    >
                      <span>Switch to this</span>
                    </PrimaryButton>
                  )}
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>
    </section>
  );
};
