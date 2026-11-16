import React from 'react';
import { ArrowRight, Trash2 } from 'lucide-react';
import { ProductItem } from '../types/disposal';
import { GlassButton, GlassCard, PrimaryButton, VerdictBadge } from './GlassUI';

interface DashboardViewProps {
  products: ProductItem[];
  savedIds: string[];
  switchedIds: string[];
  historyIds: string[];
  onSelectProduct: (product: ProductItem) => void;
  onRemoveSaved: (id: string) => void;
  onClearHistory: () => void;
  onGoToChecker: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  products,
  savedIds,
  switchedIds,
  historyIds,
  onSelectProduct,
  onRemoveSaved,
  onClearHistory,
  onGoToChecker,
}) => {
  const savedProducts = savedIds
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is ProductItem => Boolean(p));

  const historyProducts = historyIds
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is ProductItem => Boolean(p));

  const switchedProducts = switchedIds
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is ProductItem => Boolean(p));

  return (
    <section className="w-full px-6 md:px-12 lg:px-16 py-12 lg:py-16">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-normal tracking-[-0.04em] text-white [text-shadow:0_2px_18px_rgba(0,0,0,0.9)]">
              Your Activity
            </h1>
            <p className="text-base text-gray-100 [text-shadow:0_1px_12px_rgba(0,0,0,0.9)]">
              Saved items, lookup history, and greener alternatives you have adopted.
            </p>
          </div>
          <PrimaryButton type="button" onClick={onGoToChecker}>
            Check a Product
          </PrimaryButton>
        </div>

        {/* Stat Glass Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <GlassCard className="p-6 space-y-2">
            <p className="text-xs text-gray-300">Eco-switches adopted</p>
            <p className="text-4xl font-normal text-white tabular-nums tracking-[-0.04em]">
              {switchedProducts.length}
            </p>
            <p className="text-xs text-gray-300">Greener alternatives selected</p>
          </GlassCard>

          <GlassCard className="p-6 space-y-2">
            <p className="text-xs text-gray-300">Saved items</p>
            <p className="text-4xl font-normal text-white tabular-nums tracking-[-0.04em]">
              {savedProducts.length}
            </p>
            <p className="text-xs text-gray-300">Pinned for reference</p>
          </GlassCard>

          <GlassCard className="p-6 space-y-2">
            <p className="text-xs text-gray-300">Products checked</p>
            <p className="text-4xl font-normal text-white tabular-nums tracking-[-0.04em]">
              {historyProducts.length}
            </p>
            <p className="text-xs text-gray-300">Recent material lookups</p>
          </GlassCard>
        </div>

        {/* Two-column lists: Saved + History */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Saved Items */}
          <div className="space-y-4">
            <h2 className="text-2xl font-normal tracking-[-0.04em] text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.9)]">
              Saved Items
            </h2>

            {savedProducts.length === 0 ? (
              <GlassCard className="p-6 space-y-3">
                <p className="text-sm text-white">No saved products yet</p>
                <p className="text-sm text-gray-300">
                  Save any item from its result screen to keep its breakdown timeline handy.
                </p>
              </GlassCard>
            ) : (
              <div className="space-y-3">
                {savedProducts.map((item) => (
                  <GlassCard
                    key={item.id}
                    className="p-5 flex items-center justify-between gap-4"
                  >
                    <button
                      type="button"
                      onClick={() => onSelectProduct(item)}
                      className="text-left min-w-0 flex-1 space-y-1 cursor-pointer group"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-base text-white group-hover:text-gray-300 transition-colors">
                          {item.name}
                        </span>
                      </div>
                      <p className="text-xs text-gray-300 tabular-nums">
                        {item.decompositionTime} · Switch: {item.alternative.name}
                      </p>
                    </button>

                    <div className="flex items-center gap-2 shrink-0">
                      <VerdictBadge biodegradable={item.biodegradable} compact />
                      <button
                        type="button"
                        onClick={() => onRemoveSaved(item.id)}
                        aria-label={`Remove ${item.name} from saved items`}
                        className="p-2 rounded-lg liquid-glass border border-white/20 text-gray-300 hover:bg-white hover:text-black transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}
          </div>

          {/* History & Switches */}
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl font-normal tracking-[-0.04em] text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.9)]">
                Check History
              </h2>
              {historyProducts.length > 0 && (
                <GlassButton type="button" size="sm" onClick={onClearHistory}>
                  Clear history
                </GlassButton>
              )}
            </div>

            {historyProducts.length === 0 ? (
              <GlassCard className="p-6 space-y-3">
                <p className="text-sm text-white">No recent checks</p>
                <p className="text-sm text-gray-300">
                  Products you check or scan appear here for one-click access.
                </p>
              </GlassCard>
            ) : (
              <div className="space-y-3">
                {historyProducts.map((item) => (
                  <GlassCard
                    key={item.id}
                    onClick={() => onSelectProduct(item)}
                    className="p-5 flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0 space-y-1">
                      <p className="text-base text-white truncate">{item.name}</p>
                      <p className="text-xs text-gray-300 tabular-nums">
                        {item.category} · {item.decompositionTime}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <VerdictBadge biodegradable={item.biodegradable} compact />
                      <ArrowRight className="w-4 h-4 text-gray-300" aria-hidden="true" />
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
