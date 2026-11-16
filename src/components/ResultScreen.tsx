import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Check,
  ExternalLink,
  Flag,
  Share2,
} from 'lucide-react';
import { ProductItem } from '../types/disposal';
import { getAlternativeImageUrl } from '../data/products';
import {
  GlassButton,
  GlassCard,
  Modal,
  PrimaryButton,
  TimelineBar,
  VerdictBadge,
} from './GlassUI';
import { CurvedCarousel, CurvedCarouselItem } from './CurvedCarousel';

interface ResultScreenProps {
  product: ProductItem;
  allProducts: ProductItem[];
  isSaved: boolean;
  isSwitched: boolean;
  onToggleSave: (product: ProductItem) => void;
  onSwitchAlternative: (product: ProductItem) => void;
  onSelectProduct: (product: ProductItem) => void;
  onShare: (product: ProductItem) => void;
  onReportData: (product: ProductItem, notes: string) => void;
  onCheckAnother: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  product,
  allProducts,
  isSaved,
  isSwitched,
  onToggleSave,
  onSwitchAlternative,
  onSelectProduct,
  onShare,
  onReportData,
  onCheckAnother,
}) => {
  const [reportOpen, setReportOpen] = useState(false);
  const [reportNotes, setReportNotes] = useState('');

  // Placement 3: Greener Alternatives carousel under the main result card
  const alternativeCarouselItems: CurvedCarouselItem[] = useMemo(() => {
    const others = allProducts.filter((p) => p.id !== product.id);
    const ordered = [product, ...others].slice(0, 8);
    return ordered.map((p) => ({
      id: p.id,
      title: p.alternative.name,
      meta: p.alternative.decompositionTime,
      secondaryMeta: `Replaces ${p.name}`,
      imageUrl: getAlternativeImageUrl(p),
      iconType: 'sprout',
    }));
  }, [allProducts, product]);

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportNotes.trim()) return;
    onReportData(product, reportNotes.trim());
    setReportNotes('');
    setReportOpen(false);
  };

  return (
    <section className="w-full py-12 lg:py-16 space-y-14 overflow-hidden">
      <div className="px-6 md:px-12 lg:px-16 max-w-6xl mx-auto space-y-8">
        {/* Top back action */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <GlassButton type="button" size="sm" onClick={onCheckAnother}>
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Check another product</span>
          </GlassButton>

          <div className="flex flex-wrap items-center gap-3">
            <GlassButton
              type="button"
              size="sm"
              active={isSaved}
              onClick={() => onToggleSave(product)}
            >
              <Bookmark className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{isSaved ? 'Saved' : 'Save'}</span>
            </GlassButton>

            <GlassButton type="button" size="sm" onClick={() => onShare(product)}>
              <Share2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Share</span>
            </GlassButton>

            <PrimaryButton type="button" size="sm" onClick={onCheckAnother}>
              Check another
            </PrimaryButton>
          </div>
        </div>

        {/* Main 2-column result grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* Large Glass Result Card */}
          <GlassCard className="lg:col-span-2 p-6 sm:p-8 flex flex-col justify-between space-y-8">
            <div className="space-y-6">
              {/* Product name & verdict */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-white/20">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-gray-300">
                    <span>{product.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{product.subTopic}</span>
                    <span aria-hidden="true">·</span>
                    <span>{product.verificationStatus}</span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-normal tracking-[-0.04em] text-white">
                    {product.name}
                  </h1>
                </div>
                <VerdictBadge biodegradable={product.biodegradable} />
              </div>

              {/* Decomposition duration & byproducts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <p className="text-xs text-gray-300">Decomposition time</p>
                  <p className="text-2xl sm:text-3xl font-normal text-white tabular-nums tracking-[-0.03em]">
                    {product.decompositionTime}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-gray-300">Breaks down into</p>
                  <ul className="space-y-1.5 text-sm text-white">
                    {product.breaksDownInto.map((part) => (
                      <li key={part} className="flex items-start gap-2">
                        <span className="text-gray-300" aria-hidden="true">
                          —
                        </span>
                        <span>{part}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Horizontal Timeline Bar */}
              <div className="pt-2">
                <TimelineBar
                  percent={product.timelinePercent}
                  label={product.decompositionTime}
                  biodegradable={product.biodegradable}
                />
              </div>

              {/* Plain-language Why explanation */}
              <div className="pt-4 border-t border-white/20 space-y-2">
                <h2 className="text-base font-medium text-white">Why this happens</h2>
                <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                  {product.whyExplanation}
                </p>
              </div>
            </div>

            {/* Source Citation Footer */}
            <div className="pt-4 border-t border-white/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-300">
              <div className="flex items-center gap-2 flex-wrap">
                <span>Source:</span>
                <a
                  href={product.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-white hover:text-gray-300 underline underline-offset-4"
                >
                  <span>{product.sourceLabel}</span>
                  <ExternalLink className="w-3 h-3" aria-hidden="true" />
                </a>
              </div>

              <button
                type="button"
                onClick={() => setReportOpen(true)}
                className="inline-flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors cursor-pointer self-start sm:self-auto"
              >
                <Flag className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Report incorrect data</span>
              </button>
            </div>
          </GlassCard>

          {/* Greener Alternative Card */}
          <GlassCard className="p-6 sm:p-8 flex flex-col justify-between space-y-8">
            <div className="space-y-5">
              <div className="space-y-1.5">
                <p className="text-xs text-gray-300">Greener alternative</p>
                <h2 className="text-2xl sm:text-3xl font-normal tracking-[-0.04em] text-white">
                  {product.alternative.name}
                </h2>
              </div>

              <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                {product.alternative.reason}
              </p>

              <div className="pt-4 border-t border-white/20 space-y-1">
                <p className="text-xs text-gray-300">Alternative breakdown</p>
                <p className="text-base font-medium text-white tabular-nums">
                  {product.alternative.decompositionTime}
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              {isSwitched ? (
                <GlassButton
                  type="button"
                  active
                  className="w-full py-3"
                  onClick={() => onSwitchAlternative(product)}
                >
                  <Check className="w-4 h-4" aria-hidden="true" />
                  <span>Switched to this</span>
                </GlassButton>
              ) : (
                <PrimaryButton
                  type="button"
                  className="w-full py-3"
                  onClick={() => onSwitchAlternative(product)}
                >
                  <span>Switch to this</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </PrimaryButton>
              )}
              <p className="text-xs text-gray-300 text-center">
                Logs this eco-switch in your personal dashboard.
              </p>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Placement 3: Greener Alternatives Curved Carousel under the main result card */}
      <div className="space-y-6">
        <div className="px-6 md:px-12 lg:px-16 max-w-6xl mx-auto space-y-1">
          <h2 className="text-2xl sm:text-3xl font-normal tracking-[-0.04em] text-white [text-shadow:0_2px_14px_rgba(0,0,0,0.9)]">
            Greener Alternatives
          </h2>
          <p className="text-sm text-gray-100 [text-shadow:0_1px_10px_rgba(0,0,0,0.9)]">
            Explore sustainable swaps across everyday items—select any card to inspect its breakdown.
          </p>
        </div>

        <CurvedCarousel
          items={alternativeCarouselItems}
          selectedId={product.id}
          sharedImageUrl="/assets/aistudio/image_2_338a9168.png"
          ariaLabel="Greener alternatives carousel"
          onSelect={(item) => {
            const found = allProducts.find((p) => p.id === item.id);
            if (found) onSelectProduct(found);
          }}
        />
      </div>

      {/* Report Incorrect Data Modal */}
      <Modal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        title={`Report issue: ${product.name}`}
      >
        <form onSubmit={handleReportSubmit} className="space-y-4">
          <p className="text-sm text-gray-300">
            Let us know what decomposition timeframe, material detail, or citation needs correction.
          </p>
          <textarea
            rows={4}
            required
            value={reportNotes}
            onChange={(e) => setReportNotes(e.target.value)}
            placeholder="Describe the correction and include a scientific or municipal source if available..."
            className="w-full liquid-glass border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-300 focus:outline-none focus:border-white"
          />
          <div className="flex justify-end gap-3">
            <GlassButton type="button" onClick={() => setReportOpen(false)}>
              Cancel
            </GlassButton>
            <PrimaryButton type="submit">Send report</PrimaryButton>
          </div>
        </form>
      </Modal>
    </section>
  );
};
